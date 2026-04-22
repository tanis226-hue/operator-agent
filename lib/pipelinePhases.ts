import Anthropic from "@anthropic-ai/sdk";
import type { PipelineAnalysis } from "./analyzePipeline";
import type { IntakeBrief } from "./intakeBrief";
import type { GeneratedOutputPayload } from "./outputTypes";
import { WORKFLOW_LABEL } from "./workflow";

// ─── Output types for each phase ────────────────────────────────────────────

export type FrameOutput = {
  problemStatement: string;
  successDefinition: string;
  hypotheses: string[];
  confirmedPatterns: string[];
  unexpectedFindings: string[];
  bottomLine: string;
};

export type AnalyzeOutput = {
  rootCauses: Array<{
    factor: string;
    mechanism: string;
    evidence: string;
    interaction: string;
  }>;
  leakageNarrative: string;
  criticalInsight: string;
};

// ─── Pipeline event discriminated union ─────────────────────────────────────

export type PipelineEvent =
  | { event: "phase"; phase: string; status: "running"; label: string }
  | { event: "phase"; phase: string; status: "done"; summary: string }
  | {
      event: "complete";
      analysis?: PipelineAnalysis;
      generated: GeneratedOutputPayload;
      pipelineLog: PipelineLog;
      usedFallback: false;
    }
  | { event: "error"; message: string };

export type PipelineLog = Array<{
  phase: string;
  label: string;
  summary: string;
}>;

// ─── Shared helpers ──────────────────────────────────────────────────────────

const MODEL = "claude-opus-4-7";
const SYSTEM_PROMPT =
  "You are a RevOps and B2B sales operations specialist with deep experience diagnosing lead pipeline failures at mid-market SaaS companies. Industry context you carry: the average B2B company takes 47+ hours to respond to an inbound lead (Drift benchmark); leads contacted within 5 minutes are 21x more likely to qualify (InsideSales/HBR); after 24 hours without contact, qualification rates drop roughly 75%. Common structural failure modes you have seen repeatedly: SDR capacity overload, uneven round-robin routing, after-hours lead decay windows, purely discretionary follow-up without CRM enforcement, and lead scoring drift that trains reps to deprioritize inbound. Output ONLY valid JSON — no markdown, no prose, no explanation.";

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

async function callClaude(
  client: Anthropic,
  prompt: string,
  maxTokens = 4096
): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

// ─── Phase 1: Frame (D+M) ────────────────────────────────────────────────────

function buildPhase1Prompt(
  brief: IntakeBrief,
  analysis: PipelineAnalysis,
  processNote: string
): string {
  const ownerLines = analysis.byOwner
    .map(
      (o) =>
        `  ${o.label}: ${o.conversionRate}% conversion (${o.total} leads, ${o.stalled} stalled, ${o.lost} lost)`
    )
    .join("\n");

  const sourceLines = analysis.bySource
    .map(
      (s) =>
        `  ${s.label}: ${s.conversionRate}% conversion (${s.total} leads)`
    )
    .join("\n");

  return `Business: ${brief.businessName}
Workflow: ${WORKFLOW_LABEL}

INTAKE BRIEF
- Pain point: ${brief.painPoint}
- Biggest frustration: ${brief.biggestFrustration}
- Suspected problem stage: ${brief.suspectedStage}
- Success metric: ${brief.successMetric}
- SLA constraint: ${brief.slaConstraint}
- Qualified lead definition: ${brief.qualifiedLeadDefinition}
- Current stages: ${brief.currentStages.join(" → ")}

PROCESS NOTE (intended workflow rules)
${processNote.trim()}

DETERMINISTIC METRICS
- Total leads: ${analysis.totalLeads}
- Conversion rate (new lead → booked meeting): ${analysis.conversionRate}%
- Median first response time: ${analysis.medianFirstResponseHours.toFixed(1)} hours (SLA: 4h)
- Stalled lead rate: ${analysis.stalledLeadRate}%
- Missed follow-up rate: ${analysis.missedFollowupRate}%
- Conversion with timely response (≤4h): ${analysis.conversionWithTimely}%
- Conversion with delayed response (>24h): ${analysis.conversionWithDelayed}%
- Conversion with missed follow-up: ${analysis.conversionMissedFollowup}%
- Conversion without missed follow-up: ${analysis.conversionNoMissedFollowup}%

OWNER BREAKDOWN
${ownerLines}

SOURCE BREAKDOWN
${sourceLines}

TASK: Come in cold as a RevOps diagnostician. First, benchmark this pipeline against industry standards: B2B median response is 47h, top performers respond in <5 minutes (21x qualification lift), leads with no contact after 24h have ~75% lower qualification rates — compare those benchmarks against the metrics above and name where this pipeline sits on that spectrum. Second, assess whether this is an SDR capacity problem (too many leads per rep forces implicit triage) or a process enforcement problem (follow-up is purely discretionary). Third, confirm or deny the owner's hypotheses with the data. Surface anything the owner cannot see from inside the process.

Output a JSON object matching this exact schema:
{
  "problemStatement": "2-3 sentences. What the process should do vs what is actually happening, grounded in the metrics.",
  "successDefinition": "1-2 sentences. What improvement would look like in measurable terms.",
  "hypotheses": ["The owner's hypothesis 1 restated precisely", "Hypothesis 2 if present", "..."],
  "confirmedPatterns": ["Pattern confirmed by the data with specific numbers", "..."],
  "unexpectedFindings": ["Something the data shows that the owner did not mention", "..."],
  "bottomLine": "1 sentence. The single most important thing this data reveals."
}`;
}

