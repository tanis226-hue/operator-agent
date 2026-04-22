"use client";

import { PhaseCard } from "./PhaseCard";
import { MetricCard } from "./MetricCard";
import { StageDropoffChart } from "./StageDropoffChart";
import { OwnerComparisonChart } from "./OwnerComparisonChart";
import { InsightStrip } from "./InsightStrip";
import type { PipelineAnalysis } from "@/lib/analyzePipeline";
import type { GeneratedOutputPayload } from "@/lib/outputTypes";

type Props = {
  analysis: PipelineAnalysis;
  generated: GeneratedOutputPayload;
};

const SEVERITY_STYLES = {
  critical: "border-red-200 bg-red-50 text-red-700",
  warning: "border-orange-200 bg-orange-50 text-orange-700",
};

export function AnalysisResults({ analysis, generated }: Props) {
  const { executiveSummary, problemDefinition, rootCauseAnalysis, recommendation, workflowSOP, monitoringReport, controlDashboard, alertRules } = generated;
  const responseGap = analysis.conversionWithTimely - analysis.conversionWithDelayed;
  const followupGap = analysis.conversionNoMissedFollowup - analysis.conversionMissedFollowup;

  return (
    <div className="flex flex-col gap-5">

      {/* At-a-glance KPI strip */}
      <InsightStrip analysis={analysis} />

      {/* 1. Executive Summary */}
      <PhaseCard index={1} title="Executive Summary" eyebrow="Headline" variant="summary">
        <div className="flex flex-col gap-5">
          <p className="text-[15px] font-medium leading-relaxed text-ink">
            {executiveSummary.headlineFinding}
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              ["Business impact", executiveSummary.whyItMatters],
              ["Primary cause", executiveSummary.primaryCause],
              ["First action", executiveSummary.recommendedAction],
              ["How success will be monitored", executiveSummary.monitoringPlan],
            ].map(([label, text]) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="eyebrow">{label}</span>
                <span className="text-[13px] leading-relaxed text-ink-soft">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </PhaseCard>

      {/* 2. Problem Definition */}
      <PhaseCard index={2} title="Problem Definition" eyebrow="Define">
        <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          {[
            ["Workflow", problemDefinition.workflow],
            ["Business problem", problemDefinition.businessProblem],
            ["Affected group", problemDefinition.affectedGroup],
            ["Success metric", problemDefinition.successMetric],
            ["Scope", problemDefinition.scope],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</dt>
              <dd className="mt-1 leading-relaxed text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </PhaseCard>

      {/* 3. Baseline Performance */}
      <PhaseCard index={3} title="Baseline Performance" eyebrow="Measure">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Conversion rate"
              value={`${analysis.conversionRate}%`}
              sub="New lead → booked meeting"
              highlight
            />
            <MetricCard
              label="Median first response"
              value={`${analysis.medianFirstResponseHours.toFixed(1)}h`}
              sub="SLA target: 4 hours"
              alert={analysis.medianFirstResponseHours > 4}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricCard
              label="Stalled lead rate"
              value={`${analysis.stalledLeadRate}%`}
              sub="Threshold: 15%"
              alert={analysis.stalledLeadRate > 15}
            />
            <MetricCard
              label="Missed follow-up rate"
              value={`${analysis.missedFollowupRate}%`}
              sub="Threshold: 20%"
              alert={analysis.missedFollowupRate > 20}
            />
            <MetricCard
              label="Avg deal value"
              value={`$${analysis.avgDealValue.toLocaleString()}`}
              sub={`$${Math.round((analysis.stalledLeads * analysis.avgDealValue) / 1000)}k at risk`}
              alert={analysis.stalledLeads > 20}
            />
            <MetricCard
              label="Total leads"
              value={String(analysis.totalLeads)}
              sub={`${analysis.bookedMeetings} booked · ${analysis.stalledLeads} stalled`}
            />
          </div>
          <div>
            <p className="mb-2 eyebrow">Leads by stage</p>
            <StageDropoffChart data={analysis.stageDropoff} />
          </div>
          {analysis.bySource.length > 1 && (
            <div>
              <p className="mb-2 eyebrow">Conversion rate by lead source</p>
              <OwnerComparisonChart data={analysis.bySource} baseline={analysis.conversionRate} />
            </div>
          )}
        </div>
      </PhaseCard>

      {/* 4. Root-Cause Analysis */}
      <PhaseCard index={4} title="Root-Cause Analysis" eyebrow="Analyze">
        <div className="flex flex-col gap-5">
          <div className="rounded-lg border border-line bg-canvas p-4">
            <p className="eyebrow mb-1">Top leakage point</p>
            <p className="text-sm leading-relaxed text-ink">{rootCauseAnalysis.topLeakagePoint}</p>
          </div>

          <div>
            <p className="mb-3 eyebrow">Ranked likely causes</p>
            <ol className="flex flex-col gap-3">
              {rootCauseAnalysis.rankedCauses.map((c, i) => {
                const det = analysis.rankedCauses[i];
                return (
                  <li key={c.rank} className="flex gap-3 rounded-lg border border-line bg-surface p-3 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                      {c.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-ink">{c.factor}</span>
                        {det && (
                          <div className="flex shrink-0 flex-col items-end gap-0.5">
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-red-600">
                              −{det.impactDelta.toFixed(0)}pp
                            </span>
                            <span className="text-[10px] text-ink-muted">{det.affectedLeads} leads</span>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 leading-relaxed text-ink-soft">{c.finding}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Response speed comparison */}
          <div className="rounded-lg border border-line bg-canvas p-4">
            <p className="mb-3 eyebrow">Conversion rate by first-response speed</p>
            <div className="flex flex-col gap-2.5">
              <ConversionBar
                label="First response ≤ 4h (within SLA)"
                rate={analysis.conversionWithTimely}
                color="bg-accent"
                valueColor="text-accent"
              />
              <div className="flex items-center justify-end">
                <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
                  ↓ {responseGap.toFixed(0)}pp gap
                </span>
              </div>
              <ConversionBar
                label="First response > 24h (delayed)"
                rate={analysis.conversionWithDelayed}
                color="bg-red-400"
                valueColor="text-red-600"
              />
            </div>
            <div className="mt-4 flex flex-col gap-2.5 border-t border-line pt-4">
              <ConversionBar
                label="No missed follow-up"
                rate={analysis.conversionNoMissedFollowup}
                color="bg-accent/70"
                valueColor="text-accent"
              />
              <div className="flex items-center justify-end">
                <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-600">
                  ↓ {followupGap.toFixed(0)}pp gap
                </span>
              </div>
              <ConversionBar
                label="Missed follow-up"
                rate={analysis.conversionMissedFollowup}
                color="bg-orange-400"
                valueColor="text-orange-600"
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-soft">
              {rootCauseAnalysis.supportingComparison}
            </p>
          </div>

          <div className="rounded-lg border border-line bg-canvas p-4">
            <p className="eyebrow mb-1">Segment insight</p>
            <p className="text-sm leading-relaxed text-ink">{rootCauseAnalysis.segmentInsight}</p>
          </div>

          <div>
            <p className="mb-2 eyebrow">Conversion rate by owner</p>
            <OwnerComparisonChart data={analysis.byOwner} baseline={analysis.conversionRate} />
          </div>
        </div>
      </PhaseCard>

      {/* 5. Recommended Fix */}
      <PhaseCard index={5} title="Recommended Fix" eyebrow="Improve">
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-accent/20 bg-accent-soft p-4">
            <p className="text-sm leading-relaxed font-medium text-ink">{recommendation.firstAction}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
            <div>
              <span className="eyebrow block mb-1">Why this first</span>
              <span className="leading-relaxed text-ink">{recommendation.whyThisFirst}</span>
            </div>
            <div>
              <span className="eyebrow block mb-1">Expected effect</span>
              <span className="leading-relaxed text-ink">{recommendation.expectedEffect}</span>
            </div>
            <div>
              <span className="eyebrow block mb-1">Owner</span>
              <span className="leading-relaxed text-ink">{recommendation.owner}</span>
            </div>
          </div>
        </div>
      </PhaseCard>

      {/* 6. Workflow Rule / SOP */}
      <PhaseCard index={6} title="Workflow Rule / SOP Update" eyebrow="Improve">
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-semibold text-ink">{workflowSOP.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{workflowSOP.objective}</p>
          </div>
          <ul className="flex flex-col gap-2">
            {workflowSOP.bullets.map((rule, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {rule}
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2">
              <span className="eyebrow text-orange-700 block mb-1">Escalation</span>
              <p className="leading-relaxed text-ink">{workflowSOP.escalation}</p>
            </div>
            <div className="rounded-md border border-line bg-canvas px-3 py-2">
              <span className="eyebrow block mb-1">Owner</span>
              <p className="leading-relaxed text-ink">{workflowSOP.owner}</p>
            </div>
          </div>
        </div>
      </PhaseCard>

      {/* 7. Control Dashboard */}
      <PhaseCard index={7} title="Control Dashboard" eyebrow="Control">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard
            label="Conversion rate"
            value={`${analysis.conversionRate}%`}
            sub="New lead → booked meeting"
            highlight
          />
          <MetricCard
            label="Median first response"
            value={`${analysis.medianFirstResponseHours.toFixed(1)}h`}
            sub="SLA target: 4h"
            alert={analysis.medianFirstResponseHours > 4}
          />
          <MetricCard
            label="Stalled lead rate"
            value={`${analysis.stalledLeadRate}%`}
            sub="Alert threshold: 15%"
            alert={analysis.stalledLeadRate > 15}
          />
          <div className="flex flex-col gap-1 rounded-xl border border-orange-200 bg-orange-50 px-4 py-4">
            <span className="eyebrow text-orange-600">Needs attention</span>
            <span className="mt-1 text-sm font-medium leading-snug text-ink">{controlDashboard.segmentNeedingAttention}</span>
          </div>
        </div>
      </PhaseCard>

      {/* 8. Alert Logic */}
      <PhaseCard index={8} title="Alert Logic" eyebrow="Control">
        <ul className="flex flex-col gap-3">
          {alertRules.map((rule, i) => (
            <li
              key={i}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${SEVERITY_STYLES[rule.severity]}`}
            >
              <span className="mt-0.5 shrink-0 text-[10px] font-bold uppercase tracking-wider">
                {rule.severity}
              </span>
              <div>
                <p className="font-medium">{rule.trigger}</p>
                <p className="mt-0.5 opacity-80">Action: {rule.action}</p>
              </div>
            </li>
          ))}
        </ul>
      </PhaseCard>

      {/* 9. Monitoring Report */}
      <PhaseCard index={9} title="Monitoring Report" eyebrow="Control">
        <dl className="flex flex-col gap-4 text-sm">
          {[
            ["Issue identified", monitoringReport.issue],
            ["Fix selected", monitoringReport.fix],
            ["Metrics to monitor", monitoringReport.metrics],
            ["Alert thresholds", monitoringReport.thresholds],
            ["Owner", monitoringReport.owner],
            ["Response if drift occurs", monitoringReport.responsePlan],
          ].map(([label, value]) => (
            <div key={label} className="border-b border-line pb-4 last:border-0 last:pb-0">
              <dt className="eyebrow mb-1">{label}</dt>
              <dd className="leading-relaxed text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </PhaseCard>

    </div>
  );
}

function ConversionBar({
  label,
  rate,
  color,
  valueColor,
}: {
  label: string;
  rate: number;
  color: string;
  valueColor?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-soft">{label}</span>
        <span className={`font-bold tabular-nums ${valueColor ?? "text-ink"}`}>{rate}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
    </div>
  );
}
