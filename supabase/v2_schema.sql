-- supabase/v2_schema.sql
--
-- v2 (2026-09-30): product modules, timed quizzes, employee records,
-- per-store product toggles, and the proctored certification test.
-- Applied to the live project via the Supabase MCP connector as migration
-- `v2_platform_schema`; kept here so it's reproducible. Safe to re-run
-- (if not exists / or replace / drop policy if exists).
--
-- Design rule: CORRECT ANSWERS NEVER REACH THE BROWSER. The client asks
-- `get_module_questions` for a shuffled subset (no answer key), and
-- `submit_module_attempt` / `submit_test_attempt` grade server-side and
-- return the breakdown. `questions` itself is readable only by staff.
--
-- v1's `quiz_submissions` and `profiles` stay as-is (profiles gains role +
-- territory below).

-- ---------------------------------------------------------------------
-- Staff roles + territories (profiles = PEs / admins / viewers)
-- ---------------------------------------------------------------------
alter table profiles add column if not exists role text not null default 'pe'
  check (role in ('pe', 'admin', 'viewer'));
alter table profiles add column if not exists territory text[] not null default '{}';
-- is_admin (v1) stays authoritative for "sees everything"; role is for UI.

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid());
$$;

create or replace function public.staff_can_see_store(p_store text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and (p.is_admin or p.role = 'admin' or p.role = 'viewer'
           or lower(trim(p_store)) = any (select lower(trim(t)) from unnest(p.territory) t)
           or lower(trim(p_store)) = lower(trim(coalesce(p.store_name, ''))))
  );
$$;

-- ---------------------------------------------------------------------
-- Products (one row per shoe; 'full-lineup' is the cross-lineup module)
-- ---------------------------------------------------------------------
create table if not exists products (
  id text primary key,                 -- slug, e.g. 'hyperboost-edge'
  name text not null,
  franchise text,                      -- Adizero / Hyperboost / Supernova
  pillar text,                         -- Light & Fast / Comfort Energized / Supportive Comfort
  rrp numeric,
  hero_image text,                     -- path under images/
  video_url text,                      -- null = photo/text intro
  intro_bullets jsonb not null default '[]'::jsonb,
  questions_per_quiz int not null default 8,
  sort int not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table products enable row level security;
drop policy if exists "products readable by signed-in users" on products;
create policy "products readable by signed-in users" on products
  for select to authenticated using (active = true);
drop policy if exists "admins manage products" on products;
create policy "admins manage products" on products
  for all to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and (p.is_admin or p.role = 'admin')))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and (p.is_admin or p.role = 'admin')));

-- ---------------------------------------------------------------------
-- Question bank (staff-only table; clients go through RPCs)
-- ---------------------------------------------------------------------
create table if not exists questions (
  id serial primary key,
  legacy_id int,                       -- v1 js/questions.js id, for history
  product_id text references products(id) on delete cascade,
  type text not null check (type in ('mc', 'order')),
  prompt text not null,
  options jsonb not null,              -- mc: choices; order: items in CORRECT order
  correct_index int,                   -- mc only
  explain text,
  image text,
  source text not null default 'v1',   -- v1 | myagi | techsheet
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table questions enable row level security;
drop policy if exists "staff read questions" on questions;
create policy "staff read questions" on questions for select to authenticated using (is_staff());
drop policy if exists "admins manage questions" on questions;
create policy "admins manage questions" on questions for all to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and (p.is_admin or p.role = 'admin')))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and (p.is_admin or p.role = 'admin')));

-- ---------------------------------------------------------------------
-- Which stores carry which products (the per-store toggle)
-- ---------------------------------------------------------------------
create table if not exists store_products (
  store_name text not null,
  product_id text not null references products(id) on delete cascade,
  enabled boolean not null default true,
  updated_by uuid,
  updated_at timestamptz not null default now(),
  primary key (store_name, product_id)
);
alter table store_products enable row level security;
drop policy if exists "signed-in users read store products" on store_products;
create policy "signed-in users read store products" on store_products for select to authenticated using (true);
drop policy if exists "staff toggle their stores" on store_products;
create policy "staff toggle their stores" on store_products for all to authenticated
  using (staff_can_see_store(store_name)) with check (staff_can_see_store(store_name));

