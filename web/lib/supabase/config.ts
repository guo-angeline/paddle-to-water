// Item 44: client-side Supabase Auth config. The browser needs the PUBLIC
// project URL + the anon/publishable key (safe to ship; RLS + the server
// service-role key guard the data). These are SEPARATE from the server-only
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY that lib/supabase-server.ts uses.
//
// authEnabled() is the master guard: with the env vars absent (the state
// TODAY, before the owner provisions the Google OAuth app + these keys), the
// whole accounts feature stays inert and the anonymous app is byte-unchanged.
// Nothing renders a sign-in control, no client is created, no route acts.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function authEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
