import { NextResponse } from "next/server";
import { getServerAuthSupabase } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Item 44: OAuth redirect target. Google sends the user back here (via Supabase)
// with a `code`; we exchange it for a session, which sets the auth cookies, then
// bounce to `next`.
//
// EVERY failure path must be visible. The first version swallowed both the
// missing-code case and the exchange error, so a failed sign-in was
// indistinguishable from a successful one: the user landed back on the site,
// quietly signed out, with nothing to debug. Now each failure redirects with
// `?auth_error=<reason>` and logs server-side.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  // Only allow same-origin relative redirects (never an open redirect).
  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  function bounce(authError?: string) {
    const target = new URL(dest, url.origin);
    if (authError) target.searchParams.set("auth_error", authError.slice(0, 140));
    return NextResponse.redirect(target);
  }

  // Supabase or the provider can hand back their own error instead of a code.
  const providerError =
    url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (providerError) {
    console.error("[auth/callback] provider error:", providerError);
    return bounce(providerError);
  }

  if (!code) {
    // Nearly always means Supabase never redirected HERE: the redirectTo URL is
    // missing from the project's Auth -> URL Configuration -> Redirect URLs
    // allow-list, so Supabase fell back to the Site URL and no code reached
    // this route.
    console.error("[auth/callback] no code in callback URL (check Supabase Redirect URLs allow-list)");
    return bounce("no_code");
  }

  const supabase = await getServerAuthSupabase();
  if (!supabase) {
    console.error("[auth/callback] auth not configured (NEXT_PUBLIC_SUPABASE_* missing at build)");
    return bounce("not_configured");
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return bounce(error.message);
  }

  return bounce();
}
