# Retention Hook — Stage D: Cron Watcher + Web Push Sender Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the stored subscriptions into real alerts. A daily Vercel Cron job checks each watched spot's upcoming conditions, and sends at most one web push per device when a watched spot has a calm window in the next 1 to 3 days, deduped so the same window is never announced twice.

**Architecture:** A secret-guarded Node route `GET /api/cron/check-conditions` (triggered by Vercel Cron) loads enabled subscriptions + watched spots from Supabase, fetches each unique watched spot's NWS forecast once, evaluates a "good window" (soonest daytime calm period), then for each device under its daily cap sends one batched web push via the `web-push` library + the VAPID private key, logging `alert_sends` for dedup and disabling subscriptions that return 404/410. Pure logic (window evaluation, alert selection, message composition) is unit-tested; the route wires it to Supabase + the sender.

**Tech Stack:** Next.js 16.2.6 route handler (Node runtime), `web-push` (new dep), Vercel Cron (`vercel.json`), Supabase Postgres, NWS forecast API, Vitest.

## Global Constraints

- This is the second backend route. Both backend routes stay Node runtime (`export const runtime = "nodejs"`). No client code changes in this stage.
- Next.js **16.2.6**, React **19.2.4** (no version changes). **No em dashes** in user-facing copy (push titles/bodies included).
- Env (all already in `.env.local` + Vercel except CRON_SECRET): `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (server), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server), and **new** `CRON_SECRET` (server). The user adds `CRON_SECRET` to Vercel (Production). Vercel Cron automatically sends `Authorization: Bearer $CRON_SECRET` when that env var is set.
- VAPID subject (web-push contact) is the constant `mailto:alerts@paddletowater.com`.
- Alert policy (locked in the design spec): **"good" = calm** (`paddleabilityFromWind(maxMph) === "calm"`, i.e. max wind <= 8 mph), **daytime periods only**, horizon **next 3 days**, **cap 1 push per device per UTC day**, dedupe by `(subscription_id, spot_id, window_key)` where `window_key` is the good period's `YYYY-MM-DD`.
- Reuse `paddleabilityFromWind` from `lib/conditions.ts` and `data/spots.json` (bundled) for spot lat/lng. Do not modify the client conditions cache or `getConditions`.
- The route fetches each UNIQUE watched spot once per run (not per subscription) to stay within NWS limits and the function timeout.

---

## File Structure

- `lib/alerts/conditions-window.ts` (new) — `evaluateGoodWindow` (pure) + `findGoodWindow` (fetch + evaluate).
- `lib/alerts/conditions-window.test.ts` (new) — Vitest for `evaluateGoodWindow`.
- `lib/alerts/select.ts` (new) — `selectAlertSpots` + `composeAlert` (pure).
- `lib/alerts/select.test.ts` (new) — Vitest for both.
- `lib/alerts/push-sender.ts` (new) — `sendPush` wrapping `web-push`.
- `app/api/cron/check-conditions/route.ts` (new) — the orchestration route.
- `vercel.json` (new) — cron schedule.
- `package.json` (modify) — add `web-push` + `@types/web-push`.
- `.env.example` (modify) — document `CRON_SECRET`.

---

## Task 1: Sender, cron config, and CRON_SECRET

**Files:**
- Create: `lib/alerts/push-sender.ts`
- Create: `vercel.json`
- Modify: `package.json` (add `web-push`, `@types/web-push`)
- Modify: `.env.example`

**Interfaces:**
- Produces:
  - `interface PushTarget { endpoint: string; keys: { p256dh: string; auth: string } }`
  - `interface SendResult { ok: boolean; statusCode: number | null; gone: boolean }` (`gone` true for 404/410)
  - `sendPush(target: PushTarget, payload: { title: string; body: string; url: string }): Promise<SendResult>`

- [ ] **Step 1: Install web-push**

Run:
```bash
npm install web-push@^3 && npm install -D @types/web-push@^3
```
Expected: `web-push` in `dependencies`, `@types/web-push` in `devDependencies`.

- [ ] **Step 2: Write the sender**

Create `lib/alerts/push-sender.ts`:
```ts
import "server-only";
import webpush from "web-push";

