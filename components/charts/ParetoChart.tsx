"use client";

import { useState } from "react";

export type ParetoRow = {
  cause: string;
  lossPp: number;
  conv?: number;
  leads?: number;
};

export function ParetoChart({
  data,
  onHover,
}: {
  data: ParetoRow[];
  onHover?: (d: ParetoRow | null) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 720, H = 320;
  const pad = { l: 56, r: 56, t: 32, b: 88 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const total = data.reduce((s, d) => s + d.lossPp, 0);
  let cum = 0;
  const points = data.map((d, i) => {
    const prev = cum;
    cum += d.lossPp;
    return { ...d, cumPct: (cum / total) * 100, prevPct: (prev / total) * 100, idx: i };
  });

  const maxBar = Math.max(...data.map((d) => d.lossPp));
  const barW   = innerW / data.length - 16;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((g) => {
        const y = pad.t + innerH - (g / 100) * innerH;
        return (
          <g key={g}>
            <line
              x1={pad.l} x2={W - pad.r}
              y1={y}      y2={y}
              stroke="var(--line-soft)"
              strokeDasharray={g === 0 || g === 100 ? "0" : "2 4"}
            />
            <text
              x={pad.l - 8} y={y + 3}
              textAnchor="end"
              style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)" }}
            >
              {g}
            </text>
            <text
              x={W - pad.r + 8} y={y + 3}
              style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)" }}
            >
              {g}%
            </text>
          </g>
        );
      })}

      {/* Y-axis labels */}
      <text
        x={pad.l - 32} y={pad.t + innerH / 2}
        transform={`rotate(-90 ${pad.l - 32} ${pad.t + innerH / 2})`}
        textAnchor="middle"
        style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
      >
        Conversion loss (pp)
      </text>
      <text
        x={W - pad.r + 32} y={pad.t + innerH / 2}
        transform={`rotate(90 ${W - pad.r + 32} ${pad.t + innerH / 2})`}
        textAnchor="middle"
        style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
      >
        Cumulative
      </text>

      {/* Bars */}
      {points.map((d, i) => {
        const x = pad.l + i * (innerW / data.length) + 8;
        const h = (d.lossPp / maxBar) * innerH;
        const y = pad.t + innerH - h;
        const isHover = hover === i;
        const fill =
          i === 0 ? "var(--accent)" :
          i === 1 ? "var(--accent)" :
          "var(--ink)";
        const opacity = i === 0 ? 1 : i === 1 ? 0.78 : isHover ? 0.9 : 0.55;
        return (
          <g
            key={i}
            onMouseEnter={() => { setHover(i); onHover?.(d); }}
            onMouseLeave={() => { setHover(null); onHover?.(null); }}
            style={{ cursor: "pointer" }}
          >
            <rect
              x={x} y={y} width={barW} height={h}
              fill={fill}
              opacity={opacity}
              style={{ transition: "opacity 140ms" }}
            />
            <text
              x={x + barW / 2} y={y - 8}
              textAnchor="middle"
              style={{ fontFamily: "var(--serif)", fontSize: 16, fill: "var(--ink)" }}
            >
              {d.lossPp}
            </text>
            <foreignObject x={x - 8} y={pad.t + innerH + 8} width={barW + 16} height={pad.b}>
              <div
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: 10.5,
                  color: "var(--ink-2)",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {d.cause}
              </div>
            </foreignObject>
          </g>
        );
      })}

      {/* 80% threshold line */}
      <line
        x1={pad.l} x2={W - pad.r}
        y1={pad.t + innerH - 0.8 * innerH}
        y2={pad.t + innerH - 0.8 * innerH}
        stroke="var(--accent)"
        strokeDasharray="4 3"
        opacity={0.4}
      />
      <text
        x={W - pad.r - 4}
        y={pad.t + innerH - 0.8 * innerH - 6}
        textAnchor="end"
        style={{
          fontFamily: "var(--mono)",
          fontSize: 9,
          fill: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        80% threshold
      </text>

      {/* Cumulative line */}
      <polyline
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinecap="round"
        points={points
          .map((d, i) => {
            const x = pad.l + i * (innerW / data.length) + 8 + barW / 2;
            const y = pad.t + innerH - (d.cumPct / 100) * innerH;
            return `${x},${y}`;
          })
          .join(" ")}
      />

      {/* Dots on cumulative line */}
      {points.map((d, i) => {
        const x = pad.l + i * (innerW / data.length) + 8 + barW / 2;
        const y = pad.t + innerH - (d.cumPct / 100) * innerH;
        return (
          <g key={i}>
            <circle
              cx={x} cy={y} r={4}
              fill="var(--surface)"
              stroke="var(--accent)"
              strokeWidth={2}
            />
            <text
              x={x + 8} y={y - 8}
              style={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--accent)" }}
            >
              {d.cumPct.toFixed(0)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
