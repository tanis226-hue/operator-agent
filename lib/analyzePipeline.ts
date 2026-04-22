import type { ConversionOutcome, LeadRecord, Owner, LeadSource, Stage } from "./types";

export type SegmentBreakdown = {
  label: string;
  total: number;
  booked: number;
  stalled: number;
  lost: number;
  conversionRate: number;
};

export type RankedCause = {
  rank: number;
  factor: string;
  description: string;
  impactDelta: number; // percentage-point gap vs baseline conversion
  affectedLeads: number;
};

export type StageDropoff = {
  stage: Stage;
  count: number;
  percentOfTotal: number;
};

export type ThresholdAlert = {
  metric: string;
  value: number;
  threshold: number;
  breached: boolean;
  severity: "warning" | "critical";
};

export type PipelineAnalysis = {
  // Baseline (Measure)
  totalLeads: number;
  bookedMeetings: number;
  stalledLeads: number;
  lostLeads: number;
  conversionRate: number;
  medianFirstResponseHours: number;
  stalledLeadRate: number;
  missedFollowupRate: number;
  avgDealValue: number;

  // Stage funnel
  stageCounts: Record<Stage, number>;
  stageDropoff: StageDropoff[];

  // Segmented breakdowns (Analyze)
  byOwner: SegmentBreakdown[];
  bySource: SegmentBreakdown[];

  // Key comparisons for root-cause
  conversionWithTimely: number;    // first_response <= 4h
  conversionWithDelayed: number;   // first_response > 24h
  conversionMissedFollowup: number;
  conversionNoMissedFollowup: number;
  conversionBothBad: number;       // delayed + missed
  stalledRateWithMissedFollowup: number;
  stalledRateNoMissedFollowup: number;

  // Ranked causes
  rankedCauses: RankedCause[];

  // Control thresholds
  thresholdAlerts: ThresholdAlert[];
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function pct(n: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((n / total) * 1000) / 10;
}

function convRate(records: LeadRecord[]): number {
  if (records.length === 0) return 0;
  const booked = records.filter((r) => r.conversion_outcome === "booked_meeting").length;
  return pct(booked, records.length);
}

function segmentBreakdown(
  label: string,
  records: LeadRecord[]
): SegmentBreakdown {
  const booked = records.filter((r) => r.conversion_outcome === "booked_meeting").length;
  const stalled = records.filter((r) => r.conversion_outcome === "stalled").length;
  const lost = records.filter((r) => r.conversion_outcome === "lost").length;
  return {
    label,
    total: records.length,
    booked,
    stalled,
    lost,
    conversionRate: pct(booked, records.length),
  };
}

function groupBy<T>(
  arr: T[],
  key: (item: T) => string
): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const k = key(item);
      (acc[k] ??= []).push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

const STAGE_ORDER: Stage[] = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Meeting Scheduled",
  "Lost",
];

// SLA threshold: 4 business hours
const RESPONSE_SLA_HOURS = 4;
// Stalled threshold for alerting: 15%
const STALL_RATE_ALERT = 15;
// Missed follow-up threshold for alerting: 20%
const MISSED_FOLLOWUP_ALERT = 20;
// Delayed response threshold: >24h
const DELAYED_RESPONSE_HOURS = 24;

