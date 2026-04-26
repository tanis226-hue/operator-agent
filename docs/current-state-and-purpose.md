# Operator Agent — Current State and Purpose

_Last updated: April 2026_

_Built by David Tanis for the **Built with Opus 4.7** hackathon by Anthropic._

---

## 1. Purpose

**Operator Agent** is a single-page, hackathon-ready operations advisor that helps a non-technical business owner answer four questions about a workflow they suspect is broken:

1. **Where** is the workflow actually leaking?
2. **Why** — what is the dominant root cause, given the data and context they provided?
3. **What** is the single highest-impact fix to make first?
4. **How** do they keep the fix from decaying — what should they monitor, alert on, and review?

The product compresses a DMAIC-style operational diagnosis (Define → Measure → Analyze → Improve → Control) into one guided run that produces a structured, deterministic report. Outputs are grounded in either a synthetic demo dataset or the customer's own intake brief, so the model is constrained to specific, citable, business-relevant answers rather than generic advice.

The MVP is intentionally narrow:

- It is **not** a generic chatbot, BI tool, or CRM integration.
- It is **not** a multi-workflow platform.
- It **is** a focused end-to-end demonstration of operational reasoning, intervention design, and control hand-off, anchored to a single hero workflow: **Lead Intake and Conversion Bottleneck**.

The product is built with **Claude Opus 4.7** via the Anthropic API and is presented to operators (business owners, department heads), not to developers or analysts.

---

## 2. High-level Architecture

Operator Agent is a Next.js 14 + React 18 + TypeScript + Tailwind app, with Recharts for charts. There is no database; all state lives in `sessionStorage` on the client and on local files on the server.

