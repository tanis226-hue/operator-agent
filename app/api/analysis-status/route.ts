// Polling endpoint for /api/run-analysis jobs. Returns accumulated phase
// events plus the final payload once the background function (or in-process
// fallback) finishes.

import { loadJobState } from "@/lib/jobStore";

export const maxDuration = 10;

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const jobId = (url.searchParams.get("jobId") ?? "").trim();

  if (!jobId) {
    return Response.json({ error: "Missing jobId" }, { status: 400 });
  }

  const state = await loadJobState(jobId);
  if (!state) {
    return Response.json(
      { status: "pending", events: [] },
      { status: 200 }
    );
  }

  return Response.json(
    {
      status: state.status,
      events: state.events,
      generated: state.generated,
      pipelineLog: state.pipelineLog,
      usedFallback: state.usedFallback,
      errorMessage: state.errorMessage,
      updatedAt: state.updatedAt,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