export interface PushTarget {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface SendResult {
  ok: boolean;
  statusCode: number | null;
  gone: boolean; // 404/410: subscription expired, caller should disable it
}

let configured = false;
function configure() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) throw new Error("VAPID keys not configured");
  webpush.setVapidDetails("mailto:alerts@paddletowater.com", publicKey, privateKey);
  configured = true;
}

export async function sendPush(
  target: PushTarget,
  payload: { title: string; body: string; url: string }
): Promise<SendResult> {
  configure();
  try {
    const res = await webpush.sendNotification(
      { endpoint: target.endpoint, keys: target.keys },
      JSON.stringify(payload)
    );
    return { ok: true, statusCode: res.statusCode, gone: false };
  } catch (err) {
    const statusCode =
      typeof err === "object" && err !== null && "statusCode" in err
        ? (err as { statusCode: number }).statusCode
        : null;
    return { ok: false, statusCode, gone: statusCode === 404 || statusCode === 410 };
  }
}
```

- [ ] **Step 3: Create the cron schedule**

Create `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/check-conditions", "schedule": "0 13 * * *" }
  ]
}
```
(`0 13 * * *` is 13:00 UTC daily, about 6am Pacific in summer / 5am in winter. Adjust the hour later if desired.)

- [ ] **Step 4: Document CRON_SECRET**

Append to `.env.example`:
```
# Cron auth (server-only; Vercel Cron sends it as Authorization: Bearer <value>)
CRON_SECRET=
```

- [ ] **Step 5: Verify build**

Run:
```bash
npm run lint && npm run build
```
Expected: lint clean (ignore pre-existing `.feedback-auto/` errors), build succeeds. Sender is not imported yet, so this only proves it compiles and `web-push` resolves.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/alerts/push-sender.ts vercel.json .env.example
git commit -m "Add web-push sender + Vercel cron config (Stage D)"
```

---

## Task 2: Good-window evaluator + alert selection (pure logic, TDD)

**Files:**
- Create: `lib/alerts/conditions-window.ts`
- Test: `lib/alerts/conditions-window.test.ts`
- Create: `lib/alerts/select.ts`
- Test: `lib/alerts/select.test.ts`

**Interfaces:**
- Produces:
  - `interface ForecastPeriod { name: string; startTime: string; isDaytime: boolean; windSpeed: string }`
  - `interface GoodWindow { windowKey: string; label: string }`
  - `evaluateGoodWindow(periods: ForecastPeriod[], nowMs: number, horizonDays?: number): GoodWindow | null`
  - `findGoodWindow(lat: number, lng: number, nowMs: number): Promise<GoodWindow | null>`
  - `interface SpotWindow { spotId: number; spotName: string; windowKey: string; label: string }`
  - `selectAlertSpots(watchedSpotIds: number[], windowBySpot: Map<number, SpotWindow>, sentKeys: Set<string>, capReached: boolean): SpotWindow[]`
  - `composeAlert(spots: SpotWindow[]): { title: string; body: string; url: string }`
  - `sentKey(spotId: number, windowKey: string): string` (the `"spotId:windowKey"` dedup key, shared by route + selector)

- [ ] **Step 1: Write the failing evaluator test**

