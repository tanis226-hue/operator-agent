export function LandingHero({ onDemo, onStart }: { onDemo: () => void; onStart: () => void }) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Find what&apos;s broken.<br />Fix it for good.
      </h1>

      <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink-soft">
        Describe a broken workflow. OpsAdvisor runs a full DMAIC diagnostic: defining the
        problem, measuring current performance, analyzing root causes, and building an improvement
        and control plan, in under 90 seconds.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onDemo}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-[15px] font-semibold text-white shadow-btn transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          View Demo →
        </button>
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-8 py-4 text-[15px] font-semibold text-ink shadow-btn transition hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Analyze my workflow
        </button>
      </div>

      <div className="mt-16 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
        {HOW_IT_WORKS.map((item) => (
          <div
            key={item.step}
            className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-[13px] font-bold text-accent">
              {item.step}
            </span>
            <h3 className="text-[14px] font-semibold text-ink">{item.title}</h3>
            <p className="text-[13px] leading-relaxed text-ink-soft">{item.body}</p>
          </div>
        ))}
      </div>

      {/* Sample output preview */}
      <div className="mt-12 w-full rounded-xl border border-line bg-surface p-5 text-left">
        <p className="eyebrow mb-4">Example output: lead intake pipeline, 120 leads analyzed</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SAMPLE_METRICS.map((m) => (
            <div
              key={m.label}
              className={[
                "flex flex-col gap-1 rounded-xl border px-4 py-3",
                m.alert ? "border-red-200 bg-red-50" : "border-line bg-canvas",
              ].join(" ")}
            >
              <span className={["text-[10px] font-semibold uppercase tracking-wide", m.alert ? "text-red-500" : "text-ink-muted"].join(" ")}>
                {m.label}
              </span>
              <span className={["text-[22px] font-bold tabular-nums leading-tight", m.alert ? "text-red-600" : "text-ink"].join(" ")}>
                {m.value}
              </span>
              <span className="text-[11px] text-ink-muted">{m.sub}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-ink-muted">
          Leads not converting due to inconsistent follow-up. The 4-hour response rule exists on paper, but nothing in the CRM enforces it.
        </p>
      </div>
    </main>
  );
}

const SAMPLE_METRICS = [
  { label: "Conversion rate",      value: "44.2%", sub: "New lead → booked meeting", alert: false },
  { label: "Missed follow-up",     value: "26.7%", sub: "Above 20% alert threshold",  alert: true  },
  { label: "Stalled lead rate",    value: "25.8%", sub: "31 leads in decay",          alert: true  },
  { label: "Revenue at risk",      value: "$248k", sub: "31 stalled × $8k avg deal",  alert: true  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Describe your workflow",
    body: "Tell us the industry, team size, where the process breaks, and what success looks like.",
  },
  {
    step: "2",
    title: "DMAIC analysis pipeline",
    body: "Define the problem, measure current KPIs, analyze root causes, then build the improvement plan and control system.",
  },
  {
    step: "3",
    title: "Get a consultant-grade report",
    body: "Executive summary, ranked root causes, SOP, alert rules, and a monitoring plan, ready to act on.",
  },
];
