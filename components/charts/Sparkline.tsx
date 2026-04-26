"use client";

type Color = "ink" | "accent" | "rust" | "moss";

const COLOR_MAP: Record<Color, string> = {
  ink:    "var(--ink)",
  accent: "var(--accent)",
  rust:   "var(--rust)",
  moss:   "var(--moss)",
};

export function Sparkline({
  data,
  color = "ink",
  height = 32,
  width = 120,
  showDots = true,
}: {
  data: number[];
  color?: Color;
  height?: number;
  width?: number;
  showDots?: boolean;
}) {
  if (data.length < 2) return null;

  const max   = Math.max(...data);
  const min   = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height,
  }));

  const path = pts
    .map(({ x, y }, i) => `${i === 0 ? "M" : "L"}${x},${y}`)
    .join(" ");

  const c = COLOR_MAP[color];

  return (
    <svg
      width={width}
      height={height}
      style={{ display: "block", overflow: "visible" }}
    >
      <path
        d={path}
        fill="none"
        stroke={c}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDots &&
        pts.map(({ x, y }, i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === pts.length - 1 ? 2.5 : 1.2}
            fill={c}
          />
        ))}
    </svg>
  );
}
