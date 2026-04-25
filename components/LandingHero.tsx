export function LandingHero({ onStart }: { onStart: () => void }) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-4 py-1.5 text-[12px] font-medium text-accent">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
        Powered by Claude Opus 4.7
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Find what&apos;s broken.<br />Fix it for good.
      </h1>

      <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink-soft">
        Describe a broken workflow. Operator Agent runs a structured diagnostic — framing the
        problem, diagnosing root causes, and building a control plan — in under 90 seconds.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-10 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-[15px] font-semibold text-white shadow-btn transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        View Demo →
      </button>

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
    </main>
  );
}

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Describe your workflow",
    body: "Tell us the industry, team size, where the process breaks, and what success looks like.",
  },
  {
    step: "2",
    title: "3 sequential Opus 4.7 calls",
    body: "Frame the problem, diagnose root causes, then synthesize a full action plan and control dashboard.",
  },
  {
    step: "3",
    title: "Get a consultant-grade report",
    body: "Executive summary, ranked causes, SOP, alert rules, and a monitoring plan — ready to act on.",
  },
];
