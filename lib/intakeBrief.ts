import { WORKFLOW_LABEL } from "./workflow";

export type IntakeBrief = {
  businessName: string;
  workflowName: string;
  painPoint: string;
  successMetric: string;
  slaConstraint: string;
  currentStages: string[];
  availableEvidence: string[];
  qualifiedLeadDefinition: string;
  suspectedStage: string;
  biggestFrustration: string;
};

export const DEMO_INTAKE_BRIEF: IntakeBrief = {
  businessName: "Meridian Professional Services",
  workflowName: WORKFLOW_LABEL,
  painPoint:
    "Too many inbound leads stall or drop out before a booked meeting. Leadership cannot tell where the pipeline is leaking or what to fix first.",
  successMetric:
    "Conversion rate from new lead to booked meeting, supported by median time to first follow-up.",
  slaConstraint:
    "New leads should receive a first response within 4 business hours; qualified leads need a logged next step before end of day.",
  currentStages: [
    "New Lead",
    "Contacted",
    "Qualified",
    "Meeting Scheduled",
    "Lost",
  ],
  availableEvidence: [
    "acquisition_pipeline_cases.csv (120 lead records)",
    "process_note.md (intended workflow rules)",
  ],
  qualifiedLeadDefinition:
    "An inbound lead with confirmed contact info, stated need, and fit for Meridian's services.",
  suspectedStage:
    "Between first response and qualification / meeting scheduled.",
  biggestFrustration:
    "Follow-up is inconsistent and owners cannot tell which leads are quietly going cold.",
};
