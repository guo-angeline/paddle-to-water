import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const src = fs.readFileSync(path.resolve(__dirname, "HomeClient.tsx"), "utf-8");

describe("HomeClient strips the email subscription token regardless of spot resolution (item 47 legal gate follow-up)", () => {
  it("guards the email open ping on from/token only, not on `found`", () => {
    // lib/spots.ts filters `hidden` spots out of ALL_SPOTS, so a spot hidden
    // after an alert/email send resolves `found` to undefined. The ping (and
    // the strip below) must not depend on `found`, or a hidden-spot arrival
    // leaks a live subscription token into $current_url (PostHogProvider)
    // and browser history forever.
    expect(src).toContain('if (from === "email" && token) {');
  });

  it("guards the strip on from being alert or email, not on `found`", () => {
    const pingGuardIdx = src.indexOf('if (from === "email" && token) {');
    const stripGuardIdx = src.indexOf('if ((from === "alert" || from === "email") && token) {');
    const deleteTIdx = src.indexOf('params.delete("t")');

    expect(pingGuardIdx).toBeGreaterThan(-1);
    expect(stripGuardIdx).toBeGreaterThan(-1);
    // Ping fires first, strip is issued after, same as an alert-path open.
    expect(pingGuardIdx).toBeLessThan(stripGuardIdx);
    expect(stripGuardIdx).toBeLessThan(deleteTIdx);
  });

  it("calls reportEmailOpen with an optional spot id so an unresolved (hidden) spot still pings and strips", () => {
    expect(src).toMatch(/reportEmailOpen\(token,\s*found\?\.id\)/);
  });
});
