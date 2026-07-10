import type { Spot } from "@/lib/types";
import type { GoodWindow } from "@/lib/alerts/conditions-window";

/**
 * Builds a calendar reminder (.ics) for a spot's calm launch window.
 *
 * Why a calendar event and not a scheduled push: the alert audience is
 * iOS-heavy, and iOS Safari / installed PWAs do not support the client-side
 * Notification Triggers API, so a launch-time PUSH reminder can only be sent
 * server-side (a new reminders table + a more-frequent cron), which touches the
 * PROTECTED push/cron path and re-introduces a morning wake. A calendar event
 * delivers the same "remind me when it's time to launch" value entirely on the
 * client, works on iOS, and can never become app-driven spam. The server-push
 * version is escalated separately (DECISIONS D4).
 *
 * Times are emitted as floating local time (no TZID / no Z): the paddler and
 * the spot share a timezone, so the event lands at the spot-local hour in the
 * viewer's calendar. Pure; pass `nowMs` to make DTSTAMP deterministic.
 */
export interface LaunchReminder {
  ics: string;
  dataUri: string;
  filename: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// RFC 5545 text escaping for SUMMARY / DESCRIPTION / LOCATION values.
function esc(text: string): string {
  return text.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\r?\n/g, "\\n");
}

function utcStamp(ms: number): string {
  const d = new Date(ms);
  return (
    `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}` +
    `T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`
  );
}

export function buildLaunchReminder(spot: Spot, w: GoodWindow, nowMs: number = Date.now()): LaunchReminder {
  const ymd = w.windowKey.replace(/-/g, ""); // "2026-07-11" -> "20260711"
  const dtStart = `${ymd}T${pad2(w.startHour)}0000`;
  const dtEnd = `${ymd}T${pad2(w.endHour)}0000`;
  const title = `Paddle ${spot.water}`;

  // \r\n line endings per RFC 5545. VALARM 30 min before start so the reminder
  // fires as it's time to head out.
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Paddle to Water//Launch reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:launch-${spot.id}-${w.windowKey}@paddletowater.com`,
    `DTSTAMP:${utcStamp(nowMs)}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(spot.water)}`,
    `GEO:${spot.lat};${spot.lng}`,
    `DESCRIPTION:${esc(`Calm launch window at ${spot.water}. Conditions shift fast, check before you go.`)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(`Time to launch at ${spot.water}`)}`,
    "TRIGGER:-PT30M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return {
    ics,
    dataUri: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`,
    filename: `paddle-${spot.id}.ics`,
  };
}
