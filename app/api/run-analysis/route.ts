import fs from "fs";
import path from "path";
import { loadDataset, loadProcessNote } from "@/lib/loadDataset";
import { analyzePipeline } from "@/lib/analyzePipeline";
import { DEMO_INTAKE_BRIEF } from "@/lib/intakeBrief";
import type { IntakeBrief } from "@/lib/intakeBrief";
import { runPipeline } from "@/lib/pipelinePhases";
import type { PipelineEvent } from "@/lib/pipelinePhases";
import { runGeneralPipeline } from "@/lib/generalPipeline";
import { runFastPipeline } from "@/lib/fastPipeline";

export const maxDuration = 120;

// On platforms with short function timeouts (Netlify Functions ≈ 26s), the
// 4-call Opus pipeline can't finish before the connection is killed, which
// surfaces as ERR_HTTP2_PROTOCOL_ERROR mid-stream. Set OPSADVISOR_FAST_MODE=1
// to fall back to a single Sonnet 4.5 call that fits inside that budget.
function isFastMode(): boolean {
  const v = (process.env.OPSADVISOR_FAST_MODE ?? "").trim().toLowerCase();
  if (v === "1" || v === "true" || v === "yes") return true;
  if (v === "0" || v === "false" || v === "no") return false;
  // Auto-enable on Netlify (NETLIFY=true is set in their build/runtime env).
  return (process.env.NETLIFY ?? "").toLowerCase() === "true";
}

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
  const num = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;

  // Allow legacy clients that still send `slaConstraint`.
  const slaTextRaw = str(o.slaText) || str(o.slaConstraint);

  const VALID_INDUSTRIES = new Set([
    "government",
    "business",
    "education",
    "healthcare",
    "other",
  ]);
  const VALID_SIZES = new Set(["solo", "small", "midsize", "large"]);

  const industry =
    typeof o.industry === "string" && VALID_INDUSTRIES.has(o.industry)
      ? (o.industry as IntakeBrief["industry"])
      : null;
  const teamSize =
    typeof o.teamSize === "string" && VALID_SIZES.has(o.teamSize)
      ? (o.teamSize as IntakeBrief["teamSize"])
      : null;

  const brief: IntakeBrief = {
    businessName: str(o.businessName),
    workflowName: str(o.workflowName) || DEMO_INTAKE_BRIEF.workflowName,
    industry,
    subIndustry: str(o.subIndustry) || null,
    teamSize,
    painPoint: str(o.painPoint),
    biggestFrustration: str(o.biggestFrustration),
    successMetric: str(o.successMetric),
    slaText: slaTextRaw,
    slaThresholdHours: num(o.slaThresholdHours),
    currentStages: arr(o.currentStages),
    qualifiedLeadDefinition: str(o.qualifiedLeadDefinition),
    suspectedStage: str(o.suspectedStage),
    volumePerMonth: str(o.volumePerMonth),
    valuePerItem: str(o.valuePerItem),
    currentTooling: str(o.currentTooling),
    priorAttempts: str(o.priorAttempts),
    benchmarkCategoryId: str(o.benchmarkCategoryId) || null,
  };

  if (!brief.businessName || !brief.painPoint || !brief.successMetric) {
    return null;
  }

  // Sensible fallbacks for optional fields the prompt still references.
  if (brief.currentStages.length === 0) {
    brief.currentStages = DEMO_INTAKE_BRIEF.currentStages;
  }
  if (!brief.slaText) brief.slaText = DEMO_INTAKE_BRIEF.slaText;
  if (!brief.qualifiedLeadDefinition) {
    brief.qualifiedLeadDefinition = DEMO_INTAKE_BRIEF.qualifiedLeadDefinition;
  }
  if (!brief.suspectedStage) brief.suspectedStage = DEMO_INTAKE_BRIEF.suspectedStage;
  if (!brief.biggestFrustration) {
    brief.biggestFrustration = DEMO_INTAKE_BRIEF.biggestFrustration;
  }

  return brief;
}

function serializeEvent(event: PipelineEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
} as const;

export async function POST(request: Request): Promise<Response> {
  // Parse optional custom-case body up front so JSON errors surface cleanly.
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
          return new Response(
            serializeEvent({
              event: "error",
              message:
                "Custom case is missing required fields (business name, pain point, success metric).",
            }),
            { headers: SSE_HEADERS }
          );
        }
      }
      if (typeof body.processNote === "string" && body.processNote.trim()) {
        processNoteOverride = body.processNote;
      }
    } catch {
      return new Response(
        serializeEvent({
          event: "error",
          message: "Could not parse custom case payload as JSON.",
        }),
        { headers: SSE_HEADERS }
      );
    }
  }

  if (!hasApiKey()) {
    return new Response(
      serializeEvent({
        event: "error",
        message:
          "ANTHROPIC_API_KEY is not set. Add your key to .env.local to run live analysis.",
      }),
      { headers: SSE_HEADERS }
    );
  }

  const processNote = processNoteOverride ?? loadProcessNote();
  const fast = isFastMode();

  // Fast (non-streaming) path: collect all events, return as one buffered
  // SSE-formatted response. Required on platforms whose streaming responses
  // hard-cap at 10s (e.g. Netlify Functions). Sync functions get the full
  // function timeout instead.
  if (fast) {
    const buffered: PipelineEvent[] = [];
    const collect = (event: PipelineEvent): void => {
      buffered.push(event);
    };

    try {
      if (briefOverride) {
        await runFastPipeline(briefOverride, processNote, null, collect);
      } else {
        const { records } = loadDataset();
        const analysis = analyzePipeline(records);
        await runFastPipeline(DEMO_INTAKE_BRIEF, processNote, analysis, collect);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      buffered.push({ event: "error", message });
    }

    const body = buffered.map(serializeEvent).join("");
    return new Response(body, { headers: SSE_HEADERS });
  }

  // Streaming path (Vercel / local dev): emit events incrementally.
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  let closed = false;

  function emit(event: PipelineEvent): void {
    if (closed) return;
    void writer.write(encoder.encode(serializeEvent(event)));
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

  void (async () => {
    try {
      if (briefOverride) {
        await runGeneralPipeline(briefOverride, processNote, "", emit);
      } else {
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

  return new Response(readable, { headers: SSE_HEADERS });
}
