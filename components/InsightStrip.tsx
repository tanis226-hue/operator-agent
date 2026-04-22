"use client";

import type { PipelineAnalysis } from "@/lib/analyzePipeline";

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n.toLocaleString()}`;
}

type Variant = "neutral" | "ok" | "warning" | "critical";

const V: Record<Variant, { bg: string; value: string; sub: string }> = {
  neutral:  { bg: "bg-surface",    value: "text-ink",          sub: "text-ink-muted" },
  ok:       { bg: "bg-emerald-50", value: "text-emerald-700",  sub: "text-emerald-600/70" },
  warning:  { bg: "bg-orange-50",  value: "text-orange-600",   sub: "text-orange-500/70" },
  critical: { bg: "bg-red-50",     value: "text-red-600",      sub: "text-red-500/70" },
};

function Tile({
  label,
  value,
  sub,
  variant,
}: {
  label: string;
  value: string;
  sub: string;
  variant: Variant;
}) {
  const s = V[variant];
  return (
    <div className={`flex flex-col gap-1 px-5 py-5 ${s.bg}`}>
      <span className="eyebrow">{label}</span>
      <span className={`text-[26px] font-bold leading-none tracking-tight ${s.value}`}>
        {value}
      </span>
      <span className={`mt-0.5 text-[11px] leading-snug ${s.sub}`}>{sub}</span>
    </div>
  );
}

export function InsightStrip({ analysis }: { analysis: PipelineAnalysis }) {
  const revAtRisk = analysis.stalledLeads * analysis.avgDealValue;
  const topGap = analysis.rankedCauses[0]?.impactDelta ?? 0;
  const topFactor = analysis.rankedCauses[0]?.factor.split(" (")[0] ?? "conversion gap";
  const alertCount = analysis.thresholdAlerts.filter((a) => a.breached).length;
  const totalAlerts = analysis.thresholdAlerts.length;

  return (
    <div className="overflow-hidden rounded-xl border border-line shadow-card">
      <div className="grid grid-cols-2 divide-x divide-y divide-line md:grid-cols-4 md:divide-y-0">
        <Tile
          label="Conversion rate"
          value={`${analysis.conversionRate}%`}
          sub="new lead → booked meeting"
          variant="neutral"
        />
        <Tile
          label="Revenue at risk"
          value={formatCurrency(revAtRisk)}
          sub={`${analysis.stalledLeads} stalled leads × avg deal`}
          variant="critical"
        />
        <Tile
          label="Top factor gap"
          value={`−${topGap.toFixed(0)}pp`}
          sub={topFactor}
          variant="warning"
        />
        <Tile
          label="SLA breaches"
          value={`${alertCount} / ${totalAlerts}`}
          sub="metrics above threshold"
          variant={alertCount === totalAlerts ? "critical" : alertCount > 0 ? "warning" : "ok"}
        />
      </div>
    </div>
  );
}
