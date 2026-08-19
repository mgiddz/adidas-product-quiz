-- supabase/schema.sql
--
-- Run this once in your Supabase project's SQL editor (Project -> SQL Editor
-- -> New query -> paste -> Run). Creates the submissions table and locks it
-- down so the public anon key can only INSERT, never read/update/delete.
--
-- After running this, the Supabase table editor (Table Editor -> quiz_submissions)
-- is your reviewable list of every quiz attempt, and has a one-click "Export
-- to CSV" option in its menu.

create table if not exists quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Intake form fields (spec §2)
  employee_name text not null,
  store_name text not null,
  store_location text not null,
  shoe_size text not null,
  shoe_size_gender text not null,       -- 'M' or 'W'
  clothing_size text not null,          -- XS/S/M/L/XL/XXL
  clothing_size_gender text not null,   -- 'M' or 'W'
  email text not null,
  favorite_snack text not null,         -- Smoothie/Coffee/Candy/Other
  favorite_snack_other text,            -- free text, only when snack = 'Other'

  -- Quiz results
  answers jsonb not null,               -- array of { questionId, type, yourAnswer, correct }
  score int not null,                   -- out of 20 (19 multiple choice + 1 order/ranking question)
  open_ended_response text
);

-- Enable Row Level Security, then allow anonymous INSERT only.
alter table quiz_submissions enable row level security;

create policy "Allow anonymous insert"
  on quiz_submissions
  for insert
  to anon
  with check (true);

-- Deliberately no SELECT/UPDATE/DELETE policy for `anon` — that keeps
-- submissions readable only from the Supabase dashboard (as the project
-- owner), not from the public quiz page itself.

-- Note: there is deliberately no table here for the experience survey.
-- The hub's "Experience Survey" card links straight out to Mike's real
-- Typeform (https://survey.typeform.com/to/e9urwqa7) — that's the actual
-- instrument he's evaluated on, so responses need to land there, not in a
-- parallel table nobody official reviews. See MEMORY.md "Study guide,
-- cheat sheet, and survey" for the reasoning (an earlier custom in-app
-- survey + table were built, then removed once the real Typeform surfaced).

-- ---------------------------------------------------------------------
-- Colleague results dashboard (login.html / dashboard.html), added
-- 2026-08-18. Already applied directly to Mike's live Supabase project
-- via the Supabase MCP connector — this block is kept here so the schema
-- stays reproducible from scratch. Do not re-run manually against the
-- live project; it's already there (the `if not exists` / `drop ... if
-- exists` guards make it safe to re-run anyway, but it's redundant).
-- ---------------------------------------------------------------------

-- Colleague/store-manager profiles, linked 1:1 to Supabase Auth users.
-- store_name links a colleague to the exact store_name value used in
-- quiz_submissions (see index.html's intake form, and js/stores.js for
-- the signup dropdown). is_admin = true sees every store's data (Mike's
-- own account — set manually, there's no self-serve way to become admin).
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  store_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- A logged-in user can read/update their own profile row — needed so the
-- app can check is_admin/store_name right after login.
create policy "Users can view their own profile"
  on profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "Users can update their own profile"
  on profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Auto-create a profile row whenever a new auth user signs up (via
-- login.html's "Create Account" form). Reads store_name out of the
-- signup call's user_metadata. SECURITY DEFINER is required so the
-- trigger can insert into public.profiles regardless of who's signing
-- up; EXECUTE is revoked from anon/authenticated below so it can only
-- run as a trigger, never called directly over the API.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, store_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'store_name');
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Let logged-in colleagues read quiz submissions scoped to their own
-- store; admins (Mike) see every store. Trimmed/lowercased comparison to
-- absorb minor casing/whitespace differences in typed store names.
create policy "Colleagues can view their store's submissions"
  on quiz_submissions
  for select
  to authenticated
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and (
          p.is_admin = true
          or lower(trim(p.store_name)) = lower(trim(quiz_submissions.store_name))
        )
    )
  );

-- To make Mike (or anyone else) an admin after they sign up:
--   update profiles set is_admin = true where email = 'mike@example.com';
