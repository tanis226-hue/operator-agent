"use client";

import { useState, useRef } from "react";
import type { IntakeBrief } from "@/lib/intakeBrief";
import { DatabaseConnector } from "./DatabaseConnector";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Industry = "government" | "business" | "education" | "healthcare" | "other";
type TeamSize = "solo" | "small" | "midsize" | "large";

type WizardState = {
  industry: Industry | null;
  subIndustry: string | null;
  size: TeamSize | null;
  problemType: string | null;
  specificAnswers: Record<string, string>;
  context: string;
  uploadedFiles: Array<{ name: string; size: string }>;
};

// ─── Industry config ────────────────────────────────────────────────────────────

const INDUSTRIES: Array<{ id: Industry; label: string; desc: string; icon: string }> = [
  { id: "government", label: "Government",  desc: "Public sector, agencies, municipalities", icon: "🏛️" },
  { id: "business",   label: "Business",    desc: "B2B, B2C, startups, enterprises",         icon: "🏢" },
  { id: "education",  label: "Education",   desc: "Schools, universities, EdTech",            icon: "🎓" },
  { id: "healthcare", label: "Healthcare",  desc: "Providers, payers, health tech",           icon: "🏥" },
  { id: "other",      label: "Other",       desc: "Non-profit, research, and more",           icon: "💡" },
];

const BUSINESS_SUBTYPES: Array<{ id: string; label: string; desc: string }> = [
  { id: "tech-saas",     label: "Technology / SaaS",            desc: "Software, platforms, digital products" },
  { id: "retail",        label: "Retail & E-commerce",           desc: "Product sales, storefronts, marketplaces" },
  { id: "legal",         label: "Professional Services",         desc: "Law firms, consulting, accounting" },
  { id: "manufacturing", label: "Manufacturing & Supply Chain",  desc: "Production, logistics, distribution" },
  { id: "real-estate",   label: "Real Estate & Property",        desc: "Brokerages, property management" },
  { id: "financial",     label: "Financial Services",            desc: "Lending, insurance, fintech" },
  { id: "general-biz",   label: "General Business",              desc: "B2B, B2C, or doesn't fit above" },
];

const OTHER_SUBTYPES: Array<{ id: string; label: string; desc: string }> = [
  { id: "nonprofit",     label: "Non-profit / NGO",              desc: "Mission-driven orgs, charities" },
  { id: "research",      label: "Research / Academia",           desc: "Labs, think tanks, universities" },
  { id: "general",       label: "General / Other",               desc: "Something not listed above" },
];

const SIZES: Array<{ id: TeamSize; label: string; desc: string }> = [
  { id: "solo",    label: "Just me",      desc: "Freelancer or solo operator" },
  { id: "small",   label: "Small team",   desc: "2 – 20 people" },
  { id: "midsize", label: "Mid-size",     desc: "21 – 200 people" },
  { id: "large",   label: "Enterprise",   desc: "200+ people" },
];

// ─── Problem config ─────────────────────────────────────────────────────────────

type Question = {
  id: string;
  question: string;
  type: "cards" | "text";
  options?: string[];
  placeholder?: string;
};

type ProblemConfig = {
  id: string;
  label: string;
  desc: string;
  icon: string;
  workflowName: string;
  painPoint: string;
  successMetric: string;
  slaConstraint: string;
  stages: string[];
  qualifiedDef: string;
  suspectedStage: string;
  frustration: string;
  questions: Question[];
};

