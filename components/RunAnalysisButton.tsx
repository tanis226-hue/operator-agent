"use client";

import { useState } from "react";

type RunState = "idle" | "running" | "complete";

const PHASE_STEPS = [
  "Reviewing workflow context",
  "Measuring baseline",
  "Identifying leakage points",
  "Generating improvement plan",
  "Building control package",
] as const;

export function RunAnalysisButton() {
  const [state, setState] = useState<RunState>("idle");
  const [stepIndex, setStepIndex] = useState(0);

  function handleClick() {
    if (state === "running") return;
    setState("running");
    setStepIndex(0);

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      if (i >= PHASE_STEPS.length) {
        clearInterval(interval);
        setState("complete");
        return;
      }
      setStepIndex(i);
    }, 650);
  }

  const isRunning = state === "running";

  return (
    <section
      aria-labelledby="run-analysis-heading"
      className="rounded-card border border-line bg-surface shadow-card"
    >
      <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2
            id="run-analysis-heading"
            className="text-base font-semibold text-ink"
          >
            Run analysis
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Uses the intake brief, local pipeline data, and process note.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isRunning && (
            <span
              aria-live="polite"
              className="text-xs font-medium text-ink-muted"
            >
              {PHASE_STEPS[stepIndex]}
              <span aria-hidden className="ml-1 inline-flex gap-0.5">
                <Dot />
                <Dot delay="150ms" />
                <Dot delay="300ms" />
              </span>
            </span>
          )}
          {state === "complete" && (
            <span className="text-xs font-medium text-ink-muted">
              Analysis complete — results below
            </span>
          )}
          <button
            type="button"
            onClick={handleClick}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e40af] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning ? "Running..." : state === "complete" ? "Re-run Analysis" : "Run Analysis"}
          </button>
        </div>
      </div>
    </section>
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
