"use client";

import { useRef, useState } from "react";
import type { IntakeBrief } from "@/lib/intakeBrief";
import { EXAMPLE_CASES } from "@/lib/exampleCases";
import { DatabaseConnector } from "./DatabaseConnector";
import { CloudFileConnector } from "./CloudFileConnector";

type Props = {
  brief: IntakeBrief;
  processNote: string;
  onBriefChange: (next: IntakeBrief) => void;
  onProcessNoteChange: (next: string) => void;
  disabled?: boolean;
  onClose?: () => void;
};

export function IntakeBriefEditor({
  brief,
  processNote,
  onBriefChange,
  onProcessNoteChange,
  disabled,
  onClose,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string }>>([]);

  function set<K extends keyof IntakeBrief>(key: K, value: IntakeBrief[K]) {
    onBriefChange({ ...brief, [key]: value });
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    let current = processNote;
    const newMeta: Array<{ name: string; size: string }> = [];
    for (const file of files) {
      const text = await file.text();
      const block = `\n\n--- FILE: ${file.name} ---\n${text}\n--- END: ${file.name} ---`;
      current = current ? current + block : block.trimStart();
      newMeta.push({ name: file.name, size: formatFileSize(file.size) });
    }
    onProcessNoteChange(current);
    setUploadedFiles((prev) => [...prev, ...newMeta]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleRemoveFile(name: string) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\n*--- FILE: ${escaped} ---[\\s\\S]*?--- END: ${escaped} ---\\n*`, "g");
    onProcessNoteChange(processNote.replace(regex, "").trim());
    setUploadedFiles((prev) => prev.filter((f) => f.name !== name));
  }

  function handleLoadExample(id: string) {
    const example = EXAMPLE_CASES.find((c) => c.id === id);
    if (!example) return;
    onBriefChange(example.brief);
    onProcessNoteChange(example.processNote);
  }

  const stagesStr = brief.currentStages.join(", ");

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
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-ink-muted transition hover:text-ink hover:bg-canvas"
              title="Hide intake brief"
            >
              ↑
            </button>
          )}
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
          placeholder="What is broken? Describe the gap between what should happen and what actually happens."
        />

        <TextArea
          label="Biggest day-to-day frustration"
          value={brief.biggestFrustration}
          onChange={(v) => set("biggestFrustration", v)}
          className="md:col-span-2"
          rows={2}
          disabled={disabled}
          placeholder="What does this look like on a Tuesday afternoon? The specific moment, behavior, or symptom that makes the team groan."
        />

        <TextArea
          label="Success metric"
          value={brief.successMetric}
          onChange={(v) => set("successMetric", v)}
          className="md:col-span-2"
          rows={2}
          disabled={disabled}
          placeholder="How will you measure success in numbers? e.g. 'Conversion above 60%', 'On-time delivery > 90%'."
        />

        <TextArea
          label="Service-level commitment / SLA"
          value={brief.slaText}
          onChange={(v) => set("slaText", v)}
          className="md:col-span-2"
          rows={2}
          disabled={disabled}
          placeholder="e.g. P1 issues must be resolved within 4 hours. Contracts must close within 14 days."
        />

        <TextField
          label="SLA threshold (hours, optional)"
          value={brief.slaThresholdHours == null ? "" : String(brief.slaThresholdHours)}
          onChange={(v) => {
            const n = parseFloat(v);
            set("slaThresholdHours", Number.isFinite(n) ? n : null);
          }}
          disabled={disabled}
          placeholder="e.g. 4"
        />

        <TextField
          label="Volume per month"
          value={brief.volumePerMonth}
          onChange={(v) => set("volumePerMonth", v)}
          disabled={disabled}
          placeholder="e.g. ~120 leads per month, ~600 tickets per month"
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

        <TextField
          label="Value per item (optional)"
          value={brief.valuePerItem}
          onChange={(v) => set("valuePerItem", v)}
          disabled={disabled}
          placeholder="e.g. ~$8,000 per closed deal, ~$320 per ticket"
        />

        <TextField
          label="Current tooling"
          value={brief.currentTooling}
          onChange={(v) => set("currentTooling", v)}
          className="md:col-span-2"
          disabled={disabled}
          placeholder="e.g. Salesforce CRM, Google Sheets, Zendesk, custom tool, none"
        />

        <TextArea
          label="What's been tried before? (optional)"
          value={brief.priorAttempts}
          onChange={(v) => set("priorAttempts", v)}
          className="md:col-span-2"
          rows={2}
          disabled={disabled}
          placeholder="Previous attempts. Helps the report avoid re-recommending what failed."
        />
      </div>

      <div className="border-t border-line px-6 py-5">
        <div className="mb-4">
          <p className="text-[13px] font-semibold text-ink">Data &amp; Supporting Documents</p>
          <p className="mt-0.5 text-[12px] text-ink-muted">
            Upload files or paste text below. CSV exports, SOPs, reports, and notes all feed directly into the analysis.
          </p>
        </div>

        {/* Database connector */}
        <DatabaseConnector
          disabled={disabled}
          onData={(label, tsv, rowCount) => {
            const block = `\n\n--- DB QUERY: ${label} (${rowCount} rows) ---\n${tsv}\n--- END DB QUERY ---`;
            const next = processNote ? processNote + block : block.trimStart();
            onProcessNoteChange(next);
            setUploadedFiles((prev) => [...prev, { name: `DB: ${label.slice(0, 40)}`, size: `${rowCount} rows` }]);
          }}
        />

        {/* Cloud file (Google Drive / SharePoint / direct URL) */}
        <div className="mt-3">
          <CloudFileConnector
            disabled={disabled}
            onData={(label, text, rowCount) => {
              const block = `\n\n--- FILE: ${label} (${rowCount} rows) ---\n${text}\n--- END: ${label} ---`;
              const next = processNote ? processNote + block : block.trimStart();
              onProcessNoteChange(next);
              setUploadedFiles((prev) => [...prev, { name: `🔗 ${label.slice(0, 40)}`, size: `${rowCount} rows` }]);
            }}
          />
        </div>

        {/* Upload zone */}
        <div className={[
          "relative flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-6 text-center transition",
          disabled ? "cursor-not-allowed opacity-50 border-line bg-canvas" : "border-line bg-canvas hover:border-accent/50 cursor-pointer",
        ].join(" ")}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.csv,.json,.tsv,.log,text/plain,text/markdown,text/csv,application/json"
            onChange={handleUpload}
            disabled={disabled}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            id="process-note-upload"
          />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-lg">📎</div>
          <p className="text-[13px] font-medium text-ink">Drop files here or click to browse</p>
          <p className="text-[11px] text-ink-muted">CSV, JSON, TXT, MD, TSV · Multiple files accepted</p>
        </div>

        {/* Uploaded file chips */}
        {uploadedFiles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {uploadedFiles.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[12px] text-ink"
              >
                <span>📄 {f.name}</span>
                <span className="text-ink-muted">{f.size}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(f.name)}
                    className="ml-0.5 text-ink-muted hover:text-red-500"
                    aria-label={`Remove ${f.name}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Paste area */}
        <div className="mt-4 flex flex-col gap-1">
          <label
            htmlFor="process-note"
            className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted"
          >
            Or paste context directly
          </label>
          <textarea
            id="process-note"
            value={uploadedFiles.length > 0
              ? processNote.replace(/\n*--- FILE:[\s\S]*?--- END:[^\n]*---\n*/g, "").trim()
              : processNote}
            onChange={(e) => {
              const fileBlocks = uploadedFiles
                .map((f) => {
                  const escaped = f.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                  const match = processNote.match(new RegExp(`--- FILE: ${escaped} ---[\\s\\S]*?--- END: ${escaped} ---`));
                  return match ? match[0] : "";
                })
                .filter(Boolean)
                .join("\n\n");
              const combined = [e.target.value.trim(), fileBlocks].filter(Boolean).join("\n\n");
              onProcessNoteChange(combined);
            }}
            disabled={disabled}
            rows={5}
            placeholder="Paste process docs, SOPs, team notes, metrics, escalation history, or anything that gives context about how this workflow actually runs."
            className="w-full resize-y rounded-md border border-line bg-canvas px-3 py-2 text-[13px] leading-relaxed text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
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
