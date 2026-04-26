# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**OpsAdvisor** (repo codename: `operator-agent`) — a Next.js 14 + TypeScript app that runs a DMAIC-style operational diagnosis powered by Claude Opus 4.7. No database, no auth; all client state lives in `sessionStorage`. Report payloads are shape-checked against the TypeScript contract in `lib/outputTypes.ts` before leaving the API.

> The internal/repo name is `operator-agent`; the user-facing product name is **OpsAdvisor**. Don't rename one to the other.

See [README.md](README.md) and [docs/current-state-and-purpose.md](docs/current-state-and-purpose.md) for the authoritative overview.

## Commands

PowerShell on Windows. Run from repo root.

```powershell
npm install          # install deps
npm run dev          # next dev on http://localhost:3000
npm run build        # next build
npm run start        # serve a built app
npm run lint         # next lint
npm run typecheck    # tsc --noEmit  ← run before declaring work done
```

Required env in `.env.local` for analysis: `ANTHROPIC_API_KEY`. Optional: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_AUDIENCE_ID`, `OWNER_EMAIL`, `NEXT_PUBLIC_SITE_URL`, and the `SENDER_*` signature vars (see README).

## Architecture

- `app/` — Next.js App Router routes and API handlers
  - `app/page.tsx` — stage machine: landing → onboarding → analyzing → results
  - `app/api/run-analysis/` — streaming DMAIC pipeline (SSE)
  - `app/api/analysis-check/` — deterministic stats sanity check
  - `app/api/data-check/` — dataset preview / schema check
  - `app/api/db-query/` — read-only Postgres / MySQL passthrough
  - `app/api/cloud-fetch/` — public share-link file fetch + extract
  - `app/api/demo-result/` — canned fallback payload
  - `app/api/email-report/` — full HTML report via Resend
  - `app/api/waitlist/` — Resend audience capture + owner notify
- `components/` — React UI (`LandingHero`, `OnboardingWizard`, `AnalysisRunner`, `AnalysisResults`, `NextStepsCTA`, `charts/`, `editorial/`, …)
- `lib/` — server-side logic
  - `pipelinePhases.ts`, `generalPipeline.ts`, `analyzePipeline.ts` — DMAIC orchestration
  - `prompts.ts`, `intakeBrief.ts`, `intakeContext.ts`
  - `outputTypes.ts` — TypeScript output contract; `buildOutputPayload.ts` — single-call assembly path
  - `benchmarks.ts`, `exampleCases.ts`, `loadDataset.ts`, `parseCSV.ts`
  - `cloud/` — `safeFetch.ts`, `extractText.ts`, `rewriteShareUrl.ts`
- `data/` — demo CSV, process note, fallback payload
- `docs/` — specs (output contracts, data spec, prompting spec, ui spec, …)
- `Design/` — pure design scaffolding, not shipped

## Conventions

- **TypeScript strict.** Always run `npm run typecheck` after edits.
- **Validation at boundaries.** Anything returned from `/api/*` must conform to the `GeneratedOutputPayload` contract in `lib/outputTypes.ts`. Don't widen contracts to silence types — fix the source.
- **No new persistence.** No DB, no cookies, no analytics. Client state is `sessionStorage` only. DB credentials are used once and never stored or logged.
- **Privacy disclaimer** must remain visible above any data-input surface (see `components/DataPrivacyDisclaimer.tsx`, used in `OnboardingWizard` step 6).
- **Styling:** Tailwind 3 with the custom palette in `tailwind.config.ts` (rust / ochre / moss / accent + `-soft` / `-border` variants). Prefer existing tokens over new hex values.
- **Charts:** Recharts via wrappers in `components/charts/`.
- **Don't run DB migrations or any DB-altering commands.** This repo has no DB layer; reject any such request.

## What this product is not

Not a multi-tenant SaaS, not a generic chatbot, not a BI dashboard, not a CRM integration, not a continuous-monitoring service. It's a focused end-to-end operational diagnosis that produces a deterministic report and hands off controls.

## Working style

- Prefer **clarity over breadth**, **completeness over ambition**, **operational usefulness over technical flash**.
- Make minimal, targeted changes. Don't refactor unrelated code, add speculative features, or sprinkle comments/docstrings into untouched code.
- Read existing patterns before introducing new ones — especially in `lib/pipelinePhases.ts`, `lib/prompts.ts`, and `lib/outputTypes.ts`.
- When changing an API contract, update `lib/outputTypes.ts`, the consumers, and any doc in `docs/output-contracts.md` together.
