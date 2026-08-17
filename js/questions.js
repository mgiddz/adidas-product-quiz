// js/questions.js
//
// Quiz content — data only, no UI logic here.
// Source of truth: designs/Hyperboost Product Quiz.dc.html (the Claude
// Design prototype) — per Mike's 2026-08-16 decision, the prototype takes
// precedence over docs/adidas_quiz_webpage_build_spec.md for quiz content,
// format, and scoring. See MEMORY.md "Product facts" for the full
// reconciliation. If you need to change wording/answers, edit here —
// app.js reads this module and never hardcodes question content.
//
// 19 multiple-choice questions (type: "mc") + 1 drag/reorder ranking
// question (type: "order"), for 20 graded questions total.
//
// `image` / `imageCaption` — real product photos Mike shared directly (see
// MEMORY.md "Product images" decision log entries, 2026-08-16). Mike
// renamed the source files himself with the correct shoe/part per photo,
// then sent Boston 13 photos directly in chat (confirmed via "ADIZERO
// BOSTON 13" text on the shoe) to replace the last best-guess section —
// two of those Boston photos turn out to be the same shoe that had been
// mis-filed under Adios Pro 4 in an earlier pass. All five shoe sections
// are now Mike-confirmed.

const QUIZ_QUESTIONS = [
  {
    id: 1,
    type: "mc",
    section: "Hyperboost Edge",
    prompt: "What is the name of the foam that powers the Hyperboost Edge?",
    options: ["Lightstrike Pro", "Hyperboost Pro", "Dreamstrike+", "Ultraboost Pro"],
    correctIndex: 1,
    explain:
      "Hyperboost Pro is a pelletized foam derived from racing footwear, tuned for energy return, cushioning, and low weight.",
    image: "hyperboost-edge-hero.jpg",
    imageCaption: "Hyperboost Edge",
  },
  {
    id: 2,
    type: "mc",
    section: "Hyperboost Edge",
    prompt: "What is the Hyperboost Edge's woven upper technology called?",
    options: ["PRIMEWEAVE", "Flyknit", "Techfit", "Primeknit+"],
    correctIndex: 0,
    explain:
      "PRIMEWEAVE is a super-soft, lightweight woven upper that locks in the foot without weighing it down.",
    image: "hyperboost-edge-upper.jpg",
    imageCaption: "Hyperboost Edge — woven upper",
  },
  {
    id: 3,
    type: "mc",
    section: "Hyperboost Edge",
    prompt: "What outsole does the Hyperboost Edge use?",
    options: ["Continental Rubber", "LIGHTTRAXION", "Adiwear", "Stealth Grip"],
    correctIndex: 1,
    explain:
      "LIGHTTRAXION is a full-length lightweight outsole built for optimum traction across all surfaces.",
    image: "hyperboost-edge-outsole.jpg",
    imageCaption: "Hyperboost Edge — LIGHTTRAXION outsole, stamped right on the sole",
  },
  {
    id: 4,
    type: "mc",
    section: "Hyperboost Edge",
    prompt: "What is the Hyperboost Edge's stack height / drop?",
    options: [
      "46mm / 40mm, 6mm drop",
      "45mm / 39mm, 6mm drop",
      "39mm / 34mm, 5mm drop",
      "44mm / 38mm, 6mm drop",
    ],
    correctIndex: 1,
    explain:
      "The Edge sits at 45mm heel / 39mm forefoot with a 6mm drop — one of the tallest stacks in the lineup.",
    image: "hyperboost-edge-stack.jpg",
    imageCaption: "Hyperboost Edge — midsole stack, forefoot to heel",
  },
  {
    id: 5,
    type: "mc",
    section: "Hyperboost Edge",
    prompt:
      "A customer wants to know what the Hyperboost Edge feels like underfoot. Which description is most accurate?",
    options: [
      "Firm, urgent, and propulsive",
      "Soft landing with a springy, plush toe-off",
      "Barely-there and minimal",
      "Stiff and rigid through the midfoot",
    ],
    correctIndex: 1,
    explain:
      "Hyperboost Edge feels soft and plush on landing with a springy, bouncy toe-off — comfort-forward, not race-day firm.",
    image: "hyperboost-edge-interior.jpg",
    imageCaption: "Hyperboost Edge — plush interior",
  },
  {
    id: 6,
    type: "mc",
    section: "Adios Pro 4",
    prompt: "What is the Adios Pro 4's approximate weight and stack height?",
    options: [
      "8oz, 39mm/33mm stack",
      "10oz, 45mm/39mm stack",
      "6oz, 30mm/24mm stack",
      "9oz, 42mm/36mm stack",
    ],
    correctIndex: 0,
    explain:
      "The Pro 4 comes in at roughly 8oz with a 39mm/33mm stack (6mm drop) — lightweight and low enough for a fast, propulsive race feel.",
    image: "adios-pro-4-hero.jpg",
    imageCaption: "Adios Pro 4",
  },
  {
    id: 7,
    type: "mc",
    section: "Adios Pro 4",
    prompt: "What is the Adios Pro 4's franchise purpose?",
    options: ["Race to win", "Daily super trainer", "Hyper comfort", "Long runs"],
    correctIndex: 0,
    explain:
      "Adios Pro 4 is built purely to race — lightweight, propulsive, and best suited to 0–42km race day and speed work.",
    image: "adios-pro-4-action.jpg",
    imageCaption: "Adios Pro 4 — built to race",
  },
  {
    id: 8,
    type: "mc",
    section: "Adios Pro 4",
    prompt: "What is the retail price of the Adios Pro 4?",
    options: ["$200", "$225", "$250", "$275"],
    correctIndex: 2,
    explain: "The Adios Pro 4 retails at $250, our top-tier race-day shoe.",
    image: "adios-pro-4-outsole.jpg",
    imageCaption: "Adios Pro 4 — on foot",
  },
  {
    id: 9,
    type: "mc",
    section: "Adios Pro 4",
    prompt: "The EnergyRods 2.0 in the Adios Pro 4 are shaped to mimic:",
    options: [
      "The shape of the outsole lugs",
      "The shape of the foot, mimicking the metatarsal bones",
      "A single straight carbon bar",
      "The heel counter",
    ],
    correctIndex: 1,
    explain:
      "EnergyRods 2.0 are shaped like the foot itself, mimicking the metatarsal bones for a natural, propulsive toe-off.",
    image: "adios-pro-4-outsole.jpg",
    imageCaption: "Adios Pro 4 — outsole/midsole detail",
  },
  {
    id: 10,
    type: "mc",
    section: "Boston 13",
    prompt: "The Boston 13 is best positioned as:",
    options: [
      "A max-cushion recovery shoe",
      "A versatile tempo/daily-trainer with energy rods",
      "A stability shoe for overpronators",
      "Ultramarathon shoe",
    ],
    correctIndex: 1,
    explain:
      "Boston 13 is the go-to tempo trainer — a springy ride powered by EnergyRods (not a plate) built for daily training up through race pace.",
    image: "boston-13-hero.jpg",
    imageCaption: "Adizero Boston 13",
  },
  {
    id: 11,
    type: "mc",
    section: "Boston 13",
    prompt: "What is the Boston 13 best used for?",
    options: ["Race day only", "Tempo workouts and daily training", "Recovery walks only", "Trail running"],
    correctIndex: 1,
    explain:
      "Boston 13 is built for tempo workouts and daily training — a versatile, springy ride powered by EnergyRods.",
    image: "boston-13-outsole-detail.jpg",
    imageCaption: "Boston 13 — LIGHTSTRIKE PRO midsole and outsole",
  },
  {
    id: 12,
    type: "mc",
    section: "Boston 13",
    prompt:
      "When a customer wants ONE shoe for both easy runs and tempo workouts, which shoe fits best?",
    options: ["Adios Pro 4", "Boston 13", "Hyperboost Edge", "Supernova Rise 3"],
    correctIndex: 1,
    explain:
      "Boston 13's versatility across paces makes it the natural one-shoe answer for easy-to-tempo training.",
    image: "boston-13-sole.jpg",
    imageCaption: "Boston 13 — full outsole",
  },
  {
    id: 13,
    type: "mc",
    section: "Evo SL Woven",
    prompt: "What distinguishes the Evo SL Woven from the Adios Pro racing line?",
    options: [
      "It has a carbon plate",
      "It's plate-free with a smooth, natural ride",
      "It's the heaviest shoe in the lineup",
      "It's built only for walking",
    ],
    correctIndex: 1,
    explain:
      "Evo SL Woven is the lighter, more affordable, plate-free sibling of Adios Pro — a natural, forgiving ride at any pace.",
    image: "evo-sl-side.jpg",
    imageCaption: "Evo SL Woven",
  },
  {
    id: 14,
    type: "mc",
    section: "Evo SL Woven",
    prompt: "What upper construction gives the Evo SL Woven its name?",
    options: ["A PRIMEWEAVE upper", "A woven mesh upper", "A leather upper", "A neoprene bootie"],
    correctIndex: 1,
    explain:
      "Evo SL Woven uses a woven mesh upper — a lightweight, breathable construction that keeps the shoe soft and minimal.",
    image: "evo-sl-side.jpg",
    imageCaption: "Evo SL Woven",
  },
  {
    id: 15,
    type: "mc",
    section: "Evo SL Woven",
    prompt: "The Evo SL Woven is best recommended to a customer who wants:",
    options: [
      "Max stability for overpronation",
      "A lightweight, everyday trainer that's easy on the wallet",
      "A dedicated race-day super shoe",
      "A trail running shoe",
    ],
    correctIndex: 1,
    explain:
      "Evo SL Woven trades the plate and price of Adios Pro for a lighter, more accessible everyday ride.",
    image: "evo-sl-outsole.jpg",
    imageCaption: "Evo SL Woven — outsole",
  },
  {
    id: 16,
    type: "mc",
    section: "Supernova Rise 3",
    prompt: "What foam is the Supernova Rise 3 built around?",
    options: ["Lightstrike Pro", "Hyperboost Pro", "Dreamstrike+", "EnergyFoam"],
    correctIndex: 2,
    explain:
      "Dreamstrike+ is softer and more plush than Lightstrike Pro, tuned for all-day comfort over performance.",
    image: "supernova-rise-foot.jpg",
    imageCaption: "Supernova Rise 3",
  },
  {
    id: 17,
    type: "mc",
    section: "Supernova Rise 3",
    prompt: "Which shoe ranks as the MOST stable/planted in the current lineup?",
    options: ["Adios Pro 4", "Hyperboost Edge", "Supernova Rise 3", "Evo SL Woven"],
    correctIndex: 2,
    explain:
      "Supernova Rise 3 is the most stable, most ‘grounded’ feel — secure fit, full-length outsole rubber.",
    image: "supernova-rise-pair.jpg",
    imageCaption: "Supernova Rise 3",
  },
  {
    id: 18,
    type: "mc",
    section: "Supernova Rise 3",
    prompt:
      "A nurse who's on her feet all shift asks for the least tiring, most supportive shoe. You lead with:",
    options: ["Adios Pro 4", "Hyperboost Edge", "Supernova Rise 3", "Boston 13"],
    correctIndex: 2,
    explain:
      "Supernova Rise 3 is the default recommendation for on-feet professionals — calm, stable, and the most budget-friendly option.",
    image: "supernova-rise-running.jpg",
    imageCaption: "Supernova Rise 3 — on the run",
  },
  {
    id: 19,
    type: "mc",
    section: "Full Lineup",
    prompt: "Ranking by retail price, which shoe is the MOST expensive?",
    options: ["Boston 13", "Hyperboost Edge", "Adios Pro 4", "Evo SL Woven"],
    correctIndex: 2,
    explain:
      "Adios Pro 4 ($250) sits above Hyperboost Edge ($200), with Boston 13 and Evo SL Woven priced below both.",
  },
  {
    id: 20,
    type: "order",
    section: "Full Lineup",
    prompt: "Put these shoes in order by weight — LIGHTEST to HEAVIEST.",
    // `items` is already in the CORRECT order (lightest to heaviest).
    // `startOrder` is how they're shuffled on screen at first — it's an
    // array of indices into `items`.
    items: ["Adios Pro 4", "Evo SL Woven", "Boston 13", "Hyperboost Edge", "Supernova Rise 3"],
    startOrder: [2, 4, 0, 3, 1],
    explain:
      "Lightest to heaviest: Adios Pro 4 (race-day minimal) → Evo SL Woven → Boston 13 → Hyperboost Edge → Supernova Rise 3 (our most cushioned, comfort-first build).",
  },
];

