// js/stores.js
//
// Master list of store locations, shared by the quiz intake form
// (index.html — "Store / Banner Name" dropdown) and the colleague signup
// form (login.html). Both need to agree exactly (case/spacing-insensitive,
// but not typo-tolerant) for a colleague's dashboard to show the right
// store's results — see MEMORY.md "Colleague results dashboard".
//
// From Mike's Columbus door list, 2026-08-18 — message appeared to cut off
// mid-row at "Road Runner**", so this may not be the complete list yet.
// Mike: edit this array whenever a store is added/renamed/removed. No
// other code changes needed — both dropdowns read straight from here.

const STORE_LOCATIONS = [
  "Columbus Running Co - Columbus",
  "Columbus Running Co - Powell",
  "Columbus Running Co - Westerville",
  "Columbus Running Co - Dublin",
  "Columbus Running Co - Pickerington",
  "Columbus Running Co - Grove City",
  "Fleet Feet Columbus - Lewis Center",
  "Fleet Feet Columbus - N. Hamilton",
  "Fleet Feet Columbus - West Lane Ave",
  "Second Sole - Gahanna",
  "Runner's Plus - Brown St.",
  "Runner's Plus - Fairborn",
  "Runner's Plus - South Dayton",
  "Athletic Annex - Carmel",
  "Athletic Annex - Fishers",
  "Athletic Annex - Indianapolis",
  "Fleet Feet - Carmel",
  "Fleet Feet - Indianapolis",
  "Fleet Feet - Fishers",
  "Fleet Feet - Greenwood",
  "Fleet Feet Sports - Bardstown Rd",
  "Fleet Feet Sports - Breckenridge Ln",
  "Tri-State Running Co - Edgewood",
  "RUNNING AWAY INC. - JOHN'S RUN WALK- Lexington",
];
