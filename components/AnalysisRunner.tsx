"use client";

import { useState, useEffect, useRef } from "react";
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
  { phase: "frame",      label: "Define: Clarifying the problem and success criteria",           status: "pending" },
  { phase: "analyze",    label: "Measure & Analyze: Quantifying current state and root causes",  status: "pending" },
  { phase: "synthesize", label: "Improve & Control: Building recommendations and controls",      status: "pending" },
];

const EMPTY_BRIEF: IntakeBrief = {
  businessName: "",
  workflowName: "",
  industry: null,
  subIndustry: null,
  teamSize: null,
  painPoint: "",
  biggestFrustration: "",
  successMetric: "",
  slaText: "",
  slaThresholdHours: null,
  currentStages: [],
  qualifiedLeadDefinition: "",
  suspectedStage: "",
  volumePerMonth: "",
  valuePerItem: "",
  currentTooling: "",
  priorAttempts: "",
  benchmarkCategoryId: null,
};

type Props = {
  brief: IntakeBrief;
  externalBrief?: IntakeBrief;
  externalNote?: string;
  onRestart?: () => void;
  onAnalyzeOwn?: () => void;
  instantDemo?: boolean;
};

const ANALYSIS_SESSION_KEY = "oa_analysis";

export function AnalysisRunner({ brief, externalBrief, externalNote, onRestart, onAnalyzeOwn, instantDemo }: Props) {
  const [state, setState]           = useState<RunState>("idle");
  const [phases, setPhases]         = useState<PhaseState[]>(PIPELINE_PHASES);
  const [result, setResult]         = useState<AnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg]     = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [briefOpen, setBriefOpen]   = useState(false);
  const [runStartMs, setRunStartMs] = useState<number | null>(null);
  const [totalDurationMs, setTotalDurationMs] = useState<number | null>(null);
  const [copied, setCopied]         = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSent, setEmailSent]   = useState(false);

  const [mode, setMode]             = useState<CaseMode>(externalBrief ? "custom" : "demo");
  const [customBrief, setCustomBrief] = useState<IntakeBrief>(externalBrief ?? EMPTY_BRIEF);
  const [customNote, setCustomNote] = useState(externalNote ?? "");

  // Auto-load instant demo result on mount (bypasses API call entirely)
  useEffect(() => {
    if (!instantDemo) return;
    // Skip if a result is already cached in sessionStorage
    try {
      const cached = sessionStorage.getItem(ANALYSIS_SESSION_KEY);
      if (cached) return;
    } catch { /* ignore */ }

    void (async () => {
      try {
        const res = await fetch("/api/demo-result");
        if (!res.ok) return;
        const data = await res.json() as {
          generated: GeneratedOutputPayload;
          analysis: PipelineAnalysis;
          pipelineLog: PipelineLog;
          usedFallback: boolean;
        };
        const donePhases = PIPELINE_PHASES.map((p, i) => ({
          ...p,
          status: "done" as const,
          summary: (data.pipelineLog[i]?.summary) ?? "",
        }));
        setPhases(donePhases);
        setResult({
          analysis: data.analysis,
          generated: data.generated,
          pipelineLog: data.pipelineLog,
          usedFallback: true,
        });
        setCompletedAt(new Date().toLocaleTimeString());
        setState("done");
      } catch { /* fallback silently — user can still click Run Analysis */ }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instantDemo]);

  // Restore completed result from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(ANALYSIS_SESSION_KEY);
      if (!saved) {
        // No cached result — if demo tab is active, auto-fetch pre-generated demo result
        // (instantDemo path fetches its own fresh result via the effect above)
        if (!instantDemo && mode === "demo") {
          void (async () => {
            try {
              const res = await fetch("/api/demo-result");
              if (!res.ok) return;
              const data = await res.json() as {
                generated: GeneratedOutputPayload;
                analysis: PipelineAnalysis;
                pipelineLog: PipelineLog;
                usedFallback: boolean;
              };
              const donePhases = PIPELINE_PHASES.map((p, i) => ({
                ...p,
                status: "done" as const,
                summary: (data.pipelineLog[i]?.summary) ?? "",
              }));
              setPhases(donePhases);
              setResult({
                analysis: data.analysis,
                generated: data.generated,
                pipelineLog: data.pipelineLog,
                usedFallback: true,
              });
              setCompletedAt(new Date().toLocaleTimeString());
              setState("done");
            } catch { /* silently fail — user can still click Run Analysis */ }
          })();
        }
        return;
      }
      const s = JSON.parse(saved) as {
        result: AnalysisResponse;
        completedAt: string;
        totalDurationMs: number;
        mode: CaseMode;
        customBrief: IntakeBrief;
        customNote: string;
        phases: PhaseState[];
      };
      if (s.result) {
        setResult(s.result);
        setState("done");
        setCompletedAt(s.completedAt ?? "");
        setTotalDurationMs(s.totalDurationMs ?? null);
        setMode(s.mode ?? (externalBrief ? "custom" : "demo"));
        if (s.customBrief) setCustomBrief(s.customBrief);
        if (s.customNote !== undefined) setCustomNote(s.customNote);
        if (s.phases) setPhases(s.phases);
      }
    } catch { /* ignore corrupt storage */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to sessionStorage whenever a result is completed
  useEffect(() => {
    if (state !== "done" || !result) return;
    try {
      sessionStorage.setItem(ANALYSIS_SESSION_KEY, JSON.stringify({
        result, completedAt, totalDurationMs, mode, customBrief, customNote, phases,
      }));
    } catch { /* storage full */ }
  }, [state, result, completedAt, totalDurationMs, mode, customBrief, customNote, phases]);

  const isRunning  = state === "running";
  const isDone     = state === "done";
  const activeBrief = mode === "demo" ? brief : customBrief;

  // Get contextual button message based on active phase
  function getRunningMessage(): string {
    const activePhase = phases.find((p) => p.status === "running");
    if (!activePhase) return "Running…";
    switch (activePhase.phase) {
      case "frame":
        return "Framing the problem…";
      case "analyze":
        return "Analyzing root causes…";
      case "synthesize":
        return "Building recommendations…";
      default:
        return "Running…";
    }
  }

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
    try { sessionStorage.removeItem(ANALYSIS_SESSION_KEY); } catch { /* ignore */ }

    try {
      // 1. Kick off the job
      const init: RequestInit = { method: "POST" };
      if (mode === "custom") {
        init.headers = { "Content-Type": "application/json" };
        init.body = JSON.stringify({ brief: customBrief, processNote: customNote });
      }
      const startRes = await fetch("/api/run-analysis", init);
      if (!startRes.ok) {
        const err = (await startRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `Failed to start analysis (status ${startRes.status})`);
      }
      const { jobId } = (await startRes.json()) as { jobId: string };
      if (!jobId) throw new Error("Server did not return a jobId");

      // 2. Poll for events. Track which event indices we've consumed so the
      // UI animates phase transitions even when many events arrive at once.
      let consumed = 0;
      let terminalSeen = false;
      let lastUpdatedAt = 0;
      let lastProgressMs = Date.now();
      // Hard cap: 10 minutes (background fn has 15 min; we bail earlier).
      const deadline = Date.now() + 10 * 60 * 1000;
      // If no state progress for 90s, the background fn likely crashed.
      const STALE_MS = 90_000;

      while (!terminalSeen) {
        if (Date.now() > deadline) {
          throw new Error("Analysis timed out. The pipeline is taking too long — please retry.");
        }
        await new Promise((r) => setTimeout(r, 2000));

        let statusRes: Response;
        try {
          statusRes = await fetch(`/api/analysis-status?jobId=${encodeURIComponent(jobId)}`, {
            cache: "no-store",
          });
        } catch {
          // Transient network blip - keep polling.
          continue;
        }
        if (!statusRes.ok) continue;

        const data = (await statusRes.json()) as {
          status: "pending" | "running" | "done" | "error";
          events: Array<Record<string, unknown>>;
          generated?: GeneratedOutputPayload;
          pipelineLog?: PipelineLog;
          usedFallback?: boolean;
          errorMessage?: string;
          updatedAt?: number;
        };

        // Stale-job detection: if `updatedAt` hasn't moved in 90s and the
        // job hasn't reached a terminal state, the background function
        // crashed silently. Surface an actionable error.
        if (data.updatedAt && data.updatedAt !== lastUpdatedAt) {
          lastUpdatedAt = data.updatedAt;
          lastProgressMs = Date.now();
        }
        if (
          data.status !== "done" &&
          data.status !== "error" &&
          lastUpdatedAt > 0 &&
          Date.now() - lastProgressMs > STALE_MS
        ) {
          throw new Error(
            "Analysis stalled — the background worker stopped responding. Please retry."
          );
        }

        // Apply any new events to the phase UI.
        const newEvents = data.events.slice(consumed);
        consumed = data.events.length;
        for (const parsed of newEvents) {
          const eventType = parsed.event as string;
          if (eventType === "phase") {
            const phase   = parsed.phase as string;
            const status  = parsed.status as "running" | "done";
            const label   = parsed.label as string | undefined;
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
            setErrorMsg((parsed.message as string) || "Analysis failed.");
            setState("error");
            setBriefOpen(true);
          }
        }

        if (data.status === "done" || data.status === "error") {
          // Belt-and-suspenders: if events array somehow didn't carry the
          // terminal marker, fall back to the structured fields.
          if (data.status === "done" && !result && data.generated) {
            setResult({
              analysis: undefined,
              generated: data.generated,
              pipelineLog: data.pipelineLog ?? [],
              usedFallback: data.usedFallback,
            });
            setCompletedAt(new Date().toLocaleTimeString());
            setTotalDurationMs(Date.now() - startMs);
            setState("done");
          } else if (data.status === "error" && data.errorMessage) {
            setErrorMsg(data.errorMessage);
            setState("error");
            setBriefOpen(true);
          }
          terminalSeen = true;
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
    const text = buildPlainTextReport(activeBrief, result.generated, result.analysis);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleEmailReport() {
    if (!result) return;
    setEmailModalOpen(true);
  }

  async function handleSendEmail(address: string): Promise<void> {
    if (!result) return;
    const res = await fetch("/api/email-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: address,
        brief: activeBrief,
        generated: result.generated,
      }),
    });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error ?? "Failed to send email.");
    }
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  }

  type ReportFormat = "docx" | "pdf" | "txt";

  async function handleSaveReport(format: ReportFormat) {
    if (!result) return;
    setSaveMenuOpen(false);

    const filename = activeBrief.workflowName.toLowerCase().replace(/\s+/g, "-") || "analysis";

    if (format === "txt") {
      const text = buildPlainTextReport(activeBrief, result.generated, result.analysis);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}-analysis.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
      return;
    }

    if (format === "pdf") {
      const html = buildPrintableHtmlReport(activeBrief, result.generated, result.analysis);
      const win = window.open("", "_blank", "width=900,height=1200");
      if (!win) {
        alert("Pop-up blocked. Please allow pop-ups to export PDF.");
        return;
      }
      win.document.write(html);
      win.document.close();
      // Give the new window time to render before triggering print
      setTimeout(() => {
        win.focus();
        win.print();
      }, 300);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
      return;
    }

    // format === "docx"
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, PageBreak } = await import("docx");
    const g = result.generated;
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) {
      return new Paragraph({ text, heading: level, spacing: { before: 300, after: 100 } });
    }
    /** Page-break + heading combo — used at the start of each DMAIC section */
    function sectionHeading(letter: string, title: string) {
      return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 0, after: 200 },
        children: [
          new PageBreak(),
          new TextRun({ text: `${letter}  `, bold: true, size: 36, color: "C45C2E" }),
          new TextRun({ text: title, bold: true, size: 32 }),
        ],
      });
    }
    function body(text: string) {
      return new Paragraph({ children: [new TextRun({ text, size: 22 })], spacing: { after: 120 } });
    }
    function labeledPara(label: string, text: string) {
      return new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 22 }),
          new TextRun({ text, size: 22 }),
        ],
        spacing: { after: 100 },
      });
    }
    function bullet(text: string) {
      return new Paragraph({
        children: [new TextRun({ text, size: 22 })],
        bullet: { level: 0 },
        spacing: { after: 80 },
      });
    }
    function divider() {
      return new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
        spacing: { before: 200, after: 200 },
      });
    }

    const children = [
      // ─── Cover page ───
      new Paragraph({
        children: [new TextRun({ text: " ", size: 22 })],
        spacing: { before: 1800 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "DMAIC PROCESS ANALYSIS", bold: true, size: 22, color: "C45C2E" })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: activeBrief.workflowName, bold: true, size: 56 })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: activeBrief.businessName || "Custom case", size: 28, color: "555555" })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: date, size: 22, color: "888888" })],
        spacing: { after: 600 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Generated by OpsAdvisor · Claude Opus 4.7", size: 16, color: "AAAAAA" })],
      }),

      // ─── Executive Summary (page 2) ───
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 0, after: 200 },
        children: [
          new PageBreak(),
          new TextRun({ text: "Executive Summary", bold: true, size: 32 }),
        ],
      }),
      body(g.executiveSummary.headlineFinding),
      labeledPara("Business impact", g.executiveSummary.whyItMatters),
      labeledPara("Primary cause", g.executiveSummary.primaryCause),
      labeledPara("First action", g.executiveSummary.recommendedAction),
      labeledPara("Monitoring", g.executiveSummary.monitoringPlan),

      // ─── DEFINE ───
      sectionHeading("D", "Define: Problem Definition"),
      labeledPara("Workflow", g.problemDefinition.workflow),
      labeledPara("Business problem", g.problemDefinition.businessProblem),
      labeledPara("Affected group", g.problemDefinition.affectedGroup),
      labeledPara("Success metric", g.problemDefinition.successMetric),
      labeledPara("Scope", g.problemDefinition.scope),

      // ─── MEASURE ───
      sectionHeading("M", "Measure: Current State & KPIs"),
      
      // Render metric cards from analysis if available
      ...(result.analysis ? [
        new Paragraph({
          children: [new TextRun({ text: "Baseline Metrics", bold: true, size: 24 })],
          spacing: { before: 0, after: 150 },
        }),
        labeledPara("Conversion rate", `${result.analysis.conversionRate}% (new lead → booked meeting)`),
        labeledPara("Median first response", `${result.analysis.medianFirstResponseHours.toFixed(1)} hours (SLA: 4h)`),
        labeledPara("Stalled lead rate", `${result.analysis.stalledLeadRate}% (${result.analysis.stalledLeads} leads)`),
        labeledPara("Missed follow-up rate", `${result.analysis.missedFollowupRate}%`),
        labeledPara("Avg deal value", `$${result.analysis.avgDealValue.toLocaleString()} per lead`),
        labeledPara("Total leads analyzed", `${result.analysis.totalLeads} (${result.analysis.bookedMeetings} booked, ${result.analysis.stalledLeads} stalled, ${result.analysis.lostLeads} lost)`),
        
        // Stage breakdown
        new Paragraph({
          children: [new TextRun({ text: "Leads by Stage", bold: true, size: 22 })],
          spacing: { before: 200, after: 100 },
        }),
        ...result.analysis.stageDropoff.map((s) =>
          new Paragraph({
            children: [
              new TextRun({ text: `${s.stage}: `, bold: true, size: 20 }),
              new TextRun({ text: `${s.count} leads (${(s.percentOfTotal * 100).toFixed(1)}%)`, size: 20 }),
            ],
            spacing: { after: 60 },
            bullet: { level: 0 },
          })
        ),

        // Source breakdown
        ...(result.analysis.bySource.length > 1 ? [
          new Paragraph({
            children: [new TextRun({ text: "Conversion by Lead Source", bold: true, size: 22 })],
            spacing: { before: 200, after: 100 },
          }),
          ...result.analysis.bySource.map((s) =>
            new Paragraph({
              children: [
                new TextRun({ text: `${s.label}: `, bold: true, size: 20 }),
                new TextRun({ text: `${s.conversionRate}% (${s.total} leads, ${s.booked} booked)`, size: 20 }),
              ],
              spacing: { after: 60 },
              bullet: { level: 0 },
            })
          ),
        ] : []),
      ] : []),

      // Render baseline text and benchmarks
      ...(g.measureBaseline?.currentStateMetrics ?? []).map(bullet),
      ...(g.measureBaseline ? [
        labeledPara("Performance gap", g.measureBaseline.performanceGap),
        labeledPara("Industry context", g.measureBaseline.industryContext),
        labeledPara("Priority metric", g.measureBaseline.priorityMetric),
      ] : []),
      ...(g.measureBaseline?.benchmarkSources && g.measureBaseline.benchmarkSources.length > 0 ? [
        new Paragraph({
          children: [new TextRun({ text: `Benchmark sources${g.measureBaseline.benchmarkCategory ? `: ${g.measureBaseline.benchmarkCategory}` : ""}`, bold: true, size: 22 })],
          spacing: { before: 200, after: 100 },
        }),
        ...g.measureBaseline.benchmarkSources.map((b) =>
          new Paragraph({
            children: [
              new TextRun({ text: `${b.metric}: `, size: 20 }),
              new TextRun({ text: b.figure, bold: true, size: 20 }),
              new TextRun({ text: `. ${b.source} (${b.year}). `, size: 20, color: "666666" }),
              new TextRun({ text: b.url, size: 18, color: "0066CC" }),
            ],
            spacing: { after: 80 },
            bullet: { level: 0 },
          })
        ),
      ] : []),

      // ─── ANALYZE ───
      sectionHeading("A", "Analyze: Root-Cause Analysis"),
      body(g.rootCauseAnalysis.topLeakagePoint),
      ...g.rootCauseAnalysis.rankedCauses.map((c) =>
        new Paragraph({
          children: [
            new TextRun({ text: `${c.rank}. ${c.factor}: `, bold: true, size: 22 }),
            new TextRun({ text: c.finding, size: 22 }),
          ],
          spacing: { after: 100 },
        })
      ),
      labeledPara("Key comparison", g.rootCauseAnalysis.supportingComparison),
      labeledPara("Segment insight", g.rootCauseAnalysis.segmentInsight),

      // ─── IMPROVE ───
      sectionHeading("I", "Improve: Recommendation & SOP"),
      body(g.recommendation.firstAction),
      labeledPara("Why this first", g.recommendation.whyThisFirst),
      labeledPara("Expected result", g.recommendation.expectedEffect),
      labeledPara("Owner", g.recommendation.owner),
      new Paragraph({
        children: [new TextRun({ text: `SOP: ${g.workflowSOP.title}`, bold: true, size: 22 })],
        spacing: { before: 200, after: 60 },
      }),
      new Paragraph({ children: [new TextRun({ text: g.workflowSOP.objective, italics: true, size: 22 })], spacing: { after: 120 } }),
      ...g.workflowSOP.bullets.map(bullet),
      labeledPara("Escalation", g.workflowSOP.escalation),

      // ─── CONTROL ───
      sectionHeading("C", "Control: Metrics, Alerts, Monitoring"),
      labeledPara("Primary KPI", g.controlDashboard.primaryMetricLabel),
      labeledPara("Secondary KPI", g.controlDashboard.secondaryMetricLabel),
      labeledPara("Tertiary KPI", g.controlDashboard.tertiaryMetricLabel),
      labeledPara("Watch closely", g.controlDashboard.segmentNeedingAttention),
      new Paragraph({
        children: [new TextRun({ text: "Alert & escalation rules", bold: true, size: 22 })],
        spacing: { before: 200, after: 100 },
      }),
      ...g.alertRules.map((r) =>
        new Paragraph({
          children: [
            new TextRun({ text: `[${r.severity.toUpperCase()}] `, bold: true, size: 22, color: r.severity === "critical" ? "CC0000" : "CC6600" }),
            new TextRun({ text: `${r.trigger} → ${r.action}`, size: 22 }),
          ],
          spacing: { after: 100 },
        })
      ),
      new Paragraph({
        children: [new TextRun({ text: "Ongoing monitoring", bold: true, size: 22 })],
        spacing: { before: 200, after: 100 },
      }),
      labeledPara("Owner", g.monitoringReport.owner),
      labeledPara("Metrics", g.monitoringReport.metrics),
      labeledPara("Thresholds", g.monitoringReport.thresholds),
      labeledPara("If metrics drift", g.monitoringReport.responsePlan),

      new Paragraph({ children: [new TextRun({ text: `Generated by OpsAdvisor · Claude Opus 4.7 · ${date}`, size: 16, color: "AAAAAA" })], spacing: { before: 400 }, alignment: AlignmentType.CENTER }),
    ];

    const doc = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBlob(doc);
    const url = URL.createObjectURL(buffer);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-analysis.docx`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  function handleModeChange(next: CaseMode) {
    if (isRunning) return;
    setMode(next);
    setErrorMsg("");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if (next === "demo") {
      // Auto-load pre-generated demo result, same as instantDemo path
      setBriefOpen(false);
      setState("idle");
      setResult(null);
      try { sessionStorage.removeItem(ANALYSIS_SESSION_KEY); } catch { /* ignore */ }
      void (async () => {
        try {
          const res = await fetch("/api/demo-result");
          if (!res.ok) { setState("idle"); setBriefOpen(true); return; }
          const data = await res.json() as {
            generated: GeneratedOutputPayload;
            analysis: PipelineAnalysis;
            pipelineLog: PipelineLog;
            usedFallback: boolean;
          };
          const donePhases = PIPELINE_PHASES.map((p, i) => ({
            ...p,
            status: "done" as const,
            summary: (data.pipelineLog[i]?.summary) ?? "",
          }));
          setPhases(donePhases);
          setResult({
            analysis: data.analysis,
            generated: data.generated,
            pipelineLog: data.pipelineLog,
            usedFallback: true,
          });
          setCompletedAt(new Date().toLocaleTimeString());
          setState("done");
        } catch { setState("idle"); setBriefOpen(true); }
      })();
    } else {
      setState("idle");
      setBriefOpen(true);
    }
  }

  return (
    <>
      {/* Case-source toggle — always visible for easy switching between demo and custom modes */}
      <CaseModeToggle
        mode={mode}
        onChange={handleModeChange}
        disabled={isRunning}
        onCopyFromDemo={() => setCustomBrief(brief)}
        showCopyFromDemo={mode === "custom"}
      />

      {/* Demo context — grounding one-liner shown when instant demo is active */}
      {instantDemo && mode === "demo" && (
        <p className="text-[13px] text-ink-muted">
          <span className="font-medium text-ink">Demo case</span>
          {": Meridian Professional Services, a professional services team with 120 inbound leads and an inconsistent follow-up problem."}
        </p>
      )}

      {/* Intake brief — hidden in instant demo (pre-generated) until user explicitly opens it */}
      {!(instantDemo && result?.usedFallback && !briefOpen) && (
        briefOpen ? (
          mode === "demo"
            ? <IntakeBriefCard brief={brief} onClose={() => setBriefOpen(false)} />
            : <IntakeBriefEditor
                brief={customBrief}
                processNote={customNote}
                onBriefChange={setCustomBrief}
                onProcessNoteChange={setCustomNote}
                disabled={isRunning}
                onClose={() => setBriefOpen(false)}
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
              <span className="text-ink-soft">{activeBrief.workflowName || "-"}</span>
            </div>
            <span className="text-xs font-medium text-accent">Show intake brief ↓</span>
          </button>
        )
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
                ? result?.usedFallback
                  ? "Showing a pre-generated result. Click \"Re-run live\" for a fresh AI analysis."
                  : "Runs the demo intake brief against the included pipeline dataset and process note."
                : "Runs your intake brief, uploaded files, and any database query results through the DMAIC pipeline."}
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
                {errorMsg && errorMsg.length < 80 ? errorMsg : "Failed. See details below"}
              </span>
            )}
            {!isRunning && !briefOpen && isDone && !result?.usedFallback && (
              <button
                type="button"
                onClick={() => setBriefOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-4 py-2 text-[13px] font-medium text-ink-muted transition hover:text-ink"
              >
                Edit brief
              </button>
            )}
            {onRestart && !isRunning && isDone && !result?.usedFallback && (
              <button
                type="button"
                onClick={onRestart}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-4 py-2 text-[13px] font-medium text-ink-muted transition hover:text-ink"
              >
                ← New analysis
              </button>
            )}
            {isDone && (
              <>
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-surface"
                >
                  {copied ? "Copied!" : "Copy report"}
                </button>
                <SaveReportMenu
                  open={saveMenuOpen}
                  onOpenChange={setSaveMenuOpen}
                  onSelect={handleSaveReport}
                  saved={downloaded}
                />
              </>
            )}
            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-[13px] font-semibold text-white shadow-btn transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? getRunningMessage() : isDone ? (result?.usedFallback ? "Re-run live" : "Re-run") : "Run Analysis"}
            </button>
          </div>
        </div>

        {/* Phase progress — hidden in instant demo pre-generated state */}
        {(isRunning || isDone) && !(instantDemo && result?.usedFallback) && (
          <div className="border-t border-line px-6 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Phases: takes up 2 columns on desktop, full width on mobile */}
              <div className="md:col-span-2">
                <ol className="flex flex-col gap-3">
                  {phases.map((p) => <PhaseRow key={p.phase} phase={p} />)}
                </ol>
              </div>
              {/* Sidebar: shows what we're analyzing */}
              {isRunning && (
                <div className="md:col-span-1">
                  <AnalysisContextSidebar brief={activeBrief} isRunning={isRunning} />
                </div>
              )}
            </div>

            {/* Run summary — shown after completion */}
            {isDone && totalDurationMs !== null && (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-line bg-canvas px-4 py-2.5">
                <StatPill label="Opus 4.7 calls" value="3" />
                <div className="hidden h-3 w-px bg-line sm:block" />
                <StatPill label="Total duration" value={formatDuration(totalDurationMs)} />
                <div className="hidden h-3 w-px bg-line sm:block" />
                <StatPill label="Phases" value="Define · Measure & Analyze · Improve & Control" />
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

      {emailModalOpen && (
        <EmailModal
          onClose={() => setEmailModalOpen(false)}
          onSend={handleSendEmail}
        />
      )}

      {isDone && result ? (
        <AnalysisResults
          analysis={result.analysis}
          generated={result.generated}
          brief={activeBrief}
          mode={mode}
          onAnalyzeOwn={onAnalyzeOwn}
          onRestart={onRestart}
          onCopyReport={handleCopyReport}
          onSaveReport={handleSaveReport}
          onEmailReport={handleEmailReport}
          reportCopied={copied}
          reportSaved={downloaded}
          reportEmailed={emailSent}
        />
      ) : (
        <PlaceholderResults />
      )}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AnalysisContextSidebar({ brief, isRunning }: { brief: IntakeBrief; isRunning: boolean }) {
  return (
    <div className="animate-slide-in-right rounded-lg border border-line bg-canvas px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-3">
        What we're analyzing
      </div>
      <div className="flex flex-col gap-2.5 text-[12px]">
        {brief.businessName && (
          <div>
            <div className="font-medium text-ink-muted mb-0.5">Business</div>
            <div className="text-ink">{brief.businessName}</div>
          </div>
        )}
        {brief.workflowName && (
          <div>
            <div className="font-medium text-ink-muted mb-0.5">Workflow</div>
            <div className="text-ink">{brief.workflowName}</div>
          </div>
        )}
        {brief.painPoint && (
          <div>
            <div className="font-medium text-ink-muted mb-0.5">Pain point</div>
            <div className="text-ink line-clamp-2">{brief.painPoint}</div>
          </div>
        )}
        {brief.currentStages && brief.currentStages.length > 0 && (
          <div>
            <div className="font-medium text-ink-muted mb-1">Pipeline stages</div>
            <div className="flex flex-wrap gap-1">
              {brief.currentStages.map((stage, i) => (
                <span key={i} className="rounded bg-surface px-2 py-0.5 text-[11px] text-ink-soft">
                  {stage}
                </span>
              ))}
            </div>
          </div>
        )}
        {isRunning && (
          <div className="mt-1 pt-2.5 border-t border-line">
            <div className="text-[10px] text-ink-soft italic">
              Analyzing workflow patterns, timing, and bottlenecks across your data…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
        <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">Source</span>
        <div role="tablist" aria-label="Analysis source" className="inline-flex rounded-md border border-line bg-canvas p-0.5">
          <ToggleTab active={mode === "demo"}   onClick={() => onChange("demo")}   disabled={disabled}>Demo case</ToggleTab>
          <ToggleTab active={mode === "custom"} onClick={() => onChange("custom")} disabled={disabled}>My workflow</ToggleTab>
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

// Rotating sub-labels shown while each phase is running, to make wait feel productive
const PHASE_SUBSTEPS: Record<string, string[]> = {
  frame: [
    "Reading the intake brief and process notes",
    "Surfacing the owner's stated frustration",
    "Identifying confirmed patterns vs. assumptions",
    "Framing the bottom-line problem",
  ],
  analyze: [
    "Tracing causal chains across stages",
    "Quantifying the current-state baseline",
    "Comparing to industry benchmarks",
    "Ranking root causes by impact",
    "Naming the failure mechanism",
  ],
  synthesize: [
    "Drafting the recommended first action",
    "Building the standard operating procedure",
    "Defining KPIs and alert thresholds",
    "Writing the executive summary",
    "Assembling the final report",
  ],
};

function PhaseRow({ phase }: { phase: PhaseState }) {
  const { status, label, summary, phase: phaseId, startedAt } = phase;
  const [substepIdx, setSubstepIdx] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);

  // Rotate sub-labels every 4s while running, track elapsed time for patience message
  useEffect(() => {
    if (status !== "running") return;
    setSubstepIdx(0);
    const start = startedAt ?? Date.now();
    
    // Update elapsed time every second
    const tick = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    
    // Rotate substeps every 4s
    const rotate = window.setInterval(() => {
      setSubstepIdx((i) => i + 1);
    }, 4000);
    
    return () => {
      window.clearInterval(tick);
      window.clearInterval(rotate);
    };
  }, [status, startedAt]);

  const substeps = PHASE_SUBSTEPS[phaseId] ?? [];
  const currentSubstep = substeps.length > 0 ? substeps[substepIdx % substeps.length] : null;
  
  // Show patience message if phase has been running for more than 45 seconds
  const showPatienceMsg = status === "running" && elapsedSec > 45;

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
        </div>

        {status === "done" && summary && (
          <p className="animate-fade-in mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-ink-soft">{summary}</p>
        )}
        {status === "running" && currentSubstep && (
          <p key={currentSubstep} className="mt-1 animate-fade-in text-[11px] leading-relaxed text-ink-muted">
            <span className="inline-flex gap-0.5 align-middle mr-1.5" aria-hidden>
              <Dot /><Dot delay="200ms" /><Dot delay="400ms" />
            </span>
            {currentSubstep}
          </p>
        )}
        {showPatienceMsg && (
          <p className="mt-2 text-[11px] leading-relaxed text-ink-muted italic">
            This step involves deep pattern analysis. Still untangling findings…
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

// ─── Email modal ─────────────────────────────────────────────────────────────

function EmailModal({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setState("sending");
    setErrorMsg("");
    try {
      await onSend(trimmed);
      setState("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("error");
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-modal-heading"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-sm rounded-card border border-line bg-surface shadow-card-lg">
          <div className="border-b border-line px-6 py-4">
            <h2 id="email-modal-heading" className="text-[15px] font-semibold text-ink">
              Email this report
            </h2>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              We'll send a full PDF-quality report to your inbox.
            </p>
          </div>

          {state === "sent" ? (
            <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-xl">✓</div>
              <p className="text-[14px] font-medium text-ink">Report sent!</p>
              <p className="text-[13px] text-ink-muted">Check your inbox — it should arrive within a minute.</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 rounded-lg border border-line bg-canvas px-5 py-2 text-[13px] font-medium text-ink transition hover:bg-surface"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4 px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email-report-input"
                  className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted"
                >
                  Your email address
                </label>
                <input
                  ref={inputRef}
                  id="email-report-input"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                  placeholder="you@example.com"
                  disabled={state === "sending"}
                  className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-[13px] text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
                />
                {errorMsg && (
                  <p className="text-[12px] text-red-500">{errorMsg}</p>
                )}
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={state === "sending"}
                  className="rounded-lg border border-line bg-canvas px-4 py-2 text-[13px] font-medium text-ink-muted transition hover:text-ink disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-[13px] font-semibold text-white shadow-btn transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {state === "sending" ? "Sending…" : "Send report"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Save report dropdown ────────────────────────────────────────────────────

function SaveReportMenu({
  open,
  onOpenChange,
  onSelect,
  saved,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSelect: (format: "docx" | "pdf" | "txt") => void;
  saved: boolean;
}) {
  const items: Array<{ format: "docx" | "pdf" | "txt"; label: string; sub: string }> = [
    { format: "docx", label: "Word document",    sub: ".docx, editable in Word, Pages, Google Docs" },
    { format: "pdf",  label: "PDF",              sub: ".pdf, opens print dialog (Save as PDF)" },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-surface"
      >
        {saved ? "Saved!" : "Save report"}
        <span aria-hidden className="text-[10px] text-ink-muted">▾</span>
      </button>

      {open && (
        <>
          {/* Backdrop catches outside clicks */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 top-full z-20 mt-1.5 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-line bg-surface shadow-card"
          >
            {items.map((item) => (
              <button
                key={item.format}
                type="button"
                role="menuitem"
                onClick={() => onSelect(item.format)}
                className="flex w-full flex-col items-start gap-0.5 border-b border-line px-4 py-3 text-left transition last:border-0 hover:bg-canvas"
              >
                <span className="text-[13px] font-medium text-ink">{item.label}</span>
                <span className="text-[11px] text-ink-muted">{item.sub}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Printable HTML (for PDF export via window.print) ───────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPrintableHtmlReport(
  brief: IntakeBrief,
  g: GeneratedOutputPayload,
  analysis?: PipelineAnalysis
): string {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const e = escapeHtml;

  const benchmarksBlock = g.measureBaseline?.benchmarkSources && g.measureBaseline.benchmarkSources.length > 0
    ? `<h3>Benchmark sources${g.measureBaseline.benchmarkCategory ? `: ${e(g.measureBaseline.benchmarkCategory)}` : ""}</h3>
       <ul class="benchmarks">
         ${g.measureBaseline.benchmarkSources.map((b) =>
           `<li><span class="metric">${e(b.metric)}:</span> <strong>${e(b.figure)}</strong>. <a href="${e(b.url)}">${e(b.source)} (${b.year})</a></li>`
         ).join("")}
       </ul>`
    : "";

  const analysisMetricsBlock = analysis
    ? `<h3>Baseline Metrics</h3>
       <ul>
         <li><strong>Conversion rate:</strong> ${e(String(analysis.conversionRate))}% (new lead → booked meeting)</li>
         <li><strong>Median first response:</strong> ${e(String(analysis.medianFirstResponseHours.toFixed(1)))} hours (SLA: 4h)</li>
         <li><strong>Stalled lead rate:</strong> ${e(String(analysis.stalledLeadRate))}% (${analysis.stalledLeads} leads)</li>
         <li><strong>Missed follow-up rate:</strong> ${e(String(analysis.missedFollowupRate))}%</li>
         <li><strong>Avg deal value:</strong> $${e(String(analysis.avgDealValue.toLocaleString()))} per lead</li>
         <li><strong>Total leads:</strong> ${analysis.totalLeads} (${analysis.bookedMeetings} booked, ${analysis.stalledLeads} stalled, ${analysis.lostLeads} lost)</li>
       </ul>
       <h3>Leads by Stage</h3>
       <ul>
         ${analysis.stageDropoff.map((s) => 
           `<li>${e(s.stage)}: ${s.count} leads (${(s.percentOfTotal * 100).toFixed(1)}%)</li>`
         ).join("")}
       </ul>
       ${analysis.bySource.length > 1 ? `<h3>Conversion by Lead Source</h3>
       <ul>
         ${analysis.bySource.map((s) => 
           `<li>${e(s.label)}: ${s.conversionRate}% (${s.total} leads, ${s.booked} booked)</li>`
         ).join("")}
       </ul>` : ""}`
    : "";

  const measureBlock = `${analysisMetricsBlock}${
    g.measureBaseline
      ? `<ul>${g.measureBaseline.currentStateMetrics.map((m) => `<li>${e(m)}</li>`).join("")}</ul>
         <p><strong>Performance gap:</strong> ${e(g.measureBaseline.performanceGap)}</p>
         <p><strong>Industry context:</strong> ${e(g.measureBaseline.industryContext)}</p>
         <p><strong>Priority metric:</strong> ${e(g.measureBaseline.priorityMetric)}</p>
         ${benchmarksBlock}`
      : ""
  }`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${e(brief.workflowName)}: DMAIC Analysis</title>
  <style>
    @page { size: Letter; margin: 0.75in; }
    @media print {
      .section { page-break-before: always; }
      .section.first { page-break-before: avoid; }
      a { color: #0066cc; text-decoration: none; }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1a1a1a;
      line-height: 1.55;
      max-width: 7in;
      margin: 0 auto;
      padding: 0.5in 0;
      font-size: 11pt;
    }
    .cover { text-align: left; margin-bottom: 1.5in; }
    .cover h1 { font-size: 28pt; margin: 0 0 8pt; line-height: 1.15; }
    .cover .meta { color: #666; font-size: 11pt; }
    h1 { font-size: 18pt; color: #c45c2e; margin: 0 0 6pt; border-bottom: 2px solid #e8d5cc; padding-bottom: 6pt; }
    h2 { font-size: 13pt; margin: 18pt 0 6pt; }
    h3 { font-size: 11pt; margin: 12pt 0 4pt; }
    p { margin: 0 0 8pt; }
    ul { margin: 4pt 0 8pt; padding-left: 20pt; }
    li { margin-bottom: 3pt; }
    .section { margin-bottom: 24pt; }
    .summary { background: #fff7f3; border: 1px solid #f0d8c8; border-radius: 6pt; padding: 14pt 18pt; }
    .summary .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10pt; margin-top: 10pt; }
    .summary .label { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
    .alert { padding: 6pt 10pt; border-radius: 4pt; margin-bottom: 6pt; font-size: 10pt; }
    .alert.warning { background: #fff4e8; border-left: 3px solid #cc6600; }
    .alert.critical { background: #ffeaea; border-left: 3px solid #cc0000; }
    .alert .sev { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .benchmarks { font-size: 10pt; }
    .benchmarks .metric { color: #555; }
    .footer { margin-top: 36pt; text-align: center; color: #aaa; font-size: 9pt; }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${e(brief.workflowName)}: DMAIC Analysis</h1>
    <div class="meta">${e(brief.businessName || "Custom case")} · ${date}</div>
  </div>

  <div class="section first summary">
    <h1>Executive Summary</h1>
    <p>${e(g.executiveSummary.headlineFinding)}</p>
    <div class="grid">
      <div><div class="label">Business impact</div>${e(g.executiveSummary.whyItMatters)}</div>
      <div><div class="label">Primary cause</div>${e(g.executiveSummary.primaryCause)}</div>
      <div><div class="label">First action</div>${e(g.executiveSummary.recommendedAction)}</div>
      <div><div class="label">Monitoring</div>${e(g.executiveSummary.monitoringPlan)}</div>
    </div>
  </div>

  <div class="section">
    <h1>Define: Problem Definition</h1>
    <p><strong>Workflow:</strong> ${e(g.problemDefinition.workflow)}</p>
    <p><strong>Business problem:</strong> ${e(g.problemDefinition.businessProblem)}</p>
    <p><strong>Affected group:</strong> ${e(g.problemDefinition.affectedGroup)}</p>
    <p><strong>Success metric:</strong> ${e(g.problemDefinition.successMetric)}</p>
    <p><strong>Scope:</strong> ${e(g.problemDefinition.scope)}</p>
  </div>

  <div class="section">
    <h1>Measure: Current State &amp; KPIs</h1>
    ${measureBlock}
  </div>

  <div class="section">
    <h1>Analyze: Root-Cause Analysis</h1>
    <p>${e(g.rootCauseAnalysis.topLeakagePoint)}</p>
    <h3>Ranked root causes</h3>
    ${g.rootCauseAnalysis.rankedCauses.map((c) =>
      `<p><strong>${c.rank}. ${e(c.factor)}:</strong> ${e(c.finding)}</p>`
    ).join("")}
    <p><strong>Key comparison:</strong> ${e(g.rootCauseAnalysis.supportingComparison)}</p>
    <p><strong>Segment insight:</strong> ${e(g.rootCauseAnalysis.segmentInsight)}</p>
  </div>

  <div class="section">
    <h1>Improve: Recommendation &amp; SOP</h1>
    <p>${e(g.recommendation.firstAction)}</p>
    <p><strong>Why this first:</strong> ${e(g.recommendation.whyThisFirst)}</p>
    <p><strong>Expected result:</strong> ${e(g.recommendation.expectedEffect)}</p>
    <p><strong>Owner:</strong> ${e(g.recommendation.owner)}</p>
    <h2>SOP: ${e(g.workflowSOP.title)}</h2>
    <p><em>${e(g.workflowSOP.objective)}</em></p>
    <ul>${g.workflowSOP.bullets.map((b) => `<li>${e(b)}</li>`).join("")}</ul>
    <p><strong>Escalation:</strong> ${e(g.workflowSOP.escalation)}</p>
  </div>

  <div class="section">
    <h1>Control: Metrics, Alerts, Monitoring</h1>
    <h3>Key performance indicators</h3>
    <ul>
      <li>${e(g.controlDashboard.primaryMetricLabel)}</li>
      <li>${e(g.controlDashboard.secondaryMetricLabel)}</li>
      <li>${e(g.controlDashboard.tertiaryMetricLabel)}</li>
    </ul>
    <p><strong>Watch closely:</strong> ${e(g.controlDashboard.segmentNeedingAttention)}</p>
    <h3>Alert &amp; escalation rules</h3>
    ${g.alertRules.map((r) =>
      `<div class="alert ${r.severity}"><span class="sev">${r.severity}</span>: ${e(r.trigger)}<br/><strong>Action:</strong> ${e(r.action)}</div>`
    ).join("")}
    <h3>Ongoing monitoring</h3>
    <p><strong>Owner:</strong> ${e(g.monitoringReport.owner)}</p>
    <p><strong>Metrics:</strong> ${e(g.monitoringReport.metrics)}</p>
    <p><strong>Thresholds:</strong> ${e(g.monitoringReport.thresholds)}</p>
    <p><strong>If metrics drift:</strong> ${e(g.monitoringReport.responsePlan)}</p>
  </div>

  <div class="footer">Generated by OpsAdvisor · Claude Opus 4.7 · ${date}</div>
</body>
</html>`;
}