// ─── Phase 2: Analyze (A) ────────────────────────────────────────────────────

function buildPhase2Prompt(
  frame: FrameOutput,
  analysis: PipelineAnalysis,
  brief: IntakeBrief
): string {
  const causesText = analysis.rankedCauses
    .map(
      (c) =>
        `  ${c.rank}. ${c.factor}: impactDelta=${c.impactDelta.toFixed(1)}pp, affectedLeads=${c.affectedLeads}`
    )
    .join("\n");

  return `PHASE 1 OUTPUT (framing)
${JSON.stringify(frame, null, 2)}

RANKED CAUSES (from deterministic analysis)
${causesText}

KEY CROSS-STATS
- Conversion when both delayed response AND missed follow-up: ${analysis.conversionBothBad}%
- Stalled rate WITH missed follow-up: ${analysis.stalledRateWithMissedFollowup}%
- Stalled rate WITHOUT missed follow-up: ${analysis.stalledRateNoMissedFollowup}%

CONTEXT
- Biggest frustration: ${brief.biggestFrustration}
- Suspected problem stage: ${brief.suspectedStage}

TASK: Reason like a RevOps consultant who has diagnosed this failure pattern at dozens of companies. Go beyond WHAT is broken to explain the behavioral and structural mechanisms driving it. The four most common causal chains in B2B lead pipelines are: (1) after-hours decay — leads arriving outside business hours sit in queue overnight, losing 60%+ of qualification probability by morning; (2) SDR capacity overload — too many leads per rep forces implicit triage, inbound leads lose to active pipeline urgency; (3) routing asymmetry — uneven round-robin loading means some reps are perpetually buried while others have slack; (4) no CRM enforcement — without timer fields or auto-escalation rules, follow-up is purely discretionary and deprioritized under any pressure. Identify which mechanisms are active in this pipeline and explain precisely how they interact and amplify each other.

Output a JSON object matching this exact schema:
{
  "rootCauses": [
    {
      "factor": "Name of the cause",
      "mechanism": "The causal chain — why this factor leads to lost conversions, not just that it does.",
      "evidence": "Specific numbers and patterns from the data that prove this mechanism is real.",
      "interaction": "How this cause interacts with or amplifies other causes in the list."
    }
  ],
  "leakageNarrative": "3-5 sentences. Tell the story of how a lead enters this pipeline and where and why it silently dies. Be specific about the behavioral and process failures.",
  "criticalInsight": "1 sentence. The single deepest insight from this analysis — something that reframes how the owner should think about the problem."
}`;
}

// ─── Phase 3: Synthesize (I+C+Exec) ─────────────────────────────────────────

