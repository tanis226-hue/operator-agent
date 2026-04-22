import { loadDataset, loadProcessNote } from "@/lib/loadDataset";
import { analyzePipeline } from "@/lib/analyzePipeline";
import { DEMO_INTAKE_BRIEF } from "@/lib/intakeBrief";
import { runPipeline } from "@/lib/pipelinePhases";
import type { PipelineEvent } from "@/lib/pipelinePhases";

export const maxDuration = 120;

function hasApiKey(): boolean {
  const k = process.env.ANTHROPIC_API_KEY ?? "";
  return k.trim().length > 0 && k !== "your_key_here";
}

export async function POST(): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function emit(event: PipelineEvent): void {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      }

      try {
        if (!hasApiKey()) {
          emit({
            event: "error",
            message:
              "ANTHROPIC_API_KEY is not set. Add your key to .env.local to run live analysis.",
          });
          controller.close();
          return;
        }

        const { records } = loadDataset();
        const analysis = analyzePipeline(records);
        const processNote = loadProcessNote();

        await runPipeline(
          DEMO_INTAKE_BRIEF,
          analysis,
          processNote,
          emit
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        emit({ event: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
