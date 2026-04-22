import { NextResponse } from "next/server";
import { loadDataset } from "@/lib/loadDataset";
import { analyzePipeline } from "@/lib/analyzePipeline";

export async function GET() {
  try {
    const { records } = loadDataset();
    const analysis = analyzePipeline(records);
    return NextResponse.json({ ok: true, analysis });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