function buildPlainTextReport(
  brief: IntakeBrief,
  g: GeneratedOutputPayload,
  analysis?: PipelineAnalysis
): string {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const sep = "\n" + "─".repeat(60) + "\n";
  const lines: string[] = [];

  lines.push(`${brief.workflowName.toUpperCase()}: DMAIC ANALYSIS`);
  lines.push(`${brief.businessName}  ·  ${date}`);
  lines.push(sep);

  lines.push(`EXECUTIVE SUMMARY`);
  lines.push(g.executiveSummary.headlineFinding);
  lines.push(``);
  lines.push(`Business impact:   ${g.executiveSummary.whyItMatters}`);
  lines.push(`Primary cause:     ${g.executiveSummary.primaryCause}`);
  lines.push(`First action:      ${g.executiveSummary.recommendedAction}`);
  lines.push(`Monitoring:        ${g.executiveSummary.monitoringPlan}`);
  lines.push(sep);

  lines.push(`DEFINE: PROBLEM DEFINITION`);
  lines.push(`Workflow:        ${g.problemDefinition.workflow}`);
  lines.push(`Business problem: ${g.problemDefinition.businessProblem}`);
  lines.push(`Affected group:   ${g.problemDefinition.affectedGroup}`);
  lines.push(`Success metric:   ${g.problemDefinition.successMetric}`);
  lines.push(`Scope:            ${g.problemDefinition.scope}`);
  lines.push(sep);

  lines.push(`MEASURE: CURRENT STATE & KPIs`);
  if (g.measureBaseline) {
    g.measureBaseline.currentStateMetrics.forEach((m) => lines.push(`• ${m}`));
    lines.push(``);
    lines.push(`Performance gap:  ${g.measureBaseline.performanceGap}`);
    lines.push(`Industry context: ${g.measureBaseline.industryContext}`);
    lines.push(`Priority metric:  ${g.measureBaseline.priorityMetric}`);
    if (g.measureBaseline.benchmarkSources && g.measureBaseline.benchmarkSources.length > 0) {
      lines.push(``);
      lines.push(`Benchmark sources${g.measureBaseline.benchmarkCategory ? `: ${g.measureBaseline.benchmarkCategory}` : ""}:`);
      g.measureBaseline.benchmarkSources.forEach((b) => {
        lines.push(`  • ${b.metric}: ${b.figure}`);
        lines.push(`    ${b.source} (${b.year}). ${b.url}`);
      });
    }
  }
  lines.push(sep);

  lines.push(`ANALYZE: ROOT-CAUSE ANALYSIS`);
  lines.push(g.rootCauseAnalysis.topLeakagePoint);
  lines.push(``);
  g.rootCauseAnalysis.rankedCauses.forEach((c) => {
    lines.push(`${c.rank}. ${c.factor}`);
    lines.push(`   ${c.finding}`);
    lines.push(``);
  });
  lines.push(`Key comparison:  ${g.rootCauseAnalysis.supportingComparison}`);
  lines.push(`Segment insight: ${g.rootCauseAnalysis.segmentInsight}`);
  lines.push(sep);

  lines.push(`IMPROVE: RECOMMENDATION & SOP`);
  lines.push(g.recommendation.firstAction);
  lines.push(``);
  lines.push(`Why this first:  ${g.recommendation.whyThisFirst}`);
  lines.push(`Expected result: ${g.recommendation.expectedEffect}`);
  lines.push(`Owner:           ${g.recommendation.owner}`);
  lines.push(``);
  lines.push(`SOP: ${g.workflowSOP.title}`);
  lines.push(g.workflowSOP.objective);
  lines.push(``);
  g.workflowSOP.bullets.forEach((b) => lines.push(`• ${b}`));
  lines.push(``);
  lines.push(`Escalation: ${g.workflowSOP.escalation}`);
  lines.push(sep);

  lines.push(`CONTROL: METRICS, ALERTS, MONITORING`);
  lines.push(`Primary KPI:   ${g.controlDashboard.primaryMetricLabel}`);
  lines.push(`Secondary KPI: ${g.controlDashboard.secondaryMetricLabel}`);
  lines.push(`Tertiary KPI:  ${g.controlDashboard.tertiaryMetricLabel}`);
  lines.push(`Watch closely: ${g.controlDashboard.segmentNeedingAttention}`);
  lines.push(``);
  lines.push(`Alert & escalation rules:`);
  g.alertRules.forEach((r) => {
    lines.push(`[${r.severity.toUpperCase()}] ${r.trigger}`);
    lines.push(`  → ${r.action}`);
  });
  lines.push(``);
  lines.push(`Ongoing monitoring:`);
  lines.push(`  Owner:      ${g.monitoringReport.owner}`);
  lines.push(`  Metrics:    ${g.monitoringReport.metrics}`);
  lines.push(`  Thresholds: ${g.monitoringReport.thresholds}`);
  lines.push(`  If metrics drift: ${g.monitoringReport.responsePlan}`);
  lines.push(``);
  lines.push(`Generated by OpsAdvisor · Claude Opus 4.7 · ${date}`);

  return lines.join("\n");
}
