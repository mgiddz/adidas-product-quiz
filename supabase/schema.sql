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
