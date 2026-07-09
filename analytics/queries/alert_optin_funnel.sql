-- Metric: Alert opt-in funnel (the retention loop's enrollment)
-- Definition: of users shown the alerts prompt (appears after first save),
--             how many attempted opt-in, the outcome split, and how many
--             ended up with a working subscription.
-- Events: alert_optin_shown (intent), alert_optin_result (intent, `result`),
--         alert_subscribe_failed (system).
-- Caveat: subscribe SUCCESS is silent by design, so net_enabled approximates
--         it as granted users minus users with any subscribe failure. A user
--         who failed once and succeeded on retry still counts as failed here;
--         read net_enabled as a floor. Pushes actually sent live in Supabase
--         (see alert_ctr.sql), not PostHog.
SELECT
  uniqIf(person_id, event = 'alert_optin_shown') AS shown,
  uniqIf(person_id, event = 'alert_optin_result') AS attempted,
  uniqIf(person_id, event = 'alert_optin_result' AND properties.result = 'granted') AS granted,
  uniqIf(person_id, event = 'alert_optin_result' AND properties.result = 'denied') AS denied,
  uniqIf(person_id, event = 'alert_optin_result' AND properties.result = 'unsupported') AS unsupported,
  uniqIf(person_id, event = 'alert_subscribe_failed') AS subscribe_failed,
  uniqIf(person_id, event = 'alert_optin_result' AND properties.result = 'granted')
    - uniqIf(person_id, event = 'alert_subscribe_failed') AS net_enabled,
  round(100.0 * uniqIf(person_id, event = 'alert_optin_result' AND properties.result = 'granted')
              / uniqIf(person_id, event = 'alert_optin_shown'), 1) AS optin_rate_pct
FROM events
WHERE event IN ('alert_optin_shown', 'alert_optin_result', 'alert_subscribe_failed')
  AND timestamp >= {filters.dateRange.from}
  AND timestamp <  {filters.dateRange.to}
