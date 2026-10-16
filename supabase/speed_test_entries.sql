-- Speed Shoe Speed Test entries — Columbus Marathon expo (2026-10-16/17).
-- Run once in the Supabase SQL Editor.
--
-- Deliberately a separate table from raffle_entries: this one carries a
-- score, and the Move Fest / Taco Tuesday table stays untouched.
-- The public page may INSERT only. Emails and phone numbers are readable
-- only by an admin; the display sign reads a name-and-score-only view.

create table if not exists public.speed_test_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null default 'columbus-marathon-2026',
  full_name text not null,
  email text not null,
  phone text,
  shoe_size text,
  shoe_size_gender text check (shoe_size_gender in ('mens','womens')),
  score integer not null default 0,
  correct integer not null default 0,
  total_questions integer not null default 10,
  time_seconds integer,
  best_streak integer not null default 0,
  consent boolean not null default true
);

alter table public.speed_test_entries enable row level security;

drop policy if exists "speed_anon_insert" on public.speed_test_entries;
create policy "speed_anon_insert" on public.speed_test_entries
  for insert to anon with check (true);

drop policy if exists "speed_auth_insert" on public.speed_test_entries;
create policy "speed_auth_insert" on public.speed_test_entries
  for insert to authenticated with check (true);

drop policy if exists "speed_admin_select" on public.speed_test_entries;
create policy "speed_admin_select" on public.speed_test_entries
  for select to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = auth.uid() and p.is_admin = true));

create index if not exists speed_test_entries_event_score_idx
  on public.speed_test_entries (event, score desc, time_seconds asc);

-- Public leaderboard: first name + last initial + score. No email, no phone.
drop view if exists public.speed_test_board;
create view public.speed_test_board as
  select
    split_part(full_name, ' ', 1)
      || case when position(' ' in full_name) > 0
              then ' ' || upper(left(split_part(full_name, ' ', 2), 1)) || '.'
              else '' end            as display_name,
    score,
    time_seconds,
    best_streak,
    created_at,
    event
  from public.speed_test_entries;

grant select on public.speed_test_board to anon, authenticated;

-- Pull the winner. ONLY scores set on the giveaway day count — the test
-- page and the display sign both filter to 2026-10-16 (America/New_York),
-- so this query must use the same window or it will name a different winner.
--   select full_name, email, phone, shoe_size, shoe_size_gender,
--          max(score) as best, min(time_seconds) as fastest
--   from public.speed_test_entries
--   where event = 'columbus-marathon-2026'
--     and created_at >= timestamptz '2026-10-16 00:00 America/New_York'
--     and created_at <  timestamptz '2026-10-17 00:00 America/New_York'
--   group by 1,2,3,4,5
--   order by best desc, fastest asc
--   limit 10;
