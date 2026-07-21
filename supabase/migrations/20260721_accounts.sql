-- Item 44: optional accounts (Supabase Auth, Google). Run in the Supabase SQL
-- editor (same hand-applied pattern as prior migrations). PROTECTED: owner
-- reviews before it is applied.
--
-- Auth itself lives in Supabase's built-in `auth.users` (created by the Google
-- provider on first sign-in). This migration adds only the app-owned tables and
-- the links that let an anonymous device's data survive a sign-in (D28 Q4,
-- migrate-not-reset):
--   1. user_saved_spots: the server-synced home for saved spots, which live in
--      localStorage `ptw-favorites` today. Anonymous use is unchanged; on
--      sign-in the device's localStorage saves are uploaded here.
--   2. push_subscriptions.user_id / email_subscriptions.user_id: nullable links
--      so an existing anonymous subscription (keyed on anon_id today) can be
--      claimed by the account that signs in on that device. Null = anonymous,
--      exactly as today, so the crons are unaffected.
--
-- No existing row changes: every add is `if not exists` and the new columns are
-- nullable with no default, so anonymous rows and both alert crons behave
-- identically until a user signs in and claims them.

-- 1. Saved spots, owned by an account.
create table if not exists user_saved_spots (
  user_id    uuid not null references auth.users (id) on delete cascade,
  spot_id    integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);
create index if not exists user_saved_spots_user_idx on user_saved_spots (user_id);

-- Row-level security: a signed-in user sees and edits ONLY their own saves.
-- (The service-role key used by server routes bypasses RLS; RLS protects any
-- future direct client access via the anon key.)
alter table user_saved_spots enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_saved_spots' and policyname = 'own_saves_select'
  ) then
    create policy own_saves_select on user_saved_spots
      for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_saved_spots' and policyname = 'own_saves_insert'
  ) then
    create policy own_saves_insert on user_saved_spots
      for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_saved_spots' and policyname = 'own_saves_delete'
  ) then
    create policy own_saves_delete on user_saved_spots
      for delete using (auth.uid() = user_id);
  end if;
end $$;

-- 2. Claim links on the existing subscription tables (nullable; null = anonymous).
alter table push_subscriptions
  add column if not exists user_id uuid references auth.users (id) on delete set null;
create index if not exists push_subscriptions_user_idx on push_subscriptions (user_id);

alter table email_subscriptions
  add column if not exists user_id uuid references auth.users (id) on delete set null;
create index if not exists email_subscriptions_user_idx on email_subscriptions (user_id);
