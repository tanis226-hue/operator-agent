import Anthropic from "@anthropic-ai/sdk";
import type { IntakeBrief } from "./intakeBrief";
import type { GeneratedOutputPayload } from "./outputTypes";
import type { FrameOutput, MeasureOutput, AnalyzeOutput, PipelineEvent, PipelineLog } from "./pipelinePhases";
import { selectBenchmarks, formatBenchmarksForPrompt } from "./benchmarks";

const MODEL = "claude-opus-4-7";
const SYSTEM_PROMPT =
  "You are a senior process improvement consultant. You work across industries and workflow types. Output ONLY valid JSON — no markdown, no prose, no explanation.";

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
  return `You are analyzing a broken workflow for a business owner who needs clear, actionable answers.

BUSINESS CONTEXT
Business: ${brief.businessName}
Workflow being analyzed: ${brief.workflowName}
Workflow stages: ${brief.currentStages.join(" → ")}

OWNER'S SITUATION
What they're struggling with: ${brief.painPoint}
What success looks like to them: ${brief.successMetric}
Their biggest day-to-day frustration: ${brief.biggestFrustration}
Where they suspect the problem is: ${brief.suspectedStage}
Key constraint or SLA: ${brief.slaConstraint}
How a qualified work item is defined: ${brief.qualifiedLeadDefinition}

PROCESS DOCUMENTATION
${processNote.trim() || "(No process documentation provided — work from the intake brief alone.)"}
${rawData.trim() ? `\nOPERATIONAL DATA / SUPPORTING CONTEXT\n${rawData.trim()}` : ""}

TASK: Come in cold. Establish precisely what this workflow is designed to do versus what is apparently happening. Read the owner's frustrations carefully — they often reveal more than the explicit problem statement. Surface confirmed patterns and anything the owner likely cannot see from inside the process.

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

  return `PHASE 1 OUTPUT (framing)
${JSON.stringify(frame, null, 2)}

${benchmarkBlock}

OWNER CONTEXT
Business: ${brief.businessName}
Workflow: ${brief.workflowName}
Stages: ${brief.currentStages.join(" → ")}
Success metric: ${brief.successMetric}
SLA constraint: ${brief.slaConstraint}

TASK: Given the problem statement from Phase 1, now establish WHAT the current state is and HOW FAR it is from the owner's stated success metric. You have industry benchmarks above — use them to contextualize this team's performance. Be credible. Quote the benchmarks exactly. Do NOT speculate or invent metrics.

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
  return `PHASE 1 OUTPUT (framing)
${JSON.stringify(frame)}

PHASE 2 OUTPUT (baseline measurement)
${JSON.stringify(measure)}

WORKFLOW CONTEXT
Business: ${brief.businessName}
Workflow: ${brief.workflowName}
Stages: ${brief.currentStages.join(" → ")}
Suspected problem area: ${brief.suspectedStage}
Key constraint: ${brief.slaConstraint}
Biggest frustration: ${brief.biggestFrustration}
${processNote.trim() ? `\nPROCESS DOCUMENTATION\n${processNote.trim()}` : ""}

TASK: Given the problem framing (Phase 1) and the measured performance gap (Phase 2), now diagnose WHY that gap exists. Identify the specific mechanisms — behavioral, structural, or systemic — that cause this workflow to fail at the measured level. Think carefully about how the stages interact, where handoffs break down, and what invisible pressures on the people in the process cause the performance shortfall you measured. Explain how these causes interact and amplify each other. Ground your analysis in the performance gap from Phase 2.

Output this exact JSON:
{
  "rootCauses": [
    {
      "factor": "Name of the cause — a tight, specific phrase",
      "mechanism": "The causal chain. Explain WHY this specific failure mode leads to the outcome the owner is experiencing, not just that it does. Be concrete about what happens at each step.",
      "evidence": "What in the process documentation, context, or the owner's own description directly confirms this mechanism is real.",
      "interaction": "How this cause interacts with or amplifies the other causes — where they compound each other."
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
  "leakageNarrative": "3-5 sentences. Tell the story of how a work item enters this workflow and where and why it silently fails, stalls, or degrades. Be specific about the behavioral and structural failures at each stage. Make it visceral — this is the story the owner needs to hear.",
  "criticalInsight": "1 sentence. The single deepest insight from this analysis — the thing that reframes how the owner should think about the problem. Not obvious from the surface description."
}`;
}

