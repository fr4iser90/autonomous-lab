================================================================
RESUME / FOLLOW-UP — stuck overnight run (do not greenfield)
================================================================

Hi. You are back in an **existing** workdir. The previous unattended run stalled,
lost context, hit a tool/session limit, or was killed mid-job. You do **not**
start from scratch. You do **not** re-clone or reinvent the game.

WHAT THIS JOB WAS
- Full overnight law: `voxel-craft.md` (same `lab/examples/games/` folder, or
  already applied in this checkout). Re-open that file for ACCEPT, LIVE LOOP,
  SAFE SYNC, TESTING HARNESS, architecture, and Phase rules — this follow-up
  only tells you **how to resume**.
- Game: VoxelCraft — first-person voxel sandbox (Minecraft-style)
- Branch pattern: `agent/voxel-craft-*` (use the existing run branch in PROGRESS /
  git; do not invent a second product tree)
- Stack: Vite + TypeScript + Three.js (procedural atlas; solo; 3 save slots)
- Planned arc: M1–M12 → Phase 2 content cycles to CAP/CAP → Phase 2b soak →
  Phase 3 DEMO video → Phase 4 infinite improve

BOILERPLATE OWNERSHIP (resume)
- Read `lab/BOILERPLATE.md` if present. Never edit BOILERPLATE_OWNED paths (workflows,
  AGENTS.md, BOILERPLATE.md, scripts/new-run.sh, LICENSE, Vite base).
- Toy/placeholder files are not the game. Tracking = PROGRESS.md (+ CONTENT/…).
- `.autonomy/` is optional/legacy — do not treat it as primary truth.

create_goal POLICY (critical)
- Try create_goal once if you want. If it errors with **requires a direct human
  turn** / **top-level agent** / similar → **IGNORE completely**.
- That is a harness restriction, **not** a request for human input.
- Do **not** stop, summarize as done, or wait. Continue cycles with tools.
- Never mark create_goal complete. Human kills the process. Idle nudge keeps
  the session alive.

READ THE DATA FIRST (tracking surface — invent nothing)
1. `git status` / current branch / recent commits. Confirm this is the lab clone
   on `agent/voxel-craft-…` (or the run id recorded in PROGRESS).
2. Read **PROGRESS.md NOW** — phase, next step, last ACCEPT, SHA, pre-PR visual.
3. Read **BUGS.md ## Open** — drain blocker/playability (incl. merge/gate notes
   from BUGS / validate role) before new content.
4. Read every other tracking doc that exists and is relevant:
   CONTENT.md, FEATURES.md, SOAK.md, DEMO.md, ASSETS.md,
   shared/design.md or shared/protocol.md, README.md.
5. Skim the filesystem evidence (src/, demo/, tests/) against what PROGRESS claims.
6. Check GitHub PR for this branch if tools allow: conflicts? red/`Expected`
   `gate`? stuck Actions queue? “PR already exists” is OK — push updates it;
   **conflicts / missing green gate are not OK** — SAFE SYNC + FIX-ONLY first.

- Lie detector: if PROGRESS claims PHASE3-DONE / ALL COMPLETE / "demo done" but
  demo/demo.webm missing/empty, DEMO.md visual not all PASS, demo/frames/ incomplete,
  caps < CAP/CAP with Phase 2 budget left, or no SOAK.md Phase-2b pass → treat as FALSE,
  append BUGS.md "false complete", resume the real gap. DOM-only Playwright ≠ Phase 3.

SAFE SYNC FIRST (no work loss — see `voxel-craft.md` SAFE SYNC)
1. `git fetch origin`
2. Commit or stash WIP; create `backup/<run-id>-<shortSHA>` at HEAD **before**
   any merge/rebase.
3. If behind `origin/main` OR PR reports conflicts: **merge `origin/main`**
   (preferred) or rebase with backup + later `push --force-with-lease` on
   `agent/*` only. Never `reset --hard` to main. Never delete agent commits.
