# CONTEXT.md — Current Working State

Where we are *today*. This changes every session — overwrite freely, it's
not a history log (that's `MEMORY.md`'s decision log). Durable facts and
locked decisions belong in [`MEMORY.md`](./MEMORY.md), not here. Toolchain
and stack details live in [`CLAUDE.md`](./CLAUDE.md).

_Last updated: 2026-08-17 (Cowork session — Boston 13 photos closed the last gap)_

## What we're building right now

Mike sent 4 Boston 13 photos directly in chat (one shows "ADIZERO BOSTON
13" printed on the shoe) — the last section still on a best-guess photo
match. Two of those turned out to be photos previously sitting in the
Adios Pro 4 section (including the EnergyRods 2.0 question's image), so
that question got reassigned to a different Adios Pro 4 photo. Every
question in `js/questions.js` now points at a Mike-confirmed photo. See
MEMORY.md "Product images" for the full history.

## Current status

- ✅ Quiz itself (content/format/scoring) is done and working.
- ✅ `index.html` is the quiz (intake → quiz → results).
- ✅ Results screen has a "Want to brush up?" section linking to
  `study-guide.html`, `cheat-sheet.html`, and the external Typeform survey.
- ✅ Real product photos show on every question card — **all 5 shoe
  sections are now Mike-confirmed**, no more best-guess matches. One spare
  Boston 13 photo (`images/boston-13-upper.jpg`) is unused in the quiz but
  available for the study guide.
- ❌ **Blocked on Mike:** study guide and cheat sheet content — he said he
  has existing docs to share. Pages are ready to receive them once sent.
- ❌ Supabase project still not created — needed for quiz submissions.
- ❌ **Not deployed — no QR code exists yet.** `CLAUDE.md` has the full
  step-by-step (git identity → commit → GitHub → Vercel/Netlify).

## Immediate next steps

1. Mike sends over his existing study guide / cheat sheet content →
   Claude drops it into `study-guide.html` / `cheat-sheet.html`.
2. Mike creates a Supabase project, runs `supabase/schema.sql`, pastes
   URL/anon key into `js/config.js`.
3. Mike follows the deploy walkthrough in `CLAUDE.md` to get a live public
   URL.
4. Once there's a live URL, come back and Claude generates the actual QR
   code image pointing at `index.html`.
5. Optional/nice-to-have, still not blocking: password-protected admin
   view, CSV export button, animated question transitions.

## Open questions

- **Study guide / cheat sheet content** — waiting on Mike's docs.
- **"Prize"/incentive copy** — spec's intake screen mentions a generic
  "top scorers may be eligible for a reward" nod (nice-to-have, flexible,
  fulfillment happens outside the app). Confirm exact wording with Mike
  before the live event, or leave generic.
- **Password-protected admin view** — nice-to-have, not a v1 blocker.
  Mike can review submissions directly in the Supabase table editor.
