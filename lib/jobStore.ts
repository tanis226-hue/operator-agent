// Job state storage.
// On Netlify: Netlify Blobs (shared between the Next.js function and the
//   background function). Static import so esbuild bundles it correctly.
// Elsewhere: In-memory Map (local dev, Vercel).

// Static import - required so esbuild (Netlify function bundler) includes
// the package in the bundle. A dynamic import() is treated as external by
// esbuild and will fail at runtime inside the background function.
import { getStore } from "@netlify/blobs";

import type { PipelineEvent, PipelineLog } from "./pipelinePhases";
import type { GeneratedOutputPayload } from "./outputTypes";
import type { IntakeBrief } from "./intakeBrief";
import type { PipelineAnalysis } from "./analyzePipeline";

export type JobStatus = "pending" | "running" | "done" | "error";

export type JobInput = {
  brief: IntakeBrief;
  processNote: string;
  analysis: PipelineAnalysis | null;
  isDemo: boolean;
};

export type JobState = {
  status: JobStatus;
  events: PipelineEvent[];
  generated?: GeneratedOutputPayload;
  pipelineLog?: PipelineLog;
  usedFallback?: boolean;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
};

const INPUT_STORE = "opsadvisor-job-inputs";
const STATE_STORE = "opsadvisor-job-states";

// ─── In-memory fallback (local dev / non-Netlify) ────────────────────────────

const memInputs = new Map<string, JobInput>();
const memStates = new Map<string, JobState>();

// ─── Backend detection ───────────────────────────────────────────────────────

export function hasNetlifyBackend(): boolean {
  // NETLIFY=true is injected into both build-time and runtime environments.
  return (process.env.NETLIFY ?? "").toLowerCase() === "true";
}

function netlifyStore(name: string) {
  return getStore({ name, consistency: "strong" });
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function saveJobInput(jobId: string, input: JobInput): Promise<void> {
  if (hasNetlifyBackend()) {
    await netlifyStore(INPUT_STORE).setJSON(jobId, input);
  } else {
    memInputs.set(jobId, input);
  }
}

export async function loadJobInput(jobId: string): Promise<JobInput | null> {
  if (hasNetlifyBackend()) {
    const data = await netlifyStore(INPUT_STORE).get(jobId, { type: "json" });
    return (data as JobInput | null) ?? null;
  }
  return memInputs.get(jobId) ?? null;
}

export async function saveJobState(jobId: string, state: JobState): Promise<void> {
  if (hasNetlifyBackend()) {
    await netlifyStore(STATE_STORE).setJSON(jobId, state);
  } else {
    memStates.set(jobId, state);
  }
}

export async function loadJobState(jobId: string): Promise<JobState | null> {
  if (hasNetlifyBackend()) {
    const data = await netlifyStore(STATE_STORE).get(jobId, { type: "json" });
    return (data as JobState | null) ?? null;
  }
  return memStates.get(jobId) ?? null;
}

export async function appendJobEvent(jobId: string, event: PipelineEvent): Promise<void> {
  const current = (await loadJobState(jobId)) ?? newJobState();
  const next: JobState = {
    ...current,
    events: [...current.events, event],
    updatedAt: Date.now(),
  };
  if (event.event === "phase" && current.status === "pending") next.status = "running";
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
  return { status: "pending", events: [], createdAt: now, updatedAt: now };
}