// ── Business problems ──────────────────────────────────────────────────────────
const BUSINESS_PROBLEMS: ProblemConfig[] = [
  {
    id: "sales", label: "Sales & Lead Conversion", desc: "Leads not converting, slow follow-up", icon: "📈",
    workflowName: "Lead Conversion Pipeline",
    painPoint: "Inbound leads are not converting to booked meetings and follow-up is inconsistent.",
    successMetric: "Increase lead-to-meeting conversion rate and reduce median first response time below SLA",
    slaConstraint: "First follow-up must occur within 4 hours of lead submission",
    stages: ["New Lead", "Contacted", "Qualified", "Meeting Booked", "Closed / Lost"],
    qualifiedDef: "A lead with verified contact information, minimum company size, and expressed interest",
    suspectedStage: "Initial outreach and first follow-up",
    frustration: "Leads go cold before reps follow up with no visibility into which are being ignored",
    questions: [
      { id: "breakdown", question: "Where does the process most often break down?", type: "cards",
        options: ["Initial outreach", "Lead qualification", "Follow-up sequences", "Closing the deal"] },
      { id: "tracking", question: "How does your team currently track leads?", type: "cards",
        options: ["CRM (Salesforce, HubSpot, etc.)", "Spreadsheet", "Email only", "No consistent system"] },
      { id: "response", question: "How long does it typically take to respond to a new lead?", type: "cards",
        options: ["Under 1 hour", "1 – 4 hours", "4 – 24 hours", "Over 24 hours"] },
    ],
  },
  {
    id: "onboarding-customer", label: "Customer Onboarding", desc: "Customers slow to activate, high drop-off", icon: "🤝",
    workflowName: "Customer Onboarding",
    painPoint: "Customers are taking too long to reach first value and many drop off before completing onboarding.",
    successMetric: "Reduce time-to-first-value and increase onboarding completion rate above 80%",
    slaConstraint: "Customers should complete core onboarding within 14 days of signing",
    stages: ["Account Created", "Kickoff", "Setup", "Training", "First Value", "Fully Active"],
    qualifiedDef: "A customer who has signed a contract and has a confirmed point of contact",
    suspectedStage: "Setup and initial training",
    frustration: "Customers get stuck on setup or go silent after the kickoff call",
    questions: [
      { id: "stuckPoint", question: "Where do customers most often get stuck or drop off?", type: "cards",
        options: ["Account setup / access", "Initial training", "Reaching first value", "Ongoing adoption"] },
      { id: "duration", question: "How long does full onboarding currently take?", type: "cards",
        options: ["Under 1 week", "1 – 4 weeks", "1 – 3 months", "Over 3 months"] },
      { id: "bottleneck", question: "What is the biggest internal bottleneck?", type: "cards",
        options: ["Too many manual handoffs", "Unclear ownership", "No standardized process", "Customer disengagement"] },
    ],
  },
  {
    id: "support", label: "Support & Ticket Resolution", desc: "Slow resolution, SLA misses, repeat issues", icon: "🎫",
    workflowName: "Support Ticket Resolution",
    painPoint: "Support tickets are taking too long to resolve, SLAs are being missed, and the same issues keep recurring.",
    successMetric: "Hit SLA targets on 90%+ of tickets and reduce repeat contact rate",
    slaConstraint: "P1 issues within 4 hours; P2 within 24 hours",
    stages: ["Submitted", "Triaged", "Assigned", "In Progress", "Escalated", "Resolved", "Closed"],
    qualifiedDef: "A ticket with a confirmed customer ID, issue description, and severity level",
    suspectedStage: "Triage and assignment",
    frustration: "Tickets sit unassigned, agents are unevenly loaded, and customers escalate before work starts",
    questions: [
      { id: "complaint", question: "What is the most common complaint?", type: "cards",
        options: ["Response time is too slow", "Issues keep recurring", "Handoffs between agents are broken", "No visibility into status"] },
      { id: "routing", question: "How are tickets currently routed to agents?", type: "cards",
        options: ["Auto-assignment by rules", "Manual triage by a lead", "First-come-first-served", "Ad hoc / no clear system"] },
      { id: "sla", question: "How often are SLA targets missed?", type: "cards",
        options: ["Rarely (under 10%)", "Sometimes (10 – 30%)", "Frequently (30 – 60%)", "Almost always (over 60%)"] },
    ],
  },
  {
    id: "approvals", label: "Contracts & Approvals", desc: "Deals stalling, slow review cycles", icon: "📋",
    workflowName: "Contract Approval Workflow",
    painPoint: "Contracts and approvals are getting stuck in review, slowing deal closures and creating friction.",
    successMetric: "Reduce average contract cycle time and eliminate stalls in the approval chain",
    slaConstraint: "Contracts must be fully executed within 14 days of initial submission",
    stages: ["Draft", "Internal Review", "Legal Review", "Finance Sign-off", "Executive Approval", "Sent to Counterpart", "Executed"],
    qualifiedDef: "A contract with confirmed counterpart details, scope, and commercial terms",
    suspectedStage: "Legal review and executive approval",
    frustration: "Contracts sit in someone's inbox for days with no action and no visibility",
    questions: [
      { id: "stallPoint", question: "Where do approvals most often stall?", type: "cards",
        options: ["Legal review", "Finance sign-off", "Executive approval", "Waiting on the other party"] },
      { id: "stakeholders", question: "How many stakeholders are typically in an approval chain?", type: "cards",
        options: ["2 – 3", "4 – 6", "7 or more", "Varies unpredictably"] },
      { id: "closeTime", question: "What is the average time to close a contract?", type: "cards",
        options: ["Under 1 week", "2 – 4 weeks", "1 – 3 months", "Over 3 months"] },
    ],
  },
  {
    id: "onboarding-employee", label: "HR & Employee Onboarding", desc: "New hires slow to ramp, early attrition", icon: "👥",
    workflowName: "Employee Onboarding",
    painPoint: "New employees are taking too long to become productive and early satisfaction scores are low.",
    successMetric: "Reduce time-to-productivity and improve new hire satisfaction at 30/60/90 days",
    slaConstraint: "New hires should complete all onboarding steps within their first 30 days",
    stages: ["Offer Accepted", "Pre-boarding", "Day 1", "First Week", "30-Day Review", "90-Day Review", "Fully Ramped"],
    qualifiedDef: "An employee who has signed an offer letter and has a confirmed start date",
    suspectedStage: "First week and initial training",
    frustration: "New hires are overwhelmed, unclear on expectations, and left without support",
    questions: [
      { id: "complaint", question: "What is the most common new hire complaint?", type: "cards",
        options: ["Information overload", "Unclear expectations or goals", "Tech setup delays", "Lack of manager support"] },
      { id: "rampTime", question: "How long until a new hire is fully productive?", type: "cards",
        options: ["Under 2 weeks", "2 – 4 weeks", "1 – 3 months", "Over 3 months"] },
      { id: "ownership", question: "Who owns the onboarding process?", type: "cards",
        options: ["HR only", "HR + hiring manager jointly", "Dedicated onboarding team", "No clear owner"] },
    ],
  },
  {
    id: "operations", label: "Operations & Fulfillment", desc: "Work getting stuck, missed deadlines", icon: "⚙️",
    workflowName: "Operations Workflow",
    painPoint: "Work items are getting stuck in the pipeline, deadlines are being missed, and throughput is inconsistent.",
    successMetric: "Increase on-time delivery rate and reduce average cycle time per work item",
    slaConstraint: "Work items must progress through each stage within defined time limits",
    stages: ["Intake", "Scoped", "Assigned", "In Progress", "QA / Review", "Delivered", "Closed"],
    qualifiedDef: "A request with a confirmed requester, clear scope, and defined deadline",
    suspectedStage: "Assignment and in-progress execution",
    frustration: "Work piles up with no clear priority and the same bottlenecks keep appearing",
    questions: [
      { id: "stuckStage", question: "Where does work most often get stuck?", type: "cards",
        options: ["Intake and scoping", "Assignment or scheduling", "Execution / in-progress", "QA, review, or approval"] },
      { id: "prioritization", question: "How is work currently prioritized?", type: "cards",
        options: ["SLA-based rules", "First in, first out", "Manager judgment", "Customer pressure / loudest voice"] },
      { id: "onTime", question: "What percentage of work items are delivered on time?", type: "cards",
        options: ["Over 80%", "60 – 80%", "40 – 60%", "Under 40%"] },
    ],
  },
  {
    id: "compliance", label: "Compliance & Reporting", desc: "Missed deadlines, rework, audit risk", icon: "📊",
    workflowName: "Compliance Reporting Process",
    painPoint: "Compliance reports are late, contain errors, and require significant rework before submission.",
    successMetric: "Achieve 100% on-time submission with zero material errors",
    slaConstraint: "All compliance reports must be submitted by their regulatory deadlines with no extensions",
    stages: ["Data Collection", "Validation", "Internal Review", "Approval", "Submission", "Confirmation"],
    qualifiedDef: "A report with complete data from all required sources and confirmed regulatory scope",
    suspectedStage: "Data collection and validation",
    frustration: "Data arrives late, errors are caught too late, and there is always a last-minute scramble",
    questions: [
      { id: "reworkCause", question: "What triggers the most rework or errors?", type: "cards",
        options: ["Incomplete or late data", "Inconsistent documentation", "Approval chain delays", "Deadline miscommunication"] },
      { id: "missedDeadlines", question: "How often are deadlines missed or at risk?", type: "cards",
        options: ["Rarely", "Sometimes", "Frequently", "Almost every cycle"] },
      { id: "impact", question: "Who is most impacted when this breaks down?", type: "cards",
        options: ["Leadership / board", "Regulators / auditors", "Customers or clients", "Internal operations"] },
    ],
  },
  {
    id: "other", label: "Something else", desc: "Describe your own workflow", icon: "💡",
    workflowName: "Custom Workflow", painPoint: "", successMetric: "", slaConstraint: "",
    stages: ["Start", "In Progress", "Review", "Complete"],
    qualifiedDef: "A qualified work item as defined by the business", suspectedStage: "", frustration: "",
    questions: [
      { id: "workflowDesc", question: "Describe your workflow in one sentence.", type: "text",
        placeholder: "e.g. We process insurance claims from submission through payout..." },
      { id: "successLooks", question: "What does success look like to you?", type: "text",
        placeholder: "e.g. Claims resolved in under 10 days with 95% accuracy..." },
      { id: "bottleneck", question: "Where do you think the biggest bottleneck is?", type: "text",
        placeholder: "e.g. Claims sit in manual review for 3 – 5 days before anyone acts..." },
    ],
  },
];

