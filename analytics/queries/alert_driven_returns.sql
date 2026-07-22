-- Metric: Alert-driven returns (the retention person-id metrics can't see)
-- Definition: unique users per day who opened the app from a push
--             (`alert_clicked`), alongside DAU for context.
-- Why this exists: person-based retention (retention_w1.sql) undercounts the
-- alert loop's wins. An iOS user who saves in Safari, installs the PWA, and
-- returns via a push is TWO distinct person_ids (separate storage partition),
-- i.e. two "one-and-done" users. Counting the return events themselves is
-- identity-split-proof, so this series is the honest success measure for the
-- conditions-alert retention loop. Segment other metrics by the
-- `display_mode` super property for the same reason.
SELECT
  toDate(timestamp) AS day,
  uniq(person_id) AS dau,
  uniqIf(person_id, event = 'alert_clicked') AS alert_return_users,
  round(100.0 * uniqIf(person_id, event = 'alert_clicked') / uniq(person_id), 1) AS pct_of_dau
FROM events
WHERE timestamp >= {filters.dateRange.from}
  AND timestamp <  {filters.dateRange.to}
  AND person_id NOT IN ('11a83b86-4d73-565f-8b70-2f2847d865be', '0faaad14-aa87-5cda-a76c-a3f59e0fa4d1', '21e77b69-f479-5130-9696-e386ad7f9aa0', 'f38f6a31-bb18-525d-9d49-8e7194442d2b')  -- EXCLUDED_PERSONS.md: owner + test devices
GROUP BY day
ORDER BY day
