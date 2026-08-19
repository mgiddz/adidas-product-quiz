# MEMORY.md — Durable Project Memory

What we've decided and know. This changes rarely — new entries get
**appended**, old entries get corrected in place if they turn out wrong
(don't just delete history, note the correction). For "where are we right
now," see [`CONTEXT.md`](./CONTEXT.md) instead — that's the fast-changing
file. Toolchain and stack context lives in [`CLAUDE.md`](./CLAUDE.md).

## Product overview

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
- Question bank covers all **5** products: Hyperboost Edge (Q1–5), Adios
  Pro 4 (Q6–9), Boston 13 (Q10–12), Evo SL Woven (Q13–15), Supernova Rise 3
  (Q16–18), plus 2 "Full Lineup" questions spanning all five (Q19 price
  ranking MC, Q20 weight ranking order question).
- Full question text, options, and explanations transcribed into
  `js/questions.js`.

### Intake form fields (from spec §2 — prototype doesn't cover this, kept as-is)

1. Employee Name (text)
2. Store Name + Store Location (two separate text fields, for reporting)
3. Shoe Size (text/number) + Men's/Women's toggle
4. Clothing Size (dropdown: XS/S/M/L/XL/XXL) + Men's/Women's toggle
5. Email Address (validated)
6. Favorite Snack (dropdown: Smoothie/Coffee/Candy/Other + free text if Other)

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
  timestamp.
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
- Header: "adidas RUNNING" + "Retail Specialist Program" eyebrow.
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
2. **Adios Pro 4** — race-day shoe. ~7oz, 39mm/33mm stack (6mm drop),
   EnergyRods 2.0 (shaped like the foot/metatarsal bones). Retail $250.
   Franchise purpose: "Race to win."
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
Adios Pro 4 (~7oz) → Evo SL Woven (~8oz) → Boston 13 (~8.5oz) →
Hyperboost Edge (~9oz) → Supernova Rise 3 (~9.5oz).

Ranked by retail price, most expensive first: Adios Pro 4 ($250) >
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
