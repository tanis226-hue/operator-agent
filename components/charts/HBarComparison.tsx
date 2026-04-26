"use client";

export type HBarRow = {
  label: string;
  total: number;
  booked: number;
  rate: number;
};

export function HBarComparison({
  data,
  baseline,
  baselineLabel = "",
}: {
  data: HBarRow[];
  baseline: number;
  baselineLabel?: string;
}) {
  const max = Math.max(...data.map((d) => d.rate), 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((d, i) => {
        const w       = (d.rate     / max) * 100;
        const baseW   = (baseline   / max) * 100;
        const isLow   = d.rate < baseline - 5;
        const isHigh  = d.rate > baseline + 5;
        const barBg   = isLow  ? "var(--rust)"   :
                        isHigh ? "var(--moss)"    : "var(--ink)";
        const numColor = isLow ? "var(--rust)" : "var(--ink)";

        return (
          <div
            key={d.label}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 70px",
              gap: 14,
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 500 }}>{d.label}</div>
            <div
              style={{
                height: 26,
                background: "var(--paper-2)",
                borderRadius: 2,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Bar */}
              <div
                style={{
                  height: "100%",
                  width: `${w}%`,
                  background: barBg,
                  animation: `draw-bar 600ms cubic-bezier(.2,.8,.2,1) ${i * 80}ms both`,
                  transformOrigin: "left",
                }}
              />
              {/* Baseline marker */}
              <div
                style={{
                  position: "absolute",
                  top: -3,
                  bottom: -3,
                  left: `${baseW}%`,
                  width: 1,
                  background: "var(--ink)",
                  opacity: 0.4,
                }}
              />
              {/* Count label inside bar */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 10,
                  fontFamily: "var(--mono)",
                  fontSize: 10.5,
                  color: "var(--surface)",
                  fontWeight: 500,
                }}
              >
                {d.booked}/{d.total}
              </div>
            </div>
            <div
              className="serif tabular"
              style={{ fontSize: 22, textAlign: "right", color: numColor }}
            >
              {d.rate}%
            </div>
          </div>
        );
      })}
      <div className="uppercase-mono mt-1" style={{ fontSize: 9 }}>
        Vertical line · team baseline {baseline}%
        {baselineLabel && ` ${baselineLabel}`}
      </div>
    </div>
  );
}