// ── Government problems ────────────────────────────────────────────────────────
const GOVERNMENT_PROBLEMS: ProblemConfig[] = [
  {
    id: "procurement", label: "Procurement & Contracting", desc: "Bids stalling, slow vendor approval", icon: "🏗️",
    workflowName: "Public Procurement Process",
    painPoint: "Procurement cycles are too long, vendor approvals are backlogged, and the process lacks transparency.",
    successMetric: "Reduce average procurement cycle time and improve vendor response compliance",
    slaConstraint: "Standard procurements must be awarded within 90 days of solicitation",
    stages: ["Requirement Defined", "Solicitation Published", "Bids Received", "Evaluation", "Award", "Contract Signed"],
    qualifiedDef: "A procurement request with a defined requirement, budget approval, and authorized requester",
    suspectedStage: "Bid evaluation and award decision",
    frustration: "Evaluations stall because stakeholders are unresponsive and there is no clear owner at each stage",
    questions: [
      { id: "breakdown", question: "Where does procurement most often get stuck?", type: "cards",
        options: ["Vendor qualification", "Bid evaluation", "Contract negotiation", "Approval and sign-off"] },
      { id: "tracking", question: "How are procurement requests currently managed?", type: "cards",
        options: ["Centralized procurement system", "Spreadsheets and email", "Paper-based process", "No standardized system"] },
      { id: "cycleTime", question: "What is your average procurement cycle time?", type: "cards",
        options: ["Under 30 days", "30 – 90 days", "90 – 180 days", "Over 180 days"] },
    ],
  },
  {
    id: "permitting", label: "Permitting & Licensing", desc: "Applications backlogged, slow approvals", icon: "📝",
    workflowName: "Permitting & Licensing Process",
    painPoint: "Permit and license applications are backlogged, review times are unpredictable, and applicants lack visibility.",
    successMetric: "Reduce average application processing time and clear the backlog",
    slaConstraint: "Standard applications should be processed within 30 business days of submission",
    stages: ["Application Submitted", "Completeness Check", "Technical Review", "Decision", "Issued / Denied", "Closed"],
    qualifiedDef: "A complete application with all required documents, fees paid, and a confirmed applicant",
    suspectedStage: "Technical review and decision",
    frustration: "Applications sit in review queues for weeks with no updates to applicants and no clear next action",
    questions: [
      { id: "stall", question: "Where do applications most often stall?", type: "cards",
        options: ["Initial completeness check", "Technical review", "Approval / sign-off", "Notifying the applicant"] },
      { id: "tracking", question: "How are applications currently tracked?", type: "cards",
        options: ["Case management system", "Spreadsheet", "Paper files", "No consistent system"] },
      { id: "cycleTime", question: "What is the average processing time per application?", type: "cards",
        options: ["Under 2 weeks", "2 – 6 weeks", "6 – 12 weeks", "Over 3 months"] },
    ],
  },
  {
    id: "constituent-services", label: "Constituent Services", desc: "Slow case resolution, frustrated residents", icon: "🏙️",
    workflowName: "Constituent Services Workflow",
    painPoint: "Constituent requests and cases are not being resolved in a timely manner and residents lack status visibility.",
    successMetric: "Reduce average case resolution time and increase constituent satisfaction scores",
    slaConstraint: "All constituent inquiries must receive an initial response within 2 business days",
    stages: ["Request Received", "Triaged", "Assigned", "In Progress", "Pending Info", "Resolved", "Closed"],
    qualifiedDef: "A constituent request with a confirmed contact, case type, and assigned jurisdiction",
    suspectedStage: "Triage and assignment",
    frustration: "Cases fall through the cracks, the same resident has to call multiple times, and staff don't know who owns what",
    questions: [
      { id: "requestType", question: "What type of constituent request takes the most time?", type: "cards",
        options: ["Benefits / assistance inquiries", "Complaint resolution", "Service requests (infrastructure, permits)", "Information requests"] },
      { id: "assignment", question: "How are cases currently assigned?", type: "cards",
        options: ["Auto-assignment by case type", "Manual routing by a coordinator", "First-come-first-served", "No clear assignment process"] },
      { id: "responseTime", question: "What is your current average response time?", type: "cards",
        options: ["Same day", "Within 3 business days", "Within 1 week", "Over 1 week"] },
    ],
  },
  {
    ...BUSINESS_PROBLEMS.find((p) => p.id === "compliance")!,
    label: "Compliance & Regulatory Reporting", desc: "Missed filings, audit risk, rework",
  },
  {
    ...BUSINESS_PROBLEMS.find((p) => p.id === "operations")!,
    label: "Internal Operations", desc: "Work getting stuck, service delivery delays",
  },
  { ...BUSINESS_PROBLEMS.find((p) => p.id === "other")! },
];

