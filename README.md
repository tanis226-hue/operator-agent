# Operator Agent

Operator Agent is a lean, hackathon-ready process-improvement app that helps a business owner diagnose where leads are leaking out of a customer acquisition workflow, identify the highest-impact operational fix, and leave behind controls to make the improvement stick.

## What it does

For this MVP, Operator Agent focuses on a single workflow:

**Lead Intake and Conversion Bottleneck**

The app takes:
- a pre-filled business context brief
- a local synthetic pipeline dataset
- a short process note describing the intended workflow

It then runs a buyer-friendly DMAIC-style loop to produce:
- an executive summary
- baseline performance metrics
- a root-cause analysis
- a recommended fix
- a generated workflow rule / SOP update
- a control package with dashboard, alerts, and monitoring guidance

## Why this exists

Business owners often know leads are leaking somewhere in the pipeline, but they cannot clearly see:
- where the workflow is breaking down
- what factor is driving the most loss
- what change would matter most
- how to keep the fix from decaying

Operator Agent is meant to compress that operational diagnosis-and-improvement work into one guided run.

## MVP Scope

This is intentionally **not**:
- a giant platform
- a generic chatbot over business data
- a pure sales dashboard
- a production CRM integration

It is a focused end-to-end demo of operational reasoning, intervention design, and control.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind
- Recharts
- local CSV data
- model-generated artifact writing grounded in deterministic metrics

## Repository Structure

```text
/app
/components
/lib
/data
/docs
```

## Key Docs

- `docs/mvp-spec.md`
- `docs/output-contracts.md`
- `docs/data-spec.md`
- `docs/demo-script.md`
- `docs/ui-spec.md`
- `docs/claude-code-build-plan.md`
- `docs/prompting-spec.md`

## Local Data Files

- `data/acquisition_pipeline_cases.csv`
- `data/process_note.md`

## How to Run

1. Install dependencies
2. Start the local dev server
3. Open the app
4. Review the pre-filled intake brief
5. Run analysis
6. Inspect the generated outputs

## Demo Story

The demo should prove one thing clearly:

Operator Agent can take a real revenue-adjacent workflow problem, identify the biggest source of leakage, recommend a credible operational fix, and leave behind controls a business can actually use.

## Build Philosophy

When in doubt:
- choose clarity over breadth
- choose completeness over ambition
- choose operational usefulness over technical flash

## Demo Communication Rules

- Use **Lead Intake and Conversion Bottleneck** consistently as the workflow label in the UI and demo.
- Keep the executive summary above the fold.
- Treat conversion rate from new lead to booked meeting as the headline metric.
- Treat median time to first follow-up as the only co-equal supporting metric.
- Avoid orchestration language in user-facing copy; emphasize clarity, actionability, and control.
