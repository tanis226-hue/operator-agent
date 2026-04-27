// Netlify Background Function — runs the full DMAIC pipeline asynchronously.
// 15-minute execution budget. Triggered by /api/run-analysis with a jobId.
// Reads job inputs from Netlify Blobs, writes events + result back to Blobs.

import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { runPipeline } from "../../lib/pipelinePhases.js";
import { runGeneralPipeline } from "../../lib/generalPipeline.js";
import type { PipelineEvent } from "../../lib/pipelinePhases.js";
import type { JobInput, JobState } from "../../lib/jobStore.js";

const INPUT_STORE = "opsadvisor-job-inputs";
const STATE_STORE = "opsadvisor-job-states";

function stateStore() {
  return getStore({ name: STATE_STORE, consistency: "strong" });
}
function inputStore() {
  return getStore({ name: INPUT_STORE, consistency: "strong" });
}

async function writeState(jobId: string, state: JobState): Promise<void> {
  await stateStore().setJSON(jobId, state);
}

async function writeError(jobId: string, message: string): Promise<void> {
  try {
    const existing = await stateStore().get(jobId, { type: "json" }) as JobState | null;
    const now = Date.now();
    await stateStore().setJSON(jobId, {
      ...(existing ?? { events: [], createdAt: now }),
      status: "error",
      errorMessage: message,
      updatedAt: now,
    });
  } catch (e) {
    // Best-effort — if Blobs is broken, at least log it
    console.error("[run-analysis-background] writeError failed:", e);
  }
}

export default async (req: Request, _context: Context) => {
  let jobId = "";
  try {
    const body = (await req.json()) as { jobId?: string };
    jobId = (body.jobId ?? "").trim();
  } catch (e) {
    console.error("[run-analysis-background] bad body:", e);
    return new Response("bad body", { status: 400 });
  }

  if (!jobId) {
    console.error("[run-analysis-background] missing jobId");
    return new Response("missing jobId", { status: 400 });
  }

  console.log(`[run-analysis-background] start jobId=${jobId}`);

  // Mark running immediately.
  try {
    const now = Date.now();
    await writeState(jobId, { status: "running", events: [], createdAt: now, updatedAt: now });
  } catch (e) {
    console.error(`[run-analysis-background] failed to write initial state:`, e);
    // Continue anyway — the pipeline may still produce results
  }

  // Load inputs.
  let input: JobInput | null = null;
  try {
    input = (await inputStore().get(jobId, { type: "json" })) as JobInput | null;
  } catch (e) {
    console.error(`[run-analysis-background] failed to load input:`, e);
    await writeError(jobId, "Could not load job inputs from store. Please retry.");
    return new Response("no input", { status: 404 });
  }

  if (!input) {
    console.error(`[run-analysis-background] no input for jobId=${jobId}`);
    await writeError(jobId, "Job inputs not found. Please retry.");
    return new Response("no input", { status: 404 });
  }

  // Collect events; flush to Blobs on each phase boundary so the poller sees
  // progress without a Blobs round-trip per individual event.
  const allEvents: PipelineEvent[] = [];

  const flush = async (currentState?: { createdAt: number }) => {
    const now = Date.now();
    const snapshot: JobState = {
      status: "running",
      events: [...allEvents],
      createdAt: currentState?.createdAt ?? now,
      updatedAt: now,
    };
    // Promote terminal markers.
    for (const ev of allEvents) {
      if (ev.event === "complete") {
        snapshot.status = "done";
        snapshot.generated = ev.generated;
        snapshot.pipelineLog = ev.pipelineLog;
        snapshot.usedFallback = ev.usedFallback;
      } else if (ev.event === "error") {
        snapshot.status = "error";
        snapshot.errorMessage = ev.message;
      }
    }
    try {
      await writeState(jobId, snapshot);
    } catch (e) {
      console.error(`[run-analysis-background] flush failed:`, e);
    }
  };

  const startTime = Date.now();
  const onEvent = (event: PipelineEvent): void => {
    allEvents.push(event);
    // Flush on every phase-done and on terminal events.
    if (
      (event.event === "phase" && event.status === "done") ||
      event.event === "complete" ||
      event.event === "error"
    ) {
      void flush({ createdAt: startTime });
    }
  };

  try {
    if (input.isDemo && input.analysis) {
      await runPipeline(input.brief, input.analysis, input.processNote, onEvent);
    } else {
      await runGeneralPipeline(input.brief, input.processNote, "", onEvent);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[run-analysis-background] pipeline error jobId=${jobId}:`, message);
    onEvent({ event: "error", message });
  }

  // Final flush to ensure everything is persisted.
  await flush({ createdAt: startTime });
  console.log(`[run-analysis-background] done jobId=${jobId} events=${allEvents.length}`);
  return new Response("ok");
};
