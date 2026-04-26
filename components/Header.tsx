import { MODEL_LABEL, PRODUCT_SUBTITLE } from "@/lib/workflow";

export function Header({ onLogo, showNav }: { onLogo?: () => void; showNav?: boolean } = {}) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(246,243,236,0.92)",
        backdropFilter: "saturate(180%) blur(8px)",
        WebkitBackdropFilter: "saturate(180%) blur(8px)",
        borderBottom: "1px solid var(--line-soft)",
        boxShadow: "0 1px 12px rgba(26,23,20,.04)",
      }}
    >
      <div
        className="mx-auto flex max-w-shell items-center justify-between gap-6 px-12 py-4"
      >
        {/* Left — product identity */}
        <button
          type="button"
          onClick={onLogo}
          className="flex items-center gap-3 border-none bg-transparent p-0 text-left"
          style={{ cursor: onLogo ? "pointer" : "default" }}
          tabIndex={onLogo ? 0 : -1}
        >
          {/* Small accent tile */}
          <div
            className="grid shrink-0 place-items-center"
            style={{
              width: 30,
              height: 30,
              background: "var(--accent)",
              borderRadius: 8,
              color: "var(--surface)",
              fontFamily: "var(--serif)",
              fontSize: 18,
              lineHeight: 1,
              fontStyle: "italic",
            }}
          >
            O
          </div>
          <div className="flex flex-col leading-[1.1]">
            <span
              className="serif"
              style={{ fontSize: 20, letterSpacing: "-0.01em", color: "var(--ink)" }}
            >
              OpsAdvisor
            </span>
            <span className="uppercase-mono hidden md:block" style={{ fontSize: 10, letterSpacing: "0.16em" }}>
              {PRODUCT_SUBTITLE}
            </span>
          </div>
        </button>

        {/* Right — model badge */}
        <nav className="flex shrink-0 items-center gap-7">
          {showNav && (
            <>
              <a
                href="#process"
                className="uppercase-mono hidden lg:block"
                style={{ textDecoration: "none", color: "var(--ink-3)", fontSize: 11, letterSpacing: "0.12em", borderBottom: "1px solid transparent", paddingBottom: 1, transition: "color 160ms ease, border-color 160ms ease" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--ink)"; e.currentTarget.style.borderBottomColor = "var(--ink)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--ink-3)"; e.currentTarget.style.borderBottomColor = "transparent"; }}
              >
                Process
              </a>
              <a
                href="#cases"
                className="uppercase-mono hidden lg:block"
                style={{ textDecoration: "none", color: "var(--ink-3)", fontSize: 11, letterSpacing: "0.12em", borderBottom: "1px solid transparent", paddingBottom: 1, transition: "color 160ms ease, border-color 160ms ease" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--ink)"; e.currentTarget.style.borderBottomColor = "var(--ink)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--ink-3)"; e.currentTarget.style.borderBottomColor = "transparent"; }}
              >
                Cases
              </a>
            </>
          )}
          <span
            className="uppercase-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
            style={{
              fontSize: 11,
              letterSpacing: "0.10em",
              borderColor: "var(--line)",
              color: "var(--ink-3)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--moss)" }}
            />
            {MODEL_LABEL}
          </span>
        </nav>
      </div>
    </header>
  );
}
