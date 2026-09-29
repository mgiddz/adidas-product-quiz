// js/prizes.js
//
// Prize tiers earned by quiz score (out of 20). Higher score = higher-value
// prize. Set by Mike 2026-09-29. `min` is an inclusive minimum score; the
// first matching tier wins, so keep this list sorted high -> low.
//
// Fulfillment happens outside the app — the results screen tells the
// associate what they earned, and the tier is saved with their submission
// (quiz_submissions.prize_tier) so the dashboard shows who's owed what.
//
// Badge labels (LEGEND / SPECIALIST / ROOKIE) still come from js/questions.js;
// prizes are a separate ladder on purpose so either can change alone.

const PRIZE_TIERS = [
  {
    min: 20,
    key: "shoes",
    label: "adidas Running Shoes",
    value: "$120–$150 value",
    short: "Shoes",
    icon: "👟",
    note: "Perfect score. A pair from the current lineup — your size is on file.",
  },
  {
    min: 18,
    key: "tshirt",
    label: "adidas T-Shirt",
    value: "$10–$15 value",
    short: "T-shirt",
    icon: "👕",
    note: "Legend Status. Your clothing size is on file.",
  },
  {
    min: 14,
    key: "socks",
    label: "adidas Running Socks",
    value: "$8–$12 value",
    short: "Socks",
    icon: "🧦",
    note: "Specialist. Your shoe size is on file.",
  },
  {
    min: 10,
    key: "keychain",
    label: "adidas Keychain / Lanyard",
    value: "$4–$8 value",
    short: "Keychain / Lanyard",
    icon: "🔑",
    note: "Rookie. Retake after a pass through the study guide to move up a tier.",
  },
  {
    min: 0,
    key: "none",
    label: "No prize yet",
    value: "",
    short: "—",
    icon: "📖",
    note: "Score 10+ to start earning. Hit the study guide, then retake.",
  },
];

function getPrize(score) {
  return PRIZE_TIERS.find((t) => score >= t.min);
}

// Human-readable score range for a tier, e.g. "18–19" or "20".
function prizeRange(tier) {
  const i = PRIZE_TIERS.indexOf(tier);
  const above = i > 0 ? PRIZE_TIERS[i - 1].min - 1 : 20;
  return tier.min === above ? `${tier.min}` : `${tier.min}–${above}`;
}
