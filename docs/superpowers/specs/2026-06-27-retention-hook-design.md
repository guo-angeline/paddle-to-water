# Retention hook: conditions alerts — design spec

**Date:** 2026-06-27
**Status:** Approved design, ready for implementation planning
**Owner:** product / SUP Spots

## Context

Analytics for the SUP Spots app (Jun 7 to 27, 2026) show a retention problem, not an acquisition problem: 286 users, steady ~14 new/day, but **78% are one-and-done**, next-day return is **7%**, and W1 retention is **13 to 17%**. People look once and never come back.

The data also points clearly at the fix. The most-used feature by far is **live conditions** (96 users pulled conditions 1,157 times, ~12 each). Water sports are conditions-gated in a way hiking is not: a flatwater paddle is only good inside a tide/wind window that changes hourly. That makes **conditions the product's wedge and its moat** ("AllTrails for water", where the differentiator vs AllTrails is dynamic conditions).

Two features are dead: **favorites (6 users)** and **PWA install (1 install from 182 prompts)**. They are dead because they have no payoff. A saved spot does nothing for you, and a generic "add to home screen" nag offers no reason.

This spec designs a single retention engine that fuses the two dead features into the loved one: **save a spot, install the app, and get pinged when that spot is good to paddle.**

## Goal and success criteria

Give users a recurring reason to return.

- **Primary metric:** W1 retention moves off the 13 to 17% baseline.
- **Leading indicators:** opt-in grant rate, push click-through rate, and return rate of alerted vs non-alerted users.

## Decisions locked during brainstorming

1. **Scope:** the full conditions-alert system (client experience + backend watcher + delivery), built in stages.
2. **Channel:** **web push only.** Consequence: fixing the PWA install funnel is in-scope, because on iOS no install means no push.
3. **Auth:** **anonymous, no login.** Push subscriptions are stored against a client-generated anonymous id. No Google OAuth for this phase.
4. **Trigger:** **smart daily check, capped.** A scheduled morning job sends at most one push per device per day, only when a watched spot has a genuinely good window in the next 1 to 3 days.
5. **Backend:** **hybrid.** Vercel Cron + a Next.js route handler (reusing `lib/conditions.ts` in Node) for compute; **Supabase Postgres** as the datastore (the planned V1 backend, so no later migration).

## The retention loop

```
save spot (favorites — today does nothing)
   → "Your Spots, ranked by today's conditions"   gives saving a payoff (Stage A)
   → "Install to get alerted when they're good"     gives install a reason
   → enable notifications (anonymous subscription)
   → capped daily push when a window opens          the reason to return
```

## Architecture

Two layers.

**Client (existing Next.js 16 static app):**
- Repurpose favorites (`localStorage` key `ptw-favorites`, existing `toggleFavorite` in `components/HomeClient.tsx`) as "watched spots."
- New "Your Spots" home section: saved spots with a live conditions badge, sorted calm-first, reusing the `paddleability` logic from `components/ConditionsPanel.tsx` / `lib/conditions.ts`.
- Contextual install + notification opt-in flow (replaces the always-on nag in `components/InstallPrompt.tsx`).
- New service worker (`public/sw.js`) to receive pushes.

**Backend (new):**
- Supabase Postgres datastore: `anon_id -> push subscription + watched spots`.
- `POST /api/alerts/subscribe` route handler: upsert subscription + watched spots.
- `GET /api/cron/check-conditions` route handler: the daily watcher, triggered by Vercel Cron behind a secret header, reusing `lib/conditions.ts` in Node and sending web push via VAPID.

## Data model (Supabase Postgres)

```
push_subscriptions
  id            uuid pk
  anon_id       text          -- generated client-side, kept in localStorage
  endpoint      text unique   -- push endpoint, the natural identity
  p256dh, auth  text          -- web push keys from the browser subscription
  enabled       bool          -- set false on 404/410 Gone
  user_agent    text
  created_at, last_seen        timestamptz

watched_spots
  subscription_id  uuid fk -> push_subscriptions
  spot_id          int
  created_at       timestamptz
  unique (subscription_id, spot_id)

alert_sends                    -- powers the daily cap + window dedupe
  subscription_id  uuid fk
  spot_id          int
  window_key       text        -- e.g. "2026-07-04-AM", the good period
  sent_at          timestamptz
```

No PII. The anonymous id and the push endpoint are the only identifiers. Watched spots are also mirrored in `localStorage` so Stage A works with zero backend.

## "Good window" logic

Reuse `paddleability` from `lib/conditions.ts`. A watched spot is **good** if any daytime forecast period in the next 1 to 3 days is **calm** (a tunable constant can widen this to calm-or-breezy). Wind-only for v1; a tide-window refinement can come later. If a spot's fetch fails, it is skipped for that run and never reported as good (no false positives).

## Daily watcher flow

Vercel Cron (~6am PT) calls `GET /api/cron/check-conditions` with a shared secret header.