// ── Education problems ─────────────────────────────────────────────────────────
const EDUCATION_PROBLEMS: ProblemConfig[] = [
  {
    id: "enrollment", label: "Student Enrollment & Admissions", desc: "Applications backlogged, enrollment dropping", icon: "📝",
    workflowName: "Student Enrollment Process",
    painPoint: "Prospective students are dropping off during the admissions funnel and enrollment targets are being missed.",
    successMetric: "Increase enrollment yield rate and reduce time from application to enrollment confirmation",
    slaConstraint: "Admissions decisions must be communicated within 4 weeks of complete application",
    stages: ["Inquiry", "Application Started", "Application Complete", "Under Review", "Decision Sent", "Enrolled / Declined"],
    qualifiedDef: "An applicant who has submitted a complete application with all required documents",
    suspectedStage: "Document collection and admissions review",
    frustration: "Applications go incomplete with no follow-up and prospective students choose competitors due to slow communication",
    questions: [
      { id: "dropOff", question: "Where in the funnel do you lose the most prospective students?", type: "cards",
        options: ["Application submission (never finish)", "Document collection", "Admissions review", "Enrollment confirmation"] },
      { id: "tracking", question: "How are applications currently processed?", type: "cards",
        options: ["Dedicated enrollment platform (Slate, etc.)", "Spreadsheet / email", "Paper forms", "Multiple disconnected systems"] },
      { id: "friction", question: "What is the biggest friction point for applicants?", type: "cards",
        options: ["Complex application requirements", "Slow response from admissions", "Document submission confusion", "Unclear next steps"] },
    ],
  },
  {
    id: "student-support", label: "Student Support & Advising", desc: "Students falling through the cracks", icon: "🎓",
    workflowName: "Student Support Process",
    painPoint: "Students in need are not being identified early enough and support services are not reaching them in time.",
    successMetric: "Reduce early alert response time and improve at-risk student retention rate",
    slaConstraint: "At-risk students should be contacted by an advisor within 2 business days of flagging",
    stages: ["Student Flagged / Self-Refers", "Intake", "Assigned to Advisor", "Support Plan Created", "Follow-up", "Case Closed"],
    qualifiedDef: "A student who has been flagged by an early alert system, instructor, or self-referred for support",
    suspectedStage: "Referral intake and advisor assignment",
    frustration: "Advisors are overloaded, flags sit unactioned, and students disengage before help arrives",
    questions: [
      { id: "gap", question: "Where do students most often fall through the cracks?", type: "cards",
        options: ["Early academic struggles not flagged", "Financial aid issues escalating", "Mental health / personal concerns", "Career or course planning gaps"] },
      { id: "tracking", question: "How are student support cases currently tracked?", type: "cards",
        options: ["Student information system (Banner, etc.)", "Advisor spreadsheets", "Email only", "No consistent tracking"] },
      { id: "barrier", question: "What is the biggest barrier to students getting help?", type: "cards",
        options: ["Long wait times for appointments", "Unclear who to contact", "Limited advisor availability", "Students don't know support exists"] },
    ],
  },
  {
    id: "faculty-onboarding", label: "Faculty & Staff Onboarding", desc: "New hires slow to ramp, administrative delays", icon: "👩‍🏫",
    workflowName: "Faculty & Staff Onboarding",
    painPoint: "New faculty and staff are delayed in getting access to systems and support, slowing their ability to contribute.",
    successMetric: "Reduce time-to-operational for new faculty and improve first-semester satisfaction scores",
    slaConstraint: "New hires should have all system access and required training completed before their first day of instruction",
    stages: ["Offer Accepted", "Paperwork / Compliance", "IT Access Provisioned", "Orientation", "Department Integration", "Fully Active"],
    qualifiedDef: "A new hire who has completed HR paperwork and has a confirmed start date",
    suspectedStage: "IT provisioning and orientation",
    frustration: "New faculty show up on day one without system access, unclear on expectations, and unsupported",
    questions: [
      { id: "complaint", question: "What is the most common new hire complaint?", type: "cards",
        options: ["IT and system access delays", "Unclear expectations and policies", "Administrative paperwork burden", "Lack of departmental support"] },
      { id: "rampTime", question: "How long until new faculty are fully operational?", type: "cards",
        options: ["Before start date", "First week", "First month", "Over a semester"] },
      { id: "ownership", question: "Who owns the onboarding process?", type: "cards",
        options: ["HR only", "Department + HR jointly", "Department chair alone", "No clear owner"] },
    ],
  },
  {
    id: "accreditation", label: "Accreditation & Compliance", desc: "Reporting overwhelming, audit risk", icon: "📋",
    workflowName: "Accreditation & Compliance Reporting",
    painPoint: "Accreditation and compliance reporting is consuming excessive staff time, producing errors, and creating audit risk.",
    successMetric: "Submit all required reports on time with zero material findings from accreditors",
    slaConstraint: "All accreditation documentation must be submitted 30 days before review deadlines",
    stages: ["Data Request Sent", "Data Collection", "Validation", "Internal Review", "Approval", "Submitted", "Confirmed"],
    qualifiedDef: "A report with complete data from all required departments and validated against the standard",
    suspectedStage: "Data collection across departments",
    frustration: "Departments submit data late or in the wrong format, requiring multiple rounds of correction under deadline pressure",
    questions: [
      { id: "bottleneck", question: "What causes the most delays in your reporting process?", type: "cards",
        options: ["Departments submitting data late", "Inconsistent data formats", "Internal review and approval delays", "Unclear ownership of sections"] },
      { id: "frequency", question: "How often do you miss or nearly miss a reporting deadline?", type: "cards",
        options: ["Never", "Occasionally", "Most cycles", "Every cycle"] },
      { id: "coordination", question: "How many departments or units contribute data to your reports?", type: "cards",
        options: ["1 – 3", "4 – 8", "9 – 15", "Over 15"] },
    ],
  },
  {
    ...BUSINESS_PROBLEMS.find((p) => p.id === "operations")!,
    label: "Administrative Operations", desc: "Requests stalling, processes unclear",
  },
  { ...BUSINESS_PROBLEMS.find((p) => p.id === "other")! },
];

