import type { ReactNode } from "react";

type Variant = "default" | "summary";

type Props = {
  index: number;
  title: string;
  eyebrow?: string;
  variant?: Variant;
  children?: ReactNode;
};

export function PhaseCard({
  index,
  title,
  eyebrow,
  variant = "default",
  children,
}: Props) {
  const isSummary = variant === "summary";

  return (
    <section
      aria-labelledby={`phase-${index}-heading`}
      className={[
        "rounded-card border bg-surface shadow-card",
        isSummary
          ? "border-accent-border ring-1 ring-accent/10"
          : "border-line",
      ].join(" ")}
    >
      {/* Card header */}
      <div
        className={[
          "flex items-start justify-between gap-3 border-b px-6 py-4",
          isSummary ? "border-accent-border/60" : "border-line",
        ].join(" ")}
      >
        <div className="min-w-0">
          {eyebrow && (
            <p className="eyebrow mb-1">{eyebrow}</p>
          )}
          <h3
            id={`phase-${index}-heading`}
            className={[
              "font-semibold text-ink",
              isSummary ? "text-[17px]" : "text-[15px]",
            ].join(" ")}
          >
            {title}
          </h3>
        </div>
        {!isSummary && (
          <span className="shrink-0 rounded-full border border-line bg-canvas px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-muted">
            {String(index).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="px-6 py-5">
        {children ?? (
          <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-line bg-canvas px-4 py-6 text-sm text-ink-muted">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ink-muted/40" />
            Populated after analysis runs.
          </div>
        )}
      </div>
    </section>
  );
}
