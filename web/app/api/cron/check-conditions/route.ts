import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { findGoodWindow, type GoodWindow } from "@/lib/alerts/conditions-window";
import { selectAlertSpots, composeAlert, sentKey, type SpotWindow } from "@/lib/alerts/select";
import { sendPush } from "@/lib/alerts/push-sender";
import { sendExpoPushes, type ExpoPushMessage } from "@/lib/alerts/expo-sender";
import { ALL_SPOTS } from "@/lib/spots";

export const runtime = "nodejs";
export const maxDuration = 60;

const spotById = new Map(ALL_SPOTS.map((s) => [s.id, s]));

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const dry = new URL(req.url).searchParams.get("dry") === "1";
  const nowMs = Date.now();
  const db = getSupabaseAdmin();

  // 1. Load enabled subscriptions + their watched spots + recent sends.
  const { data: subs, error: subErr } = await db
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth, token, kind, expo_token")
    .eq("enabled", true);
  if (subErr) return NextResponse.json({ error: "db" }, { status: 500 });

  const { data: watched, error: watchedErr } = await db.from("watched_spots").select("subscription_id, spot_id");
  if (watchedErr) return NextResponse.json({ error: "db" }, { status: 500 });
  const { data: sends, error: sendsErr } = await db.from("alert_sends").select("subscription_id, spot_id, window_key, sent_at");
  if (sendsErr) return NextResponse.json({ error: "db" }, { status: 500 });

  const watchedBySub = new Map<string, number[]>();
  for (const w of watched ?? []) {
    const arr = watchedBySub.get(w.subscription_id) ?? [];
    arr.push(w.spot_id);
    watchedBySub.set(w.subscription_id, arr);
  }
  const startOfUtcDay = new Date(); startOfUtcDay.setUTCHours(0, 0, 0, 0);
  const sentKeysBySub = new Map<string, Set<string>>();
  const sentTodayBySub = new Map<string, number>();
  for (const s of sends ?? []) {
    const keys = sentKeysBySub.get(s.subscription_id) ?? new Set<string>();
    keys.add(sentKey(s.spot_id, s.window_key));
    sentKeysBySub.set(s.subscription_id, keys);
    if (Date.parse(s.sent_at) >= startOfUtcDay.getTime()) {
      sentTodayBySub.set(s.subscription_id, (sentTodayBySub.get(s.subscription_id) ?? 0) + 1);
    }
  }

  // 2. Fetch conditions ONCE per unique watched spot.
  const uniqueSpotIds = [...new Set((watched ?? []).map((w) => w.spot_id))];
  const windowBySpot = new Map<number, SpotWindow>();
  for (const spotId of uniqueSpotIds) {
    const spot = spotById.get(spotId);
    if (!spot) continue;
    const win: GoodWindow | null = await findGoodWindow(spot.lat, spot.lng, nowMs);
    if (win) {
      windowBySpot.set(spotId, { spotId, spotName: spot.water, windowKey: win.windowKey, label: win.label });
    }
  }

  // 3. Per subscription: select, send one batched push, log, disable on gone.
  // Transport branches on `kind` at send time only; selection, the 1/day cap,
  // the (spot,window) dedupe, and alert_sends logging are identical for both.
  // Expo sends are accumulated and flushed in one batched API call after the
  // loop (Expo accepts up to 100 messages per request).
  let pushesSent = 0;
  let disabled = 0;
  const planned: { subscription_id: string; spots: number[] }[] = [];
  const expoQueue: { sub: { id: string }; picks: ReturnType<typeof selectAlertSpots>; message: ExpoPushMessage }[] = [];

  async function logSends(subId: string, picks: ReturnType<typeof selectAlertSpots>) {
    const { error: insertErr } = await db.from("alert_sends").insert(
      picks.map((p) => ({ subscription_id: subId, spot_id: p.spotId, window_key: p.windowKey, sent_at: new Date().toISOString() }))
    );
    if (insertErr) console.error("alert_sends insert failed for", subId, insertErr.message);
  }
  async function disableSub(subId: string) {
    // Stamp disabled_at so the reachable-audience retention curve can date the
    // churn (enabled alone is a point-in-time boolean).
    const { error: disableErr } = await db
      .from("push_subscriptions")
      .update({ enabled: false, disabled_at: new Date().toISOString() })
      .eq("id", subId);
    if (disableErr) console.error("failed to disable subscription", subId, disableErr.message);
    disabled += 1;
  }

  for (const sub of subs ?? []) {
    const watchedIds = watchedBySub.get(sub.id) ?? [];
    const capReached = (sentTodayBySub.get(sub.id) ?? 0) > 0;
    const picks = selectAlertSpots(watchedIds, windowBySpot, sentKeysBySub.get(sub.id) ?? new Set(), capReached);
    if (picks.length === 0) continue;
    planned.push({ subscription_id: sub.id, spots: picks.map((p) => p.spotId) });
    if (dry) continue;

    const payload = composeAlert(picks, sub.token ?? undefined);

    if (sub.kind === "expo" && sub.expo_token) {
      expoQueue.push({
        sub,
        picks,
        message: { to: sub.expo_token, title: payload.title, body: payload.body, data: { url: payload.url } },
      });
      continue;
    }

    const result = await sendPush(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    );
    if (result.ok) {
      pushesSent += 1;
      await logSends(sub.id, picks);
    } else if (result.gone) {
      await disableSub(sub.id);
    }
  }

  if (expoQueue.length > 0) {
    const results = await sendExpoPushes(expoQueue.map((q) => q.message));
    for (let i = 0; i < expoQueue.length; i++) {
      const { sub, picks } = expoQueue[i];
      const result = results[i];
      if (result.ok) {
        pushesSent += 1;
        await logSends(sub.id, picks);
      } else if (result.gone) {
        await disableSub(sub.id);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    dry,
    subscriptions: subs?.length ?? 0,
    spotsChecked: uniqueSpotIds.length,
    goodSpots: windowBySpot.size,
    pushesSent,
    disabled,
    planned: dry ? planned : undefined,
  });
}
