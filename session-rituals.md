# session-rituals.md — Start/End Checklists

Two checklists to run in **either Cowork or Code**, every session. This is
the "how" — `CLAUDE.md` is the "what," `MEMORY.md` is the "what we know,"
`CONTEXT.md` is the "where we are."

## START ritual

Trigger phrase: **"Run the start ritual."**

1. Read [`CLAUDE.md`](./CLAUDE.md) — project brief, toolchain, stack,
   conventions.
2. Read [`MEMORY.md`](./MEMORY.md) — locked decisions, architecture,
   product facts, decision log.
3. Read [`CONTEXT.md`](./CONTEXT.md) — current status, next steps, open
   questions.
4. **Before doing any work**, summarize back:
   - Current state (from `CONTEXT.md`).
   - What this session's plan is (proposed, based on "immediate next
     steps" and whatever Mike just asked for).
   - Any open question from `CONTEXT.md` that blocks the plan, flagged
     explicitly.
5. Wait for confirmation/adjustment before proceeding, unless the session
   is unattended (scheduled/no one to respond) — in that case state the
   assumption being made and proceed.

## END ritual

Trigger phrase: **"Run the end ritual."** (Also run this proactively
whenever a session wraps up, even if not explicitly asked.)

1. Update [`CONTEXT.md`](./CONTEXT.md):
   - Revise "What we're building right now" and "Current status."
   - Update "Immediate next steps" to reflect what's actually left.
   - Add/remove/resolve entries in "Open questions."
   - Update the `_Last updated:_` line at the top.
2. Append any durable decision made this session to `MEMORY.md`'s decision
   log (date, decision, why) — and update the relevant section above the
   log if it's an architecture/product/naming fact, not just a log entry.
3. **In Claude Code only:** commit with a clear message describing what
   changed and why (not just "update files"). Include the doc updates from
   steps 1–2 in the same commit if they're related, or a separate
   `docs: update context/memory` commit if not.
4. If anything is genuinely blocking and can't be resolved solo, leave it
   as an explicit open question in `CONTEXT.md` rather than guessing
   silently.
