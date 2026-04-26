import Anthropic from "@anthropic-ai/sdk";
import type { IntakeBrief } from "./intakeBrief";
import type { GeneratedOutputPayload } from "./outputTypes";
import type { FrameOutput, MeasureOutput, AnalyzeOutput, PipelineEvent, PipelineLog } from "./pipelinePhases";
import { selectBenchmarks, formatBenchmarksForPrompt } from "./benchmarks";
import { formatOrgContext } from "./intakeContext";

const MODEL = "claude-opus-4-7";
const SYSTEM_PROMPT =
  "You are a senior process improvement consultant. You work across industries and workflow types. Output ONLY valid JSON , no markdown, no prose, no explanation.";

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

async function callClaude(client: Anthropic, prompt: string): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

// ─── Phase 1: Frame ──────────────────────────────────────────────────────────

function buildPhase1Prompt(
  brief: IntakeBrief,
  processNote: string,
  rawData: string
): string {
  const orgContext = formatOrgContext(brief);
  return `You are analyzing a broken workflow for a business owner who needs clear, actionable answers.

BUSINESS CONTEXT
Business: ${brief.businessName}
Workflow being analyzed: ${brief.workflowName}
Workflow stages: ${brief.currentStages.join(" -> ")}
${orgContext ? `\n${orgContext}\n` : ""}
OWNER'S SITUATION
What they're struggling with: ${brief.painPoint}
What success looks like to them: ${brief.successMetric}
Their biggest day-to-day frustration: ${brief.biggestFrustration}
Where they suspect the problem is: ${brief.suspectedStage}
Key constraint or SLA: ${brief.slaText}
How a qualified work item is defined: ${brief.qualifiedLeadDefinition}

PROCESS DOCUMENTATION
${processNote.trim() || "(No process documentation provided , work from the intake brief alone.)"}
${rawData.trim() ? `\nOPERATIONAL DATA / SUPPORTING CONTEXT\n${rawData.trim()}` : ""}

TASK: Come in cold. Establish precisely what this workflow is designed to do versus what is apparently happening. Read the owner's frustrations carefully , they often reveal more than the explicit problem statement. Surface confirmed patterns and anything the owner likely cannot see from inside the process.

Output this exact JSON:
{
  "problemStatement": "2-3 sentences. What the workflow is supposed to accomplish vs what is actually happening. Use specific details from the brief and any provided context.",
  "successDefinition": "1-2 sentences. What a fixed version of this workflow looks like in measurable terms, tied to the owner's stated success metric.",
  "hypotheses": [
    "The owner's primary hypothesis restated precisely",
    "Any additional hypothesis implied by their frustration description"
  ],
  "confirmedPatterns": [
    "Pattern confirmed by the process note or context with specific reference",
    "Second confirmed pattern if present"
  ],
  "unexpectedFindings": [
    "Something the process note or context reveals that the owner did not mention and likely cannot see",
    "Second unexpected finding if present"
  ],
  "bottomLine": "1 sentence. The single most important thing this intake reveals about where the problem actually lives."
}`;
}

// ─── Phase 2: Measure ────────────────────────────────────────────────────────

function buildPhase2Prompt(
  brief: IntakeBrief,
  frame: FrameOutput
): string {
  const benchmarkCategory = selectBenchmarks(brief);
  const benchmarkBlock = formatBenchmarksForPrompt(benchmarkCategory);
  const orgContext = formatOrgContext(brief);

  return `PHASE 1 OUTPUT (framing)
${JSON.stringify(frame, null, 2)}

${benchmarkBlock}

OWNER CONTEXT
Business: ${brief.businessName}
Workflow: ${brief.workflowName}
Stages: ${brief.currentStages.join(" -> ")}
Success metric: ${brief.successMetric}
SLA constraint: ${brief.slaText}
${orgContext ? `\n${orgContext}` : ""}

TASK: Given the problem statement from Phase 1, now establish WHAT the current state is and HOW FAR it is from the owner's stated success metric. You have industry benchmarks above , use them to contextualize this team's performance. Be credible. Quote the benchmarks exactly. Do NOT speculate or invent metrics.

Output ONLY this JSON (no markdown, no explanation):
{
  "metric1": "Name of first KPI and its current value",
  "metric2": "Name of second KPI and its current value",
  "metric3": "Name of third KPI and its current value",
  "performanceGap": "Specific gap between current and desired state",
  "industryContext": "How this compares to industry benchmarks with specific cited figures",
  "priorityMetric": "The one metric that if improved would achieve the success goal",
  "benchmarkCategory": "${benchmarkCategory.label}",
  "benchmarkSummary": "Key insight from the relevant benchmark",
  "baseline": "What is actually happening operationally that explains this performance"
}`;
}

