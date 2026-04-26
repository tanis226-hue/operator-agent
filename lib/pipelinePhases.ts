import Anthropic from "@anthropic-ai/sdk";
import type { PipelineAnalysis } from "./analyzePipeline";
import type { IntakeBrief } from "./intakeBrief";
import type { GeneratedOutputPayload } from "./outputTypes";
import { WORKFLOW_LABEL } from "./workflow";
import { formatOrgContext } from "./intakeContext";

// ─── Output types for each phase ────────────────────────────────────────────

export type FrameOutput = {
  problemStatement: string;
  successDefinition: string;
  hypotheses: string[];
  confirmedPatterns: string[];
  unexpectedFindings: string[];
  bottomLine: string;
};

export type MeasureOutput = {
  metric1: string;
  metric2: string;
  metric3: string;
  performanceGap: string;
  industryContext: string;
  priorityMetric: string;
  benchmarkCategory: string;
  benchmarkSummary: string;
  baseline: string;
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
      usedFallback: boolean;
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
  "You are a RevOps and B2B sales operations specialist with deep experience diagnosing lead pipeline failures at mid-market SaaS companies. Industry context you carry: the average B2B company takes 47+ hours to respond to an inbound lead (Drift benchmark); leads contacted within 5 minutes are 21x more likely to qualify (InsideSales/HBR); after 24 hours without contact, qualification rates drop roughly 75%. Common structural failure modes you have seen repeatedly: SDR capacity overload, uneven round-robin routing, after-hours lead decay windows, purely discretionary follow-up without CRM enforcement, and lead scoring drift that trains reps to deprioritize inbound. Output ONLY valid JSON , no markdown, no prose, no explanation.";

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

  const orgContext = formatOrgContext(brief);
  return `Business: ${brief.businessName}
Workflow: ${WORKFLOW_LABEL}
${orgContext ? `\n${orgContext}\n` : ""}
INTAKE BRIEF
- Pain point: ${brief.painPoint}
- Biggest frustration: ${brief.biggestFrustration}
- Suspected problem stage: ${brief.suspectedStage}
- Success metric: ${brief.successMetric}
- SLA constraint: ${brief.slaText}
- Qualified lead definition: ${brief.qualifiedLeadDefinition}
- Current stages: ${brief.currentStages.join(" -> ")}

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

TASK: Come in cold as a RevOps diagnostician. First, benchmark this pipeline against industry standards: B2B median response is 47h, top performers respond in <5 minutes (21x qualification lift), leads with no contact after 24h have ~75% lower qualification rates , compare those benchmarks against the metrics above and name where this pipeline sits on that spectrum. Second, assess whether this is an SDR capacity problem (too many leads per rep forces implicit triage) or a process enforcement problem (follow-up is purely discretionary). Third, confirm or deny the owner's hypotheses with the data. Surface anything the owner cannot see from inside the process.

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

  const orgContext = formatOrgContext(brief);
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
${orgContext ? `\n${orgContext}` : ""}

TASK: Reason like a RevOps consultant who has diagnosed this failure pattern at dozens of companies. Go beyond WHAT is broken to explain the behavioral and structural mechanisms driving it. The four most common causal chains in B2B lead pipelines are: (1) after-hours decay , leads arriving outside business hours sit in queue overnight, losing 60%+ of qualification probability by morning; (2) SDR capacity overload , too many leads per rep forces implicit triage, inbound leads lose to active pipeline urgency; (3) routing asymmetry , uneven round-robin loading means some reps are perpetually buried while others have slack; (4) no CRM enforcement , without timer fields or auto-escalation rules, follow-up is purely discretionary and deprioritized under any pressure. Identify which mechanisms are active in this pipeline and explain precisely how they interact and amplify each other.

Output a JSON object matching this exact schema:
{
  "rootCauses": [
    {
      "factor": "Name of the cause",
      "mechanism": "The causal chain , why this factor leads to lost conversions, not just that it does.",
      "evidence": "Specific numbers and patterns from the data that prove this mechanism is real.",
      "interaction": "How this cause interacts with or amplifies other causes in the list."
    }
  ],
  "leakageNarrative": "3-5 sentences. Tell the story of how a lead enters this pipeline and where and why it silently dies. Be specific about the behavioral and process failures.",
  "criticalInsight": "1 sentence. The single deepest insight from this analysis , something that reframes how the owner should think about the problem."
}`;
}

