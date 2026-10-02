-- supabase/seed_v2_techsheet.sql — content depth pass, 2026-10-01.
-- Source: FW26 Product Education deck (text layer, in-session only — the
-- deck itself is NOT in the repo) + Mike-confirmed facts in MEMORY.md.
-- Idempotent: each insert is skipped if a question with the same prompt
-- already exists. Apply after seed_v2.sql. source = 'techsheet'.
--
-- Deliberately avoids: Evo SL 2 (embargo 2026-12-01), Supernova Rise 4
-- (embargo 2027-03-01). Hyperboost Run questions are fine to seed (PR
-- embargo lifted 2026-07-21) but the product stays active=false until the
-- 2026-10-08 NAM launch.

begin;

create temp table _nq (product_id text, type text, prompt text, options jsonb, correct_index int, explain text) on commit drop;

insert into _nq values
-- ───────── Hyperboost Edge ─────────
('hyperboost-edge','mc','On the tech sheet, what is the Hyperboost Edge''s stated PURPOSE?',
 '["Marathon racing","Daily super trainer","Road to trail","Wet or winter running"]',1,
 'Hyperboost Edge = Daily Super Trainer, benefit "Cushioned & Responsive", 0–42 km, neutral, all surfaces.'),
('hyperboost-edge','mc','What do the comfort pods in the Hyperboost Edge''s heel do?',
 '["Add extra lockdown at the heel","Add cushioning under the arch","Make the shoe waterproof","Add reflectivity for night running"]',0,
 'PRIMEWEAVE + comfort pods: a super-soft woven upper balancing comfort and lockdown, with heel pods for additional lockdown.'),
('hyperboost-edge','mc','What is the Hyperboost Edge''s retail price?',
 '["$160","$180","$200","$225"]',2,
 'Hyperboost Edge retails at $200 — $30 above the Hyperboost Run ($170) and $75 below the Adios Pro 5 ($275).'),
('hyperboost-edge','mc','Compared with the original BOOST foam, HYPERBOOST PRO is:',
 '["Less than half the weight with about 20% more energy return","The same weight with more energy return","Heavier but more cushioned","Identical — just a new name"]',0,
 'The deck''s midsole chart: HYPERBOOST PRO is less than half the weight of BOOST OG and returns ~20% more energy. "It''s not Boost. It''s space-grade Boost."'),
('hyperboost-edge','mc','What does the Hyperboost Edge''s soft gusseted tongue provide?',
 '["Extra midfoot support with a pressureless hold","Waterproof protection","Heel lockdown","A lighter overall shoe"]',0,
 'The upper is lightweight and flexible for a pressureless hold, with a soft gusset tongue for extra support in the midfoot.'),
('hyperboost-edge','mc','Which Hyperboost model has the taller stack?',
 '["Hyperboost Edge — 45mm / 39mm","Hyperboost Run — 38mm / 32mm","They''re the same height","Hyperboost Run is taller"]',0,
 'Edge: 45mm heel / 39mm forefoot. Run: 38mm / 32mm. Both are 6mm drop. The Edge is the max-stack super trainer; the Run is the everyday comfort trainer.'),

-- ───────── Adizero Adios Pro 5 ─────────
('adios-pro-5','mc','What is the Adios Pro 5''s heel-to-toe drop?',
 '["4mm","5mm","6mm","8mm"]',1,
 '39mm heel / 34mm forefoot = 5mm drop. The Pro 4 was 6mm; the Pro 5 adds 1mm in the forefoot for higher energy return.'),
('adios-pro-5','mc','What support category is the Adios Pro 5?',
 '["Neutral","Light support","Stability","Motion control"]',0,
 'Support: NEUTRAL. Purpose: race to win. Use case: 0–42 km on road.'),
('adios-pro-5','mc','How does the Adios Pro 5''s stack height compare with the Pro 4?',
 '["+1mm in the forefoot, for higher energy return","2mm lower overall to save weight","Identical stack","+5mm in the heel"]',0,
 'Model benefits slide: stack height +1mm in the forefoot for higher energy return; weight ~23 g lighter.'),
