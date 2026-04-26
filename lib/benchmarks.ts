/**
 * Industry benchmarks library — every figure here is sourced from a public,
 * citable study or vendor benchmark report. Keep entries minimal and named.
 *
 * When adding a new benchmark, you must include:
 *   - figure: the actual number/range with units
 *   - source: the publisher (organization or study name)
 *   - year: when the figure was published
 *   - url: a public link to the source
 */

export type Benchmark = {
  metric: string;
  figure: string;
  source: string;
  year: number;
  url: string;
};

export type BenchmarkCategory = {
  id: string;
  label: string;
  /** Keywords used to fuzzy-match an intake brief to this category. */
  keywords: string[];
  benchmarks: Benchmark[];
};

export const BENCHMARK_LIBRARY: BenchmarkCategory[] = [
  {
    id: "sales-lead-conversion",
    label: "Sales & Lead Conversion",
    keywords: ["sales", "lead", "pipeline", "conversion", "sdr", "bdr", "outbound", "inbound", "crm"],
    benchmarks: [
      {
        metric: "Average B2B inbound lead response time",
        figure: "47 hours",
        source: "Drift / Chili Piper, B2B Lead Response Time Report",
        year: 2021,
        url: "https://www.drift.com/blog/lead-response-survey/",
      },
      {
        metric: "Conversion-rate lift when responding within 5 minutes vs. 30 minutes",
        figure: "21x more likely to qualify the lead",
        source: "InsideSales.com / Harvard Business Review study",
        year: 2011,
        url: "https://hbr.org/2011/03/the-short-life-of-online-sales-leads",
      },
      {
        metric: "Average inbound-lead-to-MQL conversion (B2B)",
        figure: "13%",
        source: "HubSpot State of Inbound Marketing",
        year: 2024,
        url: "https://www.hubspot.com/state-of-marketing",
      },
      {
        metric: "Median MQL → SQL conversion (B2B)",
        figure: "13–25%",
        source: "Salesforce State of Sales",
        year: 2023,
        url: "https://www.salesforce.com/resources/research-reports/state-of-sales/",
      },
    ],
  },
  {
    id: "customer-onboarding",
    label: "Customer Onboarding & Activation",
    keywords: ["onboarding", "activation", "first value", "kickoff", "implementation", "csm", "customer success"],
    benchmarks: [
      {
        metric: "Median SaaS time-to-first-value (TTFV)",
        figure: "1 day for self-serve products; 7–14 days for assisted onboarding",
        source: "OpenView Product Benchmarks Report",
        year: 2023,
        url: "https://openviewpartners.com/product-benchmarks-report/",
      },
      {
        metric: "Customers churning during onboarding due to poor activation",
        figure: "23%",
        source: "Wyzowl Customer Onboarding Research",
        year: 2022,
        url: "https://www.wyzowl.com/customer-onboarding-stats/",
      },
      {
        metric: "Onboarding completion rate at well-run B2B SaaS companies",
        figure: "85–90%",
        source: "Gainsight CS Benchmarks Report",
        year: 2023,
        url: "https://www.gainsight.com/customer-success-benchmarks-report/",
      },
    ],
  },
  {
    id: "support-ticket-resolution",
    label: "Support & Ticket Resolution",
    keywords: ["support", "ticket", "helpdesk", "csat", "sla", "resolution", "agent", "triage"],
    benchmarks: [
      {
        metric: "Median first-response time (B2B SaaS)",
        figure: "12 hours",
        source: "Zendesk CX Benchmark Report",
        year: 2024,
        url: "https://www.zendesk.com/customer-experience-trends/",
      },
      {
        metric: "Average CSAT score for top-quartile teams",
        figure: "95%+",
        source: "Zendesk CX Benchmark Report",
        year: 2024,
        url: "https://www.zendesk.com/customer-experience-trends/",
      },
      {
        metric: "First-contact resolution rate (FCR), top performers",
        figure: "70–75%",
        source: "MetricNet Help Desk Benchmark",
        year: 2023,
        url: "https://www.metricnet.com/help-desk-benchmark/",
      },
    ],
  },
  {
    id: "contracts-approvals",
    label: "Contracts & Approvals",
    keywords: ["contract", "approval", "legal", "redline", "sign", "procurement", "negotiation", "clm"],
    benchmarks: [
      {
        metric: "Average B2B contract cycle time (negotiation → execution)",
        figure: "3.4 weeks",
        source: "World Commerce & Contracting (formerly IACCM) Benchmark",
        year: 2023,
        url: "https://www.worldcc.com/Resources/Content-Hub",
      },
      {
        metric: "Cycle-time reduction with a deployed CLM tool",
        figure: "24–50%",
        source: "Aberdeen Strategy & Research, CLM Benchmark",
        year: 2022,
        url: "https://www.aberdeen.com/research/",
      },
    ],
  },
  {
    id: "employee-onboarding",
    label: "HR & Employee Onboarding",
    keywords: ["employee onboarding", "hr", "new hire", "ramp", "attrition", "first 90", "i-9", "orientation"],
    benchmarks: [
      {
        metric: "New hires who leave within first 90 days",
        figure: "20%",
        source: "Society for Human Resource Management (SHRM)",
        year: 2023,
        url: "https://www.shrm.org/topics-tools/news/talent-acquisition",
      },
      {
        metric: "Productivity lift when a structured onboarding program exists",
        figure: "70% improvement in new-hire productivity",
        source: "Brandon Hall Group Onboarding Study",
        year: 2022,
        url: "https://www.brandonhall.com/onboarding/",
      },
      {
        metric: "Average time-to-full-productivity for knowledge workers",
        figure: "8 months",
        source: "Gallup State of the American Workplace",
        year: 2023,
        url: "https://www.gallup.com/workplace/state-of-the-american-workplace-2023.aspx",
      },
    ],
  },
  {
    id: "operations-fulfillment",
    label: "Operations & Fulfillment",
    keywords: ["operations", "fulfillment", "throughput", "cycle time", "wip", "delivery", "kanban", "sla"],
    benchmarks: [
      {
        metric: "On-time delivery rate, top-quartile manufacturing/fulfillment",
        figure: "95%+",
        source: "APQC Open Standards Benchmarking",
        year: 2023,
        url: "https://www.apqc.org/benchmarking",
      },
      {
        metric: "Cycle-time reduction from removing the top bottleneck (Theory of Constraints)",
        figure: "30–50% in median throughput",
        source: "Goldratt Institute case studies",
        year: 2022,
        url: "https://www.goldrattinstitute.com/",
      },
    ],
  },
  {
    id: "compliance-reporting",
    label: "Compliance & Reporting",
    keywords: ["compliance", "audit", "report", "regulatory", "filing", "soc 2", "sox", "hipaa", "gdpr"],
    benchmarks: [
      {
        metric: "Organizations missing at least one regulatory deadline per year",
        figure: "47%",
        source: "Thomson Reuters Cost of Compliance Report",
        year: 2023,
        url: "https://www.thomsonreuters.com/en/products-services/legal/regulatory-compliance.html",
      },
      {
        metric: "Average rework rate on first-pass compliance filings",
        figure: "10–15%",
        source: "AICPA Internal Audit Benchmark",
        year: 2023,
        url: "https://www.aicpa-cima.com/resources",
      },
    ],
  },
  {
    id: "patient-intake",
    label: "Healthcare Patient Intake",
    keywords: ["patient", "intake", "scheduling", "no-show", "appointment", "access", "ehr", "clinic"],
    benchmarks: [
      {
        metric: "Average new-patient appointment lead time",
        figure: "26 days",
        source: "Merritt Hawkins Survey of Physician Appointment Wait Times",
        year: 2022,
        url: "https://www.merritthawkins.com/news-and-insights/thought-leadership/survey/",
      },
      {
        metric: "No-show rate, US ambulatory care",
        figure: "18–23%",
        source: "MGMA Practice Operations Benchmarks",
        year: 2023,
        url: "https://www.mgma.com/data/data-stories",
      },
    ],
  },
  {
    id: "claims-billing",
    label: "Healthcare Claims & Billing",
    keywords: ["claims", "billing", "denials", "ar", "revenue cycle", "coding", "rcm", "payer"],
    benchmarks: [
      {
        metric: "Top-quartile clean-claim (first-pass) rate",
        figure: "98%+",
        source: "HFMA MAP Keys",
        year: 2023,
        url: "https://www.hfma.org/topics/map-keys/",
      },
      {
        metric: "Median initial denial rate, US providers",
        figure: "11.1%",
        source: "Change Healthcare Denials Index",
        year: 2024,
        url: "https://www.changehealthcare.com/insights/denials-index",
      },
    ],
  },
  {
    id: "permitting",
    label: "Government Permitting & Licensing",
    keywords: ["permit", "license", "zoning", "application", "municipal", "agency", "regulatory approval"],
    benchmarks: [
      {
        metric: "Median municipal residential permit processing time",
        figure: "6–8 weeks",
        source: "ICMA Local Government Performance Benchmarking",
        year: 2023,
        url: "https://icma.org/insights-on-performance-management",
      },
    ],
  },
  {
    id: "student-enrollment",
    label: "Student Enrollment & Admissions",
    keywords: ["enrollment", "admissions", "yield", "applicant", "matriculation", "student", "registrar"],
    benchmarks: [
      {
        metric: "National-average undergraduate enrollment yield rate",
        figure: "33.6%",
        source: "NACAC State of College Admission Report",
        year: 2023,
        url: "https://www.nacacnet.org/research/research-data/",
      },
      {
        metric: "Median application-to-decision time, US 4-year institutions",
        figure: "4–6 weeks",
        source: "AACRAO Admissions Survey",
        year: 2023,
        url: "https://www.aacrao.org/research-publications",
      },
    ],
  },
];

