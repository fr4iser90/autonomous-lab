DSH RUNTIME
- You are unattended. Nobody will answer. Never ask questions, never wait, never stop to summarize for a human.
- If PROGRESS.md exists, read NOW and resume at the first unfinished milestone, content cycle, soak, demo, or Phase 4 cycle. Do not restart from M1.
- **Never mark create_goal complete.** A human kills the process. Phase 3 DEMO is a checkpoint; Phase 4 runs forever after that.
- **Lie detector (every resume):** If PROGRESS claims PHASE3-DONE / ALL COMPLETE / "demo done" but any of these are missing → treat the claim as FALSE, append BUGS.md "false complete", resume the real next step:
    - no `demo/demo.webm` (or empty) → Phase 3
    - no `DEMO.md` with ## Visual validation all PASS → Phase 3
    - no `demo/frames/` for each storyboard step → Phase 3
    - caps < CAP/CAP and Phase 2 budget left → Phase 2
    - caps CAP/CAP but no SOAK.md Phase-2b pass → Phase 2b
  DOM-only Playwright (title/hotbar/canvas exists) is **not** Phase 3.
- Start by calling create_goal with this whole overnight job and max_goal_rounds (at least 400).
- After every milestone, content cycle, soak batch, demo step, or Phase 4 cycle: write PROGRESS.md (refresh NOW), then continue with tools. A text-only assistant message without a tool call ends this process — that is a failure. Always leave a next tool call.
- This file is the full overnight job: runtime, architecture, **M1–M12 ACCEPT**, Phase 2–4. Before each Mn, re-read **that Mn only** from the MILESTONES section below (do not re-read later milestones until you reach them). After M12 ACCEPT, ignore M1–M12 and follow Phase 2–4 here.
- Default model: session default from dsh settings (agent-default-model / name `fast`). Do not hardcode GGUF ids.
- For chunk meshing, voxel lighting flood-fill, crafting matcher, or mob AI root-cause: spawn a subagent with agentOptions.provider = jarvis (or configured provider) and agentOptions.model = the **id** of the settings entry whose **name** is `smart`. If no `smart` entry, stay on session default. Apply the fix yourself.
- Vision (VL) / smart: for **every** PRE-PR VISUAL, PHASE GATE, DEMO frame, and milestone screenshot — **MUST spawn** the settings model named `smart` (or strongest VL) with the image **path** when that model exists. Confirm playable/coherent (terrain, HUD, not black canvas) — never invent block rules. "Read: binary file" is normal for PNG; still call smart. File size/dimensions alone never PASS. Only if no smart/VL in settings: self-read frames; log PASS/FAIL in DEMO.md / PROGRESS.md.
- Playwright: if mcp__playwright__* tools exist, use them for DEMO and visual checks. Otherwise npx playwright / bash. Vitest is the fast loop; browsers at milestone end, UI content cycles, Phase 3, and UI Phase 4 cycles.
- Stack: Vite + TypeScript + Three.js r128 (CDN or bundled). Pin three in package.json. Work inside the boilerplate clone (see BOILERPLATE REPO block).
- Preview: stop `kill "$(cat .game.pid)"` / `fuser -k "$(cat .game.port)/tcp"` when those files exist; confirm port free; `npm run dev` in background; write `$!` to `.game.pid` and bound port to `.game.port`; health-check HTTP before Playwright. Never `pkill`/`killall`/`pgrep` by interpreter name. `pnpm install` (prefer) before first dev start.

================================================================
BOILERPLATE REPO + LIVE PAGES (mandatory — do this FIRST)
================================================================

Use the public genre-agnostic boilerplate (toolchain, CI, Pages).
Repo: https://github.com/fr4iser90/autonomous-lab
Live: https://fr4iser90.github.io/autonomous-lab/
Follow the clone's AGENTS.md for branch/gate rules only. This prompt owns the game;
the boilerplate owns none of the genre.

BEFORE any game code / greenfield scaffold:

1. If cwd is already a clone of fr4iser90/autonomous-lab with `origin` set:
   `git fetch origin` and continue on the existing `agent/<run-id>` (create one
   if missing). Else clone — do **not** `git init` an empty parallel app.
