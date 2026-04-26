import { MODEL_LABEL } from "@/lib/workflow";

export function Footer({ muted }: { muted?: boolean } = {}) {
  if (muted) {
    return (
      <footer
        className="mx-auto max-w-shell px-12"
        style={{ marginTop: 48, paddingTop: 24, paddingBottom: 24 }}
      >
        <p
          className="uppercase-mono text-center"
          style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--ink-4)" }}
        >
          OpsAdvisor · {MODEL_LABEL} · Built by{" "}
          <a
            href="https://zldagroup.com/about"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--ink-3)", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            David Tanis
          </a>{" "}
          for the{" "}
          <a
            href="https://www.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--ink-3)", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            Anthropic
          </a>{" "}
          Hackathon
        </p>
      </footer>
    );
  }

  return (
    <footer
      className="mx-auto max-w-shell px-12"
      style={{
        marginTop: 0,
        paddingTop: 48,
        paddingBottom: 32,
        borderTop: "1px solid var(--line)",
      }}
    >
      <div
        className="grid items-end gap-8"
        style={{ gridTemplateColumns: "1fr auto" }}
      >
        <div>
          <div
            className="serif italic"
            style={{ fontSize: 32, lineHeight: 1, color: "var(--ink)" }}
          >
            OpsAdvisor.
          </div>
          <p
            className="mt-3 text-[14px] leading-relaxed"
            style={{ color: "var(--ink-2)", maxWidth: 480 }}
          >
            A diagnostic and control instrument for operating teams. Built on
            the DMAIC method, powered by {MODEL_LABEL}.
          </p>
          <p
            className="mt-3 text-[12px] leading-relaxed"
            style={{ color: "var(--ink-3)", maxWidth: 480 }}
          >
            Built by{" "}
            <a
              href="https://zldagroup.com/about"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--ink-2)", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              David Tanis
            </a>{" "}
            for the{" "}
            <span style={{ fontStyle: "italic" }}>Built with Opus 4.7</span>{" "}
            hackathon by{" "}
            <a
              href="https://www.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--ink-2)", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              Anthropic
            </a>
            .
          </p>
        </div>
        <div
          className="uppercase-mono text-right"
          style={{ fontSize: 10, lineHeight: 1.8 }}
        >
          Method · DMAIC
          <br />
          Engine · {MODEL_LABEL}
          <br />
          Status · Hackathon build, v0.4
          <br />
          Author · David Tanis
          <br />
          <a
            href="/privacy"
            style={{ color: "var(--ink-2)", textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