Create `lib/alerts/conditions-window.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { evaluateGoodWindow, type ForecastPeriod } from "@/lib/alerts/conditions-window";

const NOW = Date.parse("2026-07-01T15:00:00Z");
function p(name: string, dayOffset: number, isDaytime: boolean, windSpeed: string): ForecastPeriod {
  const d = new Date(NOW + dayOffset * 86400000);
  return { name, startTime: d.toISOString(), isDaytime, windSpeed };
}

describe("evaluateGoodWindow", () => {
  it("returns the soonest daytime calm period within the horizon", () => {
    const periods = [
      p("This Afternoon", 0, true, "15 to 20 mph"), // windy
      p("Tonight", 0, false, "2 mph"),               // night, ignored
      p("Wednesday", 1, true, "5 to 8 mph"),         // calm -> this one
      p("Thursday", 2, true, "3 mph"),               // also calm but later
    ];
    const w = evaluateGoodWindow(periods, NOW, 3);
    expect(w).not.toBeNull();
    expect(w!.label).toBe("Wednesday");
    expect(w!.windowKey).toBe("2026-07-02"); // date of that period
  });

  it("ignores nighttime periods even if calm", () => {
    const periods = [p("Tonight", 0, false, "1 mph"), p("Tomorrow", 1, true, "20 mph")];
    expect(evaluateGoodWindow(periods, NOW, 3)).toBeNull();
  });

  it("returns null when nothing calm is within the horizon", () => {
    const periods = [p("Today", 0, true, "18 mph"), p("Day4", 4, true, "2 mph")];
    expect(evaluateGoodWindow(periods, NOW, 3)).toBeNull();
  });

  it("does not select periods already in the past", () => {
    const periods = [p("Yesterday", -1, true, "1 mph"), p("Today", 0, true, "30 mph")];
    expect(evaluateGoodWindow(periods, NOW, 3)).toBeNull();
  });
});
```

- [ ] **Step 2: Run it red**

Run: `npm test -- lib/alerts/conditions-window.test.ts`
Expected: FAIL, cannot resolve the module.

- [ ] **Step 3: Implement the evaluator**

Create `lib/alerts/conditions-window.ts`:
```ts
import { paddleabilityFromWind } from "@/lib/conditions";

export interface ForecastPeriod {
  name: string;
  startTime: string;
  isDaytime: boolean;
  windSpeed: string;
}

export interface GoodWindow {
  windowKey: string; // YYYY-MM-DD of the good period, for dedup
  label: string;     // human label, e.g. "Wednesday"
}

function parseMaxWind(raw: string): number {
  const nums = (raw.match(/\d+/g) ?? []).map(Number);
  return nums.length ? Math.max(...nums) : 0;
}

/**
 * Soonest daytime period within `horizonDays` whose wind reads "calm". Returns
 * null if none. Past periods and nighttime periods are skipped. Pure.
 */
export function evaluateGoodWindow(
  periods: ForecastPeriod[],
  nowMs: number,
  horizonDays = 3
): GoodWindow | null {
  const horizonMs = nowMs + horizonDays * 86400000;
  for (const period of periods) {
    if (!period.isDaytime) continue;
    const start = Date.parse(period.startTime);
    if (Number.isNaN(start) || start < nowMs || start > horizonMs) continue;
    if (paddleabilityFromWind(parseMaxWind(period.windSpeed)) !== "calm") continue;
    return { windowKey: period.startTime.slice(0, 10), label: period.name };
  }
  return null;
}

/** Fetch the NWS forecast for a spot and evaluate a good window. Returns null on any fetch failure. */
export async function findGoodWindow(lat: number, lng: number, nowMs: number): Promise<GoodWindow | null> {
  try {
    const pointRes = await fetch(`https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`, {
      headers: { Accept: "application/geo+json", "User-Agent": "paddle-to-water alerts" },
    });
    if (!pointRes.ok) return null;
    const point = (await pointRes.json()) as { properties?: { forecast?: string } };
    const forecastUrl = point.properties?.forecast;
    if (!forecastUrl) return null;
    const fRes = await fetch(forecastUrl, {
      headers: { Accept: "application/geo+json", "User-Agent": "paddle-to-water alerts" },
    });
    if (!fRes.ok) return null;
    const data = (await fRes.json()) as { properties?: { periods?: ForecastPeriod[] } };
    const periods = data.properties?.periods ?? [];
    return evaluateGoodWindow(periods, nowMs);
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run it green**

Run: `npm test -- lib/alerts/conditions-window.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Write the failing selection test**

