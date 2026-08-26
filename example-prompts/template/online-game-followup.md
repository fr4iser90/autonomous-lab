================================================================
RESUME / FOLLOW-UP — stuck overnight run (do not greenfield)
================================================================

Hi. You are back in an **existing** workdir. The previous unattended run stalled,
lost context, hit a tool/session limit, or was killed mid-job. You do **not**
start from scratch. You do **not** re-clone or reinvent the game.

WHAT THIS JOB WAS
- Full overnight law: `online-game.md` in `example-prompts/template/` (filled for this
  run — placeholders already resolved in the paste / checkout). That file owns
  genre, milestones, ACCEPT, LIVE LOOP, Phase 2–4. This follow-up only resumes.
- Kind: online multiplayer game template
- Branch: whatever `agent/<run-id>` PROGRESS.md / git already use.

BOILERPLATE OWNERSHIP (resume)
- Read `BOILERPLATE.md` if present. Never edit BOILERPLATE_OWNED paths (workflows,
  AGENTS.md, BOILERPLATE.md, scripts/new-run.sh, LICENSE, Vite base).
- Toy/placeholder files are not the game. Tracking = PROGRESS.md (+ CONTENT/…).
- `.autonomy/` is optional/legacy — do not treat it as primary truth.

READ THE DATA FIRST (tracking surface — invent nothing)
1. `git status` / current `agent/*` branch / recent commits.
2. Read **PROGRESS.md NOW** — phase, next step, last ACCEPT, SHA, pre-PR visual.
3. Read other tracking docs that exist: CONTENT.md, FEATURES.md, SOAK.md,
   BUGS.md, DEMO.md, ASSETS.md, shared/design.md or shared/protocol.md.
4. Compare claims to disk (src/, demo/, tests/).

- Lie detector: PHASE3-DONE / "demo done" / ALL COMPLETE without real demo
  artifact + DEMO.md visual PASS + frames (when the main prompt requires them)
  → FALSE; append BUGS.md; resume the real gap.

INFINITY MODE (Phase 4 — re-arm on every follow-up)
- If Phase 3 is truly done (demo artifact + DEMO.md visual PASS + frames when
  required) and STOP_AFTER_DEMO is not set → you are in **Phase 4 infinite
  improve**. Continue P4 cycles forever until a human kills the process.
- Never treat PHASE3-DONE / DEMO done as "job finished". That is only a
  checkpoint. Do not mark create_goal complete; do not idle; next tool = P4 cycle.
- If PROGRESS already shows Phase 4 / cycle-N: resume that cycle (or N+1 if
  the last cycle ACCEPT is proven). Do not fall back to M1 or re-record DEMO
  unless the lie detector says the demo is fake/incomplete.

THEN CONTINUE
1. create_goal with the same overnight objective and max_goal_rounds ≥ 200.
   Never mark complete on your own unless STOP_AFTER_DEMO applies — otherwise Phase 4 runs forever.
2. Resume at the first unfinished milestone / cycle / soak / DEMO / Phase 4 step.
   Never restart M1 if later work exists.
3. Obey LIVE LOOP from `online-game.md` before every push/PR — including **PRE-PR VISUAL**
   (screenshot + smart/VL when available; PASS required).
4. Keep tracking docs current. Always leave a next tool call.
5. Gate green. Never push `main` / `baseline`.


================================================================
PHASE GATE (before EVERY phase change — Pages must show the finished phase)
================================================================

Do **not** start the next phase until this gate PASSes. Applies to:
  milestones-complete → Phase 2, Phase 2 → Phase 2b/soak, soak → Phase 3,
  Phase 3 → Phase 4, and any other named phase jump in this prompt.

1. PLAYABLE CHECK: boot the game; capture ≥1 Playwright screenshot of the
   playable surface for the phase you just finished (title + in-world / HUD as
   appropriate). Must look coherent and playable — not black, not error page.
2. VL / smart (**required when available**): MUST spawn the settings model
   named `smart` / vision-capable and pass the screenshot **path**. Read-tool
   "binary file" errors do **not** excuse skipping smart. Require PASS
   ("playable for this phase"). On FAIL: fix, re-shot, re-validate — do not
   advance phase, do not push. File size/dimensions alone = FAIL / not a PASS.
   Only if no smart/VL in settings: Read/self-check the image; FAIL still blocks.
3. Log in PROGRESS.md NOW: `PHASE_GATE: <from>→<to> PASS`, screenshot path,
   validator (smart/VL id or self-read).
4. Run the full LIVE LOOP (PRE-PR VISUAL may reuse the phase-gate shot if it
   is fresh and PASS). Push `agent/*` → CI → automerge → **Pages must update**
   so the live site shows this phase's finished, playable state **before** you
   begin the next phase.
5. Only after automerge/Pages path is underway (PR merged or open with green
   gate + automerge candidate) may you write NEXT phase into PROGRESS and start
   the next phase's first task.

FORBIDDEN: jumping M12→Phase2 / 2→2b / 2b→3 / 3→4 (or template equivalents)
without PHASE_GATE PASS + LIVE LOOP publish toward main/Pages.