```
┌──────────────────────────────────────────────────────────────────┐
│  Browser (Next.js client)                                        │
│                                                                  │
│   LandingHero  ──► OnboardingWizard ──► AnalysisRunner           │
│         │                                   │                    │
│         │  "Run demo"                       │  POST /api/run-... │
│         ▼                                   ▼                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Next.js server (app/api/*)                                      │
│                                                                  │
│   /api/run-analysis   ── DMAIC pipeline orchestration (SSE)      │
│   /api/analysis-check ── deterministic CSV stats sanity check    │
│   /api/data-check     ── dataset preview / schema check          │
│   /api/db-query       ── read-only Postgres / MySQL passthrough  │
│   /api/cloud-fetch    ── pull a public-link file (Drive/OneDrive)│
│   /api/demo-result    ── canned fallback output payload          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Server-side libs (lib/*)                                        │
│                                                                  │
│   loadDataset / parseCSV ─► analyzePipeline (deterministic stats)│
│   pipelinePhases (demo)   │                                      │
│   generalPipeline (custom)│  ─► Anthropic Messages API           │
│   agentLoop / agentTools  │     (Claude Opus 4.7)                │
│   buildOutputPayload      ─► GeneratedOutputPayload              │
│   benchmarks / intakeContext (grounding)                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

The full output contract (`GeneratedOutputPayload`) is defined in [lib/outputTypes.ts](lib/outputTypes.ts) and validated server-side with a Zod schema in [lib/agentTools.ts](lib/agentTools.ts) before it is allowed to leave the API.

---

## 3. User Flow

The single page in [app/page.tsx](app/page.tsx) is a three-stage state machine, persisted to `sessionStorage` so a refresh does not lose progress:

| Stage         | Component                                                   | Purpose                                                                                                                  |
| ------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `landing`     | [components/LandingHero.tsx](components/LandingHero.tsx)    | Pitch + two paths: **Run the demo** or **Analyze your own workflow**. Also surfaces a few preset example cases.          |
| `onboarding`  | [components/OnboardingWizard.tsx](components/OnboardingWizard.tsx) | Multi-step wizard that fills an `IntakeBrief` (industry, size, problem, SLAs, stages, volume/value, tooling, history) and an optional process note. Supports CSV upload, DB query, and cloud-link fetch as data sources. |
| `analyzing`   | [components/AnalysisRunner.tsx](components/AnalysisRunner.tsx) | Streams pipeline phase events from `/api/run-analysis`, then renders the structured report card stack ([components/AnalysisResults.tsx](components/AnalysisResults.tsx)). Falls back to canned content via `/api/demo-result` if the live run fails. |

Two execution modes share the same UI:

- **Demo mode** — no wizard answers needed. Uses the bundled CSV at [data/acquisition_pipeline_cases.csv](data/acquisition_pipeline_cases.csv) and the process note at [data/process_note.md](data/process_note.md). Produces the canonical "Lead Intake and Conversion Bottleneck" narrative.
- **Custom mode** — a user-completed `IntakeBrief` plus an optional process note. Runs the general pipeline that does not assume a sales-specific shape.

---

## 4. The DMAIC Pipeline

The analysis backbone lives in [lib/pipelinePhases.ts](lib/pipelinePhases.ts) (demo) and [lib/generalPipeline.ts](lib/generalPipeline.ts) (custom), driven by `/api/run-analysis` ([app/api/run-analysis/route.ts](app/api/run-analysis/route.ts)). The route streams `PipelineEvent`s as Server-Sent Events so the UI can render per-phase progress.

The user-facing flow is collapsed into three labeled phases (the underlying steps still cover the full DMAIC arc):

| UI label                                                              | Internal stage      | What it does                                                                                       |
| --------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------- |
| Define: Clarifying the problem and success criteria                   | `frame`             | Restates the business problem and success definition; surfaces confirmed patterns and unexpected findings. |
| Measure & Analyze: Quantifying current state and root causes          | `analyze`           | Combines deterministic stats (`analyzePipeline`) with model reasoning to rank causes and quantify the gap vs benchmarks. |
| Improve & Control: Building recommendations and controls              | `synthesize`        | Produces the recommendation, SOP, dashboard, alert rules, and prioritized action plan.             |

For the demo run, deterministic numbers come from [lib/analyzePipeline.ts](lib/analyzePipeline.ts), which computes:

- Total leads, booked / stalled / lost counts and rates.
- Conversion rate, median first-response time, missed-followup rate.
- Stage funnel and stage drop-off.
- Owner / source segment breakdowns.
- Critical comparisons (timely vs delayed response, missed vs not-missed followup, both-bad).

These numbers are passed into the prompts so the model is anchored to actual figures rather than free-styling.

For the custom run, the `runGeneralPipeline` path operates on the `IntakeBrief` and any user-provided raw data (CSV preview, DB query result preview, or cloud-extracted text), without assuming the lead-pipeline schema.

The agent layer in [lib/agentLoop.ts](lib/agentLoop.ts) and [lib/agentTools.ts](lib/agentTools.ts) provides a generic Claude tool-use loop with:

- A terminal tool (`emit_final_report`) whose input is the agent's output.
- Zod validation of the final payload, with validation errors fed back as a tool result so the agent can self-correct in the same loop.

---

## 5. Output Contract

The single canonical output of a run is `GeneratedOutputPayload` ([lib/outputTypes.ts](lib/outputTypes.ts)), composed of:

- **Executive Summary** — headline finding, why it matters, primary cause, recommended action, monitoring plan.
- **Problem Definition** — workflow, business problem, affected group, success metric, scope.
- **Measure / Baseline** — current-state metrics, performance gap, industry context, priority metric, benchmark category and citable sources.
- **Root Cause Analysis** — top leakage point, three ranked causes, supporting comparison, segment insight.
- **Recommendation** — first action, why this first, expected effect, owner.
- **Workflow SOP** — title, objective, bullets, escalation, owner.
- **Monitoring Report** — issue, fix, metrics, thresholds, owner, response plan.
- **Control Dashboard** — primary / secondary / tertiary metric labels and the segment needing attention.
- **Alert Rules** — trigger / action / severity (`warning` | `critical`).
- **Prioritized Actions** — action / when (`this week` | `this month` | `this quarter`).

The Zod schema in [lib/agentTools.ts](lib/agentTools.ts) enforces the shape; the route refuses to ship malformed payloads.

The `AnalysisResults` card stack renders this payload section by section, with charts (funnel, owner comparison, stage drop-off, Pareto, sparklines, split bars) defined under [components/charts/](components/charts/) and editorial primitives under [components/editorial/](components/editorial/).

---

## 6. Data and Grounding

| Source                     | Path                                                                                      | Role                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Synthetic pipeline CSV     | [data/acquisition_pipeline_cases.csv](data/acquisition_pipeline_cases.csv)                | Demo dataset — 90 days of leads with stage, owner, source, response/followup timing.       |
| Process note               | [data/process_note.md](data/process_note.md)                                              | Narrative description of the intended workflow.                                            |
| Demo fallback payload      | [data/demo_output.json](data/demo_output.json) via [lib/demoOutput.ts](lib/demoOutput.ts) | Canned `GeneratedOutputPayload` used when the live model run fails or no API key is present. |
| Industry benchmarks        | [lib/benchmarks.ts](lib/benchmarks.ts)                                                    | Curated, citable figures (publisher, year, URL) selected by intake category to ground the Measure phase. |
| Example presets            | [lib/exampleCases.ts](lib/exampleCases.ts)                                                | One-click starter briefs (e.g., Employee Onboarding) for the landing page.                 |

User-supplied data (custom mode) can come from three connectors handled by the wizard:

- **CSV upload** — parsed via [lib/parseCSV.ts](lib/parseCSV.ts).
- **Read-only DB query** — `/api/db-query` ([app/api/db-query/route.ts](app/api/db-query/route.ts)) restricts to `SELECT` only, blocks mutating keywords, caps at 500 rows, and maps driver errors to friendly messages. Supports Postgres and MySQL.
- **Cloud share link** — `/api/cloud-fetch` ([app/api/cloud-fetch/route.ts](app/api/cloud-fetch/route.ts)) rewrites Drive / OneDrive / Dropbox share URLs to direct downloads ([lib/cloud/rewriteShareUrl.ts](lib/cloud/rewriteShareUrl.ts)), then fetches via [lib/cloud/safeFetch.ts](lib/cloud/safeFetch.ts) (blocks private network ranges, caps size, follows redirects safely) and extracts text via [lib/cloud/extractText.ts](lib/cloud/extractText.ts) (supports `.csv`, `.xlsx`, `.docx`, `.txt`).

---

## 7. Design System

The visual language is documented in [DESIGN.md](DESIGN.md) and implemented via Tailwind tokens in [tailwind.config.ts](tailwind.config.ts):

- **Tone:** direct, credible, calm — operator-first, not chatbot-first.
- **Palette:** cream canvas (`#FAF9F7`), stone ink, coral accent (`#C96442`).
- **Typography:** Söhne / system sans, with editorial primitives (`Eyebrow`, `BigMetric`, `SmallMetric`, `PhaseMarker`, `Pill`, `SectionHead`).
- **Layout:** single page, max-width 1024px, sticky header, ordered phase cards with eyebrows + numbered phase badges.
- **Naming rules** (enforced in copy):
  - Workflow label is always **Lead Intake and Conversion Bottleneck**.
  - Product is **Operator Agent**, model is **Claude Opus 4.7**.
  - User-facing copy avoids "autonomous", "agentic orchestration", "DMAIC".

