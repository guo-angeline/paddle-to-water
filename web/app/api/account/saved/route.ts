import { NextResponse } from "next/server";
import { getRequestUserId } from "@/lib/supabase/server-auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Item 76: the read + write-through half of saved-spot sync.
//
// `/api/account/link` only ever UPLOADED a device's localStorage saves, and
// nothing read `user_saved_spots` back, so the "sync across devices" promise in
// the sign-in sheet was never true. These three handlers are the missing half:
// the server becomes the source of truth once you are signed in.
//
// Ownership is taken from the session (`getRequestUserId`), never from the
// request, so a caller cannot read or edit another account's saves.

function parseSpotId(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isInteger(n) && n > 0 ? n : null;
}

/** GET /api/account/saved -> { spotIds } for the signed-in user. */
export async function GET() {
  const userId = await getRequestUserId();
  if (!userId) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("user_saved_spots")
    .select("spot_id")
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: "lookup failed" }, { status: 500 });

  return NextResponse.json({ spotIds: (data ?? []).map((r) => r.spot_id as number) });
}

/** POST /api/account/saved { spotId } -> save one spot. Idempotent. */
export async function POST(request: Request) {
  const userId = await getRequestUserId();
  if (!userId) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const spotId = parseSpotId((body as { spotId?: unknown })?.spotId);
  if (spotId === null) return NextResponse.json({ error: "spotId required" }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("user_saved_spots")
    .upsert({ user_id: userId, spot_id: spotId }, { onConflict: "user_id,spot_id", ignoreDuplicates: true });

  if (error) return NextResponse.json({ error: "save failed" }, { status: 500 });
  return NextResponse.json({ saved: spotId });
}

/** DELETE /api/account/saved?spot_id=N -> unsave one spot. Idempotent. */
export async function DELETE(request: Request) {
  const userId = await getRequestUserId();
  if (!userId) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const spotId = parseSpotId(new URL(request.url).searchParams.get("spot_id"));
  if (spotId === null) return NextResponse.json({ error: "spot_id required" }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("user_saved_spots")
    .delete()
    .eq("user_id", userId)
    .eq("spot_id", spotId);

  if (error) return NextResponse.json({ error: "delete failed" }, { status: 500 });
  return NextResponse.json({ removed: spotId });
}
