# OpsAdvisor — Design System

This file documents the visual design system for **OpsAdvisor** (repo codename `operator-agent`). It is the source of truth for colors, typography, spacing, and component patterns. The implementation lives in [tailwind.config.ts](tailwind.config.ts) and [app/globals.css](app/globals.css); component primitives live in [components/editorial/](components/editorial/).

---

## Brand

- **Product name:** OpsAdvisor
- **Repo / internal codename:** operator-agent
- **Tagline:** Diagnose where a workflow is leaking, fix the biggest operational breakdown, and put controls in place.
- **Audience:** Owners, administrators, and program leads — not developers or analysts.
- **Tone:** Direct, credible, calm. Editorial, not chatbot-first, not pitch-deck flashy.
- **Built with:** Claude Opus 4.7 via the Anthropic API.

---

## Color Tokens

Defined in [tailwind.config.ts](tailwind.config.ts) and mirrored as CSS custom properties in [app/globals.css](app/globals.css).

### Surfaces

| Token       | Hex       | Usage                                |
| ----------- | --------- | ------------------------------------ |
| `canvas`    | `#F6F3EC` | Page canvas / parchment background   |
| `surface`   | `#FBFAF6` | Lifted card surface                  |
| `bone`      | `#ECE5D5` | Subtle section fill                  |

### Ink

| Token       | Hex       | Usage                                |
| ----------- | --------- | ------------------------------------ |
| `ink`       | `#1A1714` | Primary text                         |
| `ink-soft`  | `#4A413A` | Secondary text                       |
| `ink-muted` | `#8B7F73` | Muted text / labels                  |
| `ink-faint` | `#B8AC9D` | Hairline / placeholder               |

### Lines

| Token       | Hex       | Usage                                |
| ----------- | --------- | ------------------------------------ |
| `line`      | `#DAD2C2` | Default border / divider             |
| `line-soft` | `#E8E1D2` | Subtle inset border                  |

### Accent — terracotta

| Token            | Hex       | Usage                              |
| ---------------- | --------- | ---------------------------------- |
| `accent`         | `#B8472A` | Primary accent — buttons, headlines |
| `accent.hover`   | `#8E3416` | Hover state                        |
| `accent.soft`    | `#F7F1ED` | Soft accent surface                |
| `accent.border`  | `#DCC8BD` | Soft accent border                 |

### Functional palette

| Family   | Default   | Soft       | Border     | Ink        | Usage                            |
| -------- | --------- | ---------- | ---------- | ---------- | -------------------------------- |
| `ochre`  | `#B8893A` | `#F9F5E8`  | `#E5D9C0`  | `#7A5C28`  | Warning / measure callouts       |
| `moss`   | `#5C6E3F` | `#F3F4ED`  | `#D0D5C5`  | `#3D4A29`  | Confirmed / on-track signals     |
| `rust`   | `#8E3416` | `#F9F2ED`  | `#E5D0C8`  | `#7D4535`  | Alerts / leakage / risk markers  |

The "soft" / "border" variants were intentionally lightened so callout boxes (revenue at risk, metric cards, alert badges) sit cleanly on the parchment canvas rather than competing with it.

---

## Typography

Fonts are loaded as CSS variables (`--font-sans`, `--font-mono`) in [app/layout.tsx](app/layout.tsx). The serif slot reuses the sans variable today; **Instrument Serif** is the intended fallback when bundled.

```text
--sans:  Inter, system-ui, -apple-system, sans-serif
--serif: Instrument Serif, Georgia, serif (currently maps to --sans)
--mono:  JetBrains Mono, ui-monospace, Menlo, monospace
```

Editorial size scale (see `app/globals.css`):

| Class             | Size                    | Weight | Family | Usage                          |
| ----------------- | ----------------------- | ------ | ------ | ------------------------------ |
| `h-display`       | clamp(44px, 5.5vw, 70px)| 400    | serif  | Hero / landing headline        |
| `h-page`          | 52px                    | 400    | serif  | Page title                     |
| `h-section`       | 38px                    | 400    | serif  | Section heading                |
| `h-card`          | 26px                    | 400    | serif  | Card heading                   |
| `eyebrow`         | 12px uppercase          | 600    | mono   | Section label above headings   |
| `uppercase-mono`  | 11px tracked            | 500    | mono   | Small all-caps labels          |

---

## Spacing & Layout

Base unit: **4px**.

- Card padding: 24px (horizontal) × 20px (vertical).
- Section gap: 20–32px between cards; 48px between major regions.
- Page max widths: `max-w-page` (1024px) for reports, `max-w-shell` (1280px) for landing / wizard.
- Page horizontal padding: 24px on mobile, 48px (`px-12`) on desktop.

---

## Elevation & Borders