// ─── Phase 3: Analyze ────────────────────────────────────────────────────────

function buildPhase3Prompt(
  brief: IntakeBrief,
  frame: FrameOutput,
  measure: MeasureOutput,
  processNote: string
): string {
  const orgContext = formatOrgContext(brief);
  return `PHASE 1 OUTPUT (framing)
${JSON.stringify(frame)}

PHASE 2 OUTPUT (baseline measurement)
${JSON.stringify(measure)}

WORKFLOW CONTEXT
Business: ${brief.businessName}
Workflow: ${brief.workflowName}
Stages: ${brief.currentStages.join(" -> ")}
Suspected problem area: ${brief.suspectedStage}
Key constraint: ${brief.slaText}
Biggest frustration: ${brief.biggestFrustration}
${orgContext ? `\n${orgContext}\n` : ""}
${processNote.trim() ? `\nPROCESS DOCUMENTATION\n${processNote.trim()}` : ""}

TASK: Given the problem framing (Phase 1) and the measured performance gap (Phase 2), now diagnose WHY that gap exists. Identify the specific mechanisms , behavioral, structural, or systemic , that cause this workflow to fail at the measured level. Think carefully about how the stages interact, where handoffs break down, and what invisible pressures on the people in the process cause the performance shortfall you measured. Explain how these causes interact and amplify each other. Ground your analysis in the performance gap from Phase 2.

Output this exact JSON:
{
  "rootCauses": [
    {
      "factor": "Name of the cause , a tight, specific phrase",
      "mechanism": "The causal chain. Explain WHY this specific failure mode leads to the outcome the owner is experiencing, not just that it does. Be concrete about what happens at each step.",
      "evidence": "What in the process documentation, context, or the owner's own description directly confirms this mechanism is real.",
      "interaction": "How this cause interacts with or amplifies the other causes , where they compound each other."
    },
    {
      "factor": "...",
      "mechanism": "...",
      "evidence": "...",
      "interaction": "..."
    },
    {
      "factor": "...",
      "mechanism": "...",
      "evidence": "...",
      "interaction": "..."
    }
  ],
  "leakageNarrative": "3-5 sentences. Tell the story of how a work item enters this workflow and where and why it silently fails, stalls, or degrades. Be specific about the behavioral and structural failures at each stage. Make it visceral , this is the story the owner needs to hear.",
  "criticalInsight": "1 sentence. The single deepest insight from this analysis , the thing that reframes how the owner should think about the problem. Not obvious from the surface description."
}`;
}

// ─── Phase 4: Synthesize (Improve + Control) ────────────────────────────────

