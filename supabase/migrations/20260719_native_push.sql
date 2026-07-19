-- Native (Expo/APNs) push subscriptions ride the existing web-push table.
-- Run in the Supabase SQL editor (same hand-applied pattern as prior migrations).
--
-- Why one table, not a parallel native_* set: watched_spots, alert_sends
-- (the 1/day cap + per-(spot,window) dedupe), launch_reminders, and the
-- durable deep-link `token` all FK or key on push_subscriptions.id. A second
-- table would fork selectAlertSpots plumbing across three crons. Instead,
-- `kind` discriminates the transport at send time only:
--   kind='webpush' -> endpoint + p256dh/auth (VAPID, unchanged)
--   kind='expo'    -> expo_token (Expo push service -> APNs/FCM)
-- Expo rows also write endpoint = 'expo:' || expo_token so the existing
-- unique-endpoint upsert (onConflict: endpoint) works unchanged.

alter table public.push_subscriptions
  add column if not exists kind text not null default 'webpush'
    check (kind in ('webpush', 'expo')),
  add column if not exists expo_token text unique;

alter table public.push_subscriptions
  alter column p256dh drop not null,
  alter column auth drop not null;

-- Every row must carry the credentials its transport needs.
alter table public.push_subscriptions
  add constraint push_kind_shape check (
    (kind = 'webpush' and p256dh is not null and auth is not null)
    or
    (kind = 'expo' and expo_token is not null)
  );
