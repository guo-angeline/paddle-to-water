import { describe, it, expect } from "vitest";
import { parseLinkBody } from "./link-validation";

describe("parseLinkBody (item 44 migrate-on-sign-in payload)", () => {
  it("accepts a clean payload", () => {
    const r = parseLinkBody({ anonId: "abc-123", savedSpotIds: [1, 2, 3] });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.anonId).toBe("abc-123");
      expect(r.value.savedSpotIds).toEqual([1, 2, 3]);
    }
  });

  it("dedupes and drops non-positive / non-integer spot ids", () => {
    const r = parseLinkBody({ anonId: "x", savedSpotIds: [1, 1, 2, 0, -3, 2.5, "4", null] });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.savedSpotIds).toEqual([1, 2]);
  });

  it("treats a missing/blank/oversized anonId as null (anonymous rows just aren't claimed)", () => {
    for (const anonId of [undefined, "", "a".repeat(101), 123]) {
      const r = parseLinkBody({ anonId, savedSpotIds: [] });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.anonId).toBeNull();
    }
  });

  it("caps the saved list so a signed-in device can't dump unbounded rows", () => {
    const many = Array.from({ length: 900 }, (_, i) => i + 1);
    const r = parseLinkBody({ anonId: "x", savedSpotIds: many });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.savedSpotIds.length).toBe(500);
  });

  it("rejects a non-array savedSpotIds and a non-object body", () => {
    expect(parseLinkBody({ anonId: "x", savedSpotIds: "nope" }).ok).toBe(false);
    expect(parseLinkBody(null).ok).toBe(false);
    expect(parseLinkBody(42).ok).toBe(false);
  });
});