Create `lib/alerts/select.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { selectAlertSpots, composeAlert, sentKey, type SpotWindow } from "@/lib/alerts/select";

const sw = (spotId: number, spotName: string, windowKey: string, label: string): SpotWindow => ({
  spotId, spotName, windowKey, label,
});

describe("selectAlertSpots", () => {
  const windowBySpot = new Map<number, SpotWindow>([
    [2, sw(2, "Foster City Lagoons", "2026-07-04", "Saturday")],
    [3, sw(3, "Coyote Lake", "2026-07-04", "Saturday")],
  ]);

  it("returns watched spots that have a good window and were not already sent", () => {
    const out = selectAlertSpots([2, 3, 9], windowBySpot, new Set(), false);
    expect(out.map((s) => s.spotId)).toEqual([2, 3]); // 9 has no window
  });

  it("excludes spots already alerted for that window", () => {
    const sent = new Set([sentKey(2, "2026-07-04")]);
    const out = selectAlertSpots([2, 3], windowBySpot, sent, false);
    expect(out.map((s) => s.spotId)).toEqual([3]);
  });

  it("returns nothing when the daily cap is reached", () => {
    expect(selectAlertSpots([2, 3], windowBySpot, new Set(), true)).toEqual([]);
  });
});

describe("composeAlert", () => {
  it("names the spot for a single good window", () => {
    const { body, url } = composeAlert([sw(2, "Foster City Lagoons", "2026-07-04", "Saturday")]);
    expect(body).toBe("Saturday looks calm at Foster City Lagoons.");
    expect(url).toBe("/?spot=2");
  });

  it("summarizes extras with a +N more", () => {
    const { body } = composeAlert([
      sw(2, "Foster City Lagoons", "2026-07-04", "Saturday"),
      sw(3, "Coyote Lake", "2026-07-04", "Saturday"),
    ]);
    expect(body).toBe("Saturday looks calm at Foster City Lagoons +1 more.");
  });
});
```

- [ ] **Step 6: Run it red**

Run: `npm test -- lib/alerts/select.test.ts`
Expected: FAIL, cannot resolve the module.

- [ ] **Step 7: Implement selection + compose**

Create `lib/alerts/select.ts`:
```ts
export interface SpotWindow {
  spotId: number;
  spotName: string;
  windowKey: string;
  label: string;
}

/** Dedup key for one (spot, window): shared by the selector and the route's alert_sends rows. */
export function sentKey(spotId: number, windowKey: string): string {
  return `${spotId}:${windowKey}`;
}

/**
 * Watched spots that have a good window and have not already been alerted for
 * that window. Empty if the device is already at its daily cap. Pure.
 */
export function selectAlertSpots(
  watchedSpotIds: number[],
  windowBySpot: Map<number, SpotWindow>,
  sentKeys: Set<string>,
  capReached: boolean
): SpotWindow[] {
  if (capReached) return [];
  const out: SpotWindow[] = [];
  for (const id of watchedSpotIds) {
    const w = windowBySpot.get(id);
    if (!w) continue;
    if (sentKeys.has(sentKey(id, w.windowKey))) continue;
    out.push(w);
  }
  return out;
}

/** One batched push for a device's good spots. No em dashes in copy. */
export function composeAlert(spots: SpotWindow[]): { title: string; body: string; url: string } {
  const first = spots[0];
  const extra = spots.length - 1;
  const tail = extra > 0 ? ` +${extra} more` : "";
  return {
    title: "Good paddling ahead",
    body: `${first.label} looks calm at ${first.spotName}${tail}.`,
    url: `/?spot=${first.spotId}`,
  };
}
```

- [ ] **Step 8: Run it green**

