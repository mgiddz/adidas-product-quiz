# CONTEXT.md — Current Working State

Where we are *today*. This changes every session — overwrite freely, it's
not a history log (that's `MEMORY.md`'s decision log). Durable facts and
locked decisions belong in [`MEMORY.md`](./MEMORY.md), not here. Toolchain
and stack details live in [`CLAUDE.md`](./CLAUDE.md).

_Last updated: 2026-08-18 (Cowork session — colleague dashboard + real store list wired in)_

## What we're building right now

The quiz is **live and taking real submissions**:
`https://adidas-product-quiz-4v5e.vercel.app/`. Supabase is fully wired —
Mike's own test submission (20/20) landed in `quiz_submissions`, confirming
the whole pipeline end to end. Today's build: a **colleague results
dashboard** (`login.html` + `dashboard.html`) so Mike's colleagues can log
in and see their own store's results, grouped by store like spreadsheet
tabs. Mike sent his real 24-store list (may be incomplete — his message
cut off mid-row), which is now wired into both the signup dropdown and
the quiz intake form's "Store / Banner Name" field (converted from free
text to a dropdown, so the two can't drift apart). All staged on Mike's
machine, not yet pushed live.

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
- ✅ **Colleague results dashboard built** (`login.html` + `dashboard.html`)
  — a colleague creates their own account, picks their store from a
  dropdown (`js/stores.js`), and sees only their store's results after
  signing in. Mike's account, once flagged `is_admin` in the `profiles`
  table, sees every store as tabs. Enforced with Supabase Auth + Row Level
  Security (not just hidden in the UI — a colleague genuinely cannot query
  another store's rows). **Staged on Mike's machine, not committed/pushed
  yet.** See MEMORY.md decision log for full design.
- ✅ **Real store list wired in** — `js/stores.js` now has Mike's 24
  Columbus-region stores (Columbus Running Co, Fleet Feet, Second Sole,
  Runner's Plus, Athletic Annex, Tri-State Running Co, Running Away Inc).
  The quiz intake form's store field is now a dropdown from this same
  list, not free text — keeps intake submissions and colleague signups
  from drifting apart. **List may be incomplete** — Mike's message
  appeared to cut off mid-row at "Road Runner**".
- ❌ **Blocked on Mike to finish dashboard setup:**
  1. Confirm/complete the store list (see above — likely missing at least
     "Road Runner" and possibly more after it).
  2. Mike needs to sign up his own account via `login.html`, then tell
     Claude the email he used so it can be flagged `is_admin = true` in
     Supabase (no self-serve way to become admin, by design).
- ❌ **Blocked on Mike:** study guide and cheat sheet content — he said he
  has existing docs to share. Pages are ready to receive them once sent.

## Immediate next steps

1. Mike commits + pushes the dashboard + store-list files (same pattern
   as every prior push this project — see "Deploy notes" below).
2. Mike confirms whether the store list is complete (see above) →
   Claude updates `js/stores.js` if not.
3. Mike signs up on `login.html`, tells Claude the email → Claude flags
   that profile `is_admin = true` via the Supabase connector.
4. Mike sends over study guide / cheat sheet content → Claude drops it
   into `study-guide.html` / `cheat-sheet.html`.
5. Optional/nice-to-have, still not blocking: CSV export from the
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

- **Store location list completeness** — Mike sent 24 stores but the
  message looked cut off mid-row ("Road Runner**"). Both the intake form
  and signup dropdown now pull from `js/stores.js`, so they'll stay in
  sync automatically once Mike confirms/completes the list — just needs
  him to say "that's everything" or send the rest.
- **Study guide / cheat sheet content** — waiting on Mike's docs.
- **"Prize"/incentive copy** — spec's intake screen mentions a generic
  "top scorers may be eligible for a reward" nod (nice-to-have, flexible,
  fulfillment happens outside the app). Confirm exact wording with Mike
  before the live event, or leave generic.
