import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { loadDataset, loadProcessNote } from "@/lib/loadDataset";
import { analyzePipeline } from "@/lib/analyzePipeline";
import { buildOutputPayload } from "@/lib/buildOutputPayload";
import { DEMO_INTAKE_BRIEF } from "@/lib/intakeBrief";
import type { GeneratedOutputPayload } from "@/lib/outputTypes";

export const maxDuration = 60;

function loadDemoOutput(): GeneratedOutputPayload {
  const filePath = path.join(process.cwd(), "data", "demo_output.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as GeneratedOutputPayload;
}

function hasApiKey(): boolean {
  const k = process.env.ANTHROPIC_API_KEY ?? "";
  return k.trim().length > 0 && k !== "your_key_here";
}

export async function POST() {
  try {
    const { records, warnings } = loadDataset();
    const analysis = analyzePipeline(records);

    let generated: GeneratedOutputPayload;
    let usedFallback = false;

    if (hasApiKey()) {
      try {
        const processNote = loadProcessNote();
        generated = await buildOutputPayload(DEMO_INTAKE_BRIEF, analysis, processNote);
      } catch {
        // Live call failed — use pre-generated output rather than showing an error
        generated = loadDemoOutput();
        usedFallback = true;
      }
    } else {
      generated = loadDemoOutput();
      usedFallback = true;
    }

    return NextResponse.json({
      ok: true,
      analysis,
      generated,
      dataWarnings: warnings,
      usedFallback,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
