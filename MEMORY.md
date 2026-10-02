# MEMORY.md — Durable Project Memory

What we've decided and know. This changes rarely — new entries get
**appended**, old entries get corrected in place if they turn out wrong
(don't just delete history, note the correction). For "where are we right
now," see [`CONTEXT.md`](./CONTEXT.md) instead — that's the fast-changing
file. Toolchain and stack context lives in [`CLAUDE.md`](./CLAUDE.md).

## Product overview

> **v2 (2026-09-30) supersedes most of this section.** The app is now a
> sign-in platform: magic-link employee accounts, one timed module per
> shoe (video or photo intro → 20 s/question quiz), a PE-proctored
> certification test by 6-character code, per-store product toggles, and
> an employee record (scores, modules, sizes). `index.html` is the sign-in
> + module grid; the v1 intake-form quiz lives on as `legacy-quiz.html`.
> Full design: `docs/v2-build-spec.md` (also in the Claude project) and
> `supabase/v2_schema.sql`. The v1 notes below remain accurate for the
> legacy page, the study guide / cheat sheet, and the survey.

- **What (revised 2026-08-19):** a training **platform** for Adidas retail
  store associates (the "Retail Specialist Program"), reached via a QR code
  on their phones. **The landing page IS the quiz** (`index.html`) — no
  separate hub screen. Associates scan the QR code, land directly on the
  intake form, and go straight into the 20-question quiz. Study guide,
  cheat sheet, and survey are offered **after** they finish, on the results
  screen, not before:
  1. **The quiz itself** — intake form → 20 graded questions → results
     (`index.html`)
  2. **Study Guide** — reference material, offered post-quiz
     (`study-guide.html`)
  3. **Cheat Sheet** — a condensed one-pager, offered post-quiz
     (`cheat-sheet.html`)
  4. **Experience Survey** — post-training feedback that Mike is evaluated
     on, offered post-quiz. Links straight out to his real Typeform
     (`https://survey.typeform.com/to/e9urwqa7`) — **not** an in-app page.
     See "Study guide, cheat sheet, and survey" below for why.
  (2026-08-17 originally put all four behind a hub landing page; Mike
  changed this 2026-08-19 — see decision log.)
- **Who:** internal audience — store associates, not shoppers. The survey's
  audience is really Mike (as the person being evaluated), even though
  associates are who fills it out.
- **Scope (locked 2026-08-14):** Running line only, for now. Not building a
  multi-category platform *of product lines* yet (i.e. no Basketball/Apparel
  quiz), but keep quiz content data-driven so more categories can be added
  later without a rewrite. (Not to be confused with the 2026-08-17 platform
  expansion above, which is about adding study/cheat/survey pages around the
  same Running quiz, not adding new product-line quizzes.)

## Architecture

- **Reporting/backend (locked 2026-08-14):** scores need to be tracked
  beyond the in-app results screen — this is a backend-and-reporting app,
  not a client-only toy.
- **Hosting (locked 2026-08-14):** static hosting (Netlify or Vercel) for
  the frontend.
- **Stack (locked 2026-08-15):** plain HTML/CSS/JS frontend (no build step)
  + Supabase for backend/reporting. Chosen to satisfy "super simple" while
  still supporting persisted scores on static hosting. See `CLAUDE.md` →
  Tech Stack for the reasoning.
- **Site structure (revised 2026-08-19):** plain multi-page site, no
  router/framework — `index.html` **is** the quiz (intake → quiz →
  results), with `study-guide.html` and `cheat-sheet.html` as separate
  pages linked from the results screen, plus an external link out to the
  Typeform survey. No standalone hub page and no `quiz.html` anymore (its
  content moved into `index.html`). All pages share `css/styles.css`.
- **Access (locked 2026-08-17):** entry point is a QR code on employees'
  phones, pointing at `index.html`'s public URL once deployed — which now
  drops them straight onto the quiz intake form, not a menu. No login for
  any page.

## Toolchain

- **Design → Cowork → Code**, all three operating on this same repo folder.
  Claude Design prototypes land as `.dc.html` files in `designs/` — visual
  and interaction spec only, not shipped code. Full description in
  `CLAUDE.md`.

## Product facts

⚠️ **Source note (revised 2026-08-16):** two source documents exist —
`designs/Hyperboost Product Quiz.dc.html` (a Claude Design prototype, added
first) and `docs/adidas_quiz_webpage_build_spec.md` (a build spec pulled
from an earlier planning chat, added second). **Mike has set precedence:
the Design prototype wins wherever the two conflict.** That reverses the
2026-08-15 decision below (kept in the log for history, but superseded).

In practice: quiz **content, format, feedback timing, scoring, and product
lineup** now follow the prototype exactly. The spec still supplies the
**intake form and backend/hosting requirements**, since the prototype is
simply silent on those (no intake screen, no backend at all — it just
links to a results page that was never built) — that's not a conflict, so
there's nothing to override there. One addition from the spec — the
ungraded closing reflection question — is also kept for the same reason
(doesn't contradict the prototype's 20 questions, just appends one more
ungraded step after them); flag to Mike if that's not wanted.

### Quiz format (per prototype — authoritative)

- Single-page mobile-first web app: intake form (from spec) → **20 graded
  questions**, one at a time with a progress bar ("Question X of 20") → 1
  ungraded open-ended reflection question (from spec, appended) → instant
  results screen.
- **Feedback is immediate per question** (prototype behavior, overriding
  the spec's "hold until the end" instruction): selecting an answer locks
  it in, highlights correct (green) vs. incorrect (red) right away, shows
  an explanation, then reveals the "Next Question" button.
- 19 questions are 4-option multiple choice; the 20th is a **drag/reorder
  ranking question** ("order these 5 shoes lightest → heaviest") answered
  via up/down move buttons, checked with a "Check Order" button, colored
  per-item on check.
- Question bank (display order, as of 2026-09-10): Hyperboost Edge (Q1–5),
  Adios Pro 5 (Q6–9, was Adios Pro 4 until 2026-09-10), Boston 13
  (Q10–11), Evo SL Woven (Q12–14), Supernova Rise 3 (Q15–17), Footwear
  Pillars (Q18: Adizero = Light & Fast → Hyperboost = Comfort Energized →
  Supernova = Supportive Comfort), plus 2 "Full Lineup" questions (Q19
  price ranking MC, Q20 weight ranking order question).
- Question `id`s are stored in Supabase answers, so they stay stable and
  are never reused. Display numbers come from array position. Retired:
  id 11. The pillars question is id 22.
- Full question text, options, and explanations transcribed into
  `js/questions.js`.

### Intake form fields (from spec §2 — prototype doesn't cover this, kept as-is)

1. Employee Name (text)
2. Store Location (single dropdown from `js/stores.js` — see the
   2026-09-03 decision-log entry; replaced the spec's two text fields)
3. Shoe Size (text/number) + Men's/Women's toggle
4. Clothing Size (dropdown: XS/S/M/L/XL/XXL) + Men's/Women's toggle
5. Email Address (validated)
6. Favorite Snack (free text — was a Smoothie/Coffee/Candy/Other dropdown
   until 2026-09-03)

### Scoring & badges (per prototype — authoritative, replaces the 13-point tiers)

- Score = count of correct answers out of **20** (the closing open-ended
  question is never scored).
- Badge thresholds (from the prototype's `BADGES` table):
  - **18+** → LEGEND STATUS
  - **14+** → SPECIALIST
  - **10+** → ROOKIE
  - **0+** → KEEP STUDYING
- ✅ **Resolved 2026-08-16:** the prototype's intro copy previously said
  "Score 18+ to earn Specialist status," which didn't match the badge table
  (Specialist is actually 14+, Legend is 18+). Since the badge table is the
  functional scoring logic — more authoritative than the flavor text — the
  app's intro copy now reads "Score 14+ for Specialist status, 18+ for
  Legend Status" to match the table.
- Results screen still shows, immediately and client-side (no email
  dependency): total score + badge, and a full itemized breakdown of all 20
  questions (question text, employee's answer, correct answer, ✅/❌) — this
  recap view is from the spec (the prototype's own results screen was never
  built) and isn't contradicted by anything in the prototype, so it stays.

### Study guide, cheat sheet, and survey (new 2026-08-17, placement revised 2026-08-19)

- **Placement (revised 2026-08-19):** these three are offered on the
  **results screen**, after an associate finishes the quiz — not on the
  landing page. Landing page is the quiz intake, full stop; nothing
  competes with "take the quiz" for a first-time visitor's attention.
- **Study guide (`study-guide.html`) and cheat sheet (`cheat-sheet.html`):**
  content is **Mike's own existing material**, not drafted by Claude — he
  has docs already written and will share them. Pages are scaffolded as
  clean placeholders ready to receive that content; don't invent product
  copy here even though `MEMORY.md`'s "Running line" section below has
  enough facts to draft from — Mike explicitly chose to supply his own
  docs instead.
- **Experience survey — resolved 2026-08-18:** Mike shared the real survey:
  `https://survey.typeform.com/to/e9urwqa7` ("Associate Educational Session
  Attendee Survey"), a Typeform. This is the actual instrument his training
  performance is evaluated on. **The results screen links straight to it**
  (opens in a new tab) rather than reimplementing it in-app — an earlier
  draft (`survey.html` + `js/survey.js` + an `experience_survey_responses`
  Supabase table) was built before the real Typeform was known, then
  **removed**: a custom clone would have collected responses in Mike's own
  Supabase project, not in Typeform, so it wouldn't have counted toward his
  actual evaluation. Confirmed directly with Mike rather than assumed,
  since the stakes (his own grading) made it worth checking instead of
  guessing.
  - The real questions, for reference (read live via browser automation,
    not submitted): (1) overall session quality, 1–5 "Very Poor" to
    "Excellent"; (2) did it improve product knowledge, Yes/No; (3)
    post-session confidence, 1–10 "Not Confident" to "Very Confident"; (4)
    did it improve brand perception, Yes/No/Not Sure; (5) likelihood to
    recommend adidas products, 0–10 "Not likely at all" to "Extremely
    likely"; (6) open text — what to include in future sessions (optional).

### Backend / data capture (from spec §5 — prototype has none, kept as-is)

- **Storage: Supabase** (hosted Postgres, client inserts via REST using the
  public anon key + RLS policy restricting anon to insert-only). Chosen
  over a Google Sheets/Apps Script approach for reliability at a live
  training event; still exports to CSV in one click from the Supabase table
  editor.
- Every submission stores: employee name, store name, store location, shoe
  size + gender, clothing size + gender, email, favorite snack (+ other
  text), all 20 answers, the score, the open-ended response, and a
  timestamp. Since 2026-09-03 the one store dropdown fills **both**
  `store_name` and `store_location` with the same value, and
  `favorite_snack_other` is always null on new rows — the columns are kept
  (still `not null`) so existing rows and the dashboard keep working.
- Admin (Mike) reviews via the Supabase dashboard table editor for v1. A
  password-protected in-app admin view is a nice-to-have, not required for
  v1.

### Hosting / access (from spec §7 — prototype doesn't address this)

- Must be a stable **public URL, no login wall** (a prior Claude
  Design/Artifact link failed for this exact reason). Static hosting
  (Netlify/Vercel) satisfies this — reconfirms the earlier hosting
  decision.
- No email-sending functionality — grading/results are entirely in-browser.
- No employee login/account — anonymous except for the intake form fields.

### Visual language (per prototype — authoritative)

- Dark theme: `#0d0d0d` background, off-white text `#f5f5f0`.
- Adidas red accent: `oklch(0.55 0.22 25)`.
- Display type: `Archivo Black`. Body/UI type: `Barlow` (400/600/700/800).
- **Brand rule (Mike, 2026-09-10):** anything produced for adidas must use
  the correct fonts, logos, and graphics from adidas's "PRODUCT EDUCATION
  FW26" deck (the 104-page July 2026 Product Education Session PDF). Mike
  was told this explicitly. Product imagery should come from the deck or
  official tech sheets. Note: the deck's typefaces are rasterized (the only
  embedded fonts are Calibri/Arial), and adidas's own typefaces are
  proprietary, so the Archivo Black / Barlow pair above is NOT the deck's
  type. A brand pass on the site's type/logo is an open item.
- **Brand pass done 2026-09-29** — theme flipped from dark to the deck's
  light system: cyan-to-white gradient background (`#b9edfb` → `#e9f8fd`,
  sampled from the Footwear Pillars slide), black type, dotted section
  rules, red header band (`#ad1c1f`, sampled from the Hyperboost Edge
  poster's title bar). The adidas performance logo was **extracted as
  vector from the poster PDF** (`images/adidas-logo-black.png` /
  `-white.png`) — not redrawn. Type: the poster embeds `adidasFG
  Compressed` (proprietary, subset only) — **"Oswald"** (Google Fonts) is
  the closest free match and is now the display face; body is plain
  **Arial**, which is what the deck actually embeds. Archivo Black / Barlow
  are gone. Everything routes through `:root` tokens in `css/styles.css`;
  `css/admin.css` uses the same tokens. The `.stripes` motif is gone —
  replaced by the real logo.
- Header: red band, white logo + "adidas Running" / "Retail Specialist
  Program" eyebrow; content pages add a "← Back to Quiz" link on the right.
- Progress indicator: "Question X of 20".
- Badge pill colors on results screen (from prototype's `BADGES` table):
  LEGEND STATUS = red accent bg/white text; SPECIALIST = gold
  `oklch(0.85 0.17 85)` bg/dark text; ROOKIE = light gray
  `oklch(0.8 0.03 90)` bg/dark text; KEEP STUDYING = mid gray
  `oklch(0.75 0 0)` bg/dark text.

### Running line — all 5 products (all now quizzed, per prototype)

1. **Hyperboost Edge** — this season's featured/spotlight product.
   Hyperboost Pro foam, PRIMEWEAVE woven upper, LIGHTTRAXION outsole,
   45mm/39mm stack (6mm drop). Feel: soft landing, springy/plush toe-off —
   comfort-forward, not race-day firm.
2. **Adios Pro 5** (replaced Adios Pro 4 on 2026-09-10) — marathon
   racing shoe. Purpose "Race to win," benefit "Lightweight & fast," use
   case 0–42km, neutral, road. RRP **$275** (Pro 4 was $250). Weight
   177g / 6.3oz men's, 150g / 5.3oz women's. Stack 39mm / 34mm, 5mm drop.
   Upper: Adizero microfit, Engineered LIGHTLOCK 2.0 (one-way stretch
   woven, internal locking bands, anti-slip heel foam pods), with better
   breathability than the Pro 4's LIGHTLOCK. Midsole: 39mm LIGHTSTRIKE
   PRO + all-new carbon-fiber-infused **ENERGYRIM(S)** (replaces Pro 4's
   EnergyRods 2.0) for higher energy return and more stability. Outsole:
   LIGHTTRAXION with zoned grip + Continental rubber at the forefoot. New
   Adizero stripe design + signature heel. Source: official Adios Pro 5
   tech sheet + FW26 Product Education deck pp. 9–14. **PR embargo /
   launch: 2026-09-22** (deck p. 1).
3. **Boston 13** — tempo/daily-trainer. Springy ride via EnergyRods (not a
   plate). Best for tempo workouts + daily training; the "one shoe for easy
   runs and tempo" answer.
4. **Evo SL Woven** — plate-free, but built on Lightstrike foam (same foam
   family as our racing shoes), for a snappy, race-inspired feel. Woven
   mesh upper. Retail $150. Best for intervals/track work/tempo — **not**
   the budget/comfort pick (see correction below).
5. **Supernova Rise 3** — most stable/planted shoe in the lineup. Built
   around Dreamstrike+ foam (softer/plusher than Lightstrike Pro). Retail
   $140 — the actual budget-friendly, plush daily trainer. Default
   recommendation for on-feet-all-shift customers.

Ranked lightest → heaviest, with approximate weights (added 2026-08-18,
cross-referenced against third-party review sites since adidas.com doesn't
publish spec weights — see decision log for sourcing detail):
Adios Pro 5 (~6.3oz) → Evo SL Woven (~8oz) → Boston 13 (~8.5oz) →
Hyperboost Edge (~9oz) → Supernova Rise 3 (~9.5oz).

Ranked by retail price, most expensive first: Adios Pro 5 ($275) >
Hyperboost Edge ($200) > Evo SL Woven ($150) > Supernova Rise 3 ($140) >
Boston 13 (exact price not yet confirmed by Mike).

**Correction (2026-08-18):** Q15 originally described Evo SL Woven as "a
lightweight, everyday trainer that's easy on the wallet" — Mike flagged
that this description actually belongs to Supernova Rise 3, not Evo SL
Woven. Corrected positioning: Supernova Rise 3 = the $140 plush daily
trainer; Evo SL Woven = the $150 snappy/track/interval shoe sharing
Lightstrike foam with the racing line. Q14 and Q15 both updated to reflect
this. See decision log.

### Product images (added 2026-08-16, corrected 2026-08-16 same day)

Mike shared real product photos directly (`Adidas-product-photos/` on his
machine). First pass: each photo was identified by reading embossed/printed
text visible on the shoe itself (outsole stamps, tongue labels) and
cross-checked against adidas.com/review-site listings. That pass got
Hyperboost Edge, most of Adios Pro, and Evo SL right, but mis-assigned one
shoe — a Supernova Rise 3 action shot (orange/coral colorway, cobblestone
path) got filed under Adios Pro because a *different*, similarly-colored
photo nearby had "LIGHTSTRIKE PRO" embossed text on it.

Mike then renamed all the source files himself with the correct shoe/part
per photo (e.g. `adios-pro-4-outsole-energyrods2.0.jpg`,
`supernova-rise-3-running.jpg`) — those filenames are now the source of
truth and superseded the text-reading pass wherever the two disagreed.
Selected, resized (max 1400px, ~75-290KB each) copies live in `images/` and
are referenced per-question via the `image`/`imageCaption` fields in
`js/questions.js`. The app renders them at the top of the question card
(`#question-image-wrap` in `index.html`, wired up in `js/app.js`).

**2026-08-17 update:** Mike then sent 4 Boston 13 photos directly in chat,
one showing "ADIZERO BOSTON 13" printed right on the shoe — closing the
last gap. Two of those four turned out to be the exact same files as
`adios-pro-4-outsole-energyrods2.0.jpg` and two other teal-colorway photos
that had been dropped/misfiled in the Adios Pro section — i.e. that
"LIGHTSTRIKE PRO"-branded white/teal shoe was Boston 13 all along, not
Adios Pro. Fixed: Q9 (Adios Pro 4 EnergyRods 2.0) now reuses
`adios-pro-4-outsole.jpg` instead; Boston 13 (Q10-12) now uses
`boston-13-hero.jpg` (the confirmed on-feet shot), `boston-13-outsole-detail.jpg`,
and `boston-13-sole.jpg`. A spare, `boston-13-upper.jpg`, is unused in the
quiz but kept in `images/` — good candidate for the study guide once Mike
sends that content.

Current confidence per section:
- **All five sections — Hyperboost Edge, Adios Pro 4, Boston 13, Evo SL
  Woven, Supernova Rise 3 — are now Mike-confirmed.** No more best-guess
  matches.
- A handful of unlabeled stock-photo-style downloads (generic filenames
  like `images (2).jpeg`, `hyperboost.jpeg`) and the Hyperboost Edge poster
  PDF were **not used** — couldn't verify what they actually are, and
  better-confirmed alternatives existed for every section that needed one.

### Prototype reference notes

The prototype's own screen flow was intro → quiz → results, linking to
`Hyperboost Quiz Results.dc.html` — a results screen that was never
actually designed/built. So the itemized-breakdown results screen (see
Scoring & badges above) is necessarily from the spec; nothing in the
prototype to conflict with there.

## Naming

- Working project name: **Product Education Quiz** (repo folder name).
- Prototype file naming pattern from Claude Design: `<Product Line> Product
  Quiz.dc.html` for the quiz screen, `<Product Line> Quiz Results.dc.html`
  for the results screen (referenced but not yet created).

## Decision log

| Date | Decision | Why |
|------|----------|-----|
| 2026-08-14 | Repo initialized as shared memory workspace for Design → Cowork → Code | Mike works across all three tools on the same folder and wants persistent shared context |
| 2026-08-14 | Scope locked to Running line only for v1 | Simpler first release; multi-category platform explicitly deferred |
| 2026-08-14 | Scores will be tracked via backend + reporting, not client-only | Mike confirmed reporting is needed beyond the in-quiz results screen |
| 2026-08-14 | Hosting will be static (Netlify/Vercel) | Mike's preference; app should stay "just files" to deploy |
| 2026-08-14 | Proposed stack: plain HTML/CSS/JS + Supabase | Satisfies "super simple" + backend/reporting + static hosting simultaneously; needs confirmation in first Code session |
| 2026-08-15 | Adopted `docs/adidas_quiz_webpage_build_spec.md` as the authoritative build spec, superseding quiz-content/scoring assumptions inferred from the Design prototype | Mike added the spec (pulled from an earlier planning chat) and said to build against it; prototype kept only for visual/UX reference |
| 2026-08-15 | Locked stack: plain HTML/CSS/JS + Supabase (confirmed, not just proposed) | Mike chose Supabase over Google Sheets when asked directly, for reliability at a live training event while still exporting to CSV |
| 2026-08-15 | Quiz scope: 13 graded MC + 1 ungraded open-ended question, covering Hyperboost Edge / Adios Pro 4 / Evo SL Woven / Supernova Rise 3 (not Boston 13) | Per build spec §3; replaces earlier 20-question/badge assumption from the prototype — **superseded 2026-08-16, see below** |
| 2026-08-16 | **Reversed precedence: the Design prototype now wins over the build spec wherever they conflict.** Quiz reverts to the prototype's 20 questions (all 5 shoes incl. Boston 13), immediate per-question feedback with explanations, and badge scoring (18/14/10/0) instead of the 13-point tiers | Mike's explicit instruction. Intake form + Supabase backend are kept from the spec since the prototype doesn't cover them at all (no conflict to resolve) — confirmed with Mike directly rather than assumed |
| 2026-08-16 | Fixed the prototype's own intro-copy inconsistency (18+ vs 14+ for Specialist) by aligning the copy to the badge table | The badge table is the functional scoring logic; the mismatched flavor text was treated as the error, not the table |
| 2026-08-17 | Expanded scope from a single quiz page to a 4-destination platform (hub + quiz + study guide + cheat sheet + survey), accessed via one QR code | Mike wants employees to have study/reference material and a feedback survey alongside the quiz, all reachable from one phone-scanned entry point |
| 2026-08-17 | Study guide and cheat sheet content will be Mike's own existing docs, not Claude-drafted | Mike has existing material to share, chose that over having Claude draft from the product facts already in this repo |
| 2026-08-17 | Experience survey built with a draft question set pending Mike's real questions | Mike confirmed the survey concept but had no specific required questions on hand; flagged since this feeds his own evaluation |
| 2026-08-17 | Deployment path: GitHub + Vercel/Netlify (Mike's own account), not an anonymous/temporary host | Mike chose the "walk me through it" option over a throwaway temporary link, since this needs to be a durable URL for a real QR code |
| 2026-08-18 | Removed the custom `survey.html`/`js/survey.js`/`experience_survey_responses` table; hub's Experience Survey card now links directly to Mike's real Typeform instead | The Typeform is the actual instrument Mike is evaluated on — a custom clone would silently misdirect responses away from where they're officially counted |
| 2026-08-19 | Removed the standalone hub landing page. `index.html` is now the quiz intake directly; study guide, cheat sheet, and survey links moved to the results screen (shown after finishing, not before) | Mike wants the landing page to be just the quiz, prompting for employee info, with the other destinations offered as a post-quiz choice instead of competing with "take the quiz" up front |
| 2026-08-19 | `quiz.html` retired — its content merged into `index.html` | No longer a separate page to link since index.html IS the quiz now; avoids duplicate markup to maintain |
| 2026-08-16 | Real product photos wired into all 20 questions (`js/questions.js` `image`/`imageCaption` fields, rendered via `index.html`/`js/app.js`/`css/styles.css`). Shoe/photo matches confirmed where possible by reading embossed text on the shoe itself and cross-checking adidas.com | Mike shared his own photo folder and asked for images matched accurately per question, not guessed from color/shape alone. Two sections (Boston 13, Supernova Rise 3) only got best-guess matches — no confirming text was visible in Mike's photos for those two; flagged in "Product images" above and to Mike directly. Adios Pro section uses Adizero Adios Pro EVO 3 photography (a different, related real shoe) since no EVO-3-free Adios Pro 4 photo existed in the folder |
| 2026-08-16 | Re-mapped photos to questions using Mike's own file renames as source of truth, replacing the text-reading-based guesses from the same day. Fixed a real mistake: a Supernova Rise 3 action shot had been filed under Adios Pro. Evo SL section swapped to a plain "Evo SL" photo (was using an "EXO" variant). Adios Pro 4 now has 4 Mike-confirmed photos (was using Adios Pro EVO 3 photography). Boston 13 remains best-guess — no Boston photos in Mike's renamed batch | Mike renamed the photo files himself to correct the matches; renamed filenames are more reliable than inferring product identity from embossed text alone, since two different shoes shared very similar "LIGHTSTRIKE PRO"-branded white/black colorways |
| 2026-08-17 | Mike sent 4 Boston 13 photos directly in chat (one shows "ADIZERO BOSTON 13" printed on the shoe), closing the last best-guess gap. Two of the four turned out to be duplicates of photos already used in the Adios Pro 4 section — including the EnergyRods 2.0 question's image, which even Mike's own earlier rename had mislabeled. Moved those two to Boston 13 (Q10–Q12) and reassigned Q9 to reuse the Adios Pro 4 outsole photo instead | Caught via matching file byte-sizes across the two photo sets, not by re-reading text; all 5 shoe sections are now fully Mike-confirmed |
| 2026-08-17 | Deployed live: pushed to `github.com/mgiddz/adidas-product-quiz`, connected to Vercel, live at `adidas-product-quiz-4v5e.vercel.app`. QR code generated pointing at the live URL | Mike ran git identity/commit/push himself from his own Terminal (required — device-bridge git identity isn't visible to his real Mac environment); Claude staged files, guided each step, verified the live page via WebFetch (no login wall), and generated the QR code |
| 2026-08-17 | Supabase connected: Mike created the project + ran `supabase/schema.sql` himself; Claude used the Supabase MCP connector (became available mid-session) to pull the project URL and anon key directly rather than Mike copy-pasting them, and filled in `js/config.js` | Faster and less error-prone than manual copy-paste; the anon key is meant to be public/client-embedded so no safety concern in Claude handling it directly |
| 2026-08-17 | Verified the Supabase wiring as thoroughly as possible without a live network test: confirmed `quiz_submissions` columns/types match `js/app.js`'s insert payload exactly, confirmed the RLS policy (`to anon, for insert, with_check true`) exists with no conflicting policies, confirmed `anon` role has table INSERT + schema USAGE grants, confirmed the anon key's JWT payload decodes to the matching project ref and `role: anon`. Did NOT get a true end-to-end live insert test — this cloud sandbox's outbound network is restricted to an allowlist that excludes `supabase.co` and `cdn.jsdelivr.net`, so a headless-browser run of the real page can't reach either the Supabase JS CDN or the API. Attempted to simulate an anon insert via `SET ROLE anon` through the Supabase SQL tool, but that consistently failed RLS even on a brand-new throwaway table with the identical textbook policy — concluded this is an artifact of how that tool's SQL session handles `SET ROLE` (likely connection pooling resetting role between statements), not a real config problem, since grants/policy/schema all independently check out | Flagging this gap explicitly rather than claiming a full test passed — first real submission after going live is the actual proof; if it doesn't save, check Supabase Table Editor -> quiz_submissions and the browser console on the live site first |
| 2026-08-17 | Boston 13 closed out with 4 Mike-confirmed photos sent directly in chat (one showing "ADIZERO BOSTON 13" printed on the shoe). Discovered 2 of those 4 were the same files as photos previously sitting in the Adios Pro 4 section (including the one used for the EnergyRods 2.0 question) — moved to Boston 13, Adios Pro 4's Q9 image swapped to `adios-pro-4-outsole.jpg` instead. All 5 shoe sections are now Mike-confirmed; no more best-guess photo matches anywhere in the quiz | Mike sent the photos directly rather than just renaming files this time, and one had the model name printed right on it — the strongest possible confirmation, stronger than filename or embossed-tech-name inference alone |
| 2026-08-18 | Reframed Q7's Adios Pro 4 photo to crop tight on both runners' shoes instead of the full-body action shot; trimmed its caption to just "Adios Pro 4" | Mike's request — the wide shot didn't showcase the shoe itself |
| 2026-08-18 | Removed the photo from Q12, Q17, and Q18 — all three ask "which shoe in the lineup" with the correct shoe's own photo shown right next to the question, giving the answer away | Mike caught this on Q12 and asked for the general principle: "which shoe" identification questions shouldn't show a picture of the correct shoe. Applied to all matching questions, not just the one flagged |
| 2026-08-18 | Rewrote Q14 — old version asked "what upper construction gives the Evo SL Woven its name," which is self-answering since the shoe's own name contains "Woven." New version: "How would you describe the Evo SL Woven's ride compared to the Hyperboost Edge?" (snappier/lighter/more flexible vs. Hyperboost's plush do-it-all cushioning) | Same giveaway problem as the photo issue above, but caused by wording instead of an image — Mike wanted the Hyperboost/Evo SL contrast sharpened: Hyperboost as the do-it-all super trainer, Evo SL as the speedy/snappy/plate-free option |
| 2026-08-18 | Rewrote Q15 and corrected the Evo SL Woven / Supernova Rise 3 positioning — Q15 previously called Evo SL Woven "a lightweight, everyday trainer that's easy on the wallet," which Mike identified as actually describing Supernova Rise 3, not Evo SL Woven. New facts from Mike: Supernova Rise 3 is the $140 plush daily trainer; Evo SL Woven is $150, built on Lightstrike foam (same foam family as the racing shoes), positioned as a snappy shoe for intervals/track work | Mike caught a real positioning error, not just a wording issue — the two shoes' identities were swapped in the original quiz content. New pricing facts ($140 / $150) and the Lightstrike foam detail are new information from Mike, not previously in the repo |
| 2026-08-18 | Cross-referenced real-world weights for all 5 shoes against third-party review sites (RunRepeat, Doctors of Running — adidas.com doesn't publish spec weights) and updated the quiz to use them: Adios Pro 4 ~7oz (was ~8oz in Q6 — corrected for consistency with Q20), Evo SL Woven ~8oz, Boston 13 ~8.5oz, Hyperboost Edge ~9oz (Mike's explicit call), Supernova Rise 3 ~9.5oz. Q20's explain text now states all 5 weights alongside the ranking | Boston 13 specifically had inconsistent source data (7.7oz per one reviewer's unclear-size measurement vs. 9.0oz per another's men's-size-9 measurement) — split the difference at 8.5oz to preserve Q20's established lightest-to-heaviest order rather than picking one source arbitrarily. Q6 previously stated Adios Pro 4 at 8oz, which conflicted with the ~7oz research figure — updated Q6 to match rather than leaving two different weights for the same shoe in the same quiz |
| 2026-08-18 | Confirmed Supabase submissions work end to end — Mike took the live quiz himself and it saved a real row (20/20, `store_name: "Archrival"`) | Closes the "not fully tested" gap flagged in the 2026-08-17 Supabase entry — this was the actual live-network test that couldn't be done from Claude's sandbox |
| 2026-08-18 | Built a colleague results dashboard (`login.html` + `dashboard.html`) so Mike's colleagues can log in and see their own store's quiz results, grouped like spreadsheet tabs. Design, chosen via AskUserQuestion: (1) individual Supabase Auth accounts per colleague, self-signup rather than Mike inviting each one — a fully client-side signup (email/password + store dropdown) was the only option that didn't need a server-side component (Admin API/service_role key can't live in a static site); (2) each colleague sees only their own store's data, enforced by Postgres Row Level Security, not just hidden in the UI; (3) a live web page rather than an exported spreadsheet file, styled with tabs so it reads like one. New `profiles` table (id, email, store_name, is_admin) with a trigger that auto-creates a row on signup from the store picked at signup; a new RLS SELECT policy on `quiz_submissions` lets a colleague see rows where `profiles.store_name` matches (trimmed/lowercased) or where `profiles.is_admin = true`. Applied directly to Mike's live Supabase project via the Supabase MCP connector (not by Mike running SQL manually) — `supabase/schema.sql` updated to match for reproducibility. Also fixed a linter-flagged security warning: revoked EXECUTE on the new trigger function from `anon`/`authenticated` so it can only fire as a trigger, not be called directly over the API | Store name matching is the fragile point — the intake form's "Store / Banner Name" field is free text typed by associates, not a controlled list, so a colleague's assigned store must match that text closely (case/whitespace-insensitive, but not typo-tolerant). No self-serve path to `is_admin = true` by design (a colleague can't grant themselves admin); Mike must sign up once and tell Claude the email to flag manually |
| 2026-08-18 | Fixed the store-name fragility above: Mike sent his real "Columbus door list" (24 stores — Columbus Running Co, Fleet Feet, Second Sole, Runner's Plus, Athletic Annex, Tri-State Running Co, Running Away Inc locations) via chat after a SharePoint link Claude couldn't open (needs Mike's Microsoft login). Replaced the placeholder single-entry `js/stores.js` with the real list, **and** converted the quiz intake form's "Store / Banner Name" field (`index.html`) from free text to a `<select>` populated from the same `js/stores.js` list, so associates can no longer type a store name that won't match a colleague's dashboard filter | Free text was always going to drift from whatever colleagues pick at signup; a shared dropdown source of truth for both the intake form and the signup form removes the mismatch risk entirely rather than just documenting it. Mike's message appeared to cut off mid-row at "Road Runner**" — the list may be incomplete, flagged to Mike |
| 2026-08-19 | Confirmed Mike's earlier `git commit` + `git push` retry succeeded — `fd8301e Add colleague results dashboard; wire in real store list` is on `origin/main`, working tree clean | Resolves the "did the push work" gap from his "i tried to push it but it failed" report; verified directly via `git log origin/main -1` on his machine rather than assuming |
| 2026-08-19 | Replaced the 24-entry Columbus-only `js/stores.js` with a 385-store national list, sourced from Mike's monday.com "aBSP Doors" board (the "Covered Doors" group, filtered to doors with an assigned Product Educator) instead of the hand-typed/possibly-cut-off list. Covers Mike plus 14 colleagues. Excluded Teresita Pelayo's and Edward Yeboah-Alexander's assigned doors — those two Product Educators' territories are almost entirely soccer-specialty retailers (Soccer Post, Soccer Corner, Niky's, WeGotSoccer, etc.), out of scope for a running-shoe quiz store list. Also found real naming mismatches between Mike's hand-typed list and monday.com for the same physical stores (e.g. "Runner's Plus - Fairborn" vs "Runners Plus - Fairborn", "RUNNING AWAY INC. - JOHN'S RUN WALK- Lexington" vs "John's Run & Walk - Lexington") — monday.com's naming was used as authoritative | monday.com is Mike's org's actual system of record for door/store coverage, so it's a more complete and consistent source than manual transcription; flagged the soccer-door exclusion to Mike directly rather than deciding it silently, since it wasn't explicitly confirmed with him first |
| 2026-08-19 | Built out `study-guide.html` and `cheat-sheet.html` with real content, replacing both placeholders. Source: Mike uploaded adidas's internal "adidas Footwear Running — Product Education Session" PDF deck (July 2026, 104 pages, marked CONFIDENTIAL) after a SharePoint video link and a SharePoint deck link were both inaccessible (same Microsoft-login wall as the door list earlier). Read the full deck and cross-referenced it against the quiz's existing facts for all 5 shoes — every weight/spec the deck confirmed (Adios Pro 4 ~7.0oz, Evo SL ~7.9oz, Hyperboost Edge ~9.1oz, Supernova Rise 3 ~9.7oz via its Rise-4-comparison table) matched what was already in the quiz within rounding, so no quiz content changed. Study guide got full spec tables + tech callouts (Upper/Midsole/Outsole) + a "how it feels" sell line per shoe, plus a Technology Glossary section (PRIMEWEAVE, LIGHTSTRIKE PRO, HYPERBOOST PRO, DREAMSTRIKE+, EnergyRods, Continental, LIGHTTRAXION, stack/drop, shoe-weight fact). Cheat sheet got a condensed spec table + bullet quick-lines per shoe. Boston 13 isn't covered anywhere in this deck (it's an Adizero/Hyperboost/Supernova FW26 launch deck only) — its section stays sourced from the quiz's own existing Mike-confirmed facts, unchanged | **Deliberately left out of both pages:** the deck also previews several FW26 launches that are unreleased or still under PR embargo as of 2026-08-19 — Adios Pro 5 (launches 9/22), Hyperboost Run (10/8, NAM held), Evo SL 2 (embargoed to 12/1/2026), Supernova Rise 4 (embargoed to 3/1/2027), Supernova Prima 3 (released but not yet in this quiz's lineup). Since the quiz site is public with no login wall, publishing embargoed launch dates/specs there would leak confidential product info before adidas's own PR embargo lifts. Flagged this decision to Mike directly rather than silently including or silently omitting it |
| 2026-08-22 | Mike confirmed: do not add the soccer-specialty doors (Teresita Pelayo's and Edward Yeboah-Alexander's territories) to `js/stores.js`. The 385-store exclusion from 2026-08-19 stands as final | Closes the last open item on the store-list work; no further action needed on this unless Mike changes his mind later |
| 2026-09-03 | Simplified the intake form to five fields. (1) Dropped the "Store / Banner Name" dropdown and turned "Store Location" into the single store picker fed by `js/stores.js`; its value is written to **both** `store_name` and `store_location` on submit, so the colleague dashboard's per-store tabs and the `profiles.store_name` RLS match keep working with no schema change. `dashboard.js` now prints the store once instead of "X — X". (2) Favorite Snack went from a Smoothie/Coffee/Candy/Other dropdown + conditional "Tell us what" field to a plain free-text input; `favorite_snack_other` is written as null going forward, and the dashboard still renders it for older rows | Mike's ask, both changes in one session. The two store fields were redundant once `js/stores.js` values became "Banner - Location" strings (e.g. "Fleet Feet - Blue Ash") — the free-text location was asking associates to retype what the dropdown already said. Keeping `store_name` as the canonical grouping key (rather than switching the dashboard/RLS to `store_location`) meant zero Supabase changes and no risk to the live table. Snack is an icebreaker/prize-logistics field, not reporting data, so a controlled list bought nothing |
| 2026-09-03 | **The quiz's Supabase project was shared with an unrelated app, which dropped this app's tables — moved the quiz to its own dedicated project.** Discovered while verifying Mike's live test submission: `quiz_submissions` no longer existed in project `gplkjimpinqkplpcdeio`, whose public schema had become a run-club tracker (`members`, `checkins`, `rewards`, `rsvps`, `leaderboard`, `strava_tokens`). Migration `20260903054550 drop_quiz_and_profiles_tables` ran at 05:45 UTC that morning; Mike confirmed it was not intentional (another Claude session clearing space). All prior submissions and all `profiles` rows were lost with the tables; the 9 `auth.users` accounts survived but their store links did not. Created a new project **"Product Education Quiz", ref `hlfcaczeayotkfkukaca`** (us-east-1, free tier), applied the full `supabase/schema.sql` to it, and repointed `js/config.js`. Verified with an insert + delete round-trip; security advisors clean | A dedicated project was chosen over rebuilding in the shared one because the two apps had already collided on a shared name: both defined `public.handle_new_user` on `auth.users`, so restoring the quiz's version verbatim would have silently broken the run club's signup trigger. **The quiz's trigger function is now `handle_new_quiz_colleague` (trigger `on_auth_user_created_quiz_colleague`), not the generic `handle_new_user`** — app-specific names so a future collision is impossible. `supabase/schema.sql` and `js/config.js` both updated to match. Failure mode worth remembering: `js/app.js` catches the insert error and only `console.error`s it, so the results screen shows a perfect score whether or not the save worked — a green results screen is NOT evidence the submission saved. Nothing may share this project |
| 2026-09-10 | Replaced the Adios Pro 4 quiz section (Q6–9) with Adios Pro 5, and swapped "Adios Pro 4" → "Adios Pro 5" everywhere it appears in `js/questions.js` (Q12/17/18/19/20 options, Q19/Q20 explains) and the `index.html` intro line. New Q6 = weight/stack/drop (6.3oz, 39/34mm, 5mm), Q7 = ENERGYRIM, Q8 = $275 price, Q9 = "what's new vs. Pro 4" (ENERGYRIMS, LIGHTLOCK 2.0, more foam underfoot). New photos `images/adios-pro-5-{hero,midsole,upper,outsole}.jpg` extracted from the official tech sheet PDF Mike uploaded; old `adios-pro-4-*.jpg` files left in `images/` but unused. Pro 5 stays lightest (Q20 order unchanged) and most expensive (Q19 answer unchanged). Study guide + cheat sheet updated the same day: Pro 5 spec grid, tech callouts, a "What's new vs. the Pro 4" sell line, and ENERGYRIM + LIGHTLOCK 2.0 glossary entries (EnergyRods entry now says Boston + previous Pro 4). Pro 5 removed from both pages' embargo notes | Mike's request, with the Pro 5 tech sheet as the source. Pro 4 was used as a distractor in Q6/Q9 so associates learn the upgrade story. **Deck p. 1 lists the Pro 5 PR embargo and launch as 2026-09-22**, and this is a public site. Flagged to Mike, who confirmed 2026-09-10 that he's cleared to publish it now |
| 2026-09-10 | Brand rule: all adidas deliverables use the fonts, logos, and graphics from the "PRODUCT EDUCATION FW26" deck | Mike was told to do this explicitly and asked that it be saved for every adidas project. See Visual language above |
| 2026-09-10 | Added a Footwear Pillars question (id 22, shown as Q18) and removed the old Q11 ("What is the Boston 13 best used for?", id 11). Added the Footwear Pillars graphic (`images/footwear-pillars.jpg`) to the top of both the study guide and the cheat sheet, with a text breakdown of the three pillars | Mike asked for a pillars question and for one question that doesn't really build product knowledge to go. Old Q11 was a near-duplicate of Q10 (both asked for Boston 13's "tempo + daily" positioning). The graphic comes from Mike's own screenshot of the FW26 deck slide, because it keeps the real adidas typefaces (the PDF export swaps them for Calibri). **The "SUPERNOVA RISE 4" line was replaced with "SUPERNOVA RISE 3"** (Mike's call: keep featuring Rise 3 until Rise 4 is public), because the deck marks Rise 4 as under embargo until 2027-03-01. The new line is built from the slide's own glyphs so the font matches. When Rise 4 goes public, swap in the original slide. It lists Hyperboost Run and Adizero Pro Evo 3, whose PR embargoes have lifted |
| 2026-09-29 | **Supabase project was found PAUSED (free-tier auto-pause after ~7 days idle) and, once restored, came back completely EMPTY** — no tables, no auth users, no migrations. Restoring it required pausing "Pull Up A Chair" (free tier = 2 active projects; Mike chose which). Re-applied `supabase/schema.sql` as migration `quiz_schema_reapply_after_restore`; insert/delete round-trip verified | Found while pre-checking for Mike's demo to his program director. Two lessons: (1) free-tier pausing is a standing risk for a public QR-code site — any week with no traffic kills submissions and dashboard login silently; Supabase Pro ($25/mo) removes both the pause and the 2-project cap and is the right move if this goes national. (2) Every colleague account is gone again — anyone who signed up must sign up again, and Mike still needs `is_admin` set |
| 2026-09-29 | **Brand pass** (see Visual language): light cyan deck theme, red poster header band, real adidas logo extracted from the poster PDF, Oswald + Arial type. Applied to all 5 pages | Mike: "Brand pass needs to happen" — the standing FW26 brand rule. Mike also uploaded the deck's text layer this session (no graphics/fonts in it — it's the tech-sheet content for future per-product quiz generation). **Kept OUT of the repo on purpose:** Vercel serves every repo file publicly and the deck lists embargoed launches (Evo SL 2 12/1/2026, Supernova Rise 4 3/1/2027) |
| 2026-09-29 | **Prize tiers** (`js/prizes.js`, Mike's values): 20/20 → shoes ($120–150); 18–19 → t-shirt ($10–15); 14–17 → socks ($8–12); 10–13 → keychain/lanyard ($4–8); <10 → none. Ladder shown on the intake screen, "Your prize" card on results, `prize_tier` column added to `quiz_submissions` (Supabase migration `add_prize_tier_to_quiz_submissions` + `schema.sql`), Prize column + detail line on the dashboard | Mike: "the better the scores, the higher the value prize." Tier boundaries reuse the badge thresholds so the two ladders line up; the 20/20 shoe tier is the one addition. Fulfillment is outside the app. ⚠️ **Open policy question flagged to Mike:** the Retake button + immediate per-question feedback means anyone can loop until 20/20 — with shoes on the line, decide whether first attempt counts, best-of-N, or a cooldown |
| 2026-09-29 | **Save failure is now loud:** results screen opens with a status banner at the top (grey → green "saved" / red "NOT saved" + Retry button) replacing the grey one-liner under the breakdown; intake screen runs a preflight `select … head:true` on load and shows a red "can't reach the results server" warning if Supabase is paused/unreachable | Mike: "turn on silent save." The 2026-09-03 and 2026-09-29 incidents both produced perfect-looking results screens with nothing saved. Preflight works because a 200 on an anon SELECT (which RLS returns empty) proves the project is awake |
| 2026-09-30 | **v2 platform built, verified, pushed.** Magic-link sign-in + `employees`; per-shoe modules with video gate (Myagi MP4s for Rise 3 / Boston 13 / Evo SL) or photo+bullets; 20 s/question timer with blur counting (`js/timer.js`, `js/quiz-engine.js`); proctored certification test by code (`test_sessions`/`test_attempts`, one attempt, 4 h expiry); `store_products` toggles; dashboard rebuilt with Results/Employees/Store products/Sessions. **Correct answers never leave the server** — grading is in `submit_*` RPCs (`supabase/v2_schema.sql`, migration `v2_platform_schema`). Prize tier is now earned on the certification test only; modules are practice | Director approved national rollout 2026-09-30; Mike: build "up a notch" with videos (photos until new ones exist), 20 s timer, magic link. Server-side grading was chosen because a static site with the key in `js/questions.js` is trivially cheatable once prizes are real. The legacy quiz stays as `legacy-quiz.html` so existing `quiz_submissions` history still has a page |
| 2026-09-30 | Myagi presenter videos embedded straight from Myagi's CDN (`docs/myagi-video-catalog.md`) rather than downloaded/re-hosted | Verified with a cookie-less HEAD: 200, video/mp4, no auth. Zero hosting cost or egress on the free tier. Risk accepted: if Myagi locks the CDN, null `video_url` and the photo intro takes over automatically |
| 2026-09-30 | Hyperboost Run seeded but `active = false` | Deck p.1: NAM holds launch until 2026-10-08; also only 4 questions so far |
