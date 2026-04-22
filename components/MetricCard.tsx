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
        "flex flex-col gap-1.5 rounded-metric border px-4 py-4",
        highlight
          ? "border-accent-border bg-accent-soft"
          : alert
          ? "border-orange-200 bg-orange-50"
          : "border-line bg-surface",
      ].join(" ")}
    >
      <span className="eyebrow">{label}</span>
      <span
        className={[
          "text-[28px] font-bold leading-none tracking-tight",
          highlight
            ? "text-accent"
            : alert
            ? "text-orange-600"
            : "text-ink",
        ].join(" ")}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[11px] text-ink-muted leading-snug">{sub}</span>
      )}
    </div>
  );
}
