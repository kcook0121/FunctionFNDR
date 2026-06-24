-- Run after supabase/events.sql to enable authenticated event creation.

alter table public.events
  add column if not exists host_id uuid references auth.users (id) on delete set null,
  add column if not exists university text,
  add column if not exists address text,
  add column if not exists end_time timestamptz,
  add column if not exists capacity integer,
  add column if not exists music_genre text;

create policy "Events are insertable by authenticated hosts"
  on public.events
  for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "Events are updatable by host"
  on public.events
  for update
  to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);
