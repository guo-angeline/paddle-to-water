"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, authEnabled } from "./config";

// Item 44: the browser Supabase client for auth (sign-in/out, session).
// Returns null when auth is not configured, so every caller degrades to the
// anonymous app instead of throwing. Memoized so repeated calls share one
// client (and one auth listener registry).
let cached: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient | null {
  if (!authEnabled()) return null;
  if (cached) return cached;
  cached = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  return cached;
}
