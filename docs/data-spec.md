# Operator Agent Data Specification

This document defines the synthetic dataset and process note used by the MVP.

## 1) Dataset Overview

### Public workflow label
When this dataset is referenced in the live product or demo, use **Lead Intake and Conversion Bottleneck** as the workflow label.


### File name
`data/acquisition_pipeline_cases.csv`

### Purpose
The dataset must support:
- workflow reconstruction
- baseline measurement
- stage leakage analysis
- segmented operational diagnosis
- recommendation generation
- control logic generation

### Row count target
**120 rows**

That is large enough to feel real and small enough to inspect, explain, and demo.

---

## 2) Workflow Model

The dataset represents a simplified lead-handling workflow with the following lifecycle logic:

1. lead created
2. first response attempted
3. lead qualifies or remains unqualified
4. lead progresses toward booked meeting or stalls
5. lead converts, is lost, or remains stalled

The dataset is not trying to simulate a full CRM. It only needs enough structure to support the demo’s diagnosis and improvement story.

---

## 3) Final Column List

Use these columns in the CSV.

### Required columns

#### `lead_id`
- type: string
- format: `L-001` style identifier
- uniqueness: unique per row

#### `lead_source`
- type: categorical string
- allowed values:
  - Website
  - Referral
  - Ads
  - Partner
- purpose: source-based segmentation

#### `owner`
- type: categorical string
- allowed values:
  - Alex
  - Jordan
  - Casey
  - Taylor
- purpose: owner-based performance analysis

#### `created_date`
- type: date
- format: `YYYY-MM-DD`
- purpose: baseline and trend analysis

#### `first_response_hours`
- type: numeric
- range: 0.5 to 72
- purpose: operational response speed metric

#### `current_stage`
- type: categorical string
- allowed values:
  - New Lead
  - Contacted
  - Qualified
  - Meeting Scheduled
  - Lost
- purpose: stage leakage analysis

#### `days_in_stage`
- type: integer
- range: 0 to 30
- purpose: aging/stall detection

#### `missed_followup_flag`
- type: boolean
- allowed values: `true`, `false`
- purpose: dominant root-cause signal

#### `missing_info_flag`
- type: boolean
- allowed values: `true`, `false`
- purpose: secondary diagnostic factor

#### `handoff_count`
- type: integer
- allowed values: 0, 1, 2, 3
- purpose: tertiary diagnostic factor

#### `conversion_outcome`
- type: categorical string
- allowed values:
  - booked_meeting
  - stalled
  - lost
- purpose: primary outcome calculation

#### `estimated_deal_value`
- type: integer
- range: 500 to 20000
- purpose: business-value framing and high-value lead logic

#### `is_stalled`
- type: boolean
- allowed values: `true`, `false`
- purpose: direct monitoring/control logic

### Optional columns

#### `industry`
- type: categorical string
- allowed values:
  - Legal
  - Healthcare
  - Construction
  - Professional Services

#### `region`
- type: categorical string
- allowed values:
  - Northeast
  - South
  - Midwest
  - West

#### `priority`
- type: categorical string
- allowed values:
  - Low
  - Medium
  - High

---

## 4) Hidden Signal Design

The synthetic data must encode one dominant truth:

**Leads with slow first response and missed follow-up convert materially worse than leads with timely, consistent follow-up.**

This must be visible enough that the app can discover and explain it confidently.

### Dominant pattern requirements
- leads with `first_response_hours <= 4` should convert best
- leads with `first_response_hours > 24` should convert much worse
- leads with `missed_followup_flag = true` should have substantially higher stall/loss rates
- leads with both slow response and missed follow-up should perform worst

### Secondary pattern requirements
Use these only to add realism, not to overpower the main signal.

- one owner should underperform modestly, especially on response time
- one lead source should have slightly lower conversion
- `handoff_count >= 2` should modestly increase stall probability
- `missing_info_flag = true` should create a small but believable drag on conversion

### Important rule
The dataset should not suggest that every problem is caused by every factor. One dominant diagnosis must remain obvious.

---

## 5) Recommended Distribution Targets

These are approximate targets, not rigid rules.

### Lead source distribution
- Website: 35%
- Referral: 25%
- Ads: 25%
- Partner: 15%

### Outcome distribution
- booked_meeting: 40–50%
- stalled: 20–30%
- lost: 25–35%

### Missed follow-up distribution
- true: 25–35%
- false: 65–75%

### Missing info distribution
- true: 15–25%
- false: 75–85%

### Handoff distribution
- 0: most common
- 1: common
- 2: less common
- 3: rare

---

## 6) Stage Logic Rules

The dataset should follow these business rules:

- `booked_meeting` rows should usually have `current_stage = Meeting Scheduled`
- `lost` rows should usually have `current_stage = Lost`
- `stalled` rows should usually be in `Contacted` or `Qualified`
- higher `days_in_stage` should increase the chance that `is_stalled = true`
- leads with `is_stalled = true` should rarely have `conversion_outcome = booked_meeting`

These rules improve realism and make the analysis easier to explain.

---

## 7) Example Operational Signals to Preserve

The final generated data should support findings like these:

- leads receiving first response after 24 hours convert significantly worse than those contacted within 4 hours
- leads with missed follow-up are much more likely to stall before booked meeting
- one owner has a slower response pattern and lower conversion
- handoffs add friction, but are not the main story
- high-value leads are still being lost when response and follow-up discipline break down

The app does not need to claim causality with certainty. It does need the dataset to support strong operational inference.

---

## 8) Sample Generation Guidelines

If using code to generate the CSV:

- use a fixed random seed for reproducibility
- keep date ranges within a recent 60-day window
- keep categorical values human-readable
- generate enough variation to avoid looking synthetic at a glance
- sanity-check conversion rates after generation

### Recommended generation approach
1. assign source, owner, and deal value
2. generate response-time bands
3. generate follow-up and info flags
4. derive stall/loss/meeting outcome probabilities
5. derive current stage and days in stage

---

## 9) Process Note Specification

### File name
`data/process_note.md`

### Purpose
Provide intended-state rules the agent can compare against observed behavior.

### Required contents
The process note should state that:
- new leads should receive first response within 4 business hours
- qualified leads should have a documented next step before end of day
- untouched leads should be escalated after 48 hours
- high-value leads should never remain idle for more than 1 business day
- lead ownership should remain clear throughout the workflow

### Tone
Short, operational, practical

### Length
150–250 words

---

## 10) Minimum Data Quality Checks

Before using the CSV in the app, confirm:
- no missing `lead_id`
- no impossible negative response times
- no impossible stage/outcome mismatches
- outcome distribution looks believable
- main signal is still dominant after generation
- at least one owner and one source show meaningful variation

---

## 11) Final Data Design Principle

The synthetic data is not a generic sample table.

It is a purpose-built evidence set designed to let Operator Agent discover, explain, and act on one believable revenue-adjacent operational problem.
