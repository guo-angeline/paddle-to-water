-- Metric: Conditions availability (RELIABILITY, not engagement)
-- Definition: share of spot opens where live conditions loaded without failure.
-- Events: conditions_loaded (system). failed=true means both NOAA + NWS failed.
-- This is the honest home of the old report's "91% of openers saw conditions".
-- Caveat: denominator is conditions_loaded fires (one per spot open), NOT users.
--         Do NOT read this as "people checked conditions" — see conditions_engagement.
SELECT
  count() AS opens_with_fetch,
  countIf(properties.failed = false) AS loaded_ok,
  round(100.0 * countIf(properties.failed = false) / count(), 1) AS availability_pct,
  round(avg(toFloat(properties.latency_ms))) AS avg_latency_ms,
  round(quantile(0.9)(toFloat(properties.latency_ms))) AS p90_latency_ms
FROM events
WHERE event = 'conditions_loaded'
  AND timestamp >= {filters.dateRange.from}
  AND timestamp <  {filters.dateRange.to}
  AND person_id NOT IN ('11a83b86-4d73-565f-8b70-2f2847d865be', '0faaad14-aa87-5cda-a76c-a3f59e0fa4d1', '21e77b69-f479-5130-9696-e386ad7f9aa0', 'f38f6a31-bb18-525d-9d49-8e7194442d2b')  -- EXCLUDED_PERSONS.md: owner + test devices