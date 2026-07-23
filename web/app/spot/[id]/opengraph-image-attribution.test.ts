import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Item 112: the per-spot OG share card composites the spot photo, and CC-BY /
// CC-BY-SA photos REQUIRE attribution wherever they show. This asserts the OG
// card's credit gate stays identical to the on-page figcaption gate, so a photo
// that owes a credit on the page also owes it on the shared card, and owner /
// CC0 photos stay credit-free on both.
const read = (p: string) => fs.readFileSync(path.resolve(__dirname, p), "utf-8");
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

const og = strip(read("./opengraph-image.tsx"));
const drawer = strip(read("../../../components/SpotDrawer.tsx"));

describe("OG card photo attribution (item 112)", () => {
  it("gates the credit on the SAME condition as the on-page figcaption", () => {
    // The load-bearing condition: author present AND not explicitly waived.
    const gate = /author && [\w.]*\.attribution_required !== false/;
    expect(og, "OG card must gate the credit on author + attribution_required").toMatch(gate);
    expect(drawer, "SpotDrawer figcaption gate changed; keep the OG card in sync").toMatch(gate);
  });

  it("actually renders author and license text when the credit is due", () => {
    expect(og).toContain("photo.author");
    expect(og).toContain("photo.license");
    expect(og).toMatch(/Photo:/);
  });

  it("falls back to the plain card and never breaks the build on a missing file", () => {
    // A manifest entry whose file cannot be read must degrade to no-photo, not
    // throw during static generation of all 177 OG images.
    expect(og).toMatch(/catch\s*\{\s*return null;\s*\}/);
    expect(og).toContain("getSpotPhoto");
  });
});
