import { evaluateGoodWindow, type GoodWindow } from "@/lib/alerts/conditions-window";
import { paddleabilityFromWind, type Paddleability } from "@/lib/conditions";
import type { RawHourly } from "@/lib/todaysShape";
import type { Spot } from "@/lib/types";

/**
 * Item 61. "Good to paddle today": is there still a calm daytime window LEFT
 * today at this spot, and how does it read right now. Both signals come from the
 * ONE hourly payload `getHourlyPeriods` already caches (lib/nextWindow.ts), so a
 * candidate set of K spots costs K hourly fetches, never a per-signal doubling.
 *
 * The "good enough to surface" bar is `evaluateGoodWindow` itself, the SAME calm
 * -window definition the push cron and the drawer use (acceptance: the threshold
 * must equal the calm-window definition, never a second one). Pure, DOM-free.
 */

export interface GoodTodaySignal {
  /** A calm daytime window (per evaluateGoodWindow) still lies ahead TODAY. */
  goodToday: boolean;
  /** How the current hour reads, for the row's live badge. */
  nowPaddleability: Paddleability;
  /** The soonest calm window; when goodToday it is today's, for ranking/copy. */
  window: GoodWindow | null;
}

/** Peak wind mph, fail-closed (mirrors the alert path / todaysShape): a missing
 * or unparseable reading is NOT calm. */
function parseMaxWind(raw: string | undefined): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s.toLowerCase() === "calm") return 0;
  const nums = (s.match(/\d+/g) ?? []).map(Number);
  return nums.length ? Math.max(...nums) : null;
}

/** Spot-local date (YYYY-MM-DD) of the hour containing now, or the first hour
 * still ahead when now precedes the forecast. Null when the forecast is empty or
 * entirely past. Read straight off the offset-bearing ISO, like the alert path. */
function currentLocalDate(periods: RawHourly[], nowMs: number): string | null {
  const HOUR = 3600000;
  for (const p of periods) {
    const ms = Date.parse(p.startTime);
    if (Number.isNaN(ms)) continue;
    if (ms <= nowMs && ms + HOUR > nowMs) return p.startTime.slice(0, 10);
  }
  for (const p of periods) {
    const ms = Date.parse(p.startTime);
    if (Number.isNaN(ms)) continue;
    if (ms + HOUR > nowMs) return p.startTime.slice(0, 10);
  }
  return null;
}

/** The current-hour period (contains now), else the first hour still ahead. */
function currentPeriod(periods: RawHourly[], nowMs: number): RawHourly | null {
  const HOUR = 3600000;
  for (const p of periods) {
    const ms = Date.parse(p.startTime);
    if (!Number.isNaN(ms) && ms <= nowMs && ms + HOUR > nowMs) return p;
  }
  for (const p of periods) {
    const ms = Date.parse(p.startTime);
    if (!Number.isNaN(ms) && ms + HOUR > nowMs) return p;
  }
  return null;
}

export function evaluateGoodToday(periods: RawHourly[], nowMs: number): GoodTodaySignal {
  const window = evaluateGoodWindow(periods, nowMs);
  const today = currentLocalDate(periods, nowMs);
  const goodToday = !!window && today !== null && window.windowKey === today;

  const cur = currentPeriod(periods, nowMs);
  const mph = cur ? parseMaxWind(cur.windSpeed) : null;
  const nowPaddleability: Paddleability = mph === null ? "unknown" : paddleabilityFromWind(mph);

  return { goodToday, nowPaddleability, window };
}

export interface GoodTodayEntry {
  spot: Spot;
  signal: GoodTodaySignal;
  /** Miles from the user, when geolocated. Absent otherwise. */
  distanceMi?: number;
}

/** Rank of a paddleability for ordering (calm first). */
const PADDLE_ORDER: Record<Paddleability, number> = { calm: 0, breezy: 1, windy: 2, unknown: 3 };

/**
 * Pick the spots worth surfacing: only those good today, best first, capped at
 * `limit`. When distances are present (geolocated) nearest wins, because "where
 * should I go today" is a proximity question; ties and the no-distance case fall
 * back to the calmer current reading, then the earlier window start. Pure, never
 * mutates the input.
 */
export function selectGoodToday(entries: GoodTodayEntry[], limit = 3): GoodTodayEntry[] {
  return entries
    .filter((e) => e.signal.goodToday)
    .sort((a, b) => {
      if (a.distanceMi != null && b.distanceMi != null && a.distanceMi !== b.distanceMi) {
        return a.distanceMi - b.distanceMi;
      }
      const pa = PADDLE_ORDER[a.signal.nowPaddleability] - PADDLE_ORDER[b.signal.nowPaddleability];
      if (pa !== 0) return pa;
      return (a.signal.window?.startHour ?? 99) - (b.signal.window?.startHour ?? 99);
    })
    .slice(0, limit);
}
