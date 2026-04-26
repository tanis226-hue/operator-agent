# OpsAdvisor

OpsAdvisor is a lean, hackathon-ready process-improvement app that helps a business owner diagnose where leads are leaking out of a customer acquisition workflow, identify the highest-impact operational fix, and leave behind controls to make the improvement stick.

> Built by David Tanis for the _Built with Opus 4.7_ hackathon by Anthropic.

## What it does

For this MVP, OpsAdvisor focuses on a single workflow:

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

OpsAdvisor is meant to compress that operational diagnosis-and-improvement work into one guided run.

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

## Environment Variables

Create `.env.local` (not committed). Only `ANTHROPIC_API_KEY` is required to run the analysis.

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | Claude API key used by `app/api/run-analysis`. |
| `NEXT_PUBLIC_SITE_URL` | no | Public origin used for absolute asset URLs in emails (e.g. `https://your-deploy.example.com`). |
| `RESEND_API_KEY` | no | Enables the email-report feature. Without it, the email endpoint returns 500. |
| `RESEND_FROM_EMAIL` | no | `From` address for outbound mail. Defaults to Resend's sandbox sender. |
| `RESEND_AUDIENCE_ID` | no | If set, recipients are added to this Resend audience. |
| `OWNER_EMAIL` | no | If set, owner is BCC'd a notification when a report is requested, and recipients can reply directly to this address. |

### Sender signature (email body)

The personalized "A note from …" block at the bottom of the report email is **opt-in** and only renders when `SENDER_NAME` and `SENDER_EMAIL` are both provided. Forks that do not set these variables will send a clean report with no personal signature attached.

| Variable | Purpose |
| --- | --- |
| `SENDER_NAME` | Full name shown in the signature. |
| `SENDER_EMAIL` | Contact email shown in the signature. |
| `SENDER_CREDENTIALS` | Credentials line (e.g. `CSCP · LSSBB`). |
| `SENDER_TITLE` | Role / company line. |
| `SENDER_TAGLINE` | Smaller descriptor line below the title. |
| `SENDER_WEBSITE` | Website URL. |
| `SENDER_WEBSITE_LABEL` | Optional display label for the website link. |
| `SENDER_LINKEDIN` | LinkedIn profile URL. |

| `SENDER_NOTE_INTRO` | Heading for the note block. Defaults to `A note from <first name>`. |
| `SENDER_NOTE_BODY` | Body paragraph of the personal note. |

## Demo Story

The demo should prove one thing clearly:

OpsAdvisor can take a real revenue-adjacent workflow problem, identify the biggest source of leakage, recommend a credible operational fix, and leave behind controls a business can actually use.

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
