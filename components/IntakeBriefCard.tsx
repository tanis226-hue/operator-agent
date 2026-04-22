import type { IntakeBrief } from "@/lib/intakeBrief";

type Props = {
  brief: IntakeBrief;
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </dt>
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
      <div className="flex flex-col gap-1 border-b border-line px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="intake-brief-heading"
            className="text-base font-semibold text-ink"
          >
            Intake Brief
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[11px] font-medium text-ink-muted">
            Pre-filled for demo
          </span>
        </div>
        <p className="text-sm text-ink-soft">
          Business context that grounds the analysis. Review before running.
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-x-8 gap-y-5 px-6 py-5 md:grid-cols-2">
        <Field label="Business / team">{brief.businessName}</Field>
        <Field label="Workflow">{brief.workflowName}</Field>

        <Field label="Pain point">{brief.painPoint}</Field>
        <Field label="Success metric">{brief.successMetric}</Field>

        <Field label="SLA / key constraint">{brief.slaConstraint}</Field>
        <Field label="Qualified lead definition">
          {brief.qualifiedLeadDefinition}
        </Field>

        <Field label="Current stages">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            {brief.currentStages.map((stage, i) => (
              <li key={stage} className="flex items-center gap-1.5">
                <span className="rounded-md border border-line bg-canvas px-2 py-0.5 text-xs font-medium text-ink">
                  {stage}
                </span>
                {i < brief.currentStages.length - 1 && (
                  <span aria-hidden className="text-ink-muted">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Field>

        <Field label="Suspected leakage stage">{brief.suspectedStage}</Field>

        <Field label="Biggest frustration right now">
          {brief.biggestFrustration}
        </Field>

        <Field label="Available evidence">
          <ul className="flex flex-col gap-1">
            {brief.availableEvidence.map((e) => (
              <li key={e} className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1.5 inline-block h-1 w-1 rounded-full bg-ink-muted"
                />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </Field>
      </dl>
    </section>
  );
}
