# Paddle to Water — iOS app (Expo)

The native twin of [paddletowater.com](https://paddletowater.com). One screen:
map + list + filters over the same 139 visible spots, full-screen spot sheet
with live NWS wind + NOAA tides, saves ("Watching"), recents, share, feedback,
and the conditions-alert loop over native push.

## How it stays in sync with the web app

- **Shared code, one source of truth.** Metro aliases `@/` to `../web`, so the
  pure modules load straight from the web package: `lib/spots` (+ spots.json),
  `lib/conditions` (wind/tides/caching), `lib/search`, `lib/savedConditions`,
  `lib/nextWindow`, `lib/alerts/*` evaluator, `lib/analytics-events` (typed
  event contracts), `data/*.json`. Keep those modules free of DOM/Next imports.
  `web/node_modules` is blocked in Metro; native never resolves React from it.
- **Same backend.** The app is a pure HTTP consumer of the production API:
  `/api/tides` (NOAA proxy), `/api/alerts/subscribe|remind|opened` (with
  `{expoToken}` payloads), spot photos from `/spot-photos/*`.
- **Same design system.** `src/theme/tokens.ts` transcribes the Meltwater
  tokens from `web/app/globals.css`; the map uses the same CARTO light tiles.

## Commands

```bash
npm run ios        # build + run the dev client (needs Xcode + CocoaPods; LANG=en_US.UTF-8)
npm start          # Metro only (dev client reconnects)
npm test           # vitest (pure modules: deep-link parser, ...)
npx tsc --noEmit   # typecheck
```

Maestro smoke flows (simulator; install: `brew install mobile-dev-inc/tap/maestro`, needs a JDK):

```bash
maestro test maestro/smoke.yaml      # list -> sheet -> live conditions -> save -> Watching
maestro test maestro/deeplink.yaml   # paddletowater:///spot/32 -> sheet
```

Note: taps INSIDE the full-screen spot sheet must be `point:` taps; Maestro's
element-targeted taps compute stale frames for children of the absolute
overlay (real touches are fine).

## Push: current state and the post-Apple-enrollment runbook

The backend is fully live for native push (see
`supabase/migrations/20260719_native_push.sql` and `web/lib/alerts/expo-sender.ts`):
`push_subscriptions.kind='expo'` rows ride the same watched-spots, 1/day cap,
dedupe, token, and cron machinery as web-push. The client enrollment funnel
ships fail-soft: on a simulator, or before the steps below, "Turn on push"
resolves `unsupported` with honest copy and the app keeps working.

To light up real delivery (requires PAID Apple Developer membership, $99/yr):

1. `npx eas login` + `npx eas init` (free Expo account) — writes
   `extra.eas.projectId` into app.json; commit it.
2. Enroll in the Apple Developer Program with the owner's Apple ID.
3. `npx eas credentials` (iOS) — let EAS create + store the APNs key.
4. Rebuild the dev client on the owner's iPhone: `npx expo run:ios --device`
   (with a paid team the aps-environment entitlement now applies; free
   personal-team builds expire after 7 days).
5. In the app: save a spot -> "Turn on push" -> Allow. Verify a
   `push_subscriptions` row with kind='expo' exists in Supabase.
6. Send a test push from https://expo.dev/notifications to the token, with
   `{"url": "/?spot=32&from=alert&window=test&t=<row token>"}` as data.
   Tapping it must open the spot sheet + interstitial and write an
   `alert_opens` row.
7. Real end-to-end: `GET /api/cron/check-conditions?dry=1` with the
   CRON_SECRET bearer and confirm the planned sends include the expo row.

Universal links (https://paddletowater.com/spot/32 opening the app) also wait
on the paid team: AASA + Associated Domains entitlement.

## Analytics

`src/lib/analytics.ts` implements `trackSystem`/`trackIntent`/`setPersona`
over posthog-react-native against the SHARED contracts in
`web/lib/analytics-events.ts`. No-op until `EXPO_PUBLIC_POSTHOG_KEY` is set
(e.g. in `native/.env`, gitignored); every event then carries
`display_mode: "native_ios"`. Long-press the header wordmark ~1.2s to toggle
the internal-device exclusion (`ptw-internal`). When the owner's device first
reports, add its person id to `analytics/EXCLUDED_PERSONS.md`.
