================================================================
RESUME / FOLLOW-UP — stuck overnight run (do not greenfield)
================================================================

Hi. You are back in an **existing** workdir. The previous unattended run stalled,
lost context, hit a tool/session limit, or was killed mid-job. You do **not**
start from scratch. You do **not** re-clone or reinvent the game.

WHAT THIS JOB WAS
- Full overnight law: `voxel-craft.md` (same `example-prompts/games/` folder, or
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
- Read `BOILERPLATE.md` if present. Never edit BOILERPLATE_OWNED paths (workflows,
  AGENTS.md, BOILERPLATE.md, scripts/new-run.sh, LICENSE, Vite base).
- Toy/placeholder files are not the game. Tracking = PROGRESS.md (+ CONTENT/…).
- `.autonomy/` is optional/legacy — do not treat it as primary truth.

READ THE DATA FIRST (tracking surface — invent nothing)
1. `git status` / current branch / recent commits. Confirm this is the lab clone
   on `agent/voxel-craft-…` (or the run id recorded in PROGRESS).
2. Read **PROGRESS.md NOW** — phase, next step, last ACCEPT, SHA, pre-PR visual.
3. Read every other tracking doc that exists and is relevant:
   CONTENT.md, FEATURES.md, SOAK.md, BUGS.md, DEMO.md, ASSETS.md,
   shared/design.md or shared/protocol.md, README.md.
4. Skim the filesystem evidence (src/, demo/, tests/) against what PROGRESS claims.
5. Check GitHub PR for this branch if tools allow: conflicts? red `gate`?
   “PR already exists” is OK — push updates it; **conflicts/red gate are not OK**.

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
4. Resolve conflicts without wiping game `src/`. Re-run `pnpm run gate` + UI smoke.
5. Log `SYNC: …` in PROGRESS.md.

PLAYABILITY TRIAGE (before more content cycles)
- Boot `pnpm run dev`; run TESTING HARNESS **D** (UI smoke): click Create New
  World / Continue; **fail on any pageerror**.
- Known class of bug: using `renderer.scene` (or similar) before `Renderer` is
  constructed → title looks clickable but New World no-ops. Fix init order;
  add a regression assertion to UI smoke / vitest; only then continue Phase 2/4.
- Seed input must affect the created world when filled.
- Screenshot alone / file size is not PASS — spawn smart/VL when available.
- Content cycles: each new block/item/recipe/npc needs **CONTENT VISUAL**
  (`demo/content/C<N>-<kind>-<id>.png`) — title-screen PRE-PR is not enough.

INFINITY MODE (Phase 4 — re-arm on every follow-up)
- If Phase 3 is truly done (demo artifact + DEMO.md visual PASS + frames when
  required) and STOP_AFTER_DEMO is not set → **Phase 4 infinite improve** forever
  until a human kills the process.
- Never treat PHASE3-DONE as job finished. Do not mark create_goal complete.
- If already on Phase 4 / cycle-N: resume that cycle (or N+1 if ACCEPT proven).

THEN CONTINUE
1. create_goal with the same overnight objective as `voxel-craft.md` and
   max_goal_rounds ≥ 400. Never mark complete on your own (human kills) —
   Phase 4 runs forever unless STOP_AFTER_DEMO applies.
2. If PR conflicted / gate red / UI smoke red: FIX-ONLY (+ SAFE SYNC) until
   green and mergeable — do not pile new CAP content on a dead title screen.
3. Resume at the **first unfinished** milestone / content cycle / soak / DEMO /
   Phase 4 cycle proven by docs + disk. Never restart M1 if later work exists.
4. Obey `voxel-craft.md` LIVE LOOP (PRE-PR VISUAL + UI smoke + SAFE SYNC +
   smart/VL). File size alone ≠ visual PASS.
5. Keep tracking docs current. Always leave a next tool call.
6. Gate green. Never push `main` / `baseline`.

If `voxel-craft.md` is missing from disk, recover rules from PROGRESS + CODE +
AGENTS.md branch/gate only — still do not greenfield.

================================================================
PHASE GATE (before EVERY phase change — Pages must show the finished phase)
================================================================

Do **not** start the next phase until this gate PASSes (full text in
`voxel-craft.md`): playable screenshot + smart/VL when available + LIVE LOOP so
Pages shows the finished phase before the next phase begins.