// Additive closing step (from the build spec) — never graded, not part of
// the prototype's 20 questions. Kept because it doesn't conflict with
// anything in the prototype; see MEMORY.md open questions if this should
// be dropped.
const OPEN_ENDED_QUESTION = {
  id: 21,
  prompt:
    "In your own words: what do you love about the adidas brand, and why do you feel confident recommending it to customers who walk into the store?",
};

// Badge thresholds — from the prototype's BADGES table. `min` is an
// inclusive minimum score out of QUIZ_QUESTIONS.length (20).
const BADGES = [
  {
    min: 18,
    label: "LEGEND STATUS",
    bg: "oklch(0.55 0.22 25)",
    color: "#fff",
    message:
      "Elite-level product knowledge. You're ready to lead floor training for the rest of the team.",
  },
  {
    min: 14,
    label: "SPECIALIST",
    bg: "oklch(0.85 0.17 85)",
    color: "#0d0d0d",
    message:
      "Strong grasp of the lineup, especially the Hyperboost story. A quick pass over your missed questions and you're set.",
  },
  {
    min: 10,
    label: "ROOKIE",
    bg: "oklch(0.8 0.03 90)",
    color: "#0d0d0d",
    message: "Solid start. Revisit the study guide's Hyperboost Edge section before your next shift.",
  },
  {
    min: 0,
    label: "KEEP STUDYING",
    bg: "oklch(0.75 0 0)",
    color: "#0d0d0d",
    message: "Give the cheat sheet another read — focus on the featured Hyperboost Edge.",
  },
];

function getBadge(score) {
  return BADGES.find((b) => score >= b.min);
}
