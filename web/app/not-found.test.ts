import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Item 73: the custom 404 must recover a stale/hidden /spot/<id> arrival with
// branding and a working path home, instead of the bare Next.js default.
const src = fs.readFileSync(path.resolve(__dirname, "not-found.tsx"), "utf-8");

describe("custom 404 page (item 73)", () => {
  it("exports a default not-found component", () => {
    expect(src).toMatch(/export default function NotFound\(/);
  });

  it("gives at least one way home (a link to /)", () => {
    // Both the masthead and the primary CTA link home; require at least the CTA.
    const homeLinks = src.match(/href="\/"/g) ?? [];
    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    expect(src).toContain("Browse all spots");
  });

  it("carries the Paddle to Water brand + house fonts", () => {
    expect(src).toContain("Paddle to Water");
    expect(src).toContain("Newsreader");
    expect(src).toContain("/icon-192.png");
  });

  it("shows the friendly shared message (works for hidden spot or typo)", () => {
    expect(src).toContain("find that spot");
  });

  it("uses the Meltwater accent token, not a hardcoded color", () => {
    expect(src).toContain("var(--accent)");
  });

  it("has no em dashes (house rule)", () => {
    expect(src).not.toContain("—");
  });
});