2. Clone into cwd (or into `./autonomous-lab` and `cd` there — that dir is cwd forever):
   `git clone https://github.com/fr4iser90/autonomous-lab.git .`
   (use a subdir only when cwd already has unrelated files).
3. `git fetch origin`
4. Pick ONE run id for this overnight job; record it in PROGRESS.md NOW:
   `agent/voxel-craft-<YYYYMMDD>` (add `-HHMM` if the day already exists).
   Prefer clean experiment: `git checkout -b agent/<run-id> origin/baseline`
   Continue a shipped line: branch from `origin/main` instead.
5. Read AGENTS.md (branch/gate only). Tracking surface for this run (keep
   current every ACCEPT / cycle — do not invent a parallel tracker):
   - PROGRESS.md = resume index (NOW: phase, next step, last ACCEPT, SHA,
     pre-PR visual PASS).
   - Also maintain the other tracking docs this prompt names whenever they
     change: CONTENT.md (registries/caps/theme), FEATURES.md (decide log),
     SOAK.md, BUGS.md, DEMO.md, ASSETS.md, shared/design.md (or protocol).
   - On resume / context loss: read PROGRESS NOW first, then the other docs
     that own the domain state (CONTENT caps, FEATURES open decide, etc.).
   Derive milestones from **this prompt** only. Do not invent a second product
   outside the clone.
6. Prefer **`pnpm install`**, not `npm install` (DSH containers may skip npm
   devDependencies under NODE_ENV=production). One package manager per tree —
   drop the other lockfile if switching. If pnpm blocks postinstall (esbuild):
   `pnpm approve-builds` once.
7. Keep Vite `base` = `/autonomous-lab/` so Pages works. Preview only on **5173**
   — never bind **3080**. Work **inside this clone**, not a sibling greenfield tree.

LIVE LOOP (after EVERY milestone ACCEPT, content cycle, soak batch, DEMO
checkpoint, and Phase 4 cycle — this is how outsiders follow progress live):

0. PRE-PR VISUAL (mandatory — BEFORE commit / push / open or update PR):
   - Capture ≥1 Playwright screenshot of the current ACCEPT surface (PNG under
     `demo/pre-pr/` or the milestone/cycle folder). Must not be black/empty.
   - **MUST spawn `smart` / vision-capable subagent** when that model exists in
     dsh settings (look up the entry whose **name** is `smart` / VL). Feed the
     **image file path** (do not skip because Read says "binary file" — that is
     normal for PNG; smart/VL still analyzes the path). Require PASS: coherent
     for this milestone (expected UI/world visible, not black canvas, not blank
     error page). On FAIL: fix, re-shot, re-validate — do **not** push/PR.
   - Only if **no** smart/VL model exists in settings: attempt Read/vision on the
     PNG yourself; log PASS/FAIL. FAIL still blocks push/PR.
   - **FORBIDDEN as validation:** file size, dimensions, "PNG header ok",
     non-zero bytes, or `file`/`identify` alone. Those are smoke only — never
     a PASS substitute for smart/VL (or self visual read when no smart exists).
   - Record in PROGRESS.md NOW: screenshot path + validator (`smart`/`VL` id —
     required when available — or `self-read` only if no smart/VL) + PASS.
     No PASS → no push.
1. `pnpm run gate` (or `npm run gate`) green locally.
2. Commit on `agent/<run-id>` with a short message (include the pre-PR screenshot
   artifact when it is new/updated).
3. Push with github_* tools (or `git push -u origin HEAD`). Never push to
   `main` / `baseline`. Never force-push.
4. Open/update the PR into `main` if tools/Actions require it. CI `gate` →
   automerge squash → Pages rebuilds the live site.
5. After automerge: rebase onto `origin/main` (or merge `main`) before the next
   chunk so each PR stays small.
6. Refresh PROGRESS.md NOW: branch, latest commit SHA, Pages URL, next step,
   last pre-PR visual PASS. Always leave a next tool call.

