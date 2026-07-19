import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { validateSubscribePayload } from "@/lib/subscribe-validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = validateSubscribePayload(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { anonId, watchedSpotIds } = parsed.value;

  try {
    const db = getSupabaseAdmin();

    // Both transports upsert on the unique `endpoint`; expo rows synthesize
    // endpoint = 'expo:' + token (see 20260719_native_push.sql) so the
    // resurrect-on-resubscribe semantics stay identical across kinds.
    // One key set for both kinds (nulls where the transport doesn't use a
    // column), so the typed upsert sees a single row shape. Resurrecting a
    // previously-disabled endpoint clears the churn stamp either way, so
    // retention counts it as continuous, not a new + churned device.
    const row = {
      anon_id: anonId ?? null,
      kind: parsed.value.kind,
      endpoint:
        parsed.value.kind === "expo"
          ? `expo:${parsed.value.expoToken}`
          : parsed.value.subscription.endpoint,
      expo_token: parsed.value.kind === "expo" ? parsed.value.expoToken : null,
      p256dh: parsed.value.kind === "webpush" ? parsed.value.subscription.keys.p256dh : null,
      auth: parsed.value.kind === "webpush" ? parsed.value.subscription.keys.auth : null,
      enabled: true,
      disabled_at: null,
      last_seen: new Date().toISOString(),
    };

    const { data: sub, error: upsertErr } = await db
      .from("push_subscriptions")
      .upsert(row, { onConflict: "endpoint" })
      .select("id")
      .single();
    if (upsertErr || !sub) throw upsertErr ?? new Error("upsert returned no row");

    // Replace this device's watched spots with the current set.
    const { error: delErr } = await db.from("watched_spots").delete().eq("subscription_id", sub.id);
    if (delErr) throw delErr;

    if (watchedSpotIds.length > 0) {
      const rows = watchedSpotIds.map((spot_id) => ({ subscription_id: sub.id, spot_id }));
      const { error: insErr } = await db.from("watched_spots").insert(rows);
      if (insErr) throw insErr;
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Do not leak DB internals to the client.
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
