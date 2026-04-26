# Operator Agent MVP Spec

> **Naming note (April 2026).** This document was written during the early build phase. The repository / internal codename is still `operator-agent`, but the user-facing product name is now **OpsAdvisor**. Read every reference to "Operator Agent" below as the product now shipped as **OpsAdvisor**. The MVP scope, workflow anchor (Lead Intake and Conversion Bottleneck), and output contracts described here are still authoritative for the active demo.

## 1) Project Overview

**Project name:** Operator Agent  
**Category:** Process-improvement product  
**Build context:** Built for the “Built with Opus 4.7: a Claude Code hackathon”  
**Build mode:** Lean, solo-buildable, hackathon-ready MVP

Operator Agent is an operational diagnosis and improvement product built for owners and operators. It takes a operational problem, a structured context brief, and a small set of process evidence, then runs a full DMAIC-style improvement loop from intake to control.

For the MVP, Operator Agent is focused on a single workflow: **Lead Intake and Conversion Bottleneck**. The product analyzes where leads are stalling or dropping out, identifies the highest-impact operational breakdown, recommends the most practical fix, and leaves behind a control package so the issue does not return.

The point of the MVP is not to show a generic chatbot or an analytics dashboard. The point is to show a clear operational diagnosis, a credible first fix, and a monitoring package that a operator could actually use.

## 2) Core Product Promise

**Operator Agent helps a business owner diagnose why leads are stalling in the Lead Intake and Conversion Bottleneck workflow, identify the highest-impact operational fix, and leave behind controls to improve conversion and prevent leakage from returning.**

Externally, the product should feel like:
- a tool for operational clarity
- a tool for practical next steps
- a tool for durable accountability

Internally, the product is powered by a DMAIC-style structure:
1. Context Intake
2. Define
3. Measure
4. Analyze
5. Improve
6. Control

DMAIC is the engine, not the headline.

## 3) Anchor Workflow

**Public-facing workflow name:** Lead Intake and Conversion Bottleneck  
**Internal framing only (not for live UI/demo labels):** Customer Acquisition Pipeline Leakage

### Workflow definition
A business is generating inbound leads, but too many opportunities receive slow or inconsistent follow-up, stall between stages, or drop out before a booked meeting. Leadership can see that results are underperforming, but cannot clearly tell:
- where the workflow is breaking down
- which factor is causing the most leakage
- what change would recover the most value
- how to make the fix stick

### Primary failure story
For the MVP, the dominant operational issue is:

**Slow or inconsistent follow-up causes avoidable drop-off before booked meeting.**

This is intentionally specific enough to support a convincing diagnosis, but broad enough to apply across many businesses.

### Supported contributing factors
The MVP may surface supporting contributors such as:
- missed follow-up
- delayed first response
- unclear ownership
- excessive handoffs
- missing lead information
- source or owner-specific performance variance

These are supporting diagnostics. They should not dilute the primary narrative.

## 4) Primary User

The primary user is:

**A business owner, business administrator, or department head responsible for an underperforming lead intake / customer acquisition workflow, but without the time to run a full manual process-improvement project.**

### What this user cares about
The user does not primarily care about DMAIC terminology, orchestration design, or technical elegance.

The user cares about:
- understanding what is actually broken
- knowing what to do first
- getting a fix they can use immediately
- knowing whether the fix is working
- preventing the problem from returning

## 5) MVP Goal

The MVP must prove one thing clearly:

**An agent can take a real revenue-adjacent operational problem, diagnose the biggest source of workflow leakage, recommend a credible fix, and produce controls that make the improvement durable.**

Success is not defined by breadth. Success is defined by clarity, credibility, and completeness.

## 6) Required Inputs

The MVP must use exactly three input types:

### A. Structured context intake brief
A short, guided brief completed by the user. For the demo, it will be pre-filled.

### B. One synthetic primary dataset
A local synthetic dataset representing the lead intake / acquisition workflow.

### C. One optional process note
A short SOP/checklist/narrative describing the intended workflow rules.

## 7) Context Intake Requirements

The intake brief must capture the minimum business context needed to make the analysis believable.

