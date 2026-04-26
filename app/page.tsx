"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LandingHero } from "@/components/LandingHero";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { AnalysisRunner } from "@/components/AnalysisRunner";
import { DmaicSidebar } from "@/components/DmaicSidebar";
import { DEMO_INTAKE_BRIEF } from "@/lib/intakeBrief";
import type { IntakeBrief } from "@/lib/intakeBrief";
import { EXAMPLE_CASES } from "@/lib/exampleCases";

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

  // Scroll to top whenever the stage changes (landing → onboarding → analyzing
  // and back). Without this, a user who scrolled down the landing page lands
  // mid-page in the wizard / results view.
  useEffect(() => {
    if (!hydrated) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [stage, hydrated]);

  function handleWizardComplete(result: WizardResult) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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
      <Header onLogo={stage !== "landing" ? handleStartOver : undefined} showNav={stage === "landing"} />

      {stage === "landing" && (
        <LandingHero
          onDemo={() => {
            // Bypass wizard — go straight to demo analysis
            try { sessionStorage.removeItem("oa_analysis"); } catch { /* ignore */ }
            setWizardResult(null);
            setStage("analyzing");
          }}
          onStart={() => setStage("onboarding")}
          onPreset={(id) => {
            const preset = EXAMPLE_CASES.find((c) => c.id === id);
            if (!preset) return;
            try { sessionStorage.removeItem("oa_analysis"); } catch { /* ignore */ }
            setWizardResult({ brief: preset.brief, processNote: preset.processNote });
            setStage("analyzing");
          }}
        />
      )}

      {stage === "onboarding" && (
        <main className="mx-auto max-w-[880px] px-6 py-12">
          <OnboardingWizard
            onComplete={handleWizardComplete}
            onBack={() => setStage("landing")}
          />
        </main>
      )}

      {stage === "analyzing" && (
        <>
          <div className="mx-auto max-w-shell px-12 py-8">
            <div className="flex items-start gap-8">
              <DmaicSidebar />
              <main className="min-w-0 flex-1 flex flex-col gap-5">
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
            </div>
            <div className="pb-4 pt-2">
              <button
                type="button"
                onClick={handleStartOver}
                className="uppercase-mono text-[9px] text-ink-muted hover:text-ink"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                ← Start over
              </button>
            </div>
          </div>
        </>
      )}

      <Footer muted={stage === "onboarding"} />
    </div>
  );
}
