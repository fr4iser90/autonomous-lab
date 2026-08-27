================================================================
RESUME / FOLLOW-UP — generic (harness nudge default)
================================================================

You are back in an **existing** Autonomous Lab workdir. The previous session
stalled, hit a limit, or the idle nudge fired. You do **not** greenfield.
You do **not** re-clone or invent a second product / `-rebased` branch.

create_goal once if useful. Policy error ("requires a direct human turn" /
top-level agent) → **IGNORE**; continue with tools. Never mark create_goal
complete. Human kills the process.

**Steering:** One Initial + one Followup per experiment. Roles under `lab/roles/`
are **machine laws** you obey — do not require the human to paste every role.
Validation is **`lab/roles/validate.md`** behavior inside this loop (no separate
`*-VL-validation.md` prompt required).

================================================================
WHAT TO READ (order)
================================================================

1. `git status` / branch / recent commits. Expect `agent/<run-id>` from
   PROGRESS.md (or open PR). One run = one branch.
2. **PROGRESS.md NOW** — phase, next step, SHA, stack pin, caps, last VALIDATE.
3. **BUGS.md ## Open** — drain `blocker` / `playability` / merge-gate first.
4. `shared/design.md` (+ ARCHITECTURE.md if present), CONTENT/FEATURES/SOAK/DEMO
   as relevant.
5. If this run used a genre Initial (`lab/examples/games/<name>.md`), re-open
   **that file** for ACCEPT only — do not restart M1 if later work exists.
   Prefer that game’s `*-followup.md` when it was the resume law; otherwise
   this file is enough.
6. `lab/AGENTS.md` / `lab/BOILERPLATE.md` / `lab/MODEL_STACKS.md` — read only;
   never rewrite `lab/**`.

================================================================
CYCLE (repeat until human kills)
================================================================

0. **FIX-FIRST:** If BUGS ## Open has blocker/playability → `lab/roles/fix.md`.
1. **VALIDATE cadence:** Every **3** feature cycles (or every phase gate / before
   claiming PLAYABLE on Pages) → behave as `lab/roles/validate.md`:
   Playwright Pages (prefer) → screenshots → **`read_image`** → append BUGS.
   Log `VALIDATE: <SHA> PASS|FAIL` in PROGRESS NOW. Then FIX any new blockers
   before more features.
2. Else **FEATURE slice:** `lab/roles/feature.md` — one goal, ~8 files max,
   tests + docs same turn. Obey pinned STACK.
3. Concept/Arch (`lab/roles/concept.md` / `arch.md`) **only** if PROGRESS says
   stack/layout pivot or design.md missing — not every nudge.
4. PRE-PR visual when UI changed → **`read_image`** PASS (not file size).
5. `pnpm run gate` green **locally**; tip **GitHub** `gate` green before ACCEPT.
6. Commit + push same `agent/<run-id>` → PR/automerge. After land+sync:
   `git fetch && git reset --hard origin/agent/<run-id>` if tip moved.
7. Refresh PROGRESS NOW. **Always leave a next tool call.**

One writer of `src/` at a time. Do not open parallel agents on `src/`.

================================================================
LIE DETECTOR
================================================================

Treat false COMPLETE as BUGS "false complete" and resume the real gap:
- Claimed demo/Phase3 without webm + DEMO.md visual PASS + frames
- Claimed CAP/depth without SOAK evidence
- Black WebGL / empty UI claimed PASS
- "Validated" without Pages (or preview) click + `read_image`

================================================================
FORBIDDEN
================================================================

- Push `main` / `baseline`; invent `agent/*-rebased`
- Delete lint/boundaries configs to silence gate
- Second engine mid-run; cloud/auth unless IDEA demanded it
- Stopping with summary-only (nudge owns the loop)
- Spawning a separate "VL validator" session when this Followup already owns
  validate cadence (unless human explicitly started one)

SAFE SYNC if PR CONFLICTING / behind main: fetch; backup branch; merge
`origin/main` keeping run `src/` + docs; or wait for Actions conflict-land +
sync. Prefer Actions; do not thrash.
