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
      industry: "business",
      subIndustry: "general-biz",
      teamSize: "midsize",
      painPoint:
        "New hires consistently take 6-8 weeks to reach full productivity despite a stated target of 3 weeks. IT provisioning, manager introductions, and systems access are all delayed, leaving new employees idle or under-supported in their first month.",
      biggestFrustration:
        "Nobody owns the pre-boarding window. HR assumes IT will reach out, IT waits for HR to trigger the request, and the new hire sits in limbo until their first day.",
      successMetric:
        "New hire reaches independent productivity within 21 days of start date, measured by manager sign-off on a readiness checklist.",
      slaText:
        "IT access must be provisioned by end of day 1. Manager 1:1 must occur within 48 hours. All onboarding tasks must be complete by end of week 2.",
      slaThresholdHours: 24,
      currentStages: [
        "Offer Accepted",
        "Pre-boarding",
        "Day 1 Setup",
        "Orientation",
        "Role Training",
        "Independent",
      ],
      qualifiedLeadDefinition:
        "A full-time employee who has signed their offer letter and has a confirmed start date within the next 30 days.",
      suspectedStage:
        "Between offer acceptance and Day 1. Pre-boarding tasks are not being completed, so employees arrive unprepared and IT provisioning is delayed.",
      volumePerMonth: "~12 new hires per month across the company",
      valuePerItem: "~$15,000 in lost productivity per delayed hire (3 weeks of partial output)",
      currentTooling: "BambooHR for HR records, Jira for IT provisioning tickets, manual checklist in Notion",
      priorAttempts: "Tried a single shared onboarding doc but it was never updated; tried calendar invites for the first 1:1 but managers ignored them.",
      benchmarkCategoryId: "employee-onboarding",
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

TARGET: Full readiness sign-off by Day 21.

--- FILE: onboarding_cases_last_90_days.csv ---
hire_id,department,start_date,offer_to_start_days,it_ticket_opened_days_before_start,it_provisioned_by_day_1,manager_1on1_within_48h,orientation_completed_by_day_5,role_training_complete_by_day_14,days_to_independent,readiness_signoff_status
H-001,Engineering,2026-01-12,21,2,false,false,true,false,38,signed_off_late
H-002,Sales,2026-01-19,14,4,false,true,true,true,24,signed_off_late
H-003,Engineering,2026-01-26,10,1,false,false,false,false,46,still_pending
H-004,Marketing,2026-02-02,17,7,true,true,true,true,21,signed_off_on_time
H-005,Engineering,2026-02-02,12,0,false,false,true,false,41,signed_off_late
H-006,Customer Success,2026-02-09,18,3,false,true,true,true,28,signed_off_late
H-007,Finance,2026-02-09,21,8,true,true,true,true,20,signed_off_on_time
H-008,Engineering,2026-02-16,9,1,false,false,false,false,49,still_pending
H-009,Sales,2026-02-16,14,2,false,true,true,false,33,signed_off_late
H-010,Engineering,2026-02-23,12,0,false,false,true,false,42,signed_off_late
H-011,Product,2026-02-23,19,6,true,true,true,true,22,signed_off_on_time
H-012,Engineering,2026-03-02,11,1,false,false,true,false,39,signed_off_late
H-013,Sales,2026-03-02,15,3,false,true,true,true,27,signed_off_late
H-014,Customer Success,2026-03-09,17,5,true,true,true,true,21,signed_off_on_time
H-015,Engineering,2026-03-09,8,0,false,false,false,false,44,still_pending
H-016,Marketing,2026-03-16,16,4,false,true,true,true,29,signed_off_late
H-017,Engineering,2026-03-16,10,1,false,false,true,false,40,signed_off_late
H-018,Finance,2026-03-23,20,7,true,true,true,true,21,signed_off_on_time
H-019,Engineering,2026-03-23,13,2,false,false,true,false,37,signed_off_late
H-020,Sales,2026-03-30,14,3,false,true,true,false,31,signed_off_late
H-021,Engineering,2026-04-06,9,0,false,false,false,false,45,still_pending
H-022,Product,2026-04-06,18,5,true,true,true,true,23,signed_off_on_time
H-023,Engineering,2026-04-13,11,1,false,false,true,false,40,signed_off_late
H-024,Customer Success,2026-04-13,16,4,false,true,true,true,28,signed_off_late
H-025,Sales,2026-04-20,15,3,false,true,true,false,32,signed_off_late
--- END: onboarding_cases_last_90_days.csv ---

