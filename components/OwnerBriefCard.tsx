"use client";

import type { OwnerBrief } from "@/lib/outputTypes";
import type { PipelineAnalysis } from "@/lib/analyzePipeline";

type Props = {
  ownerBrief: OwnerBrief;
  analysis?: PipelineAnalysis;
};

const WHEN_STYLES: Record<string, { pill: string; label: string }> = {
  "this week":    { pill: "bg-rust-soft text-rust-ink border-rust-border",   label: "This week" },
  "this month":   { pill: "bg-ochre-soft text-ochre-ink border-ochre-border", label: "This month" },
  "this quarter": { pill: "bg-moss-soft text-moss-ink border-moss-border",   label: "This quarter" },
};

export function OwnerBriefCard({ ownerBrief, analysis }: Props) {
  const { problem, moneyAtRisk, actions, nextDecision } = ownerBrief;

  // When pipeline data is available, compute a precise short figure directly
  // (avoids AI generating a long paragraph instead of a number)
  const displayAtRisk =
    analysis && analysis.stalledLeads > 0
      ? `$${Math.round((analysis.stalledLeads * analysis.avgDealValue) / 1000)}k at risk`
      : moneyAtRisk || "-";

  const atRiskSub =
    analysis && analysis.stalledLeads > 0
      ? `${analysis.stalledLeads} stalled leads × $${analysis.avgDealValue.toLocaleString()} avg deal`
      : null;

  return (
    <section
      aria-label="Owner Brief"
      className="relative overflow-hidden rounded-card border border-accent/30 bg-surface shadow-card-lg"
    >
      {/* Accent top stripe */}
      <div className="h-[3px] w-full bg-accent/60" />

      {/* Header */}
      <div className="border-b border-line px-6 py-4">
        <p className="eyebrow text-accent mb-1">Owner View</p>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[17px] font-semibold text-ink">Monday Morning Brief</h2>
          <span className="text-[12px] text-ink-muted">
            Problem · Revenue at risk · Top 3 actions · Next step
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-0 divide-y divide-line">

        {/* Row 1: Problem + Money at risk */}
        <div className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="eyebrow mb-1.5">What's broken</p>
            <p className="text-[14px] font-medium leading-snug text-ink">{problem}</p>
          </div>
          <div className="rounded-lg border border-rust-border bg-rust-soft px-4 py-3 flex flex-col gap-1">
            <p className="eyebrow text-rust-ink">Revenue at risk</p>
            <p className="text-[22px] font-bold tabular-nums text-rust-ink leading-tight">
              {displayAtRisk}
            </p>
            {atRiskSub && (
              <p className="text-[11px] text-rust-ink/70 leading-snug">{atRiskSub}</p>
            )}
          </div>
        </div>

        {/* Row 2: 3 prioritized actions */}
        <div className="px-6 py-4">
          <p className="eyebrow mb-3">Top 3 actions, in order</p>
          <ol className="flex flex-col gap-2.5">
            {actions.map((item, i) => {
              const style = WHEN_STYLES[item.when] ?? {
                pill: "bg-canvas text-ink-muted border-line",
                label: item.when,
              };
              return (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-[10px] font-bold text-accent">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-snug text-ink">{item.action}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          style.pill,
                        ].join(" ")}
                      >
                        {style.label}
                      </span>
                      {item.expectedLift && (
                        <span className="text-[12px] text-ink-soft">
                          → {item.expectedLift}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Row 3: Monday morning next step */}
        <div className="bg-accent-soft px-6 py-4">
          <p className="eyebrow text-accent mb-1.5">What to do Monday morning</p>
          <p className="text-[14px] font-medium leading-snug text-ink">{nextDecision}</p>
        </div>

      </div>
    </section>
  );
}