('adios-pro-5','mc','A customer is cross-shopping the Adios Pro 5 against the Nike Vaporfly 4. Which comparison is accurate?',
 '["Pro 5 has 3mm more stack (39 vs 36mm) and a carbon-infused ENERGYRIM instead of a full carbon plate","The Pro 5 is $50 cheaper","The Vaporfly has the higher stack","They use the same midsole foam"]',0,
 'Competitor sheet: Vaporfly 4 = 36mm stack, 6mm drop, 5.9 oz, $270, ZoomX + full-length Flyplate. Pro 5 = 39mm, 5mm, 6.3 oz, $275, LIGHTSTRIKE PRO + ENERGYRIM.'),
('adios-pro-5','mc','How is the Adios Pro 5''s LIGHTSTRIKE PRO midsole constructed?',
 '["Two layers of LIGHTSTRIKE PRO","One layer of LIGHTSTRIKE PRO over EVA","Full-length BOOST","DREAMSTRIKE+ with a carbon plate"]',0,
 'Two layers of LIGHTSTRIKE PRO provide maximum cushion and protection plus lightweight energy return — and reduce leg fatigue in training and racing.'),
('adios-pro-5','mc','LIGHTLOCK 2.0 on the Adios Pro 5 is described as what kind of material?',
 '["A one-way stretch woven with internal locking bands","A knit sock upper","Synthetic leather","Open engineered mesh"]',0,
 'Adizero microfit LIGHTLOCK 2.0: lightweight one-way stretch woven, internal locking bands that contour the foot, anti-slip heel foam pods, and engineered breathability.'),

-- ───────── Adizero Boston 13 ─────────
('boston-13','mc','What is the Adizero Boston 13''s retail price?',
 '["$140","$150","$160","$180"]',2,
 'Boston 13 = $160. Lineup, high to low: Pro 5 $275 > Hyperboost Edge $200 > Boston 13 $160 > Evo SL $150 > Supernova Rise 3 $140.'),
('boston-13','mc','Roughly how much does the Boston 13 weigh (men''s)?',
 '["~7.0 oz","~8.5 oz","~9.1 oz","~9.7 oz"]',1,
 'About 8.5 oz — between the Evo SL (~7.9 oz) and the Hyperboost Edge (9.1 oz).'),
('boston-13','mc','Which footwear pillar does the Boston 13 belong to?',
 '["Adizero — Light & Fast","Hyperboost — Comfort Energized","Supernova — Supportive Comfort","Terrex — Trail"]',0,
 'It''s an Adizero: the Light & Fast pillar alongside the Adios Pro 5 and Evo SL.'),
('boston-13','mc','Which of these shoes has ENERGYRODS?',
 '["Boston 13","Evo SL","Hyperboost Edge","Supernova Rise 3"]',0,
 'Boston 13 runs ENERGYRODS 2.0 (fiberglass rods). The Evo SL is plate- and rod-free (nylon dogbone only); the Pro 5 has moved to ENERGYRIMS.'),
('boston-13','mc','A customer has a half marathon in 8 weeks and wants one workhorse shoe for workouts AND long runs — not a race-day shoe. You lead with:',
 '["Boston 13","Adios Pro 5","Supernova Rise 3","Hyperboost Edge GTX"]',0,
 'Boston 13 is the tempo/daily trainer: ENERGYRODS 2.0 + LIGHTSTRIKE PRO give it range from easy miles to race pace without the Pro 5''s price or race-only feel.'),
('boston-13','mc','True or False: the Boston 13 uses Continental rubber in its outsole.',
 '["True","False"]',0,
 'True — LIGHTTRAXION alongside Continental rubber, to cut weight while keeping grip.'),

-- ───────── Adizero Evo SL ─────────
('evo-sl','mc','What are the Evo SL''s stack height and drop?',
 '["36mm / 29mm, 7mm drop","39mm / 34mm, 5mm drop","45mm / 39mm, 6mm drop","38mm / 32mm, 6mm drop"]',0,
 'Evo SL: 36mm heel / 29mm forefoot, 7mm drop — the highest drop in the Adizero/Hyperboost set. (The EXO and Zip variants sit at 39/32.)'),
('evo-sl','mc','What is the Evo SL''s men''s weight?',
 '["224 g / 7.9 oz","177 g / 6.3 oz","247 g / 8.7 oz","258 g / 9.1 oz"]',0,
 'Men''s 224 g / 7.9 oz; women''s 189 g / 6.7 oz. Only the Adios Pro 5 is lighter.'),
('evo-sl','mc','On the tech sheet, what is the Evo SL''s stated PURPOSE?',
 '["Train for races","Race to win","Run everyday","Hyper comfort"]',0,
 '"Train for races" — tagline "Feel fast all day." Benefit: lightweight & fast. 0–42 km, neutral, all surfaces.'),
