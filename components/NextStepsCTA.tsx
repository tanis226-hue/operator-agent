"use client";

import { useEffect, useRef, useState } from "react";

export type ReportSaveFormat = "docx" | "pdf" | "txt";

type Props = {
  onRestart?: () => void;
  onAnalyzeOwn?: () => void;
  mode?: "demo" | "custom";
  onCopyReport?: () => void | Promise<void>;
  onSaveReport?: (format: ReportSaveFormat) => void | Promise<void>;
  onEmailReport?: () => void;
  copied?: boolean;
  saved?: boolean;
  emailed?: boolean;
};

const WAITLIST_KEY = "oa_waitlist";

export function NextStepsCTA({
  onRestart,
  onAnalyzeOwn,
  mode,
  onCopyReport,
  onSaveReport,
  onEmailReport,
  copied,
  saved,
  emailed,
}: Props) {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);

  const showAnalyzeOwn = !!onAnalyzeOwn && mode === "demo";
  const showRestart = !!onRestart;
  const showReportActions = !!onCopyReport || !!onSaveReport || !!onEmailReport;

  return (
    <section
      aria-label="Next steps"
      className="relative rounded-card border border-accent/30 bg-surface shadow-card-lg"
    >
      <div className="h-1 w-full rounded-t-card bg-accent" />
      <div className="px-6 py-6 md:px-8 md:py-7">
        <div className="mb-5">
          <p className="eyebrow eyebrow-accent mb-1.5">What's next</p>
          <h3 className="text-[18px] font-semibold text-ink">
            Take this somewhere useful.
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            Share the report with your team, re-run on a different operation, or get pinged when full diagnostics open up.
          </p>
        </div>

        {showReportActions && (
          <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="eyebrow">Share this report</p>
            {onCopyReport && (
              <ReportActionButton
                label={copied ? "Copied!" : "Copy report"}
                onClick={() => void onCopyReport()}
              />
            )}
            {onSaveReport && (
              <ReportSaveButton
                open={saveMenuOpen}
                onOpenChange={setSaveMenuOpen}
                onSelect={(format) => {
                  setSaveMenuOpen(false);
                  void onSaveReport(format);
                }}
                saved={!!saved}
              />
            )}
            {onEmailReport && (
              <ReportActionButton
                label={emailed ? "Sent!" : "Email report"}
                onClick={onEmailReport}
              />
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {showAnalyzeOwn && (
            <CTAButton
              label="Analyze your own workflow"
              sub="Describe your process · ~2 min"
              onClick={onAnalyzeOwn}
              variant="primary"
            />
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {showRestart && (
              <CTAButton
                label="Run another diagnosis"
                sub="Try a different operation"
                onClick={onRestart}
                variant="secondary"
              />
            )}
            <CTAButton
              label="Join the waitlist"
              sub="Get notified when we open up"
              onClick={() => setWaitlistOpen(true)}
              variant="secondary"
            />
          </div>
        </div>
      </div>

      {waitlistOpen && (
        <WaitlistModal onClose={() => setWaitlistOpen(false)} />
      )}
    </section>
  );
}

function ReportActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-surface"
    >
      {label}
    </button>
  );
}

function ReportSaveButton({
  open,
  onOpenChange,
  onSelect,
  saved,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSelect: (format: ReportSaveFormat) => void;
  saved: boolean;
}) {
  const items: Array<{ format: ReportSaveFormat; label: string; sub: string }> = [
    { format: "docx", label: "Word document", sub: ".docx, editable in Word, Pages, Google Docs" },
    { format: "pdf", label: "PDF", sub: ".pdf, opens print dialog (Save as PDF)" },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-surface"
      >
        {saved ? "Saved!" : "Save report"}
        <span aria-hidden className="text-[10px] text-ink-muted">▾</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            role="menu"
            className="absolute left-0 bottom-full z-20 mb-1.5 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-line bg-surface shadow-card"
          >
            {items.map((item) => (
              <button
                key={item.format}
                type="button"
                role="menuitem"
                onClick={() => onSelect(item.format)}
                className="flex w-full flex-col items-start gap-0.5 border-b border-line px-4 py-3 text-left transition last:border-0 hover:bg-canvas"
              >
                <span className="text-[13px] font-medium text-ink">{item.label}</span>
                <span className="text-[11px] text-ink-muted">{item.sub}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function CTAButton({
  label,
  sub,
  onClick,
  variant,
}: {
  label: string;
  sub: string;
  onClick: () => void;
  variant: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex flex-col items-start gap-1 rounded-lg border px-4 py-3.5 text-left transition shadow-btn",
        isPrimary
          ? "border-accent-border bg-accent-soft text-ink hover:border-accent hover:bg-[#EBD8C8]"
          : "border-line bg-surface text-ink hover:border-ink/40 hover:bg-canvas",
      ].join(" ")}
    >
      <span className="flex w-full items-center justify-between gap-2 text-[14px] font-semibold">
        <span>{label}</span>
        <span
          className={[
            "serif italic transition-transform group-hover:translate-x-0.5",
            isPrimary ? "text-accent" : "text-ink-muted",
          ].join(" ")}
          style={{ fontSize: 16, lineHeight: 1 }}
        >
          →
        </span>
      </span>
      <span
        className={[
          "text-[11.5px] leading-snug",
          isPrimary ? "text-ink-soft" : "text-ink-soft",
        ].join(" ")}
      >
        {sub}
      </span>
    </button>
  );
}

function WaitlistModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setErrorMsg("Enter a valid email address.");
      return;
    }
    setStatus("submitting");
    void (async () => {
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });
        if (!res.ok) {
          const data = await res.json() as { error?: string };
          throw new Error(data.error ?? "Failed to join waitlist.");
        }
        // Also persist locally so we don't re-prompt on the same device
        try {
          const raw = localStorage.getItem(WAITLIST_KEY);
          const existing: Array<{ email: string; ts: number }> = raw ? JSON.parse(raw) : [];
          if (!existing.some((entry) => entry.email.toLowerCase() === trimmed.toLowerCase())) {
            existing.push({ email: trimmed, ts: Date.now() });
            localStorage.setItem(WAITLIST_KEY, JSON.stringify(existing));
          }
        } catch { /* ignore */ }
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
      }
    })();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-card border border-line bg-surface shadow-card-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full bg-accent" />
        <div className="px-6 py-6">
          {status === "success" ? (
            <div className="flex flex-col gap-3">
              <h3 id="waitlist-title" className="text-[17px] font-semibold text-ink">
                You're on the list.
              </h3>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                We'll reach out when full diagnostics are open. No spam.
              </p>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-ink px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-ink/90"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <h3 id="waitlist-title" className="text-[17px] font-semibold text-ink">
                Join the waitlist
              </h3>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                Be first to know when we open Operator Agent for full diagnostic runs on your data.
              </p>
              <label className="mt-2 flex flex-col gap-1.5">
                <span className="eyebrow">Email</span>
                <input
                  ref={inputRef}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="you@company.com"
                  className="rounded-lg border border-line bg-canvas px-3 py-2.5 text-[14px] text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
              {status === "error" && (
                <p className="text-[12px] text-red-600">{errorMsg}</p>
              )}
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-[13px] font-medium text-ink-soft transition hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white shadow-btn transition hover:bg-accent-hover disabled:opacity-50"
                >
                  {status === "submitting" ? "Saving..." : "Notify me"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
