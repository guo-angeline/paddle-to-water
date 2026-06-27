# Retention Hook — Stage B: Install Overhaul + Service-Worker Push Plumbing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn saving a spot into the on-ramp for alerts: after the first save, prompt the user to install the app (web-push-only) and enable notifications, register a service worker that can receive + display a push, and create a push subscription stashed locally for Stage C to send to the backend.

**Architecture:** A client push module (`lib/push.ts`) holds support detection, VAPID key conversion, service-worker registration, the subscribe flow, and a localStorage stash (the Stage C seam, no backend yet). A static `public/sw.js` receives `push` and `notificationclick`. A tiny `ServiceWorkerRegister` mounts in the root layout so the SW is registered for every visit. `InstallPrompt` is overhauled: it no longer auto-shows on a timer, it shows after the first save, reframed around alerts, with platform-correct paths (installed → enable, iOS → Add to Home Screen, Android → install then enable).

**Tech Stack:** Next.js 16.2.6 (App Router), React 19.2.4, TypeScript 5, Web Push API + Service Worker, Vitest (existing).

## Global Constraints

- App stays client-only: Stage B adds a service worker and a localStorage stash but **no backend, no API routes, no new runtime dependencies**. The actual POST of the subscription is Stage C.
- Next.js **16.2.6**, React **19.2.4** (no version changes).
- **No em dashes** in any user-facing copy. Use commas, colons, or periods.
- VAPID public key is read from `process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY` (already set in `.env.local`). Never hardcode it. The private key (`VAPID_PRIVATE_KEY`) is server-only and unused until Stage D.
- `pushManager.subscribe` MUST pass `userVisibleOnly: true` and `applicationServerKey` derived from the VAPID public key (Chrome rejects otherwise).
- New analytics event names must be added to the `EventName` union in `lib/analytics.ts` before `track()` uses them. Stage B adds `alert_optin_shown` and `alert_optin_result`.
- The localStorage stash key is `ptw-push-subscription`. The existing favorites key is `ptw-favorites`; the install-dismissed key is `ptw-install-dismissed`.
- Reuse the existing cross-component signal pattern (`window.dispatchEvent(new Event("ptw:..."))` + listener, as used for `ptw:drawerchange`).
- Import alias is `@/` (repo root).

---

## File Structure

- `lib/push.ts` (new) — push helpers: `isPushSupported`, `urlBase64ToUint8Array`, `registerServiceWorker`, `enablePushAlerts`, `stashSubscription`, `readStashedSubscription`. No React.
- `lib/push.test.ts` (new) — Vitest unit tests for `urlBase64ToUint8Array` and the stash round-trip.
- `lib/analytics.ts` (modify) — add `alert_optin_shown`, `alert_optin_result` to `EventName`.
- `public/sw.js` (new) — service worker: `push` + `notificationclick`.
- `components/ServiceWorkerRegister.tsx` (new) — mounts in layout, registers the SW on load.
- `app/layout.tsx` (modify) — mount `<ServiceWorkerRegister />`.
- `components/InstallPrompt.tsx` (rewrite) — first-save trigger, alert-framed copy, platform-correct install/enable flow, opt-in analytics.
- `components/HomeClient.tsx` (modify) — dispatch `ptw:spotsaved` with the spot name when a spot is saved.

---

## Task 1: Push module + analytics events

**Files:**
- Modify: `lib/analytics.ts`
- Create: `lib/push.ts`
- Test: `lib/push.test.ts`

**Interfaces:**
- Produces:
  - `isPushSupported(): boolean`
  - `urlBase64ToUint8Array(base64String: string): Uint8Array`
  - `registerServiceWorker(): Promise<ServiceWorkerRegistration | null>`
  - `type OptInResult = "granted" | "denied" | "unsupported"`
  - `enablePushAlerts(watchedSpotIds: number[]): Promise<OptInResult>`
  - `interface StashedSubscription { subscription: PushSubscriptionJSON; watchedSpotIds: number[]; stashedAt: number }`
  - `stashSubscription(sub: PushSubscription, watchedSpotIds: number[]): void`
  - `readStashedSubscription(): StashedSubscription | null`

- [ ] **Step 1: Add the analytics event names**

