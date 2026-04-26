// Editorial chart primitives — built with SVG + CSS, no chart library

const { useState: useChartState } = React;

// ─── Funnel chart — horizontal bars, descending ─────────────────
function FunnelChart({ data, style = "bar" }) {
  if (style === "funnel") return <FunnelTrue data={data} />;
  if (style === "dot") return <FunnelDot data={data} />;
  return <FunnelBar data={data} />;
}

function FunnelBar({ data }) {
  const max = data[0].count;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        const drop = i > 0 ? data[i - 1].count - d.count : 0;
        const dropPct = i > 0 ? ((drop / data[i - 1].count) * 100).toFixed(1) : null;
        return (
          <div key={d.stage} style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px", gap: 16, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{d.stage}</div>
              {dropPct && (
                <div className="uppercase-mono" style={{ fontSize: 9, color: "var(--rust)", marginTop: 2 }}>
                  −{drop} leads · −{dropPct}%
                </div>
              )}
            </div>
            <div style={{ height: 28, background: "var(--paper-2)", borderRadius: 2, position: "relative", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: i === data.length - 1 ? "var(--accent)" : "var(--ink)",
                  transformOrigin: "left",
                  animation: "draw-bar 700ms cubic-bezier(.2,.8,.2,1) both",
                  animationDelay: `${i * 100}ms`,
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
                  color: "var(--paper)",
                  fontWeight: 500,
                }}
              >
                {d.count}
              </div>
            </div>
            <div className="serif tabular" style={{ fontSize: 22, textAlign: "right", letterSpacing: "-0.01em" }}>
              {d.pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FunnelTrue({ data }) {
  // True funnel — symmetrical trapezoids
  const W = 600, H = 360;
  const max = data[0].count;
  const stepH = H / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {data.map((d, i) => {
        const next = data[i + 1] ?? { count: d.count * 0.7 };
        const w1 = (d.count / max) * W;
        const w2 = (next.count / max) * W;
        const x1 = (W - w1) / 2;
        const x2 = (W - w2) / 2;
        const y = i * stepH;
        const path = `M${x1},${y} L${x1 + w1},${y} L${x2 + w2},${y + stepH} L${x2},${y + stepH} Z`;
        const fill = i === data.length - 1 ? "var(--accent)" : `rgba(26,23,20,${0.95 - i * 0.18})`;
        return (
          <g key={d.stage}>
            <path d={path} fill={fill} style={{ animation: `fadeIn 600ms ${i * 100}ms both` }} />
            <text
              x={W / 2}
              y={y + stepH / 2 - 4}
              textAnchor="middle"
              fill="var(--paper)"
              style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 500 }}
            >
              {d.stage.toUpperCase()}
            </text>
            <text
              x={W / 2}
              y={y + stepH / 2 + 14}
              textAnchor="middle"
              fill="var(--paper)"
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

function FunnelDot({ data }) {
  const max = data[0].count;
  const dotsPer = 60;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {data.map((d, i) => {
        const filled = Math.round((d.count / max) * dotsPer);
        return (
          <div key={d.stage} style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{d.stage}</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {Array.from({ length: dotsPer }).map((_, j) => (
                <span
                  key={j}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: j < filled ? (i === data.length - 1 ? "var(--accent)" : "var(--ink)") : "var(--line)",
                    animation: j < filled ? `fadeIn 350ms ${j * 8}ms both` : "none",
                  }}
                />
              ))}
            </div>
            <div className="serif tabular" style={{ fontSize: 20, textAlign: "right" }}>
              {d.pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Pareto chart — bars + cumulative line ─────────────────────
function ParetoChart({ data, onHover }) {
  const W = 720, H = 320, pad = { l: 56, r: 56, t: 32, b: 88 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const total = data.reduce((s, d) => s + d.lossPp, 0);
  let cum = 0;
  const points = data.map((d, i) => {
    const prev = cum;
    cum += d.lossPp;
    const cumPct = (cum / total) * 100;
    const prevPct = (prev / total) * 100;
    return { ...d, cumPct, prevPct, idx: i };
  });
  const barW = innerW / data.length - 16;
  const maxBar = Math.max(...data.map((d) => d.lossPp));

  const [hover, setHover] = useChartState(null);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      {/* Grid */}
      {[0, 25, 50, 75, 100].map((g) => {
        const y = pad.t + innerH - (g / 100) * innerH;
        return (
          <g key={g}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="var(--line-soft)" strokeDasharray={g === 0 || g === 100 ? "0" : "2 4"} />
            <text x={pad.l - 8} y={y + 3} textAnchor="end" style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)" }}>
              {g}
            </text>
            <text x={W - pad.r + 8} y={y + 3} style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)" }}>
              {g}%
            </text>
          </g>
        );
      })}
      <text x={pad.l - 32} y={pad.t + innerH / 2} transform={`rotate(-90 ${pad.l - 32} ${pad.t + innerH / 2})`} textAnchor="middle" className="uppercase-mono" style={{ fontSize: 9, fill: "var(--ink-3)" }}>
        Conversion loss (pp)
      </text>
      <text x={W - pad.r + 32} y={pad.t + innerH / 2} transform={`rotate(90 ${W - pad.r + 32} ${pad.t + innerH / 2})`} textAnchor="middle" className="uppercase-mono" style={{ fontSize: 9, fill: "var(--ink-3)" }}>
        Cumulative
      </text>

      {/* Bars */}
      {points.map((d, i) => {
        const x = pad.l + i * (innerW / data.length) + 8;
        const h = (d.lossPp / maxBar) * innerH;
        const y = pad.t + innerH - h;
        const isHover = hover === i;
        return (
          <g key={i} onMouseEnter={() => { setHover(i); onHover && onHover(d); }} onMouseLeave={() => { setHover(null); onHover && onHover(null); }} style={{ cursor: "pointer" }}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              fill={i === 0 ? "var(--accent)" : i === 1 ? "var(--accent)" : "var(--ink)"}
              opacity={i === 0 ? 1 : i === 1 ? 0.78 : isHover ? 0.9 : 0.55}
              style={{ transition: "opacity 140ms" }}
            />
            <text x={x + barW / 2} y={y - 8} textAnchor="middle" className="serif" style={{ fontSize: 16, fill: "var(--ink)" }}>
              {d.lossPp}
            </text>
            <foreignObject x={x - 8} y={pad.t + innerH + 8} width={barW + 16} height={pad.b}>
              <div style={{ fontFamily: "var(--sans)", fontSize: 10.5, color: "var(--ink-2)", textAlign: "center", lineHeight: 1.3 }}>
                {d.cause}
              </div>
            </foreignObject>
          </g>
        );
      })}

      {/* 80% line */}
      <line
        x1={pad.l}
        x2={W - pad.r}
        y1={pad.t + innerH - 0.8 * innerH}
        y2={pad.t + innerH - 0.8 * innerH}
        stroke="var(--accent)"
        strokeDasharray="4 3"
        opacity={0.4}
      />
      <text x={W - pad.r - 4} y={pad.t + innerH - 0.8 * innerH - 6} textAnchor="end" className="uppercase-mono" style={{ fontSize: 9, fill: "var(--accent)" }}>
        80% threshold
      </text>

      {/* Cumulative line */}
      <polyline
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        points={points
          .map((d, i) => {
            const x = pad.l + i * (innerW / data.length) + 8 + barW / 2;
            const y = pad.t + innerH - (d.cumPct / 100) * innerH;
            return `${x},${y}`;
          })
          .join(" ")}
        style={{ strokeDasharray: 1000, strokeDashoffset: 1000, animation: "fadeIn 1200ms 200ms both" }}
      />
      {points.map((d, i) => {
        const x = pad.l + i * (innerW / data.length) + 8 + barW / 2;
        const y = pad.t + innerH - (d.cumPct / 100) * innerH;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill="var(--paper)" stroke="var(--accent)" strokeWidth={2} />
            <text x={x + 8} y={y - 8} className="mono" style={{ fontSize: 10, fill: "var(--accent)" }}>
              {d.cumPct.toFixed(0)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Owner / source comparison — horizontal bars vs baseline ────
function HBarComparison({ data, baseline, label = "" }) {
  const max = Math.max(...data.map((d) => d.rate), 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((d, i) => {
        const w = (d.rate / max) * 100;
        const baseW = (baseline / max) * 100;
        const isLow = d.rate < baseline - 5;
        return (
          <div key={d.label || d.name} style={{ display: "grid", gridTemplateColumns: "120px 1fr 70px", gap: 14, alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{d.label || d.name}</div>
            <div style={{ height: 26, background: "var(--paper-2)", borderRadius: 2, position: "relative", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${w}%`,
                  background: isLow ? "var(--rust)" : d.rate > baseline + 5 ? "var(--moss)" : "var(--ink)",
                  animation: "draw-bar 600ms cubic-bezier(.2,.8,.2,1) both",
                  animationDelay: `${i * 80}ms`,
                  transformOrigin: "left",
                }}
              />
              {/* baseline marker */}
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
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 10,
                  fontFamily: "var(--mono)",
                  fontSize: 10.5,
                  color: "var(--paper)",
                  fontWeight: 500,
                }}
              >
                {d.booked}/{d.total}
              </div>
            </div>
            <div className="serif tabular" style={{ fontSize: 22, textAlign: "right", color: isLow ? "var(--rust)" : "var(--ink)" }}>
              {d.rate}%
            </div>
          </div>
        );
      })}
      <div className="uppercase-mono" style={{ fontSize: 9, color: "var(--ink-3)", marginTop: 4 }}>
        Vertical line · team baseline {baseline}% {label}
      </div>
    </div>
  );
}

// ─── Conversion split bar (timely vs delayed) ──────────────────
function SplitBar({ a, b, gap }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SplitRow {...a} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Pill tone="alert">↓ {gap}pp gap</Pill>
      </div>
      <SplitRow {...b} />
    </div>
  );
}
function SplitRow({ label, value, color = "ink", tone }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{label}</span>
        <span className="serif tabular" style={{ fontSize: 28, color: tone === "alert" ? "var(--rust)" : "var(--ink)" }}>
          {value}%
        </span>
      </div>
      <div style={{ height: 6, background: "var(--paper-2)", borderRadius: 999, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: tone === "alert" ? "var(--rust)" : "var(--ink)",
            transformOrigin: "left",
            animation: "draw-bar 700ms cubic-bezier(.2,.8,.2,1) both",
          }}
        />
      </div>
    </div>
  );
}

// ─── Sparkline (for control panel) ─────────────────────────────
function Sparkline({ data, color = "ink", height = 32, width = 120, showDots = true }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return [x, y];
  });
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const c = color === "accent" ? "var(--accent)" : color === "rust" ? "var(--rust)" : color === "moss" ? "var(--moss)" : "var(--ink)";
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <path d={path} fill="none" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {showDots && pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 2.5 : 1.2} fill={c} />
      ))}
    </svg>
  );
}

Object.assign(window, { FunnelChart, ParetoChart, HBarComparison, SplitBar, Sparkline });
