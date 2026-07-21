import { describe, it, expect, beforeEach, vi } from "vitest";
import { syncSavedSpots, savesMigrated } from "./savedSync";

// Item 76. The merge rule is the whole feature: union once, then let the server
// win. Get it wrong and you either lose someone's saves or resurrect the ones
// they deleted on another device, both silently.

function fakeLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
}

const USER = "user-1";

/** Stub fetch: GET returns `serverIds`; POST/DELETE record calls. */
function stubFetch(serverIds: number[], opts: { failWrites?: boolean } = {}) {
  const posted: number[] = [];
  const deleted: number[] = [];
  const fetchMock = vi.fn(async (input: string, init?: { method?: string }) => {
    const method = init?.method ?? "GET";
    if (method === "GET") {
      return { ok: true, json: async () => ({ spotIds: serverIds }) } as unknown as Response;
    }
    if (method === "POST") {
      if (!opts.failWrites) posted.push(-1); // recorded below via body parse
      return { ok: !opts.failWrites } as unknown as Response;
    }
    if (method === "DELETE") {
      deleted.push(Number(new URL(input, "http://x").searchParams.get("spot_id")));
      return { ok: true } as unknown as Response;
    }
    return { ok: false } as unknown as Response;
  });
  return { fetchMock, posted, deleted };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", fakeLocalStorage());
});

describe("first sync for an account on this device", () => {
  it("UNIONS local saves up instead of letting the server erase them", async () => {
    // Local has 1,2 from before the account existed. Server knows only 3.
    const bodies: number[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: string, init?: { method?: string; body?: string }) => {
        if ((init?.method ?? "GET") === "GET") {
          return { ok: true, json: async () => ({ spotIds: [3] }) } as unknown as Response;
        }
        bodies.push(JSON.parse(init!.body!).spotId);
        return { ok: true } as unknown as Response;
      })
    );

    const result = await syncSavedSpots(USER, [1, 2]);

    expect([...result!].sort()).toEqual([1, 2, 3]);
    expect(bodies.sort()).toEqual([1, 2]); // both local-only saves uploaded
    expect(savesMigrated(USER)).toBe(true);
  });

  it("does NOT mark the migration done if an upload failed, so it retries", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: string, init?: { method?: string }) => {
        if ((init?.method ?? "GET") === "GET") {
          return { ok: true, json: async () => ({ spotIds: [] }) } as unknown as Response;
        }
        return { ok: false } as unknown as Response; // write rejected
      })
    );

    await syncSavedSpots(USER, [7]);
    expect(savesMigrated(USER)).toBe(false);
  });
});

describe("every sync after the first", () => {
  it("lets the SERVER win, so a delete on another device stays deleted", async () => {
    localStorage.setItem("ptw-saves-migrated", JSON.stringify([USER]));
    const { fetchMock } = stubFetch([1, 3]);
    vi.stubGlobal("fetch", fetchMock);

    // This device still thinks 2 is saved; the server says it is gone.
    const result = await syncSavedSpots(USER, [1, 2, 3]);

    expect([...result!].sort()).toEqual([1, 3]);
    expect(result!.has(2)).toBe(false);
    // and it must not have re-uploaded the stale local id
    const writes = fetchMock.mock.calls.filter((c) => (c[1]?.method ?? "GET") !== "GET");
    expect(writes).toHaveLength(0);
  });

  it("picks up a spot saved on another device", async () => {
    localStorage.setItem("ptw-saves-migrated", JSON.stringify([USER]));
    vi.stubGlobal("fetch", stubFetch([1, 9]).fetchMock);

    const result = await syncSavedSpots(USER, [1]);
    expect([...result!].sort()).toEqual([1, 9]);
  });
});

describe("when the server cannot be reached", () => {
  it("returns null so the caller leaves local state alone", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    expect(await syncSavedSpots(USER, [1, 2])).toBeNull();
  });

  it("returns null on a non-OK response rather than reporting zero saves", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false }) as unknown as Response));
    expect(await syncSavedSpots(USER, [1, 2])).toBeNull();
  });
});
