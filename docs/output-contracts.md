# Operator Agent Output Contracts

This document defines the exact artifacts the MVP must generate. These contracts are meant to keep the product focused, make Claude Code implementation easier, and ensure the demo stays legible to judges and business users.

## Global Rules

All generated artifacts must be:
- business-friendly
- concise
- specific
- operational, not academic
- consistent with the intake brief, dataset, and process note

The app should prioritize:
1. clarity
2. actionability
3. measurable business value
4. trust through supporting evidence

DMAIC structures the product internally, but the user-facing output should not sound like methodology theater.

Use **Lead Intake and Conversion Bottleneck** consistently as the public workflow label in all user-facing output. Do not swap between alternate workflow names in the live product or demo.

## Metric Hierarchy Rule

Across all outputs:
- **Primary metric:** Conversion rate from new lead to booked meeting
- **Secondary diagnostic metric:** Median time to first follow-up
- all other metrics are supporting diagnostics only

Do not present more than these two metrics as co-equal headlines.

---

## 1) Executive Summary Contract

### Purpose
Give the business owner an immediate answer to:
- what is broken
- why it matters
- what to do next

### Placement
This should be the first output shown after analysis runs.

### Demo rule
The executive summary must be visible above the fold on a typical laptop screen during the demo. This is non-negotiable.

### Required sections
1. **Headline finding**
2. **Business impact**
3. **Primary cause**
4. **Recommended first action**
5. **How success will be monitored**

### Required characteristics
- 120–180 words
- plain English
- no jargon unless unavoidable
- must reference the primary metric
- must name the dominant leakage point
- must recommend one first action

### Example structure
- Conversion from new lead to booked meeting is underperforming because too many leads are receiving delayed or inconsistent follow-up before a meeting is scheduled.
- The largest leakage is occurring between first response and qualification / scheduling.
- Leads with slow first response and missed follow-up convert materially worse than leads handled within SLA.
- The best first fix is to enforce a first-response SLA and require an explicit next step for every qualified lead.
- Performance should be monitored using conversion rate, median time to first follow-up, and stalled lead rate.

### Do not
- dump all findings
- sound like a consultant report
- repeat raw tables
- talk about the model or orchestration

---

## 2) Define Output Contract

### Purpose
Frame the operational problem clearly.

### Output title
`Problem Definition`

### Required fields
- workflow name
- business problem statement
- affected user/team
- success metric
- scope boundary

### Length
75–120 words or a compact card with labels.

### Required content
Must explain:
- what the workflow is supposed to accomplish
- what is going wrong
- what outcome matters most

### Example structure
- **Workflow:** Lead Intake and Conversion Bottleneck
- **Problem:** Too many leads stall or drop before booked meeting due to delayed or inconsistent follow-up.
- **Affected group:** Intake, sales, or business-development owners.
- **Success metric:** Conversion rate from new lead to booked meeting.
- **Scope:** Lead intake through booked meeting only.

---

## 3) Measure Output Contract

### Purpose
Establish the baseline.

### Output title
`Baseline Performance`

### Required components
- primary metric value
- secondary metric value
- one sentence interpreting the baseline
- one chart

### Required metrics
- **Primary:** conversion rate from new lead to booked meeting
- **Secondary:** median time to first follow-up

### Supporting metrics allowed
- stalled lead rate
- stage drop-off rate
- missed follow-up rate

### Chart options
Use one of:
- funnel chart
- stage drop-off chart
- bar chart of conversion by segment
- aging chart

### Interpretation requirement
One sentence only, for example:
“Baseline conversion is being suppressed by slow follow-up and a high share of stalled leads before booked meeting.”

### Do not
- show more than 3 KPI cards in the first measure view
- overload the user with every metric available

---

## 4) Analyze Output Contract

### Purpose
Show where the workflow is leaking and why.

### Output title
`Root-Cause Analysis`

### Required components
1. **Top leakage point**
2. **Ranked likely causes**
3. **One supporting comparison**
4. **One segmentation insight**

### Required ranked cause format
Provide 3 ranked items max:
1. dominant cause
2. secondary contributor
3. tertiary contributor (optional)

