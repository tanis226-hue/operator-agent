import fs from "fs";
import path from "path";
import { loadDataset, loadProcessNote } from "@/lib/loadDataset";
import { analyzePipeline } from "@/lib/analyzePipeline";
import { DEMO_INTAKE_BRIEF } from "@/lib/intakeBrief";
import type { IntakeBrief } from "@/lib/intakeBrief";
import { runPipeline } from "@/lib/pipelinePhases";
import type { PipelineEvent } from "@/lib/pipelinePhases";
import { runGeneralPipeline } from "@/lib/generalPipeline";

export const maxDuration = 120;

// Next.js gives shell env vars higher priority than .env.local, so if a
// parent process injects an empty ANTHROPIC_API_KEY the file value is lost.
// Read .env.local directly as a fallback so the server always finds the key.
function ensureApiKey(): void {
  if ((process.env.ANTHROPIC_API_KEY ?? "").trim()) return;
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^ANTHROPIC_API_KEY=(.+)$/);
      if (match) {
        process.env.ANTHROPIC_API_KEY = match[1].trim();
        break;
      }
    }
  } catch {
    // .env.local absent or unreadable — key stays empty
  }
}

function hasApiKey(): boolean {
  ensureApiKey();
  const k = (process.env.ANTHROPIC_API_KEY ?? "").trim();
  console.log("[run-analysis] KEY length:", k.length, "| starts:", k.slice(0, 15));
  return k.length > 0 && k !== "your_key_here";
}

function sanitizeBrief(input: unknown): IntakeBrief | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;

  const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
  const arr = (v: unknown): string[] =>
    Array.isArray(v)
      ? v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)
      : [];

  const brief: IntakeBrief = {
    businessName: str(o.businessName),
    workflowName: str(o.workflowName) || DEMO_INTAKE_BRIEF.workflowName,
    painPoint: str(o.painPoint),
    successMetric: str(o.successMetric),
    slaConstraint: str(o.slaConstraint),
    currentStages: arr(o.currentStages),
    availableEvidence: arr(o.availableEvidence),
    qualifiedLeadDefinition: str(o.qualifiedLeadDefinition),
    suspectedStage: str(o.suspectedStage),
    biggestFrustration: str(o.biggestFrustration),
  };

  if (!brief.businessName || !brief.painPoint || !brief.successMetric) {
    return null;
  }

  // Sensible fallbacks for optional fields the prompt still references.
  if (brief.currentStages.length === 0) {
    brief.currentStages = DEMO_INTAKE_BRIEF.currentStages;
  }
  if (brief.availableEvidence.length === 0) {
    brief.availableEvidence = DEMO_INTAKE_BRIEF.availableEvidence;
  }
  if (!brief.slaConstraint) brief.slaConstraint = DEMO_INTAKE_BRIEF.slaConstraint;
  if (!brief.qualifiedLeadDefinition) {
    brief.qualifiedLeadDefinition = DEMO_INTAKE_BRIEF.qualifiedLeadDefinition;
  }
  if (!brief.suspectedStage) brief.suspectedStage = DEMO_INTAKE_BRIEF.suspectedStage;
  if (!brief.biggestFrustration) {
    brief.biggestFrustration = DEMO_INTAKE_BRIEF.biggestFrustration;
  }

  return brief;
}

export async function POST(request: Request): Promise<Response> {
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  let closed = false;

  function emit(event: PipelineEvent): void {
    if (closed) return;
    void writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
  }

  async function safeClose(): Promise<void> {
    if (closed) return;
    closed = true;
    try {
      await writer.close();
    } catch {
      // Writer may already be closed if the client disconnected.
    }
  }

  // Parse optional custom-case body BEFORE entering the stream, so a parse
  // error surfaces as a normal error event rather than a hang.
  let briefOverride: IntakeBrief | null = null;
  let processNoteOverride: string | null = null;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as {
        brief?: unknown;
        processNote?: unknown;
      };
      if (body.brief !== undefined) {
        briefOverride = sanitizeBrief(body.brief);
        if (!briefOverride) {
          // Start the stream just to emit the error back.
          void (async () => {
            emit({
              event: "error",
              message:
                "Custom case is missing required fields (business name, pain point, success metric).",
            });
            await safeClose();
          })();
          return new Response(readable, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          });
        }
      }
      if (typeof body.processNote === "string" && body.processNote.trim()) {
        processNoteOverride = body.processNote;
      }
    } catch {
      void (async () => {
        emit({
          event: "error",
          message: "Could not parse custom case payload as JSON.",
        });
        await safeClose();
      })();
      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }
  }

  void (async () => {
    try {
      if (!hasApiKey()) {
        emit({
          event: "error",
          message:
            "ANTHROPIC_API_KEY is not set. Add your key to .env.local to run live analysis.",
        });
        return;
      }

      const processNote = processNoteOverride ?? loadProcessNote();

      if (briefOverride) {
        // Custom case: general-purpose pipeline — no dataset dependency
        await runGeneralPipeline(briefOverride, processNote, "", emit);
      } else {
        // Demo case: data-driven pipeline with pre-computed CRM metrics
        const { records } = loadDataset();
        const analysis = analyzePipeline(records);
        await runPipeline(DEMO_INTAKE_BRIEF, analysis, processNote, emit);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      emit({ event: "error", message });
    } finally {
      await safeClose();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
