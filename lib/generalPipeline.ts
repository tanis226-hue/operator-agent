import Anthropic from "@anthropic-ai/sdk";
import type { IntakeBrief } from "./intakeBrief";
import type { GeneratedOutputPayload } from "./outputTypes";
import type { FrameOutput, AnalyzeOutput, PipelineEvent, PipelineLog } from "./pipelinePhases";

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

// ─── Phase 2: Analyze ────────────────────────────────────────────────────────

function buildPhase2Prompt(
  brief: IntakeBrief,
  frame: FrameOutput,
  processNote: string
): string {
  return `PHASE 1 OUTPUT (framing)
${JSON.stringify(frame, null, 2)}

WORKFLOW CONTEXT
Business: ${brief.businessName}
Workflow: ${brief.workflowName}
Stages: ${brief.currentStages.join(" → ")}
Suspected problem area: ${brief.suspectedStage}
Key constraint: ${brief.slaConstraint}
Biggest frustration: ${brief.biggestFrustration}
${processNote.trim() ? `\nPROCESS DOCUMENTATION\n${processNote.trim()}` : ""}

TASK: Go beyond WHAT is broken to WHY it is broken. Identify the specific mechanisms — behavioral, structural, or systemic — that cause this workflow to fail. Think carefully about how the stages interact, where handoffs break down, and what invisible pressures on the people in the process cause the failures. Explain how these causes interact and amplify each other.

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

// ─── Phase 3: Synthesize ─────────────────────────────────────────────────────

function buildPhase3Prompt(
  brief: IntakeBrief,
  frame: FrameOutput,
  analyze: AnalyzeOutput
): string {
  const stages = brief.currentStages.join(" → ");

  return `PHASE 1 OUTPUT (framing)
${JSON.stringify(frame, null, 2)}

PHASE 2 OUTPUT (root cause analysis)
${JSON.stringify(analyze, null, 2)}

OWNER GOALS
Business: ${brief.businessName}
Workflow: ${brief.workflowName}
Stages: ${stages}
Pain point: ${brief.painPoint}
Success metric: ${brief.successMetric}
Key constraint: ${brief.slaConstraint}
Biggest frustration: ${brief.biggestFrustration}

TASK: Generate the full user-facing report. Every section must be grounded in the mechanisms discovered in phases 1 and 2. Reference specific findings — not generic advice that could apply to any business. Speak directly to this owner's situation. This report will be read by someone who is frustrated and needs to know exactly what to do next.

RULES:
- SOP bullets must be exactly 5 strings.
- alertRules must be exactly 5 objects, each with severity "warning" or "critical" only.
- Do not use "AI", "DMAIC", "agentic", "synergy", or academic/consultant jargon.
- All text must be in plain, direct English a business owner can act on immediately.
- Metric labels (primaryMetricLabel etc.) should state the KPI name and a specific target or current value.

Output this exact JSON:
{
  "executiveSummary": {
    "headlineFinding": "1-2 sentences. What is broken and why it matters right now. Name the specific mechanism from phase 2.",
    "whyItMatters": "1-2 sentences. Business consequence in revenue, time, customer, or operational terms.",
    "primaryCause": "1-2 sentences. The dominant driver with specific evidence from the analysis.",
    "recommendedAction": "1 sentence. The single most important first change — concrete and assignable.",
    "monitoringPlan": "1 sentence. The specific metric that will confirm the fix is working."
  },
  "problemDefinition": {
    "workflow": "${brief.workflowName}",
    "businessProblem": "75-100 words. What the process is designed to do versus what is actually happening. Name specific stages and roles. Plain English.",
    "affectedGroup": "The specific roles affected by this problem.",
    "successMetric": "${brief.successMetric}",
    "scope": "Analysis covers: ${stages}."
  },
  "rootCauseAnalysis": {
    "topLeakagePoint": "1-2 sentences identifying where in the workflow the most failure is occurring and the specific behavioral pattern driving it.",
    "rankedCauses": [
      { "rank": 1, "factor": "factor name", "finding": "1-2 sentences with specific evidence from the analysis." },
      { "rank": 2, "factor": "factor name", "finding": "1-2 sentences." },
      { "rank": 3, "factor": "factor name", "finding": "1-2 sentences." }
    ],
    "supportingComparison": "1-2 sentences contrasting the current broken state with what the process would look like if the primary cause were fixed.",
    "segmentInsight": "1-2 sentences on the most actionable pattern across roles, teams, or stages."
  },
  "recommendation": {
    "firstAction": "2-3 sentences. Exactly what should change, who does it, and how. Specific enough to assign today.",
    "whyThisFirst": "1-2 sentences. Why this intervention has the highest expected return of all possible changes.",
    "expectedEffect": "1-2 sentences. What measurable improvement should appear, and within what timeframe.",
    "owner": "The specific role responsible for executing this change."
  },
  "workflowSOP": {
    "title": "A specific, actionable title for this SOP — name the workflow and the standard being set.",
    "objective": "1 sentence — the specific operational outcome this rule is designed to guarantee.",
    "bullets": [
      "Rule 1: specific trigger + required action with timeframe",
      "Rule 2: specific trigger + required action with timeframe",
      "Rule 3: specific trigger + required action with timeframe",
      "Rule 4: specific trigger + required action with timeframe",
      "Rule 5: specific trigger + required action with timeframe"
    ],
    "escalation": "1 sentence — the specific condition that triggers escalation, to whom, and within what timeframe.",
    "owner": "The role responsible for enforcing and updating this SOP."
  },
  "monitoringReport": {
    "issue": "1-2 sentences — the operational problem identified and confirmed.",
    "fix": "1-2 sentences — the specific change recommended.",
    "metrics": "The 3 specific metrics to monitor going forward — name each one.",
    "thresholds": "The specific alert threshold for each of the 3 metrics.",
    "owner": "The role who owns ongoing monitoring.",
    "responsePlan": "2-3 sentences — the exact sequence of actions if metrics drift back toward the problem."
  },
  "controlDashboard": {
    "primaryMetricLabel": "Primary KPI: [name] — [current or target value with context]",
    "secondaryMetricLabel": "Secondary KPI: [name] — [current or target value with context]",
    "tertiaryMetricLabel": "Tertiary KPI: [name] — [current or target value with context]",
    "segmentNeedingAttention": "The one specific area, role, or stage that most urgently needs attention based on the analysis."
  },
  "alertRules": [
    { "trigger": "Specific measurable condition that fires this alert", "action": "Exactly what should happen when triggered", "severity": "warning" },
    { "trigger": "Specific measurable condition", "action": "Exactly what should happen", "severity": "critical" },
    { "trigger": "Specific measurable condition", "action": "Exactly what should happen", "severity": "warning" },
    { "trigger": "Specific measurable condition", "action": "Exactly what should happen", "severity": "critical" },
    { "trigger": "Specific measurable condition", "action": "Exactly what should happen", "severity": "warning" }
  ]
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

  // Phase 1: Frame
  onEvent({
    event: "phase",
    phase: "frame",
    status: "running",
    label: "Understanding the workflow and framing the problem",
  });

  const phase1Raw = await callClaude(
    client,
    buildPhase1Prompt(brief, processNote, rawData)
  );
  const frame = JSON.parse(extractJSON(phase1Raw)) as FrameOutput;

  onEvent({ event: "phase", phase: "frame", status: "done", summary: frame.bottomLine });
  pipelineLog.push({ phase: "frame", label: "Understanding the workflow and framing the problem", summary: frame.bottomLine });

  // Phase 2: Analyze
  onEvent({
    event: "phase",
    phase: "analyze",
    status: "running",
    label: "Identifying root causes and failure mechanisms",
  });

  const phase2Raw = await callClaude(
    client,
    buildPhase2Prompt(brief, frame, processNote)
  );
  const analyze = JSON.parse(extractJSON(phase2Raw)) as AnalyzeOutput;

  onEvent({ event: "phase", phase: "analyze", status: "done", summary: analyze.criticalInsight });
  pipelineLog.push({ phase: "analyze", label: "Identifying root causes and failure mechanisms", summary: analyze.criticalInsight });

  // Phase 3: Synthesize
  onEvent({
    event: "phase",
    phase: "synthesize",
    status: "running",
    label: "Building recommendations, SOP, and control plan",
  });

  const phase3Raw = await callClaude(client, buildPhase3Prompt(brief, frame, analyze));
  const generated = JSON.parse(extractJSON(phase3Raw)) as GeneratedOutputPayload;

  onEvent({ event: "phase", phase: "synthesize", status: "done", summary: "Report generated" });
  pipelineLog.push({ phase: "synthesize", label: "Building recommendations, SOP, and control plan", summary: "Report generated" });

  onEvent({
    event: "complete",
    analysis: undefined,
    generated,
    pipelineLog,
    usedFallback: false,
  });
}
