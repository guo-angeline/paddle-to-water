-- Metric: Spot open rate (top-of-funnel)
-- Definition: unique users who opened >=1 spot / unique users who loaded a page.
-- Events: spot_viewed (intent), $pageview (autocapture).
-- Caveat: $pageview users is the closest "landed" proxy; bots/internal traffic
--         inflate it until a before_send filter is added (see ROADMAP / gaps).
SELECT
  uniqIf(person_id, event = '$pageview') AS landed,
  uniqIf(person_id, event = 'spot_viewed') AS openers,
  round(100.0 * uniqIf(person_id, event = 'spot_viewed')
              / uniqIf(person_id, event = '$pageview'), 1) AS open_rate_pct
FROM events
WHERE event IN ('$pageview', 'spot_viewed')
  AND timestamp >= {filters.dateRange.from}
  AND timestamp <  {filters.dateRange.to}
  AND person_id NOT IN ('11a83b86-4d73-565f-8b70-2f2847d865be', '0faaad14-aa87-5cda-a76c-a3f59e0fa4d1', '21e77b69-f479-5130-9696-e386ad7f9aa0', 'f38f6a31-bb18-525d-9d49-8e7194442d2b')  -- EXCLUDED_PERSONS.md: owner + test devices