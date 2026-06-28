# Retention Hook — Stage C: Supabase Store + Subscribe Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist anonymous push subscriptions and their watched spots in Supabase Postgres via a server route, so Stage D's watcher has data to send to. Stage B currently only stashes the subscription in localStorage; Stage C POSTs it to `/api/alerts/subscribe`, which writes to the DB.

**Architecture:** Three RLS-locked Postgres tables (`push_subscriptions`, `watched_spots`, `alert_sends`). A server-only Supabase admin client (service role key) is used exclusively by a Next.js route handler `POST /api/alerts/subscribe`, which validates the body, upserts the subscription by endpoint, and replaces the device's watched-spot rows. The client (lib/push.ts) generates a persistent anonymous id, POSTs after a successful subscribe, and re-syncs watched ids when favorites change.

**Tech Stack:** Next.js 16.2.6 route handlers (Node runtime), `@supabase/supabase-js` (new dep), Supabase Postgres, Vitest (existing).

## Global Constraints

- The app gains its FIRST backend: one route handler + Supabase. No other server code. The route runs on the Node runtime (`export const runtime = "nodejs"`).
- Next.js **16.2.6**, React **19.2.4** (no version changes).
- **No em dashes** in user-facing copy.
- The service role key is **server-only**. It is read from `process.env.SUPABASE_SERVICE_ROLE_KEY` in `lib/supabase-server.ts`, which begins with `import "server-only"`. Never expose it to the client, never prefix it `NEXT_PUBLIC_`, never commit it.
- Env vars (added to `.env.local` and Vercel by the user): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. No `NEXT_PUBLIC_SUPABASE_*` is needed (only the server route touches the DB).
- All tables have RLS enabled with **no policies**, so anon/authenticated keys get zero access; only the service role (which bypasses RLS) can read/write. This is the security boundary.
- Subscription identity is the push `endpoint` (unique). `anon_id` groups a device across endpoint rotation. localStorage keys: subscription stash `ptw-push-subscription` (Stage B), anon id `ptw-anon-id` (new), favorites `ptw-favorites`.
- Reuse Stage B's `lib/push.ts` helpers (`readStashedSubscription`, `enablePushAlerts`). Import alias `@/`.

---

## File Structure

- `supabase/migrations/0001_alerts.sql` (new) — schema + indexes + RLS. Run by the user in the Supabase SQL editor.
- `lib/supabase-server.ts` (new) — server-only admin client factory.
- `lib/subscribe-validation.ts` (new) — pure request-body validator (unit-tested).
- `lib/subscribe-validation.test.ts` (new) — Vitest tests.
- `app/api/alerts/subscribe/route.ts` (new) — the POST route handler.
- `lib/push.ts` (modify) — add `getAnonId`, `postSubscription`, `syncWatchedSpots`; POST after subscribe.
- `lib/push.test.ts` (modify) — add `getAnonId` persistence test.
- `components/HomeClient.tsx` (modify) — re-sync watched spots when favorites change and the device is subscribed.
- `package.json` (modify) — add `@supabase/supabase-js`.
- `.env.example` (modify, if present) — document the two new env vars.

---

## Task 1: Schema, deps, and server Supabase client

**Files:**
- Create: `supabase/migrations/0001_alerts.sql`
- Create: `lib/supabase-server.ts`
- Modify: `package.json` (add `@supabase/supabase-js`)
- Modify: `.env.example` (if it exists; document env vars)

**Interfaces:**
- Produces: `getSupabaseAdmin(): SupabaseClient` from `lib/supabase-server.ts` (throws if env missing).

- [ ] **Step 1: Install the Supabase client**

Run:
```bash
npm install @supabase/supabase-js@^2
```
Expected: `@supabase/supabase-js` appears under `dependencies`, install exits 0.

- [ ] **Step 2: Write the SQL migration**

