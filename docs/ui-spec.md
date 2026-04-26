# Operator Agent UI Specification

> **Naming note.** Internal codename is `operator-agent`; the live product is **OpsAdvisor**. This document captures the original MVP UI scope. The shipped UI extends it with a landing page, an onboarding wizard, a privacy disclaimer, post-report CTAs (copy / save .docx / save .pdf / email / waitlist), and a DMAIC sidebar — all described in [`current-state-and-purpose.md`](current-state-and-purpose.md). Tokens and typography live in [`../DESIGN.md`](../DESIGN.md).

This document defines the minimum UI needed for the MVP.

## Product Design Goal

The app should feel like a lightweight operational product, not a generic chatbot and not a broad analytics dashboard.

The UI should be:
- clean
- focused
- business-friendly
- legible in a 3-minute demo

---

## 1) Screen Structure

The MVP can be built as a single-page app with distinct sections.

### Primary sections
1. page header
2. intake brief card
3. run-analysis action area
4. results area with ordered phase cards
5. control section

---

## 2) Header

### Contents
- product name: Operator Agent
- one-line subtitle
- optional status badge like “Lead Intake and Conversion Bottleneck”

### Naming rule
Use **Lead Intake and Conversion Bottleneck** as the workflow label everywhere in the live product and demo. Do not alternate with internal labels or synonyms in headers, cards, or chart titles.

### Subtitle recommendation
“Diagnose where leads are leaking, fix the biggest operational breakdown, and put controls in place.”

### Goal
A judge should understand the product in under 10 seconds.

---

## 3) Intake Brief Card

### Purpose
Ground the analysis in business context.

### Contents
- business/team name
- workflow name
- pain point
- success metric
- SLA / key constraint
- current stages
- available evidence

### UX behavior
- pre-filled by default
- editable if needed
- compact, not form-heavy

### Layout recommendation
Two-column card on desktop, stacked on mobile.

---

## 4) Run Analysis Action Area

### Purpose
Create a clear moment where the agent begins work.

### Required UI
- primary button: `Run Analysis`
- optional small note: “Uses intake brief, local pipeline data, and process note”
- loading state with phased language

### Loading text examples
- reviewing workflow context
- measuring baseline
- identifying leakage points
- generating improvement plan
- building control package

Do not overanimate this section.

---

## 5) Results Area

### Ordering
Results must appear in this order:
1. executive summary
2. problem definition
3. baseline performance
4. root-cause analysis
5. recommended fix
6. workflow rule / SOP update
7. control dashboard
8. alert logic
9. monitoring report

Use cards or section blocks with clear titles.

---

## 6) Executive Summary Card

### Purpose
Deliver the answer immediately.

### Required contents
- headline finding
- why it matters
- first action
- what will be monitored

### Visual style
Should be one of the most prominent cards on the page.

### Placement rule
This card must sit above the fold on a typical laptop screen in the demo view. Do not require scrolling past charts or secondary artifacts to find it.

---

## 7) Problem Definition Card

### Required contents
- workflow
- business problem
- affected group
- success metric
- scope

### Design note
This can be more compact than other sections.

---

## 8) Baseline Performance Section

### Required elements
- KPI card: conversion rate from new lead to booked meeting
- KPI card: median time to first follow-up
- one chart

### Metric hierarchy rule
The first metric row should show exactly two headline cards: the primary metric and the secondary diagnostic metric. Supporting metrics like stalled lead rate belong lower on the page, not in the top metric row.

### Recommended chart
Use one:
- funnel/stage drop-off chart
- stage leakage bar chart

### Design rule
Do not show more than three KPI cards at the top of this section.

---

## 9) Root-Cause Analysis Section

### Required elements
- top finding
- ranked likely causes
- one supporting comparison chart
- one segmentation insight

### Recommended visual components
- ranked list card
- bar chart or comparison chart
- mini table for owner/source segmentation

### Design rule
Keep the user focused on one dominant cause. Do not create a visually noisy “insights dump.”

---

## 10) Recommended Fix Section

### Required elements
- recommendation card
- implementation owner
- expected effect
- optional “why this first”

### Design note
This should feel like a decision-support artifact, not a brainstorming note.

---

## 11) Workflow Rule / SOP Section

### Required elements
- rule title
- 5–8 operational bullets
- escalation logic
- owner

### Visual style
Treat this as a practical artifact the user could copy into operations.

---

## 12) Control Section

### Subsections
- control dashboard summary
- alert logic
- monitoring report

### Required dashboard elements
- conversion rate
- median first-response time
- stalled lead rate
- one segment needing attention

### Required alert logic display
Show 3–5 rules in a compact list.

### Required monitoring report display
Short narrative summary with:
- issue
- fix
- metrics
- thresholds
- owner
- response action

---

## 13) Component List

Minimum component set:

- `Header`
- `IntakeBriefCard`
- `RunAnalysisButton`
- `PhaseCard`
- `MetricCard`
- `FunnelChart` or `StageDropoffChart`
- `CauseRankingCard`
- `RecommendationCard`
- `WorkflowRuleCard`
- `ControlDashboardCard`
- `AlertLogicCard`
- `MonitoringReportCard`

---

## 14) Layout Guidance

### Desktop
- max-width centered content
- generous whitespace
- one prominent summary card above fold
- charts contained within cards

### Mobile
- single-column stack
- no overly wide tables
- prioritize cards over complex grids

---

## 15) Styling Guidance

### Desired feel
- professional
- modern
- restrained
- not enterprise-heavy
- not startup-pitch flashy

### Use
- clear section titles
- soft card hierarchy
- readable spacing
- concise labels

### Avoid
- dark patterns
- excessive gradients
- visually loud dashboards
- too many colors competing for attention

---

## 16) Interaction Rules

- results should be readable without clicking through tabs
- avoid modal-heavy flows
- no chat-first interaction model
- allow copy/export only as a minor convenience, not a core feature

---

## 17) MVP UI Non-Goals

Do not build:
- user auth
- multi-page workflow builders
- file management systems
- multi-tenant admin panels
- highly interactive BI dashboards

The UI only needs to make the single demo workflow feel complete and credible.
