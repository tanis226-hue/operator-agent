import { PhaseCard } from "./PhaseCard";

type DmaicSection = {
  phase: string;
  title: string;
  eyebrow: string;
  variant?: "summary" | "default";
};

const DMAIC_SECTIONS: DmaicSection[] = [
  { phase: "",        title: "Executive Summary",    eyebrow: "TL;DR",                       variant: "summary" },
  { phase: "Define",  title: "Problem Definition",   eyebrow: "Workflow & Scope" },
  { phase: "Measure", title: "Current State & KPIs", eyebrow: "KPIs & Benchmarks" },
  { phase: "Analyze", title: "Root-Cause Analysis",  eyebrow: "Causes & Mechanisms" },
  { phase: "Improve", title: "Improvement Plan",     eyebrow: "Action & SOP" },
  { phase: "Control", title: "Control System",       eyebrow: "Metrics, Alerts, Monitoring" },
];

function DmaicHeader({ phase }: { phase: string }) {
  return (
    <div className="flex items-center gap-3 pt-4">
      <span className="text-[11px] font-bold uppercase tracking-widest text-accent">{phase}</span>
      <div className="h-px flex-1 bg-accent/25" />
    </div>
  );
}

export function PlaceholderResults() {
  return (
    <div className="flex flex-col gap-5">
      {DMAIC_SECTIONS.map((section, i) => (
        <div key={section.title}>
          {section.phase && <DmaicHeader phase={section.phase} />}
          <div className={section.phase ? "mt-3" : ""}>
            <PhaseCard
              index={i}
              title={section.title}
              eyebrow={section.eyebrow}
              variant={section.variant}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
