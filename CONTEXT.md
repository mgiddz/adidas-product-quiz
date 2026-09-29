# CONTEXT.md — Current Working State

Where we are *today*. This changes every session — overwrite freely, it's
not a history log (that's `MEMORY.md`'s decision log). Durable facts and
locked decisions belong in [`MEMORY.md`](./MEMORY.md), not here. Toolchain
and stack details live in [`CLAUDE.md`](./CLAUDE.md).

_Last updated: 2026-09-29 (Cowork session: pre-demo check for program director — Supabase project found paused + empty, restored and schema re-applied; Pull Up A Chair project paused to free the slot; demo-readiness review + national-platform roadmap given to Mike)_

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

- 🚨 **2026-09-29: Supabase project had auto-paused (free tier, idle >7 days) and restored EMPTY.** Schema re-applied, insert verified. **All colleague accounts are gone again** — anyone needs to re-sign-up on `login.html`, and Mike's account still needs `is_admin = true`. `Pull Up A Chair` Supabase project is now paused to free the 2-active-project slot. **Decision needed: upgrade to Supabase Pro** before this goes to more Product Educators — otherwise any quiet week silently breaks saving + login.

- 🚨 **Data loss, 2026-09-03: every submission before today is gone.** The
  Supabase project the quiz shared with an unrelated app had
  `quiz_submissions` and `profiles` dropped out from under it at 05:45 UTC
  (migration `drop_quiz_and_profiles_tables`, not intentional). Fixed by
  moving the quiz to its own project — **"Product Education Quiz", ref
  `hlfcaczeayotkfkukaca`** — with the full schema re-applied and
  `js/config.js` repointed. **Mike still needs to push that config change
  before the live site saves anything.** Old data may be recoverable from
  the old project's daily backups (Supabase Dashboard -> Database ->
  Backups) — unchecked as of this writing.

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

**2026-09-29 pre-demo session — all staged, NOT yet committed/pushed:**
brand pass (all 5 pages + logo PNGs), prize tiers (`js/prizes.js`,
intake ladder, results card, dashboard column), loud save banner +
intake preflight, `prize_tier` column (already live in Supabase),
MEMORY/CONTEXT updates. **Mike: `git commit` + `git push origin main`
from your Terminal, then verify the live site.** Then sign up on
`login.html` and tell Claude the email to flag `is_admin`.

Decisions Mike owes: (a) Supabase Pro — he'll ask the director;
(b) retake policy now that prizes have real value (see MEMORY.md
2026-09-29 prize entry).

0. ✅ **Adios Pro 5 + Footwear Pillars update is live** (`af07f38`, pushed
   2026-09-10, confirmed on the live site). Remaining follow-up: a brand
   pass so the site's fonts and logo match the FW26 deck (see MEMORY.md's
   Visual language brand rule). When Supernova Rise 4's embargo lifts
   (2027-03-01), swap the original pillars slide back in.
1. **Push the new Supabase config** (`git push origin main` from Mike's
   Terminal) — until then the live site is still pointed at the old,
   table-less project and every submission is silently lost.
2. Re-take the quiz on the live site once pushed; Claude verifies the row
   landed in the new project. A green results screen is not proof it
   saved — `js/app.js` only logs insert failures to the console.
3. Decide whether to try restoring the old project's backup to recover
   pre-2026-09-03 submissions (Dashboard -> Database -> Backups).
4. Colleague accounts: the 9 auth users survived but their `profiles`
   rows did not. Colleagues will need to sign up again on `login.html`,
   and Mike still needs his own account flagged `is_admin = true`.
5. Optional cleanup in Mike's Terminal: `rm -rf .git/_stale_locks` —
   leftover git lock/temp files from the Cowork device-bridge shell, which
   can move them aside but not delete them. Harmless if left.
6. Mike says when the embargoed FW26 shoes (Hyperboost Run, Evo SL 2,
   Supernova Rise 4) are public/in his stores → Claude adds them to the
   study guide, cheat sheet, and quiz. (Adios Pro 5 is already in the quiz
   as of 2026-09-10; see step 0.)
7. Optional/nice-to-have, still not blocking: CSV export from the
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