// ── Healthcare problems ────────────────────────────────────────────────────────
const HEALTHCARE_PROBLEMS: ProblemConfig[] = [
  {
    id: "patient-intake", label: "Patient Intake & Access", desc: "Long waits, scheduling friction", icon: "🏥",
    workflowName: "Patient Intake & Scheduling",
    painPoint: "New patients face long wait times and scheduling friction, reducing access to care and damaging patient satisfaction.",
    successMetric: "Reduce new patient wait time and increase scheduling completion rate",
    slaConstraint: "New patient appointments should be scheduled within 14 days of initial contact",
    stages: ["Patient Contacts Practice", "Insurance Verified", "Intake Forms Sent", "Forms Completed", "Appointment Scheduled", "Visit Completed"],
    qualifiedDef: "A patient with verified insurance, completed intake forms, and a confirmed care need",
    suspectedStage: "Insurance verification and intake form completion",
    frustration: "Patients call multiple times, intake forms are returned incomplete, and the scheduling team is constantly chasing information",
    questions: [
      { id: "breakdown", question: "Where does intake most often break down?", type: "cards",
        options: ["Scheduling availability", "Insurance verification delays", "Intake paperwork completion", "Day-of check-in issues"] },
      { id: "complaint", question: "What is the most common patient complaint?", type: "cards",
        options: ["Wait times are too long", "Difficulty getting an appointment", "Too much paperwork", "Communication gaps"] },
      { id: "waitTime", question: "What is your average wait time for a new patient appointment?", type: "cards",
        options: ["Same week", "1 – 2 weeks", "2 – 4 weeks", "Over 4 weeks"] },
    ],
  },
  {
    id: "prior-auth", label: "Prior Authorization", desc: "Delays, denials, administrative burden", icon: "💊",
    workflowName: "Prior Authorization Process",
    painPoint: "Prior authorization requests are creating delays in patient care and consuming excessive staff time on submissions and appeals.",
    successMetric: "Reduce prior auth turnaround time and decrease denial rate",
    slaConstraint: "Urgent prior auth requests must be submitted within 24 hours of clinical determination",
    stages: ["Clinical Determination", "Auth Request Submitted", "Payer Review", "Decision Received", "Appeals (if denied)", "Care Authorized"],
    qualifiedDef: "A prior auth request with completed clinical documentation and confirmed patient eligibility",
    suspectedStage: "Payer review and initial decision",
    frustration: "Denials arrive with no clear reason, appeals take weeks, and staff spend hours on the phone with payers",
    questions: [
      { id: "authType", question: "Which types of auth requests are most frequently delayed?", type: "cards",
        options: ["Specialty medications", "Imaging / diagnostics", "Procedures and surgery", "Specialist referrals"] },
      { id: "turnaround", question: "What is your average prior auth turnaround time?", type: "cards",
        options: ["Under 2 days", "2 – 5 days", "1 – 2 weeks", "Over 2 weeks"] },
      { id: "denialCause", question: "What causes the most denials or delays?", type: "cards",
        options: ["Missing clinical documentation", "Incorrect coding", "Payer-specific criteria gaps", "Staff capacity constraints"] },
    ],
  },
  {
    id: "claims", label: "Claims & Billing", desc: "High denial rate, slow AR resolution", icon: "💰",
    workflowName: "Claims & Revenue Cycle",
    painPoint: "Claim denials are high, AR is aging, and rework is consuming billing staff capacity.",
    successMetric: "Increase first-pass claim acceptance rate above 95% and reduce AR over 90 days",
    slaConstraint: "Claims must be submitted within 48 hours of service and denials worked within 5 business days",
    stages: ["Service Rendered", "Coded", "Claim Submitted", "Payer Adjudication", "Payment Posted / Denial", "Appeals", "Closed"],
    qualifiedDef: "A claim with a confirmed service date, accurate coding, and verified patient insurance",
    suspectedStage: "Coding and initial claim submission",
    frustration: "The same denial reasons keep appearing, rework cycles are long, and aging AR is building up with no clear owner",
    questions: [
      { id: "denialReason", question: "What is your most common reason for claim denial?", type: "cards",
        options: ["Missing or incomplete documentation", "Coding errors (wrong code / modifier)", "Eligibility or authorization issues", "Timely filing violations"] },
      { id: "firstPass", question: "What is your current first-pass claim acceptance rate?", type: "cards",
        options: ["Over 95%", "90 – 95%", "80 – 90%", "Under 80%"] },
      { id: "arResolution", question: "How long does AR resolution typically take?", type: "cards",
        options: ["Under 30 days", "30 – 60 days", "60 – 90 days", "Over 90 days"] },
    ],
  },
  {
    id: "staff-onboarding", label: "Staff Onboarding & Credentialing", desc: "New hires delayed, credentialing backlog", icon: "👩‍⚕️",
    workflowName: "Clinical Staff Onboarding & Credentialing",
    painPoint: "New clinical staff are delayed in starting due to credentialing bottlenecks and incomplete onboarding processes.",
    successMetric: "Reduce time from hire to fully credentialed and reduce onboarding-related delays",
    slaConstraint: "Credentialing should be completed within 60 days of hire for new clinical staff",
    stages: ["Offer Accepted", "Credentialing Started", "Background / Verification", "Privileges Granted", "Orientation", "Fully Active"],
    qualifiedDef: "A new hire with a signed offer letter and all required credentialing documents submitted",
    suspectedStage: "Credentialing verification and privileges",
    frustration: "Credentialing takes months longer than expected, new staff can't see patients, and revenue is being lost",
    questions: [
      { id: "delay", question: "What causes the most delays in onboarding new clinical staff?", type: "cards",
        options: ["Credentialing verification", "Background check delays", "IT system access provisioning", "Training and orientation scheduling"] },
      { id: "credentialTime", question: "How long does credentialing currently take on average?", type: "cards",
        options: ["Under 30 days", "30 – 60 days", "60 – 90 days", "Over 90 days"] },
      { id: "ownership", question: "Who owns the credentialing process?", type: "cards",
        options: ["Dedicated credentialing team", "HR only", "Department head", "Shared / no clear owner"] },
    ],
  },
  {
    id: "healthcare-compliance", label: "Compliance & Documentation", desc: "HIPAA, audit risk, documentation gaps", icon: "📋",
    workflowName: "Healthcare Compliance & Documentation",
    painPoint: "Compliance documentation is incomplete, audit preparation is reactive, and documentation gaps are creating risk.",
    successMetric: "Achieve zero documentation deficiencies in audits and reduce compliance rework rate",
    slaConstraint: "All required compliance documentation must be updated within 48 hours of a triggering event",
    stages: ["Policy Update / Trigger", "Documentation Updated", "Review", "Sign-off", "Training Completed", "Confirmed Compliant"],
    qualifiedDef: "A compliance item with a confirmed regulatory requirement, assigned owner, and due date",
    suspectedStage: "Documentation update and staff training",
    frustration: "Documentation is updated reactively after incidents, staff training lags policy changes, and audits reveal gaps",
    questions: [
      { id: "riskArea", question: "What is your highest compliance risk area?", type: "cards",
        options: ["HIPAA / privacy documentation", "Clinical documentation completeness", "Staff training and policy acknowledgment", "Third-party vendor compliance"] },
      { id: "auditPrep", question: "How do you typically prepare for audits?", type: "cards",
        options: ["Ongoing continuous compliance program", "Quarterly compliance reviews", "Reactive / audit-driven only", "No formal process"] },
      { id: "docGaps", question: "How often are documentation gaps discovered?", type: "cards",
        options: ["Rarely, caught proactively", "During scheduled reviews", "During audits only", "After incidents"] },
    ],
  },
  { ...BUSINESS_PROBLEMS.find((p) => p.id === "other")! },
];

