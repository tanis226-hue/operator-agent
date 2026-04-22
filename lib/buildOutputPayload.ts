import Anthropic from "@anthropic-ai/sdk";
import type { PipelineAnalysis } from "./analyzePipeline";
import type { IntakeBrief } from "./intakeBrief";
import { buildMasterPrompt } from "./prompts";
import type { GeneratedOutputPayload } from "./outputTypes";

const MODEL = "claude-haiku-4-5-20251001";

function extractJSON(raw: string): string {
  // Strip markdown fences
  let s = raw
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .trim();
  // Find the outermost JSON object if there's surrounding text
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }
  return s;
}

export async function buildOutputPayload(
  brief: IntakeBrief,
  analysis: PipelineAnalysis,
  processNote: string
): Promise<GeneratedOutputPayload> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = buildMasterPrompt(brief, analysis, processNote);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system:
      "You are a senior operations advisor. You output ONLY valid JSON objects — no prose, no markdown, no explanation. Your entire response must be parseable by JSON.parse().",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
            cache_control: { type: "ephemeral" },
          },
        ],
      },
    ],
  });

  const rawText =
    response.content[0].type === "text" ? response.content[0].text : "";

  const cleaned = extractJSON(rawText);

  const payload = JSON.parse(cleaned) as GeneratedOutputPayload;
  return payload;
}
