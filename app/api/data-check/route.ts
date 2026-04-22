import { NextResponse } from "next/server";
import { loadDataset, loadProcessNote } from "@/lib/loadDataset";

export async function GET() {
  try {
    const { records, rowCount, warnings } = loadDataset();
    const processNote = loadProcessNote();

    const conversionCounts = records.reduce(
      (acc, r) => {
        acc[r.conversion_outcome] = (acc[r.conversion_outcome] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      ok: true,
      rowCount,
      warnings,
      conversionCounts,
      processNoteChars: processNote.length,
      sample: records.slice(0, 3),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