// ─── Phase 3: Synthesize (I+C+Exec) ─────────────────────────────────────────

function buildPhase3Prompt(
  brief: IntakeBrief,
  analysis: PipelineAnalysis,
  frame: FrameOutput,
  analyze: AnalyzeOutput
): string {
  const orgContext = formatOrgContext(brief);

  // Programmatic template avoids embedded template expressions inside the JSON
  // which confuse the model and cause malformed output.
  const jsonTemplate = {
    executiveSummary: {
      headlineFinding: `Describe conversion problem using the ${analysis.conversionRate}% rate and the root cause`,
      whyItMatters: "Business consequence in revenue or operational terms",
      primaryCause: "Dominant driver with specific numbers from the data",
      recommendedAction: "Single most important first change",
      monitoringPlan: "Metric that will confirm the fix is working",
    },
    problemDefinition: {
      workflow: WORKFLOW_LABEL,
      businessProblem: "What the process should do vs what is happening",
      affectedGroup: "Roles affected",
      successMetric: "Conversion rate from new lead to booked meeting",
      scope: "Lead intake through booked meeting only",
    },
    rootCauseAnalysis: {
      topLeakagePoint: "Stage and behavioral pattern with most leakage",
      rankedCauses: [
        { rank: 1, factor: "factor name", finding: "Evidence with specific numbers" },
        { rank: 2, factor: "factor name", finding: "Evidence" },
        { rank: 3, factor: "factor name", finding: "Evidence" },
      ],
      supportingComparison: "Timely vs delayed response conversion rate comparison",
      segmentInsight: "Most actionable owner or source segment finding",
    },
    recommendation: {
      firstAction: "Exactly what changes and who does it",
      whyThisFirst: "Why this has the highest expected return",
      expectedEffect: "Expected improvement and when it becomes visible",
      owner: "Role responsible",
    },
    workflowSOP: {
      title: "Lead Intake Follow-Up Standard",
      objective: "What this rule is designed to accomplish",
      bullets: ["Rule 1", "Rule 2", "Rule 3", "Rule 4", "Rule 5"],
      escalation: "What triggers escalation and to whom",
      owner: "Pipeline manager or team lead",
    },
    monitoringReport: {
      issue: "Operational problem identified",
      fix: "Change recommended",
      metrics: "Metric1; Metric2; Metric3",
      thresholds: "Alert threshold for each metric",
      owner: "Role who owns monitoring",
      responsePlan: "What happens if metrics drift back",
    },
    controlDashboard: {
      primaryMetricLabel: `Conversion Rate: ${analysis.conversionRate}%`,
      secondaryMetricLabel: `Median First Response: ${analysis.medianFirstResponseHours.toFixed(1)}h (SLA: 4h)`,
      tertiaryMetricLabel: `Stalled Lead Rate: ${analysis.stalledLeadRate}%`,
      segmentNeedingAttention: "Owner or source segment most needing attention",
    },
    alertRules: [
      { trigger: "Lead not contacted within 4 hours of submission", action: "Assign to backup rep and notify team lead", severity: "critical" },
      { trigger: "Lead stalled in Contacted for over 48 hours", action: "Auto-escalate to team lead for reassignment", severity: "warning" },
      { trigger: "Weekly missed follow-up rate exceeds 20%", action: "Pull and review uncontacted lead list immediately", severity: "critical" },
      { trigger: "Stalled lead rate exceeds 30%", action: "Block new lead intake until backlog is cleared", severity: "warning" },
      { trigger: "Rep response time average exceeds 8 hours for 3 days", action: "Redistribute lead queue and investigate capacity", severity: "warning" },
    ],
    ownerBrief: {
      problem: "Core operational failure in plain English",
      moneyAtRisk: brief.valuePerItem
        ? `Estimate using ${brief.valuePerItem} per lead`
        : "Short dollar figure based on stalled pipeline",
      actions: [
        { action: "Most urgent change: active verb, names specific CRM field or rule", when: "this week", expectedLift: "Specific measurable outcome" },
        { action: "Second priority: process adjustment or reporting change", when: "this month", expectedLift: "Specific measurable outcome" },
        { action: "Structural fix: routing, coverage, or CRM automation", when: "this quarter", expectedLift: "Specific measurable outcome" },
      ],
      nextDecision: "Single concrete thing to do Monday morning naming the specific tool, person, or field",
    },
  };

  return `PHASE 1 OUTPUT (framing)
${JSON.stringify(frame)}

PHASE 2 OUTPUT (root cause analysis)
${JSON.stringify(analyze)}

KEY METRICS
- Business: ${brief.businessName}
- Total leads: ${analysis.totalLeads}
- Conversion rate: ${analysis.conversionRate}%
- Median first response: ${analysis.medianFirstResponseHours.toFixed(1)}h (SLA: 4h)
- Stalled lead rate: ${analysis.stalledLeadRate}%
- Missed follow-up rate: ${analysis.missedFollowupRate}%
- Conversion with timely response: ${analysis.conversionWithTimely}%
- Conversion with delayed response: ${analysis.conversionWithDelayed}%
${orgContext ? `\n${orgContext}\n` : ""}
BRIEF GOALS
- Pain point: ${brief.painPoint}
- Success metric: ${brief.successMetric}
- SLA: ${brief.slaText}
- Biggest frustration: ${brief.biggestFrustration}
${brief.priorAttempts ? `- Previously tried (do not repeat): ${brief.priorAttempts}` : ""}

RULES: Output ONLY valid JSON. No markdown. No prose. No em dashes. SOP bullets exactly 5 strings. alertRules exactly 5 objects with severity "warning" or "critical". ownerBrief.actions exactly 3 objects. rootCauseAnalysis.rankedCauses exactly 3 objects. Every value must be grounded in the phase outputs above.

Output ONLY valid JSON matching this exact structure:
${JSON.stringify(jsonTemplate, null, 0)}

Output nothing but the JSON object.`;
}