// ── Problem map by industry ────────────────────────────────────────────────────
const PROBLEMS_BY_INDUSTRY: Record<Industry, ProblemConfig[]> = {
  government: GOVERNMENT_PROBLEMS,
  business:   BUSINESS_PROBLEMS,
  education:  EDUCATION_PROBLEMS,
  healthcare: HEALTHCARE_PROBLEMS,
  other:      BUSINESS_PROBLEMS,
};

// ─── Brief builder ─────────────────────────────────────────────────────────────

function buildBriefFromWizard(
  industry: Industry,
  subIndustry: string | null,
  size: TeamSize,
  problemType: string,
  specificAnswers: Record<string, string>,
  context: string
): { brief: IntakeBrief; processNote: string } {
  const allProblems = [...BUSINESS_PROBLEMS, ...GOVERNMENT_PROBLEMS, ...EDUCATION_PROBLEMS, ...HEALTHCARE_PROBLEMS];
  const config = allProblems.find((p) => p.id === problemType) ?? BUSINESS_PROBLEMS.find((p) => p.id === "other")!;
  const industryLabel = INDUSTRIES.find((i) => i.id === industry)?.label ?? industry;
  const allSubtypes = [...BUSINESS_SUBTYPES, ...OTHER_SUBTYPES];
  const subLabel = subIndustry ? allSubtypes.find((s) => s.id === subIndustry)?.label : null;
  const sizeLabel = SIZES.find((s) => s.id === size)?.label ?? size;
  const isOther = problemType === "other";

  const q = config.questions;
  const ans0 = specificAnswers[q[0]?.id] ?? "";
  const ans1 = specificAnswers[q[1]?.id] ?? "";
  const ans2 = specificAnswers[q[2]?.id] ?? "";

  const brief: IntakeBrief = {
    businessName: subLabel ? `${subLabel} · ${sizeLabel}` : `${industryLabel} · ${sizeLabel}`,
    workflowName: isOther && ans0 ? ans0 : config.workflowName,
    painPoint: isOther ? `${ans0}. Goal: ${ans1}` : config.painPoint,
    successMetric: isOther ? ans1 || config.successMetric : config.successMetric,
    slaConstraint: config.slaConstraint,
    currentStages: config.stages,
    qualifiedLeadDefinition: config.qualifiedDef,
    suspectedStage: isOther ? ans2 : (ans0 || config.suspectedStage),
    biggestFrustration: isOther ? ans2 : (ans2 || ans1 || config.frustration),
    availableEvidence: [],
  };

  const answerLines = q
    .filter((question) => specificAnswers[question.id])
    .map((question) => `- ${question.question}\n  → ${specificAnswers[question.id]}`);

  const processNote = [
    "INTAKE WIZARD CONTEXT",
    `Industry: ${subLabel ? `${industryLabel} (${subLabel})` : industryLabel}`,
    `Team size: ${sizeLabel}`,
    `Workflow: ${config.workflowName}`,
    "",
    "ASSESSMENT ANSWERS:",
    ...answerLines,
    ...(context.trim() ? ["", "ADDITIONAL CONTEXT:", context.trim()] : []),
  ].join("\n");

  return { brief, processNote };
}