Create `supabase/migrations/0001_alerts.sql`:
```sql
-- Conditions-alert retention loop: anonymous push subscriptions + watched spots.
-- Run in the Supabase SQL editor. RLS is on with no policies, so only the
-- service role (used by the /api/alerts/subscribe route) can access these tables.

create table if not exists push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  anon_id     text,
  endpoint    text unique not null,
  p256dh      text not null,
  auth        text not null,
  enabled     boolean not null default true,
  user_agent  text,
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now()
);

create table if not exists watched_spots (
  subscription_id uuid not null references push_subscriptions(id) on delete cascade,
  spot_id         integer not null,
  created_at      timestamptz not null default now(),
  primary key (subscription_id, spot_id)
);
create index if not exists watched_spots_spot_idx on watched_spots (spot_id);

create table if not exists alert_sends (
  id              bigint generated always as identity primary key,
  subscription_id uuid not null references push_subscriptions(id) on delete cascade,
  spot_id         integer not null,
  window_key      text not null,
  sent_at         timestamptz not null default now()
);
create index if not exists alert_sends_dedupe_idx on alert_sends (subscription_id, spot_id, window_key);

alter table push_subscriptions enable row level security;
alter table watched_spots      enable row level security;
alter table alert_sends        enable row level security;
-- Intentionally no policies: anon/authenticated get zero access; service role bypasses RLS.
```
(`alert_sends` is created now though it is only used by Stage D, to avoid a second migration.)

- [ ] **Step 3: Write the server-only Supabase client**

Create `lib/supabase-server.ts`:
```ts
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client for server routes only. Uses the service role key,
 * which bypasses RLS, so this MUST never reach the client (enforced by the
 * "server-only" import above). Throws if env is not configured.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
```

- [ ] **Step 4: Document env vars**

If `.env.example` exists, append:
```
# Supabase (server-only; used by /api/alerts/subscribe)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```
If it does not exist, skip this step (do not create one).

- [ ] **Step 5: Verify build**

Run:
```bash
npm run lint && npm run build
```
Expected: lint clean (ignore pre-existing `.feedback-auto/` errors), build succeeds. `lib/supabase-server.ts` is not imported yet, so this only proves it compiles and the dep resolves.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json supabase/migrations/0001_alerts.sql lib/supabase-server.ts .env.example
git commit -m "Add Supabase schema migration + server admin client (Stage C)"
```

---

## Task 2: Body validation + subscribe route

**Files:**
- Create: `lib/subscribe-validation.ts`
- Test: `lib/subscribe-validation.test.ts`
- Create: `app/api/alerts/subscribe/route.ts`

**Interfaces:**
- Consumes: `getSupabaseAdmin` (Task 1).
- Produces:
  - `interface SubscribePayload { anonId?: string; subscription: { endpoint: string; keys: { p256dh: string; auth: string } }; watchedSpotIds: number[] }`
  - `type ValidationResult = { ok: true; value: SubscribePayload } | { ok: false; error: string }`
  - `validateSubscribePayload(body: unknown): ValidationResult`
  - `POST` handler at `/api/alerts/subscribe`.

- [ ] **Step 1: Write the failing validator test**

Create `lib/subscribe-validation.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { validateSubscribePayload } from "@/lib/subscribe-validation";

const good = {
  anonId: "abc-123",
  subscription: { endpoint: "https://push.example/x", keys: { p256dh: "p", auth: "a" } },
  watchedSpotIds: [2, 3],
};

