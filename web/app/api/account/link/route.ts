import { NextResponse } from "next/server";
import { getRequestUserId } from "@/lib/supabase/server-auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { parseLinkBody } from "@/lib/account/link-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Item 44 (D28 Q4, migrate-not-reset): called once right after a device signs
// in. It claims the anonymous data created on THIS device for the account:
//   - push_subscriptions / email_subscriptions rows matching this anon_id that
//     are still unclaimed (user_id is null) get this user_id;
//   - the device's localStorage saved spots are upserted into user_saved_spots.
// Idempotent: re-running links nothing new. Never steals another account's rows
// (only claims user_id IS NULL). Auth is verified server-side via getUser().
export async function POST(request: Request) {
  const userId = await getRequestUserId();
  if (!userId) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = parseLinkBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { anonId, savedSpotIds } = parsed.value;

  const admin = getSupabaseAdmin();

  // Claim this device's still-anonymous subscriptions.
  if (anonId) {
    for (const table of ["push_subscriptions", "email_subscriptions"] as const) {
      await admin.from(table).update({ user_id: userId }).eq("anon_id", anonId).is("user_id", null);
    }
  }

  // Upload the device's saved spots (dedupe on the (user_id, spot_id) PK).
  if (savedSpotIds.length > 0) {
    const rows = savedSpotIds.map((spot_id) => ({ user_id: userId, spot_id }));
    await admin.from("user_saved_spots").upsert(rows, { onConflict: "user_id,spot_id", ignoreDuplicates: true });
  }

  return NextResponse.json({ linked: true, saved: savedSpotIds.length });
}
