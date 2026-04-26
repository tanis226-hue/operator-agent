import type { PipelineAnalysis } from "./analyzePipeline";
import type { IntakeBrief } from "./intakeBrief";
import { WORKFLOW_LABEL } from "./workflow";

export function buildMasterPrompt(
  brief: IntakeBrief,
  analysis: PipelineAnalysis,
  processNote: string
): string {
  const {
    totalLeads,
    conversionRate,
    medianFirstResponseHours,
    stalledLeadRate,
    missedFollowupRate,
    conversionWithTimely,
    conversionWithDelayed,
    conversionMissedFollowup,
    conversionNoMissedFollowup,
    rankedCauses,
    byOwner,
    bySource,
  } = analysis;

  const causeLines = rankedCauses
    .map((c) => `  ${c.rank}. ${c.factor}: ${c.description}`)
    .join("\n");

  const ownerLines = byOwner
    .map((o) => `  ${o.label}: ${o.conversionRate}% (${o.total} leads)`)
    .join("\n");

  const sourceLines = bySource
    .map((s) => `  ${s.label}: ${s.conversionRate}% (${s.total} leads)`)
    .join("\n");

  const worstOwner = byOwner[byOwner.length - 1];
  const bestOwner = byOwner[0];

  return `You are a senior operations advisor helping a business owner understand and fix a workflow problem.

Write in plain, direct, business-owner-friendly English. Be specific , use exact numbers, name specific roles and stages, and make every recommendation actionable. Do not use academic, consultant, or AI-adjacent language. Do not mention the model, AI, or DMAIC methodology in any output.

---

OWNER GOALS & CONTEXT
Business: ${brief.businessName}
Workflow being analyzed: ${WORKFLOW_LABEL}
What the owner is struggling with: ${brief.painPoint}
What success looks like to them: ${brief.successMetric}
Their biggest day-to-day frustration: ${brief.biggestFrustration}
Where they suspect the problem is: ${brief.suspectedStage}
SLA constraint: ${brief.slaText}
What counts as a qualified lead: ${brief.qualifiedLeadDefinition}
Current pipeline stages: ${brief.currentStages.join(" → ")}

PROCESS EXPECTATIONS (from the team's process note)
${processNote.trim()}

DETERMINISTIC METRICS , use these exact numbers, do not invent others
- Total leads analyzed: ${totalLeads}
- Overall conversion rate (new lead → booked meeting): ${conversionRate}%
- Median time to first follow-up: ${medianFirstResponseHours.toFixed(1)} hours (SLA is 4 hours)
- Stalled lead rate: ${stalledLeadRate}%
- Missed follow-up rate: ${missedFollowupRate}%
- Conversion with timely response (≤4h): ${conversionWithTimely}%
- Conversion with delayed response (>24h): ${conversionWithDelayed}%
- Conversion with missed follow-up: ${conversionMissedFollowup}%
- Conversion without missed follow-up: ${conversionNoMissedFollowup}%

RANKED ROOT CAUSES (ranked by conversion-rate impact gap)
${causeLines}

OWNER PERFORMANCE
${ownerLines}
Lowest performer: ${worstOwner?.label} at ${worstOwner?.conversionRate}%
Highest performer: ${bestOwner?.label} at ${bestOwner?.conversionRate}%

SOURCE PERFORMANCE
${sourceLines}

---

TASK
Produce a structured JSON object with the following keys. Every text value should be a finished business artifact , sharp, specific, and grounded in the data above. Speak directly to this owner's situation and frustrations. Do not write generic advice that could apply to any business.

Output ONLY valid JSON , no markdown fences, no explanation before or after.

{
  "executiveSummary": {
    "headlineFinding": "1–2 sentences. What is broken and why it matters. Must reference the ${conversionRate}% conversion rate.",
    "whyItMatters": "1–2 sentences. Business consequence , revenue or opportunity cost language.",
    "primaryCause": "1–2 sentences. Name the dominant driver. Reference specific numbers.",
    "recommendedAction": "1 sentence. The single most important first change.",
    "monitoringPlan": "1 sentence. What will be tracked to confirm the fix is working."
  },
  "problemDefinition": {
    "workflow": "${WORKFLOW_LABEL}",
    "businessProblem": "75–100 words. What the process should do vs what it is doing. Plain English.",
    "affectedGroup": "Name the roles affected (intake team, sales owners, etc.).",
    "successMetric": "Conversion rate from new lead to booked meeting.",
    "scope": "Lead intake through booked meeting. Exclude post-meeting steps."
  },
  "rootCauseAnalysis": {
    "topLeakagePoint": "1–2 sentences identifying the stage and behavioral pattern where the most leakage is occurring.",
    "rankedCauses": [
      { "rank": 1, "factor": "name of factor", "finding": "1–2 sentences with specific numbers from the metrics above." },
      { "rank": 2, "factor": "name of factor", "finding": "1–2 sentences." },
      { "rank": 3, "factor": "name of factor", "finding": "1–2 sentences." }
    ],
    "supportingComparison": "1–2 sentences comparing the timely-response vs delayed-response conversion rates.",
    "segmentInsight": "1–2 sentences on the owner or source pattern worth addressing."
  },
  "recommendation": {
    "firstAction": "2–3 sentences. Specific, actionable. What exactly should change.",
    "whyThisFirst": "1–2 sentences. Why this has the highest expected impact.",
    "expectedEffect": "1–2 sentences. What improvement is expected and by when it should be visible.",
    "owner": "Name the role responsible (pipeline manager, team lead, etc.)."
  },
  "workflowSOP": {
    "title": "Lead Intake Follow-Up Standard",
    "objective": "1 sentence , what this rule is designed to accomplish.",
    "bullets": [
      "Rule 1: first-response SLA enforcement",
      "Rule 2: qualified lead next-step requirement",
      "Rule 3: untouched lead escalation",
      "Rule 4: high-value lead protection",
      "Rule 5: ownership clarity requirement"
    ],
    "escalation": "1 sentence , what triggers escalation and to whom.",
    "owner": "Pipeline manager or team lead."
  },
  "monitoringReport": {
    "issue": "1–2 sentences , the operational problem identified.",
    "fix": "1–2 sentences , the change that was made or recommended.",
    "metrics": "List the 3 metrics that will be monitored going forward.",
    "thresholds": "State the specific alert thresholds for each metric.",
    "owner": "Name the role who owns monitoring.",
    "responsePlan": "2–3 sentences , what should happen if metrics drift back toward the problem."
  },
  "controlDashboard": {
    "conversionRateLabel": "Short label + current value, e.g. 'Conversion Rate: 44%'",
    "medianResponseLabel": "Short label + current value, e.g. 'Median First Response: 9.6h (SLA: 4h)'",
    "stalledRateLabel": "Short label + current value, e.g. 'Stalled Lead Rate: 26%'",
    "segmentNeedingAttention": "Identify the one owner or source segment currently most in need of attention."
  },
  "alertRules": [
    { "trigger": "Specific condition that fires the alert", "action": "What should happen when triggered", "severity": "warning" or "critical" },
    { "trigger": "...", "action": "...", "severity": "warning" },
    { "trigger": "...", "action": "...", "severity": "warning" },
    { "trigger": "...", "action": "...", "severity": "critical" },
    { "trigger": "...", "action": "...", "severity": "warning" }
  ]
}

RULES:
- Use exact metric numbers from the DETERMINISTIC METRICS section above.
- Do not invent metrics, percentages, or process details not present in the context.
- Do not use "the AI", "the model", "DMAIC", "agentic", or "autonomous" in any value.
- Keep every text value concise. Business owners read fast.
- Do not use em dashes (,) anywhere in your output. Use commas, periods, or colons instead.
- Alert rule severities must be the string "warning" or "critical" only.
`;
}