-- ---------------------------------------------------------------------
-- Employees (store associates; keyed to their magic-link auth user)
-- ---------------------------------------------------------------------
create table if not exists employees (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  store_name text,
  shoe_size text,
  shoe_gender text,
  clothing_size text,
  clothing_gender text,
  favorite_snack text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table employees enable row level security;
drop policy if exists "employees manage own row" on employees;
create policy "employees manage own row" on employees for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "staff read employees in territory" on employees;
create policy "staff read employees in territory" on employees for select to authenticated
  using (staff_can_see_store(coalesce(store_name, '')));

-- ---------------------------------------------------------------------
-- Module attempts (self-serve per-shoe quizzes) — written ONLY by RPC
-- ---------------------------------------------------------------------
create table if not exists module_attempts (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  store_name text,
  product_id text not null references products(id),
  score int not null,
  total int not null,
  answers jsonb not null,
  duration_s int,
  blur_count int not null default 0,
  created_at timestamptz not null default now()
);
alter table module_attempts enable row level security;
drop policy if exists "employees read own attempts" on module_attempts;
create policy "employees read own attempts" on module_attempts for select to authenticated using (employee_id = auth.uid());
drop policy if exists "staff read attempts in territory" on module_attempts;
create policy "staff read attempts in territory" on module_attempts for select to authenticated using (staff_can_see_store(coalesce(store_name, '')));
revoke insert, update, delete on module_attempts from anon, authenticated;

-- ---------------------------------------------------------------------
-- Proctored certification test sessions + attempts
-- ---------------------------------------------------------------------
create table if not exists test_sessions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  store_name text not null,
  pe_id uuid not null references profiles(id),
  product_ids text[] not null,
  question_count int not null default 20,
  opened_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '4 hours',
  closed_at timestamptz
);
alter table test_sessions enable row level security;
drop policy if exists "staff manage sessions in territory" on test_sessions;
create policy "staff manage sessions in territory" on test_sessions for all to authenticated
  using (staff_can_see_store(store_name)) with check (staff_can_see_store(store_name) and pe_id = auth.uid());

create table if not exists test_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references test_sessions(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  store_name text,
  score int,
  total int,
  prize_tier text,
  answers jsonb,
  question_ids int[] not null,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  duration_s int,
  blur_count int not null default 0,
  unique (session_id, employee_id)
);
alter table test_attempts enable row level security;
drop policy if exists "employees read own test attempts" on test_attempts;
create policy "employees read own test attempts" on test_attempts for select to authenticated using (employee_id = auth.uid());
drop policy if exists "staff read test attempts in territory" on test_attempts;
create policy "staff read test attempts in territory" on test_attempts for select to authenticated using (staff_can_see_store(coalesce(store_name, '')));
revoke insert, update, delete on test_attempts from anon, authenticated;

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
-- Shuffle a jsonb array (Fisher–Yates via random ordering)
create or replace function public.jsonb_shuffle(arr jsonb) returns jsonb
language sql volatile as $$
  select coalesce(jsonb_agg(e order by random()), '[]'::jsonb) from jsonb_array_elements(arr) e;
$$;

-- Prize tier from a percentage (mirrors js/prizes.js: 20/18/14/10 of 20)
create or replace function public.prize_tier_for(p_score int, p_total int) returns text
language sql immutable as $$
  select case
    when p_total <= 0 then 'none'
    when p_score = p_total then 'shoes'
    when p_score::numeric / p_total >= 0.9 then 'tshirt'
    when p_score::numeric / p_total >= 0.7 then 'socks'
    when p_score::numeric / p_total >= 0.5 then 'keychain'
    else 'none' end;
$$;

