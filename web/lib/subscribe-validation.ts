const MAX_WATCHED = 200;

/**
 * Two transports share this endpoint (see supabase/migrations/20260719_native_push.sql):
 * the original Web Push shape (`subscription`) and the native app's Expo token
 * (`expoToken`). Exactly one must be present.
 */
export type SubscribePayload =
  | {
      kind: "webpush";
      anonId?: string;
      subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
      watchedSpotIds: number[];
    }
  | {
      kind: "expo";
      anonId?: string;
      expoToken: string;
      watchedSpotIds: number[];
    };

export type ValidationResult =
  | { ok: true; value: SubscribePayload }
  | { ok: false; error: string };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

// Expo push tokens look like "ExponentPushToken[xxxxxxxx]".
const EXPO_TOKEN = /^ExponentPushToken\[[A-Za-z0-9_-]+\]$/;
const MAX_EXPO_TOKEN_LEN = 200;

function validateWatched(body: Record<string, unknown>):
  | { ok: true; watchedSpotIds: number[] }
  | { ok: false; error: string } {
  let watchedSpotIds: number[] = [];
  if (body.watchedSpotIds !== undefined) {
    if (!Array.isArray(body.watchedSpotIds) || body.watchedSpotIds.some((n) => !Number.isInteger(n) || n <= 0)) {
      return { ok: false, error: "watchedSpotIds must be an array of numbers" };
    }
    if (body.watchedSpotIds.length > MAX_WATCHED) {
      return { ok: false, error: "watchedSpotIds exceeds maximum length" };
    }
    watchedSpotIds = body.watchedSpotIds as number[];
  }
  return { ok: true, watchedSpotIds };
}

export function validateSubscribePayload(body: unknown): ValidationResult {
  if (!isObject(body)) return { ok: false, error: "body must be an object" };

  const hasSub = body.subscription !== undefined;
  const hasExpo = body.expoToken !== undefined;
  if (hasSub && hasExpo) {
    return { ok: false, error: "provide subscription or expoToken, not both" };
  }

  const watched = validateWatched(body);
  if (!watched.ok) return watched;
  const anonId = typeof body.anonId === "string" ? body.anonId : undefined;

  if (hasExpo) {
    const token = body.expoToken;
    if (typeof token !== "string" || !token) {
      return { ok: false, error: "expoToken is required" };
    }
    if (token.length > MAX_EXPO_TOKEN_LEN || !EXPO_TOKEN.test(token)) {
      return { ok: false, error: "expoToken is not a valid Expo push token" };
    }
    return {
      ok: true,
      value: { kind: "expo", anonId, expoToken: token, watchedSpotIds: watched.watchedSpotIds },
    };
  }

  const sub = body.subscription;
  if (!isObject(sub)) return { ok: false, error: "subscription is required" };
  if (typeof sub.endpoint !== "string" || !sub.endpoint) {
    return { ok: false, error: "subscription.endpoint is required" };
  }
  const keys = sub.keys;
  if (!isObject(keys) || typeof keys.p256dh !== "string" || typeof keys.auth !== "string") {
    return { ok: false, error: "subscription.keys.p256dh and .auth are required" };
  }

  return {
    ok: true,
    value: {
      kind: "webpush",
      anonId,
      subscription: { endpoint: sub.endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
      watchedSpotIds: watched.watchedSpotIds,
    },
  };
}