// ─── Phase 4: Synthesize (Improve + Control) ────────────────────────────────

function buildPhase4Prompt(
  brief: IntakeBrief,
  frame: FrameOutput,
  measure: MeasureOutput,
  analyze: AnalyzeOutput
): string {
  const stages = brief.currentStages.join(" → ");
  const benchmarkCategory = selectBenchmarks(brief);
  const benchmarkBlock = formatBenchmarksForPrompt(benchmarkCategory);

  return `${benchmarkBlock}

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
Key constraint: ${brief.slaConstraint}
Biggest frustration: ${brief.biggestFrustration}

TASK: Generate the full user-facing report. Every section must be grounded in the problem framing (Phase 1), measured performance gap (Phase 2), and root causes (Phase 3). Your recommendations in Improve & Control must directly address the ranked causes and move the measured KPIs from Phase 2. Reference specific findings — not generic advice that could apply to any business. Speak directly to this owner's situation. This report will be read by someone who is frustrated and needs to know exactly what to do next.

RULES:
- SOP bullets must be exactly 5 strings.
- alertRules must be exactly 5 objects, each with severity "warning" or "critical" only.
- Do not use "AI", "DMAIC", "agentic", "synergy", or academic/consultant jargon.
- Do not use em dashes (—) anywhere in your output. Use commas, periods, or colons instead.
- All text must be in plain, direct English a business owner can act on immediately.
- Metric labels (primaryMetricLabel etc.) should state the KPI name and a specific target or current value.

Output ONLY this JSON (no markdown, no explanation):
{
  "executiveSummary": {
    "headlineFinding": "What is broken and why it matters",
    "whyItMatters": "Business consequence in revenue or operational terms",
    "primaryCause": "The dominant driver with specific evidence",
    "recommendedAction": "The single most important first change",
    "monitoringPlan": "The metric that will confirm the fix is working"
  },
  "problemDefinition": {
    "workflow": "${brief.workflowName}",
    "businessProblem": "What the process is designed to do versus what is happening",
    "affectedGroup": "Roles or teams affected by this problem",
    "successMetric": "${brief.successMetric}",
    "scope": "Analysis covers: ${stages}."
  },
  "rootCauseAnalysis": {
    "topLeakagePoint": "Where in the workflow the most failure occurs",
    "rankedCauses": [
      {"rank": 1, "factor": "First cause", "finding": "Evidence and impact"},
      {"rank": 2, "factor": "Second cause", "finding": "Evidence and impact"},
      {"rank": 3, "factor": "Third cause", "finding": "Evidence and impact"}
    ],
    "supportingComparison": "Contrast between broken state and fixed state",
    "segmentInsight": "Most actionable pattern across roles or stages"
  },
  "recommendation": {
    "firstAction": "Exactly what should change and who should do it",
    "whyThisFirst": "Why this has the highest expected return",
    "expectedEffect": "Measurable improvement and timeframe",
    "owner": "Role responsible for this change"
  },
  "workflowSOP": {
    "title": "Actionable SOP title naming the workflow",
    "objective": "Specific operational outcome this SOP guarantees",
    "bullets": ["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4", "Bullet 5"],
    "escalation": "Condition triggering escalation and timeframe",
    "owner": "Role responsible for this SOP"
  },
  "monitoringReport": {
    "issue": "The operational problem identified",
    "fix": "The specific change recommended",
    "metrics": "Metric1; Metric2; Metric3",
    "thresholds": "Alert threshold for each metric",
    "owner": "Role who owns monitoring",
    "responsePlan": "Sequence of actions if metrics drift back"
  },
  "controlDashboard": {
    "primaryMetricLabel": "Primary KPI with current or target value",
    "secondaryMetricLabel": "Secondary KPI with current or target value",
    "tertiaryMetricLabel": "Tertiary KPI with current or target value",
    "segmentNeedingAttention": "Area or stage most needing attention"
  },
  "alertRules": [
    {"trigger": "Alert condition 1", "action": "Response action 1", "severity": "warning"},
    {"trigger": "Alert condition 2", "action": "Response action 2", "severity": "critical"},
    {"trigger": "Alert condition 3", "action": "Response action 3", "severity": "warning"},
    {"trigger": "Alert condition 4", "action": "Response action 4", "severity": "critical"},
    {"trigger": "Alert condition 5", "action": "Response action 5", "severity": "warning"}
  ],
  "measureBaseline": {
    "currentStateMetrics": ["Metric 1 with value", "Metric 2 with value", "Metric 3 with value"],
    "performanceGap": "Gap between current and desired state",
    "industryContext": "How this performance compares to industry benchmarks",
    "priorityMetric": "The metric to move first to achieve success",
    "benchmarkCategory": "${benchmarkCategory.label}"
  },
  "ownerBrief": {
    "problem": "1 sentence — the core operational failure in plain English that a non-technical owner can act on. No jargon.",
    "moneyAtRisk": "Short dollar or percentage figure only — e.g. '$180k at risk' or '~35% of pipeline value'. Maximum 8 words. Do not write a sentence or paragraph.",
    "actions": [
      { "action": "Most urgent change — active verb, names specific tool, rule, or role. No more than 15 words.", "when": "this week", "expectedLift": "Specific measurable outcome" },
      { "action": "Second priority change — process adjustment or reporting change.", "when": "this month", "expectedLift": "Specific measurable outcome" },
      { "action": "Longer-term structural fix — routing, coverage, or automation improvement.", "when": "this quarter", "expectedLift": "Specific measurable outcome" }
    ],
    "nextDecision": "1 sentence. The single most concrete thing to do Monday morning. Names the specific tool, person, meeting, or field — not a vague directive."
  }
}`;
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
    label: "Define — Clarifying the problem and success criteria",
  });

  const phase1Raw = await callClaude(
    client,
    buildPhase1Prompt(brief, processNote, rawData)
  );
  const frame = JSON.parse(extractJSON(phase1Raw)) as FrameOutput;

  onEvent({ event: "phase", phase: "frame", status: "done", summary: frame.bottomLine });
  pipelineLog.push({ phase: "frame", label: "Define — Clarifying the problem and success criteria", summary: frame.bottomLine });

  // Phase 2: Measure
  onEvent({
    event: "phase",
    phase: "measure",
    status: "running",
    label: "Measure — Quantifying current state and performance gap",
  });

  const phase2Raw = await callClaude(
    client,
    buildPhase2Prompt(brief, frame)
  );
  const measure = JSON.parse(extractJSON(phase2Raw)) as MeasureOutput;

  onEvent({ event: "phase", phase: "measure", status: "done", summary: measure.performanceGap });
  pipelineLog.push({ phase: "measure", label: "Measure — Quantifying current state and performance gap", summary: measure.performanceGap });

  // Phase 3: Analyze
  onEvent({
    event: "phase",
    phase: "analyze",
    status: "running",
    label: "Analyze — Diagnosing failure mechanisms and root causes",
  });

  const phase3Raw = await callClaude(
    client,
    buildPhase3Prompt(brief, frame, measure, processNote)
  );
  const analyze = JSON.parse(extractJSON(phase3Raw)) as AnalyzeOutput;

  onEvent({ event: "phase", phase: "analyze", status: "done", summary: analyze.criticalInsight });
  pipelineLog.push({ phase: "analyze", label: "Analyze — Diagnosing failure mechanisms and root causes", summary: analyze.criticalInsight });

  // Phase 4: Improve & Control
  onEvent({
    event: "phase",
    phase: "synthesize",
    status: "running",
    label: "Improve & Control — Building recommendations and control system",
  });

  const phase4Raw = await callClaude(client, buildPhase4Prompt(brief, frame, measure, analyze));
  const generated = JSON.parse(extractJSON(phase4Raw)) as GeneratedOutputPayload;

  onEvent({ event: "phase", phase: "synthesize", status: "done", summary: "Report generated" });
  pipelineLog.push({ phase: "synthesize", label: "Improve & Control — Building recommendations and control system", summary: "Report generated" });

  onEvent({
    event: "complete",
    analysis: undefined,
    generated,
    pipelineLog,
    usedFallback: false,
  });
}
