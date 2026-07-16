# Experiment: spot_sheet_full_height

## Hypothesis
Opening the mobile spot sheet at full height (instead of the 0.58vh peek) for
every spot open will raise bottom-of-funnel CTA taps (`spot_action`), because
today's peek height truncates the conditions view and hides the Watch/Share/
Directions/Photos row until the user discovers the drag handle, exactly the
defect item 9 already found and fixed for shared-link arrivals only.

## Flag & variants
- PostHog flag key: `spot-sheet-full-height`
- Variants: `control` (today's behavior: mobile sheet opens at the 0.58vh
  peek for every open except a shared-link arrival, which is item 9's
  unconditional, flagless full-height open), `treatment` (every mobile spot
  open, other than an alert or email deep-link arrival, opens at the 0.92vh
  full height, same as item 9's share treatment). `control` is `variants[0]`.
- Desktop renders the unchanged, persistent, always-fully-visible sidebar in
  both variants; this experiment is mobile-only.
- **Item 9's `from=share` open stays exactly as shipped: unconditional, not
  flag-gated.** Both arms already force it expanded, so a share arrival is
  excluded from this experiment's exposed cohort (no counterfactual there).
- **Alert (`from=alert`) and email (`from=email`) arrivals are excluded from
  BOTH arms**, same reason item 9 excluded them: they carry the alert
  interstitial (`AlertInterstitial`) over the drawer, and force-expanding the
  sheet underneath it layers badly. This experiment never touches those
  opens; they always render at peek height regardless of variant.

## Exposure
- Exposure event: `experiment_exposed` (`experiment: "spot_sheet_full_height"`).
- Symmetric pattern: `spotSheetExp.logExposure()` is called (via
  `useExperiment`, which no-ops until flags are ready and dedupes once per
  session per variant) at every mobile, non-share, non-alert, non-email spot
  open, in `HomeClient` (the deep-link effect for a plain `/?spot=` /
  `/spot/<id>` open, and `handleSelect` for list/map/related in-app
  selections), regardless of which variant resolves. This logs BOTH arms at
  the shared trigger point (the corrected pattern per
  `docs/experiments/next-good-window.md` and the `alert_interstitial` fix),
  not gated behind "is treatment".
- **Known race, accepted:** the deep-link mount effect that handles a plain
  `/?spot=`/`/spot/<id>` open runs once, before PostHog flags are guaranteed
  loaded (same pre-init ordering noted throughout `lib/analytics.ts`), so it
  reads the flag with the imperative `getVariant()` (not the reactive hook)
  and can occasionally resolve `control` for a treatment-bucketed user on a
  very early direct-URL open. This fails closed to the current behavior (the
  same "flash of control, not mis-counted" tradeoff `useExperiment`'s own
  docstring already accepts) and is not expected to matter at this traffic:
  subsequent in-app selections in the same session read the resolved variant
  normally via the reactive `handleSelect` path.

## Primary metric (exactly one)
- Event: `spot_action` (any `action` value: `directions` / `share` / `photos`;
  `favorite_toggled` is tracked separately as a guardrail below, not folded
  into this metric).
- Definition: rate of `spot_action` per exposed user in the same session
  (`experiment_exposed`, `experiment: "spot_sheet_full_height"`), treatment
  vs control. Direction: increase (the CTA row is visible without a drag).
  Link the query: `analytics/queries/experiment_spot_sheet_full_height.sql`
  (to be written once there is data to query).

## Guardrails (must not regress)
- `spot_sheet_dismissed` per exposed user, treatment vs control: does opening
  full height on every open increase premature dismissal (a bigger sheet
  covering more of the map, or feeling pushier, could raise bounce)?
- `conditions_loaded` per exposed user, treatment vs control: sanity guardrail
  that the conditions fetch itself is unaffected by the sheet-height change
  (it should be; this catches an unrelated regression, not an expected
  effect).
- `favorite_toggled` per exposed user, treatment vs control: does forcing the
  full CTA row into view change Watch-button behavior, positively or
  negatively? Watched separately from the primary `spot_action` metric per
  the task's guardrail list, since Watch (retention) and Share/Directions/
  Photos (bottom-of-funnel intent) answer different questions.

## Decision rule
- **Guarded rollout with a kill switch, not a powered significance test**,
  same reasoning as `enrollment_dual_cta` and the D2/D3/D6 precedent: at
  ~14 users/day traffic, detecting a meaningful lift needs hundreds of
  exposed users per arm, which is a months-long read at this volume. No
  minimum-runtime / minimum-exposed-count target is set because none is
  reachable in a useful window.
- The flag defaults to `control` (current peek-height behavior ships to 100%
  of traffic) until the owner explicitly flips it in PostHog. Treatment is
  watched via the guardrails above for a regression, not evaluated for a
  significant lift, until volume says otherwise.
- Ship rule: none yet. Keep `control` live; the owner decides, from the
  guardrail reads, whether to widen exposure to `treatment`.

## Result (fill in at the end)
- Exposed users / variant, primary metric per variant, guardrail readings,
  decision, and a one-line note for `analytics/INSTRUMENTATION_CHANGELOG.md`
  if any event changed.
