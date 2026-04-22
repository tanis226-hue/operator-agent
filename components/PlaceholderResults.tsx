import { PhaseCard } from "./PhaseCard";

const ORDERED_SECTIONS: Array<{
  title: string;
  eyebrow: string;
  variant?: "summary" | "default";
}> = [
  { title: "Executive Summary", eyebrow: "Headline", variant: "summary" },
  { title: "Problem Definition", eyebrow: "Define" },
  { title: "Baseline Performance", eyebrow: "Measure" },
  { title: "Root-Cause Analysis", eyebrow: "Analyze" },
  { title: "Recommended Fix", eyebrow: "Improve" },
  { title: "Workflow Rule / SOP Update", eyebrow: "Improve" },
  { title: "Control Dashboard", eyebrow: "Control" },
  { title: "Alert Logic", eyebrow: "Control" },
  { title: "Monitoring Report", eyebrow: "Control" },
];

export function PlaceholderResults() {
  return (
    <div className="flex flex-col gap-5">
      {ORDERED_SECTIONS.map((section, i) => (
        <PhaseCard
          key={section.title}
          index={i + 1}
          title={section.title}
          eyebrow={section.eyebrow}
          variant={section.variant}
        />
      ))}
    </div>
  );
}
