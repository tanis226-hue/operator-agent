// Demo data — distilled from the OpsAdvisor demo output

const DEMO = {
  business: "Meridian Professional Services",
  workflow: "Lead Intake and Conversion Bottleneck",

  brief: {
    businessName: "Meridian Professional Services",
    workflow: "Lead Intake and Conversion Bottleneck",
    painPoint:
      "Inbound leads aren't converting to booked meetings and follow-up is inconsistent across owners.",
    successMetric:
      "Lead-to-meeting conversion rate, with median first-response time as a leading indicator.",
    sla: "First follow-up within 4 business hours of intake.",
    qualified:
      "Verified contact, minimum company size, expressed interest in services.",
    stages: ["New Lead", "Contacted", "Qualified", "Meeting Booked", "Closed / Lost"],
    suspected: "Initial outreach and first follow-up — leads going cold before contact.",
    frustration:
      "Leads go cold before reps follow up. No visibility into who is being ignored.",
    evidence: ["120-row pipeline export (90 days)", "CRM SLA policy doc", "Owner roster (3)"],
  },

  exec: {
    headline:
      "Conversion is running at 44.2%, well below pipeline capacity, because too many leads receive slow or inconsistent follow-up before a meeting is ever scheduled.",
    why:
      "With a median first response of 9.6 hours against a 4-hour SLA, and 26.7% of leads flagged for missed follow-up, a significant share of qualified demand is going cold before it reaches a booking.",
    cause:
      "Delayed first response. Leads contacted within 4 hours convert at 65.8%; leads delayed past 24 hours convert at only 15.8% — a 50 percentage-point gap.",
    action:
      "Enforce a 4-business-hour first-response SLA, require a logged next-step on every qualified lead before EOD, and escalate any 48-hour-untouched lead to the pipeline manager.",
    monitoring:
      "Track conversion weekly, median first-response daily; alert when stalled rate exceeds 15% or any high-value lead sits past SLA.",
  },

  baseline: {
    conversionRate: 44.2,
    conversionTarget: 55,
    medianResponseHours: 9.6,
    slaHours: 4,
    stalledRate: 25.8,
    stalledThreshold: 15,
    missedFollowupRate: 26.7,
    missedThreshold: 20,
    avgDealValue: 8000,
    totalLeads: 120,
    booked: 53,
    stalled: 31,
    lost: 36,
    moneyAtRisk: 248000,
  },

  funnel: [
    { stage: "New Lead", count: 120, pct: 100 },
    { stage: "Contacted", count: 88, pct: 73.3 },
    { stage: "Qualified", count: 71, pct: 59.2 },
    { stage: "Meeting Booked", count: 53, pct: 44.2 },
  ],

  bySource: [
    { label: "Referral", total: 28, booked: 18, rate: 64.3 },
    { label: "Web form", total: 42, booked: 19, rate: 45.2 },
    { label: "Trade show", total: 25, booked: 11, rate: 44.0 },
    { label: "Cold outbound", total: 25, booked: 5, rate: 20.0 },
  ],

  byOwner: [
    { name: "Alex", total: 42, booked: 28, rate: 66.7 },
    { name: "Sam", total: 53, booked: 22, rate: 41.5 },
    { name: "Jordan", total: 25, booked: 7, rate: 28.0 },
  ],

  // Pareto: cumulative % of conversion loss by cause
  pareto: [
    { cause: "Delayed first response (>24h)", lossPp: 50, conv: 15.8, leads: 32, color: "rust" },
    { cause: "Missed follow-up", lossPp: 34.6, conv: 18.8, leads: 32, color: "ochre" },
    { cause: "Owner Jordan underperformance", lossPp: 38.7, conv: 28.0, leads: 25, color: "accent" },
    { cause: "Cold outbound source", lossPp: 24.2, conv: 20.0, leads: 25, color: "ink-3" },
    { cause: "≥3 handoffs", lossPp: 12.4, conv: 31.8, leads: 22, color: "line" },
  ],

  causes: [
    {
      rank: 1,
      factor: "Delayed first response",
      finding:
        "Leads contacted within 4 hours convert at 65.8%; leads delayed past 24 hours convert at only 15.8%. A 50pp gap that is the dominant driver of pipeline leakage.",
      delta: -50,
      affected: 32,
    },
    {
      rank: 2,
      factor: "Owner performance gap",
      finding:
        "Jordan converts 28% of assigned leads; Alex converts 66.7%. A 38.7pp gap most likely tied to differences in response speed and follow-up consistency, not lead quality.",
      delta: -38.7,
      affected: 25,
    },
    {
      rank: 3,
      factor: "Missed follow-up",
      finding:
        "Leads with a missed follow-up flag convert at 18.8% versus 53.4% for leads with consistent follow-up. A 34.6pp gap that amplifies slow initial response.",
      delta: -34.6,
      affected: 32,
    },
  ],

  recommendation: {
    action:
      "Enforce a 4-business-hour first-response SLA for all new leads. Require a documented next-step on every qualified lead before end of business day. Auto-escalate any lead with no recorded activity for 48 hours to the pipeline manager.",
    why: "Delayed first response is responsible for a 50pp conversion gap. Addressing it directly targets the largest single driver of leakage before any other factor.",
    effect:
      "Bringing median first-response within SLA should materially improve conversion within 2–4 weeks.",
    owner: "Pipeline manager · weekly review of response-time compliance and stalled lead counts.",
  },

  sop: {
    title: "Lead Intake Follow-Up Standard",
    objective:
      "Ensure every inbound lead receives timely, consistent follow-up so qualified demand reaches a booked meeting without stalling.",
    rules: [
      {
        n: "01",
        text: "All new leads must receive a first response within 4 business hours of intake. Set an automated CRM timer that flags overdue leads to the pipeline manager.",
      },
      {
        n: "02",
        text: "Every qualified lead must have a logged next-step task before end of the same business day. Enforce as a required field before stage advance.",
      },
      {
        n: "03",
        text: "Any lead with no recorded owner activity for 48 hours auto-escalates to the pipeline manager for reassignment or direct outreach.",
      },
      {
        n: "04",
        text: "High-value leads (deal value > $10,000) may not sit untouched for more than 1 business day. Configure a separate high-priority queue with daily alerts.",
      },
      {
        n: "05",
        text: "Missed follow-up flags must be reviewed in the weekly pipeline meeting and resolved before they age past 72 hours. Unresolved flags block owner performance reports.",
      },
    ],
    escalation:
      "Any lead with no owner activity for 48 hours, or any high-value lead untouched past 1 business day, escalates immediately to the pipeline manager.",
    owner: "Pipeline manager, with support from individual sales and intake owners for day-to-day compliance.",
  },

  alerts: [
    {
      severity: "critical",
      trigger: "Median first-response exceeds 4h for 2 consecutive days",
      action: "Pipeline manager reviews open leads, identifies owners missing SLA. Coaching scheduled within 24h.",
    },
    {
      severity: "critical",
      trigger: "Any high-value lead (>$10k) has no owner activity for >1 business day",
      action: "Pipeline manager contacts assigned owner immediately; takes over outreach if no response within 2h.",
    },
    {
      severity: "warning",
      trigger: "Stalled lead rate exceeds 15% of active pipeline",
      action: "Pipeline manager pulls stalled list and assigns or re-activates within 1 business day.",
    },
    {
      severity: "warning",
      trigger: "Weekly conversion rate falls below 40%",
      action: "Pipeline manager conducts full weekly review to identify whether response, follow-up, or quality is driving decline.",
    },
    {
      severity: "warning",
      trigger: "Missed follow-up rate exceeds 20% of active leads",
      action: "Pipeline manager reviews open leads with missed flags; re-assigns or contacts within same business day.",
    },
  ],

  monitoring: {
    metrics: "Conversion rate · Median first response · Stalled lead rate",
    thresholds:
      "Median first-response > 4h for 2 days. Stalled rate > 15%. Weekly conversion < 40%. High-value lead idle > 1 business day.",
    owner:
      "Pipeline manager owns all three metrics and is responsible for weekly reporting and owner-level coaching when thresholds are breached.",
    response:
      "If response drifts past SLA for 2 days, pipeline manager reviews prior week's leads and schedules direct coaching. If conversion stays below 40% for 2 weeks, full pipeline review. Persistent underperformance triggers reassignment from low-converting owners.",
  },

  // Agent run phases — for the run state
  phases: [
    {
      key: "frame",
      label: "Define",
      sublabel: "Clarifying the problem and success criteria",
      duration: 6500,
      substeps: [
        "Reading intake brief and process notes",
        "Surfacing the owner's stated frustration",
        "Identifying confirmed patterns vs. assumptions",
        "Framing the bottom-line problem",
      ],
      summary:
        "The problem is not lead quality — it's that no one is forced to touch leads on time. The 4-hour SLA exists on paper; the CRM has no automation behind it.",
    },
    {
      key: "measure_analyze",
      label: "Measure & Analyze",
      sublabel: "Quantifying current state and root causes",
      duration: 9500,
      substeps: [
        "Computing baseline conversion and response metrics",
        "Comparing to B2B professional services benchmarks",
        "Tracing causal chains across pipeline stages",
        "Quantifying owner and source variance",
        "Ranking root causes by impact",
      ],
      summary:
        "Leads contacted within SLA convert at 65.8%; leads contacted after 24h convert at 15.8% — a 50pp gap that is the single clearest operational lever this team has right now.",
    },
    {
      key: "improve_control",
      label: "Improve & Control",
      sublabel: "Building recommendations and the control system",
      duration: 7500,
      substeps: [
        "Drafting the recommended first action",
        "Building the standard operating procedure",
        "Defining KPIs and alert thresholds",
        "Writing the executive summary",
        "Assembling the final report",
      ],
      summary:
        "Recommendation, SOP, alert rules, and monitoring report assembled.",
    },
  ],
};

window.DEMO = DEMO;
