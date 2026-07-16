import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const src = fs.readFileSync(path.resolve(__dirname, "HomeClient.tsx"), "utf-8");
const drawerSrc = fs.readFileSync(path.resolve(__dirname, "SpotDrawer.tsx"), "utf-8");

describe("Mobile spot sheet opens full height for all opens (item 42, spot_sheet_full_height flag)", () => {
  it("wires the spot_sheet_full_height experiment and exposure logging", () => {
    expect(src).toContain('useExperiment("spot_sheet_full_height")');
    expect(src).toContain("logExposure");
  });

  it("reuses the existing startExpanded prop instead of a parallel mechanism", () => {
    expect(src).toContain("startExpanded={startExpanded}");
    // SpotDrawer's prop surface is untouched: no second height-control prop introduced.
    expect(drawerSrc).not.toMatch(/forceFullHeight|fullHeightFlag|spotSheetVariant/);
  });

  it("excludes alert and email arrivals from the flag-driven expansion (item 9 exclusion preserved)", () => {
    expect(src).toContain('from !== "alert" && from !== "email"');
  });

  it("keeps the share arrival unconditionally expanded, unaffected by the flag", () => {
    // The share branch still exists and still forces startExpanded true.
    expect(src).toMatch(/from === "share"[\s\S]{0,500}setStartExpanded\(true\)/);
  });

  it("gates the flag-driven expansion on the mobile breakpoint", () => {
    expect(src).toContain('(max-width: 767px)');
  });
});