In `lib/analytics.ts`, add to the `EventName` union after `saved_conditions_viewed`:
```ts
  | "saved_conditions_viewed"
  // Stage B push opt-in: the alert prompt was shown (after first save), and the
  // result of attempting to enable notifications. `result` distinguishes
  // granted / denied / unsupported / install_needed so we can see where the
  // funnel leaks.
  | "alert_optin_shown"
  | "alert_optin_result"
```

- [ ] **Step 2: Write the failing test**

Create `lib/push.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { urlBase64ToUint8Array, stashSubscription, readStashedSubscription } from "@/lib/push";

describe("urlBase64ToUint8Array", () => {
  it("decodes a base64url VAPID key to the right byte length", () => {
    // A real 65-byte uncompressed P-256 point encodes to 87 base64url chars.
    const key = "BDGl59-27KF2103jI6SjO5rR4QxgNfTy5ZmwohJCGJnbh7xRYaRTrYSswxm_Hf7JH-PMnWlFLb-UOoy7c74m5Dw";
    const arr = urlBase64ToUint8Array(key);
    expect(arr).toBeInstanceOf(Uint8Array);
    expect(arr.length).toBe(65);
    expect(arr[0]).toBe(4); // uncompressed point marker
  });

  it("handles base64url chars (- and _) and missing padding", () => {
    // "-_" maps to bytes 0xFB 0xFF after the +/ swap; just assert it decodes.
    const arr = urlBase64ToUint8Array("AQID"); // [1,2,3]
    expect(Array.from(arr)).toEqual([1, 2, 3]);
  });
});

describe("subscription stash", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
    });
  });

  it("round-trips a subscription + watched ids", () => {
    const fakeSub = { toJSON: () => ({ endpoint: "https://push.example/abc", keys: { p256dh: "x", auth: "y" } }) };
    stashSubscription(fakeSub as unknown as PushSubscription, [2, 3, 4]);
    const read = readStashedSubscription();
    expect(read?.subscription.endpoint).toBe("https://push.example/abc");
    expect(read?.watchedSpotIds).toEqual([2, 3, 4]);
    expect(typeof read?.stashedAt).toBe("number");
  });

  it("returns null when nothing is stashed", () => {
    expect(readStashedSubscription()).toBeNull();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run:
```bash
npm test -- lib/push.test.ts
```
Expected: FAIL, cannot resolve `@/lib/push`.

- [ ] **Step 4: Implement the push module**

Create `lib/push.ts`:
```ts
/**
 * Client-side Web Push helpers for the conditions-alert retention loop (Stage B).
 * No backend yet: a successful subscription is stashed in localStorage as the
 * seam Stage C will read and POST to /api/alerts/subscribe.
 */

const STASH_KEY = "ptw-push-subscription";

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Convert a base64url VAPID public key into the Uint8Array applicationServerKey wants. */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export interface StashedSubscription {
  subscription: PushSubscriptionJSON;
  watchedSpotIds: number[];
  stashedAt: number;
}

export function stashSubscription(sub: PushSubscription, watchedSpotIds: number[]): void {
  try {
    const payload: StashedSubscription = {
      subscription: sub.toJSON(),
      watchedSpotIds,
      stashedAt: Date.now(),
    };
    localStorage.setItem(STASH_KEY, JSON.stringify(payload));
  } catch {
    /* private mode / quota: a missing stash just means re-subscribe later */
  }
}

export function readStashedSubscription(): StashedSubscription | null {
  try {
    const raw = localStorage.getItem(STASH_KEY);
    return raw ? (JSON.parse(raw) as StashedSubscription) : null;
  } catch {
    return null;
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export type OptInResult = "granted" | "denied" | "unsupported";

/**
 * Request notification permission and create a push subscription. On success the
 * subscription + watched ids are stashed locally (Stage C will POST them).
 * Returns the outcome so the caller can log it and show the right message.
 */
export async function enablePushAlerts(watchedSpotIds: number[]): Promise<OptInResult> {
  if (!isPushSupported()) return "unsupported";
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) return "unsupported";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    }));

  stashSubscription(sub, watchedSpotIds);
  return "granted";
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run:
```bash
npm test -- lib/push.test.ts
```
Expected: PASS, 4 tests green.

- [ ] **Step 6: Verify lint + build**

Run:
```bash
npm run lint && npm run build
```
Expected: lint clean (ignore any pre-existing `.feedback-auto/` errors), build succeeds. `lib/push.ts` is not imported yet, so this only proves it compiles.

