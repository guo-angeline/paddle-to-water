<!-- analytics-report -->
# SUP Spots: analytics readout

**Window:** <start> to <end> · **Source:** PostHog project 458289 (US) · **Excludes:** internal ids per `analytics/EXCLUDED_PERSONS.md` · **Generated:** <date>

> Owned by the **data lead**. Fill every metric from a query in `analytics/queries/`.
> No number without a query path. Definitions live in `analytics/GLOSSARY.md`. The
> `<!-- analytics-report -->` marker above triggers archival to `reports/`
> (scripts/save-analytics-report.py). Every metric must clear the data quality gate
> below before it goes in the table, and every sentence must obey confidence
> calibration: say only what the data earns, and "not enough data to conclude" is a
> valid finding.

## Data quality gate (clear every metric before reporting it)
<!-- REQUIRED. Confirm each before a number goes in the Metrics table. -->
- [ ] **Event actually fires** (not just defined in code): string ships in the bundle / emit site reached.
- [ ] **Internal + bot traffic excluded**: filtered the `EXCLUDED_PERSONS.md` ids; note residual bot contamination if any.
- [ ] **Availability vs intent kept separate**: a `_loaded` number is reliability, never "used heavily."
- [ ] **Concentration checked**: report events AND distinct users; if the top 1-2 persons are a large share, say the metric is those people, not a behavior.
- [ ] **Sparsity/window checked**: single-digit counts or a window shorter than the change has been live cannot support a trend. Name the n.

## Instrumentation changes affecting this window
<!-- REQUIRED. Read analytics/INSTRUMENTATION_CHANGELOG.md and list every entry
     whose date falls in or near this window, with its comparability note. If
     none, write "None." A metric jump must be checked against this list BEFORE
     it is attributed to user behavior. -->
- ...

## Metrics
Every row: **Metric → query → value → caveat.**

| Metric | Query | Value | Caveat |
|--------|-------|-------|--------|
| Spot open rate | `queries/spot_open_rate.sql` | ... | bots inflate denominator |
| Conditions availability | `queries/conditions_availability.sql` | ...% | reliability, NOT engagement |
| Conditions engagement | `queries/conditions_engagement.sql` | ...% | dwell-gated; new series from 2026-06-29 |
| Directions conversion | `queries/directions_conversion.sql` | ...% | click, not confirmed outbound |
| Saved conditions engagement | `queries/saved_conditions_engagement.sql` | ...% | new series from 2026-06-29 |
| W1 retention | `queries/retention_w1.sql` | ...% | recent cohorts censored |

## Read
2-4 sentences, calibrated to what the data earns. State what changed, what's
uncertain, and where the data is too sparse, concentrated, or contaminated to
conclude (that is a valid finding, not a gap to paper over). Separate measured
from inferred. Name the confound before any before/after claim (instrumentation
discontinuity, no control arm, layout re-weight). Do not call a metric "loved" or
"used heavily" unless it's an *intent* metric: availability is not engagement. If
a prior report's number turns out contaminated, correct it here out loud.

## Running experiments
For each: experiment, exposed users/variant, primary metric per variant,
guardrail readings, decision. Metrics computed over the `experiment_exposed`
cohort only (`queries/experiment_<slug>.sql`).
