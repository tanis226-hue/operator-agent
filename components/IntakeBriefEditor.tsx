"use client";

import { useRef } from "react";
import type { IntakeBrief } from "@/lib/intakeBrief";
import { EXAMPLE_CASES } from "@/lib/exampleCases";

type Props = {
  brief: IntakeBrief;
  processNote: string;
  onBriefChange: (next: IntakeBrief) => void;
  onProcessNoteChange: (next: string) => void;
  disabled?: boolean;
};

export function IntakeBriefEditor({
  brief,
  processNote,
  onBriefChange,
  onProcessNoteChange,
  disabled,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function set<K extends keyof IntakeBrief>(key: K, value: IntakeBrief[K]) {
    onBriefChange({ ...brief, [key]: value });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    onProcessNoteChange(text);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleLoadExample(id: string) {
    const example = EXAMPLE_CASES.find((c) => c.id === id);
    if (!example) return;
    onBriefChange(example.brief);
    onProcessNoteChange(example.processNote);
  }

  const stagesStr = brief.currentStages.join(", ");
  const evidenceStr = brief.availableEvidence.join(", ");

  return (
    <section
      aria-labelledby="intake-editor-heading"
      className="rounded-card border border-line bg-surface shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div>
          <h2
            id="intake-editor-heading"
            className="text-[15px] font-semibold text-ink"
          >
            Intake Brief
          </h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Describe your workflow. All fields feed the analysis prompt.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Example case loader */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-ink-muted">Try an example:</span>
            <select
              onChange={(e) => {
                if (e.target.value) handleLoadExample(e.target.value);
                e.target.value = "";
              }}
              disabled={disabled}
              defaultValue=""
              className="rounded-md border border-line bg-canvas px-2.5 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Select…</option>
              {EXAMPLE_CASES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1 text-[11px] font-medium text-ink-muted">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
            Custom case
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 px-6 py-5 md:grid-cols-2">
        <TextField
          label="Business / team"
          value={brief.businessName}
          onChange={(v) => set("businessName", v)}
          disabled={disabled}
          placeholder="e.g. Acme Corp (Operations)"
        />
        <TextField
          label="Workflow name"
          value={brief.workflowName}
          onChange={(v) => set("workflowName", v)}
          disabled={disabled}
          placeholder="e.g. New Employee Onboarding"
        />

        <TextArea
          label="Pain point"
          value={brief.painPoint}
          onChange={(v) => set("painPoint", v)}
          className="md:col-span-2"
          rows={2}
          disabled={disabled}
          placeholder="What is going wrong? Where are things breaking down? Be specific."
        />

        <TextArea
          label="Success metric"
          value={brief.successMetric}
          onChange={(v) => set("successMetric", v)}
          className="md:col-span-2"
          rows={2}
          disabled={disabled}
          placeholder="How will you know the problem is fixed? What is the measurable outcome?"
        />

        <TextArea
          label="Key constraint or SLA"
          value={brief.slaConstraint}
          onChange={(v) => set("slaConstraint", v)}
          className="md:col-span-2"
          rows={2}
          disabled={disabled}
          placeholder="e.g. P1 issues must be resolved within 4 hours. Contracts must close within 14 days."
        />

        <TextField
          label="Workflow stages (comma-separated)"
          value={stagesStr}
          onChange={(v) =>
            set(
              "currentStages",
              v.split(",").map((s) => s.trim()).filter(Boolean)
            )
          }
          className="md:col-span-2"
          disabled={disabled}
          placeholder="e.g. Submitted, Triaged, Assigned, In Progress, Resolved"
        />

        <TextArea
          label="What counts as a qualified work item"
          value={brief.qualifiedLeadDefinition}
          onChange={(v) => set("qualifiedLeadDefinition", v)}
          rows={2}
          disabled={disabled}
          placeholder="e.g. A ticket with a confirmed customer ID and a reproducible issue description."
        />

        <TextArea
          label="Suspected problem area"
          value={brief.suspectedStage}
          onChange={(v) => set("suspectedStage", v)}
          rows={2}
          disabled={disabled}
          placeholder="Where do you think the process is breaking down most?"
        />

        <TextArea
          label="Biggest day-to-day frustration"
          value={brief.biggestFrustration}
          onChange={(v) => set("biggestFrustration", v)}
          className="md:col-span-2"
          rows={2}
          disabled={disabled}
          placeholder="What makes this problem visible and painful on a daily basis?"
        />

        <TextField
          label="Available data / evidence (comma-separated)"
          value={evidenceStr}
          onChange={(v) =>
            set(
              "availableEvidence",
              v.split(",").map((s) => s.trim()).filter(Boolean)
            )
          }
          className="md:col-span-2"
          disabled={disabled}
          placeholder="e.g. Zendesk export, agent workload report, CSAT survey data"
        />
      </div>

      <div className="border-t border-line px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <label
              htmlFor="process-note"
              className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted"
            >
              Context &amp; supporting documents
            </label>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              Paste process rules, SOPs, data, reports, or any operational context. The more detail, the deeper the analysis.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              onChange={handleUpload}
              disabled={disabled}
              className="hidden"
              id="process-note-upload"
            />
            <label
              htmlFor="process-note-upload"
              className={[
                "cursor-pointer rounded-md border border-line bg-canvas px-3 py-1.5 text-[12px] font-medium text-ink transition",
                disabled ? "cursor-not-allowed opacity-50" : "hover:bg-surface",
              ].join(" ")}
            >
              Upload file
            </label>
          </div>
        </div>

        <textarea
          id="process-note"
          value={processNote}
          onChange={(e) => onProcessNoteChange(e.target.value)}
          disabled={disabled}
          rows={6}
          placeholder="Paste anything relevant: process documentation, SOPs, performance data, team notes, past reports. Claude will reason from whatever context you provide."
          className="mt-3 w-full resize-y rounded-md border border-line bg-canvas px-3 py-2 text-[13px] leading-relaxed text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  className = "",
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className={["flex flex-col gap-1", className].join(" ")}>
      <label className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-[13px] text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  className = "",
  rows = 3,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  rows?: number;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className={["flex flex-col gap-1", className].join(" ")}>
      <label className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-y rounded-md border border-line bg-canvas px-3 py-2 text-[13px] leading-relaxed text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}
