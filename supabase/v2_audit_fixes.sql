-- supabase/v2_audit_fixes.sql — answer-giveaway + coverage audit, 2026-10-03.
-- Applied live 2026-10-03 as migration `audit_a_scope_column` (part A) plus
-- a series of single statements through the Supabase connector (the
-- connector cancelled several multi-statement batches, so parts B-E went in
-- piecemeal; wording of a few bullets/options differs slightly from below —
-- the live DB is authoritative). Q49 (Edge vs Superblast) was retired
-- instead of reworded; two Rise 3 questions (price, ride feel) were added so
-- its module pool stays above the 8-question draw. Idempotent.
--
-- Findings (Mike asked: "do we give away any answers, or ask things we never
-- taught before the test?"):
--  A. "Which shoe?" questions asked INSIDE that shoe's own module are free
--     points (you just tapped "Boston 13" and watched its video). New
--     `questions.scope`: 'test_only' keeps them out of single-shoe module
--     draws; they still appear in the Full Lineup module and the
--     certification test, where products are mixed.
--  B. Options that carried the numbers needed to answer (drop/stack values
--     in the option text, stack heights in an ordering question).
--  C. Long-correct / silly-distractor patterns, and prompts that restated
--     the answer ("fiberglass RODS" → ENERGYRODS; "carbon RIM" → ENERGYRIM).
--  D. One question's correct option answering another question in the
--     same bank (Pro 5 weight+stack+drop combo; "what's new" naming
--     ENERGYRIM; Rise 3 Support Rods asked twice; Boston Continental asked
--     twice; Rise 3 foam asked twice).
--  E. Coverage: every tested fact must be in the module's "What to know"
--     bullets (shown with the video AND with the photo intro). Bullets
--     expanded for every product.

begin;

-- ───────── A. scope column + RPC filter ─────────
alter table questions add column if not exists scope text not null default 'any'
  check (scope in ('any', 'test_only'));
comment on column questions.scope is
  'any = module + test. test_only = excluded from that shoe''s own module draw (answer is the module itself); still used by Full Lineup module and certification tests.';

update questions set scope = 'test_only' where id in (
  3,   -- ONE shoe for easy + tempo → Boston 13
  72,  -- which has ENERGYRODS → Boston 13
  73,  -- half-marathon workhorse → Boston 13
  2,   -- most stable/planted → Rise 3
  5,   -- nurse on her feet → Rise 3
  38,  -- budget plush trainer at $140 → Rise 3
  84   -- new runner, comfort + value → Rise 3
);

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
  from (select * from questions
        where product_id = p_product_id and active
          and (scope = 'any' or p_product_id = 'full-lineup')
        order by random() limit n) q;
  return result;
end;
$$;

-- ───────── B. numbers in options ─────────
update questions set
  options = '["Hyperboost Edge","Hyperboost Run","They are the same height"]',
  correct_index = 0
where id = 62;

update questions set
  prompt = 'Among the Adizero and Hyperboost shoes, which has the HIGHEST heel-to-toe drop?',
  options = '["Evo SL","Adios Pro 5","Hyperboost Edge","Boston 13"]',
  correct_index = 0
where id = 92;

update questions set
  options = '["Adios Pro 5","Hyperboost Edge","Supernova Rise 3","Boston 13"]',
  correct_index = 0
where id = 41;

update questions set
  options = '["Hyperboost Edge","Adios Pro 5","Evo SL"]'
where id = 98;

update questions set
  options = '["$30","$50","$10","They are the same price"]',
  correct_index = 0
where id = 91;

-- ───────── C. long-correct / restated-answer patterns ─────────
update questions set
  options = '["Engineered LIGHTLOCK 2.0 with internal locking bands and anti-slip heel pods","PRIMEWEAVE with heel comfort pods","Engineered mesh with a gusseted tongue","A woven upper with an external EXO cage"]',
  correct_index = 0
where id = 54;

update questions set
  options = '["Pro 5 has more stack (39 vs 36mm) and a carbon-infused ENERGYRIM instead of a full carbon plate","Pro 5 has less stack (36 vs 39mm) but a full carbon plate","Both use a full-length carbon plate; the Vaporfly costs $25 more","Both use the same PEBA foam; the Pro 5 is heavier"]',
  correct_index = 0
where id = 66;

update questions set
  options = '["Both sit around a 45–46mm stack; the Edge has a 6mm drop vs 8mm and a lower price","The Edge has 10mm more stack and costs $25 more","The Superblast is plate-free; the Edge runs a carbon plate","Both are 8mm drop; the Superblast is lighter and cheaper"]',
  correct_index = 0
where id = 49;

update questions set
  options = '["Lower stack and lighter at a lower price — the everyday trainer to the Edge''s max-cushion super trainer","Taller stack and heavier at a higher price — the max-cushion option of the two","Same stack, but with ENERGYRODS for tempo work","The same shoe with a GORE-TEX upper"]',
  correct_index = 0
where id = 37;

update questions set
  prompt = 'Which midsole technology gives the Boston 13 its propulsion and energy return?',
  options = '["ENERGYRODS 2.0","A full-length carbon plate","Torsion System","A TPU shank"]',
  correct_index = 0
where id = 32;

update questions set
  prompt = 'Which shoe uses the all-new carbon-fiber-infused ENERGYRIM (a rim, not rods)?',
  options = '["Adios Pro 5","Boston 13","Evo SL","Hyperboost Edge"]',
  correct_index = 0
where id = 47;

-- ───────── D. cross-question leaks within a bank ─────────
update questions set
  options = '["A max-cushion recovery shoe","A versatile tempo and daily trainer","A stability shoe for overpronators","An ultramarathon shoe"]',
  correct_index = 1
where id = 4;

update questions set
  prompt = 'What is the Adios Pro 5''s men''s weight?',
  options = '["6.3 oz (177 g)","7.0 oz (200 g)","5.3 oz (150 g)","8.7 oz (247 g)"]',
  correct_index = 0
where id = 12;

update questions set
  options = '["Nothing structural — it''s the Pro 4 in a new colorway","A redesigned carbon midsole element, a more breathable upper, and more foam underfoot","It swaps LIGHTSTRIKE PRO for DREAMSTRIKE+ for a softer daily ride","It drops the carbon entirely to become a plate-free tempo shoe"]',
  correct_index = 1
where id = 19;

-- Duplicates / answered-by-neighbor: retire the weaker twin.
update questions set active = false where id in (
  74,  -- Boston Continental T/F — Q31's prompt states it
  13,  -- Rise 3 foam (v1) — Q85 covers it with better distractors
  82   -- Rise 3 Support Rods — Q22's correct option states it
);

-- ───────── E. coverage: "What to know" bullets ─────────
update products set intro_bullets = '[
 "This season''s featured push. Tech sheet purpose: DAILY SUPER TRAINER — cushioned & responsive, 0–42 km, neutral, all surfaces.",
 "HYPERBOOST PRO foam: pelletized, derived from racing footwear, tuned for soft landings and a springy toe-off. Versus original BOOST it is less than half the weight with ~20% more energy return.",
 "PRIMEWEAVE woven upper — super soft and lightweight — plus comfort pods in the heel for extra lockdown and a soft gusseted tongue for pressureless midfoot support.",
 "LIGHTTRAXION: impossibly thin, full-length outsole for traction on any surface.",
 "45mm heel / 39mm forefoot, 6mm drop — the tallest stack in the lineup (the Hyperboost Run sits at 38/32). Men''s 258 g / 9.1 oz.",
 "RRP $200. Head-to-head: ASICS Superblast 3 is a similar 46mm stack at 8mm drop and $210 — the Edge is lower drop and lower price.",
 "Sell it as: plush, energized, everyday comfort — not race-day firm."
]'::jsonb where id = 'hyperboost-edge';

