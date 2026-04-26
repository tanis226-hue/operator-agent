"use client";

import { useEffect, useRef, useState } from "react";

type Section = {
  id: string;
  label: string;
  sub?: string;
  phase?: string; // D / M / A / I / C
};

const SECTIONS: Section[] = [
  { id: "section-brief",   label: "Owner Brief",        sub: "Monday morning view" },
  { id: "section-summary", label: "Executive Summary",  sub: "TL;DR" },
  { id: "section-define",  label: "Define",             sub: "Problem & scope",   phase: "D" },
  { id: "section-measure", label: "Measure",            sub: "Baseline & KPIs",   phase: "M" },
  { id: "section-analyze", label: "Analyze",            sub: "Root causes",       phase: "A" },
  { id: "section-improve", label: "Improve",            sub: "Action plan & SOP", phase: "I" },
  { id: "section-control", label: "Control",            sub: "Metrics & alerts",  phase: "C" },
  { id: "section-next",    label: "Next Steps",         sub: "What to do now" },
];

type Props = {
  /** Only show the sidebar once results have loaded */
  visible?: boolean;
};

export function DmaicSidebar({ visible = true }: Props) {
  const [activeId, setActiveId] = useState<string>("section-brief");
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!visible || typeof window === "undefined") return;

    // Find which section's top has crossed the offset line nearest the top
    // of the viewport. Walks the list in DOM order; the most recent section
    // whose top is at-or-above the offset line wins. Robust to sections
    // appearing later (e.g. when async results render in).
    function compute() {
      // Activation line ~30% down the viewport.
      const line = Math.max(140, window.innerHeight * 0.3);

      // Collect rendered sections with non-zero height. Empty wrappers
      // (e.g. the OwnerBrief slot when no brief is generated in custom
      // mode) are skipped so they don't get falsely selected.
      const present = SECTIONS
        .map((s) => ({ s, el: document.getElementById(s.id) }))
        .filter((x): x is { s: Section; el: HTMLElement } =>
          x.el !== null && x.el.getBoundingClientRect().height > 0
        );
      if (!present.length) return;

      // Edge case: at very top of page → always highlight Owner Brief
      // regardless of its rendered height (it may be empty on first paint).
      if (window.scrollY < 10) {
        setActiveId("section-brief");
        return;
      }

      // Edge case: at very bottom of page → force last section.
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight - scrollBottom < 4) {
        setActiveId(present[present.length - 1].s.id);
        return;
      }

      // Pick the section whose vertical span is closest to the line.
      // - If the line is inside a section, distance = 0 → that wins.
      // - If the line is between two sections, the nearer one wins.
      let bestId = present[0].s.id;
      let bestDist = Infinity;
      for (const { s, el } of present) {
        const rect = el.getBoundingClientRect();
        const dist =
          line < rect.top
            ? rect.top - line       // section is below the line
            : line > rect.bottom
            ? line - rect.bottom    // section is above the line
            : 0;                     // line is inside the section
        if (dist < bestDist) {
          bestDist = dist;
          bestId = s.id;
          if (dist === 0) break;     // line inside section → done
        }
      }
      setActiveId(bestId);
    }

    function onScroll() {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        compute();
      });
    }

    // Delay the first compute so the page's scroll-to-top (fired on stage
    // change in page.tsx) has time to settle. The initial useState default
    // of "section-brief" is correct until the user actually scrolls.
    const initTimer = window.setTimeout(compute, 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Safety net: if sections render in after mount (async results),
    // re-evaluate so the sidebar tracks correctly without prop-drilling.
    const interval = window.setInterval(compute, 1000);

    return () => {
      window.clearTimeout(initTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearInterval(interval);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!visible) return null;

  return (
    <aside
      className="sticky hidden xl:flex flex-col gap-1"
      style={{ top: 96, alignSelf: "flex-start", width: 200, minWidth: 200 }}
      aria-label="Report navigation"
    >
      {/* Section label */}
      <p
        className="uppercase-mono mb-3"
        style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--ink-4)" }}
      >
        Report sections
      </p>

      {SECTIONS.map((s) => {
        const isActive = activeId === s.id;
        const isDmaic = !!s.phase;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollTo(s.id)}
            className="group flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition"
            style={{
              background: isActive ? "var(--accent-soft)" : "transparent",
              border: `1px solid ${isActive ? "var(--accent-border)" : "transparent"}`,
            }}
          >
            {/* Phase letter or dot */}
            <span
              className="mt-0.5 shrink-0 flex items-center justify-center rounded-full"
              style={{
                width: 18,
                height: 18,
                fontSize: 9,
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontWeight: 400,
                background: isActive
                  ? "var(--accent)"
                  : isDmaic
                  ? "var(--bone)"
                  : "transparent",
                color: isActive
                  ? "var(--surface)"
                  : isDmaic
                  ? "var(--ink-3)"
                  : "transparent",
                border: isDmaic ? "none" : `1.5px solid ${isActive ? "var(--accent)" : "var(--line)"}`,
                transition: "background 200ms ease, color 200ms ease",
              }}
            >
              {isDmaic ? s.phase : ""}
              {!isDmaic && (
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: isActive ? "var(--accent)" : "var(--line)",
                    display: "block",
                    transition: "background 200ms ease",
                  }}
                />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span
                className="block text-[12px] font-medium leading-tight transition"
                style={{ color: isActive ? "var(--accent)" : "var(--ink-2)" }}
              >
                {s.label}
              </span>
              {s.sub && (
                <span
                  className="block mt-0.5 text-[10px] leading-tight"
                  style={{ color: isActive ? "var(--accent)/70" : "var(--ink-4)" }}
                >
                  {s.sub}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
