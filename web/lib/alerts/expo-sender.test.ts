import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// The module guards itself with "server-only", which vitest has no loader for;
// stub it the same way supabase-server tests would.
vi.mock("server-only", () => ({}));

import { sendExpoPushes, sendExpoPush, type ExpoPushMessage } from "./expo-sender";

function msg(i: number): ExpoPushMessage {
  return {
    to: `ExponentPushToken[tok${i}]`,
    title: "t",
    body: "b",
    data: { url: `/?spot=${i}` },
  };
}

function okResponse(tickets: unknown[]) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ data: tickets }),
  } as Response;
}

describe("sendExpoPushes", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps ok tickets to ok results, in order", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      okResponse([{ status: "ok", id: "1" }, { status: "ok", id: "2" }])
    );
    const results = await sendExpoPushes([msg(1), msg(2)]);
    expect(results).toEqual([
      { ok: true, gone: false, error: null },
      { ok: true, gone: false, error: null },
    ]);
  });

  it("flags DeviceNotRegistered as gone (the disable signal)", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      okResponse([
        { status: "error", message: "x", details: { error: "DeviceNotRegistered" } },
        { status: "ok", id: "2" },
      ])
    );
    const results = await sendExpoPushes([msg(1), msg(2)]);
    expect(results[0]).toEqual({ ok: false, gone: true, error: "DeviceNotRegistered" });
    expect(results[1].ok).toBe(true);
  });

  it("marks other ticket errors as failed but NOT gone (retryable)", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      okResponse([{ status: "error", details: { error: "MessageRateExceeded" } }])
    );
    const [r] = await sendExpoPushes([msg(1)]);
    expect(r).toEqual({ ok: false, gone: false, error: "MessageRateExceeded" });
  });

  it("chunks at 100 messages per request", async () => {
    const f = fetch as ReturnType<typeof vi.fn>;
    f.mockImplementation(async (_url: string, init: RequestInit) => {
      const batch = JSON.parse(init.body as string) as unknown[];
      return okResponse(batch.map(() => ({ status: "ok" })));
    });
    const results = await sendExpoPushes(Array.from({ length: 250 }, (_, i) => msg(i)));
    expect(f).toHaveBeenCalledTimes(3);
    const sizes = f.mock.calls.map((c) => (JSON.parse(c[1].body as string) as unknown[]).length);
    expect(sizes).toEqual([100, 100, 50]);
    expect(results).toHaveLength(250);
    expect(results.every((r) => r.ok)).toBe(true);
  });

  it("adds sound: default to each message (iOS audible alert)", async () => {
    const f = fetch as ReturnType<typeof vi.fn>;
    f.mockResolvedValue(okResponse([{ status: "ok" }]));
    await sendExpoPushes([msg(1)]);
    const sent = JSON.parse(f.mock.calls[0][1].body as string);
    expect(sent[0].sound).toBe("default");
    expect(sent[0].to).toBe("ExponentPushToken[tok1]");
    expect(sent[0].data).toEqual({ url: "/?spot=1" });
  });

  it("survives an HTTP-level failure without throwing or marking gone", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({}),
    } as Response);
    const [r] = await sendExpoPushes([msg(1)]);
    expect(r).toEqual({ ok: false, gone: false, error: "http 502" });
  });

  it("survives a network throw without rejecting", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("ECONNRESET"));
    const [r] = await sendExpoPushes([msg(1)]);
    expect(r).toEqual({ ok: false, gone: false, error: "ECONNRESET" });
  });

  it("sendExpoPush wraps a single message", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(okResponse([{ status: "ok" }]));
    const r = await sendExpoPush("ExponentPushToken[solo]", { title: "t", body: "b", url: "/x" });
    expect(r.ok).toBe(true);
  });
});
