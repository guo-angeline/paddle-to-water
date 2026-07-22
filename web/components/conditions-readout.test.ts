import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Item 97. The weather-line and storm-badge copy rules live as string logic in
// ConditionsPanel.tsx, which has no render harness here. These assert the rules
// against the source, the same way the reviews guards do. Comments are stripped
// first so a guard never reads its own explanation as the code (this suite's
// sibling has been burned by that exact thing).
const src = fs
  .readFileSync(path.resolve(__dirname, "ConditionsPanel.tsx"), "utf-8")
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/^\s*\/\/.*$/gm, " ");

describe("conditions readout copy rules (item 97)", () => {
  it("labels the temperature as Air, never a bare number", () => {
    // A bare degrees value could be read as water temp, which the app does not
    // have and which is the real cold-shock variable.
    expect(src).toContain("Air ${wind.tempF}F");
  });

  it("shows the rain clause only at >= 20% and never under a storm badge", () => {
    expect(src).toMatch(/!stormy && wind\.precipPct !== null && wind\.precipPct >= 20/);
  });

  it("gates the whole readout on one kill switch, reverting to today's copy when off", () => {
    // readoutOn=false must return the pre-bundle weather line and the old single
    // failure string, so a PostHog disable is a true revert with no redeploy.
    expect(src).toContain('useKillSwitch("conditions-readout")');
    expect(src).toMatch(/if \(!readoutOn\) return base;/);
    expect(src).toContain("Wind forecast unavailable.");
  });

  it("splits the two wind failure states, but only when the readout is on", () => {
    expect(src).toContain("No forecast available for this spot.");
    expect(src).toContain("Wind data is unavailable right now.");
    // The split is gated: `!readoutOn` short-circuits to the old string first.
    expect(src).toMatch(/!readoutOn \?[\s\S]*Wind forecast unavailable/);
  });

  it("storm badge is mutually exclusive with the paddleability pill", () => {
    // One slot. `stormy ? <badge> : (pill)`, never both stacked.
    expect(src).toMatch(/stormy \? \([\s\S]*Storm risk[\s\S]*\) : \(\s*isFlatwater/);
  });

  it("storm badge itself is gated, so an off switch shows no badge", () => {
    expect(src).toContain("readoutOn && isStormyForecast(wind.shortForecast)");
  });
});