### Required supporting comparison examples
Use one:
- conversion with timely vs delayed first response
- conversion with vs without missed follow-up
- stalled rate by owner
- drop-off by stage

### Required language
Use terms like:
- “largest leakage point”
- “strongest operational signal”
- “most likely driver”
- “secondary contributor”

Avoid claiming causality beyond what the data supports.

### Example top finding
“The largest leakage point is between first response and booked meeting, where leads with delayed or inconsistent follow-up convert significantly worse than leads contacted within SLA.”

### Do not
- present more than 3 ranked causes
- claim advanced statistical certainty
- bury the headline

---

## 5) Improve Output Contract

### Purpose
Turn diagnosis into action.

### Output titles
- `Recommended Fix`
- `Workflow Rule / SOP Update`

### A. Recommendation contract

#### Required components
- one recommended first action
- why this action is highest impact
- expected operational effect
- who should own implementation

#### Length
80–140 words

#### Example structure
“The first change should be enforcing a 4-business-hour first-response SLA and requiring a next-step update on every qualified lead. This addresses the strongest driver of drop-off in the current workflow: slow and inconsistent follow-up. Ownership should sit with the intake or pipeline manager, with team-level review each week.”

### B. Workflow Rule / SOP contract

#### Required format
A compact operational rule set with:
- rule title
- objective
- required actions
- escalation trigger
- owner

#### Length
5–8 bullets max

#### Example rule content
- New leads must receive first response within 4 business hours.
- Every qualified lead must have a next step logged before end of day.
- Leads with no touch in 48 hours escalate to the team lead.
- High-value leads may not remain untouched past SLA.

### Stretch contract: Code patch / PR
Not required for MVP. If implemented later, it must:
- reflect the operational rule directly
- enforce a real workflow behavior
- be clearly secondary to the recommendation and SOP

---

## 6) Control Output Contract

### Purpose
Make the fix durable.

### Output titles
- `Control Dashboard`
- `Alert Logic`
- `Monitoring Report`

### A. Control Dashboard contract

#### Required elements
- primary metric
- secondary metric
- stalled lead rate
- one segment currently needing attention

#### Display style
Compact KPI cards plus one small trend or segment chart.

### B. Alert Logic contract

#### Required format
A list of 3–5 alert rules.

#### Required rule types
At least:
- SLA breach rule
- stall/escalation rule
- performance drift rule

#### Example rules
- Alert if median first-response time exceeds 4 business hours for 2 consecutive days.
- Alert if stalled lead rate exceeds 15% in the active pipeline.
- Alert if conversion from new lead to booked meeting falls below target for the week.
- Alert if any high-value lead remains untouched for more than 1 business day.

### C. Monitoring Report contract

#### Purpose
Summarize what changed and how to keep it from slipping.

#### Required sections
1. issue identified
2. fix selected
3. metrics to monitor
4. thresholds
5. owner
6. response plan if drift occurs

#### Length
150–250 words

#### Tone
Practical, operational, accountable

---

## 7) Output Ordering Contract

The user should see outputs in this order:

1. Executive Summary
2. Problem Definition
3. Baseline Performance
4. Root-Cause Analysis
5. Recommended Fix
6. Workflow Rule / SOP Update
7. Control Dashboard
8. Alert Logic
9. Monitoring Report

If the UI becomes crowded, preserve this order and trim detail from lower-priority sections before trimming the executive summary or recommendation.

---

## 8) Formatting Contract

### Tone
- business-owner friendly
- direct
- not hypey
- not overly technical

### Style
- use short paragraphs
- use bullets where operationally useful
- avoid giant text walls
- keep cards self-contained

### Forbidden patterns
Do not:
- say “the AI believes”
- say “using DMAIC we have determined”
- overuse the words autonomous, agentic, orchestration, or framework
- expose chain-of-thought style reasoning

---

## 9) Deterministic vs Generated Contract

### Deterministic code owns
- metric values
- funnel/stage math
- segmentation calculations
- ranked breakdown tables
- threshold evaluation

### Model-generated text owns
- executive summary
- define statement wording
- diagnosis narrative
- recommendation language
- SOP wording
- monitoring report narrative

All generated writing must be grounded in deterministic outputs.