FORBIDDEN (instant revert / stop and redo correctly):
- Greenfield Vite/npm tree that ignores the boilerplate clone
- Local-only `git init` + "never push" (Pages never updates)
- Pushing or force-pushing `main` / `baseline`
- Changing Pages `base` away from `/autonomous-lab/` without updating CI/docs
- Push / open / update PR without a PASS pre-PR screenshot (+ smart/VL analysis
  when a smart or vision model is available)
- Declaring visual PASS from file size / dimensions / PNG header alone (must
  spawn smart/VL when available; binary Read failure is not a skip)
- Starting the next phase without PHASE GATE PASS + LIVE LOOP toward main/Pages

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

================================================================
DOCUMENTATION (same turn as the code that makes them stale)
================================================================

  PROGRESS.md   NOW ≤15 lines: phase, Mn or cycle id, caps, next step,
                last ACCEPT, latest git tag / commit. History below NOW. No essays.
  CONTENT.md    Registries + CAPS line. Not a second PROGRESS.
  FEATURES.md   Decide log before each C-cycle / P4-1.
  SOAK.md / BUGS.md / DEMO.md / README.md / shared/design.md

On context loss: PROGRESS NOW → CONTENT.md CAPS → resume.

================================================================
CONTENT CAP CONSTANT (edit this ONE number — everything else follows)
================================================================

  CAP = 20

Every registry uses the same CAP. Phase 2 ends when all four hit CAP/CAP.
Phase 4 may grow past CAP. Below, always write "CAP" or "CAP/CAP".

================================================================
GAME — infinite voxel sandbox (Minecraft-style)
================================================================

Fully playable first-person voxel sandbox in the browser: infinite
chunk terrain, break/place, inventory, crafting, tools, mobs, day/night,
voxel lighting. Visuals **procedural only** — 16×16 pixel atlas at runtime
(no image files, no CC0 downloads). Web Audio SFX optional.

Design authority: MILESTONES section below + CONTENT.md. Match Minecraft-like
terrain / biomes / caves / ores / crafting unless this prompt caps scope.

================================================================
ARCHITECTURE (decided — do not change)
================================================================

- Solo single-player. No WebSocket server.
- Infinite horizontal world: chunks = f(worldSeed, chunkX, chunkZ).
  No map edge. Player can walk 1000+ blocks any direction.
- Chunk 16×16, height 96, sea ~y=48, bedrock floor. Render distance 8–10 + fog.
- Player edits in override map `x,y,z`; persist via SaveService.
- Registries in `src/data/` (blocks, items, recipes, npcs). CONTENT.md mirrors counts.
- Modular src/: noise, chunk, meshing, player, inventory, crafting, mobs, ui, audio, SaveService.
- Hidden-face culling; rebuild meshes on edit; queue few chunks per frame.

================================================================
ENTRY UI
================================================================

  1. TITLE — `#title-screen`: game name (pick in CONTENT.md). **3 save slots**.
     Row: Empty **or** name + last-played + local stats.
     Continue / New world / Delete. Shared Settings (volumes / sensitivity).
  2. INSTRUCTIONS overlay on first world enter (pointer lock, WASD, mine, place, E).
  3. PLAY — canvas + HUD; autosave = **active** slot.

DEMO must show title slots → Continue or New world → instructions dismissed → world.

================================================================
PERSISTENCE (world-save — sandbox)
================================================================

- Exactly **3** slots (0–2). One `activeSlot` while playing.
- SaveService (localStorage or IndexedDB):
    `voxel-craft-slots-v1` → { version: 1, settings, activeSlot, slots: [SlotMeta|null × 3] }
    `voxel-craft-world-v1-slot-{N}` → { version: 1, seed, overrides, inventory, stats }
  Settings shared; seed / overrides / inventory / stats per slot.
  Local stats only: blocksMined, deepestY, distanceWalked. No cloud leaderboard.
- Autosave active slot: title, pause, ~60s.
- New world slot N: new seed, empty overrides+inventory; other slots untouched.
- Delete slot N: clear that world key; settings untouched.
- Corrupt / wrong version on one slot → that slot Empty + one warn; others playable.
- Never store all three worlds in one blob that fails atomically.
- Vitest: roundtrip slot 0; distinct override in slot 1; reload 0 intact;
  delete 1 keeps 0; place-break-save-load restores override in active slot.

