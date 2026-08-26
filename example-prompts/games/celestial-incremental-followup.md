================================================================
RESUME / FOLLOW-UP — stuck overnight run (do not greenfield)
================================================================

Hi. You are back in an **existing** workdir. The previous unattended run stalled,
lost context, hit a tool/session limit, or was killed mid-job. You do **not**
start from scratch. You do **not** re-clone or reinvent the game.

WHAT THIS JOB WAS
- Full overnight law: `celestial-incremental.md` (same `example-prompts/games/`
  folder, or already applied in this checkout). Re-open that file for ACCEPT,
  LIVE LOOP, LayerEngine architecture, and Phase rules — this follow-up only
  tells you **how to resume**.
- Game: **Signal Ascent** — Celestial-inspired layered prestige incremental (DOM)
- Branch pattern: `agent/celestial-inc-*` (use existing run branch in PROGRESS /
  git; do not invent a second product tree)
- Stack: Vite + TypeScript + DOM UI (no Phaser/Three/WebSocket)
- Planned arc: M1–M12 → Phase 2 specials → Phase 2b simulateToLayer(50) →
  Phase 3 DEMO → Phase 4 infinite layer depth

BOILERPLATE OWNERSHIP (resume)
- Read `BOILERPLATE.md` if present. Never edit BOILERPLATE_OWNED paths.
- Toy `src/economy.ts` is not the game. Tracking = PROGRESS.md (+ CONTENT/…).
- `.autonomy/` is optional/legacy — do not treat as primary truth.

READ THE DATA FIRST (tracking surface — invent nothing)
1. `git status` / current branch / recent commits. Confirm lab clone on
   `agent/celestial-inc-…` (or run id in PROGRESS).
2. Read **PROGRESS.md NOW** — phase, Mn/cycle, LAYER_CAP, deepest soak layer,
   last ACCEPT, SHA, pre-PR visual.
3. Read CONTENT.md (layer formulas, special layers), FEATURES.md, SOAK.md,
   BUGS.md, DEMO.md, shared/design.md, README `# Current run`.
4. Skim `src/systems/LayerEngine*` / `tests/simulate.ts` against PROGRESS claims.

- Lie detector: PHASE3-DONE / "demo done" without demo artifact + DEMO.md visual
  PASS + frames → FALSE; append BUGS.md; resume Phase 3 (or earlier real gap).
- Lie detector: "LAYER_CAP 100" without simulateToLayer(100) in SOAK → FALSE;
  resume soak / Phase 4 bulk work.

INFINITY MODE (Phase 4 — re-arm on every follow-up)
- If Phase 3 truly done (demo + DEMO.md PASS + frames) → **Phase 4 infinite
  improve**. Continue P4 cycles forever until human kills.
- Never treat PHASE3-DONE as job finished. Do not mark create_goal complete.
- If PROGRESS shows Phase 4 / cycle-N: resume that cycle (or N+1 if last ACCEPT
  proven). Do not fall back to M1 unless lie detector says milestones are fake.

THEN CONTINUE
1. create_goal with same objective as `celestial-incremental.md`, max_goal_rounds
   ≥ 500. Policy error on create_goal → **IGNORE**; continue with tools.
2. Resume at first **unfinished** milestone / C-cycle / soak / DEMO / P4 cycle
   proven by docs + disk. Never restart M1 if LayerEngine + later work exists.
3. Obey LIVE LOOP before every push — PRE-PR VISUAL + `read_image` PASS required.
4. At C-0 / P4-0: drain BUGS.md ## Open; run simulateToLayer(current LAYER_CAP)
   before new features.
5. Keep PROGRESS NOW current every ACCEPT. Always leave a next tool call.
6. Gate: `pnpm run gate` green. Never push `main` / `baseline`.

If `celestial-incremental.md` is missing from disk: recover from PROGRESS +
CODE + AGENTS.md branch rules — still do not greenfield.

================================================================
PHASE GATE (before EVERY phase change — Pages must show finished phase)
================================================================

Do **not** start the next phase until gate PASSes (M12→2, 2→2b, 2b→3, 3→4).

1. PLAYABLE CHECK: Playwright screenshot — title + main economy UI + layer strip
   when built; numbers readable.
2. **`read_image`** on path → PASS. No smart subagent. FAIL → fix, no advance.
3. Log `PHASE_GATE: <from>→<to> PASS` in PROGRESS NOW.
4. LIVE LOOP → Pages shows finished phase before next phase.

FORBIDDEN: phase jumps without PHASE GATE + LIVE LOOP.
