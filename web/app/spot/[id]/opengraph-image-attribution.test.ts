import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Item 112: the per-spot OG share card composites the spot photo. Compositing
// makes it a MODIFIED derivative, so CC BY / BY-SA require a modification
// indicator, and BY-SA share-alike attaches to the composite. The 2026-07-22 IP
// gate required these; this guards them so the obligation cannot silently
// regress the way the on-page figcaption is guarded by spot-photos.test.ts.
const read = (p: string) => fs.readFileSync(path.resolve(__dirname, p), "utf-8");
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

const og = strip(read("./opengraph-image.tsx"));
const drawer = strip(read("../../../components/SpotDrawer.tsx"));

describe("OG card photo attribution (item 112, IP gate)", () => {
  it("gates the credit on the SAME condition as the on-page figcaption", () => {
    // Same semantics, different polarity: the drawer renders the credit on the
    // positive gate; buildCredit early-returns null on its negation. Both must
    // still key on author AND attribution_required, so dropping the licence
    // check from either fails here.
    expect(drawer, "SpotDrawer figcaption gate changed").toMatch(/author && [\w.]*\.attribution_required !== false/);
    expect(og, "OG buildCredit must still guard on author").toMatch(/!photo\.author/);
    expect(og, "OG buildCredit must still guard on attribution_required").toMatch(/attribution_required === false/);
  });

  it("marks the composite as modified (CC BY / BY-SA modification indicator)", () => {
    // Required by the IP gate: the gradient + text overlay is a modification, and
    // every CC BY/BY-SA licence requires saying so.
    expect(og).toMatch(/\(modified\)/);
  });

  it("renders author, license, and source in the credit", () => {
    expect(og).toContain("photo.author");
    expect(og).toContain("photo.license");
    expect(og).toContain("photo.source");
    expect(og).toMatch(/Photo:/);
  });

  it("never breaks static generation on a missing file", () => {
    expect(og).toMatch(/catch\s*\{\s*return null;\s*\}/);
    expect(og).toContain("getSpotPhoto");
  });
});