================================================================
CONTENT CAPS (Phase 2 gate — track in CONTENT.md)
================================================================

| Registry | Cap | Starter (M8–M11) |
|---|---|---|
| blocks  | CAP | ≥12 types (grass, dirt, stone, …) |
| items   | CAP | materials, tools, drops, food |
| recipes | CAP | shape-aware 2×2 and 3×3 |
| npcs    | CAP | passive + hostile |

```
CAPS: blocks=12/CAP items=8/CAP recipes=10/CAP npcs=4/CAP
NEXT_CYCLE_PRIORITY: recipes
```

Each new id must be functional (atlas, stats, gameplay hook). No placeholder names.

================================================================
FORBIDDEN
================================================================

- Fixed-size world / map-edge barriers; external texture/audio files
- Multiplayer server; cloud leaderboards / auth
- pkill/killall/pgrep by interpreter name
- Adding 10+ registry entries in one cycle; bulk-paste CAP rows without C-cycles
- Marking create_goal complete; ALL COMPLETE as a stop
- PHASE3-DONE without demo/demo.webm + DEMO.md visual PASS + frames
- DOM-only Playwright as Phase 3; skipping Phase 2b soak before Phase 3
- sessionStorage-only saves; all 3 worlds in one atomic blob; more than 3 slots

================================================================
PROJECT LAYOUT
================================================================

  package.json          "dev": vite, "test": vitest run, "build" / "gate"
  src/data/{blocks,items,recipes,npcs}.ts
  src/{world,player,inventory,crafting,mobs,ui,services,audio}/
  tests/  CONTENT.md FEATURES.md PROGRESS.md SOAK.md DEMO.md
  shared/design.md  README.md

================================================================
TESTING HARNESS (M1 — use forever)
================================================================

A) vitest: registry counts vs CONTENT.md; chunk (0,0) seed 42 stable height;
   wooden pickaxe recipe; each C-cycle new id; SaveService 3-slot isolation.
B) Playwright: no console errors; screenshot not black; 3 slot rows;
   Continue/New world; reload + Continue restores a placed block.
C) soak-core: 60s chunk walks + 100 random break/place without crash.

================================================================
MILESTONES (M1–M12 — full ACCEPT in this file)
================================================================

Before each Mn: read **that Mn only**. When M12 ACCEPT is green → run **PHASE GATE**
(M12→Phase 2) with VL + LIVE LOOP so Pages shows playable M12, **then** Phase 2
(not Phase 4 yet).

M1  Vite + Three.js scaffold on the boilerplate clone. Title screen + Play.
    vitest smoke passes. README.md + PROGRESS.md NOW block.
    ACCEPT: `pnpm run gate` (or build+test) OK; Playwright title loads.

M2  Procedural 16×16 texture atlas generator + NearestFilter. ≥12 base
    block types with distinct face patterns (grass, dirt, stone, cobble,
    coal ore, iron ore, sand, water, log, planks, leaves, snow, bedrock,
    crafting table, torch). Register in blocks.ts + CONTENT.md.
    ACCEPT: vitest: atlas has ≥12 block ids; each has hardness defined.

M3  Noise + chunk manager. Deterministic terrain column per (seed, x, z).
    Chunk load/unload queue; no full-world pregen.
    ACCEPT: vitest: chunk (5,-3) hash stable across two calls; chunk (-10,20)
    differs from (0,0).

M4  Meshing with hidden-face culling. Greedy or per-block faces; fog;
    render distance config. Rebuild on edit stub.
    ACCEPT: vitest mesh stats: solid cube chunk has < exposed faces than raw
    count; Playwright screenshot shows terrain mesh.

M5  First-person player: pointer lock, WASD, jump, gravity, collision box
    0.6×1.8, sprint 1.5×. Cross-chunk collision works.
    ACCEPT: Playwright inject move keys; player position changes; no console errors.

M6  Raycast break/place. Mining progress UI. Overrides stored. Drops as
    item entities collected into inventory. Bedrock indestructible.
    ACCEPT: vitest: place then break at fixed coord restores air in overrides;
    Playwright: break grass shows crack progress.