4. Resolve conflicts without wiping game `src/`. **README:** keep Lab header from
   main; keep/refresh `# Current run` for VoxelCraft. **PROGRESS:** keep agent NOW.
5. Re-run `pnpm run gate` + UI smoke. Confirm PR checks: `gate` must report
   success (not forever “Expected — Waiting for status”).
6. Log `SYNC: …` in PROGRESS.md.

PLAYABILITY TRIAGE (before more content cycles)
- Drain BUGS.md ## Open (blocker/playability) first — then boot `pnpm run dev`.
- Run TESTING HARNESS **D** (UI smoke): click Create New
  World / Continue; **fail on any pageerror**. On FAIL → append + **commit**
  BUGS.md on `agent/*`, FIX-ONLY.
- **PLAY CHECK** (see `voxel-craft.md`): Phase 4 every **5** cycles, Phase 2
  every **10** — in-world 30–60s, `demo/play-check/…png`, **`read_image`**. Do
  not skip because a separate VL validator exists.
- Known class of bug: using `renderer.scene` (or similar) before `Renderer` is
  constructed → title looks clickable but New World no-ops. Fix init order;
  add a regression assertion to UI smoke / vitest; only then continue Phase 2/4.
- Seed input must affect the created world when filled.
- Screenshot alone / file size is not PASS — call **`read_image`** on the PNG
  path, then judge (no vision subagent; do not use plain `Read` on PNG).
- Content cycles: each new block/item/recipe/npc needs **real in-engine**
  CONTENT VISUAL (`demo/content/C<N>-<kind>-<id>.png` from `#game-canvas` while
  playing). HTML/NPC-stat tables / RGB swatch boards = FAIL — redo with rendered
  meshes. Title-screen PRE-PR is not enough.
- Validation: `lab/roles/validate.md` via Followup cadence.

INFINITY MODE (Phase 4 — re-arm on every follow-up)
- If Phase 3 is truly done (demo artifact + DEMO.md visual PASS + frames when
  required) and STOP_AFTER_DEMO is not set → **Phase 4 infinite improve** forever
  until a human kills the process.
- Never treat PHASE3-DONE as job finished. Do not mark create_goal complete.
- If already on Phase 4 / cycle-N: resume that cycle (or N+1 if ACCEPT proven).
- Every P4-0: BUGS.md ## Open before new polish/feature. Every **5** cycles:
  **PLAY CHECK** must PASS before P4-1 (not optional; not delegated to VL agent).

THEN CONTINUE
1. create_goal optional; on policy error → ignore (see above). Never mark
   complete. Phase 4 forever unless STOP_AFTER_DEMO.
2. If open blocker/playability / PR conflicted / `gate` missing or red / UI smoke
   red: FIX-ONLY (+ SAFE SYNC) until green and mergeable — do not pile new CAP
   content on a dead title screen or a dirty PR.
3. Resume at the **first unfinished** milestone / content cycle / soak / DEMO /
   Phase 4 cycle proven by docs + disk. Never restart M1 if later work exists.
4. Obey `voxel-craft.md` LIVE LOOP (PRE-PR VISUAL + UI smoke + SAFE SYNC +
   `read_image`). File size alone ≠ visual PASS; do not spawn smart for screenshots.
5. Keep tracking docs current. Always leave a next tool call (next P4/C cycle).
6. Gate green. Never push `main` / `baseline`.

If `voxel-craft.md` is missing from disk, recover rules from PROGRESS + CODE +
lab/AGENTS.md branch/gate only — still do not greenfield.

================================================================
PHASE GATE (before EVERY phase change — Pages must show the finished phase)
================================================================

Do **not** start the next phase until this gate PASSes (full text in
`voxel-craft.md`): playable screenshot + **`read_image`** (no vision subagent) +
LIVE LOOP so Pages shows the finished phase before the next phase begins.

VALIDATION: obey `lab/roles/validate.md` on Followup cadence (`lab/roles/followup.md`); do not use separate *-VL-validation prompts.
