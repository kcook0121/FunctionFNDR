-- ============================================================================
-- FunctionFNDR · migration 0001 · profiles
--
-- Run in the Supabase SQL editor (or via `supabase db push` once you have the
-- Supabase CLI wired up). The app will route signed-in users to onboarding
-- automatically until this table exists.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
-- One row per authenticated user. id mirrors auth.users.id (1:1).
-- Keep this schema in sync with lib/database.types.ts.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                uuid        primary key references auth.users (id) on delete cascade,
  full_name         text        not null,
  username          citext      not null unique,
  university_id     text        not null,
  university_name   text        not null,
  class_year        text        not null,
  edu_email         citext      not null,
  music_prefs       text[]      not null default '{}',
  avatar_url        text,
  bio               text,
  verified_student  boolean     not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists profiles_university_id_idx on public.profiles (university_id);
create index if not exists profiles_username_idx       on public.profiles (username);

-- Keep updated_at fresh.
create or replace function public.set_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security — REQUIRED before going to production
-- ----------------------------------------------------------------------------
-- These policies are commented out so you can iterate locally with the anon
-- key against an empty database. BEFORE any real user data lands, uncomment
-- everything from `alter table` through the final policy and re-run this file.
--
-- Design intent:
--   * Any signed-in user can read profiles (needed for @mentions, friend
--     search, attendee lists). If you want fully-private profiles, change
--     the SELECT policy's `using (true)` to a friendship check later.
--   * Users can only insert/update/delete their OWN row.
--   * Clients can NEVER flip verified_student to true on their own. The
--     UPDATE policy enforces `verified_student = false` in the WITH CHECK;
--     promotion to verified happens via a future edge function running
--     under the service role (after SheerID / .edu OTP).
-- ============================================================================

-- alter table public.profiles enable row level security;

-- create policy "profiles are readable by signed-in users"
--   on public.profiles
--   for select
--   to authenticated
--   using (true);

-- create policy "users can insert their own profile"
--   on public.profiles
--   for insert
--   to authenticated
--   with check (id = auth.uid());

-- create policy "users can update their own profile (cannot self-verify)"
--   on public.profiles
--   for update
--   to authenticated
--   using  (id = auth.uid())
--   with check (id = auth.uid() and verified_student = false);

-- create policy "users can delete their own profile"
--   on public.profiles
--   for delete
--   to authenticated
--   using (id = auth.uid());

-- ============================================================================
-- Future migrations to consider (do NOT add to this file):
--   0002_student_verifications  — store .edu OTP / SheerID submissions
--   0003_follows                — friend graph
--   0004_events                 — promote lib/data.ts mocks into real schema
-- ============================================================================