('evo-sl','mc','How is the Evo SL''s LIGHTSTRIKE PRO foam made, and why does it matter?',
 '["Non-compression molding — cuts weight and raises energy return","Injection-molded EVA — cheaper to produce","Pelletized TPU — softer landings","Nitrogen infusion — more durability"]',0,
 'LIGHTSTRIKE PRO is crafted in a non-compression molding process that reduces weight significantly while providing greater energy return.'),
('evo-sl','mc','What does the Evo SL EXO add over the standard Evo SL?',
 '["An external exoskeleton support and a protective woven shell","A carbon plate","A GORE-TEX membrane","A BOOST midsole"]',0,
 'EXO = an all-new fit system: external exoskeleton (EXO) support with a protective woven shell that keeps the elements out. Same foam, same $150.'),
('evo-sl','mc','What does the "Zip" in Evo SL Zip refer to?',
 '["A tongue-length zip for easy entry and extra lockdown","A zipped lace garage","A zip-off gaiter","Nothing — it''s a colorway name"]',0,
 'Evo SL Zip: stretch woven upper with bolder stripes and a tongue-length zip for ease of entry and enhanced lockdown.'),

-- ───────── Supernova Rise 3 ─────────
('supernova-rise-3','mc','Roughly how much does the Supernova Rise 3 weigh (men''s)?',
 '["~9.7 oz","~8.5 oz","~7.9 oz","~6.3 oz"]',0,
 'About 9.7 oz — the heaviest in the lineup, and also the most cushioned, comfort-first build.'),
('supernova-rise-3','mc','What do the Support Rods in the Supernova Rise 3 do?',
 '["Add structure and smooth the heel-to-toe transition","Propel toe-off like a carbon plate","Waterproof the midsole","Reflect light at night"]',0,
 'Rise 3 is marketed neutral, but Support Rods add a bit of structure and transition support — why it feels so planted.'),
('supernova-rise-3','mc','A customer loves the Supernova Rise 3 but runs in rain and winter. Is there a waterproof option?',
 '["Yes — the Supernova Rise 3 GTX","No — only Hyperboost has GORE-TEX","No — only Terrex is waterproof","Yes — but only in the Prima"]',0,
 'The FW26 GORE-TEX range includes Hyperboost GTX, Supernova Ease 2 GTX, and Supernova Rise 3 GTX.'),
('supernova-rise-3','mc','A brand-new runner wants to do 2–3 easy miles, three times a week, and cares about comfort and value. You lead with:',
 '["Supernova Rise 3","Adios Pro 5","Evo SL","Boston 13"]',0,
 'Rise 3 is the comfort-oriented everyday trainer built for easy runs — and the most budget-friendly shoe in the lineup at $140.'),
('supernova-rise-3','mc','Which Supernova foam is in the Rise 3?',
 '["DREAMSTRIKE+","DREAMSTRIKE PRO","LIGHTSTRIKE PRO","HYPERBOOST PRO"]',0,
 'Rise 3 = DREAMSTRIKE+. (DREAMSTRIKE PRO is the new aliphatic-TPU compound in the Supernova Prima 3; LIGHTSTRIKE PRO is Adizero; HYPERBOOST PRO is Hyperboost.)'),

-- ───────── Hyperboost Run (active = false until 2026-10-08) ─────────
('hyperboost-run','mc','What is the Hyperboost Run''s men''s weight?',
 '["247 g / 8.7 oz","258 g / 9.1 oz","224 g / 7.9 oz","283 g / 9.9 oz"]',0,
 'Men''s 247 g / 8.7 oz; women''s 211 g / 7.4 oz. Lighter than the Edge (9.1 oz) thanks to the lower 38mm stack.'),
('hyperboost-run','mc','On the tech sheet, what is the Hyperboost Run''s stated PURPOSE?',
 '["Hyper comfort","Daily super trainer","Race to win","Road to gravel"]',0,
 'Hyperboost Run = Hyper Comfort, "Cushioned & Energized" — race-day foam specs foamed for everyday training and all-day wearability.'),
