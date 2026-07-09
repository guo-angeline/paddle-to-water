-- Metric: Alert click-through rate (push sent -> app opened)
-- Definition: app opens from a push (PostHog `alert_clicked`, the from=alert
--             deep link) divided by pushes sent (Supabase `alert_sends`) over
--             the same date range.
-- CROSS-STORE: numerator and denominator live in different systems and share
-- no join key (pushes are anonymous by design). This is an AGGREGATE ratio
-- only, never a per-user funnel. Run both parts for the same range and divide
-- in the report.
--
-- Part 1 of 2 — PostHog (HogQL): opens from a push.
SELECT
  toDate(timestamp) AS day,
  count() AS alert_opens,
  uniq(person_id) AS alert_openers
FROM events
WHERE event = 'alert_clicked'
  AND timestamp >= {filters.dateRange.from}
  AND timestamp <  {filters.dateRange.to}
GROUP BY day
ORDER BY day

-- Part 2 of 2 — Supabase (Postgres, run in the Supabase SQL editor):
--
--   SELECT date_trunc('day', sent_at)::date AS day,
--          count(DISTINCT subscription_id)  AS pushes_sent,
--          count(*)                         AS spot_picks
--   FROM alert_sends
--   WHERE sent_at >= '<from>' AND sent_at < '<to>'
--   GROUP BY 1 ORDER BY 1;
--
-- pushes_sent uses DISTINCT subscription_id because the cron sends at most one
-- batched push per subscription per day; alert_sends rows are per-spot picks
-- inside that one push, so count(*) overstates notifications.
--
-- CTR = alert_opens / pushes_sent. Expect the openers' person_ids NOT to match
-- the persons who opted in: on iOS the open happens in the PWA storage
-- partition under a different distinct_id (see GLOSSARY "Identity").
