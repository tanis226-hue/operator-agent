// Shared primitives: Header, Footer, common UI

const { useState, useEffect, useRef, useMemo } = React;

// ─── Header ─────────────────────────────────────────────────────
function OperatorHeader({ stage, onLogo, density, headerStyle }) {
  const minimal = headerStyle === "minimal";
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: minimal ? "transparent" : "rgba(246, 243, 236, 0.92)",
        backdropFilter: minimal ? "none" : "saturate(180%) blur(8px)",
        WebkitBackdropFilter: minimal ? "none" : "saturate(180%) blur(8px)",
        borderBottom: minimal ? "none" : "1px solid var(--line)",
      }}
    >
      <div
        className="shell"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: minimal ? "20px 48px" : "18px 48px",
        }}
      >
        <button
          onClick={onLogo}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: "var(--ink)",
          }}
        >
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: 28,
              height: 28,
              borderRadius: 4,
              background: "var(--ink)",
              color: "var(--paper)",
              fontFamily: "var(--serif)",
              fontSize: 18,
              lineHeight: 1,
              fontStyle: "italic",
            }}
          >
            O
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
            <span
              style={{
                fontFamily: "var(--serif)",
                fontSize: 20,
                letterSpacing: "-0.01em",
              }}
            >
              Operator
            </span>
            {!minimal && (
              <span className="uppercase-mono" style={{ fontSize: 9, letterSpacing: "0.18em" }}>
                Operations advisor
              </span>
            )}
          </div>
        </button>

        <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {!minimal && (
            <>
              <a className="uppercase-mono" style={{ textDecoration: "none" }} href="#process">
                Process
              </a>
              <a className="uppercase-mono" style={{ textDecoration: "none" }} href="#cases">
                Cases
              </a>
              <a className="uppercase-mono" style={{ textDecoration: "none" }} href="#docs">
                Documentation
              </a>
            </>
          )}
          <span
            className="uppercase-mono"
            style={{
              padding: "6px 10px",
              border: "1px solid var(--line)",
              borderRadius: 999,
              fontSize: 9.5,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "var(--accent)",
              }}
            />
            Claude Opus 4.7
          </span>
        </nav>
      </div>
    </header>
  );
}

// ─── Section divider — McKinsey-style ──────────────────────────
function PhaseMarker({ letter, label, sub, n, total }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "end",
        gap: 24,
        padding: "64px 0 28px",
        borderBottom: "1px solid var(--ink)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span
          className="serif"
          style={{
            fontSize: 96,
            lineHeight: 0.85,
            color: "var(--accent)",
            fontStyle: "italic",
            letterSpacing: "-0.04em",
          }}
        >
          {letter}
        </span>
        <span className="uppercase-mono" style={{ fontSize: 10 }}>
          Phase {n} of {total}
        </span>
      </div>
      <div>
        <h2 className="h-section" style={{ margin: 0 }}>
          {label}
        </h2>
        <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: 14, maxWidth: 560 }}>
          {sub}
        </p>
      </div>
      <div className="uppercase-mono" style={{ fontSize: 10, textAlign: "right" }}>
        DMAIC<br />
        <span style={{ color: "var(--ink-4)" }}>Six Sigma method</span>
      </div>
    </div>
  );
}

