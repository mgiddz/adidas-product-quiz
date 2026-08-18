# CONTEXT.md — Current Working State

Where we are *today*. This changes every session — overwrite freely, it's
not a history log (that's `MEMORY.md`'s decision log). Durable facts and
locked decisions belong in [`MEMORY.md`](./MEMORY.md), not here. Toolchain
and stack details live in [`CLAUDE.md`](./CLAUDE.md).

_Last updated: 2026-08-17 (Cowork session — deployed live, QR code generated)_

## What we're building right now

The site is **live**: `https://adidas-product-quiz-4v5e.vercel.app/`.
Repo pushed to `github.com/mgiddz/adidas-product-quiz` (Mike's account),
connected to Vercel (auto-redeploys on every push to `main`). Verified via
WebFetch: no login wall, correct title/content. QR code image generated
pointing at the live URL and delivered to Mike.

## Current status

- ✅ Quiz itself (content/format/scoring) is done and working.
- ✅ `index.html` is the quiz (intake → quiz → results).
- ✅ Results screen has a "Want to brush up?" section linking to
  `study-guide.html`, `cheat-sheet.html`, and the external Typeform survey.
- ✅ Real product photos show on every question card — all 5 shoe
  sections are Mike-confirmed. One spare Boston 13 photo
  (`images/boston-13-upper.jpg`) is unused in the quiz but available for
  the study guide.
- ✅ **Deployed and live** — GitHub repo `mgiddz/adidas-product-quiz`,
  hosted on Vercel at `adidas-product-quiz-4v5e.vercel.app`. Every future
  `git push` to `main` auto-redeploys, no reconnecting needed.
- ✅ **QR code generated** pointing at the live URL, delivered to Mike.
- ❌ **Blocked on Mike:** study guide and cheat sheet content — he said he
  has existing docs to share. Pages are ready to receive them once sent.
- 🟡 **Supabase wired but not yet pushed live.** Mike created the project
  and ran the schema himself. Claude pulled the project URL + anon key
  directly via the Supabase MCP connector, filled in `js/config.js`, and
  verified schema/grants/RLS policy match `supabase/schema.sql` exactly
  (see MEMORY.md decision log, 2026-08-17). Staged in git, waiting on
  Mike's device to reconnect so it can be pushed to his machine, then one
  more `git commit` + `git push` (same pattern as the initial deploy) to
  go live.

## Immediate next steps

1. Mike sends over his existing study guide / cheat sheet content →
   Claude drops it into `study-guide.html` / `cheat-sheet.html`.
2. Mike creates a Supabase project, runs `supabase/schema.sql`, pastes
   URL/anon key into `js/config.js`, commits + pushes (auto-redeploys).
3. Optional/nice-to-have, still not blocking: password-protected admin
   view, CSV export button, animated question transitions.

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

## Open questions

- **Study guide / cheat sheet content** — waiting on Mike's docs.
- **"Prize"/incentive copy** — spec's intake screen mentions a generic
  "top scorers may be eligible for a reward" nod (nice-to-have, flexible,
  fulfillment happens outside the app). Confirm exact wording with Mike
  before the live event, or leave generic.
- **Password-protected admin view** — nice-to-have, not a v1 blocker.
  Mike can review submissions directly in the Supabase table editor.
