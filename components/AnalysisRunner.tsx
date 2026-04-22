"use client";

import { useState } from "react";
import { AnalysisResults } from "./AnalysisResults";
import { PlaceholderResults } from "./PlaceholderResults";
import type { PipelineAnalysis } from "@/lib/analyzePipeline";
import type { GeneratedOutputPayload } from "@/lib/outputTypes";

type RunState = "idle" | "running" | "done" | "error";

type AnalysisResponse = {
  ok: boolean;
  analysis: PipelineAnalysis;
  generated: GeneratedOutputPayload;
  error?: string;
};

const PHASE_STEPS = [
  "Reviewing workflow context",
  "Measuring baseline",
  "Identifying leakage points",
  "Generating improvement plan",
  "Building control package",
] as const;

export function AnalysisRunner() {
  const [state, setState] = useState<RunState>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleRunAnalysis() {
    if (state === "running") return;
    setState("running");
    setStepIndex(0);
    setResult(null);
    setErrorMsg("");

    // Animate through phase steps while waiting for the API
    let i = 0;
    const stepInterval = setInterval(() => {
      i += 1;
      if (i < PHASE_STEPS.length) setStepIndex(i);
    }, 1800);

    try {
      const res = await fetch("/api/run-analysis", { method: "POST" });
      const data: AnalysisResponse = await res.json();
      clearInterval(stepInterval);

      if (!data.ok) {
        setErrorMsg(data.error ?? "Unknown error");
        setState("error");
        return;
      }

      setResult(data);
      setState("done");
    } catch (err) {
      clearInterval(stepInterval);
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  }

  const isRunning = state === "running";

  return (
    <>
      {/* Run Analysis action area */}
      <section
        aria-labelledby="run-heading"
        className="rounded-card border border-line bg-surface shadow-card"
      >
        <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h2 id="run-heading" className="text-base font-semibold text-ink">
              Run analysis
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Uses the intake brief, local pipeline data, and process note.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isRunning && (
              <span aria-live="polite" className="text-xs font-medium text-ink-muted">
                {PHASE_STEPS[stepIndex]}
                <span aria-hidden className="ml-1 inline-flex gap-0.5">
                  <Dot /><Dot delay="150ms" /><Dot delay="300ms" />
                </span>
              </span>
            )}
            {state === "done" && (
              <span className="text-xs font-medium text-ink-muted">
                Analysis complete — results below
              </span>
            )}
            {state === "error" && (
              <span className="text-xs font-medium text-red-500">
                Error — check API key in .env.local
              </span>
            )}
            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e40af] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRunning ? "Running..." : state === "done" ? "Re-run Analysis" : "Run Analysis"}
            </button>
          </div>
        </div>

        {state === "error" && errorMsg && (
          <div className="border-t border-red-100 bg-red-50 px-6 py-3 text-xs text-red-600">
            {errorMsg}
          </div>
        )}
      </section>

      {/* Results divider */}
      <div className="mt-2 flex items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Results
        </h2>
        <div className="h-px flex-1 bg-line" />
        {state === "done" && (
          <span className="text-[11px] font-medium text-ink-muted">
            {new Date().toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Results content */}
      {state === "done" && result ? (
        <AnalysisResults analysis={result.analysis} generated={result.generated} />
      ) : (
        <PlaceholderResults />
      )}
    </>
  );
}

function Dot({ delay }: { delay?: string }) {
  return (
    <span
      aria-hidden
      className="h-1 w-1 animate-pulse rounded-full bg-ink-muted"
      style={delay ? { animationDelay: delay } : undefined}
    />
  );
}
