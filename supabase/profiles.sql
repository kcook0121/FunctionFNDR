-- Run in Supabase SQL editor to enable student profile onboarding.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  avatar_url text default '/user-avatar.png',
  name text,
  school text,
  year text,
  bio text,
  saved_events text[] not null default '{}',
  attended_events text[] not null default '{}',
  music_prefs text[] not null default '{}',
  promoter_tier text not null default 'Rookie',
  verified boolean not null default false,
  referrals integer not null default 0,
  tickets_sold integer not null default 0,
  parties_promoted integer not null default 0,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are readable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, verified)
  values (
    new.id,
    new.email,
    coalesce(new.email ~* '\.edu$', false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
