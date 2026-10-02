// supabase/seed_v2.js — generates supabase/seed_v2.sql from js/questions.js +
// js/stores.js + the product facts below. Run with `node supabase/seed_v2.js`
// then apply the SQL to the project (Claude does this via the Supabase MCP
// connector). Idempotent: products/questions upsert on natural keys.
//
// Product facts: MEMORY.md "Running line" (Mike-confirmed) + FW26 deck.
// Myagi questions: captured 2026-09-29 from the aBSP Myagi channel.

const fs = require("fs");
const vm = require("vm");

function load(file, name) {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, "utf8") + `\n;globalThis.__out = ${name};`, ctx);
  return ctx.__out;
}
const QUIZ = load("js/questions.js", "QUIZ_QUESTIONS");
const STORES = load("js/stores.js", "STORE_LOCATIONS");

const PRODUCTS = [
  {
    id: "hyperboost-edge", name: "Hyperboost Edge", franchise: "Hyperboost", pillar: "Comfort Energized",
    rrp: 200, hero_image: "hyperboost-edge-hero.jpg", sort: 10, questions_per_quiz: 8,
    bullets: [
      "This season's featured push — the do-it-all super trainer.",
      "HYPERBOOST PRO foam: pelletized, racing-derived, tuned for soft landings and a springy toe-off.",
      "PRIMEWEAVE woven upper — super soft, lightweight, locks the foot in.",
      "LIGHTTRAXION full-length outsole for traction on any surface.",
      "45mm heel / 39mm forefoot, 6mm drop — one of the tallest stacks in the lineup. ~9.1 oz.",
      "Sell it as: plush, energized, everyday comfort — not race-day firm.",
    ],
  },
  {
    id: "adios-pro-5", name: "Adizero Adios Pro 5", franchise: "Adizero", pillar: "Light & Fast",
    rrp: 275, hero_image: "adios-pro-5-hero.jpg", sort: 20, questions_per_quiz: 8,
    bullets: [
      "Marathon racing shoe. Purpose: race to win. 0–42 km, neutral, road.",
      "177 g / 6.3 oz (men's), 150 g / 5.3 oz (women's). 39mm / 34mm stack, 5mm drop.",
      "All-new carbon-fiber-infused ENERGYRIMS replace the Pro 4's EnergyRods 2.0 — more energy return, more stability.",
      "Engineered LIGHTLOCK 2.0 upper: one-way stretch, internal locking bands, anti-slip heel pods, better breathability.",
      "LIGHTTRAXION outsole with zoned grip + Continental rubber at the forefoot.",
      "RRP $275 (Pro 4 was $250).",
    ],
  },
  {
    id: "boston-13", name: "Adizero Boston 13", franchise: "Adizero", pillar: "Light & Fast",
    rrp: 160, hero_image: "boston-13-hero.jpg", sort: 30, questions_per_quiz: 8,
    bullets: [
      "The tempo / daily trainer — the one-shoe answer for easy runs AND tempo work.",
      "ENERGYRODS 2.0 (fiberglass rods, not a plate) for smooth, propulsive transitions.",
      "LIGHTSTRIKE PRO + LIGHTSTRIKE layered midsole — 13.8% more LIGHTSTRIKE PRO than the Boston 12.",
      "LIGHTTRAXION outsole alongside Continental rubber: lighter, still grippy.",
      "Lighter engineered mesh upper with improved heel lockdown vs. the 12.",
      "~8.5 oz — sits between the Evo SL and the Hyperboost Edge on the scale.",
    ],
  },
  {
    id: "evo-sl", name: "Adizero Evo SL", franchise: "Adizero", pillar: "Light & Fast",
    rrp: 150, hero_image: "evo-sl-side.jpg", sort: 40, questions_per_quiz: 8,
    bullets: [
      "Inspired by the Pro Evo 1 — race-day feel without being locked into a race-only shoe.",
      "Full LIGHTSTRIKE PRO midsole (same foam family as the racing line), plate-free with a smooth, natural ride.",
      "Nylon 'dogbone' inside for a smoother, more stable ride.",
      "Engineered mesh upper: targeted support and breathability. Woven version = Evo SL Woven.",
      "Continental rubber forefoot + translucent rubber heel: traction and durability without weight. ~7.9–8 oz.",
      "Entry point to the Adizero lineup. Best for intervals, track work, tempo. RRP $150.",
    ],
  },
  {
    id: "supernova-rise-3", name: "Supernova Rise 3", franchise: "Supernova", pillar: "Supportive Comfort",
    rrp: 140, hero_image: "supernova-rise-pair.jpg", sort: 50, questions_per_quiz: 8,
    bullets: [
      "The most stable, planted shoe in the lineup — the default for on-feet-all-shift customers.",
      "DREAMSTRIKE+ foam: softer and plusher than LIGHTSTRIKE PRO.",
      "Marketed neutral, but Support Rods add structure and transition support.",
      "Everyday trainer, comfort-oriented, built for easy runs. ~9.7 oz.",
      "The budget-friendly plush daily trainer at $140.",
    ],
  },
  {
    id: "full-lineup", name: "Full Running Lineup", franchise: null, pillar: null,
    rrp: null, hero_image: "footwear-pillars.jpg", sort: 0, questions_per_quiz: 10,
    bullets: [
      "Cross-lineup questions: pillars, price ranking, weight ranking, which-shoe-for-which-customer.",
      "Adizero = Light & Fast → Hyperboost = Comfort Energized → Supernova = Supportive Comfort.",
      "Price, high to low: Adios Pro 5 $275 > Hyperboost Edge $200 > Evo SL $150 > Supernova Rise 3 $140.",
      "Weight, light to heavy: Adios Pro 5 → Evo SL → Boston 13 → Hyperboost Edge → Supernova Rise 3.",
    ],
  },
];

