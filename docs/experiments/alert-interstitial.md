# Experiment: alert_interstitial

## Hypothesis
Showing the calm-window timing and put-in notes in a floating card over the
deep-linked spot will raise the alert-to-directions rate, because the bare
drawer today drops the exact context ("when" and "where to launch") that made
the push worth opening.

## Flag & variants
- PostHog flag key: `alert-interstitial`
- Variants: `control` (bare drawer, current behavior), `treatment` (floating
  card with window label + notes). `control` is `variants[0]`.

## Exposure
- Exposure event: `experiment_exposed` (`experiment: "alert_interstitial"`).
- A user is exposed only when the treatment card actually renders, i.e. an
  alert-originated open (`from=alert`) with a `window` label to show. The
  component calls `logExposure()` from a `useEffect` inside the rendered
  treatment branch. Analysis is restricted to the exposed cohort.

## Primary metric (exactly one)
- Event: `alert_interstitial_result` with `outcome: "directions"`.
- Definition: rate of `outcome: "directions"` over all `alert_interstitial_result`
  events, per exposed user. Link the query:
  `analytics/queries/experiment_alert_interstitial.sql`.

## Guardrails (must not regress)
- `spot_action` (`action: "directions"`) — the interstitial's own directions
  tap should add to this, not cannibalize the drawer's existing button; total
  directions-from-alert sessions should not fall versus control.
- `spot_sheet_dismissed` rate — the card should not make people bail on the
  drawer faster than they already did on a bare alert open.

## Decision rule
- Minimum runtime: 14 days AND minimum exposed users: 30 per variant (alert
  opt-ins are still low volume; see ROADMAP item 5's funnel re-check).
- Ship treatment if the directions rate improves by >= 5 percentage points
  with no guardrail regression beyond 2 points. Otherwise keep control.

## Result (fill in at the end)
- Exposed users / variant, primary metric per variant, guardrail readings,
  decision, and a one-line note for `analytics/INSTRUMENTATION_CHANGELOG.md` if
  any event changed.
