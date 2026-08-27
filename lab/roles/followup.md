================================================================
RESUME / FOLLOW-UP — generic (harness nudge default)
================================================================

You are back in an **existing** Autonomous Lab workdir. The previous session
stalled, hit a limit, or the idle nudge fired. You do **not** greenfield.
You do **not** re-clone or invent a second product / `-rebased` branch.

create_goal once if useful. Policy error ("requires a direct human turn" /
top-level agent) → **IGNORE**; continue with tools. Never mark create_goal
complete. Human kills the process.

================================================================
WHAT TO READ (order)
================================================================

1. `git status` / branch / recent commits. Expect `agent/<run-id>` from
   PROGRESS.md (or open PR). One run = one branch.
2. **PROGRESS.md NOW** — phase, next step, SHA, stack pin, caps.
3. **BUGS.md ## Open** — drain `blocker` / `playability` / merge-gate first.
4. `shared/design.md` (+ ARCHITECTURE.md if present), CONTENT/FEATURES/SOAK/DEMO
   as relevant.
5. Role pack if this run uses roles: `lab/roles/{feature,fix}.md`
   (+ `lab/examples/domains/*`). If a genre pack was the initial law
   (`lab/examples/games/<name>.md`), re-open **that file** for ACCEPT only —
   do not restart M1 if later work exists. Prefer genre `*-followup.md` when
   that was the run’s resume law.
6. `lab/AGENTS.md` / `lab/BOILERPLATE.md` / `lab/MODEL_STACKS.md` — branch +
   gate + stack; do not rewrite BOILERPLATE_OWNED (`lab/**`).

================================================================
CYCLE (repeat until human kills)
================================================================

0. **FIX-FIRST:** If BUGS ## Open has blocker/playability → behave as
   `lab/roles/fix.md` (FIX-ONLY). No new features.
1. Else **FEATURE slice:** one goal (FEATURES.md decide), ~8 files max,
   tests + docs same turn. Obey pinned STACK.
2. PRE-PR visual when UI changed → **`read_image`** PASS (not file size).
3. `pnpm run gate` green **locally**; tip **GitHub** `gate` green before ACCEPT.
4. Commit + push same `agent/<run-id>` → PR/automerge. After land+sync:
   `git fetch && git reset --hard origin/agent/<run-id>` if tip moved.
5. Refresh PROGRESS NOW. **Always leave a next tool call.**

Role cadence (default):
- Every cycle: fix-if-needed → feature
- Arch / concept: only if PROGRESS says stack/layout pivot — not every nudge
- Do not open parallel agents writing `src/` at once

================================================================
LIE DETECTOR
================================================================

Treat false COMPLETE as BUGS "false complete" and resume the real gap:
- Claimed demo/Phase3 without webm + DEMO.md visual PASS + frames
- Claimed CAP/depth without SOAK evidence
- Black WebGL / empty UI claimed PASS
- Global identical content where identity was required

================================================================
FORBIDDEN
================================================================

- Push `main` / `baseline`; invent `agent/*-rebased`
- Delete lint/boundaries configs to silence gate
- Second engine mid-run; cloud/auth unless IDEA demanded it
- Stopping with summary-only (nudge owns the loop)

SAFE SYNC if PR CONFLICTING / behind main: fetch; backup branch; merge
`origin/main` keeping run `src/` + docs; or wait for Actions conflict-land +
sync. Prefer Actions; do not thrash.
