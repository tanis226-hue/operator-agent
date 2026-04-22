import type { IntakeBrief } from "@/lib/intakeBrief";

type Props = {
  brief: IntakeBrief;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="eyebrow">{label}</dt>
      <dd className="text-sm leading-relaxed text-ink">{children}</dd>
    </div>
  );
}

export function IntakeBriefCard({ brief }: Props) {
  return (
    <section
      aria-labelledby="intake-brief-heading"
      className="rounded-card border border-line bg-surface shadow-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div>
          <h2
            id="intake-brief-heading"
            className="text-[15px] font-semibold text-ink"
          >
            Intake Brief
          </h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Business context that grounds the analysis.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1 text-[11px] font-medium text-ink-muted">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent/50" />
          Pre-filled · demo mode
        </span>
      </div>

      {/* Fields grid */}
      <dl className="grid grid-cols-1 gap-x-10 gap-y-5 px-6 py-5 md:grid-cols-2">
        <Field label="Business / team">{brief.businessName}</Field>
        <Field label="Workflow">{brief.workflowName}</Field>
        <Field label="Pain point">{brief.painPoint}</Field>
        <Field label="Success metric">{brief.successMetric}</Field>
        <Field label="SLA / key constraint">{brief.slaConstraint}</Field>
        <Field label="Qualified lead">{brief.qualifiedLeadDefinition}</Field>

        <Field label="Current stages">
          <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 mt-0.5">
            {brief.currentStages.map((stage, i) => (
              <li key={stage} className="flex items-center gap-1">
                <span className="rounded-md border border-line bg-canvas px-2 py-0.5 text-[12px] font-medium text-ink">
                  {stage}
                </span>
                {i < brief.currentStages.length - 1 && (
                  <span aria-hidden className="text-[10px] text-ink-muted">›</span>
                )}
              </li>
            ))}
          </ol>
        </Field>

        <Field label="Suspected leakage">{brief.suspectedStage}</Field>

        <Field label="Biggest frustration">{brief.biggestFrustration}</Field>

        <Field label="Available evidence">
          <ul className="flex flex-col gap-1 mt-0.5">
            {brief.availableEvidence.map((e) => (
              <li key={e} className="flex items-start gap-2 text-sm">
                <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                {e}
              </li>
            ))}
          </ul>
        </Field>
      </dl>
    </section>
  );
}