// ─── Main component ────────────────────────────────────────────────────────────

type Props = {
  onComplete: (result: { brief: IntakeBrief; processNote: string }) => void;
  onBack: () => void;
};

export function OnboardingWizard({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(1);
  const [showSubIndustry, setShowSubIndustry] = useState(false);
  const [answers, setAnswers] = useState<WizardState>({
    industry: null,
    subIndustry: null,
    size: null,
    problemType: null,
    specificAnswers: {},
    context: "",
    uploadedFiles: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 5;
  const problemList = answers.industry ? PROBLEMS_BY_INDUSTRY[answers.industry] : BUSINESS_PROBLEMS;
  const config = answers.problemType
    ? [...BUSINESS_PROBLEMS, ...GOVERNMENT_PROBLEMS, ...EDUCATION_PROBLEMS, ...HEALTHCARE_PROBLEMS]
        .find((p) => p.id === answers.problemType) ?? null
    : null;

  const allSpecificAnswered =
    config !== null &&
    config.questions.every((q) => !!answers.specificAnswers[q.id]?.trim());

  function selectIndustry(id: Industry) {
    setAnswers((a) => ({ ...a, industry: id, subIndustry: null, problemType: null, specificAnswers: {} }));
    if (id === "other" || id === "business") {
      setShowSubIndustry(true);
    } else {
      setShowSubIndustry(false);
      setTimeout(() => setStep(2), 120);
    }
  }

  function selectSubIndustry(id: string) {
    setAnswers((a) => ({ ...a, subIndustry: id }));
    // Batch both updates so there is no intermediate render that flashes the bare industry list
    setShowSubIndustry(false);
    setStep(2);
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    for (const file of files) {
      const text = await file.text();
      const block = `\n\n--- FILE: ${file.name} ---\n${text}\n--- END: ${file.name} ---`;
      setAnswers((a) => ({
        ...a,
        context: a.context ? a.context + block : block.trimStart(),
        uploadedFiles: [...a.uploadedFiles, { name: file.name, size: formatFileSize(file.size) }],
      }));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleRemoveFile(name: string) {
    setAnswers((a) => {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\n*--- FILE: ${escaped} ---[\\s\\S]*?--- END: ${escaped} ---\\n*`, "g");
      return {
        ...a,
        context: a.context.replace(regex, "").trim(),
        uploadedFiles: a.uploadedFiles.filter((f) => f.name !== name),
      };
    });
  }

  function handleStart() {
    if (!answers.industry || !answers.size || !answers.problemType) return;
    onComplete(
      buildBriefFromWizard(
        answers.industry,
        answers.subIndustry,
        answers.size,
        answers.problemType,
        answers.specificAnswers,
        answers.context
      )
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={step > 1 ? () => { setStep((s) => s - 1); setShowSubIndustry(false); } : onBack}
          className="mr-1 text-[13px] text-ink-muted transition hover:text-ink"
        >
          ← Back
        </button>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={[
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              i < step ? "bg-accent" : "bg-line",
            ].join(" ")}
          />
        ))}
        <span className="ml-1 text-[12px] tabular-nums text-ink-muted">
          {step}&nbsp;/&nbsp;{totalSteps}
        </span>
      </div>

      {/* Step 1: Industry */}
      {step === 1 && (
        <WizardStep title="What best describes your organization?">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {INDUSTRIES.map((ind) => (
              <OptionCard
                key={ind.id}
                icon={ind.icon}
                label={ind.label}
                desc={ind.desc}
                selected={answers.industry === ind.id}
                onClick={() => selectIndustry(ind.id)}
              />
            ))}
          </div>

          {/* Sub-type clarification for Business and Other */}
          {showSubIndustry && (
            <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6">
              <p className="text-[15px] font-medium text-ink">
                Which best describes your field?
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(answers.industry === "business" ? BUSINESS_SUBTYPES : OTHER_SUBTYPES).map((sub) => (
                  <OptionCard
                    key={sub.id}
                    label={sub.label}
                    desc={sub.desc}
                    selected={answers.subIndustry === sub.id}
                    onClick={() => selectSubIndustry(sub.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </WizardStep>
      )}

      {/* Step 2: Size */}
      {step === 2 && (
        <WizardStep title="How big is your team?">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SIZES.map((s) => (
              <OptionCard
                key={s.id}
                label={s.label}
                desc={s.desc}
                selected={answers.size === s.id}
                onClick={() => {
                  setAnswers((a) => ({ ...a, size: s.id }));
                  setTimeout(() => setStep(3), 120);
                }}
              />
            ))}
          </div>
        </WizardStep>
      )}

      {/* Step 3: Problem type */}
      {step === 3 && (
        <WizardStep title="What process is broken?">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {problemList.map((p) => (
              <OptionCard
                key={p.id}
                icon={p.icon}
                label={p.label}
                desc={p.desc}
                selected={answers.problemType === p.id}
                onClick={() => {
                  setAnswers((a) => ({ ...a, problemType: p.id, specificAnswers: {} }));
                  setTimeout(() => setStep(4), 120);
                }}
              />
            ))}
          </div>
        </WizardStep>
      )}

      {/* Step 4: Specific questions */}
      {step === 4 && config && (
        <WizardStep title="A few quick questions">
          <div className="flex flex-col gap-7">
            {config.questions.map((q) => (
              <div key={q.id} className="flex flex-col gap-3">
                <p className="text-[15px] font-medium text-ink">{q.question}</p>
                {q.type === "cards" && q.options ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setAnswers((a) => ({
                            ...a,
                            specificAnswers: { ...a.specificAnswers, [q.id]: opt },
                          }))
                        }
                        className={[
                          "rounded-lg border px-4 py-3 text-left text-[13px] transition",
                          answers.specificAnswers[q.id] === opt
                            ? "border-accent bg-accent-soft font-medium text-accent"
                            : "border-line bg-canvas text-ink hover:border-accent/40 hover:bg-surface",
                        ].join(" ")}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answers.specificAnswers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((a) => ({
                        ...a,
                        specificAnswers: { ...a.specificAnswers, [q.id]: e.target.value },
                      }))
                    }
                    placeholder={q.placeholder}
                    rows={2}
                    className="w-full resize-y rounded-md border border-line bg-canvas px-3 py-2 text-[13px] leading-relaxed text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(5)}
              disabled={!allSpecificAnswered}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[13px] font-semibold text-white shadow-btn transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        </WizardStep>
      )}

      {/* Step 5: Data & Context */}
      {step === 5 && (
        <WizardStep
          title="Add your data and context"
          subtitle="Upload files or paste text. The more operational detail you provide, the more specific and actionable the analysis."
        >
          {/* Database connector */}
          <DatabaseConnector
            disabled={false}
            onData={(label, tsv, rowCount) => {
              const block = `\n\n--- DB QUERY: ${label} (${rowCount} rows) ---\n${tsv}\n--- END DB QUERY ---`;
              setAnswers((a) => ({
                ...a,
                context: a.context ? a.context + block : block.trimStart(),
                uploadedFiles: [...a.uploadedFiles, { name: `DB: ${label.slice(0, 40)}`, size: `${rowCount} rows` }],
              }));
            }}
          />

          {/* Drop-zone / upload area */}
          <div className="relative flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-line bg-canvas px-6 py-8 text-center transition hover:border-accent/50">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.md,.csv,.json,.tsv,.log,text/plain,text/markdown,text/csv,application/json"
              onChange={handleFileUpload}
              className="absolute inset-0 cursor-pointer opacity-0"
              id="wizard-file-upload"
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-xl">📎</div>
            <div>
              <p className="text-[14px] font-medium text-ink">Drop files here or click to browse</p>
              <p className="mt-0.5 text-[12px] text-ink-muted">CSV, JSON, TXT, MD, TSV · Multiple files accepted</p>
            </div>
          </div>

          {/* Uploaded file chips */}
          {answers.uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {answers.uploadedFiles.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[12px] text-ink"
                >
                  <span>📄 {f.name}</span>
                  <span className="text-ink-muted">{f.size}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(f.name)}
                    className="ml-0.5 text-ink-muted hover:text-red-500"
                    aria-label={`Remove ${f.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Paste / text area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
              Or paste context directly
            </label>
            <textarea
              value={answers.uploadedFiles.length > 0
                ? answers.context.replace(/\n*--- FILE:[\s\S]*?--- END:[^\n]*---\n*/g, "").trim()
                : answers.context}
              onChange={(e) => {
                const fileBlocks = answers.uploadedFiles
                  .map((f) => {
                    const escaped = f.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                    const match = answers.context.match(new RegExp(`--- FILE: ${escaped} ---[\\s\\S]*?--- END: ${escaped} ---`));
                    return match ? match[0] : "";
                  })
                  .filter(Boolean)
                  .join("\n\n");
                const combined = [e.target.value.trim(), fileBlocks].filter(Boolean).join("\n\n");
                setAnswers((a) => ({ ...a, context: combined }));
              }}
              rows={5}
              placeholder="Paste process docs, SOPs, team notes, metrics, escalation history, or anything that gives context about how this workflow actually runs."
              className="w-full resize-y rounded-md border border-line bg-canvas px-3 py-3 text-[13px] leading-relaxed text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-[13px] font-semibold text-white shadow-btn transition hover:bg-accent-hover"
            >
              Start Analysis →
            </button>
          </div>
        </WizardStep>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function WizardStep({
  title, subtitle, children,
}: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function OptionCard({
  icon, label, desc, selected, onClick,
}: {
  icon?: string; label: string; desc: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex flex-col gap-1.5 rounded-xl border p-4 text-left transition",
        selected
          ? "border-accent bg-accent-soft shadow-sm"
          : "border-line bg-surface hover:border-accent/40 hover:bg-canvas",
      ].join(" ")}
    >
      {icon && <span className="text-2xl leading-none">{icon}</span>}
      <span className={["text-[14px] font-semibold", selected ? "text-accent" : "text-ink"].join(" ")}>
        {label}
      </span>
      <span className="text-[12px] leading-snug text-ink-muted">{desc}</span>
    </button>
  );
}
