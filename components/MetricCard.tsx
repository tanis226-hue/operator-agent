type Props = {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  alert?: boolean;
};

export function MetricCard({ label, value, sub, highlight, alert }: Props) {
  return (
    <div
      className={[
        "flex flex-col gap-1 rounded-xl border px-4 py-4",
        highlight
          ? "border-accent/30 bg-accent-soft"
          : alert
          ? "border-orange-200 bg-orange-50"
          : "border-line bg-surface",
      ].join(" ")}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      <span
        className={[
          "text-2xl font-bold leading-none",
          highlight ? "text-accent" : alert ? "text-orange-600" : "text-ink",
        ].join(" ")}
      >
        {value}
      </span>
      {sub && (
        <span className="text-xs text-ink-muted">{sub}</span>
      )}
    </div>
  );
}
