"use client";

import { useState } from "react";
import { IntakeBriefCard } from "./IntakeBriefCard";
import { IntakeBriefEditor } from "./IntakeBriefEditor";
import { AnalysisResults } from "./AnalysisResults";
import { PlaceholderResults } from "./PlaceholderResults";
import type { PipelineAnalysis } from "@/lib/analyzePipeline";
import type { GeneratedOutputPayload } from "@/lib/outputTypes";
import type { PipelineLog } from "@/lib/pipelinePhases";
import type { IntakeBrief } from "@/lib/intakeBrief";

type RunState = "idle" | "running" | "done" | "error";
type CaseMode = "demo" | "custom";

type PhaseState = {
  phase: string;
  label: string;
  status: "pending" | "running" | "done";
  summary?: string;
  startedAt?: number;
  durationMs?: number;
};

type AnalysisResponse = {
  analysis?: PipelineAnalysis;
  generated: GeneratedOutputPayload;
  pipelineLog: PipelineLog;
  usedFallback?: boolean;
};

const PIPELINE_PHASES: PhaseState[] = [
  { phase: "frame",     label: "Framing the problem and reviewing pipeline data", status: "pending" },
  { phase: "analyze",   label: "Analyzing root causes and causal chains",          status: "pending" },
  { phase: "synthesize",label: "Building recommendations and control plan",         status: "pending" },
];

const EMPTY_BRIEF: IntakeBrief = {
  businessName: "", workflowName: "", painPoint: "", successMetric: "",
  slaConstraint: "", currentStages: [], availableEvidence: [],
  qualifiedLeadDefinition: "", suspectedStage: "", biggestFrustration: "",
};

type Props = { brief: IntakeBrief };

