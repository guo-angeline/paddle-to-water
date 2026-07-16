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