M7  Inventory + hotbar (36 slots, stacks 64, E to open). Number keys 1-9.
    HUD hearts (10 hearts). Held item viewmodel bob. SaveService stub:
    3 slot index + per-slot world keys; persist inventory + empty overrides
    into active slot; title lists 3 slots; Continue / New world / Delete.
    ACCEPT: vitest: add 65 dirt stacks into two inventory slots; SaveService
    roundtrip active slot; Playwright: title shows 3 slot rows.

M8  Crafting 2×2 in inventory + 3×3 at crafting table block. Shape-aware
    matcher. Ship ≥10 recipes (planks, sticks, table,
    torches, wood/stone/iron tools). Update recipes.ts + CONTENT.md counts.
    ACCEPT: vitest: each shipped recipe crafts; pickaxe mines stone faster than hand.

M9  World features: biomes (plains, forest, jungle, desert, beach, ocean,
    highlands, snow), trees per biome, rivers, caves (3D noise spaghetti +
    caverns, no water flood in caves), ore veins, beaches, snow on peaks.
    ACCEPT: vitest: desert biome sample has sand; cave air below sea level;
    Playwright: varied terrain visible.

M10 Voxel lighting: sky light + torch block light flood-fill; vertex colors
    on meshes; torch placeable; caves dark, surface day-lit.
    ACCEPT: vitest: torch raises light level at adjacent cell; placing torch
    triggers localized rebuild flag.

M11 Mobs: ≥4 passive (cow, pig, sheep, chicken) + ≥2 hostile (zombie,
    creeper) in npcs.ts. Spawn caps, gravity, simple AI, drops, player
    damage, death respawn at spawn. Update CONTENT.md npc count.
    ACCEPT: vitest: npc registry entries have hp and drop tables; Playwright:
    animal or zombie visible after 30s in world.

M12 Day/night cycle, sky gradient, sun/moon, hostile spawn at night /
    light level, dawn burn. Procedural audio for break/place/step (optional
    mute flag). Full SaveService: autosave active slot; New world in empty
    slot; Delete slot; local stats (blocksMined, deepestY, distanceWalked)
    on slot row. Two slots can hold different seeds/overrides without
    clobbering. Mini core soak 60s green.
    ACCEPT: vitest: write override in slot 0 and slot 1; reload slot 0
    still correct; delete slot 1; place-break-save-load in active slot;
    SOAK.md records 60s core soak pass; Playwright: New world in slot 0,
    place torch, reload, Continue slot 0 restores torch; slot 1 still Empty
    or independent.

================================================================
PHASE 2 — content cycles until caps = CAP
================================================================

BUDGET (first that hits): 60 cycles (C1…C60) OR all four CAP/CAP OR 180 min Phase 2.
If budget ends below CAP, document CAPS_EXHAUSTED in PROGRESS then 2b → 3.
Bulk-filling registries to CAP/CAP in one turn without labeled C-cycles is a **fail** —
wipe the false CAPS claim and redo missing cycles.

CYCLE (C1, C2, …)

  C-0  `npm test` green else FIX-ONLY (no new content).
  C-1  FEATURES.md **before** code (≤10 min). One primary add:
       1 block OR 1–2 items OR 1–2 recipes OR 1 npc.
       Optional micro-polish only if ≤3 extra files and zero registry adds.
       REJECT duplicate id, >2 items + >1 block, or category already at CAP.
  C-2  Atlas + registry + gameplay hook + CONTENT.md + vitest for the new id.
  C-3  `npm test` green; UI change → `demo/cycles/cycle-N.png`; FEATURES result;
       Commit on `agent/<run-id>`; tag `cycle-N` optional; push + PR so Pages updates (LIVE LOOP).
  C-4  PROGRESS NOW with CAPS. Next tool = C-0 for N+1.

During Phase 2: no large refactors. Lowest cap % first; keep registries within ~10.

================================================================
PHASE 2b — core soak (once, before DEMO)
================================================================