function buildPhase3Prompt(
  brief: IntakeBrief,
  analysis: PipelineAnalysis,
  frame: FrameOutput,
  analyze: AnalyzeOutput
): string {
  return `PHASE 1 OUTPUT (framing)
${JSON.stringify(frame, null, 2)}

PHASE 2 OUTPUT (root cause analysis)
${JSON.stringify(analyze, null, 2)}

KEY METRICS
- Business: ${brief.businessName}
- Total leads: ${analysis.totalLeads}
- Conversion rate: ${analysis.conversionRate}%
- Median first response: ${analysis.medianFirstResponseHours.toFixed(1)}h (SLA: 4h)
- Stalled lead rate: ${analysis.stalledLeadRate}%
- Missed follow-up rate: ${analysis.missedFollowupRate}%
- Conversion with timely response: ${analysis.conversionWithTimely}%
- Conversion with delayed response: ${analysis.conversionWithDelayed}%
- Conversion with missed follow-up: ${analysis.conversionMissedFollowup}%
- Conversion without missed follow-up: ${analysis.conversionNoMissedFollowup}%

BRIEF GOALS
- Pain point: ${brief.painPoint}
- Success metric: ${brief.successMetric}
- SLA: ${brief.slaConstraint}
- Biggest frustration: ${brief.biggestFrustration}

TASK: Generate the full user-facing report as a RevOps expert who has diagnosed this exact failure mechanism. Every section must be grounded in the specific mechanisms from phases 1 and 2. Reference the industry benchmarks where they contextualize findings (47h industry median, 5-min 21x lift, 24h 75% qualification decay). Recommendations must name specific system-level controls — CRM automation rules, timer fields, auto-escalation triggers, coverage protocols — not generic guidance. Speak to this owner as someone who has fixed this exact problem before.

RULES:
- Use exact metric numbers from KEY METRICS above. Reference the industry benchmarks you carry (47h median, 5-min 21x lift, 24h 75% decay) to contextualize findings.
- SOP bullets must be exactly 5 strings. Each must describe a specific operational control — CRM automation triggers, SLA timer fields, assignment rules, escalation conditions, or after-hours coverage protocols. No generic guidance.
- alertRules must be exactly 5 objects, each with severity "warning" or "critical" only. Each must be a specific RevOps monitoring rule referencing lead aging thresholds, SLA violations, stall rate spikes, or routing queue imbalance — specific enough to configure in a CRM or ops dashboard.
- Do not use "AI", "DMAIC", "agentic", or academic jargon.
- Recommendations must name specific system-level changes where relevant (CRM task automation, lead aging reports, auto-reassignment after inactivity threshold, round-robin rebalancing).

Output a JSON object matching this EXACT schema:
{
  "executiveSummary": {
    "headlineFinding": "1-2 sentences referencing the ${analysis.conversionRate}% conversion rate and the mechanism discovered in phase 2.",
    "whyItMatters": "1-2 sentences on business/revenue consequence.",
    "primaryCause": "1-2 sentences naming the dominant driver with specific numbers.",
    "recommendedAction": "1 sentence — the single most important first change.",
    "monitoringPlan": "1 sentence — what metric will confirm the fix is working."
  },
  "problemDefinition": {
    "workflow": "${WORKFLOW_LABEL}",
    "businessProblem": "75-100 words. What the process should do vs what it is doing.",
    "affectedGroup": "The roles affected.",
    "successMetric": "Conversion rate from new lead to booked meeting.",
    "scope": "Lead intake through booked meeting only."
  },
  "rootCauseAnalysis": {
    "topLeakagePoint": "1-2 sentences on the stage and behavioral pattern with most leakage.",
    "rankedCauses": [
      { "rank": 1, "factor": "factor name", "finding": "1-2 sentences with specific numbers." },
      { "rank": 2, "factor": "factor name", "finding": "1-2 sentences." },
      { "rank": 3, "factor": "factor name", "finding": "1-2 sentences." }
    ],
    "supportingComparison": "1-2 sentences comparing timely vs delayed response conversion rates.",
    "segmentInsight": "1-2 sentences on the most actionable owner or source segment finding."
  },
  "recommendation": {
    "firstAction": "2-3 sentences. Specific and actionable — what exactly changes.",
    "whyThisFirst": "1-2 sentences on why this has the highest expected impact.",
    "expectedEffect": "1-2 sentences on expected improvement and when it becomes visible.",
    "owner": "The role responsible."
  },
  "workflowSOP": {
    "title": "Lead Intake Follow-Up Standard",
    "objective": "1 sentence — what this rule is designed to accomplish.",
    "bullets": [
      "Rule 1: specific actionable rule",
      "Rule 2: specific actionable rule",
      "Rule 3: specific actionable rule",
      "Rule 4: specific actionable rule",
      "Rule 5: specific actionable rule"
    ],
    "escalation": "1 sentence — what triggers escalation and to whom.",
    "owner": "Pipeline manager or team lead."
  },
  "monitoringReport": {
    "issue": "1-2 sentences — the operational problem identified.",
    "fix": "1-2 sentences — the change recommended.",
    "metrics": "The 3 metrics to monitor going forward.",
    "thresholds": "Specific alert thresholds for each metric.",
    "owner": "The role who owns monitoring.",
    "responsePlan": "2-3 sentences on what happens if metrics drift back."
  },
  "controlDashboard": {
    "primaryMetricLabel": "Conversion Rate: ${analysis.conversionRate}%",
    "secondaryMetricLabel": "Median First Response: ${analysis.medianFirstResponseHours.toFixed(1)}h (SLA: 4h)",
    "tertiaryMetricLabel": "Stalled Lead Rate: ${analysis.stalledLeadRate}%",
    "segmentNeedingAttention": "The one owner or source segment most in need of attention right now."
  },
  "alertRules": [
    { "trigger": "specific condition", "action": "what should happen", "severity": "warning" },
    { "trigger": "specific condition", "action": "what should happen", "severity": "critical" },
    { "trigger": "specific condition", "action": "what should happen", "severity": "warning" },
    { "trigger": "specific condition", "action": "what should happen", "severity": "critical" },
    { "trigger": "specific condition", "action": "what should happen", "severity": "warning" }
  ]
}`;
}