// ─── Phase 3 fallback ────────────────────────────────────────────────────────

function buildPhase3Fallback(
  brief: IntakeBrief,
  analysis: PipelineAnalysis,
  frame: FrameOutput,
  analyze: AnalyzeOutput
): GeneratedOutputPayload {
  const causes = analyze.rootCauses ?? [];
  const c1 = causes[0];
  const c2 = causes[1];
  const c3 = causes[2];

  const moneyAtRisk = brief.valuePerItem
    ? `${analysis.stalledLeads} stalled leads at ${brief.valuePerItem}`
    : `${analysis.stalledLeads} stalled leads in pipeline`;

  return {
    executiveSummary: {
      headlineFinding: frame.bottomLine,
      whyItMatters: brief.painPoint,
      primaryCause: analyze.criticalInsight,
      recommendedAction: brief.currentTooling
        ? `Add a 4-hour response rule in ${brief.currentTooling} that auto-escalates uncontacted leads.`
        : "Add CRM enforcement: auto-escalate any lead uncontacted after 4 hours.",
      monitoringPlan: "Track median first response time weekly; target under 4 hours.",
    },
    problemDefinition: {
      workflow: WORKFLOW_LABEL,
      businessProblem: frame.problemStatement,
      affectedGroup: "Sales reps and pipeline manager",
      successMetric: brief.successMetric,
      scope: "Lead intake through booked meeting only.",
    },
    rootCauseAnalysis: {
      topLeakagePoint: analyze.leakageNarrative,
      rankedCauses: [
        { rank: 1, factor: c1?.factor ?? "Delayed initial response", finding: c1?.evidence ?? c1?.mechanism ?? "Confirmed by response-time data" },
        { rank: 2, factor: c2?.factor ?? "Missed follow-up", finding: c2?.evidence ?? c2?.mechanism ?? "Confirmed by follow-up rate data" },
        { rank: 3, factor: c3?.factor ?? "No CRM enforcement", finding: c3?.evidence ?? c3?.mechanism ?? "No automation rule found in process note" },
      ],
      supportingComparison: `Timely response conversion: ${analysis.conversionWithTimely}% vs delayed: ${analysis.conversionWithDelayed}%`,
      segmentInsight: analyze.criticalInsight,
    },
    recommendation: {
      firstAction: brief.currentTooling
        ? `In ${brief.currentTooling}, create an automation rule: if lead is uncontacted after 4 hours, assign a task to the team lead.`
        : "Create a CRM automation rule that assigns a high-priority task if a lead is uncontacted after 4 hours.",
      whyThisFirst: analyze.criticalInsight,
      expectedEffect: `Should lift conversion from ${analysis.conversionRate}% toward ${analysis.conversionWithTimely}% as timely-response rate improves.`,
      owner: "Pipeline manager",
    },
    workflowSOP: {
      title: "Lead Intake Follow-Up Standard",
      objective: "Ensure every inbound lead receives first contact within 4 hours and a logged next step within 24 hours.",
      bullets: [
        "All new leads trigger an automatic 4-hour follow-up task assigned to the rep.",
        brief.currentTooling
          ? `In ${brief.currentTooling}, set a lead aging field: any lead in New status past 4 hours is flagged on the team lead dashboard.`
          : "Set a lead aging field: any lead in New status past 4 hours is flagged for the team lead.",
        "After-hours leads are assigned to the first available rep next morning with a 2-hour priority task.",
        "Every lead in Contacted with no logged activity for 48 hours is auto-reassigned to backup rep.",
        "Weekly review: team lead pulls all leads with response >4h and missed follow-up; root causes logged.",
      ],
      escalation: "Any lead uncontacted after 8 hours escalates to team lead with an automated alert.",
      owner: "Pipeline manager",
    },
    monitoringReport: {
      issue: brief.painPoint,
      fix: "CRM automation rules enforcing 4-hour response and 48-hour follow-up with auto-escalation.",
      metrics: "Conversion rate; Median first response time; Missed follow-up rate",
      thresholds: "Alert: response >4h on any lead; Missed follow-up rate >20%; Stalled rate >30%",
      owner: "Pipeline manager",
      responsePlan: "If median response time rises above 4h for 3 consecutive days, pull lead distribution report and rebalance the queue.",
    },
    controlDashboard: {
      primaryMetricLabel: `Conversion Rate: ${analysis.conversionRate}%`,
      secondaryMetricLabel: `Median First Response: ${analysis.medianFirstResponseHours.toFixed(1)}h (SLA: 4h)`,
      tertiaryMetricLabel: `Stalled Lead Rate: ${analysis.stalledLeadRate}%`,
      segmentNeedingAttention: "Owner with lowest conversion rate or highest stall rate",
    },
    alertRules: [
      { trigger: "Lead uncontacted after 4 hours", action: "Assign priority task to team lead and send alert", severity: "critical" },
      { trigger: "Lead stalled in Contacted for over 48 hours", action: "Auto-reassign to backup rep", severity: "warning" },
      { trigger: "Weekly missed follow-up rate exceeds 20%", action: "Pull and review uncontacted lead list", severity: "critical" },
      { trigger: "Stalled lead rate exceeds 30%", action: "Pause new lead intake review and rebalance queue", severity: "warning" },
      { trigger: "Rep average response time exceeds 8 hours for 3 days", action: "Redistribute lead queue and investigate capacity", severity: "warning" },
    ],
    ownerBrief: {
      problem: frame.bottomLine,
      moneyAtRisk: moneyAtRisk,
      actions: [
        {
          action: brief.currentTooling
            ? `Add 4-hour response rule in ${brief.currentTooling} with auto-escalation to team lead.`
            : "Add 4-hour CRM rule: auto-escalate uncontacted leads to team lead.",
          when: "this week",
          expectedLift: `Reduce missed follow-up rate from ${analysis.missedFollowupRate}% toward 0%.`,
        },
        {
          action: "Build a weekly lead aging report showing every lead with response >4h and owner.",
          when: "this month",
          expectedLift: `Lift conversion from ${analysis.conversionRate}% toward ${analysis.conversionWithTimely}%.`,
        },
        {
          action: "Implement round-robin load balancing and after-hours coverage protocol.",
          when: "this quarter",
          expectedLift: "Eliminate response gaps from rep overload and after-hours decay.",
        },
      ],
      nextDecision: brief.currentTooling
        ? `Monday morning: open ${brief.currentTooling} and create the 4-hour response automation rule before the first rep logs in.`
        : "Monday morning: schedule a 30-minute session with the team lead to configure the 4-hour CRM automation rule.",
    },
  };
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
  let generated: GeneratedOutputPayload;
  let usedFallback = false;
  try {
    generated = JSON.parse(extractJSON(phase3Raw)) as GeneratedOutputPayload;
  } catch (e) {
    console.warn("Phase 3 JSON parsing failed, using fallback:", e);
    generated = buildPhase3Fallback(brief, analysis, frame, analyze);
    usedFallback = true;
  }

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
    usedFallback,
  });
}