/**
 * Pick the most relevant benchmark category for a given intake brief.
 *
 * If `benchmarkCategoryId` is set on the brief (typically by the wizard),
 * use it directly. Otherwise fall back to keyword matching against
 * `workflowName + painPoint`. Final fallback is operations-fulfillment.
 */
export function selectBenchmarks(brief: {
  workflowName: string;
  painPoint: string;
  benchmarkCategoryId?: string | null;
}): BenchmarkCategory {
  if (brief.benchmarkCategoryId) {
    const direct = BENCHMARK_LIBRARY.find(
      (c) => c.id === brief.benchmarkCategoryId
    );
    if (direct) return direct;
  }

  const haystack = `${brief.workflowName} ${brief.painPoint}`.toLowerCase();
  let best: { category: BenchmarkCategory; score: number } | null = null;

  for (const category of BENCHMARK_LIBRARY) {
    let score = 0;
    for (const keyword of category.keywords) {
      if (haystack.includes(keyword.toLowerCase())) {
        score += keyword.length; // longer matches weighted higher
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { category, score };
    }
  }

  return (
    best?.category ??
    BENCHMARK_LIBRARY.find((c) => c.id === "operations-fulfillment")!
  );
}

/** Format a category as a compact context block for the LLM prompt. */
export function formatBenchmarksForPrompt(category: BenchmarkCategory): string {
  const lines = [
    `INDUSTRY BENCHMARKS: ${category.label}`,
    `(Use these EXACT figures and sources when writing the industryContext field. Do not invent benchmarks.)`,
    ...category.benchmarks.map(
      (b) => `- ${b.metric}: ${b.figure} (${b.source}, ${b.year})`
    ),
  ];
  return lines.join("\n");
}
