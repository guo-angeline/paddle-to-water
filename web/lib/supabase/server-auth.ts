import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, authEnabled } from "./config";

// Item 44: a request-scoped Supabase client that reads the signed-in user from
// the auth cookies (anon key + RLS, NOT the service role). Use it in a route to
// answer "who is calling", then hand off to getSupabaseAdmin() for writes that
// must bypass RLS. Returns null when auth is not configured.
//
// Kept separate from lib/supabase-server.ts (the service-role admin client):
// this one is per-request and cookie-bound; that one is a stateless admin.
export async function getServerAuthSupabase(): Promise<SupabaseClient | null> {
  if (!authEnabled()) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        // Route handlers may set refreshed-session cookies; ignore failures in
        // read-only contexts (e.g. a Server Component) per the Supabase SSR docs.
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* read-only context */
        }
      },
    },
  });
}

// Convenience: the authenticated user id for this request, or null. Uses
// getUser() (validates the JWT with the auth server) rather than trusting a
// decoded session, per Supabase's security guidance for server checks.
export async function getRequestUserId(): Promise<string | null> {
  const supabase = await getServerAuthSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}
