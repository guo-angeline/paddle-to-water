-- Metric: Subscription-token leak into PostHog ($current_url carrying t=<token>)
-- Definition: per day, how many PostHog events (and distinct person_ids)
--             recorded a $current_url containing the `t` query param, the
--             email-alert subscription token that lib/email/templates.ts
--             builds into the from=email return link. Item 47 required
--             action 2 strips `t` via history.replaceState after the open
--             ping fires; this query is both the pre-fix leak sizer and the
--             post-fix verification.
-- Events: any event (autocapture/pageview included) whose $current_url
--         matches the leak pattern, plus email_alert_opened as the forward
--         denominator (see Caveat 2).
-- Owner-INCLUSIVE, deliberately: this query does NOT apply the
--         analytics/EXCLUDED_PERSONS.md owner exclusion. The owner is
--         currently the only confirmed email subscriber (see
--         EXCLUDED_PERSONS.md "Excluded email addresses"), so excluding his
--         person_id would filter out the entire leak and always report zero.
--         Do not "fix" this by adding the owner-exclusion clause used
--         elsewhere in analytics/queries/: it would defeat the query.
-- Caveat 1: the pattern is anchored on the query-param delimiter, `&t=` or
--         `?t=`, not the bare substring `t=`. A bare `%t=%` was tried first
--         and rejected: it also matches `spot=` (spot=65 contains `t=`) and
--         `pt=` (the technique-tip index, item 41), both of which ride the
--         exact from=email links this query exists to check, so it defeated
--         both uses below (a from=email pageview always matched, so a zero
--         forward result could never be reached even after the strip
--         landed, and the backward count was dominated by ordinary spot=
--         traffic that carries no token at all). Anchoring on `&t=`/`?t=`
--         rejects both false positives while still matching every place `t`
--         actually appears as its own param, including the standalone
--         unsubscribe link (/api/email/unsubscribe?t=..., where `t` is the
--         first param, hence the `?t=` half of the pattern). Residual risk
--         is now small (a future param whose name ends in the single letter
--         `t` immediately after `&` or `?`), so a non-zero result still
--         deserves a quick eyeball of the matching URLs, but a zero result
--         is conclusive and, unlike the bare pattern, actually achievable
--         once the strip is deployed.
-- Caveat 2: two uses.
--   (1) Run BACKWARDS (dateRange spanning before the item-47 deploy, e.g.
--       2026-07-10 to today) to size the historical leak. That count is the
--       input to the decision on whether the leaked tokens must be rotated.
--   (2) Run FORWARD from the item-47 deploy timestamp. leaked_events must be
--       0, verifying the history.replaceState strip landed. A zero forward
--       result is only meaningful once at least one from=email return has
--       happened post-deploy, so email_alert_opened_count is included in the
--       same SELECT as that denominator: 0 leaked events against 0 opens
--       proves nothing, 0 leaked events against a non-zero open count is the
--       real verification.
SELECT
  toDate(timestamp) AS day,
  countIf(properties.$current_url LIKE '%&t=%' OR properties.$current_url LIKE '%?t=%') AS leaked_events,
  uniqIf(person_id, properties.$current_url LIKE '%&t=%' OR properties.$current_url LIKE '%?t=%') AS leaked_person_ids,
  countIf(event = 'email_alert_opened') AS email_alert_opened_count
FROM events
WHERE timestamp >= {filters.dateRange.from}
  AND timestamp <  {filters.dateRange.to}
GROUP BY day
ORDER BY day
