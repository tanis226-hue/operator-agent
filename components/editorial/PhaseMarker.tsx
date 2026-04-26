export function PhaseMarker({
  letter,
  label,
  sub,
  n,
  total = 5,
}: {
  letter: string;
  label: string;
  sub?: string;
  n: number;
  total?: number;
}) {
  return (
    <div
      className="grid items-end gap-6 pb-7 pt-16"
      style={{
        gridTemplateColumns: "auto 1fr auto",
        borderBottom: "1px solid var(--ink)",
      }}
    >
      {/* Large italic DMAIC letter */}
      <div className="flex items-baseline gap-3.5">
        <span
          className="serif italic"
          style={{
            fontSize: 96,
            lineHeight: 0.85,
            color: "var(--accent)",
            letterSpacing: "-0.04em",
          }}
        >
          {letter}
        </span>
        <span className="uppercase-mono text-[10px]">
          Phase {n} of {total}
        </span>
      </div>

      {/* Label + subtitle */}
      <div>
        <h2 className="h-section" style={{ margin: 0 }}>
          {label}
        </h2>
        {sub && (
          <p
            className="mt-1.5 text-[14px]"
            style={{ color: "var(--ink-2)", maxWidth: 560 }}
          >
            {sub}
          </p>
        )}
      </div>

      {/* Right — method caption */}
      <div className="uppercase-mono text-right text-[10px]">
        DMAIC
        <br />
        <span style={{ color: "var(--ink-4)" }}>Six Sigma method</span>
      </div>
    </div>
  );
}
