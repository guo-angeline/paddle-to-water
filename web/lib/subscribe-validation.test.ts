import { describe, it, expect } from "vitest";
import { validateSubscribePayload } from "@/lib/subscribe-validation";

const good = {
  anonId: "abc-123",
  subscription: { endpoint: "https://push.example/x", keys: { p256dh: "p", auth: "a" } },
  watchedSpotIds: [2, 3],
};

describe("validateSubscribePayload", () => {
  it("accepts a well-formed payload", () => {
    const r = validateSubscribePayload(good);
    expect(r.ok).toBe(true);
    if (r.ok && r.value.kind === "webpush") {
      expect(r.value.subscription.endpoint).toBe("https://push.example/x");
    } else {
      expect.fail("expected ok webpush payload");
    }
  });

  it("accepts a missing anonId (optional)", () => {
    const { ...noAnon } = good;
    delete (noAnon as { anonId?: string }).anonId;
    expect(validateSubscribePayload(noAnon).ok).toBe(true);
  });

  it("rejects a missing endpoint", () => {
    const bad = { ...good, subscription: { keys: { p256dh: "p", auth: "a" } } };
    const r = validateSubscribePayload(bad);
    expect(r.ok).toBe(false);
  });

  it("rejects missing keys", () => {
    const bad = { ...good, subscription: { endpoint: "https://push.example/x" } };
    expect(validateSubscribePayload(bad).ok).toBe(false);
  });

  it("rejects non-numeric watchedSpotIds", () => {
    const bad = { ...good, watchedSpotIds: [2, "x"] };
    expect(validateSubscribePayload(bad).ok).toBe(false);
  });

  it("rejects a non-object body", () => {
    expect(validateSubscribePayload(null).ok).toBe(false);
    expect(validateSubscribePayload("nope").ok).toBe(false);
  });

  it("defaults watchedSpotIds to [] when absent", () => {
    const r = validateSubscribePayload({ subscription: good.subscription });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.watchedSpotIds).toEqual([]);
  });

  it("rejects an array longer than MAX_WATCHED (201 elements)", () => {
    const tooMany = { ...good, watchedSpotIds: Array.from({ length: 201 }, (_, i) => i + 1) };
    const r = validateSubscribePayload(tooMany);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("watchedSpotIds exceeds maximum length");
  });

  it("accepts exactly MAX_WATCHED (200) elements", () => {
    const exactly = { ...good, watchedSpotIds: Array.from({ length: 200 }, (_, i) => i + 1) };
    expect(validateSubscribePayload(exactly).ok).toBe(true);
  });

  it("rejects [2, 0] (zero is not a positive integer)", () => {
    const r = validateSubscribePayload({ ...good, watchedSpotIds: [2, 0] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("watchedSpotIds must be an array of numbers");
  });

  it("rejects [2, -1] (negative)", () => {
    const r = validateSubscribePayload({ ...good, watchedSpotIds: [2, -1] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("watchedSpotIds must be an array of numbers");
  });

  it("rejects [2, 1.5] (float)", () => {
    const r = validateSubscribePayload({ ...good, watchedSpotIds: [2, 1.5] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("watchedSpotIds must be an array of numbers");
  });

  it("rejects [2, NaN]", () => {
    const r = validateSubscribePayload({ ...good, watchedSpotIds: [2, NaN] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("watchedSpotIds must be an array of numbers");
  });
});

describe("validateSubscribePayload: expo transport (native app)", () => {
  const expoBody = {
    anonId: "abc",
    expoToken: "ExponentPushToken[AbC-123_xyz]",
    watchedSpotIds: [1, 2],
  };

  it("accepts a well-formed expo payload and tags kind", () => {
    const r = validateSubscribePayload(expoBody);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.kind).toBe("expo");
      if (r.value.kind === "expo") expect(r.value.expoToken).toBe(expoBody.expoToken);
      expect(r.value.watchedSpotIds).toEqual([1, 2]);
    }
  });

  it("tags the classic web shape as kind webpush", () => {
    const r = validateSubscribePayload({
      subscription: { endpoint: "https://push.example/e", keys: { p256dh: "p", auth: "a" } },
      watchedSpotIds: [],
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.kind).toBe("webpush");
  });

  it("rejects a malformed expo token", () => {
    expect(validateSubscribePayload({ ...expoBody, expoToken: "not-a-token" }).ok).toBe(false);
    expect(validateSubscribePayload({ ...expoBody, expoToken: "ExponentPushToken[bad chars!]" }).ok).toBe(false);
  });

  it("rejects an oversized expo token", () => {
    const r = validateSubscribePayload({ ...expoBody, expoToken: `ExponentPushToken[${"x".repeat(300)}]` });
    expect(r.ok).toBe(false);
  });

  it("rejects both subscription and expoToken together", () => {
    const r = validateSubscribePayload({
      ...expoBody,
      subscription: { endpoint: "https://push.example/e", keys: { p256dh: "p", auth: "a" } },
    });
    expect(r.ok).toBe(false);
  });

  it("still validates watchedSpotIds on the expo branch", () => {
    expect(validateSubscribePayload({ ...expoBody, watchedSpotIds: ["x"] }).ok).toBe(false);
  });
});
