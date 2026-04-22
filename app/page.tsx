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
        Demo dataset: synthetic lead intake pipeline · Custom cases run purely from your intake brief ·{" "}
        <strong className="font-medium text-ink-soft">
          Powered by Claude Opus 4.7
        </strong>
      </footer>
    </div>
  );
}