- [ ] **Step 7: Commit**

```bash
git add lib/analytics.ts lib/push.ts lib/push.test.ts
git commit -m "Add Web Push client module + opt-in analytics events (Stage B)"
```

---

## Task 2: Service worker + registration

**Files:**
- Create: `public/sw.js`
- Create: `components/ServiceWorkerRegister.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `registerServiceWorker` from `lib/push.ts` (Task 1).
- Produces: `ServiceWorkerRegister` default export (renders null); `/sw.js` served at the site root with scope `/`.

- [ ] **Step 1: Create the service worker**

Create `public/sw.js` (plain JS, served statically at `/sw.js`):
```js
/* Service worker for conditions-alert push notifications (Stage B).
   Receives a push payload { title, body, url } and shows a notification;
   clicking it focuses an open tab for that spot or opens one. */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }
  const title = data.title || "Good paddling conditions";
  const options = {
    body: data.body || "One of your saved spots looks good to paddle.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
```

- [ ] **Step 2: Create the registration component**

Create `components/ServiceWorkerRegister.tsx`:
```tsx
"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/push";

/**
 * Registers the push service worker once on load for every visit, so an
 * already-subscribed device can receive pushes without opening the prompt.
 * Renders nothing.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return null;
}
```

- [ ] **Step 3: Mount it in the layout**

In `app/layout.tsx`, add the import next to the existing `InstallPrompt` import:
```tsx
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
```
And render it right next to `<InstallPrompt />` (around line 93):
```tsx
        <ServiceWorkerRegister />
        <InstallPrompt />
```

- [ ] **Step 4: Verify lint + build**

Run:
```bash
npm run lint && npm run build
```
Expected: lint clean, build succeeds. Confirm `public/sw.js` is copied into the build output:
```bash
ls .next/standalone/public/sw.js 2>/dev/null || ls public/sw.js
```
Expected: `public/sw.js` exists (static files in `public/` are served at the root in Next.js; no build copy needed for `next start`/Vercel static serving).

- [ ] **Step 5: Manual smoke (service worker registers + displays a push)**

Run `npm run dev`, open `http://localhost:3000` in Chrome, then in DevTools:
1. Application > Service Workers: confirm `sw.js` is "activated and running" with scope `/`.
2. In the Service Workers panel, use the "Push" input (paste `{"title":"Test","body":"Stevens Creek looks calm","url":"/?spot=2"}`) and click Push.
3. Confirm an OS notification appears with that title/body.
4. Click the notification: confirm it focuses/opens the tab at `/?spot=2`.

Expected: all four hold. (This verifies the SW independently of the subscribe flow, which is Task 3.)

- [ ] **Step 6: Commit**

```bash
git add public/sw.js components/ServiceWorkerRegister.tsx app/layout.tsx
git commit -m "Add push service worker + registration on load (Stage B)"
```

---

## Task 3: Install + opt-in overhaul

**Files:**
- Rewrite: `components/InstallPrompt.tsx`
- Modify: `components/HomeClient.tsx`

**Interfaces:**
- Consumes: `isPushSupported`, `enablePushAlerts`, `readStashedSubscription`, `OptInResult` from `lib/push.ts`; `track`, `setPersona` from `lib/analytics.ts`.
- Produces: a `ptw:spotsaved` window CustomEvent (detail `{ spotName: string }`) dispatched by HomeClient and consumed by InstallPrompt.

- [ ] **Step 1: Dispatch a first-save signal from HomeClient**

In `components/HomeClient.tsx`, inside `toggleFavorite`, after the existing `track("favorite_toggled", ...)` call and within the `if (adding) { ... }` logic, dispatch the event when a spot is added. The current `toggleFavorite` adds/removes and calls `setPersona`. Add this right after the `track("favorite_toggled", {...})` call, guarded by `adding`:
```ts
      if (adding) {
        window.dispatchEvent(
          new CustomEvent("ptw:spotsaved", { detail: { spotName: spot?.water ?? "this spot" } })
        );
      }
```
(Place it before `return next;`. Keep all existing `track`/`setPersona` calls intact.)

- [ ] **Step 2: Rewrite InstallPrompt**

Replace the entire contents of `components/InstallPrompt.tsx` with:
```tsx
"use client";

import { useEffect, useState } from "react";
import { track, setPersona } from "@/lib/analytics";
import { enablePushAlerts, readStashedSubscription, type OptInResult } from "@/lib/push";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    "ptw:spotsaved": CustomEvent<{ spotName: string }>;
  }
}

const STORAGE_KEY = "ptw-install-dismissed";

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

function readFavoriteIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem("ptw-favorites") || "[]") as number[];
  } catch {
    return [];
  }
}

// standalone = installed (can enable push now); ios/android = needs install first.
type Platform = "standalone" | "ios" | "android" | null;

export default function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [spotName, setSpotName] = useState("this spot");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [result, setResult] = useState<OptInResult | null>(null);

  // Hide while a spot drawer is open (banner sits above the drawer's Get Directions).
  useEffect(() => {
    const sync = () => setDrawerOpen(document.body.dataset.drawerOpen === "true");
    sync();
    window.addEventListener("ptw:drawerchange", sync);
    return () => window.removeEventListener("ptw:drawerchange", sync);
  }, []);

  // Detect platform once. Does NOT auto-show; the prompt now appears on first save.
  useEffect(() => {
    if (isInStandaloneMode()) {
      setPersona({ installed_pwa: true });
      setPlatform("standalone");
      return;
    }
    if (isIOS()) {
      setPlatform("ios");
      return;
    }
    function handleBeforeInstall(e: BeforeInstallPromptEvent) {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform("android");
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  // Show after the first save, framed around alerts for that spot.
  useEffect(() => {
    function onSaved(e: WindowEventMap["ptw:spotsaved"]) {
      if (localStorage.getItem(STORAGE_KEY) === "1") return; // user dismissed before
      if (readStashedSubscription()) return; // already subscribed
      setSpotName(e.detail?.spotName || "this spot");
      setVisible(true);
    }
    window.addEventListener("ptw:spotsaved", onSaved);
    return () => window.removeEventListener("ptw:spotsaved", onSaved);
  }, []);

  useEffect(() => {
    if (visible && platform) track("alert_optin_shown", { platform });
  }, [visible, platform]);

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    track("pwa_installed", { platform, outcome });
    if (outcome === "accepted") {
      setPersona({ installed_pwa: true });
      setPlatform("standalone"); // now show the enable-alerts step
    }
    setDeferredPrompt(null);
  }

  async function handleEnable() {
    setEnabling(true);
    const r = await enablePushAlerts(readFavoriteIds());
    setEnabling(false);
    setResult(r);
    track("alert_optin_result", { platform, result: r });
    if (r === "granted") {
      setPersona({ alerts_enabled: true });
      setTimeout(() => setVisible(false), 1600);
    }
  }

  if (!visible || drawerOpen) return null;

  const card: React.CSSProperties = {
    background: "#1A2C36",
    color: "#FFFFFF",
    borderRadius: 14,
    padding: "12px 16px",
    maxWidth: 420,
    width: "calc(100% - 32px)",
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
    pointerEvents: "auto",
  };
  const muted = { margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.4 } as const;
  const primaryBtn: React.CSSProperties = {
    background: "#2D6A8F", color: "#fff", border: "none", borderRadius: 8,
    padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  };

  let body: React.ReactNode;
  if (result === "granted") {
    body = (
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>You are set.</p>
        <p style={muted}>We will ping you when your spots look good to paddle.</p>
      </div>
    );
  } else if (platform === "standalone") {
    body = (
      <>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
            Get a heads-up when {spotName} is good to paddle
          </p>
          <p style={muted}>
            {result === "denied"
              ? "Notifications are blocked. Enable them for this site in your browser settings."
              : "Turn on alerts and we will notify you when conditions look good."}
          </p>
        </div>
        {result !== "denied" && (
          <button onClick={handleEnable} disabled={enabling} style={primaryBtn}>
            {enabling ? "Enabling..." : "Enable alerts"}
          </button>
        )}
      </>
    );
  } else if (platform === "ios") {
    body = (
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
          Get alerts when {spotName} is good to paddle
        </p>
        <p style={muted}>
          <span>Add this app to your home screen first: tap the Share icon</span>{" "}
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle" }}>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span>, then pick &ldquo;Add to Home Screen.&rdquo; Open it from there to turn on alerts.</span>
        </p>
      </div>
    );
  } else {
    // android (beforeinstallprompt available) or unknown: offer install
    body = (
      <>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
            Get alerts when {spotName} is good to paddle
          </p>
          <p style={muted}>Install the app, then turn on alerts for your saved spots.</p>
        </div>
        {platform === "android" && (
          <button onClick={handleInstall} style={primaryBtn}>Install</button>
        )}
      </>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "env(safe-area-inset-bottom, 0px)",
        left: 0, right: 0, zIndex: 1500,
        display: "flex", justifyContent: "center",
        padding: "0 0 12px 0", pointerEvents: "none",
      }}
    >
      <div style={card}>
        <div style={{ fontSize: 26, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>🚣</div>
        {body}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          style={{
            background: "transparent", border: "none", color: "rgba(255,255,255,0.55)",
            cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 2px", flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify lint, types, tests, build**

Run:
```bash
npm run lint && npm test && npm run build
```
Expected: lint clean, all Vitest tests pass (Stage A + Task 1's push tests), build succeeds.

- [ ] **Step 4: Manual browser smoke (full flow on installed PWA / desktop Chrome)**

Run `npm run dev`, open Chrome at `http://localhost:3000`:
1. Save a spot. Confirm the prompt appears framed as "Get a heads-up when [spot name] is good to paddle" (not the old generic "Add to Home Screen"), and that an `alert_optin_shown` event is attempted (PostHog may be uninitialized in dev, that is fine; confirm via the code path / no error).
2. On desktop Chrome (treated as installable/standalone-capable): click "Enable alerts". Accept the browser permission prompt. Confirm the card switches to "You are set." and that `localStorage["ptw-push-subscription"]` now holds a subscription with an `endpoint` and `watchedSpotIds`.
3. Reload and save another spot: confirm the prompt does NOT reappear (already subscribed, `readStashedSubscription()` short-circuits).
4. In a fresh profile, save a spot then dismiss with ×: confirm `localStorage["ptw-install-dismissed"] === "1"` and it does not reappear on the next save.

Expected: all hold. If the permission prompt does not appear, confirm `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is present in `.env.local` and the dev server was restarted after it was added.

- [ ] **Step 5: Confirm the new events ship in the bundle**

Run:
```bash
grep -rho "alert_optin_shown\|alert_optin_result" .next/static | sort -u
```
Expected: both strings present.

- [ ] **Step 6: Commit**

```bash
git add components/InstallPrompt.tsx components/HomeClient.tsx
git commit -m "Overhaul install prompt into alert opt-in on first save (Stage B)"
```

---

## Self-Review

**Spec coverage (Stage B scope):**
- Install overhaul, prompt only after the first save → Task 3 Step 1 (HomeClient dispatch) + Step 2 (InstallPrompt shows on `ptw:spotsaved`, no timer). ✓
- Framed as "install to get alerts when [spot] is good" → Task 3 copy uses `spotName`. ✓
- iOS Add-to-Home-Screen steps → Task 3 `platform === "ios"` branch keeps the Share-icon instructions, reframed. ✓
- Register the service worker → Task 2 (`public/sw.js` + `ServiceWorkerRegister` mounted in layout). ✓
- Push subscription → Task 1 `enablePushAlerts` (userVisibleOnly + VAPID applicationServerKey), called from Task 3's Enable button; stashed in localStorage as the Stage C seam. ✓
- Web-push-only platform handling (installed → enable, iOS → install-first, Android → install then enable) → Task 3 render branches. ✓
- Opt-in analytics → `alert_optin_shown` + `alert_optin_result` added (Task 1) and fired (Task 3). ✓
- Client-only, no backend → no API routes; subscription stays in localStorage. ✓

**Out of scope (later stages):** `POST /api/alerts/subscribe`, Supabase, the cron watcher, real push sends. Stage B's subscription has no server destination yet by design.

**Placeholder scan:** no TBD/TODO; every code step has complete code; commands have expected output.

**Type consistency:** `OptInResult` defined in Task 1, consumed in Task 3. `StashedSubscription.subscription` is `PushSubscriptionJSON` (from `sub.toJSON()`), read back the same way. `ptw:spotsaved` CustomEvent detail `{ spotName: string }` is declared in the `WindowEventMap` augmentation (Task 3) and dispatched with that exact shape (Task 3 Step 1). `enablePushAlerts(watchedSpotIds: number[])` is called with `readFavoriteIds()` which returns `number[]`.
