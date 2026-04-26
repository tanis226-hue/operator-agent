# Operator Agent Demo Script

> **Naming note.** Internal codename is `operator-agent`; the live product is **OpsAdvisor**. The demo script below targets the active demo (Lead Intake and Conversion Bottleneck). For an up-to-date overview of all three entry paths (active demo, preset cases, custom diagnosis), see [`current-state-and-purpose.md`](current-state-and-purpose.md).

This script is designed for a 3-minute hackathon demo.

## Demo Objective

Show that Operator Agent can take a real revenue-adjacent workflow problem, identify where leads are leaking out of the pipeline, recommend a credible fix, and leave behind controls to make the improvement stick.

---

## 1) Opening (0:00–0:20)

### What to say
“Business owners often know leads are leaking somewhere in the pipeline, but they cannot clearly see where the process is breaking down, what is driving the loss, or what change would recover the most revenue. Operator Agent is built to do that diagnosis and improvement work clearly and quickly.”

### What to show
- landing screen
- short intake brief already pre-filled

---

## 2) Context Intake (0:20–0:40)

### What to say
“For this demo, the workflow is Lead Intake and Conversion Bottleneck. The pain point is simple: too many leads are stalling or dropping before booked meeting, and leadership wants to know what to fix first.”

### What to show
Highlight:
- workflow name
- pain point
- success metric
- response-time SLA
- current stages

Do not linger. The intake exists to ground the analysis.

---

## 3) Run Analysis (0:40–1:00)

### What to say
“Now the product takes the business brief, a synthetic pipeline dataset, and a short process note, then produces a diagnosis, a fix, and a control package.”

### What to show
- click **Run Analysis**
- loading state
- phase cards appearing or results populating

---

## 4) Executive Summary + Baseline (1:00–1:35)

### What to say
“The headline is that conversion from new lead to booked meeting is underperforming because follow-up is too slow and too inconsistent. The secondary diagnostic metric shows median first-response time is above the intended SLA.”

### What to show
- executive summary card
- primary metric card
- secondary metric card
- stage drop-off or funnel chart

Make the viewer understand the problem in one glance.

---

## 5) Root-Cause Analysis (1:35–2:05)

### What to say
“The agent identifies the main leakage point before booked meeting and ranks the most likely drivers. The strongest signal is delayed first response combined with missed follow-up. There may also be owner-level variance and some handoff friction, but those are secondary.”

### What to show
- ranked causes section
- supporting comparison chart
- segmented breakdown by owner or source

Keep the narrative tight: one dominant cause, one or two secondary contributors.

---

## 6) Improve Output (2:05–2:30)

### What to say
“Instead of stopping at diagnosis, the agent recommends the first operational change to make and drafts a workflow rule the team can adopt immediately.”

### What to show
- recommendation card
- generated SOP/workflow rule

Emphasize:
- 4-hour first-response SLA
- required next-step logging
- escalation after 48 hours
- protection for high-value leads

---

## 7) Control Package (2:30–2:50)

### What to say
“The last step is control. The agent leaves behind the monitoring layer needed to make sure the fix does not decay.”

### What to show
- control dashboard summary
- alert rules
- monitoring report

Highlight:
- who owns the metric
- what threshold triggers action
- what should happen next if performance drifts

---

## 8) Close (2:50–3:00)

### What to say
“This is not just an AI analysis demo. It is an agent that takes a real workflow problem, identifies the biggest source of revenue leakage, recommends a fix, and leaves behind controls a business can actually use.”

### Final impression to leave
- clear problem
- credible diagnosis
- actionable fix
- durable control

---

## Demo Rules

- do not narrate every phase as “DMAIC”
- keep “Lead Intake and Conversion Bottleneck” as the only workflow label shown or spoken in the live demo
- keep the executive summary visible before discussing charts
- show business value before methodology
- keep the story centered on one dominant failure mode
- avoid deep technical explanations unless asked
- spend most of the time on diagnosis, fix, and control