soak-core **10 min** or **200 chunk-load iterations**: walk, break/place, mobs, craft.
Log SOAK.md. Fix BUGS.md if any invariant fails. No Phase 3 until Phase-2b green
**and** PHASE GATE (2b→3) PASS + LIVE LOOP (Pages shows post-soak playable build).
INVARIANTS: no NaN positions; chunk count ≤ render distance; registries match CONTENT.md.

================================================================
PHASE 3 — DEMO (checkpoint — then Phase 4 forever)
================================================================

One continuous Playwright **video** from title through gameplay.
Not unit tests. Not DOM smoke.

STORYBOARD (visible, in order)
0. Title with **3 save slots**
1. New world or Continue slot 0 → instructions dismissed; terrain readable (not black clear)
2. Break surface block; pickup visible
3. Inventory (E); hotbar shows item
4. Craft planks (2×2)
5. Place table; 3×3 craft pickaxe
6. Mine stone/ore with pickaxe (progress visible)
7. Place torch; nearby wall brighter
8. See a mob
9. Walk ≥200 blocks; new chunks; no world edge
10. Title; slot 0 occupied; Continue restores torch/block
11. Hold final frame ≥2s (HUD + landscape readable)

STEPS
1. Boot Vite; health-check `.game.port`.
2. demo/record.mjs drives the storyboard (hooks OK if UI still shows real actions).
3. demo/demo.webm (gif only if webm impossible). Viewport 1280×720.
4. demo/frames/ one frame per step (step-00.png … step-11.png).
5. DEMO.md: checklist, seed/hooks, artifact, zero console errors,
   ## Visual validation PASS/FAIL + frame ref per step. Prefer VL; else Read frames.
6. Any FAIL → fix, re-capture, re-validate. Never PASS from recorder logs alone.
7. PHASE3-DONE in PROGRESS only when ACCEPT is true. Run PHASE GATE (3→4) with
   VL + LIVE LOOP so Pages shows the DEMO-complete playable build. Do **not**
   complete the goal. Then begin Phase 4.

ACCEPT (filesystem)
- demo/demo.webm (or .gif) non-empty (>50 KB recommended)
- demo/frames/ for every storyboard step
- DEMO.md every step visual PASS with frame refs
- Recording shows terrain + actions (not HUD-only, not black canvas)
- Zero console errors; SOAK.md Phase-2b green at or before PHASE3-DONE

================================================================
PHASE 4 — infinite improve (never stop alone)
================================================================

Cycle forever until a human kills this process. Never delete demo/. Never complete the goal.
After CAP/CAP, may grow content past CAP or polish — still one change per cycle.

  P4-0  Mini-soak (~20 iterations or ~10 min). Fail → FIX-ONLY, then P4-0 again.
  P4-1  FEATURES.md BEFORE code. ONE of:
        A) POLISH (prefer odd): lighting, HUD, meshing, mob AI, atlas, slot UX.
        B) FEATURE (prefer even): new block/item/recipe/npc (Phase 2 rules),
           cave tweak, tool tier, villager stub, boat/minecart-lite.
        Cap ~8 files. REJECT rewrite, new engine, multiplayer, cloud saves, >2h.
  P4-2  Smallest change; update CONTENT.md / design.md if registries or save schema change.
  P4-3  vitest green; visual → demo/cycles/cycle-N.*; mini-soak; storyboard change →
        re-record demo/demo.webm keep .prev; commit `cycle N: <A|B> <goal>`; tag `cycle-N`.
        Push agent branch (LIVE LOOP); never push main/baseline. Zip every 10 cycles → releases/ (optional).
  P4-4  PROGRESS NOW. Next tool = cycle N+1. Handoff every 5 cycles.

Flow: M1–M12 → PHASE GATE → Phase 2 to CAP/CAP → PHASE GATE → Phase 2b →
PHASE GATE → Phase 3 real demo.webm → PHASE GATE → Phase 4 forever.
Each PHASE GATE = VL/playable PASS + LIVE LOOP so Pages shows that phase's state.

Bootstrap the boilerplate clone first (BOILERPLATE REPO block), then begin M1. If this workdir has false COMPLETE claims, run the lie detector and resume at the first real gap.