--- FILE: pre_boarding_handoff_log.txt ---
2026-02-16 H-008 Engineering hire: HR sent welcome email on offer-acceptance day. IT ticket was NOT opened by HR until day -1 (one business day before start). Laptop arrived day 4. Slack/email not provisioned until day 6. Manager could not run a real 1:1 until week 2. Hire is still in "Role Training" at day 49.
2026-02-23 H-010 Engineering hire: HR onboarding email sent same-day. IT ticket opened on start date itself. Manager assumed IT had been notified at offer; IT assumed manager would file the request. Hire idle for first 3 days.
2026-03-09 H-015 Engineering hire: same pattern. Manager out of office during pre-boarding window, no backup assigned. IT ticket opened day 0. No Day 1 setup completed. Orientation modules not assigned.
2026-04-06 H-021 Engineering hire: ticket opened day 0. Hire spent first week shadowing without credentials, manually copying data via screen-share.
PATTERN NOTE FROM HR LEAD (2026-04-15): "Every Engineering hire in the last 90 days had IT provisioning open less than 3 business days before start. Sales and Customer Success hires consistently have tickets opened 3+ days early and they hit Day 1 ready. The handoff between offer-acceptance and IT-ticket-creation is where engineering-hire pre-boarding falls apart."
--- END: pre_boarding_handoff_log.txt ---`,
  },

  {
    id: "support",
    label: "Customer Support Resolution",
    brief: {
      businessName: "Clearline Software (Customer Success)",
      workflowName: "Support Ticket Resolution",
      industry: "business",
      subIndustry: "tech-saas",
      teamSize: "midsize",
      painPoint:
        "Priority 1 and Priority 2 tickets regularly breach the 4-hour and 24-hour SLAs. Tickets stall after initial triage. They're acknowledged but then sit unworked for hours. Customer satisfaction scores have dropped 18 points over two quarters.",
      biggestFrustration:
        "Agents don't have clear ownership. A ticket in 'Assigned' status might not be actively worked because the assigned agent is heads-down on something else and there's no re-routing rule.",
      successMetric:
        "P1 tickets resolved or escalated within 4 hours. P2 tickets resolved within 24 hours. CSAT score above 4.2/5.0.",
      slaText:
        "P1: first response within 15 minutes, resolution within 4 hours. P2: first response within 1 hour, resolution within 24 hours. P3: resolution within 5 business days.",
      slaThresholdHours: 4,
      currentStages: [
        "Submitted",
        "Triaged",
        "Assigned",
        "In Progress",
        "Pending Customer",
        "Resolved",
      ],
      qualifiedLeadDefinition:
        "Any ticket from a paying customer with a confirmed account ID and a reproducible issue description.",
      suspectedStage:
        "Between Triaged and Assigned. Tickets pile up in the triage queue and agents pick selectively, leaving high-priority items waiting.",
      volumePerMonth: "~600 tickets per month, ~80 of them P1/P2",
      valuePerItem: "~$320 per ticket in agent time; SLA breaches risk ~$2,400 in churn-equivalent CSAT impact",
      currentTooling: "Zendesk for ticketing, Slack for on-call alerts, manual triage queue review",
      priorAttempts: "Tried round-robin auto-assignment but agents claimed it ignored expertise; tried a SLA breach dashboard but no one watched it.",
      benchmarkCategoryId: "support-ticket-resolution",
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
- Team lead reviews any ticket that received CSAT < 3/5

--- FILE: zendesk_export_p1_p2_last_30_days.csv ---
ticket_id,priority,customer_tier,submitted_at,first_response_minutes,minutes_in_triaged,minutes_in_assigned_before_work,total_resolution_hours,sla_breached,assigned_agent,csat
T-1001,P1,Enterprise,2026-04-01 09:14,12,4,18,3.8,false,Maya,5
T-1002,P1,Enterprise,2026-04-01 14:22,28,6,142,7.4,true,Devon,3
T-1003,P2,Mid-market,2026-04-02 08:51,44,12,310,28.2,true,Priya,3
T-1004,P1,Enterprise,2026-04-02 16:03,9,3,11,2.6,false,Maya,5
T-1005,P2,Mid-market,2026-04-03 10:18,52,18,265,21.4,false,Devon,4
T-1006,P1,Mid-market,2026-04-03 11:47,22,5,168,6.9,true,Sam,2
T-1007,P2,Enterprise,2026-04-04 09:02,38,14,295,26.8,true,Priya,3
T-1008,P1,Enterprise,2026-04-05 13:31,7,2,9,2.4,false,Maya,5
T-1009,P2,Mid-market,2026-04-06 08:44,49,16,288,25.1,true,Devon,3
T-1010,P1,Mid-market,2026-04-07 10:09,24,7,156,7.2,true,Sam,2
T-1011,P2,Enterprise,2026-04-08 11:55,41,13,272,23.6,false,Priya,4
T-1012,P1,Enterprise,2026-04-09 09:38,11,4,14,3.1,false,Maya,5
T-1013,P2,Mid-market,2026-04-10 14:21,46,17,299,27.3,true,Devon,3
T-1014,P1,Mid-market,2026-04-11 15:47,29,8,188,7.8,true,Sam,2
T-1015,P2,Enterprise,2026-04-12 10:33,42,15,281,24.9,true,Priya,3
T-1016,P1,Enterprise,2026-04-14 09:21,8,3,12,2.7,false,Maya,5
T-1017,P2,Mid-market,2026-04-15 13:18,55,19,315,29.4,true,Devon,2
T-1018,P1,Mid-market,2026-04-16 11:42,26,6,174,7.5,true,Sam,3
T-1019,P2,Enterprise,2026-04-17 08:55,39,14,278,25.8,true,Priya,3
T-1020,P1,Enterprise,2026-04-18 10:11,10,3,13,2.9,false,Maya,5
T-1021,P2,Mid-market,2026-04-19 14:08,47,18,302,28.1,true,Devon,2
T-1022,P1,Mid-market,2026-04-20 12:34,31,9,196,8.4,true,Sam,2
T-1023,P2,Enterprise,2026-04-21 09:47,40,15,285,25.4,true,Priya,3
T-1024,P1,Enterprise,2026-04-22 11:18,9,2,10,2.3,false,Maya,5
T-1025,P2,Mid-market,2026-04-23 13:52,53,20,308,27.9,true,Devon,3
T-1026,P1,Mid-market,2026-04-24 10:24,27,7,162,7.0,true,Sam,3
T-1027,P2,Enterprise,2026-04-25 09:11,43,16,290,26.2,true,Priya,3
T-1028,P1,Enterprise,2026-04-26 14:38,11,4,15,3.2,false,Maya,5
T-1029,P2,Mid-market,2026-04-27 11:05,50,19,295,28.7,true,Devon,2
T-1030,P1,Mid-market,2026-04-28 12:29,28,8,179,7.9,true,Sam,2
--- END: zendesk_export_p1_p2_last_30_days.csv ---

--- FILE: triage_to_assigned_audit_notes.txt ---
Audit window: 2026-04-01 through 2026-04-28 (30 P1, 30 P2 tickets sampled).
- First-response SLA met on 100% of P1, 100% of P2. Initial automated routing into Triaged works fine.
- The lag is in the *Assigned -> active work* transition, not in triage. Median time spent sitting in Assigned status before any agent touch: 174 min for P1 tickets that breached, 295 min for P2. P1 tickets handled by Maya consistently move from Assigned to In Progress in under 20 min and never breach. P1 tickets handled by Sam show 150-200 min sitting in Assigned. Same agent assignment, different absorption rates.
- Maya carries an average of 3 active tickets at a time. Sam carries an average of 11. Devon carries 9-13. Priya carries 8-10.
- There is no rule that re-assigns a ticket if it sits in Assigned for >30 min without an agent acknowledgement. There is no visible WIP cap.
- 22 of 23 SLA-breached tickets in this window had >120 min in the Assigned bucket before the agent first opened them. Only 1 breach was caused by long In-Progress work.
- CSAT for tickets that breached SLA averages 2.6/5. CSAT for tickets that hit SLA averages 4.7/5.
- The team lead reviews the Triaged queue every 30 min as designed, but does not look at the Assigned queue at all. There is no visibility on tickets that are technically owned but inactive.
--- END: triage_to_assigned_audit_notes.txt ---`,
  },

  {
    id: "contracts",
    label: "Contract Approval",
    brief: {
      businessName: "Fortis Capital Partners (Legal & Finance)",
      workflowName: "Vendor Contract Review and Approval",
      industry: "business",
      subIndustry: "financial",
      teamSize: "midsize",
      painPoint:
        "Vendor contracts take an average of 47 days to fully execute from submission to signed agreement. Finance can't close vendor relationships on time, procurement deadlines are missed, and the legal team is the perceived bottleneck even though delays often originate in other departments.",
      biggestFrustration:
        "Nobody tracks where a contract is between stages. A contract 'in legal review' might be sitting in an attorney's inbox for 8 days with no one knowing it's blocked. There are no reminders, no escalation triggers, and no visibility.",
      successMetric:
        "Standard vendor contracts fully executed within 14 business days of submission. Complex contracts (custom terms) within 30 business days.",
      slaText:
        "Legal must complete initial review within 3 business days. Finance must approve budgetary compliance within 2 business days. Executive signature must be obtained within 24 hours of full approval.",
      slaThresholdHours: 72,
      currentStages: [
        "Submitted",
        "Legal Review",
        "Finance Review",
        "Revisions",
        "Final Approval",
        "Executed",
      ],
      qualifiedLeadDefinition:
        "A contract submitted with complete vendor information, scope of work, contract value, and an assigned internal business owner.",
      suspectedStage:
        "Revisions stage. Contracts bounce between legal and the vendor multiple times, and there is no cap on revision rounds or a forcing function to resolve open items.",
      volumePerMonth: "~40 vendor contracts submitted per month",
      valuePerItem: "~$80,000 average contract value; delays cost ~$3,500 per contract in carrying time",
      currentTooling: "DocuSign CLM for execution, email + shared drive for review, ad-hoc Slack for escalation",
      priorAttempts: "Tried a SLA dashboard for legal review but no enforcement; tried a revision-round cap policy but it was overridden in practice.",
      benchmarkCategoryId: "contracts-approvals",
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
- Vendor onboarded in accounts payable within 3 business days of execution

--- FILE: vendor_contracts_q1_2026.csv ---
contract_id,vendor_category,contract_value_usd,submitted_date,days_in_legal_review,days_in_finance_review,revision_rounds,days_in_revisions,days_to_executive_signature,total_calendar_days,executed,blocked_stage
C-2001,SaaS,75000,2026-01-08,2,1,1,3,1,12,true,
C-2002,Professional Services,180000,2026-01-12,4,2,3,21,2,38,true,Revisions
C-2003,SaaS,45000,2026-01-15,2,1,0,0,1,9,true,
C-2004,Marketing Agency,320000,2026-01-19,3,2,4,29,3,49,true,Revisions
C-2005,Hardware,95000,2026-01-22,2,1,1,4,1,13,true,
C-2006,Professional Services,210000,2026-01-26,5,2,3,24,2,41,true,Revisions
C-2007,SaaS,55000,2026-01-29,3,1,1,5,1,14,true,
C-2008,Consulting,275000,2026-02-02,4,2,5,33,2,52,true,Revisions
C-2009,SaaS,38000,2026-02-05,2,1,0,0,1,8,true,
C-2010,Professional Services,165000,2026-02-09,5,2,4,28,2,46,true,Revisions
C-2011,Marketing Agency,140000,2026-02-12,3,2,3,22,1,37,true,Revisions
C-2012,SaaS,62000,2026-02-16,2,1,1,4,1,12,true,
C-2013,Consulting,380000,2026-02-19,6,3,5,36,3,57,true,Revisions
C-2014,Hardware,88000,2026-02-23,3,1,1,5,1,13,true,
C-2015,Professional Services,225000,2026-02-26,4,2,4,30,2,47,true,Revisions
C-2016,SaaS,42000,2026-03-02,2,1,0,0,1,8,true,
C-2017,Consulting,295000,2026-03-05,5,2,4,31,2,48,true,Revisions
C-2018,Marketing Agency,155000,2026-03-09,4,2,3,25,2,40,true,Revisions
C-2019,SaaS,71000,2026-03-12,3,1,1,4,1,12,true,
C-2020,Professional Services,195000,2026-03-16,5,2,3,26,2,42,true,Revisions
C-2021,Consulting,340000,2026-03-19,6,3,5,38,3,59,false,Revisions
C-2022,SaaS,48000,2026-03-23,2,1,0,0,1,9,true,
C-2023,Hardware,105000,2026-03-26,3,1,2,9,1,17,true,Revisions
C-2024,Professional Services,170000,2026-03-30,4,2,4,29,2,45,true,Revisions
C-2025,Marketing Agency,130000,2026-04-02,3,2,3,23,2,38,true,Revisions
C-2026,SaaS,58000,2026-04-06,2,1,1,5,1,13,true,
C-2027,Consulting,265000,2026-04-09,5,2,4,32,2,49,false,Revisions
C-2028,Professional Services,185000,2026-04-13,4,2,3,27,2,43,true,Revisions
C-2029,SaaS,52000,2026-04-16,3,1,1,4,1,12,true,
C-2030,Consulting,310000,2026-04-20,6,3,5,35,3,55,false,Revisions
C-2031,Hardware,92000,2026-04-23,3,1,1,5,1,14,true,
C-2032,Professional Services,200000,2026-04-27,5,2,4,30,0,42,false,Revisions
--- END: vendor_contracts_q1_2026.csv ---

--- FILE: contract_revision_email_audit.txt ---
Audit of revision-stage email threads, sample of 12 long-running contracts (Q1 2026):
- C-2002 (Professional Services, $180k): redline returned by legal day 6. Vendor responded day 11. Legal re-review took 4 days. Vendor counter day 19. Legal re-review took 3 days. Three full bounce cycles. No internal owner driving cadence with the vendor between rounds.
- C-2008 (Consulting, $275k): five revision rounds. Each round added 6-7 calendar days. Internal business owner copied on emails but never replied or followed up. Vendor's legal counsel went on vacation during round 3 — discovered only after a follow-up 9 days later.
- C-2013 (Consulting, $380k): six rounds of legal redline, none of them substantive after round 2. Most edits were clause-numbering and formatting. The standard-terms library is out of date — 4 of the redlines reverted clauses our own template still recommends.
- C-2021 (Consulting, $340k): not yet executed. Round 5 is pending vendor response for 14 days. No reminder triggered. No escalation rule.
- C-2027, C-2030, C-2032: same pattern. Stuck in revisions, no calendar-driven forcing function.
- All 8 SaaS-category contracts in this period executed within 14 days with at most one revision round. SaaS deals use a self-service standard MSA. Custom-terms deals (consulting, professional services, marketing agency, large hardware) average 4 revision rounds.

OBSERVATION FROM LEGAL TEAM LEAD: "Legal review itself is hitting its 3-business-day target on initial review. Re-reviews after vendor counter are also fast individually, average 3-4 days. The lost time is between us and the vendor — there is no SLA on vendor turnaround and no internal owner accountable for driving the back-and-forth. Contracts sit unanswered in vendor inboxes for 5-12 days at a time and we don't notice because there is no aging report on the Revisions stage."
--- END: contract_revision_email_audit.txt ---`,
  },
];
