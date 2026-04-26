// Landing, Onboarding, and Agent Run states

const { useState: useS1, useEffect: useE1, useRef: useR1 } = React;

// ─── Landing ───────────────────────────────────────────────────
function Landing({ onStart, density }) {
  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "72px 0 56px" }}>
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 80, alignItems: "end" }}>
            <div>
              <div className="eyebrow eyebrow-accent" style={{ marginBottom: 32 }}>
                <span style={{ marginRight: 8, color: "var(--ink-3)" }}>§ 01</span>
                Diagnostic instrument · DMAIC method
              </div>
              <h1 className="h-display" style={{ margin: 0, maxWidth: "12ch" }}>
                Understand <span style={{ fontStyle: "italic", color: "var(--accent)" }}>why</span> your operation is leaking,
                <br />
                <span style={{ color: "var(--ink-3)" }}>not just where.</span>
              </h1>
              <p style={{ marginTop: 28, fontSize: 19, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: "44ch" }}>
                Operator is an AI consulting analyst that runs the full
                Six&nbsp;Sigma DMAIC loop on your business — Define, Measure,
                Analyze, Improve, Control — and hands back a control panel,
                not a pile of charts.
              </p>

              <div style={{ marginTop: 40, display: "flex", gap: 16, alignItems: "center" }}>
                <button
                  onClick={onStart}
                  style={{
                    background: "var(--ink)",
                    color: "var(--paper)",
                    border: "none",
                    padding: "16px 28px",
                    fontFamily: "var(--sans)",
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: "0.01em",
                    cursor: "pointer",
                    borderRadius: 2,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  Start a diagnosis
                  <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 18 }}>→</span>
                </button>
                <a className="uppercase-mono" style={{ color: "var(--ink-2)" }} href="#cases">
                  See sample case ↗
                </a>
              </div>

              <div style={{ marginTop: 56, display: "flex", gap: 36, color: "var(--ink-3)", fontSize: 12 }}>
                <span>SOC&nbsp;2 in progress</span>
                <span>·</span>
                <span>Read-only data access</span>
                <span>·</span>
                <span>Hackathon build, v0.4</span>
              </div>
            </div>

            {/* Right: spec card */}
            <aside
              style={{
                background: "var(--ink)",
                color: "var(--paper)",
                padding: "32px 32px 28px",
                borderRadius: 4,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div className="uppercase-mono" style={{ fontSize: 9.5, color: "rgba(246,243,236,0.55)", marginBottom: 18 }}>
                Method specification · Excerpt
              </div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.35, fontStyle: "italic", marginBottom: 24 }}>
                "If you cannot describe what you are doing as a process, you do not know what you are doing."
                <div style={{ fontFamily: "var(--mono)", fontStyle: "normal", fontSize: 10, marginTop: 10, color: "rgba(246,243,236,0.55)" }}>
                  — W. Edwards Deming
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", rowGap: 10, columnGap: 16, fontSize: 12 }}>
                {[
                  ["D", "Define", "Charter, scope, customer voice"],
                  ["M", "Measure", "Baseline, capability, MSA"],
                  ["A", "Analyze", "Pareto, root-cause, hypothesis"],
                  ["I", "Improve", "Pilot, SOP, change plan"],
                  ["C", "Control", "Charts, alerts, ownership"],
                ].map(([k, t, s]) => (
                  <React.Fragment key={k}>
                    <span className="serif" style={{ fontStyle: "italic", color: "var(--accent)", fontSize: 18, lineHeight: 1 }}>{k}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{t}</div>
                      <div style={{ color: "rgba(246,243,236,0.55)", fontSize: 11 }}>{s}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <div style={{ position: "absolute", top: 16, right: 16, fontFamily: "var(--mono)", fontSize: 9, color: "rgba(246,243,236,0.45)" }}>
                ISO 13053-2:2011
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Process strip */}
      <section id="process" style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "40px 0" }}>
        <div className="shell" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 48, alignItems: "start" }}>
          <div className="uppercase-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
            How it works
            <br />
            <span style={{ color: "var(--ink-4)" }}>3 steps · ~6 min</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              {
                n: "01",
                t: "You brief the agent",
                s: "Plain-language goal, KPI, target, and a CSV or warehouse connection. ~3 min."
              },
              {
                n: "02",
                t: "It runs the loop",
                s: "Watches itself profile data, build hypotheses, run statistical tests, compose findings."
              },
              {
                n: "03",
                t: "You receive a control panel",
                s: "Diagnosis, ranked root causes, SOP changes, KPI ownership, alert thresholds."
              },
            ].map((step) => (
              <div key={step.n}>
                <div className="serif" style={{ fontSize: 44, lineHeight: 1, color: "var(--accent)", fontStyle: "italic" }}>
                  {step.n}
                </div>
                <div style={{ marginTop: 18, fontSize: 17, fontWeight: 500 }}>{step.t}</div>
                <p style={{ marginTop: 6, color: "var(--ink-2)", fontSize: 14 }}>{step.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cases preview */}
      <section id="cases" style={{ padding: "72px 0 96px" }}>
        <div className="shell">
          <SectionHead
            eyebrow="Sample diagnoses"
            title="Three operations Operator has examined."
            sub="Each case below was run end-to-end on synthetic but representative data. Click any to load it as a demo."
            marker="§ 02"
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 32 }}>
            <CaseCard
              kicker="Active demo"
              title="Mid-market SaaS — Pipeline conversion drop"
              metric="Demo-to-Booked"
              from="42%"
              to="29%"
              window="Q3 → Q4"
              accent
              onClick={onStart}
            />
            <CaseCard
              kicker="Sample"
              title="DTC Apparel — Returns spike on size 8"
              metric="Return rate"
              from="11%"
              to="19%"
              window="Last 60 days"
            />
            <CaseCard
              kicker="Sample"
              title="Marketplace Ops — SLA breach on tier-1"
              metric="On-time delivery"
              from="94%"
              to="86%"
              window="Last 30 days"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function CaseCard({ kicker, title, metric, from, to, window, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        background: accent ? "var(--paper)" : "var(--surface)",
        border: `1px solid ${accent ? "var(--ink)" : "var(--line)"}`,
        borderRadius: 4,
        padding: "24px 24px 22px",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        fontFamily: "var(--sans)",
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,23,20,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Pill tone={accent ? "accent" : "default"}>{kicker}</Pill>
        <span className="uppercase-mono" style={{ fontSize: 9, color: "var(--ink-4)" }}>{window}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.3, marginBottom: 28 }}>{title}</div>
      <div className="uppercase-mono" style={{ fontSize: 9, color: "var(--ink-3)", marginBottom: 6 }}>{metric}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span className="serif tabular" style={{ fontSize: 32, color: "var(--ink-3)", textDecoration: "line-through", textDecorationColor: "var(--ink-4)" }}>
          {from}
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-3)" }}>→</span>
        <span className="serif tabular" style={{ fontSize: 40, color: accent ? "var(--rust)" : "var(--ink)", letterSpacing: "-0.02em" }}>
          {to}
        </span>
      </div>
      {onClick && (
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-2)" }}>
          Open the case <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16 }}>→</span>
        </div>
      )}
    </button>
  );
}

