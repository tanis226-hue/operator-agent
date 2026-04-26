"use client";

import { useState } from "react";

export type FunnelRow = {
  stage: string;
  count: number;
  pct: number;
};

type Style = "bar" | "funnel" | "dot";

export function FunnelChart({ data, style = "bar" }: { data: FunnelRow[]; style?: Style }) {
  if (style === "funnel") return <FunnelTrue data={data} />;
  if (style === "dot")    return <FunnelDot  data={data} />;
  return <FunnelBar data={data} />;
}

// ─── Bar style ──────────────────────────────────────────────────
function FunnelBar({ data }: { data: FunnelRow[] }) {
  const max = data[0]?.count ?? 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {data.map((d, i) => {
        const pct  = (d.count / max) * 100;
        const drop = i > 0 ? data[i - 1].count - d.count : 0;
        const dropPct = i > 0 ? ((drop / data[i - 1].count) * 100).toFixed(1) : null;
        const isLast = i === data.length - 1;
        return (
          <div
            key={d.stage}
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr 80px",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                {d.stage}
              </div>
              {dropPct && (
                <div
                  className="uppercase-mono"
                  style={{ fontSize: 9, color: "var(--rust)", marginTop: 2 }}
                >
                  −{drop} leads · −{dropPct}%
                </div>
              )}
            </div>
            <div
              style={{
                height: 28,
                background: "var(--paper-2)",
                borderRadius: 2,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: isLast ? "var(--accent)" : "var(--ink)",
                  transformOrigin: "left",
                  animation: `draw-bar 700ms cubic-bezier(.2,.8,.2,1) ${i * 100}ms both`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 12,
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--surface)",
                  fontWeight: 500,
                }}
              >
                {d.count}
              </div>
            </div>
            <div
              className="serif tabular"
              style={{ fontSize: 22, textAlign: "right", letterSpacing: "-0.01em" }}
            >
              {d.pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── True funnel (trapezoids) ────────────────────────────────────
function FunnelTrue({ data }: { data: FunnelRow[] }) {
  const W = 600, H = 360;
  const max = data[0]?.count ?? 1;
  const stepH = H / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {data.map((d, i) => {
        const next = data[i + 1] ?? { count: d.count * 0.7, stage: "", pct: 0 };
        const w1 = (d.count / max) * W;
        const w2 = (next.count / max) * W;
        const x1 = (W - w1) / 2;
        const x2 = (W - w2) / 2;
        const y  = i * stepH;
        const path = `M${x1},${y} L${x1 + w1},${y} L${x2 + w2},${y + stepH} L${x2},${y + stepH} Z`;
        const fill =
          i === data.length - 1
            ? "var(--accent)"
            : `rgba(26,23,20,${0.95 - i * 0.18})`;
        return (
          <g key={d.stage}>
            <path
              d={path}
              fill={fill}
              style={{ animation: `fadeIn 600ms ${i * 100}ms both` }}
            />
            <text
              x={W / 2}
              y={y + stepH / 2 - 4}
              textAnchor="middle"
              fill="var(--surface)"
              style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 500 }}
            >
              {d.stage.toUpperCase()}
            </text>
            <text
              x={W / 2}
              y={y + stepH / 2 + 14}
              textAnchor="middle"
              fill="var(--surface)"
              style={{ fontFamily: "var(--serif)", fontSize: 22 }}
            >
              {d.count} · {d.pct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Dot style ───────────────────────────────────────────────────
function FunnelDot({ data }: { data: FunnelRow[] }) {
  const max = data[0]?.count ?? 1;
  const DOTS = 60;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {data.map((d, i) => {
        const filled  = Math.round((d.count / max) * DOTS);
        const isLast  = i === data.length - 1;
        return (
          <div
            key={d.stage}
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr 80px",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 500 }}>{d.stage}</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {Array.from({ length: DOTS }).map((_, j) => (
                <span
                  key={j}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background:
                      j < filled
                        ? isLast
                          ? "var(--accent)"
                          : "var(--ink)"
                        : "var(--line)",
                    animation:
                      j < filled ? `fadeIn 350ms ${j * 8}ms both` : "none",
                  }}
                />
              ))}
            </div>
            <div
              className="serif tabular"
              style={{ fontSize: 20, textAlign: "right" }}
            >
              {d.pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
