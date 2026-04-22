"use client";

import { PhaseCard } from "./PhaseCard";
import { MetricCard } from "./MetricCard";
import { StageDropoffChart } from "./StageDropoffChart";
import { OwnerComparisonChart } from "./OwnerComparisonChart";
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

  return (
    <div className="flex flex-col gap-5">

      {/* 1. Executive Summary */}
      <PhaseCard index={1} title="Executive Summary" eyebrow="Headline" variant="summary">
        <div className="flex flex-col gap-4">
          <p className="text-base font-medium leading-relaxed text-ink">
            {executiveSummary.headlineFinding}
          </p>
          <div className="grid grid-cols-1 gap-3 text-sm leading-relaxed text-ink-soft md:grid-cols-2">
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Business impact</span>
              <span>{executiveSummary.whyItMatters}</span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Primary cause</span>
              <span>{executiveSummary.primaryCause}</span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted">First action</span>
              <span>{executiveSummary.recommendedAction}</span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted">What will be monitored</span>
              <span>{executiveSummary.monitoringPlan}</span>
            </div>
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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <MetricCard
              label="Stalled lead rate"
              value={`${analysis.stalledLeadRate}%`}
              alert={analysis.stalledLeadRate > 15}
            />
            <MetricCard
              label="Missed follow-up rate"
              value={`${analysis.missedFollowupRate}%`}
              alert={analysis.missedFollowupRate > 20}
            />
            <MetricCard
              label="Total leads analyzed"
              value={String(analysis.totalLeads)}
            />
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Leads by stage
            </p>
            <StageDropoffChart data={analysis.stageDropoff} />
          </div>
        </div>
      </PhaseCard>

      {/* 4. Root-Cause Analysis */}
      <PhaseCard index={4} title="Root-Cause Analysis" eyebrow="Analyze">
        <div className="flex flex-col gap-5">
          <div className="rounded-lg border border-line bg-canvas p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Top leakage point</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{rootCauseAnalysis.topLeakagePoint}</p>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Ranked likely causes</p>
            <ol className="flex flex-col gap-3">
              {rootCauseAnalysis.rankedCauses.map((c) => (
                <li key={c.rank} className="flex gap-3 rounded-lg border border-line bg-surface p-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                    {c.rank}
                  </span>
                  <div>
                    <span className="font-semibold text-ink">{c.factor}</span>
                    <p className="mt-0.5 leading-relaxed text-ink-soft">{c.finding}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-line bg-canvas p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Response-time comparison</p>
              <p className="mt-1 text-sm leading-relaxed text-ink">{rootCauseAnalysis.supportingComparison}</p>
            </div>
            <div className="rounded-lg border border-line bg-canvas p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Segment insight</p>
              <p className="mt-1 text-sm leading-relaxed text-ink">{rootCauseAnalysis.segmentInsight}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Conversion rate by owner</p>
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
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted block">Why this first</span>
              <span className="mt-1 block leading-relaxed text-ink">{recommendation.whyThisFirst}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted block">Expected effect</span>
              <span className="mt-1 block leading-relaxed text-ink">{recommendation.expectedEffect}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted block">Owner</span>
              <span className="mt-1 block leading-relaxed text-ink">{recommendation.owner}</span>
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
              <span className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">Escalation</span>
              <p className="mt-1 leading-relaxed text-ink">{workflowSOP.escalation}</p>
            </div>
            <div className="rounded-md border border-line bg-canvas px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Owner</span>
              <p className="mt-1 leading-relaxed text-ink">{workflowSOP.owner}</p>
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
            sub={controlDashboard.conversionRateLabel}
            highlight
          />
          <MetricCard
            label="Median first response"
            value={`${analysis.medianFirstResponseHours.toFixed(1)}h`}
            sub="SLA: 4h"
            alert
          />
          <MetricCard
            label="Stalled lead rate"
            value={`${analysis.stalledLeadRate}%`}
            sub="Threshold: 15%"
            alert
          />
          <div className="flex flex-col gap-1 rounded-xl border border-line bg-canvas px-4 py-4">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Needs attention</span>
            <span className="text-sm font-medium leading-snug text-ink">{controlDashboard.segmentNeedingAttention}</span>
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
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</dt>
              <dd className="mt-1 leading-relaxed text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </PhaseCard>

    </div>
  );
}
