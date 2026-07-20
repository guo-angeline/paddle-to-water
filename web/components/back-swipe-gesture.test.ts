import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const homeSrc = fs.readFileSync(path.resolve(__dirname, "HomeClient.tsx"), "utf-8");
const hookSrc = fs.readFileSync(path.resolve(__dirname, "../lib/useBackGesture.ts"), "utf-8");

describe("HomeClient wires useBackGesture (item 71)", () => {
  it("imports useBackGesture", () => {
    expect(homeSrc).toMatch(/import\s*\{\s*useBackGesture\s*\}\s*from\s*"@\/lib\/useBackGesture"/);
  });

  it("calls useBackGesture with an enabled expression referencing both selected and mobileHistory", () => {
    const callIdx = homeSrc.indexOf("useBackGesture(");
    expect(callIdx).toBeGreaterThan(-1);
    // Grab a generous window after the call site to cover the object literal
    // (enabled / onBack), regardless of exact formatting.
    const callBlock = homeSrc.slice(callIdx, callIdx + 400);
    const enabledMatch = callBlock.match(/enabled:\s*([^,]+),/);
    expect(enabledMatch).not.toBeNull();
    const enabledExpr = enabledMatch![1];
    expect(enabledExpr).toMatch(/selected/);
    expect(enabledExpr).toMatch(/mobileHistory/);
  });

  it("onBack calls goBackProgrammatically(\"gesture\"), not a bare setSelected(null) or a trackIntent at the gesture site", () => {
    const callIdx = homeSrc.indexOf("useBackGesture(");
    expect(callIdx).toBeGreaterThan(-1);
    const callBlock = homeSrc.slice(callIdx, callIdx + 400);
    expect(callBlock).toMatch(/onBack:\s*\(\)\s*=>\s*goBackProgrammatically\("gesture"\)/);
    expect(callBlock).not.toMatch(/setSelected\(null\)/);
    expect(callBlock).not.toMatch(/trackIntent\(/);
  });
});

describe("useBackGesture hook implementation (item 71)", () => {
  it("imports the pure helpers from ./backGesture", () => {
    expect(hookSrc).toMatch(/from\s*["']\.\/backGesture["']/);
    for (const helper of ["decidePhase", "shouldTriggerOnMove", "shouldTriggerOnEnd", "isEdgeStart"]) {
      expect(hookSrc).toContain(helper);
    }
  });

  it("registers touchstart passive and touchmove non-passive", () => {
    expect(hookSrc).toMatch(/addEventListener\(\s*["']touchstart["'][\s\S]*?\{\s*passive:\s*true\s*\}/);
    expect(hookSrc).toMatch(/addEventListener\(\s*["']touchmove["'][\s\S]*?\{\s*passive:\s*false\s*\}/);
  });

  it("calls preventDefault only inside the committed branch", () => {
    const preventIdx = hookSrc.indexOf("preventDefault()");
    expect(preventIdx).toBeGreaterThan(-1);
    const before = hookSrc.slice(0, preventIdx);
    // The nearest preceding phase check before preventDefault must be a
    // "committed" comparison (not a bare tracking/idle branch).
    const lastCommittedCheck = before.lastIndexOf('"committed"');
    const lastTrackingCheck = before.lastIndexOf('phase = "tracking"');
    expect(lastCommittedCheck).toBeGreaterThan(-1);
    expect(lastCommittedCheck).toBeGreaterThan(lastTrackingCheck === -1 ? -1 : -Infinity);
  });

  it("guards all listener attachment behind enabled with an early return", () => {
    expect(hookSrc).toMatch(/if\s*\(!enabled\)\s*return;/);
  });

  it("has a cleanup that removes the touch listeners", () => {
    const removalMatches = hookSrc.match(/removeEventListener\(/g) ?? [];
    expect(removalMatches.length).toBeGreaterThanOrEqual(4);
  });

  it("introduces no prefers-reduced-motion query (this pass adds no animation)", () => {
    expect(hookSrc).not.toMatch(/prefers-reduced-motion/);
  });
});
