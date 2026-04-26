import fs from "fs";
import path from "path";
import { loadDataset } from "./loadDataset";
import { analyzePipeline } from "./analyzePipeline";
import type { GeneratedOutputPayload } from "./outputTypes";
import type { PipelineAnalysis } from "./analyzePipeline";
import type { PipelineLog } from "./pipelinePhases";

const OUTPUT_PATH = path.join(process.cwd(), "data", "demo_output.json");

export type DemoResult = {
  generated: GeneratedOutputPayload;
  analysis: PipelineAnalysis;
  pipelineLog: PipelineLog;
};

export function loadDemoResult(): DemoResult {
  const raw = fs.readFileSync(OUTPUT_PATH, "utf-8");
  const generated = JSON.parse(raw) as GeneratedOutputPayload & { pipelineLog?: PipelineLog };

  // Extract pipelineLog from the JSON (stored alongside the payload for convenience)
  const pipelineLog: PipelineLog = (generated as Record<string, unknown>).pipelineLog as PipelineLog ?? [];

  // Compute analysis deterministically from the CSV — always matches the pre-baked output
  const { records } = loadDataset();
  const analysis = analyzePipeline(records);

  return { generated, analysis, pipelineLog };
}
