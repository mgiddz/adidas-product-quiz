> **At the START of every session, read `MEMORY.md`, `CONTEXT.md`, and
> `session-rituals.md` and follow the rituals. At the END, update them.**

# CLAUDE.md — Product Education Quiz

Front-door brief for this repo. Read this first, then follow the pointer
above into the other three files before doing any work.

## Project overview & goal

A small training **platform** for **Adidas retail store associates** (the
"Retail Specialist Program"), reached via a QR code on their phones. **The
landing page is the quiz itself** (`index.html`) — associates scan the QR
code and go straight into the intake form, then the 20-question quiz. No
menu/hub screen in front of it.

- **Quiz** (`index.html`) — intake form → 20-question product-knowledge
  quiz on the current Running lineup → results screen with immediate
  score + badge.
- **Study Guide** (`study-guide.html`) and **Cheat Sheet**
  (`cheat-sheet.html`) — reference material, offered as options on the
  **results screen** after finishing the quiz, not before.
- **Experience Survey** — post-training feedback; this is what Mike himself
  gets evaluated on. Also offered on the results screen, linking straight
  out to his real Typeform (`https://survey.typeform.com/to/e9urwqa7`) —
  deliberately **not** an in-app page, so responses land where they're
  actually counted. See `MEMORY.md` for why a custom version was built and
  then removed.

This is a **product-education tool**, not a consumer-facing quiz. The
audience is internal: store staff, not shoppers.

## Who it's for

- **Primary user:** Adidas retail store associates, taking the quiz on a
  phone or tablet, likely on the shop floor or during a shift.
