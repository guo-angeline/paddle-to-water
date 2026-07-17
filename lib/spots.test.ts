import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ALL_SPOTS, ALL_SPOTS_INCLUDING_HIDDEN, HIDDEN_SPOTS } from "@/lib/spots";

const ROOT = path.resolve(__dirname, "..");

describe("hidden spots are withheld everywhere (2026-07-16 coordinate audit)", () => {
  it("filters hidden spots out of ALL_SPOTS but keeps the records", () => {
    expect(ALL_SPOTS_INCLUDING_HIDDEN.length).toBe(142);
    expect(ALL_SPOTS.length).toBe(ALL_SPOTS_INCLUDING_HIDDEN.length - HIDDEN_SPOTS.length);
    expect(ALL_SPOTS.every((s) => !s.hidden)).toBe(true);
  });

  it("hides 79 (Coyote Creek) and 76 (Brisbane): no confirmed public launch exists", () => {
    // 79: reverse-geocodes to a freeway; the one documented paddle from the
    // matching address was a permit-only trip into a closed section of Don
    // Edwards NWR whose own author says paddling there is unsafe and illegal.
    // 76: Brisbane's own marina page lists no ramp; coordinate is byte-identical
    // to an unsourced directory entry that itself asserts no ramp.
    // Un-hiding either needs owner sign-off, not a passing test.
    expect(ALL_SPOTS.some((s) => s.id === 79)).toBe(false);
    expect(ALL_SPOTS.some((s) => s.id === 76)).toBe(false);
  });

  it("every hidden spot documents why", () => {
    for (const s of HIDDEN_SPOTS) {
      expect(s.hidden_reason, `spot ${s.id} is hidden with no reason`).toBeTruthy();
      expect(s.hidden_reason!.length).toBeGreaterThan(40);
    }
  });

  it("no feature file imports data/spots.json directly, bypassing the filter", () => {
    // This is the real guard. A direct import silently skips the hidden check,
    // and the worst place to skip it is the alert crons, which would push or
    // email people toward a spot we deliberately withheld.
    const dirs = ["app", "components", "lib"];
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
        const rel = path.join(dir, e.name);
        if (e.isDirectory()) walk(rel);
        // Skip lib/spots.ts (the one legitimate importer) and test files (this
        // file names the forbidden string in order to search for it).
        else if (
          /\.tsx?$/.test(e.name) &&
          !/\.test\.tsx?$/.test(e.name) &&
          rel !== path.join("lib", "spots.ts")
        ) {
          if (fs.readFileSync(path.join(ROOT, rel), "utf-8").includes('from "@/data/spots.json"')) {
            offenders.push(rel);
          }
        }
      }
    };
    dirs.forEach(walk);
    expect(offenders, `import ALL_SPOTS from "@/lib/spots" instead`).toEqual([]);
  });
});

describe("owner ratings (item 39, 2026-07-16)", () => {
  const rated = ALL_SPOTS_INCLUDING_HIDDEN.filter((s) => typeof s.owner_rating === "number");

  it("carries the owner's 117 hand-entered ratings", () => {
    expect(rated.length).toBe(117);
  });

  it("does not rate spot 92, where the user may have no right to launch", () => {
    // Legal gate, 2026-07-16. 92 is 101 Surf Sports' private business dock. The
    // site's /disclaimer covers a spot "appearing" here, not a favorable rating:
    // listing is passive, a 4.3 is vouching, and the data-quality sweep says a
    // user who drives there may have no right to launch. The owner confirmed no
    // relationship with the shop. Restore a rating only once the record settles
    // what public access actually exists (sweep row 0).
    const s = ALL_SPOTS.find((x) => x.id === 92);
    expect(s, "spot 92 should still be listed, just unrated").toBeTruthy();
    expect(s!.owner_rating).toBeUndefined();
  });

  it("every rating is 1.0-5.0 at one decimal", () => {
    for (const s of rated) {
      const v = s.owner_rating!;
      expect(v, `spot ${s.id}`).toBeGreaterThanOrEqual(1);
      expect(v, `spot ${s.id}`).toBeLessThanOrEqual(5);
      // Guards a JSON round-trip or a bad merge introducing float noise
      // (4.300000000000001), which would render as "4.3" but compare unequal.
      expect(Math.round(v * 10), `spot ${s.id} is not one-decimal`).toBeCloseTo(v * 10, 9);
    }
  });

  it("never rates a hidden spot, so a rating can never reach a surface", () => {
    // Spot 79 is this project's one confirmed fabrication and the owner rated it
    // 3.9 before it was hidden, because the blank sheet was generated over
    // ALL_SPOTS_INCLUDING_HIDDEN. The rating was dropped on the owner's own call.
    // The real guard is structural: no hidden record may carry a rating at all.
    const leaked = HIDDEN_SPOTS.filter((s) => s.owner_rating !== undefined);
    expect(leaked.map((s) => s.id), "a hidden spot carries an owner_rating").toEqual([]);
    expect(ALL_SPOTS_INCLUDING_HIDDEN.find((s) => s.id === 79)?.owner_rating).toBeUndefined();
  });

  it("leaves 24 spots deliberately unrated, and that is not a gap", () => {
    // The sheet told the owner blank was the correct answer where they had not
    // paddled. An unrated spot must render nothing; it must never coerce to 0.
    const unrated = ALL_SPOTS.filter((s) => s.owner_rating === undefined);
    expect(unrated.length).toBe(ALL_SPOTS.length - rated.length);
    expect(unrated.some((s) => s.owner_rating === 0)).toBe(false);
  });

  it("is never rendered as an average or paired with a review count", () => {
    // Population of one. "Average", "reviews", "ratings" (plural) or an out-of-5
    // count next to the number would each assert a consensus that does not exist.
    // Sweep the rendered tree rather than trusting the copy we remember writing.
    const banned = /\b(average rating|avg rating|\d+\s+reviews?|\d+\s+ratings)\b/i;
    // Comments discuss the analysis (which counts ratings) and must not trip the
    // guard; only what renders can mislead a user. Strip them first.
    const stripComments = (src: string) =>
      src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
        const rel = path.join(dir, e.name);
        if (e.isDirectory()) walk(rel);
        else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) {
          const src = fs.readFileSync(path.join(ROOT, rel), "utf-8");
          if (src.includes("owner_rating") && banned.test(stripComments(src))) offenders.push(rel);
        }
      }
    };
    ["app", "components", "lib"].forEach(walk);
    expect(offenders, "owner_rating is one paddler, not an aggregate").toEqual([]);

    // Prove the guard still bites after the comment strip, or it certifies nothing.
    expect(banned.test(stripComments('const x = <p>Average rating 4.3</p>;'))).toBe(true);
    expect(banned.test(stripComments('// East Bay: 29 ratings in a 0.4 band'))).toBe(false);
  });
});
