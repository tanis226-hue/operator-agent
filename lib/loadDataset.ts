import fs from "fs";
import path from "path";
import { parseCSV } from "./parseCSV";
import type {
  ConversionOutcome,
  DataLoadResult,
  Industry,
  LeadRecord,
  LeadSource,
  Owner,
  Priority,
  Region,
  Stage,
} from "./types";

const CSV_PATH = path.join(process.cwd(), "data", "acquisition_pipeline_cases.csv");
const NOTE_PATH = path.join(process.cwd(), "data", "process_note.md");

function bool(val: string): boolean {
  return val.toLowerCase() === "true";
}

function num(val: string): number {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function int(val: string): number {
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}

export function loadDataset(): DataLoadResult {
  const raw = fs.readFileSync(CSV_PATH, "utf-8");
  const rawRows = parseCSV(raw);
  const warnings: string[] = [];
  const records: LeadRecord[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const r = rawRows[i];
    const rowNum = i + 2; // 1-indexed, header is row 1

    if (!r["lead_id"]) {
      warnings.push(`Row ${rowNum}: missing lead_id — skipped`);
      continue;
    }

    const firstResponse = num(r["first_response_hours"]);
    if (firstResponse < 0) {
      warnings.push(`Row ${rowNum} (${r["lead_id"]}): negative first_response_hours`);
    }

    const outcome = r["conversion_outcome"] as ConversionOutcome;
    const stage = r["current_stage"] as Stage;

    if (outcome === "booked_meeting" && stage === "Lost") {
      warnings.push(
        `Row ${rowNum} (${r["lead_id"]}): outcome=booked_meeting but stage=Lost`
      );
    }

    const record: LeadRecord = {
      lead_id: r["lead_id"],
      lead_source: r["lead_source"] as LeadSource,
      owner: r["owner"] as Owner,
      created_date: r["created_date"],
      first_response_hours: firstResponse,
      current_stage: stage,
      days_in_stage: int(r["days_in_stage"]),
      missed_followup_flag: bool(r["missed_followup_flag"]),
      missing_info_flag: bool(r["missing_info_flag"]),
      handoff_count: int(r["handoff_count"]),
      conversion_outcome: outcome,
      estimated_deal_value: int(r["estimated_deal_value"]),
      is_stalled: bool(r["is_stalled"]),
    };

    if (r["industry"]) record.industry = r["industry"] as Industry;
    if (r["region"]) record.region = r["region"] as Region;
    if (r["priority"]) record.priority = r["priority"] as Priority;

    records.push(record);
  }

  return { records, rowCount: records.length, warnings };
}

export function loadProcessNote(): string {
  return fs.readFileSync(NOTE_PATH, "utf-8");
}
