import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getSpotListEmptyState } from "./SpotList";

const source = fs.readFileSync(path.resolve(__dirname, "SpotList.tsx"), "utf-8");

describe("SpotList zero-match state", () => {
  it.each([
    ["all empty", 0, 0, 0, "full"],
    ["zero incoming with saved", 0, 1, 0, "inline"],
    ["zero incoming with recent", 0, 0, 1, "inline"],
    ["zero incoming with saved and recent", 0, 1, 1, "inline"],
    ["nonzero incoming entirely pinned", 1, 1, 0, null],
    ["normal results", 1, 0, 0, null],
  ] as const)("returns the expected state for %s", (_label, spots, saved, recent, expected) => {
    expect(getSpotListEmptyState(spots, saved, recent)).toBe(expected);
  });

  it("places the accessible inline state after pinned content and before the legal footer", () => {
    const recentSection = source.indexOf("Recently checked (item 26)");
    const inlineState = source.indexOf("Inline zero-match state");
    const legalFooter = source.indexOf("The FULL-SIZE copy of the legal links");
    expect(recentSection).toBeLessThan(inlineState);
    expect(inlineState).toBeLessThan(legalFooter);

    expect(source.match(/role="status"/g)).toHaveLength(2);
    // Two empty-state status regions, plus the item-61 good-today section's own
    // sr-only aria-live announcement (which carries no role="status"/aria-atomic).
    expect(source.match(/aria-live="polite"/g)).toHaveLength(3);
    expect(source.match(/aria-atomic="true"/g)).toHaveLength(2);
    expect(source.match(/min-h-11/g)).toHaveLength(2);
    expect(source.match(/focus-visible:outline /g)).toHaveLength(2);
  });
});
