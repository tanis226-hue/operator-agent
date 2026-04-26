import React from "react";

export function LandingHero({ onDemo, onStart, onPreset }: { onDemo: () => void; onStart: () => void; onPreset?: (id: string) => void }) {
  return (
    <div>
      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-shell px-12 pt-[40px] pb-[36px]">
        <div
          className="grid items-center gap-12"
          style={{ gridTemplateColumns: "0.85fr 1fr" }}
        >
          {/* Left */}
          <div>
            <div className="eyebrow eyebrow-accent mb-6" style={{ fontSize: 10, letterSpacing: "0.10em", whiteSpace: "nowrap" }}>
              <span className="mr-2" style={{ color: "var(--ink-3)" }}>§ 01</span>
              Diagnostic instrument · DMAIC method
            </div>
            <h1
              className="h-display"
              style={{ margin: 0 }}
            >
              Understand{" "}
              <span style={{ fontStyle: "italic", color: "var(--accent)" }}>
                why
              </span>{" "}
              your operation is leaking,{" "}
              <span style={{ color: "var(--ink-3)" }}>not just where.</span>
            </h1>
            <p
              className="mt-5 leading-[1.55]"
              style={{ fontSize: 16, color: "var(--ink-2)", maxWidth: "40ch" }}
            >
              Describe a broken workflow. OpsAdvisor runs the full Six&nbsp;Sigma
              DMAIC loop: Define, Measure, Analyze, Improve, Control. Hands
              back a control panel, not a pile of charts.
            </p>

          </div>

          {/* Right — spec card + CTAs */}
          <div className="flex flex-col gap-4">
            <aside
              className="relative overflow-hidden"
              style={{
                background: "var(--bone)",
                color: "var(--ink)",
                padding: "24px 28px 22px",
                borderRadius: 16,
                boxShadow: "0 2px 4px rgba(26,23,20,.04), 0 8px 24px -8px rgba(26,23,20,.10)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                className="uppercase-mono"
                style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--ink-3)" }}
              >
                Method specification · Excerpt
              </div>
              <blockquote
                className="serif italic"
                style={{ fontSize: 14, lineHeight: 1.4, margin: 0, color: "var(--ink)" }}
              >
                "If you cannot describe what you are doing as a process, you do not
                know what you are doing."
                <footer
                  className="mono not-italic mt-2"
                  style={{ fontSize: 11, color: "var(--ink-3)" }}
                >
                  — W. Edwards Deming
                </footer>
              </blockquote>

              {/* DMAIC + CTA side-by-side */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 24,
                  borderTop: "1px solid var(--line)",
                  paddingTop: 16,
                }}
              >
                {/* DMAIC list */}
                <div
                  className="grid gap-y-2 gap-x-3.5"
                  style={{ gridTemplateColumns: "auto 1fr", fontSize: 12 }}
                >
                  {DMAIC_ITEMS.map(([k, t, s]) => (
                    <React.Fragment key={k}>
                      <span
                        className="serif italic"
                        style={{ fontSize: 16, lineHeight: 1, color: "var(--accent)" }}
                      >
                        {k}
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, color: "var(--ink)", lineHeight: 1.2 }}>{t}</div>
                        <div style={{ color: "var(--ink-3)", fontSize: 11, marginTop: 2 }}>{s}</div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                {/* CTAs centered in remaining space */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                    flex: 1,
                  }}
                >
                  <button
                    type="button"
                    onClick={onStart}
                    className="inline-flex items-center gap-2 border-none font-medium"
                    style={{
                      background: "var(--ink)",
                      color: "var(--surface)",
                      padding: "12px 20px",
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      letterSpacing: "0.01em",
                      borderRadius: 50,
                      boxShadow: "0 2px 4px rgba(26,23,20,.12), 0 8px 24px -8px rgba(26,23,20,.20)",
                      transition: "transform 200ms cubic-bezier(.34,1.56,.64,1), box-shadow 200ms ease, background 200ms ease",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(-2px) scale(1.02)";
                      el.style.boxShadow = "0 4px 8px rgba(26,23,20,.16), 0 16px 36px -8px rgba(26,23,20,.32)";
                      el.style.background = "#2E2520";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget;
                      el.style.transform = "";
                      el.style.boxShadow = "0 2px 4px rgba(26,23,20,.12), 0 8px 24px -8px rgba(26,23,20,.20)";
                      el.style.background = "var(--ink)";
                    }}
                  >
                    Start a diagnosis
                    <span className="serif italic" style={{ fontSize: 17, display: "inline-block" }}>→</span>
                  </button>
                  <button
                    type="button"
                    onClick={onDemo}
                    className="uppercase-mono"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--ink-2)",
                      cursor: "pointer",
                      padding: "2px 0",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      borderBottom: "1px solid transparent",
                      transition: "color 180ms ease, border-color 180ms ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = "var(--ink)";
                      e.currentTarget.style.borderBottomColor = "var(--ink)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = "var(--ink-2)";
                      e.currentTarget.style.borderBottomColor = "transparent";
                    }}
                  >
                    See sample case ↗
                  </button>
                  <a
                    href="#process"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById("process");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="uppercase-mono"
                    style={{
                      color: "var(--ink-3)",
                      textDecoration: "none",
                      padding: "2px 0",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      borderBottom: "1px solid transparent",
                      transition: "color 180ms ease, border-color 180ms ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = "var(--ink)";
                      e.currentTarget.style.borderBottomColor = "var(--ink)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = "var(--ink-3)";
                      e.currentTarget.style.borderBottomColor = "transparent";
                    }}
                  >
                    See how it works ↓
                  </a>
                </div>
              </div>

              <div
                className="absolute top-3.5 right-4 mono"
                style={{ fontSize: 10, color: "var(--ink-4)" }}
              >
                ISO 13053-2:2011
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ─── How it works strip ────────────────────────────────── */}
      <section id="process" className="mx-auto max-w-shell px-12 py-6">
        <div
          style={{
            background: "var(--paper-2)",
            borderRadius: 20,
            padding: "40px 48px",
          }}
        >
        <div className="grid gap-12" style={{ gridTemplateColumns: "200px 1fr" }}>
          <div className="uppercase-mono flex flex-col" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--ink-3)" }}>
            <div>
              How it works
              <br />
              <span style={{ color: "var(--ink-4)" }}>3 steps · ~6 min</span>
            </div>
            <div
              className="mt-8 flex flex-col gap-1.5"
              style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--ink-4)" }}
            >
              <span>SOC&nbsp;2 in progress</span>
              <span>Read-only data access</span>
              <span>Hackathon build, v0.4</span>
            </div>
          </div>
          <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.n}>
                <div
                  className="serif italic"
                  style={{ fontSize: 44, lineHeight: 1, color: "var(--accent)" }}
                >
                  {step.n}
                </div>
                <div className="mt-4" style={{ fontSize: 17, fontWeight: 500 }}>
                  {step.title}
                </div>
                <p className="mt-1.5" style={{ color: "var(--ink-2)", fontSize: 14 }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* ─── Sample diagnoses ──────────────────────────────────── */}
      <section id="cases" className="mx-auto max-w-shell px-12 py-18 pb-24 pt-[72px]">
        <div className="mb-8">
          <div className="eyebrow eyebrow-accent mb-2">
            <span className="mr-2" style={{ color: "var(--ink-3)" }}>§ 02</span>
            Sample diagnoses
          </div>
          <h2 className="h-section" style={{ margin: 0 }}>
            Three operations examined end-to-end.
          </h2>
          <p className="mt-1.5 text-[14px]" style={{ color: "var(--ink-2)" }}>
            Each case below was run on representative data. Click the active case to open it as a demo.
          </p>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          <CaseCard
            kicker="Active demo"
            title="Professional Services: Lead intake pipeline"
            metric="Lead-to-meeting conversion"
            from="44.2%"
            to="55%+"
            window="Last 90 days"
            accent
            onClick={onDemo}
          />
          <CaseCard
            kicker="Preset case"
            title="Vertex Group HR: New employee onboarding"
            metric="Avg days to full readiness"
            from="38 days"
            to="21 days"
            window="Last 90 days"
            onClick={onPreset ? () => onPreset("onboarding") : undefined}
          />
          <CaseCard
            kicker="Preset case"
            title="Clearline Software: Support ticket SLA breach"
            metric="CSAT score (/ 5.0)"
            from="3.3"
            to="4.2"
            window="Last 60 days"
            onClick={onPreset ? () => onPreset("support") : undefined}
          />
          <CaseCard
            kicker="Preset case"
            title="Fortis Capital Partners: Contract approval lag"
            metric="Avg contract cycle time"
            from="47 days"
            to="14 days"
            window="Last quarter"
            onClick={onPreset ? () => onPreset("contracts") : undefined}
          />
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function CaseCard({
  kicker,
  title,
  metric,
  from,
  to,
  window: win,
  accent,
  onClick,
}: {
  kicker: string;
  title: string;
  metric: string;
  from: string;
  to: string;
  window: string;
  accent?: boolean;
  onClick?: () => void;
}) {
  const isClickable = !!onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      style={{
        textAlign: "left",
        background: accent ? "var(--surface)" : "var(--paper-2)",
        border: `1px solid ${accent ? "var(--line-soft)" : "transparent"}`,
        borderRadius: 16,
        padding: "20px 22px 18px",
        cursor: isClickable ? "pointer" : "default",
        position: "relative",
        transition: "transform 240ms cubic-bezier(.34,1.56,.64,1), box-shadow 240ms ease",
        fontFamily: "var(--sans)",
        opacity: isClickable ? 1 : 0.6,
        boxShadow: accent
          ? "0 2px 4px rgba(26,23,20,.04), 0 10px 32px -8px rgba(184,71,42,.12)"
          : "0 1px 3px rgba(26,23,20,.03), 0 6px 16px -6px rgba(26,23,20,.07)",
      }}
      onMouseEnter={(e) => {
        if (!isClickable) return;
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = accent
          ? "0 4px 8px rgba(26,23,20,.06), 0 18px 48px -10px rgba(184,71,42,.18)"
          : "0 4px 8px rgba(26,23,20,.06), 0 16px 40px -10px rgba(26,23,20,.14)";
      }}
      onMouseLeave={(e) => {
        if (!isClickable) return;
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = accent
          ? "0 2px 4px rgba(26,23,20,.04), 0 10px 32px -8px rgba(184,71,42,.12)"
          : "0 1px 3px rgba(26,23,20,.03), 0 6px 16px -6px rgba(26,23,20,.07)";
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className="uppercase-mono rounded-full border px-2 py-0.5"
          style={{
            fontSize: 11,
            letterSpacing: "0.10em",
            background: accent ? "var(--accent-soft)" : "var(--surface)",
            color: accent ? "var(--accent)" : "var(--ink-3)",
            borderColor: accent ? "var(--accent-border)" : "var(--line)",
          }}
        >
          {kicker}
        </span>
        <span className="uppercase-mono" style={{ fontSize: 11, letterSpacing: "0.10em", color: "var(--ink-4)" }}>
          {win}
        </span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3, marginBottom: 18 }}>
        {title}
      </div>
      <div className="uppercase-mono mb-1.5" style={{ fontSize: 11, letterSpacing: "0.10em", color: "var(--ink-3)" }}>
        {metric}
      </div>
      <div className="flex items-baseline gap-2.5">
        <span
          className="serif tabular"
          style={{
            fontSize: 24,
            color: "var(--rust)",
            textDecoration: "line-through",
            textDecorationColor: "var(--rust)",
          }}
        >
          {from}
        </span>
        <span className="mono" style={{ fontSize: 13, color: "var(--ink-3)" }}>→</span>
        <span
          className="serif tabular"
          style={{
            fontSize: 30,
            color: "var(--moss)",
            letterSpacing: "-0.02em",
          }}
        >
          {to}
        </span>
      </div>
      {isClickable && (
        <div className="mt-4 flex items-center gap-2" style={{ fontSize: 12, color: "var(--ink-2)" }}>
          Open the case{" "}
          <span className="serif italic" style={{ fontSize: 16 }}>→</span>
        </div>
      )}
    </button>
  );
}

// ─── Static data ─────────────────────────────────────────────────

const DMAIC_ITEMS: [string, string, string][] = [
  ["D", "Define",   "Charter, scope, customer voice"],
  ["M", "Measure",  "Baseline, capability, MSA"],
  ["A", "Analyze",  "Pareto, root-cause, hypothesis"],
  ["I", "Improve",  "Pilot, SOP, change plan"],
  ["C", "Control",  "Charts, alerts, ownership"],
];

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "You brief the agent",
    body: "Plain-language goal, KPI, target, and a CSV or any context you have. About 3 minutes.",
  },
  {
    n: "02",
    title: "It runs the loop",
    body: "Define, Measure, Analyze, Improve, Control. Runs each phase and explains its reasoning.",
  },
  {
    n: "03",
    title: "You receive a control panel",
    body: "Diagnosis, ranked root causes, SOP changes, KPI ownership, and alert thresholds.",
  },
];
