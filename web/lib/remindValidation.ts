/**
 * Validates the body of POST /api/alerts/remind: a request to schedule a
 * launch-time push reminder for one spot's calm window. Pure and unit-tested.
 */
export interface RemindPayload {
  /**
   * Identifies the caller's existing push subscription row by its unique
   * endpoint. Web callers send their Web Push endpoint; native callers send
   * `expoToken` instead and validation maps it to the synthetic
   * `expo:<token>` endpoint the subscribe route stored.
   */
  endpoint: string;
  spotId: number;
  spotName?: string;
  windowKey: string; // YYYY-MM-DD, spot-local
  fireAt: string; // ISO timestamp: when to send (window start minus lead)
}

export type RemindValidation = { ok: true; value: RemindPayload } | { ok: false; error: string };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

const YMD = /^\d{4}-\d{2}-\d{2}$/;
const EXPO_TOKEN = /^ExponentPushToken\[[A-Za-z0-9_-]+\]$/;

export function validateRemindPayload(body: unknown, nowMs: number = Date.now()): RemindValidation {
  if (!isObject(body)) return { ok: false, error: "body must be an object" };

  const hasEndpoint = typeof body.endpoint === "string" && !!body.endpoint;
  const hasExpo = body.expoToken !== undefined;
  if (hasEndpoint && hasExpo) {
    return { ok: false, error: "provide endpoint or expoToken, not both" };
  }
  let endpoint: string;
  if (hasExpo) {
    if (typeof body.expoToken !== "string" || !EXPO_TOKEN.test(body.expoToken)) {
      return { ok: false, error: "expoToken is not a valid Expo push token" };
    }
    endpoint = `expo:${body.expoToken}`;
  } else if (hasEndpoint) {
    endpoint = body.endpoint as string;
  } else {
    return { ok: false, error: "endpoint is required" };
  }
  if (!Number.isInteger(body.spotId) || (body.spotId as number) <= 0) {
    return { ok: false, error: "spotId must be a positive integer" };
  }
  if (typeof body.windowKey !== "string" || !YMD.test(body.windowKey)) {
    return { ok: false, error: "windowKey must be YYYY-MM-DD" };
  }
  if (typeof body.fireAt !== "string") {
    return { ok: false, error: "fireAt is required" };
  }
  const fireMs = Date.parse(body.fireAt);
  if (Number.isNaN(fireMs)) return { ok: false, error: "fireAt must be an ISO timestamp" };
  // Reject the past (allow a small skew) and anything absurdly far out (> 7 days):
  // reminders are for windows within the 3-day horizon.
  if (fireMs < nowMs - 60_000) return { ok: false, error: "fireAt is in the past" };
  if (fireMs > nowMs + 7 * 86_400_000) return { ok: false, error: "fireAt is too far in the future" };

  const spotName = typeof body.spotName === "string" ? body.spotName.slice(0, 120) : undefined;

  return {
    ok: true,
    value: {
      endpoint,
      spotId: body.spotId as number,
      spotName,
      windowKey: body.windowKey,
      fireAt: new Date(fireMs).toISOString(),
    },
  };
}
