"use client";

import { Pill } from "@/components/editorial/Pill";

type SplitRow = {
  label: string;
  value: number;
  tone?: "alert" | "default";
};

export function SplitBar({
  a,
  b,
  gap,
  gapLabel = "gap",
}: {
  a: SplitRow;
  b: SplitRow;
  gap: number;
  gapLabel?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SplitRow {...a} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Pill tone="alert">↓ {gap}pp {gapLabel}</Pill>
      </div>
      <SplitRow {...b} />
    </div>
  );
}

function SplitRow({ label, value, tone }: SplitRow) {
  const isAlert = tone === "alert";
  const color   = isAlert ? "var(--rust)" : "var(--ink)";
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{label}</span>
        <span
          className="serif tabular"
          style={{ fontSize: 28, color }}
        >
          {value}%
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "var(--paper-2)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: isAlert ? "var(--rust)" : "var(--ink)",
            transformOrigin: "left",
            animation: "draw-bar 700ms cubic-bezier(.2,.8,.2,1) both",
          }}
        />
      </div>
    </div>
  );
}