// ─── Pipeline runner ─────────────────────────────────────────────────────────

export async function runPipeline(
  brief: IntakeBrief,
  analysis: PipelineAnalysis,
  processNote: string,
  onEvent: (event: PipelineEvent) => void
): Promise<void> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const pipelineLog: PipelineLog = [];

  // Phase 1: Frame
  onEvent({
    event: "phase",
    phase: "frame",
    status: "running",
    label: "Benchmarking pipeline against industry standards",
  });

  const phase1Prompt = buildPhase1Prompt(brief, analysis, processNote);
  const phase1Raw = await callClaude(client, phase1Prompt);
  const frame = JSON.parse(extractJSON(phase1Raw)) as FrameOutput;

  onEvent({
    event: "phase",
    phase: "frame",
    status: "done",
    summary: frame.bottomLine,
  });

  pipelineLog.push({
    phase: "frame",
    label: "Benchmarking pipeline against industry standards",
    summary: frame.bottomLine,
  });

  // Phase 2: Analyze
  onEvent({
    event: "phase",
    phase: "analyze",
    status: "running",
    label: "Diagnosing failure mechanisms and behavioral patterns",
  });

  const phase2Prompt = buildPhase2Prompt(frame, analysis, brief);
  const phase2Raw = await callClaude(client, phase2Prompt);
  const analyze = JSON.parse(extractJSON(phase2Raw)) as AnalyzeOutput;

  onEvent({
    event: "phase",
    phase: "analyze",
    status: "done",
    summary: analyze.criticalInsight,
  });

  pipelineLog.push({
    phase: "analyze",
    label: "Diagnosing failure mechanisms and behavioral patterns",
    summary: analyze.criticalInsight,
  });

  // Phase 3: Synthesize
  onEvent({
    event: "phase",
    phase: "synthesize",
    status: "running",
    label: "Building controls, playbook, and monitoring rules",
  });

  const phase3Prompt = buildPhase3Prompt(brief, analysis, frame, analyze);
  const phase3Raw = await callClaude(client, phase3Prompt, 8192);
  const generated = JSON.parse(extractJSON(phase3Raw)) as GeneratedOutputPayload;

  onEvent({
    event: "phase",
    phase: "synthesize",
    status: "done",
    summary: "Report generated",
  });

  pipelineLog.push({
    phase: "synthesize",
    label: "Building controls, playbook, and monitoring rules",
    summary: "Report generated",
  });

  // Complete
  onEvent({
    event: "complete",
    analysis,
    generated,
    pipelineLog,
    usedFallback: false,
  });
}
