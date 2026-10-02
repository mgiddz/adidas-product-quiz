# CONTEXT.md — Current Working State

Where we are *today*. This changes every session — overwrite freely, it's
not a history log (that's `MEMORY.md`'s decision log). Durable facts and
locked decisions belong in [`MEMORY.md`](./MEMORY.md), not here. Toolchain
and stack details live in [`CLAUDE.md`](./CLAUDE.md).

_Last updated: 2026-09-30 (Claude Code session: v2 platform finished, verified, and pushed — modules + timed quizzes + magic-link sign-in + proctored certification test + rebuilt dashboard; Myagi videos wired)_

## What we're building right now

**v2 is built and pushed (2026-09-30).** The director green-lit a national
rollout, so the single 20-question quiz became a platform. Live at
`https://adidas-product-quiz-4v5e.vercel.app/` once Vercel redeploys this push.

- `index.html` — **magic-link sign-in** (email, no password) → one-time
  profile (name, store, sizes) → **module grid** showing only the shoes
  that store carries → certification-test code entry.
- `module.html?p=<product>` — intro (Myagi presenter video with a
  must-finish gate, or hero photo + "what to know" bullets) → **timed quiz**
  (20 s/question, first tap locks, no back, tab-blur counted) → server-graded
  results with breakdown. Retakes allowed; prizes are NOT earned here.
- `test.html?code=XXXXXX` — **proctored certification test**. PE opens a
  session on the dashboard (store + products + question count) → 6-char code
  (4 h expiry) → employee enters it → one attempt → prize tier from this score.
- `dashboard.html` — Results (tests / modules / legacy, per store, CSV
  export) · Employees (history + sizes) · **Store products** (toggle grid =
  "which stores carry what") · **Test sessions** (open, live roster with
  blur counts, close).
- `legacy-quiz.html` — the v1 intake-form quiz, kept reachable but off the
  front door.

Backend: `supabase/v2_schema.sql` (applied as migration `v2_platform_schema`)
+ `supabase/seed_v2.sql`. **Correct answers never reach the browser** —
`get_module_questions` / `join_test_session` return shuffled questions
without the key; `submit_module_attempt` / `submit_test_attempt` grade
server-side. RLS: employees see only their own rows; staff see their
territory (`profiles.territory`) or everything if `is_admin`.

## Current status

- ✅ **Verified 2026-09-30, end to end:** RPCs exercised in SQL as a signed-in
  user (questions shuffled with no answer key; module graded 3/8 with
  breakdown; session opened → joined → submitted 5/10 → `keychain`; roster
  shows score + blur count; `my_progress` returns best/attempts). All smoke
  data deleted afterwards. All 11 screens rendered headless with a mock
  client: **zero JS errors.** Dashboard CSS was missing for the new panels
  — added. Header user chip no longer collides with the brand lockup.
- ✅ **Myagi videos wired** for Supernova Rise 3, Boston 13, Evo SL
  (`products.video_url`; see `docs/myagi-video-catalog.md`). Verified the
  MP4s load without a Myagi login. Hyperboost Edge, Adios Pro 5 use photo +
  bullets until the director sources videos.
- ✅ Content: 56 questions across 7 products (v1 bank + Myagi's questions +
  tech-sheet facts). Hyperboost Run is seeded but `active = false` until its
  10/8 launch (only 4 questions so far).
- ✅ Store toggles pre-seeded: every door in `js/stores.js` × every product,
  all on.
- ⚠️ **Nobody has signed in yet** — `employees` is empty. First real test:
  Mike signs in on the live site with the magic link.
- ⚠️ **The QR code now lands on a sign-in screen**, not the old intake
  form. Expected (it's the new front door), but worth knowing before the
  next store visit.

## Immediate next steps

1. **Mike — Supabase Auth config (blocks magic links):** Dashboard →
   Authentication → URL Configuration → Site URL =
   `https://adidas-product-quiz-4v5e.vercel.app` and add
   `https://adidas-product-quiz-4v5e.vercel.app/**` to Redirect URLs. Until
   then sign-in links bounce to `localhost:3000`. Claude has no tool for
   this setting.
2. Mike: sign in on the live site as an employee, take the Boston 13 module
   (video gate) and the Hyperboost Edge module (photo intro) on your phone.
   Then open a session from the dashboard and take the test with the code.
3. Peter Kalmbach: sign up on `login.html` → Claude sets `role='admin'`.
4. Supabase Pro — still with the director. Free tier auto-pauses after 7
   idle days (both pages show a red banner when that happens).
5. Content depth: grow each shoe's bank to 12–15 so 8-question draws vary.
   Mike re-sends the FW26 deck text in-session (not stored in the repo —
   embargoed launches, and Vercel serves every repo file).
6. When videos arrive for Hyperboost Edge / Adios Pro 5: set
   `products.video_url` (Supabase Storage once on Pro, or any public MP4).
7. Hyperboost Run: on 10/8 set `active = true` after adding questions.
8. Retake policy for the *proctored* test is one attempt per session; a PE
   can open a new session for a retest — decide whether that's the policy.

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
