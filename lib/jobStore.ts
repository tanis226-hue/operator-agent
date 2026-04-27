// Job state storage with two backends:
//  - Netlify Blobs (production on Netlify)
//  - In-memory Map (local dev, Vercel, anything non-Netlify)
//
// One job has two pieces of state:
//  - input: brief / processNote / analysis seeded by the client request
//  - state: live status, accumulated events, final payload
//
// Both are keyed by jobId so the background worker and the polling endpoint
// can read/write the same record.

import type {
  PipelineEvent,
  PipelineLog,
} from "./pipelinePhases";
import type { GeneratedOutputPayload } from "./outputTypes";
import type { IntakeBrief } from "./intakeBrief";
import type { PipelineAnalysis } from "./analyzePipeline";

export type JobStatus = "pending" | "running" | "done" | "error";

export type JobInput = {
  brief: IntakeBrief;
  processNote: string;
  analysis: PipelineAnalysis | null; // null for custom case
  isDemo: boolean;
};

export type JobState = {
  status: JobStatus;
  events: PipelineEvent[];
  // Captured from the final "complete" event so the poller can return them
  // without scanning events again.
  generated?: GeneratedOutputPayload;
  pipelineLog?: PipelineLog;
  usedFallback?: boolean;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
};

const INPUT_STORE = "opsadvisor-job-inputs";
const STATE_STORE = "opsadvisor-job-states";

// ─── In-memory fallback store (local dev / non-Netlify) ─────────────────────

const memInputs = new Map<string, JobInput>();
const memStates = new Map<string, JobState>();

// ─── Backend selector ──────────────────────────────────────────────────────

function isNetlifyRuntime(): boolean {
  // NETLIFY=true is set on Netlify build & runtime. We also check for a
  // non-empty deploy ID as belt-and-suspenders.
  if ((process.env.NETLIFY ?? "").toLowerCase() === "true") return true;
  if ((process.env.NETLIFY_DEPLOY_ID ?? "").length > 0) return true;
  if ((process.env.SITE_ID ?? "").length > 0 && (process.env.NETLIFY_BLOBS_CONTEXT ?? "").length > 0) {
    return true;
  }
  return false;
}

async function getNetlifyStore(name: string) {
  // Dynamic import so non-Netlify hosts don't choke on the package's
  // assumptions about the runtime.
  const mod = await import("@netlify/blobs");
  return mod.getStore({ name, consistency: "strong" });
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function saveJobInput(jobId: string, input: JobInput): Promise<void> {
  if (isNetlifyRuntime()) {
    const store = await getNetlifyStore(INPUT_STORE);
    await store.setJSON(jobId, input);
  } else {
    memInputs.set(jobId, input);
  }
}

export async function loadJobInput(jobId: string): Promise<JobInput | null> {
  if (isNetlifyRuntime()) {
    const store = await getNetlifyStore(INPUT_STORE);
    const data = await store.get(jobId, { type: "json" });
    return (data as JobInput | null) ?? null;
  }
  return memInputs.get(jobId) ?? null;
}

export async function saveJobState(jobId: string, state: JobState): Promise<void> {
  if (isNetlifyRuntime()) {
    const store = await getNetlifyStore(STATE_STORE);
    await store.setJSON(jobId, state);
  } else {
    memStates.set(jobId, state);
  }
}

export async function loadJobState(jobId: string): Promise<JobState | null> {
  if (isNetlifyRuntime()) {
    const store = await getNetlifyStore(STATE_STORE);
    const data = await store.get(jobId, { type: "json" });
    return (data as JobState | null) ?? null;
  }
  return memStates.get(jobId) ?? null;
}

export async function appendJobEvent(jobId: string, event: PipelineEvent): Promise<void> {
  const current = (await loadJobState(jobId)) ?? {
    status: "pending" as JobStatus,
    events: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const next: JobState = {
    ...current,
    events: [...current.events, event],
    updatedAt: Date.now(),
  };

  if (event.event === "phase" && current.status === "pending") {
    next.status = "running";
  }
  if (event.event === "complete") {
    next.status = "done";
    next.generated = event.generated;
    next.pipelineLog = event.pipelineLog;
    next.usedFallback = event.usedFallback;
  }
  if (event.event === "error") {
    next.status = "error";
    next.errorMessage = event.message;
  }

  await saveJobState(jobId, next);
}

export function newJobState(): JobState {
  const now = Date.now();
  return {
    status: "pending",
    events: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function hasNetlifyBackend(): boolean {
  return isNetlifyRuntime();
}
