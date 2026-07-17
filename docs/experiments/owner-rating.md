# Experiment: owner_rating

Item 39. Ships the owner's 118 hand-entered spot ratings into the spot drawer.

## Hypothesis

Showing the owner's own 1-5 rating of the paddle will raise `spot_action` (directions / share / photos) among exposed users, because a paddler choosing between spots currently has no signal about which is actually worth going to, only logistics and conditions.

## Flag & variants

- PostHog flag key: `owner-rating`
- Variants: `control` (nothing renders, as today), `treatment` (rating line renders under the spot title). `control` is `variants[0]`.

## Exposure

- Exposure event: `experiment_exposed` (`experiment: "owner_rating"`).
- Fires from a `useEffect` gated on `showOwnerRating` in `components/SpotDrawer.tsx`, which requires flags ready **and** `treatment` **and** the spot actually carrying a rating.
- **24 of 142 spots are deliberately unrated.** A bucketed user who only ever opens unrated spots renders nothing and is correctly never exposed. Do not analyse on bucketing.

## Primary metric (exactly one)

- Event: `spot_action` (any `action`), per exposed user.
- `spot_action` now carries `owner_rating` (the value, or `null`) and `owner_rating_shown` (bool), so the readout can test the actual hypothesis (do people act more on higher-rated spots?) without joining back to `spots.json`.
- Query: `analytics/queries/experiment_owner_rating.sql`.

## Guardrails (must not regress)

- `conditions_loaded`: availability of the differentiator must be untouched; this change is pure render.
- `spot_sheet_dismissed`: bounce proxy. A rating that reads as a downgrade ("only 3.8, skip it") could plausibly *raise* dismissals, which is a real risk of this feature, not a bug in the test.

## Decision rule

- Minimum runtime: **28 days** AND minimum exposed users: **300 per variant**.
- Ship treatment if `spot_action` per exposed user improves by ≥ 10% with no guardrail regression beyond 5%. Otherwise keep control.

## Read this before analysing: the pooled result is predicted to be flat

Full analysis: `reports/paddle-score-owner-ratings-2026-07-16.md`.

The ratings only discriminate in one region. Within-region spread against the pre-committed 1.5 threshold from `docs/specs/item-39-paddle-score.md` §4.1:

| region | n | spread | |
|---|---|---|---|
| North Bay | 46 | 1.9 | **PASS** |
| East Bay | 29 | **0.4** | FAIL |
| Sierra Nevada | 8 | 1.3 | FAIL |
| all others | ≤7 each | n/a | n too thin to judge |
| **pooled** | **118** | **2.0** | PASS, but see below |

The pooled 2.0 is an artifact of averaging regions with different means. It does not survive decomposition.

**Consequences for the readout, all three of which must be honoured:**

1. **Segment by region before concluding anything.** A flat pooled result is the *predicted* outcome and is not evidence the idea failed. The only region where the field carries enough information to plausibly move behavior is the North Bay.
2. **The East Bay arm is close to a null treatment.** All 29 East Bay ratings sit inside a 0.4-wide band (3.8-4.2). Treatment there shows a number that is nearly constant across every spot a user compares. If East Bay traffic dominates the sample, the experiment is substantially measuring nothing, and it will read as "no effect" regardless of whether the idea is good.
3. **Power.** This app's traffic is low (see D2, 2026-07-07: two experiments were recalibrated for exactly this). 300 exposed per variant is the floor for the *pooled* read; a North-Bay-only segment will take considerably longer to reach it. Low traffic means a longer read window, not an excuse to read early.

**The owner directed the full 118-spot ship on 2026-07-16 after reading the analysis.** That is recorded so a later analyst does not mistake the flat East Bay for a discovery: it was known and predicted before launch.

## Result (fill in at the end)

- Exposed users / variant, primary metric per variant, guardrail readings, decision, and a one-line note for `analytics/INSTRUMENTATION_CHANGELOG.md` if any event changed.
- **Report both the pooled and the North-Bay-only read.** Reporting only the pooled number would bury the one segment the feature was ever likely to work in.
