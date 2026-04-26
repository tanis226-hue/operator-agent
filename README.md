# OpsAdvisor

OpsAdvisor is a single-page operations advisor that helps a non-technical business owner diagnose where a workflow is leaking, identify the highest-impact operational fix, and leave behind controls (dashboard, alerts, SOP) to make the improvement stick.

> Built by David Tanis for the _Built with Opus 4.7_ hackathon by Anthropic. Powered by **Claude Opus 4.7**.

> **Naming note.** The repository / internal codename is `operator-agent`. The product name shown in the UI, exported reports, and emails is **OpsAdvisor**.

---

## What it does

OpsAdvisor compresses a DMAIC-style diagnosis (Define → Measure → Analyze → Improve → Control) into a single guided run that produces a structured, deterministic report:

- **Executive summary** — headline finding, business impact, primary cause, first action, monitoring plan
- **Define** — workflow, business problem, affected group, success metric, scope
- **Measure** — current-state metrics with a citable industry benchmark
- **Analyze** — top leakage point, three ranked root causes, supporting comparison, segment insight
- **Improve** — first action, expected effect, owner, plus a workflow SOP draft
- **Control** — dashboard metrics, alert rules with severities, ongoing monitoring plan, prioritized actions

The output payload (`GeneratedOutputPayload`) is Zod-validated server-side before it's allowed to leave the API.

---

## Three ways to run a diagnosis

From the landing page:

1. **See sample case** — runs the bundled active demo (Professional Services lead-intake pipeline) against a synthetic 90-day CSV. No wizard.
2. **Preset case** — one click on a sample card; bypasses the wizard and runs a pre-filled brief. Three presets ship: HR onboarding, support SLA, contract approval lag.
3. **Start a diagnosis** — guided wizard that builds an `IntakeBrief` and accepts data via:
   - CSV upload
   - read-only Postgres / MySQL query
   - public share link (Google Drive / OneDrive / Dropbox; supports `.csv`, `.xlsx`, `.docx`, `.txt`)

The wizard shows a privacy disclaimer above any data input, and the DB connector reinforces that credentials are used once and never stored.

---

## After the report

The report ships with one-click take-away actions:

- **Copy report** to clipboard (plain text)
- **Save report** as `.docx` (editable in Word / Pages / Google Docs) or as a printable **PDF**
- **Email report** as styled HTML via Resend, with an optional personal signature block
- **Join the waitlist** (Resend audience capture)

---

## Tech stack

- **Framework:** Next.js 14, React 18, TypeScript 5
- **Styling:** Tailwind CSS 3
- **Charts:** Recharts
- **Model:** `@anthropic-ai/sdk` (Claude Opus 4.7)
- **Validation:** Zod
- **DB connectors (read-only):** `pg`, `mysql2`
- **Document parsing / writing:** `xlsx`, `mammoth`, `docx`
- **Email + waitlist:** Resend

No database, no auth. All client state lives in `sessionStorage`.

---

## Repository structure

```text
app/                Next.js routes
  page.tsx          Stage machine: landing → onboarding → analyzing
  privacy/          Standalone privacy page
  api/
    run-analysis/   Streaming DMAIC pipeline (SSE)
    analysis-check/ Deterministic stats sanity check
    data-check/     Dataset preview / schema check
    db-query/       Read-only Postgres / MySQL passthrough
    cloud-fetch/    Public-link file fetch + extract
    demo-result/    Canned fallback payload
    email-report/   Send full HTML report via Resend
    waitlist/       Add email to Resend audience + owner notify

components/         React UI (LandingHero, OnboardingWizard, AnalysisRunner,
                    AnalysisResults, NextStepsCTA, charts/, editorial/, …)

lib/                Server-side logic (pipelinePhases, generalPipeline,
                    analyzePipeline, agentLoop, agentTools, benchmarks,
                    exampleCases, outputTypes, intakeBrief, cloud/, …)

data/               Demo CSV, process note, fallback payload
docs/               Specs (current-state, mvp, output-contracts, data,
                    demo-script, ui, prompting)
Design/             Pure design scaffolding (not shipped)
```

---

## How to run locally

1. Install dependencies:
   ```powershell
   npm install
   ```
2. Add your Anthropic key to `.env.local`:
   ```text
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Start the dev server:
   ```powershell
   npm run dev
   ```
4. Open <http://localhost:3000> and click **See sample case** to run the active demo, click a preset card, or click **Start a diagnosis** to use the wizard.

Other scripts: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`.

---

## Environment variables

Create `.env.local` (not committed). Only `ANTHROPIC_API_KEY` is required to run an analysis.

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | Claude API key used by `app/api/run-analysis`. |
| `NEXT_PUBLIC_SITE_URL` | no | Public origin used for absolute asset URLs in emails. |
| `RESEND_API_KEY` | no | Enables `/api/email-report` and `/api/waitlist`. Without it, those endpoints return 500. |
| `RESEND_FROM_EMAIL` | no | `From` address for outbound mail. Defaults to Resend's sandbox sender. |
| `RESEND_AUDIENCE_ID` | no | If set, waitlist sign-ups are added to this Resend audience. |
| `OWNER_EMAIL` | no | If set, the owner is notified on waitlist sign-ups and on report sends. |

### Sender signature (email body)

The personalized "A note from …" block at the bottom of the report email is **opt-in** and only renders when both `SENDER_NAME` and `SENDER_EMAIL` are provided. Forks that don't set these will send a clean report with no signature.

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

---

## Privacy posture

- Data uploaded by users is held only in memory for the duration of the run.
- Database credentials are used once and never stored or logged.
- No analytics, no per-user persistence beyond the browser `sessionStorage`.
- A standalone [/privacy](app/privacy/page.tsx) page restates the same policy in long form.

---

## Key docs

- [`docs/current-state-and-purpose.md`](docs/current-state-and-purpose.md) — most up-to-date overview of architecture, flow, and shipped surface area
- [`docs/mvp-spec.md`](docs/mvp-spec.md)
- [`docs/output-contracts.md`](docs/output-contracts.md)
- [`docs/data-spec.md`](docs/data-spec.md)
- [`docs/demo-script.md`](docs/demo-script.md)
- [`docs/ui-spec.md`](docs/ui-spec.md)
- [`docs/prompting-spec.md`](docs/prompting-spec.md)
- [`docs/claude-code-build-plan.md`](docs/claude-code-build-plan.md)

---

## MVP scope

This is intentionally **not**:

- a multi-tenant SaaS (no auth, no DB, no per-user state)
- a generic chatbot over business data
- a pure BI dashboard
- a production CRM integration
- a continuous-monitoring service — the Control output describes monitoring; the product does not run it

It **is** a focused end-to-end demonstration of operational reasoning, intervention design, and control hand-off.

---

## Build philosophy

When in doubt:

- choose **clarity** over breadth
- choose **completeness** over ambition
- choose **operational usefulness** over technical flash

The product should leave a viewer convinced that OpsAdvisor can take a real revenue-adjacent workflow problem, identify the biggest source of leakage, recommend a credible first fix, and hand off controls a business can actually use.
