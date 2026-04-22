import Anthropic from "@anthropic-ai/sdk";
import type { PipelineAnalysis } from "./analyzePipeline";
import type { IntakeBrief } from "./intakeBrief";
import { buildMasterPrompt } from "./prompts";
import type { GeneratedOutputPayload } from "./outputTypes";

const MODEL = "claude-haiku-4-5-20251001";

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

  // Strip any accidental markdown fences before parsing
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  let payload: GeneratedOutputPayload;
  try {
    payload = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Claude returned non-JSON response. Raw: ${rawText.slice(0, 500)}`
    );
  }

  return payload;
}