-- Grade one answer. For mc the answer is the chosen option TEXT; for order
-- it's the array of item texts in the employee's order.
create or replace function public.grade_answer(q questions, p_answer jsonb) returns boolean
language plpgsql immutable as $$
begin
  if q.type = 'mc' then
    return (p_answer #>> '{}') = (q.options ->> q.correct_index);
  else
    return p_answer = q.options;
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: questions for a module (shuffled, NO answer key)
-- ---------------------------------------------------------------------
create or replace function public.get_module_questions(p_product_id text, p_limit int default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  n int;
  result jsonb;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select coalesce(p_limit, questions_per_quiz) into n from products where id = p_product_id and active;
  if n is null then raise exception 'unknown product'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', q.id, 'type', q.type, 'prompt', q.prompt, 'image', q.image,
      'options', jsonb_shuffle(q.options))), '[]'::jsonb)
  into result
  from (select * from questions where product_id = p_product_id and active order by random() limit n) q;
  return result;
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: submit + grade a module attempt
-- p_answers: [{ "id": 12, "answer": "PRIMEWEAVE" | ["A","B",...] }]
-- ---------------------------------------------------------------------
create or replace function public.submit_module_attempt(
  p_product_id text, p_answers jsonb, p_duration_s int default null, p_blur_count int default 0)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  emp employees;
  a jsonb;
  q questions;
  ok boolean;
  score int := 0;
  total int := 0;
  details jsonb := '[]'::jsonb;
  attempt_id uuid;
begin
  select * into emp from employees where id = auth.uid();
  if emp.id is null then raise exception 'no employee profile'; end if;

  for a in select * from jsonb_array_elements(p_answers) loop
    select * into q from questions where id = (a ->> 'id')::int and product_id = p_product_id and active;
    if q.id is null then continue; end if;
    total := total + 1;
    ok := grade_answer(q, a -> 'answer');
    if ok then score := score + 1; end if;
    details := details || jsonb_build_object(
      'id', q.id, 'prompt', q.prompt, 'correct', ok,
      'your_answer', a -> 'answer',
      'correct_answer', case when q.type = 'mc' then to_jsonb(q.options ->> q.correct_index) else q.options end,
      'explain', q.explain);
  end loop;

  insert into module_attempts (employee_id, store_name, product_id, score, total, answers, duration_s, blur_count)
  values (emp.id, emp.store_name, p_product_id, score, total, details, p_duration_s, p_blur_count)
  returning id into attempt_id;

  return jsonb_build_object('attempt_id', attempt_id, 'score', score, 'total', total, 'details', details);
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: employee joins a proctored session by code → gets their questions
-- (one attempt per session; a second call returns the same question set
-- only if not yet submitted)
-- ---------------------------------------------------------------------
create or replace function public.join_test_session(p_code text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  s test_sessions;
  emp employees;
  att test_attempts;
  qids int[];
  result jsonb;
begin
  select * into emp from employees where id = auth.uid();
  if emp.id is null then raise exception 'no employee profile'; end if;
  select * into s from test_sessions where code = upper(trim(p_code)) and closed_at is null and expires_at > now();
  if s.id is null then raise exception 'That code is not active. Check with your Product Educator.'; end if;

  select * into att from test_attempts where session_id = s.id and employee_id = emp.id;
  if att.id is not null and att.submitted_at is not null then
    raise exception 'You have already completed this test.';
  end if;
  if att.id is null then
    select array_agg(id) into qids from (
      select id from questions where active and product_id = any (s.product_ids) order by random() limit s.question_count) x;
    insert into test_attempts (session_id, employee_id, store_name, question_ids)
    values (s.id, emp.id, s.store_name, coalesce(qids, '{}'))
    returning * into att;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
      'id', q.id, 'type', q.type, 'prompt', q.prompt, 'image', q.image,
      'options', jsonb_shuffle(q.options)) order by array_position(att.question_ids, q.id)), '[]'::jsonb)
  into result from questions q where q.id = any (att.question_ids);

  return jsonb_build_object('session_id', s.id, 'attempt_id', att.id, 'store_name', s.store_name,
                            'questions', result);
