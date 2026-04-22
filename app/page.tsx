import { Header } from "@/components/Header";
import { AnalysisRunner } from "@/components/AnalysisRunner";
import { DEMO_INTAKE_BRIEF } from "@/lib/intakeBrief";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <Header />

      <main className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-8">
        <AnalysisRunner brief={DEMO_INTAKE_BRIEF} />
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 pt-2 text-xs text-ink-muted">
        Local synthetic data · No production integrations ·{" "}
        <strong className="font-medium text-ink-soft">
          Lead Intake and Conversion Bottleneck
        </strong>
      </footer>
    </div>
  );
}
