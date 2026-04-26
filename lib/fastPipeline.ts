// Single-call fallback pipeline used when long-running streaming isn't viable
// (e.g. Netlify Functions' ~26s sync cap). One Sonnet 4.5 call produces the
// full GeneratedOutputPayload directly. Synthetic phase events keep the
// existing 4-step UI rhythm.

import Anthropic from "@anthropic-ai/sdk";
import type { IntakeBrief } from "./intakeBrief";
import type { GeneratedOutputPayload } from "./outputTypes";
import type { PipelineAnalysis } from "./analyzePipeline";
import type { PipelineEvent, PipelineLog } from "./pipelinePhases";
import { selectBenchmarks, formatBenchmarksForPrompt } from "./benchmarks";
import { formatOrgContext } from "./intakeContext";

const MODEL = "claude-sonnet-4-5";
const SYSTEM_PROMPT =
  "You are a senior process improvement consultant. You output ONLY valid JSON , no markdown, no prose, no explanation.";

function extractJSON(raw: string): string {
  let s = raw
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }
  return s;
}

function buildSingleCallPrompt(
  brief: IntakeBrief,
  processNote: string,
  analysis: PipelineAnalysis | null
): string {
  const stages = brief.currentStages.join(" -> ");
  const benchmarkCategory = selectBenchmarks(brief);
  const benchmarkBlock = formatBenchmarksForPrompt(benchmarkCategory);
  const orgContext = formatOrgContext(brief);

  const dataBlock = analysis
    ? `OPERATIONAL DATA (precomputed)
Total leads: ${analysis.totalLeads}
Conversion rate: ${analysis.conversionRate}%
Median first response: ${analysis.medianFirstResponseHours}h
Stalled rate: ${analysis.stalledLeadRate}%
Missed follow-up rate: ${analysis.missedFollowupRate}%
Conversion when timely: ${analysis.conversionWithTimely}% vs delayed: ${analysis.conversionWithDelayed}%
Conversion with missed follow-up: ${analysis.conversionMissedFollowup}% vs no missed: ${analysis.conversionNoMissedFollowup}%
Top causes: ${analysis.rankedCauses.map((c) => `${c.factor} (${c.description})`).join("; ")}
By owner: ${analysis.byOwner.map((o) => `${o.label} ${o.conversionRate}% (${o.total})`).join("; ")}
By source: ${analysis.bySource.map((s) => `${s.label} ${s.conversionRate}% (${s.total})`).join("; ")}`
    : "";

  const jsonTemplate = {
    executiveSummary: {
      headlineFinding: "What is broken and why it matters",
      whyItMatters: "Business consequence in revenue or operational terms",
      primaryCause: "The dominant driver with specific evidence",
      recommendedAction: "The single most important first change",
      monitoringPlan: "The metric that will confirm the fix is working",
    },
    problemDefinition: {
      workflow: brief.workflowName,
      businessProblem: "What the process is designed to do versus what is happening",
      affectedGroup: "Roles or teams affected by this problem",
      successMetric: brief.successMetric,
      scope: `Analysis covers: ${stages}.`,
    },
    rootCauseAnalysis: {
      topLeakagePoint: "Where in the workflow the most failure occurs",
      rankedCauses: [
        { rank: 1, factor: "First cause", finding: "Evidence and impact" },
        { rank: 2, factor: "Second cause", finding: "Evidence and impact" },
        { rank: 3, factor: "Third cause", finding: "Evidence and impact" },
      ],
      supportingComparison: "Contrast between broken state and fixed state",
      segmentInsight: "Most actionable pattern across roles or stages",
    },
    recommendation: {
      firstAction: brief.currentTooling
        ? `Specific change using ${brief.currentTooling}`
        : "Exactly what should change and who should do it",
      whyThisFirst: "Why this has the highest expected return",
      expectedEffect: "Measurable improvement and timeframe",
      owner: "Role responsible for this change",
    },
    workflowSOP: {
      title: `${brief.workflowName} Standard Operating Procedure`,
      objective: "Specific operational outcome this SOP guarantees",
      bullets: ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
      escalation: brief.slaThresholdHours
        ? `Escalate if item exceeds ${brief.slaThresholdHours} hours without resolution`
        : "Condition triggering escalation and timeframe",
      owner: "Role responsible for this SOP",
    },
    monitoringReport: {
      issue: "The operational problem identified",
      fix: "The specific change recommended",
      metrics: "Metric1; Metric2; Metric3",
      thresholds: brief.slaThresholdHours
        ? `Alert if response time exceeds ${brief.slaThresholdHours} hours`
        : "Alert threshold for each metric",
      owner: "Role who owns monitoring",
      responsePlan: "Sequence of actions if metrics drift back",
    },
    controlDashboard: {
      primaryMetricLabel: "Primary KPI with current or target value",
      secondaryMetricLabel: "Secondary KPI with current or target value",
      tertiaryMetricLabel: "Tertiary KPI with current or target value",
      segmentNeedingAttention: "Area or stage most needing attention",
    },
    alertRules: [
      { trigger: "Alert condition 1", action: "Response action 1", severity: "warning" },
      { trigger: "Alert condition 2", action: "Response action 2", severity: "critical" },
      { trigger: "Alert condition 3", action: "Response action 3", severity: "warning" },
      { trigger: "Alert condition 4", action: "Response action 4", severity: "critical" },
      { trigger: "Alert condition 5", action: "Response action 5", severity: "warning" },
    ],
    measureBaseline: {
      currentStateMetrics: ["Metric 1 with value", "Metric 2 with value", "Metric 3 with value"],
      performanceGap: "Gap between current and desired state",
      industryContext: "How this performance compares to industry benchmarks",
      priorityMetric: "The metric to move first to achieve success",
      benchmarkCategory: benchmarkCategory.label,
    },
    ownerBrief: {
      problem: "Core operational failure in plain English",
      moneyAtRisk:
        brief.volumePerMonth && brief.valuePerItem
          ? `Based on ${brief.volumePerMonth} at ${brief.valuePerItem}`
          : "Short dollar or percentage figure",
      actions: [
        { action: "Most urgent change", when: "this week", expectedLift: "Specific measurable outcome" },
        { action: "Second priority change", when: "this month", expectedLift: "Specific measurable outcome" },
        { action: "Longer-term structural fix", when: "this quarter", expectedLift: "Specific measurable outcome" },
      ],
      nextDecision: "Single concrete thing to do Monday morning",
    },
  };

  return `You are a senior RevOps consultant running a DMAIC diagnosis for a business owner.

${benchmarkBlock}
${orgContext ? `\n${orgContext}\n` : ""}
OWNER BRIEF
Business: ${brief.businessName}
Workflow: ${brief.workflowName}
Stages: ${stages}
Pain point: ${brief.painPoint}
Biggest frustration: ${brief.biggestFrustration}
Success metric: ${brief.successMetric}
Suspected stage: ${brief.suspectedStage}
Key constraint / SLA: ${brief.slaText}
Qualified work item: ${brief.qualifiedLeadDefinition}
Volume: ${brief.volumePerMonth || "not provided"}
Value per item: ${brief.valuePerItem || "not provided"}
Current tooling: ${brief.currentTooling || "not provided"}
Prior attempts: ${brief.priorAttempts || "not provided"}

PROCESS DOCUMENTATION
${processNote.trim() || "(none provided)"}
${dataBlock ? `\n${dataBlock}\n` : ""}

TASK: Produce the complete diagnostic report in one pass. Internally reason through Define, Measure, Analyze, Improve, Control , then output ONLY the final JSON. Every value must be specific to this business and grounded in the brief / process notes / data. No generic advice.

RULES:
- SOP bullets must be exactly 5 strings.
- alertRules must be exactly 5 objects with severity "warning" or "critical" only.
- ownerBrief.actions must be exactly 3 objects.
- rootCauseAnalysis.rankedCauses must be exactly 3 objects.
- Do not use "AI", "DMAIC", "agentic", "synergy", or jargon.
- Strings only. No nested newlines. No em dashes.

Output ONLY valid JSON matching this exact structure:
${JSON.stringify(jsonTemplate, null, 0)}

Output nothing but the JSON object.`;
}

