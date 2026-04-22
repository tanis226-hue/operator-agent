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
      className={
        isSummary
          ? "rounded-card border border-accent/30 bg-surface shadow-card ring-1 ring-accent/10"
          : "rounded-card border border-line bg-surface shadow-card"
      }
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              {eyebrow}
            </p>
          )}
          <h3
            id={`phase-${index}-heading`}
            className={
              isSummary
                ? "mt-0.5 text-lg font-semibold text-ink"
                : "mt-0.5 text-base font-semibold text-ink"
            }
          >
            {title}
          </h3>
        </div>
        <span className="shrink-0 rounded-full border border-line bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink-muted">
          {String(index).padStart(2, "0")}
        </span>
      </div>

      <div className="px-6 py-5">
        {children ?? (
          <div className="flex items-center gap-3 rounded-md border border-dashed border-line bg-canvas px-4 py-6 text-sm text-ink-muted">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-ink-muted/60"
            />
            Populated after analysis runs.
          </div>
        )}
      </div>
    </section>
  );
}
