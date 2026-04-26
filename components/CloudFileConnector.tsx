"use client";

import { useEffect, useRef, useState } from "react";

const MAX_LINKS = 5;

type Props = {
  onData: (label: string, tsv: string, rowCount: number) => void;
  disabled?: boolean;
};

type FetchResponse = {
  tsv?: string;
  rowCount?: number;
  name?: string;
  kind?: string;
  provider?: string;
  error?: string;
};

type LinkState = {
  id: number;
  url: string;
  status: "idle" | "loading" | "done" | "error";
  label?: string;
  rowCount?: number;
  error?: string;
  elapsedSec: number;
};

let _nextId = 1;
function makeLink(): LinkState {
  return { id: _nextId++, url: "", status: "idle", elapsedSec: 0 };
}

export function CloudFileConnector({ onData, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<LinkState[]>([makeLink()]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick elapsed time for any loading row.
  useEffect(() => {
    const anyLoading = links.some((l) => l.status === "loading");
    if (!anyLoading) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    if (timerRef.current) return; // already running
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setLinks((prev) =>
        prev.map((l) => (l.status === "loading" ? { ...l, elapsedSec: elapsed } : l))
      );
    }, 250);
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  });

  function setLink(id: number, patch: Partial<LinkState>) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLink() {
    if (links.length >= MAX_LINKS) return;
    setLinks((prev) => [...prev, makeLink()]);
  }

  function removeLink(id: number) {
    setLinks((prev) => prev.length === 1 ? [makeLink()] : prev.filter((l) => l.id !== id));
  }

  async function fetchLink(id: number) {
    const link = links.find((l) => l.id === id);
    if (!link || !link.url.trim()) return;
    setLink(id, { status: "loading", error: undefined, elapsedSec: 0 });
    try {
      const res = await fetch("/api/cloud-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link.url.trim() }),
      });
      const json = (await res.json()) as FetchResponse;
      if (!res.ok || json.error) {
        setLink(id, { status: "error", error: json.error ?? "Unknown error." });
        return;
      }
      const label = json.name ?? "Cloud file";
      onData(label, json.tsv ?? "", json.rowCount ?? 0);
      setLink(id, { status: "done", label, rowCount: json.rowCount ?? 0 });
    } catch (e) {
      setLink(id, { status: "error", error: e instanceof Error ? e.message : "Fetch failed." });
    }
  }

  const doneCount = links.filter((l) => l.status === "done").length;
  const anyLoading = links.some((l) => l.status === "loading");

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-line bg-canvas overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="flex items-center justify-between px-4 py-3 text-left transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🔗</span>
          <span className="text-[13px] font-medium text-ink">Import from cloud file links</span>
          <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-medium text-ink-muted uppercase tracking-wide">
            Drive · Sheets · Docs · SharePoint · OneDrive
          </span>
          {doneCount > 0 && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
              {doneCount} imported
            </span>
          )}
        </div>
        <span className="text-[12px] text-ink-muted">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-line px-4 py-4">
          <p className="text-[11px] text-ink-muted">
            Up to {MAX_LINKS} links. Files must be set to &ldquo;Anyone with the link can view&rdquo;. Supported: CSV, TSV, TXT, MD, JSON, XLSX, DOCX, Google Sheets, Google Docs. Max 5 MB each.
          </p>

          {links.map((link, i) => (
            <div key={link.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-center font-mono text-[11px] text-ink-muted">{i + 1}</span>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => setLink(link.id, { url: e.target.value, status: "idle", error: undefined })}
                  disabled={link.status === "loading" || !!disabled}
                  spellCheck={false}
                  placeholder="https://docs.google.com/…  or  https://contoso.sharepoint.com/…"
                  className={[
                    "flex-1 rounded-md border px-3 py-2 font-mono text-[12px] leading-relaxed text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1",
                    link.status === "error"
                      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-300"
                      : link.status === "done"
                      ? "border-green-300 bg-green-50 focus:border-green-400 focus:ring-green-300"
                      : "border-line bg-surface focus:border-accent focus:ring-accent",
                    (link.status === "loading" || disabled) ? "cursor-not-allowed opacity-60" : "",
                  ].join(" ")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && link.url.trim() && link.status !== "loading" && !disabled) {
                      e.preventDefault();
                      fetchLink(link.id);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fetchLink(link.id)}
                  disabled={!link.url.trim() || link.status === "loading" || !!disabled}
                  className="shrink-0 rounded-lg bg-accent px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {link.status === "loading" ? `${link.elapsedSec}s…` : "Fetch"}
                </button>
                {links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLink(link.id)}
                    disabled={link.status === "loading" || !!disabled}
                    aria-label="Remove link"
                    className="shrink-0 text-[18px] leading-none text-ink-muted transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ×
                  </button>
                )}
              </div>
              {link.status === "error" && link.error && (
                <p className="ml-6 text-[11px] text-red-600">{link.error}</p>
              )}
              {link.status === "done" && link.label && (
                <p className="ml-6 text-[11px] text-green-700">
                  ✓ {link.label}{link.rowCount ? ` · ${link.rowCount} rows` : ""}
                </p>
              )}
            </div>
          ))}

          {links.length < MAX_LINKS && !anyLoading && !disabled && (
            <button
              type="button"
              onClick={addLink}
              className="ml-6 self-start text-[12px] font-medium text-accent transition hover:text-accent-hover"
            >
              + Add another link ({links.length}/{MAX_LINKS})
            </button>
          )}
        </div>
      )}
    </div>
  );
}


