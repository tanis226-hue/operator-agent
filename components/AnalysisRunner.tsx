"use client";

import { useState } from "react";
import { IntakeBriefCard } from "./IntakeBriefCard";
import { AnalysisResults } from "./AnalysisResults";
import { PlaceholderResults } from "./PlaceholderResults";
import type { PipelineAnalysis } from "@/lib/analyzePipeline";
import type { GeneratedOutputPayload } from "@/lib/outputTypes";
import type { IntakeBrief } from "@/lib/intakeBrief";

type RunState = "idle" | "running" | "done" | "error";

type AnalysisResponse = {
  ok: boolean;
  analysis: PipelineAnalysis;
  generated: GeneratedOutputPayload;
  usedFallback?: boolean;
  error?: string;
};

const PHASE_STEPS: string[] = [
  "Reviewing workflow context",
  "Measuring baseline",
  "Identifying leakage points",
  "Generating improvement plan",
  "Building control package",
];

type Props = { brief: IntakeBrief };

export function AnalysisRunner({ brief }: Props) {
  const [state, setState] = useState<RunState>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [briefOpen, setBriefOpen] = useState(true);

  async function handleRunAnalysis() {
    if (state === "running") return;
    setState("running");
    setStepIndex(0);
    setResult(null);
    setErrorMsg("");
    setBriefOpen(false);

    // Cycle through steps until the API responds
    let i = 0;
    const stepInterval = setInterval(() => {
      i = (i + 1) % PHASE_STEPS.length;
      setStepIndex(i);
    }, 1600);

    try {
      const res = await fetch("/api/run-analysis", { method: "POST" });
      const data: AnalysisResponse = await res.json();
      clearInterval(stepInterval);

      if (!data.ok) {
        setErrorMsg(data.error ?? "Unknown error");
        setState("error");
        setBriefOpen(true);
        return;
      }

      setCompletedAt(new Date().toLocaleTimeString());
      setResult(data);
      setState("done");
    } catch (err) {
      clearInterval(stepInterval);
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setState("error");
      setBriefOpen(true);
    }
  }

  const isRunning = state === "running";
  const isDone = state === "done";

  return (
    <>
      {/* Intake brief — collapses to a compact banner after analysis runs */}
      {briefOpen ? (
        <IntakeBriefCard brief={brief} />
      ) : (
        <button
          type="button"
          onClick={() => setBriefOpen(true)}
          className="flex w-full items-center justify-between rounded-card border border-line bg-surface px-6 py-3 text-sm shadow-card transition hover:bg-canvas"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink">{brief.businessName}</span>
            <span className="text-ink-muted">·</span>
            <span className="text-ink-soft">{brief.workflowName}</span>
          </div>
          <span className="text-xs text-ink-muted">Show intake brief ↓</span>
        </button>
      )}

      {/* Run Analysis action area */}
      <section
        aria-labelledby="run-heading"
        className="rounded-card border border-line bg-surface shadow-card"
      >
        <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h2
              id="run-heading"
              className="text-base font-semibold text-ink"
            >
              Run analysis
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Uses the intake brief, local pipeline data, and process note.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isRunning && (
              <span
                aria-live="polite"
                className="flex items-center gap-1.5 text-xs font-medium text-ink-muted"
              >
                <span className="inline-flex gap-0.5" aria-hidden>
                  <Dot /><Dot delay="200ms" /><Dot delay="400ms" />
                </span>
                {PHASE_STEPS[stepIndex]}
              </span>
            )}
            {isDone && (
              <span className="text-xs text-ink-muted">
                Complete · {completedAt}
              </span>
            )}
            {state === "error" && (
              <span className="text-xs font-medium text-red-500">
                Failed — check ANTHROPIC_API_KEY in .env.local
              </span>
            )}
            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e40af] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRunning
                ? "Running…"
                : isDone
                ? "Re-run"
                : "Run Analysis"}
            </button>
          </div>
        </div>

        {/* Loading step track */}
        {isRunning && (
          <div className="border-t border-line px-6 py-3">
            <ol className="flex flex-wrap gap-x-6 gap-y-1.5">
              {PHASE_STEPS.map((step, i) => {
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <li
                    key={step}
                    className={[
                      "flex items-center gap-1.5 text-[11px] font-medium",
                      done
                        ? "text-accent"
                        : active
                        ? "text-ink"
                        : "text-ink-muted/50",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden
                      className={[
                        "inline-block h-1.5 w-1.5 rounded-full",
                        done
                          ? "bg-accent"
                          : active
                          ? "bg-ink animate-pulse"
                          : "bg-ink-muted/30",
                      ].join(" ")}
                    />
                    {step}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {state === "error" && errorMsg && (
          <div className="border-t border-red-100 bg-red-50 px-6 py-3 text-xs leading-relaxed text-red-600">
            {errorMsg}
          </div>
        )}
      </section>

      {/* Results label */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Results
        </span>
        <div className="h-px flex-1 bg-line" />
        {isDone && completedAt && (
          <span className="text-[11px] text-ink-muted">
            Generated {completedAt}
            {result?.usedFallback && (
              <span className="ml-1.5 rounded border border-line px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">
                pre-generated
              </span>
            )}
          </span>
        )}
      </div>

      {isDone && result ? (
        <AnalysisResults
          analysis={result.analysis}
          generated={result.generated}
        />
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