Design exploration scaffolding (mock data, primitives, scenes) lives under [Design/](Design/) and is not shipped to production.

---

## 8. Repository Layout (current)

```
app/                        Next.js routes
  page.tsx                  Stage machine: landing → onboarding → analyzing
  layout.tsx, globals.css   Shell
  api/
    run-analysis/           Streaming DMAIC pipeline runner
    analysis-check/         Deterministic stats sanity check
    data-check/             Dataset preview / schema check
    db-query/               Read-only Postgres / MySQL passthrough
    cloud-fetch/            Public-link file fetch + extract
    demo-result/            Canned fallback payload

components/                 React UI
  LandingHero, OnboardingWizard, AnalysisRunner, AnalysisResults
  IntakeBrief{Card,Editor}, OwnerBriefCard, MetricCard, PhaseCard
  DatabaseConnector, CloudFileConnector
  charts/                   Recharts wrappers (Funnel, HBar, Pareto, Sparkline, SplitBar, StageDropoff)
  editorial/                Typographic primitives

lib/                        Server-side logic
  agentLoop.ts, agentTools.ts        Generic Claude tool-use loop + Zod-validated terminal tool
  pipelinePhases.ts                  Demo (lead-pipeline) DMAIC phases
  generalPipeline.ts                 Custom-workflow DMAIC phases
  analyzePipeline.ts                 Deterministic stats over the demo CSV
  buildOutputPayload.ts              Phase outputs → GeneratedOutputPayload
  outputTypes.ts                     Output contract (TypeScript types)
  intakeBrief.ts, intakeContext.ts   Brief schema + prompt formatting
  benchmarks.ts                      Curated industry benchmark library
  exampleCases.ts                    Landing-page presets
  demoOutput.ts                      Fallback payload loader
  loadDataset.ts, parseCSV.ts        CSV ingestion
  prompts.ts, types.ts, workflow.ts  Constants and shared types
  cloud/                             rewriteShareUrl, safeFetch, extractText

data/                       Demo CSV, process note, fallback payload
docs/                       Specs (mvp, output-contracts, data, demo-script, ui, prompting)
Design/                     Pure-design scaffolding (not shipped)
```

