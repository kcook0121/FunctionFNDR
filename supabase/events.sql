-- Run in Supabase SQL editor to enable real events, saves, and RSVPs.

create table if not exists public.events (
  id text primary key,
  title text not null,
  host_name text not null,
  venue_type text not null,
  ticket_price_ga integer not null default 0,
  ticket_price_vip integer not null default 0,
  theme_tag text,
  date_time timestamptz not null,
  image text,
  detail text,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_events (
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id text not null references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table if not exists public.event_rsvps (
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id text not null references public.events (id) on delete cascade,
  status text not null check (status in ('yes', 'maybe', 'no')),
  updated_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.events enable row level security;
alter table public.saved_events enable row level security;
alter table public.event_rsvps enable row level security;

create policy "Events are readable by authenticated users"
  on public.events
  for select
  to authenticated
  using (true);

create policy "Saved events are readable by owner"
  on public.saved_events
  for select
  using (auth.uid() = user_id);

create policy "Saved events are insertable by owner"
  on public.saved_events
  for insert
  with check (auth.uid() = user_id);

create policy "Saved events are deletable by owner"
  on public.saved_events
  for delete
  using (auth.uid() = user_id);

create policy "RSVPs are readable by owner"
  on public.event_rsvps
  for select
  using (auth.uid() = user_id);

create policy "RSVPs are insertable by owner"
  on public.event_rsvps
  for insert
  with check (auth.uid() = user_id);

create policy "RSVPs are updatable by owner"
  on public.event_rsvps
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "RSVPs are deletable by owner"
  on public.event_rsvps
  for delete
  using (auth.uid() = user_id);

insert into public.events (
  id,
  title,
  host_name,
  venue_type,
  ticket_price_ga,
  ticket_price_vip,
  theme_tag,
  date_time,
  image,
  detail,
  location
) values
  (
    'e_sigma-chi',
    'Sigma Chi Neon Oasis',
    'Sigma Chi',
    'Rooftop',
    5,
    15,
    'Electric',
    '2025-04-12T21:00:00.000Z',
    '/event-1.png',
    'A premium neon rooftop experience with exclusive bottle service and campus guest list.',
    'Downtown High Point'
  ),
  (
    'e_village-tavern',
    'The Village Tavern Opener',
    'Village Tavern',
    'Bar',
    5,
    15,
    'Low-key luxe',
    '2025-04-18T22:00:00.000Z',
    '/event-2.png',
    'College crowd energy with bass-heavy sets, specialty pours, and guest DJs all night.',
    'The Village district'
  ),
  (
    'e_kappa-sig',
    'Kappa Sig Dayglow',
    'Kappa Sig',
    'Day party',
    5,
    15,
    'Neon foam',
    '2025-04-20T14:00:00.000Z',
    '/event-3.png',
    'A daytime destination with glow paint, rooftop chill spaces and live DJ sets.',
    'Eastside Park'
  )
on conflict (id) do nothing;
