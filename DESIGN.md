# Operator Agent — Design System

This file documents the visual design system for Operator Agent. It is the source of truth for colors, typography, spacing, components, and interaction patterns. Compatible with Claude Design handoff format.

---

## Brand

**Product name:** Operator Agent  
**Tagline:** Diagnose where leads are leaking, fix the biggest operational breakdown, and put controls in place.  
**Audience:** Business owners and department heads — not developers or analysts.  
**Tone:** Direct, credible, calm. Not hypey, not academic, not chatbot-first.  
**Built with:** Claude Opus 4.7 via Anthropic API

---

## Color Tokens

### Primitive palette

| Token | Hex | Usage |
|---|---|---|
| `coral-600` | `#C96442` | Primary accent — buttons, highlights, active state |
| `coral-500` | `#D97756` | Accent hover state |
| `coral-50` | `#FEF3EE` | Accent soft background |
| `cream-50` | `#FAF9F7` | Page canvas / body background |
| `cream-100` | `#F3F1ED` | Subtle section fill |
| `stone-900` | `#1C1917` | Primary text |
| `stone-600` | `#57534E` | Secondary text |
| `stone-400` | `#A8A29E` | Muted / placeholder text |
| `stone-200` | `#E7E5E4` | Border / divider |
| `stone-100` | `#F5F5F4` | Card alternative fill |
| `white` | `#FFFFFF` | Card surface |
| `red-500` | `#EF4444` | Destructive / critical alert |
| `orange-500` | `#F97316` | Warning / stalled indicator |

### Semantic aliases (Tailwind config)

```
canvas   → cream-50   (#FAF9F7)
surface  → white      (#FFFFFF)
ink      → stone-900  (#1C1917)
ink-soft → stone-600  (#57534E)
ink-muted→ stone-400  (#A8A29E)
line     → stone-200  (#E7E5E4)
accent   → coral-600  (#C96442)
accent-soft → coral-50 (#FEF3EE)
```

---

## Typography

**Font stack:** `Söhne, ui-sans-serif, system-ui, -apple-system, Helvetica Neue, Arial, sans-serif`  
*(Falls back to system sans-serif if Söhne is unavailable)*

| Role | Size | Weight | Line height |
|---|---|---|---|
| Page heading | 24px / 1.5rem | 600 semibold | 1.25 |
| Section heading | 18px / 1.125rem | 600 semibold | 1.3 |
| Card heading | 15px / 0.9375rem | 600 semibold | 1.3 |
| Body | 14px / 0.875rem | 400 regular | 1.6 |
| Small / label | 12px / 0.75rem | 500 medium | 1.4 |
| Eyebrow | 11px / 0.6875rem | 600 semibold | 1.4 — uppercase + tracked |
| Metric value | 28px / 1.75rem | 700 bold | 1 |

---

## Spacing

Base unit: **4px (0.25rem)**

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Icon gap, badge padding |
| `sm` | 8px | Tight internal spacing |
| `md` | 16px | Card internal padding (horizontal) |
| `lg` | 24px | Card internal padding, section gap |
| `xl` | 32px | Major section spacing |
| `2xl` | 48px | Page-level spacing |

Card padding: **24px (horizontal) × 20px (vertical)**  
Section gap: **20px**  
Page max-width: **1024px (max-w-5xl)**  
Page horizontal padding: **24px**

---

## Elevation & Borders

| Level | Shadow | Border | Radius | Usage |
|---|---|---|---|---|
| Card | `0 1px 3px rgba(28,25,23,.05), 0 1px 2px rgba(28,25,23,.07)` | `1px solid #E7E5E4` | `16px` | Default card |
| Summary card | same | `1px solid rgba(201,100,66,.25)` + `ring-1 ring-coral/10` | `16px` | Executive summary |
| Button | `0 1px 2px rgba(28,25,23,.08)` | none | `8px` | Primary CTA |
| Metric card | `0 1px 2px rgba(28,25,23,.04)` | `1px solid #E7E5E4` | `12px` | KPI cards |

---

## Components

### Button — Primary
- Background: `accent` (#C96442)
- Text: white, 14px, semibold
- Padding: 8px 20px
- Radius: 8px
- Hover: `#B85A3A` (darken 8%)
- Disabled: opacity 50%, cursor not-allowed

### Card
- Background: white
- Border: 1px solid `line`
- Radius: 16px
- Shadow: card level
- Header: 16px font, semibold, with eyebrow above
- Content padding: 24px

### Metric Card (KPI)
- Eyebrow: 11px uppercase, stone-400
- Value: 28px bold, ink or accent
- Sub: 12px, stone-400
- Alert state: orange-50 background, orange-200 border, orange-600 value
- Highlight state: coral-50 background, coral-200 border, coral accent value
- Radius: 12px

### Eyebrow / Section label
- 11px, semibold, uppercase, letter-spacing 0.08em
- Color: stone-400 (muted)
- Always appears above a heading

### Phase badge
- 10px, stone-400
- Rounded full, bordered, canvas background
- Shows "01" through "09"

### Alert badge
- Severity critical: red-50 bg, red-200 border, red-700 text
- Severity warning: orange-50 bg, orange-200 border, orange-700 text
- Padding: 12px 16px, radius 8px

### Progress / bar chart
- Track: stone-200, h-2, radius full
- Fill: accent for good, red-400 for bad, orange-400 for warning
- No animation in print / reduced-motion

---

## Layout Patterns

### Single-page app structure
```
Header (sticky, 72px)
  └─ Product name + subtitle
  └─ Workflow badge (right)

Main content (max-w-5xl, centered, px-24 py-32)
  └─ Intake brief card (full-width or collapsed banner)
  └─ Run analysis section (full-width)
  └─ Results label divider
  └─ Ordered phase cards (gap-20)

Footer (text-xs, muted)
```

### Card header anatomy
```
[Eyebrow label]          [Phase number badge]
[Card title — semibold]
```

### Metric row rule
- First metric row: exactly 2 cards (headline pair only)
- Second metric row: up to 3 supporting diagnostics
- Never a flat wall of equal-weight KPIs

---

## Motion

- Transition duration: 150ms ease-out for hover/focus
- Loading animation: `animate-pulse` for dots, 3-dot sequence with 200ms delay offset
- No entrance animations (demo reliability over flash)
- Reduced motion: respect `prefers-reduced-motion`

---

## Naming rules

- Public workflow label: **Lead Intake and Conversion Bottleneck** — used verbatim in all UI, never abbreviated or swapped
- Product: **Operator Agent** — always two words, capital O, capital A
- Built with: **Claude Opus 4.7** — include in header and footer
- Do not use: "autonomous", "agentic orchestration", "DMAIC" in user-facing copy

---

## Claude Design Handoff Notes

This project is a Next.js 14 + TypeScript + Tailwind CSS application.  
Design token source: `tailwind.config.ts`  
Component directory: `components/`  
Layout: `app/layout.tsx`, `app/page.tsx`  
Data: local CSV + Anthropic API (`lib/buildOutputPayload.ts`)

To apply a new design from Claude Design:
1. Export the React/Tailwind component bundle
2. Drop components into `components/`
3. Update color tokens in `tailwind.config.ts` to match the generated palette
4. Restart `npm run dev`
