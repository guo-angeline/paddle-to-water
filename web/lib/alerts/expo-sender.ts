import "server-only";

/**
 * Expo push transport for native (iOS) subscriptions, the APNs twin of
 * push-sender.ts. Posts to the Expo push service, which relays to APNs/FCM.
 *
 * Error contract mirrors sendPush: `gone: true` means the device token is dead
 * (Expo ticket error DeviceNotRegistered) and the caller should disable the
 * subscription, exactly like web-push 404/410.
 *
 * KNOWN FOLLOW-UP (deliberate v1 scope cut): Expo delivers acceptance TICKETS
 * synchronously, but some failures (including late DeviceNotRegistered from
 * APNs) only appear in RECEIPTS fetched later via /--/api/v2/push/getReceipts.
 * v1 handles ticket-level errors only; a receipts sweep (e.g. in the next
 * cron run) is the documented follow-up before the native audience grows.
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_SIZE = 100; // Expo's documented max messages per request

export interface ExpoPushMessage {
  to: string; // ExponentPushToken[...]
  title: string;
  body: string;
  data: { url: string };
}

export interface ExpoSendResult {
  ok: boolean;
  gone: boolean;
  error: string | null;
}

interface ExpoTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

/**
 * Send a batch of Expo push messages (chunked at 100 per request). Returns one
 * result per input message, in order. Never throws: a transport-level failure
 * marks that chunk's messages `{ok:false, gone:false}` so the caller can retry
 * on a later run rather than disabling live subscriptions.
 */
export async function sendExpoPushes(messages: ExpoPushMessage[]): Promise<ExpoSendResult[]> {
  const results: ExpoSendResult[] = [];
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const chunk = messages.slice(i, i + BATCH_SIZE);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(
          chunk.map((m) => ({ ...m, sound: "default" }))
        ),
      });
      if (!res.ok) {
        results.push(
          ...chunk.map(() => ({ ok: false, gone: false, error: `http ${res.status}` }))
        );
        continue;
      }
      const parsed = (await res.json()) as { data?: ExpoTicket[] };
      const tickets = parsed.data ?? [];
      for (let j = 0; j < chunk.length; j++) {
        const t = tickets[j];
        if (!t) {
          results.push({ ok: false, gone: false, error: "missing ticket" });
        } else if (t.status === "ok") {
          results.push({ ok: true, gone: false, error: null });
        } else {
          const code = t.details?.error ?? t.message ?? "unknown";
          results.push({ ok: false, gone: code === "DeviceNotRegistered", error: code });
        }
      }
    } catch (err) {
      results.push(
        ...chunk.map(() => ({
          ok: false,
          gone: false,
          error: err instanceof Error ? err.message : "fetch failed",
        }))
      );
    }
  }
  return results;
}

/** One message, one result: convenience for the reminder drain's per-row loop. */
export async function sendExpoPush(
  to: string,
  payload: { title: string; body: string; url: string }
): Promise<ExpoSendResult> {
  const [result] = await sendExpoPushes([
    { to, title: payload.title, body: payload.body, data: { url: payload.url } },
  ]);
  return result;
}
