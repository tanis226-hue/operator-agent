export type ExecutiveSummary = {
  headlineFinding: string;
  whyItMatters: string;
  primaryCause: string;
  recommendedAction: string;
  monitoringPlan: string;
};

export type ProblemDefinition = {
  workflow: string;
  businessProblem: string;
  affectedGroup: string;
  successMetric: string;
  scope: string;
};

export type RootCauseAnalysis = {
  topLeakagePoint: string;
  rankedCauses: Array<{ rank: number; factor: string; finding: string }>;
  supportingComparison: string;
  segmentInsight: string;
};

export type Recommendation = {
  firstAction: string;
  whyThisFirst: string;
  expectedEffect: string;
  owner: string;
};

export type WorkflowSOP = {
  title: string;
  objective: string;
  bullets: string[];
  escalation: string;
  owner: string;
};

export type MonitoringReport = {
  issue: string;
  fix: string;
  metrics: string;
  thresholds: string;
  owner: string;
  responsePlan: string;
};

export type ControlDashboard = {
  primaryMetricLabel: string;
  secondaryMetricLabel: string;
  tertiaryMetricLabel: string;
  segmentNeedingAttention: string;
};

export type AlertRule = {
  trigger: string;
  action: string;
  severity: "warning" | "critical";
};

export type GeneratedOutputPayload = {
  executiveSummary: ExecutiveSummary;
  problemDefinition: ProblemDefinition;
  rootCauseAnalysis: RootCauseAnalysis;
  recommendation: Recommendation;
  workflowSOP: WorkflowSOP;
  monitoringReport: MonitoringReport;
  controlDashboard: ControlDashboard;
  alertRules: AlertRule[];
};
