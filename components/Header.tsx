import { PRODUCT_SUBTITLE, WORKFLOW_LABEL } from "@/lib/workflow";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-page items-center justify-between gap-6 px-6 py-4">

        {/* Left — product identity */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Anthropic asterisk mark */}
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white"
            style={{ fontSize: "18px", lineHeight: 1 }}
          >
            ✦
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold tracking-tight text-ink">
                Operator Agent
              </span>
            </div>
            <p className="hidden truncate text-[12px] text-ink-muted md:block">
              {PRODUCT_SUBTITLE}
            </p>
          </div>
        </div>

        {/* Right — workflow badge + built-with */}
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1 text-[11px] font-medium text-ink-soft sm:inline-flex">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
            {WORKFLOW_LABEL}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-soft px-3 py-1 text-[11px] font-medium text-accent">
            Built with Claude Opus 4.7
          </span>
        </div>

      </div>
    </header>
  );
}
