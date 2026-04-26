"use client";

import { PhaseCard } from "./PhaseCard";
import { MetricCard } from "./MetricCard";
import { StageDropoffChart } from "./StageDropoffChart";
import { OwnerComparisonChart } from "./OwnerComparisonChart";
import { InsightStrip } from "./InsightStrip";
import { OwnerBriefCard } from "./OwnerBriefCard";
import type { PipelineAnalysis } from "@/lib/analyzePipeline";
import type { GeneratedOutputPayload } from "@/lib/outputTypes";
import type { IntakeBrief } from "@/lib/intakeBrief";

type Props = {
  analysis?: PipelineAnalysis;
  generated: GeneratedOutputPayload;
  brief?: IntakeBrief;
  mode?: "demo" | "custom";
  onAnalyzeOwn?: () => void;
};

const SEVERITY_STYLES = {
  critical: "border-red-200 bg-red-50 text-red-700",
  warning: "border-orange-200 bg-orange-50 text-orange-700",
};

export function AnalysisResults({ analysis, generated, brief, mode, onAnalyzeOwn }: Props) {
  const {
    executiveSummary,
    problemDefinition,
    rootCauseAnalysis,
    recommendation,
    workflowSOP,
    monitoringReport,
    controlDashboard,
    alertRules,
    measureBaseline,
  } = generated;

  const responseGap = analysis
    ? analysis.conversionWithTimely - analysis.conversionWithDelayed
    : null;
  const followupGap = analysis
    ? analysis.conversionNoMissedFollowup - analysis.conversionMissedFollowup
    : null;

  return (
    <div className="flex flex-col gap-5">

      {/* ── OWNER BRIEF (TOP) ── */}
      {generated.ownerBrief && (
        <OwnerBriefCard ownerBrief={generated.ownerBrief} analysis={analysis} />
      )}

      {/* ── EXECUTIVE SUMMARY ── */}
      <PhaseCard index={0} title="Executive Summary" eyebrow="TL;DR" variant="summary">
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

      {/* At-a-glance KPI strip — demo mode only */}
      {analysis && <InsightStrip analysis={analysis} />}

      {/* ── DEFINE ── */}
      <DmaicHeader phase="Define" subtitle="Clarify what problem we are solving and what success looks like" />

      {/* 1. Problem Definition */}
      <PhaseCard index={1} title="Problem Definition" eyebrow="Workflow & Scope">
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

      {/* ── MEASURE ── */}
      <DmaicHeader phase="Measure" subtitle="Quantify the current state, identify the performance gap, and compare to benchmarks" />

      {/* 2. Baseline & KPIs */}
      {analysis ? (
        <PhaseCard index={2} title="Baseline Performance" eyebrow="Current State">
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
      ) : measureBaseline ? (
        <PhaseCard index={2} title="Current State & KPIs" eyebrow="KPIs & Benchmarks">
          <div className="flex flex-col gap-4">
            {/* From your intake — surfaces the user's actual brief data in custom mode */}
            {mode === "custom" && brief && (
              <div className="rounded-lg border border-line bg-surface px-4 py-3">
                <p className="eyebrow mb-2">From your intake brief</p>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-[12px] md:grid-cols-2">
                  {brief.slaConstraint && (
                    <div className="flex flex-col">
                      <dt className="text-ink-muted">SLA / constraint</dt>
                      <dd className="leading-relaxed text-ink">{brief.slaConstraint}</dd>
                    </div>
                  )}
                  {brief.currentStages && brief.currentStages.length > 0 && (
                    <div className="flex flex-col">
                      <dt className="text-ink-muted">Workflow stages ({brief.currentStages.length})</dt>
                      <dd className="leading-relaxed text-ink">{brief.currentStages.join(" → ")}</dd>
                    </div>
                  )}
                  {brief.suspectedStage && (
                    <div className="flex flex-col">
                      <dt className="text-ink-muted">Suspected problem area</dt>
                      <dd className="leading-relaxed text-ink">{brief.suspectedStage}</dd>
                    </div>
                  )}
                  {brief.biggestFrustration && (
                    <div className="flex flex-col">
                      <dt className="text-ink-muted">Biggest frustration</dt>
                      <dd className="leading-relaxed text-ink">{brief.biggestFrustration}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {measureBaseline.currentStateMetrics.map((metric, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border border-line bg-canvas px-4 py-3 text-sm">
                  <span aria-hidden className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <span className="leading-relaxed text-ink">{metric}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="eyebrow text-red-700 mb-1">Performance gap</p>
                <p className="text-sm leading-relaxed text-ink">{measureBaseline.performanceGap}</p>
              </div>
              <div className="rounded-lg border border-line bg-canvas px-4 py-3">
                <p className="eyebrow mb-1">Industry context</p>
                <p className="text-sm leading-relaxed text-ink">{measureBaseline.industryContext}</p>
              </div>
            </div>
            <div className="rounded-lg border border-accent/20 bg-accent-soft px-4 py-3">
              <p className="eyebrow mb-1">Priority metric to move</p>
              <p className="text-sm font-medium leading-relaxed text-ink">{measureBaseline.priorityMetric}</p>
            </div>

            {/* Benchmark sources */}
            {measureBaseline.benchmarkSources && measureBaseline.benchmarkSources.length > 0 && (
              <div className="rounded-lg border border-line bg-canvas px-4 py-3">
                <p className="eyebrow mb-2">
                  Benchmark sources
                  {measureBaseline.benchmarkCategory && (
                    <span className="ml-1.5 font-normal normal-case tracking-normal text-ink-muted">
                      · {measureBaseline.benchmarkCategory}
                    </span>
                  )}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {measureBaseline.benchmarkSources.map((b, i) => (
                    <li key={i} className="text-[12px] leading-relaxed text-ink-soft">
                      <span className="text-ink">{b.metric}:</span>{" "}
                      <span className="font-medium text-ink">{b.figure}</span>{" "}
                      <span className="text-ink-muted">·</span>{" "}
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline-offset-2 hover:underline"
                      >
                        {b.source} ({b.year})
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </PhaseCard>
      ) : null}

      {/* ── ANALYZE ── */}
      <DmaicHeader phase="Analyze" subtitle="Identify the root causes and mechanisms driving failure" />

      {/* 3. Root-Cause Analysis */}
      <PhaseCard index={3} title="Root-Cause Analysis" eyebrow="Causes & Mechanisms">
        <div className="flex flex-col gap-5">
          <div className="rounded-lg border border-line bg-canvas p-4">
            <p className="eyebrow mb-1">Top failure point</p>
            <p className="text-sm leading-relaxed text-ink">{rootCauseAnalysis.topLeakagePoint}</p>
          </div>

          <div>
            <p className="mb-3 eyebrow">Ranked root causes</p>
            <ol className="flex flex-col gap-3">
              {rootCauseAnalysis.rankedCauses.map((c, i) => {
                const det = analysis?.rankedCauses[i];
                return (
                  <li
                    key={c.rank}
                    className="flex gap-3 rounded-lg border border-line bg-surface p-3 text-sm"
                  >
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

          {/* Quantitative comparison bars — demo mode only */}
          {analysis && responseGap !== null && followupGap !== null && (
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
          )}

          {/* Text comparison — general mode */}
          {!analysis && (
            <div className="rounded-lg border border-line bg-canvas p-4">
              <p className="eyebrow mb-1">Key comparison</p>
              <p className="text-sm leading-relaxed text-ink">{rootCauseAnalysis.supportingComparison}</p>
            </div>
          )}

          <div className="rounded-lg border border-line bg-canvas p-4">
            <p className="eyebrow mb-1">Segment insight</p>
            <p className="text-sm leading-relaxed text-ink">{rootCauseAnalysis.segmentInsight}</p>
          </div>

          {analysis && (
            <div>
              <p className="mb-2 eyebrow">Conversion rate by owner</p>
              <OwnerComparisonChart data={analysis.byOwner} baseline={analysis.conversionRate} />
            </div>
          )}
        </div>
      </PhaseCard>

      {/* ── IMPROVE ── */}
      <DmaicHeader phase="Improve" subtitle="Specific changes and the operating procedure to make them stick" />

      {/* 4. Improvement Plan (recommendation + SOP combined) */}
      <PhaseCard index={4} title="Improvement Plan" eyebrow="Action & SOP">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Recommended action</p>
            <div className="rounded-lg border border-accent/20 bg-accent-soft p-4">
              <p className="text-sm font-medium leading-relaxed text-ink">{recommendation.firstAction}</p>
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
          <div className="border-t border-line" />
          <div className="flex flex-col gap-3">
            <div>
              <p className="eyebrow">Standard operating procedure</p>
              <p className="mt-1 text-sm font-semibold text-ink">{workflowSOP.title}</p>
              <p className="mt-0.5 text-sm text-ink-soft">{workflowSOP.objective}</p>
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
                <span className="eyebrow block mb-1">SOP owner</span>
                <p className="leading-relaxed text-ink">{workflowSOP.owner}</p>
              </div>
            </div>
          </div>
        </div>
      </PhaseCard>

      {/* ── CONTROL ── */}
      <DmaicHeader phase="Control" subtitle="Metrics, alerts, and monitoring to keep the improvement in place" />

      {/* 5. Control System (KPIs + alerts + monitoring combined) */}
      <PhaseCard index={5} title="Control System" eyebrow="Metrics, Alerts, Monitoring">
        <div className="flex flex-col gap-6">

          {/* KPIs */}
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Key performance indicators</p>
            {analysis ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <MetricCard label="Conversion rate" value={`${analysis.conversionRate}%`} sub="New lead → booked meeting" highlight />
                <MetricCard label="Median first response" value={`${analysis.medianFirstResponseHours.toFixed(1)}h`} sub="SLA target: 4h" alert={analysis.medianFirstResponseHours > 4} />
                <MetricCard label="Stalled lead rate" value={`${analysis.stalledLeadRate}%`} sub="Alert threshold: 15%" alert={analysis.stalledLeadRate > 15} />
                <div className="flex flex-col gap-1 rounded-xl border border-orange-200 bg-orange-50 px-4 py-4">
                  <span className="eyebrow text-orange-600">Needs attention</span>
                  <span className="mt-1 text-sm font-medium leading-snug text-ink">{controlDashboard.segmentNeedingAttention}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[controlDashboard.primaryMetricLabel, controlDashboard.secondaryMetricLabel, controlDashboard.tertiaryMetricLabel].map((label, i) => (
                  <div key={i} className="flex flex-col gap-1 rounded-xl border border-line bg-canvas px-4 py-4">
                    <span className="text-[13px] font-medium leading-snug text-ink">{label}</span>
                  </div>
                ))}
                <div className="flex flex-col gap-1 rounded-xl border border-orange-200 bg-orange-50 px-4 py-4">
                  <span className="eyebrow text-orange-600">Needs attention</span>
                  <span className="mt-1 text-sm font-medium leading-snug text-ink">{controlDashboard.segmentNeedingAttention}</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-line" />

          {/* Alert rules */}
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Alert &amp; escalation rules</p>
            <ul className="flex flex-col gap-2">
              {alertRules.map((rule, i) => (
                <li key={i} className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${SEVERITY_STYLES[rule.severity]}`}>
                  <span className="mt-0.5 shrink-0 text-[10px] font-bold uppercase tracking-wider">{rule.severity}</span>
                  <div>
                    <p className="font-medium">{rule.trigger}</p>
                    <p className="mt-0.5 opacity-80">Action: {rule.action}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-line" />

          {/* Ongoing monitoring */}
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Ongoing monitoring</p>
            <dl className="flex flex-col gap-3 text-sm">
              {[
                ["Metrics to track", monitoringReport.metrics],
                ["Alert thresholds", monitoringReport.thresholds],
                ["Owner", monitoringReport.owner],
                ["If metrics drift", monitoringReport.responsePlan],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-line pb-3 last:border-0 last:pb-0">
                  <dt className="eyebrow mb-1">{label}</dt>
                  <dd className="leading-relaxed text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

        </div>
      </PhaseCard>

      {/* ── ANALYZE YOUR OWN WORKFLOW CTA ── */}
      {onAnalyzeOwn && mode === "demo" && (
        <div className="rounded-card border border-line bg-surface shadow-card px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[15px] font-semibold text-ink">Want to run this on your own workflow?</p>
            <p className="mt-1 text-[13px] text-ink-soft">Takes about 2 minutes. Describe your process and get a full diagnostic report.</p>
          </div>
          <button
            type="button"
            onClick={onAnalyzeOwn}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-[14px] font-semibold text-white shadow-btn transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Analyze my workflow →
          </button>
        </div>
      )}

    </div>
  );
}

function DmaicHeader({ phase, subtitle }: { phase: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-0.5 pt-4">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-accent">{phase}</span>
        <div className="h-px flex-1 bg-accent/25" />
      </div>
      <p className="text-[12px] text-ink-muted">{subtitle}</p>
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