update products set intro_bullets = '[
 "Marathon racing shoe. Tech sheet purpose: RACE TO WIN. 0–42 km, neutral, road.",
 "Men''s 177 g / 6.3 oz, women''s 150 g / 5.3 oz. 39mm / 34mm stack, 5mm drop. Versus the Pro 4: ~23 g lighter, +1mm in the forefoot, drop goes 6mm → 5mm.",
 "Midsole: two layers of LIGHTSTRIKE PRO (39mm underfoot) with the all-new carbon-fiber-infused ENERGYRIM, replacing the Pro 4''s ENERGYRODS 2.0 — uninterrupted energy return and more stability.",
 "Upper: Engineered LIGHTLOCK 2.0 — a one-way stretch woven with internal locking bands and anti-slip heel foam pods; better breathability than the Pro 4''s LIGHTLOCK.",
 "Outsole: LIGHTTRAXION with a zoned grip design, plus Continental rubber in the forefoot for a no-slip toe-off.",
 "RRP $275 (Pro 4 was $250). Head-to-head: Nike Vaporfly 4 is 36mm stack, 5.9 oz, $270, ZoomX + full carbon plate."
]'::jsonb where id = 'adios-pro-5';

update products set intro_bullets = '[
 "The tempo / daily trainer in the Adizero (Light & Fast) pillar — the one-shoe answer for easy runs AND tempo work. RRP $160.",
 "ENERGYRODS 2.0 — fiberglass rods, not a plate — for smooth, propulsive transitions. Versus the Boston 12 they are more smoothly integrated with more control.",
 "LIGHTSTRIKE PRO over LIGHTSTRIKE: 13.8% more LIGHTSTRIKE PRO than the Boston 12.",
 "LIGHTTRAXION outsole alongside Continental rubber: lighter, still grippy.",
 "Lighter engineered mesh upper with improved heel lockdown versus the 12.",
 "About 8.5 oz — between the Evo SL (~7.9 oz) and the Hyperboost Edge (9.1 oz)."
]'::jsonb where id = 'boston-13';