- **Secondary audience:** whoever reviews the reporting (see
  [`MEMORY.md`](./MEMORY.md#reporting--backend) for the reporting decision) —
  presumably store managers or the product-education team (Mike's side).

## The toolchain: Design → Cowork → Code

All three tools work out of **this same repo folder** on Mike's computer.
These four markdown files are the shared memory that keeps them in sync:

1. **Claude Design** — Mike pulls UI/UX designs here first. Design exports
   land in this repo as `.dc.html` prototype files (see `designs/`). These
   are references for look, feel, copy, and interaction — not shipped code.
2. **Claude Cowork** — gameplanning, research, and this documentation set
   happen here. Cowork reads the same `.dc.html` prototypes and the same
   MEMORY/CONTEXT files as Claude Code.
3. **Claude Code** — the actual app gets built/edited/tested here, using the
   design prototypes and CONTEXT.md's plan as the spec.

Because all three touch the same folder, **whatever one tool decides or
learns belongs in these files**, not just in that tool's own conversation
history. If a decision doesn't make it into `MEMORY.md` or `CONTEXT.md`, the
next session (in any tool) won't know about it.

## Tech stack

**Status: locked (2026-08-15).**

- **Frontend:** plain HTML/CSS/JS, **no build step**, plain multi-page site
  (no router/framework) — `index.html` is the quiz itself (a small JS state
  machine driving three screens: intake → quiz → results), with
  `study-guide.html` and `cheat-sheet.html` as separate pages linked from
  the results screen, plus an external link out to Typeform for the
  survey. All pages share `css/styles.css`. Quiz content lives in its own
  data file (`js/questions.js`), not inline.
- **Backend/reporting:** [Supabase](https://supabase.com) (hosted Postgres +
  auto-generated REST API). The static frontend inserts a row directly via
  the Supabase JS client (loaded from CDN) using the public **anon key**,
  restricted by a Row Level Security policy to insert-only — no custom
  server needed. Schema lives in `supabase/schema.sql`.
- **Hosting:** static hosting (Netlify or Vercel) for the frontend; Supabase
  hosts the database/API separately. Requirement: a stable public URL with
  **no login wall** (needed for the QR-code flow — see `docs/adidas_quiz_webpage_build_spec.md` §7).

This keeps the app "just files" to deploy while still supporting
backend-tracked, exportable submissions.

### Install / run / build

No build step — this is plain HTML/CSS/JS.

```bash
# local dev: any static file server works, e.g.
npx serve .
# or
python3 -m http.server 8000
```

**One-time setup before the app can actually save submissions:**
1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase SQL editor, run `supabase/schema.sql` from this repo.
3. In Supabase → Project Settings → API, copy the **Project URL** and
   **anon public key**.
4. Paste them into `js/config.js` (placeholders are there with comments).

There is nothing to `npm install` — the Supabase client loads from a CDN
`<script>` tag in `index.html`.

### Deploying (step-by-step)

The QR code employees scan needs a real, permanent, public URL — this repo
isn't deployed anywhere yet. These steps get it there under Mike's own
GitHub + Vercel (or Netlify) accounts, so it can be redeployed anytime from
Claude Code or a normal `git push`.

**1. Set your git identity (one-time, if not already done):**

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

**2. Make the first commit** (everything should already be staged from
setup — check with `git status`):

```bash
git commit -m "Initial commit: Product Education Quiz platform"
```

**3. Push to GitHub:**
- Create a new repo at [github.com/new](https://github.com/new) (don't
  initialize it with a README — this repo already has one).
- Follow GitHub's "push an existing repository" instructions, e.g.:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

**4. Connect to Vercel (recommended) or Netlify:**
- Go to [vercel.com/new](https://vercel.com/new) (or
  [app.netlify.com/start](https://app.netlify.com/start)) and sign in with
  your GitHub account.
- Import the repo you just pushed.
- Framework preset: **"Other"** / static site — there's nothing to build,
  no build command, no output directory override needed.
- Click **Deploy**. You'll get a live URL like
  `https://your-repo-name.vercel.app` within about a minute.

**5. Verify before generating the QR code:**
- Open the live URL on your own phone and click through: intake → quiz →
  results, and results → survey link. Confirm there's no login prompt
  anywhere (spec hard requirement).
- If `js/config.js` doesn't have real Supabase values yet, submissions
  will still show a score/thank-you on-screen but won't save — that's
  expected and non-blocking for testing the flow, but finish the Supabase
  setup above before the real event.

**6. Get the QR code:** once you have the live URL, come back to Cowork (or
ask Claude Code) and it'll generate a QR code image pointing at it.

Every future `git push` to the connected branch auto-redeploys — no need to
reconnect anything.

## Folder structure

```
Product-Education-Quiz/
├── CLAUDE.md              # this file — front-door brief
├── MEMORY.md              # durable decisions, architecture, product facts
├── CONTEXT.md             # current status, next steps, open questions
├── session-rituals.md     # START/END checklists
├── README.md              # short pointer to the four files above
├── .gitignore
├── index.html             # THE QUIZ — intake, quiz, results (results links to the 3 below)
├── study-guide.html       # placeholder — Mike's content pending
├── cheat-sheet.html       # placeholder — Mike's content pending
├── css/
│   └── styles.css         # shared across all pages
├── js/
│   ├── config.js          # Supabase project URL + anon key (public-safe)
│   ├── questions.js       # quiz question bank + answer key (data only)
│   └── app.js             # index.html: screen state machine, grading, Supabase submit
├── supabase/
│   └── schema.sql         # run once in the Supabase SQL editor — 1 table (quiz_submissions)
├── designs/               # Claude Design exports (.dc.html) — reference only
│   └── Hyperboost Product Quiz.dc.html
└── docs/                  # planning docs that aren't part of the app or the four memory files
    └── adidas_quiz_webpage_build_spec.md   # authoritative build spec — see MEMORY.md
```

`designs/*.dc.html` files are **not shipped app code**. They're
interactive prototypes from Claude Design used as the visual/interaction
spec. Claude Code should read them for styling, copy, and behavior, then
reimplement in the real app stack — don't wire the `.dc.html` files
themselves into the build.

`docs/*.md` files are supporting planning material (specs, notes) — richer
source documents that get distilled into `MEMORY.md`/`CONTEXT.md` rather
than read fresh every session. If `docs/` and the design prototype ever
disagree, check `MEMORY.md`'s "Product facts" source note for which one
currently governs.

## Coding conventions

- Keep the app **simple** by default — this was an explicit ask. Prefer
  fewer moving parts over premature abstraction.
- Match the visual language already established in the Claude Design
  prototypes (see `designs/`) unless a session explicitly changes it:
  dark theme (`#0d0d0d` background), Adidas red accent
  (`oklch(0.55 0.22 25)`), `Archivo Black` for display type, `Barlow` for
  body/UI type.
- Quiz content (questions, options, correct answers, explanations) should
  live in a clearly separated data structure/file, not hardcoded inline in
  UI components — new categories/quizzes will need to plug in the same way.
- Any new durable decision (naming, architecture, scoring rules, etc.) gets
  written to `MEMORY.md`'s decision log the same session it's made — don't
  let it live only in chat history.
- Any change in current status or plan gets written to `CONTEXT.md` the same
  session — see `session-rituals.md` for the exact END checklist.