const SECTION_TO_PRODUCT = {
  "Hyperboost Edge": "hyperboost-edge",
  "Adios Pro 5": "adios-pro-5",
  "Boston 13": "boston-13",
  "Evo SL Woven": "evo-sl",
  "Supernova Rise 3": "supernova-rise-3",
  "Footwear Pillars": "full-lineup",
  "Full Lineup": "full-lineup",
};

// Myagi questions (source: aBSP Myagi channel, 2026-09-29). Correct = index 0
// as captured; options get shuffled server-side at quiz time anyway.
const MYAGI = [
  { p: "supernova-rise-3", prompt: "What kind of runners is the Supernova Rise 3 built for?", options: ["An everyday trainer — comfort-oriented, good for easy runs", "Competitive sprinters looking for maximum speed", "Elite marathoners aiming for race-day performance", "Trail runners needing aggressive traction"], explain: "Rise 3 is the comfort-first everyday trainer in the lineup." },
  { p: "supernova-rise-3", prompt: "Does the Supernova Rise 3 offer stability, or is it purely neutral?", options: ["Marketed neutral, but Support Rods add structure and transition support", "A full stability shoe with maximum motion control", "A minimalist shoe with no support features", "A trail shoe designed for uneven terrain"], explain: "Neutral on paper; the Support Rods are what make it feel planted." },
  { p: "boston-13", prompt: "True or False: there is 13.8% more LIGHTSTRIKE PRO in the Boston 13's midsole than in its predecessor.", options: ["True", "False"], explain: "The Boston 13 carries 13.8% more LIGHTSTRIKE PRO than the Boston 12." },
  { p: "boston-13", prompt: "Which technology in the Boston 13 uses fiberglass rods embedded in the midsole to improve energy return and propulsion?", options: ["ENERGYRODS 2.0", "TPU Shank", "Torsion System", "Carbon plate"], explain: "ENERGYRODS 2.0 — rods, not a plate." },
  { p: "boston-13", prompt: "What outsole compound does the Boston 13 use alongside Continental rubber to cut weight while keeping grip?", options: ["LIGHTTRAXION", "Lightstrike Pro", "EverRun", "Adiwear"], explain: "LIGHTTRAXION keeps the outsole light; Continental rubber handles the grip." },
  { p: "boston-13", prompt: "What two midsole foams are layered in the Boston 13 to balance cushioning and responsiveness?", options: ["LIGHTSTRIKE and LIGHTSTRIKE PRO", "React and ZoomX", "Boost and EVA", "Fresh Foam and FuelCell"], explain: "LIGHTSTRIKE PRO on top for bounce, LIGHTSTRIKE underneath for stability." },
  { p: "boston-13", prompt: "How did ENERGYRODS 2.0 improve from the Boston 12 to the Boston 13?", options: ["Smoother integration and more control", "They're now metal instead of carbon", "They've been removed completely", "They're now visible through the outsole"], explain: "Better integration into the midsole = smoother transitions." },
  { p: "boston-13", prompt: "What key improvement was made to the Boston 13's upper?", options: ["Lighter engineered mesh and improved heel lockdown", "Thicker padding for warmth", "Waterproofing", "Added arch support"], explain: "Lighter mesh, better heel hold." },
  { p: "evo-sl", prompt: "What is the Evo SL powered by?", options: ["LIGHTSTRIKE PRO foam", "Continental rubber outsole", "Boost foam", "Dreamstrike+ foam"], explain: "A full LIGHTSTRIKE PRO midsole — the racing-line foam, plate-free." },
  { p: "evo-sl", prompt: "Where does the Evo SL sit in the Adizero lineup?", options: ["Entry point", "After the Boston 13", "After the Adios Pro", "It's not an Adizero"], explain: "Evo SL is the entry point to Adizero." },
  { p: "evo-sl", prompt: "What do the Continental rubber forefoot and translucent rubber heel provide?", options: ["Traction and durability without weighing you down", "Speed and agility", "Waterproofing", "Extra cushioning"], explain: "Grip where you need it, weight kept low." },
  { p: "evo-sl", prompt: "Who is the Evo SL for?", options: ["Runners who want to feel fast without being locked into a race-only shoe", "Race-day runners only", "Everyday easy-run runners only", "Trail runners"], explain: "Fast-feeling, versatile — not a one-job racing shoe." },
  { p: "evo-sl", prompt: "What is the primary design inspiration behind the Adizero Evo SL?", options: ["Pro Evo 1", "Adios Pro 4", "Boston 12", "Supernova Rise"], explain: "The Evo SL borrows its geometry and feel from the Pro Evo 1." },
  { p: "evo-sl", prompt: "Which Evo SL feature provides targeted support and improved breathability?", options: ["Engineered mesh upper", "LIGHTSTRIKE PRO midsole", "Continental rubber outsole", "Nylon dogbone"], explain: "The engineered mesh upper does the support-and-airflow job." },
  { p: "evo-sl", prompt: "What is the main advantage of the nylon 'dogbone' inside the Evo SL?", options: ["A smoother and more stable ride", "It increases weight", "It provides more grip", "It adds cushioning"], explain: "The dogbone is a stability piece — smoother, more controlled ride." },
];

