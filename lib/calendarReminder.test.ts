import { describe, it, expect } from "vitest";
import { buildLaunchReminder } from "@/lib/calendarReminder";
import { windowDay, windowRange } from "@/lib/nextWindow";
import type { Spot } from "@/lib/types";
import type { GoodWindow } from "@/lib/alerts/conditions-window";

const spot = {
  id: 18,
  water: "Mission Creek / McCovey Cove",
  lat: 37.7748,
  lng: -122.3924,
  region: "San Francisco",
} as unknown as Spot;

// 2026-07-11 is a Saturday.
const w: GoodWindow = { windowKey: "2026-07-11", label: "Saturday morning", startHour: 7, endHour: 10 };

describe("windowDay / windowRange", () => {
  it("gives the full weekday and the hour range", () => {
    expect(windowDay(w)).toBe("Saturday");
    expect(windowRange(w)).toBe("7 to 10am");
  });
  it("keeps meridiem on both sides when they differ", () => {
    expect(windowRange({ ...w, startHour: 11, endHour: 13 })).toBe("11am to 1pm");
  });
});

describe("buildLaunchReminder", () => {
  const nowMs = Date.parse("2026-07-10T02:00:00Z");
  const r = buildLaunchReminder(spot, w, nowMs);

  it("sets DTSTART/DTEND from windowKey + start/end hour (floating local time)", () => {
    expect(r.ics).toContain("DTSTART:20260711T070000");
    expect(r.ics).toContain("DTEND:20260711T100000");
    expect(r.ics).not.toContain("DTSTART:20260711T070000Z"); // floating, not UTC
  });

  it("carries an alarm 30 min before the window so it fires at launch time", () => {
    expect(r.ics).toContain("BEGIN:VALARM");
    expect(r.ics).toContain("TRIGGER:-PT30M");
  });

  it("names the paddle and escapes the comma in the spot name", () => {
    // spot.water has no comma here, but the '/' is fine; verify title + geo + location
    expect(r.ics).toContain("SUMMARY:Paddle Mission Creek / McCovey Cove");
    expect(r.ics).toContain("GEO:37.7748;-122.3924");
    expect(r.ics).toContain("LOCATION:Mission Creek / McCovey Cove");
  });

  it("escapes ICS-special characters in text", () => {
    const commaSpot = { ...spot, water: "A, B; C" } as unknown as Spot;
    const r2 = buildLaunchReminder(commaSpot, w, nowMs);
    expect(r2.ics).toContain("SUMMARY:Paddle A\\, B\\; C");
  });

  it("uses CRLF line endings and a stable UID + deterministic DTSTAMP", () => {
    expect(r.ics).toContain("\r\n");
    expect(r.ics).toContain("UID:launch-18-2026-07-11@paddletowater.com");
    expect(r.ics).toContain("DTSTAMP:20260710T020000Z");
  });

  it("exposes a text/calendar data URI and a filename", () => {
    expect(r.dataUri.startsWith("data:text/calendar;charset=utf-8,")).toBe(true);
    expect(decodeURIComponent(r.dataUri.split(",").slice(1).join(","))).toBe(r.ics);
    expect(r.filename).toBe("paddle-18.ics");
  });
});
