// Netlify Background Function: runs the full DMAIC pipeline asynchronously.
// Up to 15 min execution budget. Triggered by /api/run-analysis with a jobId.
// Writes phase events + final result into Netlify Blobs via lib/jobStore.

import type { Context } from "@netlify/functions";
import { runPipeline } from "../../lib/pipelinePhases";
import { runGeneralPipeline } from "../../lib/generalPipeline";
import {
  loadJobInput,
  saveJobState,
  appendJobEvent,
  loadJobState,
  newJobState,
} from "../../lib/jobStore";
import type { PipelineEvent } from "../../lib/pipelinePhases";

export default async (req: Request, _context: Context) => {
  let jobId = "";
  try {
    const body = (await req.json()) as { jobId?: string };
    jobId = (body.jobId ?? "").trim();
  } catch {
    // ignore - we'll fail below
  }

  if (!jobId) {
    // Background functions can't return errors to clients, so just log.
    console.error("[run-analysis-background] missing jobId");
    return new Response("missing jobId", { status: 400 });
  }

  console.log(`[run-analysis-background] starting jobId=${jobId}`);

  // Initialize state immediately so the poller sees "running" instead of
  // "pending" indefinitely.
  const initialState = newJobState();
  initialState.status = "running";
  await saveJobState(jobId, initialState);

  // Load the inputs the API route stashed for us.
  const input = await loadJobInput(jobId);
  if (!input) {
    console.error(`[run-analysis-background] no input for jobId=${jobId}`);
    await appendJobEvent(jobId, {
      event: "error",
      message: "Job inputs missing. Please retry.",
    });
    return new Response("no input", { status: 404 });
  }

  // Buffer events in memory and flush after each phase completes, so the
  // poller doesn't pay for a Blob round-trip per event but still sees
  // progress between phases.
  const buffer: PipelineEvent[] = [];

  const flush = async () => {
    if (buffer.length === 0) return;
    const current = (await loadJobState(jobId)) ?? newJobState();
    const drained = buffer.splice(0, buffer.length);
    const merged = {
      ...current,
      events: [...current.events, ...drained],
      updatedAt: Date.now(),
    };
    // Promote terminal events into structured fields so the poller can read
    // them without re-scanning events.
    for (const ev of drained) {
      if (ev.event === "complete") {
        merged.status = "done";
        merged.generated = ev.generated;
        merged.pipelineLog = ev.pipelineLog;
        merged.usedFallback = ev.usedFallback;
      } else if (ev.event === "error") {
        merged.status = "error";
        merged.errorMessage = ev.message;
      } else if (ev.event === "phase" && current.status === "pending") {
        merged.status = "running";
      }
    }
    await saveJobState(jobId, merged);
  };

  const onEvent = (event: PipelineEvent): void => {
    buffer.push(event);
    // Flush at every phase transition (running and done), at error, and at
    // complete. Keeps the poller responsive without spamming Blobs.
    if (
      event.event === "phase" ||
      event.event === "complete" ||
      event.event === "error"
    ) {
      // fire-and-forget; ordering is preserved because flush() drains the
      // shared buffer atomically, and Netlify Functions run single-threaded.
      void flush();
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
    console.error(`[run-analysis-background] pipeline failed jobId=${jobId}:`, message);
    onEvent({ event: "error", message });
  } finally {
    await flush();
  }

  console.log(`[run-analysis-background] finished jobId=${jobId}`);
  return new Response("ok");
};