update products set intro_bullets = '[
 "Entry point to the Adizero lineup. Tech sheet purpose: TRAIN FOR RACES — \"feel fast all day.\" For runners who want to feel fast without being locked into a race-only shoe. Inspired by the Pro Evo 1.",
 "Full LIGHTSTRIKE PRO midsole — same foam family as the racing line — made by non-compression molding, which cuts weight and raises energy return. Plate-free; a small nylon \"dogbone\" keeps the ride smooth and stable.",
 "Engineered mesh upper (woven on the Evo SL Woven): targeted support and breathability. Variants: EXO adds an external exoskeleton cage and protective woven shell; Zip adds a tongue-length zip for easy entry and lockdown.",
 "Continental rubber forefoot + translucent rubber heel: traction and durability without weight.",
 "36mm / 29mm stack, 7mm drop. Men''s 224 g / 7.9 oz, women''s 189 g / 6.7 oz. RRP $150.",
 "Versus the Hyperboost Edge: snappier, lighter, more flexible — built for intervals, track and tempo, not plush everyday cushioning."
]'::jsonb where id = 'evo-sl';

update products set intro_bullets = '[
 "Supportive Comfort pillar. The most stable, planted shoe in the lineup — the default for new runners and anyone on their feet all shift.",
 "DREAMSTRIKE+ foam: softer and plusher than LIGHTSTRIKE PRO. (DREAMSTRIKE PRO is the newer compound in the Supernova Prima 3.)",
 "Marketed neutral, but Support Rods add structure and smooth the heel-to-toe transition.",
 "Everyday trainer, comfort-oriented, built for easy runs. About 9.7 oz — the heaviest and most cushioned shoe in the lineup.",
 "The budget-friendly plush daily trainer at $140.",
 "Also available as the Supernova Rise 3 GTX for wet and winter running."
]'::jsonb where id = 'supernova-rise-3';

update products set intro_bullets = '[
 "The everyday Hyperboost. Tech sheet purpose: HYPER COMFORT — cushioned & energized, 0–42 km, neutral, all surfaces. Launches 2026-10-08.",
 "HYPERBOOST PRO at race-day specs, foamed for everyday training and all-day wearability.",
 "Soft PRIMEWEAVE woven upper with zoned engineering and a soft gusseted tongue for plush midfoot support.",
 "Full-length LIGHTTRAXION outsole with Continental rubber pods in the forefoot for toe-off traction.",
 "38mm / 32mm stack, 6mm drop. Men''s 247 g / 8.7 oz, women''s 211 g / 7.4 oz. RRP $170 — $30 under the Hyperboost Edge.",
 "Versus the Edge: lower stack, lighter, cheaper — the everyday trainer to the Edge''s max-cushion super trainer. Siblings: Run ATR ($180, road-to-trail, Continental WinterGrip lugs) and Edge GTX ($200, waterproof).",
 "Positioned against ASICS Gel-Nimbus 28, Nike Vomero Plus, Brooks Glycerin 23, New Balance 1080 v15."
]'::jsonb where id = 'hyperboost-run';

update products set intro_bullets = '[
 "Three pillars, lightest & fastest → most supportive: Adizero (Light & Fast) → Hyperboost (Comfort Energized) → Supernova (Supportive Comfort).",
 "Tech-sheet purposes: Adios Pro 5 = race to win · Evo SL = train for races · Boston 13 = tempo + daily · Hyperboost Edge = daily super trainer · Supernova Rise 3 = run everyday.",
 "Price, high to low: Adios Pro 5 $275 > Hyperboost Edge $200 > Boston 13 $160 > Evo SL $150 > Supernova Rise 3 $140.",
 "Weight, light to heavy: Adios Pro 5 (6.3 oz) → Evo SL (7.9 oz) → Boston 13 (~8.5 oz) → Hyperboost Edge (9.1 oz) → Supernova Rise 3 (~9.7 oz).",
 "Heel stack, tall to short: Hyperboost Edge 45mm → Adios Pro 5 39mm → Evo SL 36mm. Drop: Evo SL 7mm · Edge 6mm · Boston 6mm · Pro 5 5mm (lowest).",
 "Foams: LIGHTSTRIKE PRO = all Adizero (Evo SL, Boston 13, Pro 5) · HYPERBOOST PRO = Hyperboost · DREAMSTRIKE+ = Supernova. ZoomX is Nike''s, not ours.",
 "Carbon: Pro 5 has the ENERGYRIM (a rim); Boston 13 has ENERGYRODS 2.0 (rods); Evo SL is rod- and plate-free. LIGHTTRAXION + Continental: Pro 5 and Boston 13.",
 "Entry point to Adizero = Evo SL. Plush do-it-all super trainer = Hyperboost Edge. Most stable / best value = Supernova Rise 3."
]'::jsonb where id = 'full-lineup';

commit;
