import { Header } from "@/components/Header";
import { IntakeBriefCard } from "@/components/IntakeBriefCard";
import { AnalysisRunner } from "@/components/AnalysisRunner";
import { DEMO_INTAKE_BRIEF } from "@/lib/intakeBrief";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <Header />

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <IntakeBriefCard brief={DEMO_INTAKE_BRIEF} />
        <AnalysisRunner />
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 pt-4 text-xs text-ink-muted">
        Local synthetic data · No production integrations ·{" "}
        <span className="font-medium">Lead Intake and Conversion Bottleneck</span>
      </footer>
    </div>
  );
}
