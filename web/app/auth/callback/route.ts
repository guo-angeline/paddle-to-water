import { NextResponse } from "next/server";
import { getServerAuthSupabase } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Item 44: OAuth redirect target. Google sends the user back here with a
// `code`; we exchange it for a session (which sets the auth cookies via the
// server client), then bounce home. `next` lets a caller return to where they
// started. If auth is not configured, or there is no code, just go home.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  // Only allow same-origin relative redirects (never an open redirect).
  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await getServerAuthSupabase();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }
  return NextResponse.redirect(new URL(dest, url.origin));
}
