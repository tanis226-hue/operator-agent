"use client";

import { useEffect, useState } from "react";

type DbType = "postgres" | "mysql";

type Props = {
  onData: (label: string, tsv: string, rowCount: number) => void;
  disabled?: boolean;
};

const DEFAULT_PORTS: Record<DbType, number> = {
  postgres: 5432,
  mysql: 3306,
};

const SAMPLE_DATASET_LABEL = "Sample dataset: pipeline_events";
const SAMPLE_DATASET_TSV = `event_id\tcustomer_id\tstage\tcompleted_at\tdays_in_stage\towner
e1001\tc501\tKickoff\t2026-04-02\t1\tAlex
e1002\tc501\tSetup\t2026-04-05\t3\tAlex
e1003\tc501\tTraining\t\t12\t(unassigned)
e1004\tc502\tKickoff\t2026-04-03\t1\tJamie
e1005\tc502\tSetup\t2026-04-06\t3\tJamie
e1006\tc502\tTraining\t2026-04-13\t7\tJamie
e1007\tc502\tFirst Value\t2026-04-15\t2\tJamie
e1008\tc503\tKickoff\t2026-04-04\t1\tAlex
e1009\tc503\tSetup\t2026-04-08\t4\tAlex
e1010\tc503\tTraining\t\t14\t(unassigned)
e1011\tc504\tKickoff\t2026-04-05\t2\t(unassigned)
e1012\tc504\tSetup\t\t9\t(unassigned)
e1013\tc505\tKickoff\t2026-04-06\t1\tJamie
e1014\tc505\tSetup\t2026-04-09\t3\tJamie
e1015\tc505\tTraining\t2026-04-17\t8\tJamie
e1016\tc505\tFirst Value\t\t5\t(unassigned)
e1017\tc506\tKickoff\t2026-04-08\t1\tAlex
e1018\tc506\tSetup\t2026-04-11\t3\tAlex
e1019\tc506\tTraining\t\t10\t(unassigned)`;

export function DatabaseConnector({ onData, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [dbType, setDbType] = useState<DbType>("postgres");
  const [host, setHost] = useState("");
  const [port, setPort] = useState<number>(5432);
  const [database, setDatabase] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [query, setQuery] = useState("SELECT * FROM ");
  const [loading, setLoading] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tick the elapsed timer while a query is running
  useEffect(() => {
    if (!loading) return;
    setElapsedSec(0);
    const start = Date.now();
    const interval = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - start) / 1000));
    }, 250);
    return () => window.clearInterval(interval);
  }, [loading]);

  function handleTypeChange(t: DbType) {
    setDbType(t);
    setPort(DEFAULT_PORTS[t]);
  }

  function handleSampleDataset() {
    setError("");
    const rowCount = SAMPLE_DATASET_TSV.split("\n").length - 1;
    onData(SAMPLE_DATASET_LABEL, SAMPLE_DATASET_TSV, rowCount);
    setSuccess(`✓ ${rowCount} sample rows imported`);
  }

  async function handleRun() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/db-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbType, host, port, database, username, password, query }),
      });
      const json = await res.json() as { tsv?: string; rowCount?: number; error?: string };
      if (!res.ok || json.error) {
        setError(json.error ?? "Unknown error.");
        return;
      }
      const label = `${database}: ${query.trim().slice(0, 60)}`;
      onData(label, json.tsv ?? "", json.rowCount ?? 0);
      setSuccess(`✓ ${json.rowCount} rows imported from ${database}`);
      // Clear credentials from state after successful use
      setPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed.");
    } finally {
      setLoading(false);
    }
  }

  const canRun = host.trim() && database.trim() && username.trim() && query.trim() && !loading;

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-line bg-canvas overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="flex items-center justify-between px-4 py-3 text-left transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🗄️</span>
          <span className="text-[13px] font-medium text-ink">Connect to a database</span>
          <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-medium text-ink-muted uppercase tracking-wide">
            PostgreSQL · MySQL
          </span>
        </div>
        <span className="text-[12px] text-ink-muted">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-4 border-t border-line px-4 py-4">
          {/* DB type toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted w-20">Type</span>
            <div className="inline-flex rounded-md border border-line bg-surface p-0.5">
              {(["postgres", "mysql"] as DbType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={[
                    "rounded px-3 py-1 text-[12px] font-medium transition",
                    dbType === t ? "bg-canvas text-ink shadow-sm" : "text-ink-muted hover:text-ink",
                  ].join(" ")}
                >
                  {t === "postgres" ? "PostgreSQL" : "MySQL"}
                </button>
              ))}
            </div>
          </div>

          {/* Connection fields */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DbField label="Host" value={host} onChange={setHost} placeholder="db.example.com" autoComplete="off" />
            <DbField label="Port" value={String(port)} onChange={(v) => setPort(Number(v))} placeholder={String(DEFAULT_PORTS[dbType])} type="number" />
            <DbField label="Database" value={database} onChange={setDatabase} placeholder="my_database" autoComplete="off" />
            <DbField label="Username" value={username} onChange={setUsername} placeholder="readonly_user" autoComplete="off" />
            <DbField
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              type="password"
              autoComplete="new-password"
              className="sm:col-span-2"
            />
          </div>

          {/* Query */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
              SQL Query <span className="normal-case font-normal text-ink-muted">(SELECT only · max 500 rows)</span>
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              spellCheck={false}
              placeholder="SELECT * FROM pipeline_events WHERE created_at > NOW() - INTERVAL '30 days'"
              className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2 font-mono text-[12px] leading-relaxed text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <p className="text-[11px] text-ink-muted">
              Only SELECT is permitted. Credentials are used once and never stored.
            </p>
          </div>

          {/* Feedback */}
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-700">
              {success}
            </p>
          )}

          {/* Run button */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSampleDataset}
              disabled={loading || disabled}
              className="text-[12px] font-medium text-accent transition hover:text-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              No database handy? Try a sample dataset →
            </button>
            <button
              type="button"
              onClick={handleRun}
              disabled={!canRun || disabled}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-[13px] font-semibold text-white shadow-btn transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white/80" />
                  Connecting… {elapsedSec}s
                </>
              ) : "Run query & import"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DbField({
  label, value, onChange, placeholder, type = "text", autoComplete, className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={["flex flex-col gap-1", className].join(" ")}>
      <label className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-[13px] text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}
