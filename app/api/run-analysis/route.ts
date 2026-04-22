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

export async function POST() {
  try {
    const { records, warnings } = loadDataset();
    const analysis = analyzePipeline(records);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let generated: GeneratedOutputPayload;
    let usedFallback = false;

    if (!apiKey || apiKey.trim() === "" || apiKey === "your_key_here") {
      generated = loadDemoOutput();
      usedFallback = true;
    } else {
      const processNote = loadProcessNote();
      generated = await buildOutputPayload(
        DEMO_INTAKE_BRIEF,
        analysis,
        processNote
      );
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
