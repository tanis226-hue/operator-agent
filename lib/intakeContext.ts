import type { IntakeBrief } from "./intakeBrief";
import { INDUSTRY_LABELS, TEAM_SIZE_LABELS } from "./intakeBrief";

/**
 * Format the structured org context fields from the brief as a compact
 * prompt block. Skip empty fields so the model isn't fed "tooling: ".
 */
export function formatOrgContext(brief: IntakeBrief): string {
  const lines: string[] = ["ORG CONTEXT"];

  if (brief.industry) {
    const industryLabel = INDUSTRY_LABELS[brief.industry];
    const subLabel = brief.subIndustry ? ` (${brief.subIndustry})` : "";
    lines.push(`Industry: ${industryLabel}${subLabel}`);
  }
  if (brief.teamSize) {
    lines.push(`Team size: ${TEAM_SIZE_LABELS[brief.teamSize]}`);
  }
  if (brief.volumePerMonth) {
    lines.push(`Volume per month: ${brief.volumePerMonth}`);
  }
  if (brief.valuePerItem) {
    lines.push(`Value per work item: ${brief.valuePerItem}`);
  }
  if (brief.currentTooling) {
    lines.push(`Current tooling: ${brief.currentTooling}`);
  }
  if (brief.priorAttempts) {
    lines.push(`Previously tried (do not re-recommend these without addressing why they failed): ${brief.priorAttempts}`);
  }

  // Only emit the block if we have at least one signal beyond the heading.
  return lines.length > 1 ? lines.join("\n") : "";
}
