import type { ReactNode } from "react";

type Tone = "default" | "alert" | "ok" | "accent";

const TONE_COLORS: Record<Tone, string> = {
  default: "var(--ink)",
  alert:   "var(--rust)",
  ok:      "var(--moss)",
  accent:  "var(--accent)",
};

export function BigMetric({
  label,
  value,
  unit,
  sub,
  tone = "default",
  footnote,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: string;
  tone?: Tone;
  footnote?: string;
}) {
  const color = TONE_COLORS[tone];
  return (
    <div className="flex flex-col gap-2.5">
      <div className="eyebrow">{label}</div>
      <div className="flex items-baseline gap-1.5" style={{ color }}>
        <span className="metric-xl">{value}</span>
        {unit && (
          <span
            className="serif text-[28px] italic"
            style={{ color: "var(--ink-3)" }}
          >
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div
          className="text-[13px] leading-snug"
          style={{ color: "var(--ink-2)", maxWidth: 280 }}
        >
          {sub}
        </div>
      )}
      {footnote && (
        <div className="uppercase-mono text-[9.5px]" style={{ color: "var(--ink-4)" }}>
          {footnote}
        </div>
      )}
      {tone === "alert" && (
        <span
          className="absolute top-4 right-4 h-2 w-2 rounded-full"
          style={{
            background: "var(--rust)",
            boxShadow: "0 0 0 4px rgba(142,52,22,.15)",
          }}
        />
      )}
    </div>
  );
}