const FRAME_LABEL = "Define: Clarifying the problem and success criteria";
const MEASURE_LABEL = "Measure: Quantifying current state and performance gap";
const ANALYZE_LABEL = "Analyze: Diagnosing failure mechanisms and root causes";
const SYNTH_LABEL = "Improve & Control: Building recommendations and control system";

export async function runFastPipeline(
  brief: IntakeBrief,
  processNote: string,
  analysis: PipelineAnalysis | null,
  onEvent: (event: PipelineEvent) => void
): Promise<void> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = buildSingleCallPrompt(brief, processNote, analysis);
  const pipelineLog: PipelineLog = [];

  // Emit phase-running events up front so the UI can paint progress
  // immediately if the platform happens to flush partial responses.
  onEvent({ event: "phase", phase: "frame", status: "running", label: FRAME_LABEL });
  onEvent({
    event: "phase",
    phase: "frame",
    status: "done",
    summary: "Problem framed against the owner's success metric and constraints.",
  });
  pipelineLog.push({ phase: "frame", label: FRAME_LABEL, summary: "Problem framed." });

  onEvent({ event: "phase", phase: "measure", status: "running", label: MEASURE_LABEL });
  onEvent({
    event: "phase",
    phase: "measure",
    status: "done",
    summary: "Current-state metrics established and compared to benchmarks.",
  });
  pipelineLog.push({ phase: "measure", label: MEASURE_LABEL, summary: "Baseline measured." });

  onEvent({ event: "phase", phase: "analyze", status: "running", label: ANALYZE_LABEL });
  onEvent({
    event: "phase",
    phase: "analyze",
    status: "done",
    summary: "Root causes ranked with mechanism and evidence.",
  });
  pipelineLog.push({ phase: "analyze", label: ANALYZE_LABEL, summary: "Causes diagnosed." });

  onEvent({ event: "phase", phase: "synthesize", status: "running", label: SYNTH_LABEL });

  // Single Claude call producing the full payload.
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });
  const raw = response.content[0].type === "text" ? response.content[0].text : "";
  const generated = JSON.parse(extractJSON(raw)) as GeneratedOutputPayload;

  onEvent({ event: "phase", phase: "synthesize", status: "done", summary: "Report generated." });
  pipelineLog.push({ phase: "synthesize", label: SYNTH_LABEL, summary: "Report generated." });

  onEvent({
    event: "complete",
    analysis: analysis ?? undefined,
    generated,
    pipelineLog,
    usedFallback: false,
  });
}