1. Load all `enabled` subscriptions and their watched spot ids.
2. Collect the **unique** set of watched spot ids across all users and fetch conditions **once per spot** (reusing `lib/conditions` in Node, throttled). 200 users watching one spot is one NWS call, not 200. This is the core scaling and rate-limit safeguard.
3. For each subscription: select watched spots with a good upcoming window whose `window_key` is not already in `alert_sends`, and only if the device is under its one-per-day cap.
4. Send **one** batched push: e.g. "Saturday looks calm at Foster City Lagoons +1 more." Log each spot to `alert_sends`.
5. On send failure with 404/410, set the subscription `enabled = false`.

The `window_key` dedupe stops re-announcing the same weekend every morning.

## Client UX

**Watched spots / "Your Spots."** Keep the existing favorites toggle and persistence. Add a home section listing saved spots with their live conditions badge, sorted calm-first, with an empty state that nudges the first save. Ships as Stage A with no backend.

**Opt-in moment.** Only prompt **after the first spot is saved**, framed as the payoff: "Want a heads-up when [spot] is good to paddle? Add the app to get alerts." One contextual, dismissible prompt; store a dismissed-at stamp so it is not re-nagged every session.

**Install gate** (web-push-only requires platform detection):
- Already installed (`display-mode: standalone`) -> request notification permission directly.
- iOS Safari, not installed -> show the literal "Share -> Add to Home Screen" steps (iOS has no programmatic install prompt). Without install there is no push.
- Android/desktop with `beforeinstallprompt` -> trigger native install, then request permission.

**Subscribe.** On permission granted: register the service worker, call `pushManager.subscribe` with the VAPID public key, then `POST /api/alerts/subscribe` with `{ anon_id, subscription, watched_spot_ids }`. Re-sync watched ids whenever favorites change and the device is subscribed.

**Service worker** (`public/sw.js`): handle `push` (show notification with spot name + window) and `notificationclick` (open `/?spot=<id>`, focusing an existing tab if present). This is the only new always-on client code and stays minimal.

## Error handling and edge cases

- **Endpoint rotation:** browsers rotate endpoints silently. A 404/410 on send flips `enabled = false`; the client re-subscribes on next open and re-POSTs, healing the row.
- **Stale watched list:** the cron always reads `watched_spots` from the DB, so unsaving a spot stops alerts even if the device is offline.
- **Conditions source down:** NWS/NOAA failure for a spot skips that spot for the run; never reported good on missing data.
- **Rate limits:** one fetch per unique spot per run keeps us well under NWS limits at thousands of users.
- **Cron auth:** the route rejects any call missing the shared secret header.
- **Quiet by default:** hard cap of one push per device per day, plus `window_key` dedupe.
- **Permission denied / unsupported:** keep the full Stage A pull experience and a quiet "enable alerts" affordance; never hide the saved-spots view.

## Privacy

Anonymous id + push endpoint only. No email, name, or precise location stored. Watched spot ids are not sensitive. Add a short note to the existing disclaimer / privacy copy.

## Analytics

Required by CLAUDE.md. Add to the `EventName` union in `lib/analytics.ts`:
- `spot_watched` (add/remove, with `total_watched`)
- `alert_optin_shown`
- `alert_optin_result` (`granted | denied | unsupported | install_needed`)
- `alert_sent` (server-side via PostHog Node, with `spots_count`)
- `alert_clicked` (from the service worker)

Persona: `alerts_enabled: true`, `watched_count`. Together these measure the full funnel: save -> opt-in shown -> granted -> sent -> clicked -> returned.

## Testing

- **Unit:** the "good window" evaluator against canned NWS payloads (calm / breezy / windy / missing); the cap + `window_key` dedupe logic.
- **Integration:** `subscribe` route upserts correctly; cron route with a seeded subscription sends to a mock push endpoint and writes `alert_sends`.
- **Manual (Playwright + real browser):** save a spot, opt-in on installed Chrome, fire the cron route locally against a test VAPID key, confirm the OS notification appears and the click opens the spot. iOS verified by hand on an installed PWA.

## Build order

Each stage is independently shippable and measurable, so a flat retention signal is caught cheaply before the heavy infra is built.

1. **Stage A (client only, no backend):** "Your Spots by conditions" + repurposed favorites. Proves whether conditions-as-habit retains.
2. **Install overhaul + service worker push plumbing.**
3. **Backend:** Supabase tables + the anonymous `subscribe` route.
4. **The cron watcher + web push send + the daily cap + server-side analytics.**

## Future (out of scope for this spec)

- Tide-window refinement in the "good" evaluator.
- Optional Google sign-in to sync subscriptions across devices.
- Premium tier ("PaddlePass"): alerts + multi-day forecast windows + offline as the freemium paywall.
- UGC content flywheel (reviews, photos, trip logs) for SEO-driven acquisition.
