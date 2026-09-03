# CONTEXT.md — Current Working State

Where we are *today*. This changes every session — overwrite freely, it's
not a history log (that's `MEMORY.md`'s decision log). Durable facts and
locked decisions belong in [`MEMORY.md`](./MEMORY.md), not here. Toolchain
and stack details live in [`CLAUDE.md`](./CLAUDE.md).

_Last updated: 2026-09-03 (Cowork session — intake form simplified; everything outstanding committed and pushed live)_

## What we're building right now

The quiz is **live and taking real submissions**:
`https://adidas-product-quiz-4v5e.vercel.app/`. Supabase is fully wired —
Mike's own test submission (20/20) landed in `quiz_submissions`, confirming
the whole pipeline end to end. The **colleague results dashboard**
(`login.html` + `dashboard.html`) from the last session is confirmed
**pushed and live** — `fd8301e` is on `origin/main`. This session:
replaced the 24-entry hand-typed Columbus store list with a **385-store
national list** pulled from Mike's monday.com "aBSP Doors" board, covering
Mike + 14 colleagues (excluded 2 colleagues' territories that are almost
entirely soccer-specialty retailers — flagged to Mike, see Open questions).
This session: **simplified the intake form** — the "Store / Banner Name"
dropdown is gone (Store Location is now the single store picker, feeding
both DB columns) and Favorite Snack is now free text instead of a
dropdown. Everything that had been sitting staged since 2026-08-19 (the
385-store list, study guide, cheat sheet, styles) went into the same
commit. **Pushed by Mike 2026-09-03** — `74b7095` is on `origin/main`,
Vercel redeployed, and the live site was verified showing the five-field
intake form.

## Current status

- ✅ Quiz itself (content/format/scoring) is done and working, deployed,
  and confirmed saving real submissions to Supabase.
- ✅ Real product photos on every question card, all Mike-confirmed.
  Several photos reframed to focus on the shoe; answer-giveaway photos
  removed from "which shoe in the lineup" questions (Q12/17/18).
- ✅ Content accuracy pass, 2026-08-18: Q14/Q15 rewritten to fix an
  Evo SL Woven / Supernova Rise 3 positioning mix-up and self-answering
  wording; real (reviewer-measured) shoe weights cross-referenced into
  Q6/Q20.
- ✅ **Colleague results dashboard built and confirmed live**
  (`login.html` + `dashboard.html`) — a colleague creates their own
  account, picks their store from a dropdown (`js/stores.js`), and sees
  only their store's results after signing in. Mike's account, once
  flagged `is_admin` in the `profiles` table, sees every store as tabs.
  Enforced with Supabase Auth + Row Level Security (not just hidden in
  the UI — a colleague genuinely cannot query another store's rows).
  Confirmed pushed: `origin/main` is at `fd8301e`. See MEMORY.md decision
  log for full design.
- ✅ **Store list expanded to 385 doors** — `js/stores.js` replaced with
  a national list pulled from Mike's monday.com "aBSP Doors" board
  (Covered Doors, filtered to doors with an assigned Product Educator),
  covering Mike + 14 colleagues. The quiz intake form's store field stays
  a dropdown from this same list. **Pushed live 2026-09-03.**
  **Excluded 2 colleagues' doors** (Teresita Pelayo,
  Edward Yeboah-Alexander — almost entirely soccer-specialty retailers)
  — **Mike confirmed 2026-08-22: correct, do not add soccer doors.**
  Settled, no longer an open question.
- ❌ **Blocked on Mike to finish dashboard setup:**
  1. Mike needs to sign up his own account via `login.html`, then tell
     Claude the email he used so it can be flagged `is_admin = true` in
     Supabase (no self-serve way to become admin, by design).
- ✅ **Study guide + cheat sheet built out** — Mike uploaded adidas's
  internal Product Education PDF deck (July 2026, 104 pages); both pages
  now have real content (spec tables, tech breakdowns, sell lines) for all
  5 shoes plus a Technology Glossary. Deliberately excludes several FW26
  launches previewed in that deck that are unreleased or still under PR
  embargo (Adios Pro 5, Hyperboost Run, Evo SL 2, Supernova Rise 4) since
  this is a public site — see MEMORY.md decision log. **Pushed live
  2026-09-03.**

- ✅ **Intake form simplified (2026-09-03)** — five fields now: Employee
  Name, Store Location (the single `js/stores.js` dropdown, written to
  both `store_name` and `store_location`), Shoe Size + gender, Clothing
  Size + gender, Email, Favorite Snack (free text). The redundant "Store /
  Banner Name" dropdown and the snack dropdown's conditional "Tell us
  what" field are gone. No Supabase change was needed — see MEMORY.md
  decision log for why `store_name` stayed the grouping key.

## Immediate next steps

1. Optional cleanup in Mike's Terminal: `rm -rf .git/_stale_locks` —
   leftover git lock/temp files from the Cowork device-bridge shell, which
   can move them aside but not delete them. Harmless if left.
2. Mike signs up on `login.html`, tells Claude the email → Claude flags
   that profile `is_admin = true` via the Supabase connector.
3. Mike says when the embargoed FW26 shoes (Adios Pro 5, Hyperboost Run,
   Evo SL 2, Supernova Rise 4) are public/in his stores → Claude adds them
   to the study guide, cheat sheet, and quiz.
4. Optional/nice-to-have, still not blocking: CSV export from the
   dashboard, animated question transitions, sortable dashboard columns.

## Deploy notes for next time

- Mike's git identity lives in his own Mac Terminal (`~/.gitconfig`), not
  in the isolated Cowork device-bridge workspace — so `git commit` and
  `git push` need to be run by Mike himself in his real Terminal, not via
  Claude's device_bash tool. Claude can safely `git add`/stage files via
  device_bash (shared filesystem via the mount), but not commit/push.
- GitHub no longer accepts account passwords for HTTPS git push — Mike
  needed a Personal Access Token (Settings → Developer settings → Tokens,
  `repo` scope) used as the password. Terminal password prompts show no
  characters at all when typing/pasting — that's normal, not a bug.
- Stale `.git/index.lock` files from device_bash git commands can block
  Mike's own git commands in his Terminal since they share one `.git`
  directory — clear with the `_stale_locks` mv pattern before handing
  control back to Mike.
- Database/schema changes (new tables, RLS policies) get applied directly
  to Mike's live Supabase project via the Supabase MCP connector — no git
  push needed for those to take effect, only for the front-end files that
  read from them (`login.html`, `dashboard.html`, etc.).

## Open questions

- **"Prize"/incentive copy** — spec's intake screen mentions a generic
  "top scorers may be eligible for a reward" nod (nice-to-have, flexible,
  fulfillment happens outside the app). Confirm exact wording with Mike
  before the live event, or leave generic.