### Required fields
- business or team name
- workflow/process name
- what the process is supposed to accomplish
- current pain point
- who is affected
- what success looks like
- key constraint or requirement
- notes about the available data

### Recommended additional fields
- what counts as a qualified lead
- expected response time / SLA
- current pipeline stages
- biggest frustration right now
- whether a specific stage is suspected to be leaking

### Demo requirement
The form must appear as a real product feature, but it should be pre-filled in the hackathon demo.

## 8) Primary Dataset Requirements

### Dataset name
`acquisition_pipeline_cases.csv`

### Purpose
The dataset must allow the system to:
- reconstruct the workflow
- measure baseline performance
- identify where leads stall or drop out
- compare outcomes across operational factors
- generate a credible root-cause narrative
- support a recommendation and control package

### Minimum required fields
- `lead_id`
- `lead_source`
- `owner`
- `created_date`
- `first_response_hours`
- `current_stage`
- `days_in_stage`
- `missed_followup_flag`
- `missing_info_flag`
- `handoff_count`
- `conversion_outcome`
- `estimated_deal_value`
- `is_stalled`

### Optional fields
Only include these if they improve the analysis or demo story:
- `industry`
- `region`
- `priority`
- `qualification_status`
- `lost_reason`

### Hidden signal requirement
The dataset must encode one dominant truth:

**Leads with slow first response and missed follow-up convert materially worse than leads with timely, consistent follow-up.**

It may also encode secondary signals such as:
- one owner underperforming
- one source segment underperforming
- handoffs modestly worsening outcomes

But the dominant truth must remain legible.

## 9) Optional Process Note Requirements

### File name
`process_note.md`

### Purpose
The process note gives the agent a simple intended-state reference so it can compare actual workflow behavior to expected workflow behavior.

### Recommended contents
- new leads should receive first response within defined SLA
- qualified leads should receive a next step quickly
- untouched leads should escalate after a threshold
- high-value leads should not remain idle beyond SLA
- follow-up expectations should be explicit

This note should be short, practical, and easy to display or cite in the app.

## 10) Metrics

### Metric hierarchy rule
In the live product and demo, the metric hierarchy is non-negotiable:
1. Show **one headline metric**.
2. Show **one secondary diagnostic metric** next to it.
3. Treat all other metrics as supporting diagnostics only.

The app must not present a flat wall of equally weighted KPIs.


## Headline metric
**Primary metric:** Conversion rate from new lead to booked meeting

This is the headline business metric because it is easy for judges and business users to understand, and it is directly tied to business value.

## Secondary diagnostic metric
**Secondary metric:** Median time to first follow-up

This is the supporting operational metric because it helps explain why the headline metric is underperforming.

## Supporting diagnostic metrics
The analysis layer may also use:
- stalled lead rate
- drop-off by stage
- missed follow-up rate
- conversion by owner
- conversion by source
- aging by stage

These support the root-cause narrative but should not compete with the headline metric or the secondary diagnostic metric.

### Live UI rule
Only the headline metric and the secondary diagnostic metric should appear in the first metric row. Supporting diagnostics should appear lower on the page or inside the analysis and control sections.

## 11) Analysis Requirements

The analysis must feel credible, practical, and explainable.

### The analysis must answer
- Where is the workflow leaking?
- What operational factors are most associated with that leakage?
- What should be changed first?

### Required analysis components
- baseline metric calculation
- segmented breakdown by stage, owner, source, missed follow-up, and missing info
- ranked likely causes / Pareto-style view
- one trend, aging, or stage-drop-off view
- one lightweight supporting comparison that reinforces the conclusion

### Statistical complexity rule
Do not overcomplicate the analysis. No heavy modeling is required for the MVP. Deterministic calculations and clear comparisons are preferred over impressive-but-fragile methods.

## 12) Improve Phase Requirements

The Improve phase must prioritize implementation value, not technical flash.

### Core Improve outputs for MVP
- **Recommendation:** a plain-English explanation of what should change first
- **Generated SOP / workflow rule:** a concrete operational rule the team can adopt immediately

### Stretch only
- **Code patch / PR**

A code patch or PR is not part of the core MVP. It should only appear if there is a natural demo case where a technical enforcement mechanism clearly supports the operational fix.

