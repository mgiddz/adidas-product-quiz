-- Move Fest activation raffle (2026-10-03). Run once in Supabase SQL Editor.
-- Public anon key may INSERT only; admins (profiles.is_admin) may SELECT.
create table if not exists public.raffle_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null default 'movefest-2026',
  full_name text not null,
  email text not null,
  shoe_size text not null,
  shoe_size_gender text not null check (shoe_size_gender in ('mens','womens')),
  top_size text not null,
  favorite_brand text,
  current_shoe text,
  demo_shoe text,
  consent boolean not null default true
);
alter table public.raffle_entries enable row level security;
drop policy if exists "raffle_anon_insert" on public.raffle_entries;
create policy "raffle_anon_insert" on public.raffle_entries for insert to anon with check (true);
drop policy if exists "raffle_admin_select" on public.raffle_entries;
create policy "raffle_admin_select" on public.raffle_entries for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
create index if not exists raffle_entries_event_idx on public.raffle_entries (event, created_at desc);
