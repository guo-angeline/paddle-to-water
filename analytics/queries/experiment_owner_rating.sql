-- Metric: owner_rating experiment readout (primary + the region segment that decides it)
-- Definition: per variant, exposed users, spot_action among exposed, and the
--             action rate (any spot_action over exposed users). Segmented by
--             region, because the pooled number is known in advance to be flat.
-- Events: experiment_exposed (intent, experiment="owner_rating", both arms),
--         spot_action (intent, any action). Both carry `region`; spot_action
--         also carries owner_rating (value or null) and owner_rating_shown.
--
-- Caveats:
--   * Events exist only from 2026-07-16 (see INSTRUMENTATION_CHANGELOG.md).
--     `owner_rating` / `owner_rating_shown` are ABSENT before that date, so
--     filter on presence, not on value, when windowing across it.
--   * Exposure requires the rating to actually RENDER, so it fires only on the
--     118 rated spots and only in treatment... BUT control users are exposed at
--     the same trigger via the same gate returning false. Read
--     docs/experiments/owner-rating.md before assuming control is a clean
--     counterfactual: a control user who only opens UNRATED spots is correctly
--     never exposed, so both arms are conditioned on opening a rated spot.
--   * owner_rating IS NULL means an unrated SPOT (24 of 142 are deliberately
--     blank), not an unrated arm. Never coerce it to 0: that would read as a
--     0-of-5 verdict on a spot we simply have no opinion about. Use
--     owner_rating_shown to separate arm/render from data absence.
--   * Population of one. This is the owner's personal rating, not an aggregate
--     and not a user rating. Do not report it as "average rating".
--
-- READ THIS BEFORE REPORTING (reports/paddle-score-owner-ratings-2026-07-16.md):
--   The ratings only discriminate in the North Bay (n=46, spread 1.9 against the
--   pre-committed 1.5 threshold). All 29 East Bay ratings sit inside a 0.4-wide
--   band, so treatment there shows a near-constant number and is close to a null
--   treatment. A FLAT POOLED RESULT IS THE PREDICTED OUTCOME, NOT A FINDING.
--   The region breakdown below is the read; the pooled row is context only.
--   The owner directed the full 118-spot ship on 2026-07-16 with this analysis
--   in hand, so the flat East Bay was known before launch.
--
-- Decision rule: 28 days AND >=300 exposed per variant for the POOLED read
--   (docs/experiments/owner-rating.md). The North-Bay-only segment needs the
--   same 300/arm and will take considerably longer to get there. Low traffic
--   means a longer window, not an earlier read (cf. D2, 2026-07-07).
SELECT
  properties.variant AS variant,
  ifNull(properties.region, '(unknown)') AS region,
  uniqIf(person_id, event = 'experiment_exposed'
                    AND properties.experiment = 'owner_rating') AS exposed_users,
  uniqIf(person_id, event = 'spot_action') AS acting_users,
  round(100.0 * uniqIf(person_id, event = 'spot_action')
              / greatest(uniqIf(person_id, event = 'experiment_exposed'
                       AND properties.experiment = 'owner_rating'), 1), 1)
    AS action_rate_pct,
  -- Diagnostic: the actual hypothesis. Do people act more on higher-rated
  -- spots? Treatment-only rows where the rating was really on screen.
  round(avgIf(toFloat64OrNull(toString(properties.owner_rating)),
              event = 'spot_action'
              AND properties.owner_rating_shown = true), 2) AS avg_rating_acted_on
FROM events
WHERE event IN ('experiment_exposed', 'spot_action')
  AND timestamp >= {filters.dateRange.from}
  AND timestamp <  {filters.dateRange.to}
  -- Owner/internal devices dominate low-frequency signals. See
  -- analytics/EXCLUDED_PERSONS.md; this list is the analysis-side backstop.
  AND person_id NOT IN (
    '11a83b86-4d73-565f-8b70-2f2847d865be',
    '0faaad14-aa87-5cda-a76c-a3f59e0fa4d1',
    '21e77b69-f479-5130-9696-e386ad7f9aa0',
    'f38f6a31-bb18-525d-9d49-8e7194442d2b'
  )
GROUP BY variant, region
ORDER BY variant, exposed_users DESC
