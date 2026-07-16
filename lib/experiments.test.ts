import { describe, expect, it } from "vitest";
import { EXPERIMENTS } from "@/lib/experiments";

describe("EXPERIMENTS registry", () => {
  it("registers enrollment_dual_cta with control-first variants", () => {
    expect(EXPERIMENTS.enrollment_dual_cta).toMatchObject({
      flag: "enrollment-dual-cta",
      variants: ["control", "treatment"],
      primaryMetric: "alert_optin_result",
      guardrails: ["email_capture_submitted", "alert_optin_dismissed"],
    });
    expect(EXPERIMENTS.enrollment_dual_cta.variants[0]).toBe("control");
  });

  it("registers spot_sheet_full_height with control-first variants (item 42)", () => {
    expect(EXPERIMENTS.spot_sheet_full_height).toMatchObject({
      flag: "spot-sheet-full-height",
      variants: ["control", "treatment"],
      primaryMetric: "spot_action",
      guardrails: ["spot_sheet_dismissed", "conditions_loaded", "favorite_toggled"],
    });
    expect(EXPERIMENTS.spot_sheet_full_height.variants[0]).toBe("control");
  });
});