export function analyzePipeline(records: LeadRecord[]): PipelineAnalysis {
  const total = records.length;

  // Baseline counts
  const byOutcome = groupBy(records, (r) => r.conversion_outcome);
  const booked = (byOutcome["booked_meeting"] ?? []).length;
  const stalled = (byOutcome["stalled"] ?? []).length;
  const lost = (byOutcome["lost"] ?? []).length;

  const conversionRate = pct(booked, total);
  const stalledLeadRate = pct(stalled, total);

  const missedFollowup = records.filter((r) => r.missed_followup_flag);
  const missedFollowupRate = pct(missedFollowup.length, total);

  const medianFirstResponseHours = median(records.map((r) => r.first_response_hours));

  const avgDealValue =
    total === 0
      ? 0
      : Math.round(
          records.reduce((s, r) => s + r.estimated_deal_value, 0) / total
        );

  // Stage counts and funnel
  const stageCounts = STAGE_ORDER.reduce(
    (acc, stage) => {
      acc[stage] = records.filter((r) => r.current_stage === stage).length;
      return acc;
    },
    {} as Record<Stage, number>
  );

  const stageDropoff: StageDropoff[] = STAGE_ORDER.map((stage) => ({
    stage,
    count: stageCounts[stage],
    percentOfTotal: pct(stageCounts[stage], total),
  }));

  // Segmented breakdowns
  const ownerGroups = groupBy(records, (r) => r.owner);
  const byOwner = Object.entries(ownerGroups)
    .map(([owner, recs]) => segmentBreakdown(owner, recs))
    .sort((a, b) => b.conversionRate - a.conversionRate);

  const sourceGroups = groupBy(records, (r) => r.lead_source);
  const bySource = Object.entries(sourceGroups)
    .map(([source, recs]) => segmentBreakdown(source, recs))
    .sort((a, b) => b.conversionRate - a.conversionRate);

  // Key comparisons
  const timelyRecs = records.filter((r) => r.first_response_hours <= RESPONSE_SLA_HOURS);
  const delayedRecs = records.filter((r) => r.first_response_hours > DELAYED_RESPONSE_HOURS);
  const missedRecs = records.filter((r) => r.missed_followup_flag);
  const noMissedRecs = records.filter((r) => !r.missed_followup_flag);
  const bothBadRecs = records.filter(
    (r) => r.first_response_hours > DELAYED_RESPONSE_HOURS && r.missed_followup_flag
  );

  const conversionWithTimely = convRate(timelyRecs);
  const conversionWithDelayed = convRate(delayedRecs);
  const conversionMissedFollowup = convRate(missedRecs);
  const conversionNoMissedFollowup = convRate(noMissedRecs);
  const conversionBothBad = convRate(bothBadRecs);

  const stalledMissed = missedRecs.filter((r) => r.is_stalled).length;
  const stalledNoMissed = noMissedRecs.filter((r) => r.is_stalled).length;
  const stalledRateWithMissedFollowup = pct(stalledMissed, missedRecs.length);
  const stalledRateNoMissedFollowup = pct(stalledNoMissed, noMissedRecs.length);

  // Ranked causes — ranked by conversion-rate delta from baseline
  const causes: Array<Omit<RankedCause, "rank">> = [];

  const missedDelta = conversionRate - conversionMissedFollowup;
  if (missedDelta > 0) {
    causes.push({
      factor: "Missed follow-up",
      description: `Leads with missed follow-up convert at ${conversionMissedFollowup}% vs ${conversionRate}% overall — a ${missedDelta.toFixed(1)}pp gap.`,
      impactDelta: missedDelta,
      affectedLeads: missedRecs.length,
    });
  }

  const delayedDelta = conversionWithTimely - conversionWithDelayed;
  if (timelyRecs.length > 0 && delayedRecs.length > 0) {
    causes.push({
      factor: "Delayed first response (>24h)",
      description: `Leads contacted within 4h convert at ${conversionWithTimely}% vs ${conversionWithDelayed}% for those contacted after 24h — a ${delayedDelta.toFixed(1)}pp gap.`,
      impactDelta: delayedDelta,
      affectedLeads: delayedRecs.length,
    });
  }

  // Owner variance: worst vs best performer
  if (byOwner.length >= 2) {
    const best = byOwner[0];
    const worst = byOwner[byOwner.length - 1];
    const ownerDelta = best.conversionRate - worst.conversionRate;
    if (ownerDelta > 5) {
      causes.push({
        factor: `Owner performance gap (${worst.label} vs ${best.label})`,
        description: `${worst.label} converts at ${worst.conversionRate}% vs ${best.label} at ${best.conversionRate}% — a ${ownerDelta.toFixed(1)}pp gap, likely tied to response discipline.`,
        impactDelta: ownerDelta,
        affectedLeads: worst.total,
      });
    }
  }

  // Handoff friction
  const highHandoffRecs = records.filter((r) => r.handoff_count >= 2);
  const lowHandoffRecs = records.filter((r) => r.handoff_count < 2);
  const handoffDelta = convRate(lowHandoffRecs) - convRate(highHandoffRecs);
  if (highHandoffRecs.length >= 5 && handoffDelta > 3) {
    causes.push({
      factor: "Multiple handoffs (≥2)",
      description: `Leads with 2+ handoffs convert at ${convRate(highHandoffRecs)}% vs ${convRate(lowHandoffRecs)}% for leads with fewer handoffs.`,
      impactDelta: handoffDelta,
      affectedLeads: highHandoffRecs.length,
    });
  }

  const rankedCauses = causes
    .sort((a, b) => b.impactDelta - a.impactDelta)
    .slice(0, 3)
    .map((c, i) => ({ ...c, rank: i + 1 }));

  // Threshold alerts for control logic
  const thresholdAlerts: ThresholdAlert[] = [
    {
      metric: "Stalled lead rate",
      value: stalledLeadRate,
      threshold: STALL_RATE_ALERT,
      breached: stalledLeadRate > STALL_RATE_ALERT,
      severity: "warning",
    },
    {
      metric: "Missed follow-up rate",
      value: missedFollowupRate,
      threshold: MISSED_FOLLOWUP_ALERT,
      breached: missedFollowupRate > MISSED_FOLLOWUP_ALERT,
      severity: "warning",
    },
    {
      metric: "Median first-response time",
      value: medianFirstResponseHours,
      threshold: RESPONSE_SLA_HOURS,
      breached: medianFirstResponseHours > RESPONSE_SLA_HOURS,
      severity: medianFirstResponseHours > 12 ? "critical" : "warning",
    },
  ];

  return {
    totalLeads: total,
    bookedMeetings: booked,
    stalledLeads: stalled,
    lostLeads: lost,
    conversionRate,
    medianFirstResponseHours,
    stalledLeadRate,
    missedFollowupRate,
    avgDealValue,
    stageCounts,
    stageDropoff,
    byOwner,
    bySource,
    conversionWithTimely,
    conversionWithDelayed,
    conversionMissedFollowup,
    conversionNoMissedFollowup,
    conversionBothBad,
    stalledRateWithMissedFollowup,
    stalledRateNoMissedFollowup,
    rankedCauses,
    thresholdAlerts,
  };
}
