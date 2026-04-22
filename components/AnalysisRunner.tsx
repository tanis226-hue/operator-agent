"use client";

import { useState } from "react";
import { IntakeBriefCard } from "./IntakeBriefCard";
import { AnalysisResults } from "./AnalysisResults";
import { PlaceholderResults } from "./PlaceholderResults";
import type { PipelineAnalysis } from "@/lib/analyzePipeline";
import type { GeneratedOutputPayload } from "@/lib/outputTypes";
import type { PipelineLog } from "@/lib/pipelinePhases";
import type { IntakeBrief } from "@/lib/intakeBrief";

type RunState = "idle" | "running" | "done" | "error";

type PhaseState = {
  phase: string;
  label: string;
  status: "pending" | "running" | "done";
  summary?: string;
};

type AnalysisResponse = {
  analysis: PipelineAnalysis;
  generated: GeneratedOutputPayload;
  pipelineLog: PipelineLog;
  usedFallback?: boolean;
};

const PIPELINE_PHASES: PhaseState[] = [
  {
    phase: "frame",
    label: "Framing the problem and reviewing pipeline data",
    status: "pending",
  },
  {
    phase: "analyze",
    label: "Analyzing root causes and causal chains",
    status: "pending",
  },
  {
    phase: "synthesize",
    label: "Building recommendations and control plan",
    status: "pending",
  },
];

type Props = { brief: IntakeBrief };

export function AnalysisRunner({ brief }: Props) {
  const [state, setState] = useState<RunState>("idle");
  const [phases, setPhases] = useState<PhaseState[]>(PIPELINE_PHASES);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [briefOpen, setBriefOpen] = useState(true);

  async function handleRunAnalysis() {
    if (state === "running") return;
    setState("running");
    setPhases(PIPELINE_PHASES.map((p) => ({ ...p, status: "pending" })));
    setResult(null);
    setErrorMsg("");
    setBriefOpen(false);

    try {
      const res = await fetch("/api/run-analysis", { method: "POST" });

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(jsonStr) as Record<string, unknown>;
          } catch {
            continue;
          }

          const eventType = parsed.event as string;

          if (eventType === "phase") {
            const phase = parsed.phase as string;
            const status = parsed.status as "running" | "done";
            const label = parsed.label as string | undefined;
            const summary = parsed.summary as string | undefined;

            setPhases((prev) =>
              prev.map((p) => {
                if (p.phase !== phase) return p;
                if (status === "running") {
                  return { ...p, status: "running", label: label ?? p.label };
                }
                return { ...p, status: "done", summary: summary ?? "" };
              })
            );
          } else if (eventType === "complete") {
            const analysis = parsed.analysis as PipelineAnalysis;
            const generated = parsed.generated as GeneratedOutputPayload;
            const pipelineLog = parsed.pipelineLog as PipelineLog;
            const usedFallback = parsed.usedFallback as boolean | undefined;

            setResult({ analysis, generated, pipelineLog, usedFallback });
            setCompletedAt(new Date().toLocaleTimeString());
            setState("done");
          } else if (eventType === "error") {
            const message = parsed.message as string;
            setErrorMsg(message);
            setState("error");
            setBriefOpen(true);
          }
        }
      }
    } catch (err) {
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
            <h2 id="run-heading" className="text-base font-semibold text-ink">
              Run analysis
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Uses the intake brief, local pipeline data, and process note.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isDone && completedAt && (
              <span className="text-xs text-ink-muted">
                Complete · {completedAt}
                {result?.usedFallback === true && (
                  <span className="ml-1.5 rounded border border-line px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">
                    pre-generated
                  </span>
                )}
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
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-[13px] font-semibold text-white shadow-btn transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? "Running…" : isDone ? "Re-run" : "Run Analysis"}
            </button>
          </div>
        </div>

        {/* Phase progress track — shown while running */}
        {(isRunning || isDone) && (
          <div className="border-t border-line px-6 py-4">
            <ol className="flex flex-col gap-3">
              {phases.map((p) => (
                <PhaseRow key={p.phase} phase={p} />
              ))}
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

function PhaseRow({ phase }: { phase: PhaseState }) {
  const { status, label, summary } = phase;

  return (
    <li className="flex items-start gap-3">
      {/* Status indicator */}
      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
        {status === "pending" && (
          <span
            aria-hidden
            className="block h-3 w-3 rounded-full border border-ink-muted/30"
          />
        )}
        {status === "running" && (
          <span
            aria-hidden
            className="block h-3 w-3 animate-pulse rounded-full bg-accent"
          />
        )}
        {status === "done" && (
          <span
            aria-hidden
            className="block h-3 w-3 rounded-full bg-accent"
          />
        )}
      </div>

      {/* Label and summary */}
      <div className="min-w-0 flex-1">
        <p
          className={[
            "text-[13px] font-medium leading-snug",
            status === "pending" ? "text-ink-muted/50" : "text-ink",
          ].join(" ")}
        >
          {label}
        </p>
        {status === "done" && summary && (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-ink-soft">
            {summary}
          </p>
        )}
        {status === "running" && (
          <p className="mt-0.5 text-[11px] text-ink-muted">
            <span className="inline-flex gap-0.5" aria-hidden>
              <Dot />
              <Dot delay="200ms" />
              <Dot delay="400ms" />
            </span>
          </p>
        )}
      </div>
    </li>
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