---

## 9. Tech Stack and Dependencies

From [package.json](package.json):

- **Framework:** `next@^14.2.35`, `react@18.3.1`
- **Language:** TypeScript 5.4
- **Styling:** Tailwind CSS 3.4
- **Charts:** `recharts@2.12.7`
- **Model:** `@anthropic-ai/sdk@^0.90.0` (Claude Opus 4.7)
- **Validation:** `zod@^4.3.6`
- **DB connectors:** `pg@^8.20.0`, `mysql2@^3.22.2` (read-only)
- **Document parsers:** `xlsx@^0.18.5`, `mammoth@^1.12.0`, `docx@^9.6.1`

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`.

The `ANTHROPIC_API_KEY` is read from environment, with an explicit fallback that re-reads `.env.local` if the parent shell injected an empty value (see `ensureApiKey` in [app/api/run-analysis/route.ts](app/api/run-analysis/route.ts)).

---

## 10. Status Snapshot

What is working today:

- End-to-end demo run from landing → analysis → full report, with streamed phase events and a graceful fallback to the canned payload when the model is unavailable.
- Custom-workflow run from the onboarding wizard with CSV / DB / cloud-link data sources.
- Zod-validated `GeneratedOutputPayload` with model self-correction on validation failure.
- Deterministic stats layer that grounds the model in real numbers for the demo dataset.
- Curated benchmark library with citable sources surfaced in the Measure section.
- Design system fully wired through Tailwind tokens, editorial primitives, and chart wrappers.

What is intentionally out of scope for the MVP:

- Multi-tenant accounts, auth, or persistence beyond `sessionStorage`.
- Live CRM / data-warehouse integrations.
- Multi-workflow library beyond the hero "Lead Intake and Conversion Bottleneck" demo and a small set of presets.
- Continuous monitoring — the Control output describes monitoring; the product does not run it.

---

## 11. Build Philosophy (recap)

When in doubt:

- Choose **clarity** over breadth.
- Choose **completeness** over ambition.
- Choose **operational usefulness** over technical flash.

The product should leave a viewer convinced that Operator Agent can take a real revenue-adjacent workflow problem, identify the biggest source of leakage, recommend a credible first fix, and hand off controls a business can actually use.