('hyperboost-run','mc','Which competitor is the Hyperboost Run positioned against on the tech sheet?',
 '["ASICS Gel-Nimbus 28","Nike Vaporfly 4","ASICS Metaspeed Edge","Hoka Rocket 3"]',0,
 'Run competitors: ASICS Gel-Nimbus 28 ($170), Nike Vomero Plus ($180), Brooks Glycerin 23 ($175), New Balance 1080 v15 ($170). The others listed are Adios Pro 5 competitors.'),
('hyperboost-run','mc','Which Hyperboost model is built for road-to-trail with a Continental WinterGrip lug outsole?',
 '["Hyperboost Run ATR","Hyperboost Edge","Hyperboost Run","Supernova Prima 3"]',0,
 'Hyperboost Run ATR ($180): breathable mesh with a splash-proof mudguard and a rugged Continental WinterGrip lug pattern. "Road to gravel."'),
('hyperboost-run','mc','What upper does the Hyperboost Run use?',
 '["Soft PRIMEWEAVE woven with a gusseted tongue","Engineered knit","Ripstop with a GORE-TEX membrane","Synthetic leather"]',0,
 'Soft PRIMEWEAVE woven upper: lightweight breathability with zoned engineering and a soft gusset tongue for plush midfoot support.'),
('hyperboost-run','mc','What is the price gap between the Hyperboost Edge and the Hyperboost Run?',
 '["$30 — Edge $200, Run $170","$50 — Edge $220, Run $170","$10 — Edge $180, Run $170","They''re the same price"]',0,
 'Edge $200 (max-stack super trainer) vs. Run $170 (everyday comfort trainer).'),

-- ───────── Full lineup ─────────
('full-lineup','mc','Among the Adizero and Hyperboost shoes, which has the HIGHEST heel-to-toe drop?',
 '["Evo SL — 7mm","Adios Pro 5 — 5mm","Hyperboost Edge — 6mm","Boston 13 — 6mm"]',0,
 'Evo SL 7mm > Hyperboost Edge 6mm = Boston 13 6mm > Adios Pro 5 5mm.'),
('full-lineup','mc','Which shoe''s tech sheet says "Race to win"?',
 '["Adios Pro 5","Boston 13","Evo SL","Hyperboost Edge"]',0,
 'Pro 5 = race to win. Evo SL = train for races. Hyperboost Edge = daily super trainer. Supernova = run everyday.'),
('full-lineup','mc','A customer is chasing a Boston-qualifying PR on race day and wants the fastest shoe we make. You lead with:',
 '["Adios Pro 5","Boston 13","Hyperboost Edge","Evo SL"]',0,
 'Race day = Adios Pro 5: 6.3 oz, two layers of LIGHTSTRIKE PRO, carbon-infused ENERGYRIM. Everything else is a trainer.'),
('full-lineup','mc','Which midsole foam is shared by the Evo SL, Boston 13, and Adios Pro 5?',
 '["LIGHTSTRIKE PRO","HYPERBOOST PRO","DREAMSTRIKE+","BOOST"]',0,
 'All three Adizero shoes run LIGHTSTRIKE PRO. Hyperboost = HYPERBOOST PRO. Supernova = DREAMSTRIKE+.'),
('full-lineup','mc','Which of these is NOT an adidas midsole foam?',
 '["ZoomX","LIGHTSTRIKE PRO","DREAMSTRIKE+","HYPERBOOST PRO"]',0,
 'ZoomX is Nike''s PEBA superfoam (Vaporfly, Vomero). Know it so you can position against it.'),
('full-lineup','mc','Which shoe is the "do-it-all super trainer" — the plush, max-stack option a customer should pick for everyday miles with a springy feel?',
 '["Hyperboost Edge","Adios Pro 5","Evo SL","Boston 13"]',0,
 'Hyperboost Edge: 45mm of HYPERBOOST PRO, PRIMEWEAVE upper, LIGHTTRAXION outsole. Comfort energized.'),
('full-lineup','order','Put these shoes in order by HEEL STACK HEIGHT — TALLEST to SHORTEST.',
 '["Hyperboost Edge (45mm)","Adios Pro 5 (39mm)","Evo SL (36mm)"]',null,
 'Hyperboost Edge 45mm → Adios Pro 5 39mm → Evo SL 36mm. The Edge is the tallest stack in the lineup.');

insert into questions (product_id, type, prompt, options, correct_index, explain, source)
select n.product_id, n.type, n.prompt, n.options, n.correct_index, n.explain, 'techsheet'
from _nq n
where not exists (select 1 from questions q where q.prompt = n.prompt);

commit;