function buildPhase4Prompt(
  brief: IntakeBrief,
  frame: FrameOutput,
  measure: MeasureOutput,
  analyze: AnalyzeOutput
): string {
  const stages = brief.currentStages.join(" -> ");
  const benchmarkCategory = selectBenchmarks(brief);
  const benchmarkBlock = formatBenchmarksForPrompt(benchmarkCategory);
  const orgContext = formatOrgContext(brief);

  // Build a programmatic JSON template so the prompt contains only valid JSON
  // (no embedded ${} template strings) which prevents model confusion.
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
      moneyAtRisk: brief.volumePerMonth && brief.valuePerItem
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

  return `You are a RevOps expert. Generate a full analysis report grounded in the phase outputs below.

${benchmarkBlock}
${orgContext ? `\n${orgContext}\n` : ""}
PHASE 1 OUTPUT (framing)
${JSON.stringify(frame)}

PHASE 2 OUTPUT (baseline measurement)
${JSON.stringify(measure)}

PHASE 3 OUTPUT (root cause analysis)
${JSON.stringify(analyze)}

OWNER GOALS
Business: ${brief.businessName}
Workflow: ${brief.workflowName}
Stages: ${stages}
Pain point: ${brief.painPoint}
Success metric: ${brief.successMetric}
Key constraint: ${brief.slaText}
Biggest frustration: ${brief.biggestFrustration}

RULES:
- Every value must come from the phase outputs above. No generic advice.
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

// ─── Phase 4 fallback ────────────────────────────────────────────────────────

function buildPhase4Fallback(
  brief: IntakeBrief,
  frame: FrameOutput,
  measure: MeasureOutput,
  analyze: AnalyzeOutput
): GeneratedOutputPayload {
  const benchmarkCategory = selectBenchmarks(brief);
  const stages = brief.currentStages.join(" -> ");
  const causes = analyze.rootCauses ?? [];
  const c1 = causes[0];
  const c2 = causes[1];
  const c3 = causes[2];

  const moneyAtRisk = (() => {
    if (brief.volumePerMonth && brief.valuePerItem) {
      return `Based on ${brief.volumePerMonth} at ${brief.valuePerItem}`;
    }
    return "Significant operational risk";
  })();

  const alertTrigger1 = brief.slaThresholdHours
    ? `${measure.priorityMetric ?? "Key metric"} exceeds ${brief.slaThresholdHours}-hour threshold`
    : `${measure.priorityMetric ?? "Key metric"} misses target for one week`;

  return {
    executiveSummary: {
      headlineFinding: frame.bottomLine,
      whyItMatters: brief.painPoint,
      primaryCause: analyze.criticalInsight,
      recommendedAction: brief.currentTooling
        ? `Add enforcement rules in ${brief.currentTooling} to block items that miss the SLA.`
        : "Add stage-level controls to enforce the SLA.",
      monitoringPlan: `Track ${measure.priorityMetric ?? brief.successMetric} weekly.`,
    },
    problemDefinition: {
      workflow: brief.workflowName,
      businessProblem: frame.problemStatement,
      affectedGroup: brief.suspectedStage || "Process owners and operators",
      successMetric: brief.successMetric,
      scope: `Analysis covers: ${stages}.`,
    },
    rootCauseAnalysis: {
      topLeakagePoint: analyze.leakageNarrative,
      rankedCauses: [
        { rank: 1, factor: c1?.factor ?? "Primary cause", finding: c1?.evidence ?? c1?.mechanism ?? "Confirmed by process review" },
        { rank: 2, factor: c2?.factor ?? "Secondary cause", finding: c2?.evidence ?? c2?.mechanism ?? "Confirmed by process review" },
        { rank: 3, factor: c3?.factor ?? "Tertiary cause", finding: c3?.evidence ?? c3?.mechanism ?? "Confirmed by process review" },
      ],
      supportingComparison: measure.industryContext ?? "Industry benchmarks show significant gap.",
      segmentInsight: analyze.criticalInsight,
    },
    recommendation: {
      firstAction: brief.currentTooling
        ? `In ${brief.currentTooling}, add a rule that blocks progression past ${brief.suspectedStage || "the bottleneck stage"} without a logged owner and timestamp.`
        : `Add a stage checkpoint at ${brief.suspectedStage || "the highest-risk stage"} that enforces ${brief.slaText}.`,
      whyThisFirst: analyze.criticalInsight,
      expectedEffect: `Move ${measure.priorityMetric ?? brief.successMetric} toward target within one quarter.`,
      owner: "Process owner for this workflow",
    },
    workflowSOP: {
      title: `${brief.workflowName} Standard Operating Procedure`,
      objective: brief.successMetric,
      bullets: [
        `Confirm entry criteria before accepting a work item: ${brief.qualifiedLeadDefinition}.`,
        `Assign a named owner at every stage: ${stages}.`,
        `Enforce the SLA: ${brief.slaText}.`,
        "Require a verification check before any stage hand-off.",
        brief.priorAttempts
          ? `Address known failure mode: ${brief.priorAttempts.slice(0, 120)}.`
          : "Review exceptions weekly and update the SOP based on findings.",
      ],
      escalation: brief.slaThresholdHours
        ? `If any item exceeds ${brief.slaThresholdHours} hours without resolution, escalate to the process owner immediately.`
        : `If the SLA is at risk, escalate to the process owner within 24 hours.`,
      owner: "Process owner for this workflow",
    },
    monitoringReport: {
      issue: brief.painPoint,
      fix: "Stage-level controls and weekly exception review.",
      metrics: [measure.metric1, measure.metric2, measure.metric3].filter(Boolean).join("; ") || brief.successMetric,
      thresholds: brief.slaText,
      owner: "Operations lead",
      responsePlan: "Run a weekly review, triage breaches within 48 hours, and adjust controls within two weeks if metrics drift.",
    },
    controlDashboard: {
      primaryMetricLabel: measure.metric1 ?? brief.successMetric,
      secondaryMetricLabel: measure.metric2 ?? "Response time vs SLA",
      tertiaryMetricLabel: measure.metric3 ?? "Stalled item rate",
      segmentNeedingAttention: brief.suspectedStage || "Highest-risk stage in the workflow",
    },
    alertRules: [
      { trigger: alertTrigger1, action: "Notify process owner and review exceptions", severity: "warning" },
      { trigger: `SLA breached: ${brief.slaText.slice(0, 80)}`, action: "Escalate immediately to operations lead", severity: "critical" },
      { trigger: "Stage hand-off attempted without verified owner", action: "Block progression and require manual sign-off", severity: "critical" },
      { trigger: "Stalled items exceed expected backlog threshold", action: "Reassign workload and add capacity this week", severity: "warning" },
      { trigger: "Quality check failed on a completed stage", action: "Route to specialist and log root cause", severity: "warning" },
    ],
    measureBaseline: {
      currentStateMetrics: [measure.metric1, measure.metric2, measure.metric3].filter(Boolean),
      performanceGap: measure.performanceGap,
      industryContext: measure.industryContext,
      priorityMetric: measure.priorityMetric,
      benchmarkCategory: benchmarkCategory.label,
    },
    ownerBrief: {
      problem: frame.bottomLine,
      moneyAtRisk,
      actions: [
        {
          action: brief.currentTooling
            ? `Add enforcement rule in ${brief.currentTooling} for ${brief.suspectedStage || "the bottleneck stage"}.`
            : `Add a stage checkpoint at ${brief.suspectedStage || "the bottleneck stage"}.`,
          when: "this week",
          expectedLift: `Reduce visible failures in ${brief.workflowName}.`,
        },
        {
          action: "Run a weekly exception review with the process owner.",
          when: "this month",
          expectedLift: "Surface and close gaps before they reach an external check.",
        },
        {
          action: brief.slaThresholdHours
            ? `Automate an alert when items exceed ${brief.slaThresholdHours} hours.`
            : "Automate reminders and SLA tracking.",
          when: "this quarter",
          expectedLift: `Achieve ${brief.successMetric}.`,
        },
      ],
      nextDecision: `Schedule a 30-minute working session with the ${brief.suspectedStage || "process"} owner Monday to assign the first checkpoint.`,
    },
  };
}

// ─── Pipeline runner ─────────────────────────────────────────────────────────

export async function runGeneralPipeline(
  brief: IntakeBrief,
  processNote: string,
  rawData: string,
  onEvent: (event: PipelineEvent) => void
): Promise<void> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const pipelineLog: PipelineLog = [];

  // Phase 1: Define
  onEvent({
    event: "phase",
    phase: "frame",
    status: "running",
    label: "Define: Clarifying the problem and success criteria",
  });

  const phase1Raw = await callClaude(
    client,
    buildPhase1Prompt(brief, processNote, rawData)
  );
  const frame = JSON.parse(extractJSON(phase1Raw)) as FrameOutput;

  onEvent({ event: "phase", phase: "frame", status: "done", summary: frame.bottomLine });
  pipelineLog.push({ phase: "frame", label: "Define: Clarifying the problem and success criteria", summary: frame.bottomLine });

  // Phase 2: Measure
  onEvent({
    event: "phase",
    phase: "measure",
    status: "running",
    label: "Measure: Quantifying current state and performance gap",
  });

  const phase2Raw = await callClaude(
    client,
    buildPhase2Prompt(brief, frame)
  );
  const measure = JSON.parse(extractJSON(phase2Raw)) as MeasureOutput;

  onEvent({ event: "phase", phase: "measure", status: "done", summary: measure.performanceGap });
  pipelineLog.push({ phase: "measure", label: "Measure: Quantifying current state and performance gap", summary: measure.performanceGap });

  // Phase 3: Analyze
  onEvent({
    event: "phase",
    phase: "analyze",
    status: "running",
    label: "Analyze: Diagnosing failure mechanisms and root causes",
  });

  const phase3Raw = await callClaude(
    client,
    buildPhase3Prompt(brief, frame, measure, processNote)
  );
  const analyze = JSON.parse(extractJSON(phase3Raw)) as AnalyzeOutput;

  onEvent({ event: "phase", phase: "analyze", status: "done", summary: analyze.criticalInsight });
  pipelineLog.push({ phase: "analyze", label: "Analyze: Diagnosing failure mechanisms and root causes", summary: analyze.criticalInsight });

  // Phase 4: Improve & Control
  onEvent({
    event: "phase",
    phase: "synthesize",
    status: "running",
    label: "Improve & Control: Building recommendations and control system",
  });

  const phase4Raw = await callClaude(client, buildPhase4Prompt(brief, frame, measure, analyze));
  let generated: GeneratedOutputPayload;
  let usedFallback: boolean = false;
  try {
    generated = JSON.parse(extractJSON(phase4Raw)) as GeneratedOutputPayload;
  } catch (e) {
    console.warn("Phase 4 JSON parsing failed, using fallback:", e);
    generated = buildPhase4Fallback(brief, frame, measure, analyze);
    usedFallback = true;
  }

  onEvent({ event: "phase", phase: "synthesize", status: "done", summary: "Report generated" });
  pipelineLog.push({ phase: "synthesize", label: "Improve & Control: Building recommendations and control system", summary: "Report generated" });

  onEvent({
    event: "complete",
    analysis: undefined,
    generated,
    pipelineLog,
    usedFallback,
  });
}