// ─── Eyebrow + section header ──────────────────────────────────
function SectionHead({ eyebrow, title, sub, action, marker }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 24,
        marginBottom: 24,
        flexWrap: "wrap",
      }}
    >
      <div>
        {eyebrow && (
          <div className="eyebrow eyebrow-accent" style={{ marginBottom: 8 }}>
            {marker && <span style={{ marginRight: 8, color: "var(--ink-3)" }}>{marker}</span>}
            {eyebrow}
          </div>
        )}
        <h3 className="h-card" style={{ margin: 0, fontSize: 26 }}>
          {title}
        </h3>
        {sub && <p style={{ margin: "6px 0 0", color: "var(--ink-2)", maxWidth: 560 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Big number metric ─────────────────────────────────────────
function BigMetric({ label, value, unit, sub, tone, footnote }) {
  const toneColor =
    tone === "alert"
      ? "var(--rust)"
      : tone === "ok"
      ? "var(--moss)"
      : tone === "accent"
      ? "var(--accent)"
      : "var(--ink)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="eyebrow">{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, color: toneColor }}>
        <span className="metric-xl">{value}</span>
        {unit && <span className="serif" style={{ fontSize: 28, fontStyle: "italic", color: "var(--ink-3)" }}>{unit}</span>}
      </div>
      {sub && <div style={{ color: "var(--ink-2)", fontSize: 13, lineHeight: 1.45, maxWidth: 280 }}>{sub}</div>}
      {footnote && (
        <div className="uppercase-mono" style={{ fontSize: 9.5, color: "var(--ink-4)" }}>
          {footnote}
        </div>
      )}
    </div>
  );
}

// ─── Small metric (KPI tile) ───────────────────────────────────
function SmallMetric({ label, value, sub, tone, target }) {
  const toneColor =
    tone === "alert" ? "var(--rust)" : tone === "ok" ? "var(--moss)" : "var(--ink)";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "20px 22px",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-card)",
        position: "relative",
      }}
    >
      <div className="eyebrow">{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span className="metric-md" style={{ color: toneColor }}>{value}</span>
        {target && (
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--mono)" }}>
            ↗ {target}
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{sub}</div>}
      {tone === "alert" && (
        <span
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 8,
            height: 8,
            borderRadius: 999,
            background: "var(--rust)",
            boxShadow: "0 0 0 4px rgba(142,52,22,.15)",
          }}
        />
      )}
    </div>
  );
}

// ─── Pill / badge ──────────────────────────────────────────────
function Pill({ children, tone = "default", size = "sm" }) {
  const styles = {
    default: { bg: "var(--surface)", fg: "var(--ink-2)", border: "var(--line)" },
    accent: { bg: "var(--accent-soft)", fg: "var(--accent-2)", border: "var(--accent)" },
    alert: { bg: "#FBE9E1", fg: "var(--rust)", border: "#E5BBA5" },
    warn: { bg: "#F7ECCE", fg: "#7A5417", border: "#DDB870" },
    ok: { bg: "#E6EAD9", fg: "var(--moss)", border: "#A8B58A" },
  }[tone];
  return (
    <span
      className="uppercase-mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: size === "sm" ? "3px 8px" : "5px 10px",
        background: styles.bg,
        color: styles.fg,
        border: `1px solid ${styles.border}`,
        borderRadius: 999,
        fontSize: size === "sm" ? 9.5 : 10.5,
      }}
    >
      {children}
    </span>
  );
}

// ─── Footer ────────────────────────────────────────────────────
function OperatorFooter() {
  return (
    <footer
      style={{
        marginTop: 96,
        padding: "48px 0 32px",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div
        className="shell"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 32,
          alignItems: "end",
        }}
      >
        <div>
          <div className="serif" style={{ fontSize: 32, lineHeight: 1, fontStyle: "italic" }}>
            Operator.
          </div>
          <p style={{ margin: "12px 0 0", color: "var(--ink-2)", maxWidth: 480 }}>
            A diagnostic and control instrument for operating teams. Built on the DMAIC method,
            powered by Claude Opus 4.7.
          </p>
        </div>
        <div className="uppercase-mono" style={{ fontSize: 10, textAlign: "right", lineHeight: 1.8 }}>
          Method · DMAIC<br />
          Engine · Claude Opus 4.7<br />
          Status · Hackathon build, v0.4
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, {
  OperatorHeader,
  PhaseMarker,
  SectionHead,
  BigMetric,
  SmallMetric,
  Pill,
  OperatorFooter,
});
