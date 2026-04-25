"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { LandingHero } from "@/components/LandingHero";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { AnalysisRunner } from "@/components/AnalysisRunner";
import { DEMO_INTAKE_BRIEF } from "@/lib/intakeBrief";
import type { IntakeBrief } from "@/lib/intakeBrief";

type AppStage = "landing" | "onboarding" | "analyzing";

type WizardResult = {
  brief: IntakeBrief;
  processNote: string;
};

export default function HomePage() {
  const [stage, setStage] = useState<AppStage>("landing");
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null);

  function handleWizardComplete(result: WizardResult) {
    setWizardResult(result);
    setStage("analyzing");
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Header />

      {stage === "landing" && (
        <LandingHero onStart={() => setStage("onboarding")} />
      )}

      {stage === "onboarding" && (
        <main className="mx-auto max-w-2xl px-6 py-12">
          <OnboardingWizard
            onComplete={handleWizardComplete}
            onBack={() => setStage("landing")}
          />
        </main>
      )}

      {stage === "analyzing" && (
        <>
          <main className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-8">
            <AnalysisRunner
              brief={DEMO_INTAKE_BRIEF}
              externalBrief={wizardResult?.brief}
              externalNote={wizardResult?.processNote}
              onRestart={() => setStage("onboarding")}
            />
          </main>
          <footer className="mx-auto max-w-5xl px-6 pb-10 pt-2 text-xs text-ink-muted">
            Powered by Claude Opus 4.7 · 3-phase DMAIC pipeline ·{" "}
            <button
              type="button"
              onClick={() => setStage("landing")}
              className="text-ink-muted underline underline-offset-2 hover:text-ink"
            >
              Start over
            </button>
          </footer>
        </>
      )}
    </div>
  );
}
