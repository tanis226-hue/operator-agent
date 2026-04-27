// Job-creation endpoint. Creates a new analysis job, persists its inputs to
// the job store, and dispatches the actual pipeline run.
//
//   - On Netlify: triggers /.netlify/functions/run-analysis-background which
//     has a 15-minute execution budget. The background function does the
//     work asynchronously while the client polls /api/analysis-status.
//   - Elsewhere (local dev / Vercel): runs the pipeline in-process using
//     a fire-and-forget Promise. Same poll contract from the client's POV.

import fs from "fs";
import path from "path";
import { loadDataset, loadProcessNote } from "@/lib/loadDataset";
import { analyzePipeline } from "@/lib/analyzePipeline";
import { DEMO_INTAKE_BRIEF } from "@/lib/intakeBrief";
import type { IntakeBrief } from "@/lib/intakeBrief";
import { runPipeline } from "@/lib/pipelinePhases";
import type { PipelineEvent } from "@/lib/pipelinePhases";
import { runGeneralPipeline } from "@/lib/generalPipeline";
import {
  saveJobInput,
  saveJobState,
  appendJobEvent,
  newJobState,
  hasNetlifyBackend,
} from "@/lib/jobStore";

export const maxDuration = 30;

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
    // .env.local absent or unreadable
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

function makeJobId(): string {
  // Short random id - 16 hex chars. crypto.randomUUID would also work.
  const buf = new Uint8Array(8);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

function siteOrigin(req: Request): string {
  // Prefer the explicit env var (set in Netlify UI), fall back to the
  // forwarded host on the incoming request, finally to the URL Origin.
  const envUrl = (process.env.URL ?? process.env.DEPLOY_URL ?? "").trim();
  if (envUrl) return envUrl.replace(/\/$/, "");

  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;

  try {
    const u = new URL(req.url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

async function runInProcess(jobId: string): Promise<void> {
  // Fallback path used outside Netlify. Same shape as the background fn.
  const { loadJobInput } = await import("@/lib/jobStore");
  const input = await loadJobInput(jobId);
  if (!input) {
    await appendJobEvent(jobId, {
      event: "error",
      message: "Job inputs missing.",
    });
    return;
  }
  const onEvent = (event: PipelineEvent): void => {
    void appendJobEvent(jobId, event);
  };
  try {
    if (input.isDemo && input.analysis) {
      await runPipeline(input.brief, input.analysis, input.processNote, onEvent);
    } else {
      await runGeneralPipeline(input.brief, input.processNote, "", onEvent);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    onEvent({ event: "error", message });
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!hasApiKey()) {
    return Response.json(
      {
        error:
          "ANTHROPIC_API_KEY is not set. Add your key to .env.local to run live analysis.",
      },
      { status: 500 }
    );
  }

  // Parse optional custom-case body.
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
          return Response.json(
            {
              error:
                "Custom case is missing required fields (business name, pain point, success metric).",
            },
            { status: 400 }
          );
        }
      }
      if (typeof body.processNote === "string" && body.processNote.trim()) {
        processNoteOverride = body.processNote;
      }
    } catch {
      return Response.json(
        { error: "Could not parse custom case payload as JSON." },
        { status: 400 }
      );
    }
  }

  // Assemble inputs.
  const processNote = processNoteOverride ?? loadProcessNote();
  const isDemo = !briefOverride;
  const brief = briefOverride ?? DEMO_INTAKE_BRIEF;
  const analysis = isDemo ? analyzePipeline(loadDataset().records) : null;

  // Persist job inputs and seed an empty state.
  const jobId = makeJobId();
  await saveJobInput(jobId, { brief, processNote, analysis, isDemo });
  await saveJobState(jobId, newJobState());

  // Dispatch.
  if (hasNetlifyBackend()) {
    const origin = siteOrigin(request);
    const url = `${origin}/.netlify/functions/run-analysis-background`;
    try {
      // Fire-and-forget POST to the background function. We don't await its
      // body because it returns 202 immediately.
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok && res.status !== 202) {
        const txt = await res.text().catch(() => "");
        console.error(
          `[run-analysis] background dispatch failed status=${res.status} body=${txt}`
        );
        await appendJobEvent(jobId, {
          event: "error",
          message: `Background dispatch failed (status ${res.status}).`,
        });
        return Response.json({ error: "Background dispatch failed" }, { status: 502 });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[run-analysis] background dispatch error:`, msg);
      await appendJobEvent(jobId, {
        event: "error",
        message: `Background dispatch error: ${msg}`,
      });
      return Response.json({ error: "Background dispatch error" }, { status: 502 });
    }
  } else {
    // Non-Netlify: run in-process. Don't await - return jobId immediately.
    void runInProcess(jobId);
  }

  return Response.json({ jobId });
}