// ─── Onboarding wizard ─────────────────────────────────────────
function Onboarding({ onComplete, onCancel }) {
  const [step, setStep] = useS1(0);
  const [form, setForm] = useS1({
    business: "Mid-market B2B SaaS — sales operations",
    kpi: "demo_to_booked",
    period: "last_90_days",
    target: 40,
    suspicion: "Demos got harder to book after we expanded the SDR team in October.",
  });

  const steps = ["Business", "KPI", "Data", "Hypothesis"];

  const goNext = () => (step < 3 ? setStep(step + 1) : onComplete(form));
  const goBack = () => (step > 0 ? setStep(step - 1) : onCancel());

  return (
    <section style={{ padding: "56px 0 96px", minHeight: "calc(100vh - 80px)" }}>
      <div className="shell" style={{ maxWidth: 880 }}>
        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity: i <= step ? 1 : 0.45,
                }}
              >
                <span
                  className="mono"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    border: `1px solid ${i === step ? "var(--accent)" : "var(--line)"}`,
                    background: i < step ? "var(--ink)" : i === step ? "var(--accent)" : "transparent",
                    color: i <= step ? "var(--paper)" : "var(--ink-3)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 10,
                  }}
                >
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="uppercase-mono" style={{ fontSize: 10 }}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span style={{ flex: 1, height: 1, background: i < step ? "var(--ink)" : "var(--line)" }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="eyebrow eyebrow-accent" style={{ marginBottom: 12 }}>
          <span style={{ marginRight: 8, color: "var(--ink-3)" }}>Step {step + 1} of 4</span>
          {steps[step]}
        </div>
        <h2 className="h-section" style={{ margin: "0 0 8px", fontSize: 38 }}>
          {[
            "What part of the business should I look at?",
            "Which metric should I anchor on?",
            "Where can I read the data?",
            "What do you suspect is going on?",
          ][step]}
        </h2>
        <p style={{ color: "var(--ink-2)", maxWidth: 560, marginBottom: 36 }}>
          {[
            "Plain language is fine. I'll use this to shape the Define charter and pick which artifacts to fetch.",
            "I'll baseline this metric, check process capability, and rank loss drivers against the target you give me.",
            "Read-only. I'll profile schemas first and tell you what's missing before I touch anything.",
            "Hypotheses make the analysis faster — but they don't bias me. I'll mark each as confirmed, refuted, or refined.",
          ][step]}
        </p>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 4, padding: 32 }}>
          {step === 0 && <BusinessStep form={form} setForm={setForm} />}
          {step === 1 && <KPIStep form={form} setForm={setForm} />}
          {step === 2 && <DataStep />}
          {step === 3 && <HypothesisStep form={form} setForm={setForm} />}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          <button
            onClick={goBack}
            style={{
              background: "transparent",
              border: "1px solid var(--line)",
              padding: "12px 20px",
              fontFamily: "var(--sans)",
              fontSize: 13,
              cursor: "pointer",
              borderRadius: 2,
              color: "var(--ink-2)",
            }}
          >
            ← {step === 0 ? "Cancel" : "Back"}
          </button>
          <button
            onClick={goNext}
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              border: "none",
              padding: "12px 22px",
              fontFamily: "var(--sans)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              borderRadius: 2,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {step === 3 ? "Run the diagnosis" : "Continue"}
            <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16 }}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function BusinessStep({ form, setForm }) {
  const presets = [
    "Mid-market B2B SaaS — sales operations",
    "DTC apparel brand — fulfillment & returns",
    "Marketplace logistics — last-mile delivery",
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <textarea
        value={form.business}
        onChange={(e) => setForm({ ...form, business: e.target.value })}
        rows={3}
        style={{
          width: "100%",
          border: "1px solid var(--line)",
          background: "var(--paper)",
          padding: "14px 16px",
          fontFamily: "var(--sans)",
          fontSize: 15,
          borderRadius: 2,
          resize: "vertical",
          color: "var(--ink)",
        }}
      />
      <div className="uppercase-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
        Or pick a preset
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setForm({ ...form, business: p })}
            style={{
              background: form.business === p ? "var(--ink)" : "transparent",
              color: form.business === p ? "var(--paper)" : "var(--ink-2)",
              border: "1px solid var(--line)",
              padding: "8px 12px",
              fontFamily: "var(--sans)",
              fontSize: 12,
              cursor: "pointer",
              borderRadius: 999,
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function KPIStep({ form, setForm }) {
  const kpis = [
    { id: "demo_to_booked", label: "Demo → Booked Meeting", unit: "%", current: 29, target: 40 },
    { id: "lead_to_demo", label: "Lead → Demo Held", unit: "%", current: 18, target: 25 },
    { id: "trial_to_paid", label: "Trial → Paid", unit: "%", current: 12, target: 18 },
    { id: "pipeline_velocity", label: "Pipeline velocity", unit: "days", current: 47, target: 32 },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {kpis.map((k) => {
        const sel = form.kpi === k.id;
        return (
          <button
            key={k.id}
            onClick={() => setForm({ ...form, kpi: k.id, target: k.target })}
            style={{
              textAlign: "left",
              border: `1px solid ${sel ? "var(--accent)" : "var(--line)"}`,
              background: sel ? "var(--accent-soft)" : "var(--paper)",
              padding: "18px 20px",
              borderRadius: 2,
              cursor: "pointer",
              fontFamily: "var(--sans)",
              position: "relative",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>{k.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span className="serif tabular" style={{ fontSize: 28 }}>{k.current}</span>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{k.unit}</span>
              <span className="uppercase-mono" style={{ fontSize: 9, color: "var(--ink-3)", marginLeft: "auto" }}>
                target {k.target}
                {k.unit}
              </span>
            </div>
            {sel && (
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  background: "var(--accent)",
                  color: "var(--paper)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 10,
                }}
              >
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function DataStep() {
  const sources = [
    { name: "Salesforce", status: "connected", rows: "182,440 rows · refreshed 2h ago" },
    { name: "HubSpot", status: "connected", rows: "94,212 rows · refreshed 18m ago" },
    { name: "Snowflake — sales_marts", status: "connected", rows: "12 tables · live" },
    { name: "Gong call transcripts", status: "optional", rows: "Skipped for this run" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {sources.map((s) => (
        <div
          key={s.name}
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 16,
            padding: "16px 18px",
            border: "1px solid var(--line)",
            background: "var(--paper)",
            borderRadius: 2,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: s.status === "connected" ? "var(--moss)" : "var(--ink-4)",
            }}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</div>
            <div className="uppercase-mono" style={{ fontSize: 9, color: "var(--ink-3)", marginTop: 4 }}>
              {s.rows}
            </div>
          </div>
          <span className="uppercase-mono" style={{ fontSize: 9, color: "var(--ink-3)" }}>
            {s.status === "connected" ? "Read-only" : "Optional"}
          </span>
        </div>
      ))}
      <div className="uppercase-mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 12 }}>
        + Add another source
      </div>
    </div>
  );
}

function HypothesisStep({ form, setForm }) {
  const tags = [
    "Sales rep coverage changed",
    "Lead source mix shifted",
    "Pricing or packaging change",
    "Seasonal effect",
    "ICP drift",
    "Outbound vs inbound",
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <textarea
        value={form.suspicion}
        onChange={(e) => setForm({ ...form, suspicion: e.target.value })}
        rows={4}
        placeholder="Optional. What's your gut telling you?"
        style={{
          width: "100%",
          border: "1px solid var(--line)",
          background: "var(--paper)",
          padding: "14px 16px",
          fontFamily: "var(--sans)",
          fontSize: 15,
          borderRadius: 2,
          resize: "vertical",
          color: "var(--ink)",
        }}
      />
      <div className="uppercase-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
        Or tag a likely cause
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {tags.map((t) => (
          <span
            key={t}
            style={{
              border: "1px solid var(--line)",
              padding: "6px 12px",
              fontFamily: "var(--sans)",
              fontSize: 12,
              borderRadius: 999,
              color: "var(--ink-2)",
              cursor: "pointer",
            }}
          >
            + {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Agent run state ───────────────────────────────────────────
function AgentRun({ form, onDone, speed = 1 }) {
  const phases = [
    { letter: "D", label: "Define", steps: ["Drafting project charter", "Mapping SIPOC", "Capturing voice of customer", "Writing problem statement"] },
    { letter: "M", label: "Measure", steps: ["Profiling 182,440 opportunity rows", "Computing baseline conversion", "Process capability (Cpk)", "Measurement system check"] },
    { letter: "A", label: "Analyze", steps: ["Building Pareto of loss drivers", "Stratifying by source × rep × segment", "Hypothesis tests (χ², t-test)", "Composing root-cause narrative"] },
    { letter: "I", label: "Improve", steps: ["Generating SOP changes", "Sizing pilot impact", "Mapping change owners"] },
    { letter: "C", label: "Control", steps: ["Selecting control charts", "Setting alert thresholds", "Wiring KPI ownership"] },
  ];

  const flat = phases.flatMap((p, pi) => p.steps.map((s, si) => ({ ...p, step: s, pi, si })));
  const [idx, setIdx] = useS1(0);

  useE1(() => {
    if (idx >= flat.length) {
      const t = setTimeout(onDone, 600 / speed);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIdx((i) => i + 1), (550 + Math.random() * 250) / speed);
    return () => clearTimeout(t);
  }, [idx, speed]);

  const currentPhase = flat[Math.min(idx, flat.length - 1)];
  const overallPct = Math.min(100, Math.round((idx / flat.length) * 100));

  return (
    <section style={{ padding: "48px 0 96px", minHeight: "calc(100vh - 80px)" }}>
      <div className="shell" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64 }}>
        {/* Left: status */}
        <div style={{ position: "sticky", top: 100, alignSelf: "start" }}>
          <div className="eyebrow eyebrow-accent" style={{ marginBottom: 16 }}>
            <span style={{ marginRight: 8, color: "var(--ink-3)" }}>● Live</span>
            Agent run · DMAIC loop
          </div>
          <h2 className="h-section" style={{ margin: 0, fontSize: 40 }}>
            Operator is examining your <span style={{ color: "var(--accent)", fontStyle: "italic" }}>pipeline.</span>
          </h2>
          <p style={{ color: "var(--ink-2)", marginTop: 12, maxWidth: 380 }}>
            This usually takes 4–6 minutes. You can close the tab; results will be saved to your case file.
          </p>

          {/* Phase ring */}
          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 12 }}>
            {phases.map((p, pi) => {
              const done = idx >= phases.slice(0, pi + 1).reduce((s, x) => s + x.steps.length, 0);
              const active = pi === currentPhase.pi;
              return (
                <div key={p.letter} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center", opacity: active || done ? 1 : 0.4 }}>
                  <span
                    className="serif"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      background: done ? "var(--ink)" : active ? "var(--accent)" : "transparent",
                      color: done || active ? "var(--paper)" : "var(--ink-3)",
                      border: !done && !active ? "1px solid var(--line)" : "none",
                      fontSize: 18,
                      fontStyle: "italic",
                    }}
                  >
                    {p.letter}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: active ? 500 : 400 }}>{p.label}</span>
                  <span className="uppercase-mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>
                    {done ? "Done" : active ? "Running" : "Queued"}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 36 }}>
            <div className="uppercase-mono" style={{ fontSize: 10, color: "var(--ink-3)", marginBottom: 8 }}>
              Overall · {overallPct}%
            </div>
            <div style={{ height: 4, background: "var(--paper-2)", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${overallPct}%`,
                  background: "var(--accent)",
                  transition: "width 400ms ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: live trace */}
        <div>
          <div className="uppercase-mono" style={{ fontSize: 10, color: "var(--ink-3)", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <span>Trace · {flat.length} steps</span>
            <span>Claude Opus 4.7 · 6 tools active</span>
          </div>
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 4,
              background: "var(--surface)",
              padding: "8px 0",
              maxHeight: 560,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {flat.slice(0, idx + 1).map((s, i) => {
              const done = i < idx;
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 32px 1fr auto",
                    gap: 12,
                    padding: "10px 18px",
                    alignItems: "center",
                    borderBottom: i < idx ? "1px solid var(--line-soft)" : "none",
                    opacity: done ? 0.7 : 1,
                    animation: i === idx ? "fadeIn 240ms ease" : "none",
                  }}
                >
                  <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>
                    {String(i + 1).padStart(3, "0")}
                  </span>
                  <span className="serif" style={{ fontStyle: "italic", color: "var(--accent)", fontSize: 16 }}>{s.letter}</span>
                  <span style={{ fontSize: 13.5, color: "var(--ink)" }}>
                    {s.step}
                    {!done && <span className="dotdotdot" />}
                  </span>
                  <span className="uppercase-mono" style={{ fontSize: 9, color: done ? "var(--moss)" : "var(--ink-3)" }}>
                    {done ? "✓ ok" : "running"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tool log */}
          <div style={{ marginTop: 24, fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)", lineHeight: 1.7 }}>
            <div>$ profile_table sales.opportunities → 182,440 rows, 47 columns</div>
            <div>$ baseline_kpi demo_to_booked → 29.2% (target 40%, σ 8.4)</div>
            <div>$ process_capability → Cpk 0.31 · <span style={{ color: "var(--rust)" }}>incapable</span></div>
            <div>$ pareto loss_drivers → 3 causes account for 76% of variance</div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Landing, Onboarding, AgentRun });