### Improve output selection logic
Use:
- **Recommendation** when the main need is prioritization and decision clarity
- **SOP / workflow rule** when the fix is mainly behavioral, operational, or procedural
- **Code patch / PR** only when the fix is best embedded directly into a system

### MVP default behavior
The MVP should generate:
1. a recommendation
2. a workflow rule / SOP update

That is enough to feel complete.

## 13) Control Phase Requirements

The Control phase is mandatory. Without it, the product feels like analysis only.

### Required control outputs
- dashboard summary
- alert logic
- monitoring/control report

### Control output purpose
The product must leave the user with:
- visibility into performance after the fix
- clear thresholds for when trouble is returning
- clarity on who should act and what they should do

### Control examples
Examples of acceptable control logic:
- alert when new leads are not contacted within SLA
- alert when stalled lead rate exceeds threshold
- alert when stage-specific drop-off worsens above expected range

## 14) Required Product Outputs

The MVP must generate these artifacts:

1. executive summary / plain-English action summary
2. define statement / problem statement
3. baseline metric summary
4. at least one supporting chart
5. root-cause analysis summary
6. ranked likely causes
7. recommendation
8. generated SOP / workflow rule
9. dashboard summary
10. alert logic
11. monitoring/control report

### Output priority order
The app should emphasize outputs in this order:
1. executive summary
2. root-cause finding
3. recommended fix
4. control package
5. supporting evidence

This reflects how the primary user thinks: summary first, evidence second.

## 15) Demo Mode Requirements

The MVP is designed for a short hackathon demo.

### Demo mode assumptions
- pre-filled intake form
- local synthetic data only
- no production integrations
- no authentication
- mostly autonomous run with visible step outputs
- business-friendly UI, not chatbot-first UI

### Demo objective
In roughly three minutes, the demo should show:
- the problem context
- the agent running the analysis
- the main leakage point discovered
- the fix produced
- the control package left behind

## 16) User Experience Requirements

The UI should feel like a lightweight product, not a prototype of a future platform.

### Required UX qualities
- clean
- legible
- concise
- business-friendly
- phased

### Preferred visible flow
1. intake brief
2. run analysis
3. executive summary
4. Define/Measure/Analyze/Improve/Control outputs as cards or sections

### UI rule
Do not present the MVP as an open-ended generic assistant. The interface should guide the user through a structured improvement workflow.

## 17) Technical Scope

### Preferred stack
- Next.js
- React
- TypeScript
- Tailwind
- lightweight charting
- local synthetic CSV data
- Claude / Claude Code for orchestration and artifact generation

### Architecture principle
Keep the system simple enough to build, rehearse, and demo reliably within the hackathon window.

## 18) Deterministic vs Model-Generated Responsibilities

### Deterministic code should handle
- metric calculations
- segmentation
- stage leakage analysis
- ranking by counts/rates
- threshold checks

### Model-generated output should handle
- executive summary
- diagnosis narrative
- prioritized recommendation
- SOP / workflow rule drafting
- monitoring report narrative

This split improves credibility and reduces failure risk.

## 19) Non-Goals

The MVP must **not** become:
- a giant enterprise platform
- a generic chatbot over business data
- a pure sales dashboard
- a vague “AI for revenue” tool
- dependent on production systems
- multi-workflow or multi-tenant
- infrastructure-heavy
- overly statistical for its own sake
- centered on patch/PR generation

## 20) Hackathon Quality Bar

To count as successful, the MVP should feel:
- understandable in under 30 seconds
- credible in its diagnosis
- practical in its fix
- complete in its end-to-end arc
- polished enough to demo cleanly

A judge should walk away remembering:

**This was not just an AI analysis demo. It was an agent that took a real revenue-adjacent operational problem, figured out where the pipeline was leaking, proposed a credible fix, and left behind a control system a business could actually use.**

## 21) Final Scope Lock

If there is a conflict between building something broader and building something more complete, choose completeness.

If there is a conflict between sounding more ambitious and being more demoable, choose demoability.

If there is a conflict between technical flash and operational usefulness, choose operational usefulness.

This spec is the source of truth for the MVP.
