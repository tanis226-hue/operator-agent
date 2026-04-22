import { NextResponse } from "next/server";
import { loadDataset, loadProcessNote } from "@/lib/loadDataset";
import { analyzePipeline } from "@/lib/analyzePipeline";
import { buildOutputPayload } from "@/lib/buildOutputPayload";
import { DEMO_INTAKE_BRIEF } from "@/lib/intakeBrief";

export const maxDuration = 60;

export async function POST() {
  try {
    const { records, warnings } = loadDataset();
    const processNote = loadProcessNote();
    const analysis = analyzePipeline(records);
    const generated = await buildOutputPayload(
      DEMO_INTAKE_BRIEF,
      analysis,
      processNote
    );

    return NextResponse.json({
      ok: true,
      analysis,
      generated,
      dataWarnings: warnings,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
