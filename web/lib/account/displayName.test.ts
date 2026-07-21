import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { validateDisplayName, MAX_DISPLAY_NAME } from "./displayName";

describe("display name validation (item 77)", () => {
  it("treats blank as 'no byline', never as a reason to fall back", () => {
    for (const blank of ["", "   ", null, undefined]) {
      const r = validateDisplayName(blank);
      expect(r.ok).toBe(true);
      expect(r.ok && r.value).toBe("");
    }
  });

  it("rejects anything containing an @, so an address cannot become a byline", () => {
    const r = validateDisplayName("qg47@cornell.edu");
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.error).toMatch(/email/i);
  });

  it("keeps ordinary names, including non-Latin scripts and punctuation", () => {
    for (const name of ["Ana", "Jean-Luc", "O'Brien", "郭 安", "paddler_22"]) {
      const r = validateDisplayName(name);
      expect(r.ok, `${name} should be valid`).toBe(true);
    }
  });

  it("collapses whitespace so a name cannot be stretched across a card", () => {
    const r = validateDisplayName("  Bay    Paddler  ");
    expect(r.ok && r.value).toBe("Bay Paddler");
  });

  it("enforces the length bounds", () => {
    expect(validateDisplayName("a").ok).toBe(false);
    expect(validateDisplayName("x".repeat(MAX_DISPLAY_NAME)).ok).toBe(true);
    expect(validateDisplayName("x".repeat(MAX_DISPLAY_NAME + 1)).ok).toBe(false);
  });

  it("rejects markup and punctuation-only names", () => {
    expect(validateDisplayName("<b>hi</b>").ok).toBe(false);
    expect(validateDisplayName("---").ok).toBe(false);
  });
});

describe("the email-derived byline is gone for good (item 77)", () => {
  const route = fs.readFileSync(
    path.resolve(__dirname, "../../app/api/reviews/route.ts"),
    "utf-8"
  );

  it("the review route never splits an address into a byline", () => {
    // The exact line this item exists to delete:
    //   const displayName = email ? email.split("@")[0] : null;
    expect(route).not.toMatch(/email[^\n]*\.split\("@"\)/);
    expect(route).not.toMatch(/display_name:\s*\w*[Ee]mail/);
  });

  it("the byline comes from the validated chosen name", () => {
    expect(route).toContain("validateDisplayName");
  });
});
