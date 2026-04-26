"use client";

import { useState, useEffect } from "react";
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

const SESSION_STAGE_KEY = "oa_stage";
const SESSION_RESULT_KEY = "oa_wizard_result";

function readSession(): { stage: AppStage; wizardResult: WizardResult | null } {
  try {
    const stage = (sessionStorage.getItem(SESSION_STAGE_KEY) as AppStage | null) ?? "landing";
    const raw = sessionStorage.getItem(SESSION_RESULT_KEY);
    const wizardResult = raw ? (JSON.parse(raw) as WizardResult) : null;
    return { stage, wizardResult };
  } catch {
    return { stage: "landing", wizardResult: null };
  }
}

export default function HomePage() {
  const [stage, setStage] = useState<AppStage>("landing");
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore from sessionStorage after first render (client-only)
  useEffect(() => {
    const saved = readSession();
    if (saved.stage !== "landing") {
      setWizardResult(saved.wizardResult);
      setStage(saved.stage);
    }
    setHydrated(true);
  }, []);

  // Persist whenever stage or result changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(SESSION_STAGE_KEY, stage);
      if (wizardResult) {
        sessionStorage.setItem(SESSION_RESULT_KEY, JSON.stringify(wizardResult));
      } else {
        sessionStorage.removeItem(SESSION_RESULT_KEY);
      }
    } catch { /* storage full or unavailable */ }
  }, [stage, wizardResult, hydrated]);

  function handleWizardComplete(result: WizardResult) {
    setWizardResult(result);
    setStage("analyzing");
  }

  function handleStartOver() {
    try {
      sessionStorage.removeItem(SESSION_STAGE_KEY);
      sessionStorage.removeItem(SESSION_RESULT_KEY);
      sessionStorage.removeItem("oa_analysis");
    } catch { /* ignore */ }
    setWizardResult(null);
    setStage("landing");
  }

  function handleRestart() {
    try { sessionStorage.removeItem("oa_analysis"); } catch { /* ignore */ }
    setStage("onboarding");
  }

  // Avoid SSR/client mismatch by rendering nothing until hydrated
  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-canvas">
      <Header />

      {stage === "landing" && (
        <LandingHero
          onDemo={() => {
            // Bypass wizard — go straight to demo analysis
            try { sessionStorage.removeItem("oa_analysis"); } catch { /* ignore */ }
            setWizardResult(null);
            setStage("analyzing");
          }}
          onStart={() => setStage("onboarding")}
        />
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
              instantDemo={wizardResult === null}
              onRestart={handleRestart}
              onAnalyzeOwn={() => {
                try {
                  sessionStorage.removeItem(SESSION_STAGE_KEY);
                  sessionStorage.removeItem(SESSION_RESULT_KEY);
                  sessionStorage.removeItem("oa_analysis");
                } catch { /* ignore */ }
                setWizardResult(null);
                setStage("onboarding");
              }}
            />
          </main>
          <footer className="mx-auto max-w-5xl px-6 pb-10 pt-2 text-xs text-ink-muted">
            <button
              type="button"
              onClick={handleStartOver}
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
