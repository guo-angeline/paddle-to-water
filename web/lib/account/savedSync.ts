// Item 76: saved-spot sync across devices.
//
// Before this, `/api/account/link` uploaded a device's localStorage saves and
// NOTHING ever read `user_saved_spots` back, so the sign-in sheet's "sync your
// saved spots across devices" was false: signing in on a second device showed
// an empty map. This module is the missing half.
//
// The merge rule is the whole design, and getting it wrong is silent data loss
// in one direction or zombie saves in the other:
//
//   FIRST sync for an account on this device  -> UNION local into the server.
//     Local saves predate the account (made while signed out) and must not be
//     thrown away just because the server has not heard of them yet.
//
//   EVERY sync after that                     -> SERVER REPLACES local.
//     Now a spot that is on this device but not on the server means the user
//     deleted it somewhere else. Unioning here would resurrect it forever, and
//     deletes would never propagate.
//
// The "have we done the first sync" flag is per (device, account), stored
// locally, because it is a fact about this device's localStorage, not about the
// account.

const MIGRATED_KEY = "ptw-saves-migrated";

export function savesMigrated(userId: string): boolean {
  try {
    const raw = localStorage.getItem(MIGRATED_KEY);
    return raw ? (JSON.parse(raw) as unknown[]).includes(userId) : false;
  } catch {
    return false;
  }
}

export function markSavesMigrated(userId: string) {
  try {
    const raw = localStorage.getItem(MIGRATED_KEY);
    const list = raw
      ? (JSON.parse(raw) as unknown[]).filter((v): v is string => typeof v === "string")
      : [];
    if (!list.includes(userId)) {
      localStorage.setItem(MIGRATED_KEY, JSON.stringify([...list, userId]));
    }
  } catch {
    /* private mode: the union runs again next load, which is safe, just repeated */
  }
}

/**
 * Reconcile this device's saves with the account's.
 * Returns the set the UI should now show, or null if the server could not be
 * reached (callers must then leave local state alone rather than wiping it).
 */
export async function syncSavedSpots(
  userId: string,
  localIds: number[]
): Promise<Set<number> | null> {
  let server: Set<number>;
  try {
    const res = await fetch("/api/account/saved");
    if (!res.ok) return null;
    const json = (await res.json()) as { spotIds?: number[] };
    server = new Set(json.spotIds ?? []);
  } catch {
    return null; // offline: keep whatever is on screen
  }

  if (!savesMigrated(userId)) {
    const localOnly = localIds.filter((id) => !server.has(id));
    const uploaded = await Promise.all(localOnly.map((id) => pushSave(id)));
    // Only claim the migration happened if every upload landed. A partial
    // failure must retry next load, not silently drop saves.
    localOnly.forEach((id, i) => {
      if (uploaded[i]) server.add(id);
    });
    if (uploaded.every(Boolean)) markSavesMigrated(userId);
  }

  return server;
}

/** Write-through: save one spot to the account. Resolves false on failure. */
export async function pushSave(spotId: number): Promise<boolean> {
  try {
    const res = await fetch("/api/account/saved", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ spotId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Write-through: remove one spot from the account. Resolves false on failure. */
export async function pushUnsave(spotId: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/account/saved?spot_id=${spotId}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}