Run: `npm test -- lib/alerts/select.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 9: Commit**

```bash
git add lib/alerts/conditions-window.ts lib/alerts/conditions-window.test.ts lib/alerts/select.ts lib/alerts/select.test.ts
git commit -m "Add good-window evaluator + alert selection logic (Stage D)"
```

---

## Task 3: The cron route (orchestration) + live verify

**Files:**
- Create: `app/api/cron/check-conditions/route.ts`

**Interfaces:**
- Consumes: `getSupabaseAdmin` (Stage C), `findGoodWindow` + `selectAlertSpots` + `composeAlert` + `sentKey` (Task 2), `sendPush` (Task 1), `data/spots.json`.

- [ ] **Step 1: Write the route**

Create `app/api/cron/check-conditions/route.ts`:
```ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { findGoodWindow, type GoodWindow } from "@/lib/alerts/conditions-window";
import { selectAlertSpots, composeAlert, sentKey, type SpotWindow } from "@/lib/alerts/select";
import { sendPush } from "@/lib/alerts/push-sender";
import spotsData from "@/data/spots.json";
import type { Spot } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALL_SPOTS = spotsData as Spot[];
const spotById = new Map(ALL_SPOTS.map((s) => [s.id, s]));

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const dry = new URL(req.url).searchParams.get("dry") === "1";
  const nowMs = Date.now();
  const db = getSupabaseAdmin();

  // 1. Load enabled subscriptions + their watched spots + recent sends.
  const { data: subs, error: subErr } = await db
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("enabled", true);
  if (subErr) return NextResponse.json({ error: "db" }, { status: 500 });

  const { data: watched } = await db.from("watched_spots").select("subscription_id, spot_id");
  const { data: sends } = await db.from("alert_sends").select("subscription_id, spot_id, window_key, sent_at");

  const watchedBySub = new Map<string, number[]>();
  for (const w of watched ?? []) {
    const arr = watchedBySub.get(w.subscription_id) ?? [];
    arr.push(w.spot_id);
    watchedBySub.set(w.subscription_id, arr);
  }
  const startOfUtcDay = new Date(); startOfUtcDay.setUTCHours(0, 0, 0, 0);
  const sentKeysBySub = new Map<string, Set<string>>();
  const sentTodayBySub = new Map<string, number>();
  for (const s of sends ?? []) {
    const keys = sentKeysBySub.get(s.subscription_id) ?? new Set<string>();
    keys.add(sentKey(s.spot_id, s.window_key));
    sentKeysBySub.set(s.subscription_id, keys);
    if (Date.parse(s.sent_at) >= startOfUtcDay.getTime()) {
      sentTodayBySub.set(s.subscription_id, (sentTodayBySub.get(s.subscription_id) ?? 0) + 1);
    }
  }

  // 2. Fetch conditions ONCE per unique watched spot.
  const uniqueSpotIds = [...new Set((watched ?? []).map((w) => w.spot_id))];
  const windowBySpot = new Map<number, SpotWindow>();
  for (const spotId of uniqueSpotIds) {
    const spot = spotById.get(spotId);
    if (!spot) continue;
    const win: GoodWindow | null = await findGoodWindow(spot.lat, spot.lng, nowMs);
    if (win) {
      windowBySpot.set(spotId, { spotId, spotName: spot.water, windowKey: win.windowKey, label: win.label });
    }
  }

  // 3. Per subscription: select, send one batched push, log, disable on gone.
  let pushesSent = 0;
  let disabled = 0;
  const planned: { subscription_id: string; spots: number[] }[] = [];
  for (const sub of subs ?? []) {
    const watchedIds = watchedBySub.get(sub.id) ?? [];
    const capReached = (sentTodayBySub.get(sub.id) ?? 0) > 0;
    const picks = selectAlertSpots(watchedIds, windowBySpot, sentKeysBySub.get(sub.id) ?? new Set(), capReached);
    if (picks.length === 0) continue;
    planned.push({ subscription_id: sub.id, spots: picks.map((p) => p.spotId) });
    if (dry) continue;

    const payload = composeAlert(picks);
    const result = await sendPush(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    );
    if (result.ok) {
      pushesSent += 1;
      await db.from("alert_sends").insert(
        picks.map((p) => ({ subscription_id: sub.id, spot_id: p.spotId, window_key: p.windowKey }))
      );
    } else if (result.gone) {
      await db.from("push_subscriptions").update({ enabled: false }).eq("id", sub.id);
      disabled += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    dry,
    subscriptions: subs?.length ?? 0,
    spotsChecked: uniqueSpotIds.length,
    goodSpots: windowBySpot.size,
    pushesSent,
    disabled,
    planned: dry ? planned : undefined,
  });
}
```

- [ ] **Step 2: Verify lint, tests, build**

Run:
```bash
npm run lint && npm test && npm run build
```
Expected: lint clean, all Vitest tests pass, build succeeds and lists `ƒ /api/cron/check-conditions`.

- [ ] **Step 3: Live verify, dry run (controller; requires CRON_SECRET in .env.local)**

Prereq: `CRON_SECRET` is set in `.env.local` (the controller generates it). Start the dev server, then:
```bash
SECRET=$(grep -m1 '^CRON_SECRET=' .env.local | cut -d= -f2-)
curl -s -H "Authorization: Bearer $SECRET" "http://localhost:3000/api/cron/check-conditions?dry=1"
```
Expected: HTTP 200 JSON with `ok:true`, `dry:true`, a `subscriptions` count, `spotsChecked`, `goodSpots`, and a `planned` array (no real sends, no DB writes). Also verify auth: the same URL with no/`wrong` Authorization returns 401.

- [ ] **Step 4: Live verify, real send (controller)**

Run the same without `?dry=1`:
```bash
curl -s -H "Authorization: Bearer $SECRET" "http://localhost:3000/api/cron/check-conditions"
```
Expected: `ok:true`, and for the leftover test subscriptions (fake `push.example` endpoints from Stage C), `sendPush` fails with 404/410, so they are marked `disabled` (proves the gone-handling path) and `pushesSent` stays 0. If a real subscribed device exists with a calm watched spot, it gets one push. Re-running immediately should send nothing new to the same device (daily cap / window dedup).

- [ ] **Step 5: Commit**

```bash
git add app/api/cron/check-conditions/route.ts
git commit -m "Add cron watcher route that sends conditions alerts (Stage D)"
```

---

## Self-Review

**Spec coverage (Stage D):**
- Vercel Cron daily, secret-guarded → `vercel.json` (Task 1) + the `Authorization: Bearer CRON_SECRET` check (Task 3). ✓
- Load enabled subs + watched spots → Task 3 step 1. ✓
- Fetch conditions once per unique spot → Task 3 step 2 (`uniqueSpotIds`). ✓
- Good window = soonest daytime calm period within 3 days → `evaluateGoodWindow` (Task 2). ✓
- One batched push per device, capped 1/day, deduped by window → `selectAlertSpots` + `composeAlert` + cap/dedup maps (Tasks 2 + 3). ✓
- Send via web-push + VAPID; disable on 404/410 → `sendPush` (Task 1) + Task 3 step 3. ✓
- Log `alert_sends` → Task 3 insert. ✓

**Out of scope / future:** `alert_clicked` analytics from the service worker (a small Stage B-style follow-up); making `alert_sends_dedupe_idx` UNIQUE + `ON CONFLICT` for DB-level dedup (currently app-enforced via `sentKeys`); per-user quiet hours / timezone-aware "today".

**Placeholder scan:** no TBD/TODO; complete code in every step; commands have expected output. Steps 3 to 4 are live checks gated on `CRON_SECRET`.

**Type consistency:** `SpotWindow` defined in `select.ts` and produced by Task 3 from `GoodWindow` (`conditions-window.ts`) + `data/spots.json`. `sentKey` is the single source of the dedup-key format, used by both the selector and the `alert_sends` lookups. `PushTarget` shape (`{endpoint, keys:{p256dh,auth}}`) matches the columns selected from `push_subscriptions`. `findGoodWindow(lat, lng, nowMs)` matches its call site.
