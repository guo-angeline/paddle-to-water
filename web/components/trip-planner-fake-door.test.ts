import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Item 93: a fake door is only honest if it stays a fake door. These lock the
// properties the design and the item's hard constraints depend on, so a later
// "polish" edit cannot quietly turn it into a lie or an inducement.
const src = fs
  .readFileSync(path.resolve(__dirname, "TripPlannerFakeDoor.tsx"), "utf-8")
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/^\s*\/\/.*$/gm, " ");

describe("trip-planner fake door stays honest (item 93)", () => {
  it("labels its status BEFORE the tap, not only after", () => {
    // The badge sits in the button, visible pre-tap; "Not built yet" matches the
    // sheet so the badge never overpromises relative to what the sheet corrects.
    expect(src).toMatch(/Not built yet[\s\S]{0,200}<\/span>/);
  });

  it("states plainly it does not exist yet", () => {
    expect(src).toMatch(/not built yet/i);
    expect(src).toMatch(/does not exist yet/i);
  });

  it("makes no safety judgement: says nothing checked today's conditions", () => {
    // The item's one hard constraint: a placeholder must not let anyone believe
    // a route was checked for them.
    expect(src).toMatch(/has checked today.{0,8}s conditions for you/i);
  });

  it("shows no fake progress", () => {
    for (const banned of [/generating/i, /Spinner/, /loading your/i, /planning your/i]) {
      expect(src).not.toMatch(banned);
    }
  });

  it("collects no email (pure count, D33)", () => {
    expect(src).not.toMatch(/type=["']email["']/);
    expect(src).not.toMatch(/formspree/i);
  });

  it("is behind a kill switch AND self-terminates at an expiry", () => {
    expect(src).toContain('useKillSwitch("trip-planner-demand")');
    expect(src).toMatch(/EXPIRES_AT/);
    expect(src).toMatch(/if \(!on \|\| expired\) return null;/);
  });

  it("does not read as an instruction to get on the water (no-inducement)", () => {
    const literals = src.match(/"[^"]{8,}"|`[^`]{8,}`|>[^<]{8,}</g)?.join(" ") ?? "";
    for (const re of [/\bhead out\b/i, /\bget on the water\b/i, /\btime to launch\b/i, /\bgo while\b/i]) {
      expect(literals).not.toMatch(re);
    }
  });
});