export function AnalysisRunner({ brief }: Props) {
  const [state, setState]           = useState<RunState>("idle");
  const [phases, setPhases]         = useState<PhaseState[]>(PIPELINE_PHASES);
  const [result, setResult]         = useState<AnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg]     = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [briefOpen, setBriefOpen]   = useState(true);
  const [runStartMs, setRunStartMs] = useState<number | null>(null);
  const [totalDurationMs, setTotalDurationMs] = useState<number | null>(null);
  const [copied, setCopied]         = useState(false);

  const [mode, setMode]             = useState<CaseMode>("demo");
  const [customBrief, setCustomBrief] = useState<IntakeBrief>(EMPTY_BRIEF);
  const [customNote, setCustomNote] = useState("");

  const isRunning  = state === "running";
  const isDone     = state === "done";
  const activeBrief = mode === "demo" ? brief : customBrief;

  async function handleRunAnalysis() {
    if (isRunning) return;

    if (mode === "custom") {
      const missing: string[] = [];
      if (!customBrief.businessName.trim()) missing.push("business / team");
      if (!customBrief.painPoint.trim())    missing.push("pain point");
      if (!customBrief.successMetric.trim()) missing.push("success metric");
      if (missing.length > 0) {
        setErrorMsg(`Please fill in: ${missing.join(", ")}. These feed the analysis prompt.`);
        setState("error");
        return;
      }
    }

    const startMs = Date.now();
    setRunStartMs(startMs);
    setTotalDurationMs(null);
    setState("running");
    setPhases(PIPELINE_PHASES.map((p) => ({ ...p, status: "pending", startedAt: undefined, durationMs: undefined })));
    setResult(null);
    setErrorMsg("");
    setBriefOpen(false);

    try {
      const init: RequestInit = { method: "POST" };
      if (mode === "custom") {
        init.headers = { "Content-Type": "application/json" };
        init.body = JSON.stringify({ brief: customBrief, processNote: customNote });
      }

      const res = await fetch("/api/run-analysis", init);
      if (!res.body) throw new Error("No response body");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";

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
          try { parsed = JSON.parse(jsonStr) as Record<string, unknown>; }
          catch { continue; }

          const eventType = parsed.event as string;

          if (eventType === "phase") {
            const phase  = parsed.phase as string;
            const status = parsed.status as "running" | "done";
            const label   = parsed.label   as string | undefined;
            const summary = parsed.summary as string | undefined;
            const now = Date.now();

            setPhases((prev) =>
              prev.map((p) => {
                if (p.phase !== phase) return p;
                if (status === "running") {
                  return { ...p, status: "running", label: label ?? p.label, startedAt: now };
                }
                return {
                  ...p,
                  status: "done",
                  summary: summary ?? "",
                  durationMs: p.startedAt ? now - p.startedAt : undefined,
                };
              })
            );
          } else if (eventType === "complete") {
            const analysis    = parsed.analysis    as PipelineAnalysis | undefined;
            const generated   = parsed.generated   as GeneratedOutputPayload;
            const pipelineLog = parsed.pipelineLog as PipelineLog;
            const usedFallback = parsed.usedFallback as boolean | undefined;

            setResult({ analysis, generated, pipelineLog, usedFallback });
            setCompletedAt(new Date().toLocaleTimeString());
            setTotalDurationMs(Date.now() - startMs);
            setState("done");
          } else if (eventType === "error") {
            setErrorMsg(parsed.message as string);
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

  async function handleCopyReport() {
    if (!result) return;
    const md = buildMarkdownReport(activeBrief, result.generated, result.analysis);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleModeChange(next: CaseMode) {
    if (isRunning) return;
    setMode(next);
    setErrorMsg("");
    setState("idle");
    setBriefOpen(true);
  }

  return (
    <>
      {/* Case-source toggle */}
      <CaseModeToggle
        mode={mode}
        onChange={handleModeChange}
        disabled={isRunning}
        onCopyFromDemo={() => setCustomBrief(brief)}
        showCopyFromDemo={mode === "custom"}
      />

      {/* Intake brief */}
      {briefOpen ? (
        mode === "demo"
          ? <IntakeBriefCard brief={brief} />
          : <IntakeBriefEditor
              brief={customBrief}
              processNote={customNote}
              onBriefChange={setCustomBrief}
              onProcessNoteChange={setCustomNote}
              disabled={isRunning}
            />
      ) : (
        <button
          type="button"
          onClick={() => setBriefOpen(true)}
          className="flex w-full items-center justify-between rounded-card border border-line bg-surface px-6 py-3 text-sm shadow-card transition hover:bg-canvas"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink">{activeBrief.businessName || "Custom case"}</span>
            <span className="text-ink-muted">·</span>
            <span className="text-ink-soft">{activeBrief.workflowName || "—"}</span>
          </div>
          <span className="text-xs text-ink-muted">Show intake brief ↓</span>
        </button>
      )}

      {/* Run Analysis */}
      <section
        aria-labelledby="run-heading"
        className="rounded-card border border-line bg-surface shadow-card"
      >
        <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h2 id="run-heading" className="text-base font-semibold text-ink">Run analysis</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {mode === "demo"
                ? "Uses the intake brief, local pipeline data, and process note."
                : "Uses your intake brief and context with local pipeline data."}
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
                {errorMsg && errorMsg.length < 80 ? errorMsg : "Failed — see details below"}
              </span>
            )}
            {isDone && (
              <button
                type="button"
                onClick={handleCopyReport}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-surface"
              >
                {copied ? "Copied!" : "Copy report"}
              </button>
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

        {/* Phase progress */}
        {(isRunning || isDone) && (
          <div className="border-t border-line px-6 py-4">
            <ol className="flex flex-col gap-3">
              {phases.map((p) => <PhaseRow key={p.phase} phase={p} />)}
            </ol>

            {/* Run summary — shown after completion */}
            {isDone && totalDurationMs !== null && (
              <div className="mt-4 flex items-center gap-4 rounded-lg border border-line bg-canvas px-4 py-2.5">
                <StatPill label="Opus 4.7 calls" value="3" />
                <div className="h-3 w-px bg-line" />
                <StatPill label="Total duration" value={formatDuration(totalDurationMs)} />
                <div className="h-3 w-px bg-line" />
                <StatPill label="Phases" value="Frame · Analyze · Synthesize" />
              </div>
            )}
          </div>
        )}

        {state === "error" && errorMsg && (
          <div className="border-t border-red-100 bg-red-50 px-6 py-3 text-xs leading-relaxed text-red-600">
            {errorMsg}
          </div>
        )}
      </section>

      {/* Results divider */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Results</span>
        <div className="h-px flex-1 bg-line" />
        {isDone && completedAt && (
          <span className="text-[11px] text-ink-muted">Generated {completedAt}</span>
        )}
      </div>

      {isDone && result ? (
        <AnalysisResults analysis={result.analysis} generated={result.generated} />
      ) : (
        <PlaceholderResults />
      )}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <span className="text-ink-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function CaseModeToggle({
  mode, onChange, disabled, onCopyFromDemo, showCopyFromDemo,
}: {
  mode: CaseMode;
  onChange: (next: CaseMode) => void;
  disabled: boolean;
  onCopyFromDemo: () => void;
  showCopyFromDemo: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card">
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">Case</span>
        <div role="tablist" aria-label="Case mode" className="inline-flex rounded-md border border-line bg-canvas p-0.5">
          <ToggleTab active={mode === "demo"}   onClick={() => onChange("demo")}   disabled={disabled}>Demo</ToggleTab>
          <ToggleTab active={mode === "custom"} onClick={() => onChange("custom")} disabled={disabled}>My own case</ToggleTab>
        </div>
      </div>
      {showCopyFromDemo && (
        <button
          type="button"
          onClick={onCopyFromDemo}
          disabled={disabled}
          className="text-[12px] font-medium text-accent transition hover:text-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Copy demo values as a starting point →
        </button>
      )}
    </div>
  );
}

function ToggleTab({
  active, onClick, disabled, children,
}: {
  active: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded px-3 py-1 text-[12px] font-medium transition",
        active ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function PhaseRow({ phase }: { phase: PhaseState }) {
  const { status, label, summary, durationMs } = phase;

  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
        {status === "pending" && <span aria-hidden className="block h-3 w-3 rounded-full border border-ink-muted/30" />}
        {status === "running" && <span aria-hidden className="block h-3 w-3 animate-pulse rounded-full bg-accent" />}
        {status === "done"    && <span aria-hidden className="block h-3 w-3 rounded-full bg-accent" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className={["text-[13px] font-medium leading-snug", status === "pending" ? "text-ink-muted/50" : "text-ink"].join(" ")}>
            {label}
          </p>
          {status === "done" && durationMs !== undefined && (
            <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">
              {formatDuration(durationMs)}
            </span>
          )}
        </div>

        {status === "done" && summary && (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-ink-soft">{summary}</p>
        )}
        {status === "running" && (
          <p className="mt-0.5 text-[11px] text-ink-muted">
            <span className="inline-flex gap-0.5" aria-hidden>
              <Dot /><Dot delay="200ms" /><Dot delay="400ms" />
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function buildMarkdownReport(
  brief: IntakeBrief,
  g: GeneratedOutputPayload,
  analysis?: PipelineAnalysis
): string {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const lines: string[] = [];

  lines.push(`# Process Analysis Report`);
  lines.push(`**${brief.businessName}** · ${brief.workflowName}`);
  lines.push(`Generated ${date} by Operator Agent (Claude Opus 4.7)`);
  lines.push(``);

  lines.push(`---`);
  lines.push(``);

  // Executive Summary
  lines.push(`## Executive Summary`);
  lines.push(g.executiveSummary.headlineFinding);
  lines.push(``);
  lines.push(`**Business impact:** ${g.executiveSummary.whyItMatters}`);
  lines.push(`**Primary cause:** ${g.executiveSummary.primaryCause}`);
  lines.push(`**First action:** ${g.executiveSummary.recommendedAction}`);
  lines.push(`**Monitoring:** ${g.executiveSummary.monitoringPlan}`);
  lines.push(``);

  // Baseline metrics if available
  if (analysis) {
    lines.push(`## Baseline Performance`);
    lines.push(`| Metric | Value |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Conversion rate | ${analysis.conversionRate}% |`);
    lines.push(`| Median first response | ${analysis.medianFirstResponseHours.toFixed(1)}h (SLA: 4h) |`);
    lines.push(`| Stalled lead rate | ${analysis.stalledLeadRate}% |`);
    lines.push(`| Missed follow-up rate | ${analysis.missedFollowupRate}% |`);
    lines.push(`| Total leads analyzed | ${analysis.totalLeads} |`);
    lines.push(``);
  }

  // Problem Definition
  lines.push(`## Problem Definition`);
  lines.push(`**Workflow:** ${g.problemDefinition.workflow}`);
  lines.push(`**Problem:** ${g.problemDefinition.businessProblem}`);
  lines.push(`**Affected group:** ${g.problemDefinition.affectedGroup}`);
  lines.push(`**Success metric:** ${g.problemDefinition.successMetric}`);
  lines.push(`**Scope:** ${g.problemDefinition.scope}`);
  lines.push(``);

  // Root Cause Analysis
  lines.push(`## Root-Cause Analysis`);
  lines.push(`**Top failure point:** ${g.rootCauseAnalysis.topLeakagePoint}`);
  lines.push(``);
  g.rootCauseAnalysis.rankedCauses.forEach((c) => {
    lines.push(`**${c.rank}. ${c.factor}**`);
    lines.push(c.finding);
    lines.push(``);
  });
  lines.push(`**Key comparison:** ${g.rootCauseAnalysis.supportingComparison}`);
  lines.push(`**Segment insight:** ${g.rootCauseAnalysis.segmentInsight}`);
  lines.push(``);

  // Recommendation
  lines.push(`## Recommended Fix`);
  lines.push(g.recommendation.firstAction);
  lines.push(``);
  lines.push(`**Why this first:** ${g.recommendation.whyThisFirst}`);
  lines.push(`**Expected effect:** ${g.recommendation.expectedEffect}`);
  lines.push(`**Owner:** ${g.recommendation.owner}`);
  lines.push(``);

  // SOP
  lines.push(`## Workflow SOP — ${g.workflowSOP.title}`);
  lines.push(`*${g.workflowSOP.objective}*`);
  lines.push(``);
  g.workflowSOP.bullets.forEach((b) => lines.push(`- ${b}`));
  lines.push(``);
  lines.push(`**Escalation:** ${g.workflowSOP.escalation}`);
  lines.push(`**Owner:** ${g.workflowSOP.owner}`);
  lines.push(``);

  // Control Dashboard
  lines.push(`## Control Dashboard`);
  lines.push(`- ${g.controlDashboard.primaryMetricLabel}`);
  lines.push(`- ${g.controlDashboard.secondaryMetricLabel}`);
  lines.push(`- ${g.controlDashboard.tertiaryMetricLabel}`);
  lines.push(`- **Needs attention:** ${g.controlDashboard.segmentNeedingAttention}`);
  lines.push(``);

  // Alert Rules
  lines.push(`## Alert Logic`);
  g.alertRules.forEach((r) => {
    lines.push(`- **[${r.severity.toUpperCase()}]** ${r.trigger} → ${r.action}`);
  });
  lines.push(``);

  // Monitoring Report
  lines.push(`## Monitoring Report`);
  lines.push(`**Issue:** ${g.monitoringReport.issue}`);
  lines.push(`**Fix:** ${g.monitoringReport.fix}`);
  lines.push(`**Metrics:** ${g.monitoringReport.metrics}`);
  lines.push(`**Thresholds:** ${g.monitoringReport.thresholds}`);
  lines.push(`**Owner:** ${g.monitoringReport.owner}`);
  lines.push(`**Response if drift:** ${g.monitoringReport.responsePlan}`);

  return lines.join("\n");
}
