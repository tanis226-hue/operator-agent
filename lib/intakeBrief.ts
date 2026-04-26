import { WORKFLOW_LABEL } from "./workflow";

// ─── Enum-style unions ──────────────────────────────────────────────────────

export type Industry =
  | "government"
  | "business"
  | "education"
  | "healthcare"
  | "other";

export type TeamSize = "solo" | "small" | "midsize" | "large";

export const INDUSTRY_LABELS: Record<Industry, string> = {
  government: "Government",
  business: "Business",
  education: "Education",
  healthcare: "Healthcare",
  other: "Other",
};

export const TEAM_SIZE_LABELS: Record<TeamSize, string> = {
  solo: "Just me (solo operator)",
  small: "Small team (2-20)",
  midsize: "Mid-size (21-200)",
  large: "Enterprise (200+)",
};

// ─── IntakeBrief schema ─────────────────────────────────────────────────────

export type IntakeBrief = {
  // Identity
  businessName: string;
  workflowName: string;

  // Org context (new in v2)
  industry: Industry | null;
  subIndustry: string | null;
  teamSize: TeamSize | null;

  // Problem framing
  painPoint: string;
  biggestFrustration: string;
  successMetric: string;

  // Service-level (split from old slaConstraint)
  slaText: string;
  slaThresholdHours: number | null;

  // Workflow shape
  currentStages: string[];
  qualifiedLeadDefinition: string;
  suspectedStage: string;

  // Volume & impact (new in v2 — powers concrete moneyAtRisk math)
  volumePerMonth: string;
  valuePerItem: string;

  // Tooling & history (new in v2)
  currentTooling: string;
  priorAttempts: string;

  // Routing (new in v2 — set by wizard, optional in editor)
  benchmarkCategoryId: string | null;
};

export const DEMO_INTAKE_BRIEF: IntakeBrief = {
  businessName: "Meridian Professional Services",
  workflowName: WORKFLOW_LABEL,

  industry: "business",
  subIndustry: "legal",
  teamSize: "midsize",

  painPoint:
    "Too many inbound leads stall or drop out before a booked meeting. Leadership cannot tell where the pipeline is leaking or what to fix first.",
  biggestFrustration:
    "Follow-up is inconsistent and owners cannot tell which leads are quietly going cold.",
  successMetric:
    "Conversion rate from new lead to booked meeting, supported by median time to first follow-up.",

  slaText:
    "New leads should receive a first response within 4 business hours; qualified leads need a logged next step before end of day.",
  slaThresholdHours: 4,

  currentStages: [
    "New Lead",
    "Contacted",
    "Qualified",
    "Meeting Scheduled",
    "Lost",
  ],
  qualifiedLeadDefinition:
    "An inbound lead with confirmed contact info, stated need, and fit for Meridian's services.",
  suspectedStage:
    "Between first response and qualification / meeting scheduled.",

  volumePerMonth: "~120 inbound leads per month",
  valuePerItem: "~$8,000 average closed-deal value",

  currentTooling: "Salesforce CRM with manual follow-up tracking in spreadsheets",
  priorAttempts:
    "Tried adding a 4-hour SLA rule but reps could override it; tried lead scoring but it was not integrated with routing.",

  benchmarkCategoryId: "sales-lead-conversion",
};