end;
$$;

create or replace function public.submit_test_attempt(
  p_attempt_id uuid, p_answers jsonb, p_duration_s int default null, p_blur_count int default 0)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  att test_attempts;
  a jsonb;
  q questions;
  ok boolean;
  v_score int := 0;
  v_total int := 0;
  details jsonb := '[]'::jsonb;
  tier text;
begin
  select * into att from test_attempts where id = p_attempt_id and employee_id = auth.uid();
  if att.id is null then raise exception 'attempt not found'; end if;
  if att.submitted_at is not null then raise exception 'already submitted'; end if;

  v_total := coalesce(array_length(att.question_ids, 1), 0);
  for a in select * from jsonb_array_elements(p_answers) loop
    select * into q from questions where id = (a ->> 'id')::int and id = any (att.question_ids);
    if q.id is null then continue; end if;
    ok := grade_answer(q, a -> 'answer');
    if ok then v_score := v_score + 1; end if;
    details := details || jsonb_build_object('id', q.id, 'prompt', q.prompt, 'correct', ok,
      'your_answer', a -> 'answer',
      'correct_answer', case when q.type = 'mc' then to_jsonb(q.options ->> q.correct_index) else q.options end);
  end loop;
  tier := prize_tier_for(v_score, v_total);

  update test_attempts set score = v_score, total = v_total, prize_tier = tier, answers = details,
    submitted_at = now(), duration_s = p_duration_s, blur_count = p_blur_count
  where id = att.id;

  return jsonb_build_object('score', v_score, 'total', v_total, 'prize_tier', tier);
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: staff opens a session (6-char code)
-- ---------------------------------------------------------------------
create or replace function public.open_test_session(p_store text, p_product_ids text[], p_question_count int default 20)
returns test_sessions
language plpgsql security definer set search_path = public as $$
declare
  s test_sessions;
  c text;
begin
  if not staff_can_see_store(p_store) then raise exception 'not your store'; end if;
  loop
    c := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from test_sessions where code = c and closed_at is null);
  end loop;
  insert into test_sessions (code, store_name, pe_id, product_ids, question_count)
  values (c, p_store, auth.uid(), p_product_ids, p_question_count) returning * into s;
  return s;
end;
$$;

-- Live roster for a session (staff)
create or replace function public.session_roster(p_session_id uuid)
returns jsonb
language sql security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'employee', e.name, 'email', e.email, 'score', t.score, 'total', t.total,
    'prize_tier', t.prize_tier, 'started_at', t.started_at, 'submitted_at', t.submitted_at,
    'blur_count', t.blur_count, 'duration_s', t.duration_s) order by t.started_at), '[]'::jsonb)
  from test_attempts t join employees e on e.id = t.employee_id
  join test_sessions s on s.id = t.session_id
  where t.session_id = p_session_id and staff_can_see_store(s.store_name);
$$;

-- Employee's own progress summary (home grid)
create or replace function public.my_progress()
returns jsonb
language sql security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(product_id, jsonb_build_object(
    'attempts', attempts, 'best', best, 'best_total', best_total, 'last_at', last_at)), '{}'::jsonb)
  from (
    select product_id, count(*) attempts, max(score) best,
           (array_agg(total order by score desc))[1] best_total, max(created_at) last_at
    from module_attempts where employee_id = auth.uid() group by product_id) x;
$$;

revoke execute on function public.open_test_session(text, text[], int) from anon;
revoke execute on function public.session_roster(uuid) from anon;
revoke execute on function public.get_module_questions(text, int) from anon;
revoke execute on function public.submit_module_attempt(text, jsonb, int, int) from anon;
revoke execute on function public.join_test_session(text) from anon;
revoke execute on function public.submit_test_attempt(uuid, jsonb, int, int) from anon;
revoke execute on function public.my_progress() from anon;
