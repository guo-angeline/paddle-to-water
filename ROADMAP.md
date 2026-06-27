# Roadmap

Deferred features, kept implementation-ready. When picking one up, build it, then delete its entry from this file.

---

## Strategy: what the data says

From the Jun 7 to 27, 2026 analytics (`reports/analytics-2026-06-27.md`, PostHog project 458289):

- **286 users, but 78% are one-and-done.** Next-day return 7%, W1 retention 13 to 17%. Acquisition is steady (~14 new/day); the problem is retention, not traffic.
- **Conditions is the product.** 96 users pulled live conditions 1,157 times (~12 each). Water is conditions-gated in a way hiking is not, so conditions is the wedge and the moat ("AllTrails for water", where dynamic conditions are the thing AllTrails can't do).
- **Saving and installing were dead because they had no payoff** (favorites 6 users, PWA 1 install from 182 prompts). The fix is to make them the on-ramp to conditions.
- **Funnel leaks:** 247 landed, 105 opened a spot (58% bounce without opening anything), 15 took a real action. "Get Directions", the true "I'm going" signal, was clicked by 5 users in 20 days.
- **Growth is word-of-mouth, not search:** 82% direct, Google sent 10 users. The 140 SEO pages are too new to rank.

**Business model:** freemium "PaddlePass". Free = discovery + check conditions. Paid = conditions alerts for your spots + multi-day forecast windows + (later) offline. Conditions alerts are the natural paywall: high value, recurring, uniquely water.

**Reprioritization:** lead with the conditions-alert retention loop, not ratings/trip-reports/photos. The data says people return for conditions, not journaling, so the UGC content flywheel comes after retention is proven.

---

## 1. Retention epic: conditions alerts (PRIMARY)

The one loop: save a spot, install the app, get a capped daily push when one of your spots has a good paddle window. Fuses the two dead features (favorites, install) into the loved one (conditions). Full design in `docs/superpowers/specs/2026-06-27-retention-hook-design.md`.

- **Stage A: "Your Spots by conditions" (SHIPPED 2026-06-27).** Saved spots ranked calm-first with a live paddle-ability badge, client-only. The experiment that proves whether conditions-as-habit retains. Plan: `docs/superpowers/plans/2026-06-27-retention-hook-stage-a.md`.
  - **Watch before building Stage B:** do `saved_conditions_viewed` users and favorite counts climb, and does the alerted-intent cohort beat the 13 to 17% W1 baseline? If Stage A's signal is flat, rethink before adding backend.
- **Stage B: install overhaul + service-worker push plumbing.** Web-push-only, so install is in-scope: prompt only after the first save, framed as "install to get alerts when [spot] is good", with the iOS Add-to-Home-Screen steps. Register the service worker + push subscription.
- **Stage C: backend (Supabase Postgres).** Store `anon_id -> push subscription + watched spots` (anonymous, no login). Add the `POST /api/alerts/subscribe` route.
- **Stage D: the watcher.** Vercel Cron hits a Next.js route that reuses `lib/conditions` in Node, checks each unique watched spot once, and sends a capped (1/day) web push when a good window is 1 to 3 days out. Dedupe by `window_key`.

Stages B to D each get their own spec/plan when Stage A's signal justifies them.

## 2. Fix the 58% landing bounce

142 of 247 visitors never open a single spot. On mobile (77% of users), surface value on load instead of a bare map: auto-open or prompt the nearest spot, or a "good to paddle near you today" view. Near-me works when asked, but nobody asks (10 users). Pairs naturally with the conditions data Stage A already fetches.

## 3. Make "Get Directions" convert

The true conversion, clicked by 5 users in 20 days. Either the button is buried in the drawer or wind is deterring trips. Test placement, and cross-tab directions clicks against calm-vs-breezy conditions to learn whether wind suppresses intent. Add an outbound event when the directions link actually leaves the app (current `spot_action` only logs the click).

## 4. Instrumentation gaps

- `spot_viewed` fires from two surfaces (list vs map pin) with no `source` prop. Add `source: "list" | "map" | "url"` so we can tell which surface drives opens.
- No outbound event when a directions/share click leaves the app (see item 3).

## 5. SEO: monitor, do not build yet

Organic is 10 users; expected this soon after the 140 spot pages went live. Recheck organic traffic in 4 to 6 weeks. If still flat, the spot pages are not indexing and that becomes a real work item. No build now.

---

## Later (after retention is proven)

- **UGC content flywheel:** ratings, photos, trip logs, user conditions reports. The long-term moat and SEO-acquisition engine, but it needs retained users to generate content first.
- **Optional Google sign-in** to sync push subscriptions and saved spots across devices (Stage C ships anonymous; this is the upgrade path).
- **PaddlePass premium tier:** alerts + multi-day forecast windows + offline, as the freemium paywall.
- **Community spot submissions** with admin approval.
- **Tide-window refinement** in the "good window" evaluator (Stage D ships wind-only).
