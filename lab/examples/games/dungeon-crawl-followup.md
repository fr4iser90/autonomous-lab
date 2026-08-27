================================================================
RESUME / FOLLOW-UP — stuck overnight run (do not greenfield)
================================================================

Hi. You are back in an **existing** workdir. The previous unattended run stalled,
lost context, hit a tool/session limit, or was killed mid-job. You do **not**
start from scratch. You do **not** re-clone or reinvent the game.

WHAT THIS JOB WAS
- Full overnight law: `dungeon-crawl.md` (same `lab/examples/games/`
  folder, or already applied in this checkout). Re-open that file for ACCEPT,
  LIVE LOOP, **VISUAL SPEC FIRST**, Three.js kits/PCG architecture, and Phase
  rules — this follow-up only tells you **how to resume**.
- Game: **Ashen Delve** — Three.js dungeon crawler (procedural rooms, mob kits,
  InstancedMesh props, shared Animator; ≤2 glTF total)
- Branch pattern: `agent/dungeon-crawl-*` (use existing run branch in PROGRESS /
  git; do **not** invent `agent/*-rebased` or a second product tree)
- Stack: Vite + TypeScript + Three.js (no Phaser mid-run)
- Planned arc: M1–M12 → Phase 2 CAP/CAP → Phase 2b soak → Phase 3 DEMO →
  Phase 4 infinite

BOILERPLATE OWNERSHIP (resume)
- Read `lab/BOILERPLATE.md` if present. Never edit BOILERPLATE_OWNED paths.
- Toy `src/economy.ts` is not the game. Tracking = PROGRESS.md (+ CONTENT/…).
- `.autonomy/` is optional/legacy — do not treat as primary truth.

create_goal POLICY (critical)
- Try create_goal once if you want. If it errors with **requires a direct human
  turn** / **top-level agent** / similar → **IGNORE completely**.
- Do **not** stop, summarize as done, or wait. Continue cycles with tools.
- Never mark create_goal complete. Human kills the process.

READ THE DATA FIRST (tracking surface — invent nothing)
1. `git status` / current branch / recent commits. Confirm lab clone on
   `agent/dungeon-crawl-…` (or run id in PROGRESS).
2. Read **PROGRESS.md NOW** — phase, Mn/cycle, CAPS, deepest floor, last ACCEPT,
   SHA, pre-PR visual.
3. Read **BUGS.md ## Open** — drain blocker/playability first.
4. Read CONTENT.md, FEATURES.md, SOAK.md, DEMO.md, ASSETS.md, shared/design.md,
   README `# Current run`.
5. Skim `src/systems/DungeonPCG*`, `src/kits/`, `src/render/` against PROGRESS.
6. Check GitHub PR if tools allow: conflicts? red `gate`? After Actions land,
   tip may equal `main` — fetch and continue on **same** branch.

- Lie detector: PHASE3-DONE without demo + DEMO.md visual PASS + frames → FALSE.
- Lie detector: CAP/CAP without SOAK Phase-2b → FALSE.
- Lie detector: M2+ without design.md VISUAL SPEC → M1 gap.
- Lie detector: black WebGL claimed PASS → FALSE; fix lighting/camera.

SAFE SYNC FIRST (see `dungeon-crawl.md` SAFE SYNC)
1. `git fetch origin`
2. Commit or stash WIP; `backup/<run-id>-<shortSHA>` before merge/rebase.
3. If behind main or CONFLICTING: merge `origin/main` (preferred). Keep agent
   `src/` + run docs; Lab README header from main.
4. Prefer `git reset --hard origin/agent/<run-id>` only after Actions sync —
   never invent a second branch to “fix conflicts”.
5. `pnpm run gate` + UI smoke. Log `SYNC:` in PROGRESS.

THEN CONTINUE
1. create_goal with same objective as `dungeon-crawl.md`, max_goal_rounds ≥ 500.
   Policy error → IGNORE; continue with tools.
2. Resume at first **unfinished** milestone / C-cycle / soak / DEMO / P4 cycle
   proven by docs + disk. Never restart M1 if dungeon + kits already exist
   (unless lie detector says visual spec is fake).
3. Obey LIVE LOOP — PRE-PR VISUAL + `read_image` PASS required.
4. At C-0 / P4-0: drain BUGS; PLAY CHECK on schedule.
5. Keep PROGRESS NOW current. Always leave a next tool call.
6. Gate: `pnpm run gate` green. Never push `main` / `baseline`.

If `dungeon-crawl.md` is missing from disk: recover from PROGRESS + CODE +
AGENTS.md — still do not greenfield.

================================================================
PHASE GATE (before EVERY phase change)
================================================================

Do **not** start the next phase until gate PASSes (M12→2, 2→2b, 2b→3, 3→4).

1. PLAYABLE CHECK: Playwright — title + in-dungeon WebGL (not black) + HUD.
2. **`read_image`** → PASS. No smart subagent.
3. Log `PHASE_GATE: <from>→<to> PASS` in PROGRESS NOW.
4. LIVE LOOP → Pages shows finished phase before next phase.

FORBIDDEN: phase jumps without PHASE GATE + LIVE LOOP.
