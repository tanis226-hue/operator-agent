import { PRODUCT_SUBTITLE, WORKFLOW_LABEL } from "@/lib/workflow";

export function Header() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-6 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full bg-accent"
            />
            <h1 className="text-lg font-semibold tracking-tight text-ink">
              Operator Agent
            </h1>
          </div>
          <p className="mt-1 text-sm leading-snug text-ink-soft">
            {PRODUCT_SUBTITLE}
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-accent"
          />
          Workflow: {WORKFLOW_LABEL}
        </span>
      </div>
    </header>
  );
}
