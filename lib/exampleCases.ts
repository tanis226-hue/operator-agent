import type { IntakeBrief } from "./intakeBrief";

export type ExampleCase = {
  id: string;
  label: string;
  brief: IntakeBrief;
  processNote: string;
};

export const EXAMPLE_CASES: ExampleCase[] = [
  {
    id: "onboarding",
    label: "Employee Onboarding",
    brief: {
      businessName: "Vertex Group (HR Operations)",
      workflowName: "New Employee Onboarding",
      painPoint:
        "New hires consistently take 6–8 weeks to reach full productivity despite a stated target of 3 weeks. IT provisioning, manager introductions, and systems access are all delayed, leaving new employees idle or under-supported in their first month.",
      successMetric:
        "New hire reaches independent productivity within 21 days of start date, measured by manager sign-off on a readiness checklist.",
      slaConstraint:
        "IT access must be provisioned by end of day 1. Manager 1:1 must occur within 48 hours. All onboarding tasks must be complete by end of week 2.",
      currentStages: [
        "Offer Accepted",
        "Pre-boarding",
        "Day 1 Setup",
        "Orientation",
        "Role Training",
        "Independent",
      ],
      availableEvidence: [
        "Onboarding checklist completion logs",
        "IT ticket data for new hire provisioning",
        "Manager 1:1 scheduling records",
        "New hire 30-day survey responses",
      ],
      qualifiedLeadDefinition:
        "A full-time employee who has signed their offer letter and has a confirmed start date within the next 30 days.",
      suspectedStage:
        "Between offer acceptance and Day 1 — pre-boarding tasks are not being completed, so employees arrive unprepared and IT provisioning is delayed.",
      biggestFrustration:
        "Nobody owns the pre-boarding window. HR assumes IT will reach out, IT waits for HR to trigger the request, and the new hire sits in limbo until their first day.",
    },
    processNote: `New hire onboarding is intended to follow this sequence:

1. OFFER ACCEPTED (Day -14 to -7)
   - HR sends onboarding welcome email with checklist
   - HR opens IT provisioning ticket (laptop, email, system access)
   - Manager receives notification to prepare role training plan

2. PRE-BOARDING (Day -7 to Day 0)
   - IT confirms provisioning timeline with new hire
   - Manager schedules Day 1 agenda and first 1:1
   - New hire completes paperwork and compliance modules via onboarding portal

3. DAY 1 SETUP
   - IT provides laptop and access credentials by 10am
   - Office manager completes building access and desk setup
   - HR conducts 30-minute welcome meeting

4. ORIENTATION (Days 1–5)
   - New hire completes 4 required orientation modules
   - Manager conducts first 1:1 within 48 hours
   - New hire meets cross-functional team members

5. ROLE TRAINING (Days 6–14)
   - Manager delivers role-specific training sessions
   - New hire shadows relevant team members
   - Systems access is fully confirmed and tested

6. INDEPENDENT (Day 15+)
   - Manager signs off on readiness checklist
   - New hire operates independently on assigned work

TARGET: Full readiness sign-off by Day 21.`,
  },

  {
    id: "support",
    label: "Customer Support Resolution",
    brief: {
      businessName: "Clearline Software (Customer Success)",
      workflowName: "Support Ticket Resolution",
      painPoint:
        "Priority 1 and Priority 2 tickets regularly breach the 4-hour and 24-hour SLAs. Tickets stall after initial triage — they're acknowledged but then sit unworked for hours. Customer satisfaction scores have dropped 18 points over two quarters.",
      successMetric:
        "P1 tickets resolved or escalated within 4 hours. P2 tickets resolved within 24 hours. CSAT score above 4.2/5.0.",
      slaConstraint:
        "P1: first response within 15 minutes, resolution within 4 hours. P2: first response within 1 hour, resolution within 24 hours. P3: resolution within 5 business days.",
      currentStages: [
        "Submitted",
        "Triaged",
        "Assigned",
        "In Progress",
        "Pending Customer",
        "Resolved",
      ],
      availableEvidence: [
        "Zendesk ticket export with timestamps per stage",
        "Agent workload reports",
        "SLA breach logs",
        "CSAT survey responses",
      ],
      qualifiedLeadDefinition:
        "Any ticket from a paying customer with a confirmed account ID and a reproducible issue description.",
      suspectedStage:
        "Between Triaged and Assigned — tickets pile up in the triage queue and agents pick selectively, leaving high-priority items waiting.",
      biggestFrustration:
        "Agents don't have clear ownership. A ticket in 'Assigned' status might not be actively worked because the assigned agent is heads-down on something else and there's no re-routing rule.",
    },
    processNote: `Support ticket workflow is designed to operate as follows:

INTAKE
- All tickets auto-classified by priority via keyword rules on submission
- P1 tickets trigger a Slack alert to the on-call engineer immediately
- All tickets enter the Triaged queue within 5 minutes via automated routing

ASSIGNMENT
- Team lead reviews Triaged queue every 30 minutes during business hours
- P1 and P2 tickets are manually assigned to an available agent within 15 minutes
- P3 tickets are auto-assigned via round-robin

IN PROGRESS
- Assigned agent must acknowledge within 15 minutes (P1) or 1 hour (P2)
- Agent sends customer an initial response confirming they are investigating
- Agent updates internal notes every 2 hours for P1, every 4 hours for P2

ESCALATION
- If P1 is unresolved after 2 hours, escalate to senior engineer
- If P2 breaches 12 hours without resolution, flag to team lead

RESOLUTION
- Agent closes ticket with root cause and resolution steps documented
- CSAT survey sent automatically 2 hours after resolution
- Team lead reviews any ticket that received CSAT < 3/5`,
  },

  {
    id: "contracts",
    label: "Contract Approval",
    brief: {
      businessName: "Fortis Capital Partners (Legal & Finance)",
      workflowName: "Vendor Contract Review and Approval",
      painPoint:
        "Vendor contracts take an average of 47 days to fully execute from submission to signed agreement. Finance can't close vendor relationships on time, procurement deadlines are missed, and the legal team is the perceived bottleneck even though delays often originate in other departments.",
      successMetric:
        "Standard vendor contracts fully executed within 14 business days of submission. Complex contracts (custom terms) within 30 business days.",
      slaConstraint:
        "Legal must complete initial review within 3 business days. Finance must approve budgetary compliance within 2 business days. Executive signature must be obtained within 24 hours of full approval.",
      currentStages: [
        "Submitted",
        "Legal Review",
        "Finance Review",
        "Revisions",
        "Final Approval",
        "Executed",
      ],
      availableEvidence: [
        "Contract management system export with stage timestamps",
        "Revision round counts per contract",
        "Approver response time logs",
        "Escalation records",
      ],
      qualifiedLeadDefinition:
        "A contract submitted with complete vendor information, scope of work, contract value, and an assigned internal business owner.",
      suspectedStage:
        "Revisions stage — contracts bounce between legal and the vendor multiple times, and there is no cap on revision rounds or a forcing function to resolve open items.",
      biggestFrustration:
        "Nobody tracks where a contract is between stages. A contract 'in legal review' might be sitting in an attorney's inbox for 8 days with no one knowing it's blocked. There are no reminders, no escalation triggers, and no visibility.",
    },
    processNote: `Contract review process is intended to work as follows:

SUBMISSION
- Requestor submits contract via the procurement portal with: vendor name, contract value, start date, scope summary, and attached contract document
- System auto-assigns a contract ID and notifies the legal team lead
- Contracts above $250k are flagged for CFO review

LEGAL REVIEW (Target: 3 business days)
- Assigned attorney reviews contract against standard terms library
- Attorney marks up contract in redline and returns to requestor for vendor response OR approves as-is
- If redlined, contract moves to Revisions stage

FINANCE REVIEW (Target: 2 business days)
- Finance confirms budget availability and cost center coding
- Finance flags any payment terms that deviate from net-30 standard
- Finance approval is required before Final Approval stage

REVISIONS
- Requestor coordinates with vendor on legal redlines
- Each revision round restarts with legal for re-review
- No cap on revision rounds currently defined

FINAL APPROVAL
- Contracts <$100k: Department head signature
- Contracts $100k–$500k: VP + CFO signature
- Contracts >$500k: CEO signature required

EXECUTION
- Fully signed contract uploaded to contract management system
- Vendor onboarded in accounts payable within 3 business days of execution`,
  },
];
