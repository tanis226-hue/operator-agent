# Claude Code Build Plan

This document defines the implementation order for building Operator Agent with Claude Code.

## Build Principle

### Consistency rules
- use **Lead Intake and Conversion Bottleneck** as the public workflow label everywhere in the UI
- reserve “Customer Acquisition Pipeline Leakage” for internal notes only, if used at all
- make the executive summary the first visible business artifact after analysis runs
- keep the headline metric row limited to two cards: primary metric and secondary diagnostic metric
- avoid “autonomous” in live UI copy unless a non-UI product description requires it


Do not ask Claude Code to “build the product” all at once.

Build in phases so each step is:
- testable
- reviewable
- less likely to drift
- easier to debug

---

## Phase 0: Project Setup

### Goal
Create the repo skeleton and base dependencies.

### Tasks
- initialize Next.js app with TypeScript
- add Tailwind
- add Recharts
- create `/docs`, `/data`, `/lib`, `/components`, `/app`
- add starter README
- confirm local dev server runs cleanly

### Deliverable
Working app shell with no business logic yet.

---

## Phase 1: Static Product Shell

### Goal
Create the page structure before wiring data.

### Tasks
- build page header
- build intake brief card with pre-filled fields
- build placeholder phase cards
- build layout container and spacing system
- add `Run Analysis` button with placeholder handler

### Deliverable
A clean static UI showing the intended structure.

---

## Phase 2: Data Layer

### Goal
Load and validate local synthetic data.

### Tasks
- add CSV parsing utility
- load `acquisition_pipeline_cases.csv`
- load `process_note.md`
- create type definitions for dataset rows
- add basic validation/sanity checks

### Deliverable
App can load local dataset and process note reliably.

---

## Phase 3: Deterministic Analysis Layer

### Goal
Implement all non-LLM calculations in code.

### Required calculations
- total leads
- conversion rate from new lead to booked meeting
- median time to first follow-up
- stalled lead rate
- drop-off counts by stage/outcome
- conversion by lead source
- conversion by owner
- impact of missed follow-up
- impact of delayed response
- ranked likely causes based on gaps or effect sizes
- threshold checks for control logic

### Deliverable
A structured analysis object returned from code.

### Important rule
Do not generate business narratives yet. Just compute and shape the evidence.

---

## Phase 4: Artifact Generation Layer

### Goal
Turn the analysis object into business-facing outputs.

### Tasks
- create prompt templates
- generate executive summary
- generate problem definition text
- generate root-cause narrative
- generate recommendation
- generate workflow rule / SOP
- generate monitoring report
- generate alert logic phrasing

### Deliverable
A single structured output payload matching `docs/output-contracts.md`.

### Important rule
Every generated artifact must be grounded in deterministic metrics, not freeform invention.

---

## Phase 5: Results UI

### Goal
Render the outputs in the correct order.

### Tasks
- wire `Run Analysis` button to route or server action
- display executive summary
- display baseline metrics and chart
- display root-cause section
- display recommendation and SOP
- display control section
- add loading and error states

### Deliverable
End-to-end MVP flow works with real synthetic data.

---

## Phase 6: Visual Polish

### Goal
Make the app demo-ready.

### Tasks
- improve card hierarchy
- tighten copy
- improve chart readability
- polish loading text
- add small status indicators
- ensure spacing and typography are consistent
- remove any obviously “prototype” placeholders

### Deliverable
A clean app suitable for recording a 3-minute demo.

---

## Phase 7: Demo Hardening

### Goal
Reduce demo failure risk.

### Tasks
- freeze synthetic dataset
- confirm outputs remain stable
- seed any randomness
- rehearse the happy path
- trim UI clutter
- verify the top 4 outputs are visible without excessive scrolling
- test on a smaller laptop screen

### Deliverable
Reliable demo build.

---

## Suggested Repository Structure

```text
/app
  /page.tsx
  /api/run-analysis/route.ts
/components
  Header.tsx
  IntakeBriefCard.tsx
  PhaseCard.tsx
  MetricCard.tsx
  FunnelChart.tsx
  CauseRankingCard.tsx
  RecommendationCard.tsx
  WorkflowRuleCard.tsx
  ControlDashboardCard.tsx
  AlertLogicCard.tsx
  MonitoringReportCard.tsx
/lib
  types.ts
  loadDataset.ts
  analyzePipeline.ts
  buildOutputPayload.ts
  prompts.ts
/data
  acquisition_pipeline_cases.csv
  process_note.md
/docs
  mvp-spec.md
  output-contracts.md
  data-spec.md
```

---

## Prompting Guidance for Claude Code

When giving Claude Code implementation tasks:
- specify the phase
- specify the output file(s)
- specify what to avoid
- ask for minimal viable code first

### Good instruction style
“Implement Phase 3 only. Build deterministic analysis helpers in `lib/analyzePipeline.ts` that calculate the primary metric, secondary metric, stalled lead rate, source/owner breakdowns, and ranked likely causes from the CSV. Do not build UI in this step.”

### Bad instruction style
“Build the whole app.”

---

## Build Rules

- keep the product single-workflow
- keep the architecture lean
- avoid abstractions that only help a future platform
- use local data only
- optimize for demo reliability over future extensibility
- prefer completion over cleverness

---

## Exit Criteria

The MVP is build-complete when it can:
1. render the pre-filled intake brief
2. load the local dataset and process note
3. calculate the baseline and supporting diagnostics
4. generate the required business-facing outputs
5. render the outputs in a clean UI
6. support a confident 3-minute demo