describe("validateSubscribePayload", () => {
  it("accepts a well-formed payload", () => {
    const r = validateSubscribePayload(good);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.subscription.endpoint).toBe("https://push.example/x");
  });

  it("accepts a missing anonId (optional)", () => {
    const { ...noAnon } = good;
    delete (noAnon as { anonId?: string }).anonId;
    expect(validateSubscribePayload(noAnon).ok).toBe(true);
  });

  it("rejects a missing endpoint", () => {
    const bad = { ...good, subscription: { keys: { p256dh: "p", auth: "a" } } };
    const r = validateSubscribePayload(bad);
    expect(r.ok).toBe(false);
  });

  it("rejects missing keys", () => {
    const bad = { ...good, subscription: { endpoint: "https://push.example/x" } };
    expect(validateSubscribePayload(bad).ok).toBe(false);
  });

  it("rejects non-numeric watchedSpotIds", () => {
    const bad = { ...good, watchedSpotIds: [2, "x"] };
    expect(validateSubscribePayload(bad).ok).toBe(false);
  });

  it("rejects a non-object body", () => {
    expect(validateSubscribePayload(null).ok).toBe(false);
    expect(validateSubscribePayload("nope").ok).toBe(false);
  });

  it("defaults watchedSpotIds to [] when absent", () => {
    const r = validateSubscribePayload({ subscription: good.subscription });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.watchedSpotIds).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
npm test -- lib/subscribe-validation.test.ts
```
Expected: FAIL, cannot resolve `@/lib/subscribe-validation`.

- [ ] **Step 3: Implement the validator**

Create `lib/subscribe-validation.ts`:
```ts
export interface SubscribePayload {
  anonId?: string;
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
  watchedSpotIds: number[];
}

export type ValidationResult =
  | { ok: true; value: SubscribePayload }
  | { ok: false; error: string };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function validateSubscribePayload(body: unknown): ValidationResult {
  if (!isObject(body)) return { ok: false, error: "body must be an object" };

  const sub = body.subscription;
  if (!isObject(sub)) return { ok: false, error: "subscription is required" };
  if (typeof sub.endpoint !== "string" || !sub.endpoint) {
    return { ok: false, error: "subscription.endpoint is required" };
  }
  const keys = sub.keys;
  if (!isObject(keys) || typeof keys.p256dh !== "string" || typeof keys.auth !== "string") {
    return { ok: false, error: "subscription.keys.p256dh and .auth are required" };
  }

  let watchedSpotIds: number[] = [];
  if (body.watchedSpotIds !== undefined) {
    if (!Array.isArray(body.watchedSpotIds) || body.watchedSpotIds.some((n) => typeof n !== "number")) {
      return { ok: false, error: "watchedSpotIds must be an array of numbers" };
    }
    watchedSpotIds = body.watchedSpotIds as number[];
  }

  const anonId = typeof body.anonId === "string" ? body.anonId : undefined;

  return {
    ok: true,
    value: {
      anonId,
      subscription: { endpoint: sub.endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
      watchedSpotIds,
    },
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
npm test -- lib/subscribe-validation.test.ts
```
Expected: PASS, 7 tests green.

- [ ] **Step 5: Write the route handler**

Create `app/api/alerts/subscribe/route.ts`:
```ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { validateSubscribePayload } from "@/lib/subscribe-validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = validateSubscribePayload(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { anonId, subscription, watchedSpotIds } = parsed.value;

  try {
    const db = getSupabaseAdmin();

    const { data: sub, error: upsertErr } = await db
      .from("push_subscriptions")
      .upsert(
        {
          anon_id: anonId ?? null,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          enabled: true,
          last_seen: new Date().toISOString(),
        },
        { onConflict: "endpoint" }
      )
      .select("id")
      .single();
    if (upsertErr || !sub) throw upsertErr ?? new Error("upsert returned no row");

    // Replace this device's watched spots with the current set.
    const { error: delErr } = await db.from("watched_spots").delete().eq("subscription_id", sub.id);
    if (delErr) throw delErr;

    if (watchedSpotIds.length > 0) {
      const rows = watchedSpotIds.map((spot_id) => ({ subscription_id: sub.id, spot_id }));
      const { error: insErr } = await db.from("watched_spots").insert(rows);
      if (insErr) throw insErr;
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Do not leak DB internals to the client.
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
```

- [ ] **Step 6: Verify lint, tests, build**

Run:
```bash
npm run lint && npm test && npm run build
```
Expected: lint clean, all Vitest tests pass, build succeeds and lists `ƒ /api/alerts/subscribe` as a route. (The route is not exercised against a real DB until env is set; that is Task 3's live verification.)

- [ ] **Step 7: Commit**

```bash
git add lib/subscribe-validation.ts lib/subscribe-validation.test.ts app/api/alerts/subscribe/route.ts
git commit -m "Add /api/alerts/subscribe route + body validation (Stage C)"
```

---

## Task 3: Client wiring (anon id + POST on subscribe + re-sync)

**Files:**
- Modify: `lib/push.ts`
- Test: `lib/push.test.ts`
- Modify: `components/HomeClient.tsx`

**Interfaces:**
- Consumes: existing `readStashedSubscription`, `stashSubscription`, `enablePushAlerts` (Stage B).
- Produces:
  - `getAnonId(): string` (persisted in localStorage `ptw-anon-id`)
  - `postSubscription(sub: PushSubscription | PushSubscriptionJSON, watchedSpotIds: number[]): Promise<boolean>`
  - `syncWatchedSpots(watchedSpotIds: number[]): Promise<void>` (re-POSTs only if a subscription is stashed)
  - `enablePushAlerts` now POSTs after stashing.

- [ ] **Step 1: Write the failing getAnonId test**

Append to `lib/push.test.ts` (the file already stubs `localStorage` via `vi.stubGlobal` in a `beforeEach`; add this block which re-stubs within its own describe to be safe):
```ts
import { getAnonId } from "@/lib/push";

describe("getAnonId", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
    });
    vi.stubGlobal("crypto", { randomUUID: () => "uuid-fixed-1234" });
  });

  it("generates and persists a stable anon id", () => {
    const first = getAnonId();
    expect(first).toBe("uuid-fixed-1234");
    const second = getAnonId();
    expect(second).toBe(first); // persisted, not regenerated
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
npm test -- lib/push.test.ts
```
Expected: FAIL, `getAnonId` is not exported.

- [ ] **Step 3: Implement anon id + POST helpers in lib/push.ts**

Add to `lib/push.ts` (append after the existing exports; add `ANON_KEY` near the top `STASH_KEY` constant):
```ts
const ANON_KEY = "ptw-anon-id";

/** Stable anonymous device id, generated once and persisted. */
export function getAnonId(): string {
  try {
    const existing = localStorage.getItem(ANON_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(ANON_KEY, id);
    return id;
  } catch {
    // Storage unavailable: a fresh id each call is acceptable degradation.
    return crypto.randomUUID();
  }
}

/** POST the subscription + watched ids to the backend. Best-effort; returns success. */
export async function postSubscription(
  sub: PushSubscription | PushSubscriptionJSON,
  watchedSpotIds: number[]
): Promise<boolean> {
  const subscription = "toJSON" in sub ? sub.toJSON() : sub;
  try {
    const res = await fetch("/api/alerts/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonId: getAnonId(), subscription, watchedSpotIds }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Re-sync watched ids if this device already has a stashed subscription. */
export async function syncWatchedSpots(watchedSpotIds: number[]): Promise<void> {
  const stashed = readStashedSubscription();
  if (!stashed) return;
  await postSubscription(stashed.subscription, watchedSpotIds);
}
```
Then, in `enablePushAlerts`, after `stashSubscription(sub, watchedSpotIds);` and before `return "granted";`, add:
```ts
  await postSubscription(sub, watchedSpotIds);
```
(Keep returning "granted" even if the POST fails: the subscription exists locally and `syncWatchedSpots` / a later opt-in will retry. The POST failing does not undo the browser subscription.)

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
npm test -- lib/push.test.ts
```
Expected: PASS (existing push tests + the new `getAnonId` test).

- [ ] **Step 5: Re-sync watched spots on favorites change in HomeClient**

In `components/HomeClient.tsx`, add the import:
```tsx
import { syncWatchedSpots } from "@/lib/push";
```
Add an effect after the existing `savedSpots` useMemo (it already exists from Stage A). The effect re-syncs whenever the saved set changes, but only does network work if a subscription is stashed (guarded inside `syncWatchedSpots`):
```tsx
  const savedIdsKey = savedSpots.map((s) => s.id).sort((a, b) => a - b).join(",");
  useEffect(() => {
    if (savedSpots.length === 0) return;
    void syncWatchedSpots(savedSpots.map((s) => s.id));
  // savedIdsKey is the stable trigger; syncWatchedSpots no-ops without a subscription.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedIdsKey]);
```

- [ ] **Step 6: Verify lint, tests, build**

Run:
```bash
npm run lint && npm test && npm run build
```
Expected: lint clean, all tests pass, build succeeds.

- [ ] **Step 7: Live end-to-end verification (requires Supabase env set)**

Prereq: the user has created the Supabase project, run `supabase/migrations/0001_alerts.sql` in the SQL editor, and set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Then:
```bash
npm run dev
# In a second shell, POST a fake subscription:
curl -sS -X POST http://localhost:3000/api/alerts/subscribe \
  -H 'Content-Type: application/json' \
  -d '{"anonId":"smoke-1","subscription":{"endpoint":"https://push.example/smoke-1","keys":{"p256dh":"testp","auth":"testa"}},"watchedSpotIds":[2,3,4]}'
```
Expected: `{"ok":true}`. Then confirm in the Supabase dashboard (Table editor) that `push_subscriptions` has one row with `endpoint = https://push.example/smoke-1` and `watched_spots` has 3 rows for it. Re-running the same curl with `watchedSpotIds:[2]` should leave one `push_subscriptions` row (upsert by endpoint) and exactly one `watched_spots` row (replaced).
Also verify a bad body is rejected:
```bash
curl -sS -X POST http://localhost:3000/api/alerts/subscribe -H 'Content-Type: application/json' -d '{}'
```
Expected: HTTP 400 with `{"error":"subscription is required"}`.

- [ ] **Step 8: Commit**

```bash
git add lib/push.ts lib/push.test.ts components/HomeClient.tsx
git commit -m "Wire client to POST subscription + re-sync watched spots (Stage C)"
```

---

## Self-Review

**Spec coverage (Stage C scope):**
- Supabase Postgres store (`push_subscriptions`, `watched_spots`, `alert_sends`) → Task 1 migration. ✓
- `POST /api/alerts/subscribe` upserts subscription + watched spots → Task 2 route. ✓
- Anonymous (no login): identity is endpoint + client `anon_id` → Task 3 `getAnonId`. ✓
- Client POSTs the stashed subscription → Task 3 `postSubscription` called from `enablePushAlerts`. ✓
- Re-sync watched ids when favorites change → Task 3 HomeClient effect + `syncWatchedSpots`. ✓
- Security: RLS-locked tables, service-role-only access, key server-only → Task 1 SQL + `import "server-only"`. ✓

**Out of scope (Stage D):** the cron watcher, reading conditions server-side, sending web push, writing `alert_sends`. `alert_sends` is created now but unused.

**Placeholder scan:** no TBD/TODO; complete code in every step; commands have expected output. Task 3 Step 7 is a live check explicitly gated on user-provided env.

**Type consistency:** `SubscribePayload` (Task 2) matches the route's destructure and the client POST body shape `{ anonId, subscription:{endpoint,keys:{p256dh,auth}}, watchedSpotIds }`. `postSubscription` accepts `PushSubscription | PushSubscriptionJSON` and normalizes via `toJSON`; `readStashedSubscription().subscription` is already `PushSubscriptionJSON`, so `syncWatchedSpots` passes the JSON form. `getSupabaseAdmin` returns a `SupabaseClient` used only in the route.