| Level       | Shadow                                                                     | Border                  | Radius |
| ----------- | -------------------------------------------------------------------------- | ----------------------- | ------ |
| Card        | `0 1px 2px rgba(26,23,20,.04), 0 6px 20px -8px rgba(26,23,20,.08)`          | `1px solid line`        | 16px   |
| Card lift   | `0 1px 2px rgba(26,23,20,.04), 0 12px 32px -10px rgba(26,23,20,.14)`        | `1px solid line`        | 16px   |
| Warm card   | `0 2px 4px rgba(26,23,20,.03), 0 10px 32px -8px rgba(184,71,42,.10)`        | `1px solid accent.border` | 16px |
| Button      | `0 1px 2px rgba(26,23,20,.12)`                                              | none                    | 8px    |
| Metric card | inset / soft                                                                | `1px solid line`        | 10px   |

---

## Component Patterns

### Button — primary

- Background `accent` (#B8472A), white text, 14px semibold, padding `8px 20px`, radius 8px.
- Hover: `accent.hover` (#8E3416).
- Disabled: 50% opacity, `cursor-not-allowed`.

### Card

- Surface white, border `1px solid line`, radius 16px, card shadow.
- Header anatomy: `[Eyebrow]` + `[Phase number]` row, then the card title in serif.

### Metric card (KPI)

- Eyebrow + label up top, value in serif at 26px.
- Variants: default (canvas), highlight (`accent.soft` / `accent.border`), warning (`ochre.soft` / `ochre.border`), alert (`rust.soft` / `rust.border`).

### Phase marker

- Small numbered chip (`01` … `09`), monospace, faint border, used in the DMAIC sidebar and atop phase cards.

### Alert badge

- Critical: `rust.soft` background, `rust.border` border, `rust` text.
- Warning: `ochre.soft` / `ochre.border` / `ochre`.
- Padding `12px 16px`, radius 8px.

### Editorial primitives

Implemented under [components/editorial/](components/editorial/):

- `BigMetric` — hero metric display with eyebrow + delta.
- `SmallMetric` — supporting diagnostic metric.
- `PhaseMarker` — numbered DMAIC chip.
- `Pill` — small status tag.
- `SectionHead` — eyebrow + serif heading + optional rule.

Charts wrap Recharts in [components/charts/](components/charts/) (`FunnelChart`, `HBarComparison`, `ParetoChart`, `Sparkline`, `SplitBar`).

---

## Layout Patterns

### Sticky header

- 72px tall, `rgba(246,243,236,0.92)` with `backdrop-filter`.
- Left: 30×30 accent tile with a serif "O" + product name "OpsAdvisor" + monospace subtitle.
- Right: nav (Process, Cases) on landing, otherwise model / status badge.

### Single-page report flow

```
Header (sticky)
  ├─ DmaicSidebar (left rail, persistent during analysis)
  └─ Main column (max-w-page)
       ├─ ExecutiveSummary card (above the fold)
       ├─ Phase cards in DMAIC order (Define → Measure → Analyze → Improve → Control)
       └─ NextStepsCTA (copy / save .docx / save .pdf / email / waitlist)

Footer
```

### Metric row rule

- First row: exactly 2 cards — primary metric + secondary diagnostic.
- Second row: up to 3 supporting diagnostics.
- Never present a flat wall of equal-weight KPIs.

---

## Motion

- Transition: 150ms ease-out for hover/focus.
- Keyframes (Tailwind): `fade-in`, `fade-in-up`, `slide-in-right`, `pulse-soft`, `draw-bar`.
- Loading uses `animate-pulse-soft` on phase dots.
- Respect `prefers-reduced-motion`; no entrance animations on print.

---

## Naming rules

- Public workflow label for the active demo: **Lead Intake and Conversion Bottleneck** — used verbatim.
- Product name in UI / emails / exports: **OpsAdvisor** (one word, capital O, capital A).
- Repo / build-time identifier: `operator-agent`.
- Model: **Claude Opus 4.7**.
- Avoid in user-facing copy: "autonomous", "agentic orchestration", "the model thinks". DMAIC vocabulary is allowed in section labels.

---

## Handoff notes

This project is a Next.js 14 + TypeScript + Tailwind CSS application.

- Design token source: [tailwind.config.ts](tailwind.config.ts).
- CSS custom properties + editorial typography: [app/globals.css](app/globals.css).
- Component directory: [components/](components/).
- Layout / fonts: [app/layout.tsx](app/layout.tsx), [app/page.tsx](app/page.tsx).
- Pure design exploration scaffolding (not shipped) lives under [Design/](Design/).

To apply a new design pass:

1. Update color tokens in `tailwind.config.ts` and the matching custom properties in `app/globals.css`.
2. Drop or update components under `components/` (and `components/editorial/` for typographic primitives).
3. Run `npm run dev`, then `npm run typecheck` before committing.