function q(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }
function j(o) { return q(JSON.stringify(o)) + "::jsonb"; }

let sql = "-- generated by supabase/seed_v2.js — do not hand-edit\nbegin;\n";
for (const p of PRODUCTS) {
  sql += `insert into products (id, name, franchise, pillar, rrp, hero_image, intro_bullets, questions_per_quiz, sort)
values (${q(p.id)}, ${q(p.name)}, ${p.franchise ? q(p.franchise) : "null"}, ${p.pillar ? q(p.pillar) : "null"}, ${p.rrp ?? "null"}, ${q(p.hero_image)}, ${j(p.bullets)}, ${p.questions_per_quiz}, ${p.sort})
on conflict (id) do update set name = excluded.name, franchise = excluded.franchise, pillar = excluded.pillar, rrp = excluded.rrp,
  hero_image = excluded.hero_image, intro_bullets = excluded.intro_bullets, questions_per_quiz = excluded.questions_per_quiz, sort = excluded.sort;\n`;
}
sql += "\n-- v1 questions (legacy_id = js/questions.js id)\n";
for (const x of QUIZ) {
  const pid = SECTION_TO_PRODUCT[x.section];
  if (!pid) throw new Error("no product for section " + x.section);
  const options = x.type === "order" ? x.items : x.options;
  const ci = x.type === "order" ? "null" : x.correctIndex;
  sql += `insert into questions (legacy_id, product_id, type, prompt, options, correct_index, explain, image, source)
select ${x.id}, ${q(pid)}, ${q(x.type)}, ${q(x.prompt)}, ${j(options)}, ${ci}, ${q(x.explain || "")}, ${x.image ? q(x.image) : "null"}, 'v1'
where not exists (select 1 from questions where legacy_id = ${x.id});\n`;
}
sql += "\n-- Myagi questions (dedupe on prompt)\n";
for (const m of MYAGI) {
  sql += `insert into questions (product_id, type, prompt, options, correct_index, explain, source)
select ${q(m.p)}, 'mc', ${q(m.prompt)}, ${j(m.options)}, 0, ${q(m.explain)}, 'myagi'
where not exists (select 1 from questions where prompt = ${q(m.prompt)});\n`;
}
sql += "\n-- store_products: every store starts with every product enabled\n";
sql += `insert into store_products (store_name, product_id)
select s.name, p.id from (values ${STORES.map((s) => `(${q(s)})`).join(",")}) as s(name)
cross join products p on conflict do nothing;\n`;
sql += "commit;\n";
fs.writeFileSync("supabase/seed_v2.sql", sql);
console.log(`wrote seed_v2.sql: ${PRODUCTS.length} products, ${QUIZ.length} v1 + ${MYAGI.length} myagi questions, ${STORES.length} stores`);
