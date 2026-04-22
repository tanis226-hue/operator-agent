import { Header } from "@/components/Header";
import { IntakeBriefCard } from "@/components/IntakeBriefCard";
import { RunAnalysisButton } from "@/components/RunAnalysisButton";
import { PlaceholderResults } from "@/components/PlaceholderResults";
import { DEMO_INTAKE_BRIEF } from "@/lib/intakeBrief";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <Header />

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <IntakeBriefCard brief={DEMO_INTAKE_BRIEF} />
        <RunAnalysisButton />

        <div className="mt-2 flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Results
          </h2>
          <div className="h-px flex-1 bg-line" />
        </div>

        <PlaceholderResults />
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 pt-4 text-xs text-ink-muted">
        Local synthetic data. No production integrations.
      </footer>
    </div>
  );
}
