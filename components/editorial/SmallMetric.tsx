type Tone = "default" | "alert" | "ok";

const TONE_VALUE_COLOR: Record<Tone, string> = {
  default: "var(--ink)",
  alert:   "var(--rust)",
  ok:      "var(--moss)",
};

export function SmallMetric({
  label,
  value,
  sub,
  tone = "default",
  target,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
  target?: string;
}) {
  return (
    <div
      className="relative flex flex-col gap-2 rounded-[var(--radius-card)] border p-5"
      style={{
        background: "var(--surface)",
        borderColor: "var(--line)",
      }}
    >
      <div className="eyebrow">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="metric-md" style={{ color: TONE_VALUE_COLOR[tone] }}>
          {value}
        </span>
        {target && (
          <span
            className="tabular text-[12px]"
            style={{ color: "var(--ink-3)", fontFamily: "var(--mono)" }}
          >
            ↗ {target}
          </span>
        )}
      </div>
      {sub && (
        <div className="text-[12px]" style={{ color: "var(--ink-2)" }}>
          {sub}
        </div>
      )}
      {tone === "alert" && (
        <span
          className="absolute right-4 top-4 h-2 w-2 rounded-full"
          style={{
            background: "var(--rust)",
            boxShadow: "0 0 0 4px rgba(142,52,22,.15)",
          }}
        />
      )}
    </div>
  );
}
