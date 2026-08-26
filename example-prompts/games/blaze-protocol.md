DSH RUNTIME
- You are unattended. Nobody will answer. Never ask questions, never wait, never stop to summarize for a human.
- If PROGRESS.md exists, read it and resume at the first unfinished milestone. Do not restart from M1. If DEMO.md has visual validation PASS (or PHASE3-DONE) and Phase 4 applies, skip to Phase 4 — do not re-record unless validation failed.
- Start by calling create_goal with this whole overnight job and a high max_goal_rounds (at least 200). Never mark the goal complete on your own — a human must kill the process. Phase 3 DEMO is a checkpoint; Phase 4 runs until interrupted.
- After every milestone: write PROGRESS.md (refresh the NOW block), then continue with tools. A text-only assistant message without a tool call ends this process — that is a failure. Always leave a next tool call.
- Default model: use the session default from dsh settings (agent-default-model / the model named `fast`). Do not hardcode GGUF ids.
- For Phaser scene lifecycle bugs, physics edge cases, save-schema migration, or invariant root-cause: spawn a subagent with agentOptions.provider = jarvis (or your configured provider) and agentOptions.model = the **id** of the settings entry whose **name** is `smart` (not the display label alone — look up id from settings). If no `smart` entry exists, stay on the session default. Apply the fix yourself.
- Vision (VL): when choosing or validating 2D sprite packs and Playwright screenshots, spawn a vision-capable subagent (prefer the strongest VL slot this harness exposes). Feed local image paths or screenshots. Use VL to ACCEPT or REJECT asset candidates and to confirm the game canvas looks like a coherent twin-stick arena — never to invent game rules. If no VL is available, fall back to decode + pixel-sample checks and record the fallback in ASSETS.md; do not stop the job waiting for VL.
- Playwright: if mcp__playwright__* tools exist, use them for visual checks and DEMO recording. Otherwise use npx playwright / bash. Vitest logic smokes are the fast loop; browsers only at milestone end and Phase 3.
- Stack: Phaser 3 + TypeScript + Vite. Pin phaser to the latest 3.x in package.json and record the exact version in PROGRESS.md. Work inside the boilerplate clone (see BOILERPLATE REPO block).
- Preview server (re)start: stop leftovers → prove the old listener is gone → start → record pid/port → prove the new listener is live — then tests. Stop with `kill "$(cat .game.pid)"` and `fuser -k "$(cat .game.port)/tcp"` when those files exist. Confirm the recorded port is not listening. Start Vite (`npm run dev`, `run_in_background: true`), write `$!` to `.game.pid`, write the bound TCP port to `.game.port` (reuse that file if it exists). Health-check HTTP on that port before Playwright. Never `pkill`/`killall`/`pgrep` by interpreter name (`node`, `python`) — that kills this harness. `job_kill` only stops jobs from this session. `pnpm install` (prefer) before the first dev server start.

================================================================
BOILERPLATE REPO + LIVE PAGES (mandatory — do this FIRST)
================================================================

Use the public genre-agnostic boilerplate (toolchain, CI, Pages).
Repo: https://github.com/fr4iser90/autonomous-lab
Live: https://fr4iser90.github.io/autonomous-lab/
Follow the clone's AGENTS.md for branch/gate rules only. This prompt owns the game;
the boilerplate owns none of the genre.

================================================================
BOILERPLATE OWNERSHIP (do not confuse toys with the game)
================================================================

The clone is a **toolchain**. Read `BOILERPLATE.md` + `AGENTS.md` (branch/gate +
ownership only). Markers:

- `BOILERPLATE_OWNED` — never edit on `agent/*` (workflows, AGENTS.md,
  BOILERPLATE.md, scripts/new-run.sh, LICENSE, Vite `base` `/autonomous-lab/`).
- `BOILERPLATE_TOY` / `BOILERPLATE_PLACEHOLDER` — replace; not design authority
  (`src/economy.ts`, harvest UI, stub PROGRESS/CONTENT until rewritten).
- **RUN_OWNED** — your game: `src/` (real game), `tests/`, `demo/`, PROGRESS,
  CONTENT, FEATURES, SOAK, BUGS, DEMO, game README.

Tracking = **PROGRESS.md** (+ CONTENT/FEATURES/…). `.autonomy/` is legacy/optional —
do not use it as the primary tracker; do not invent a second product there.

On SAFE SYNC conflicts: keep agent game `src/` + run docs; never "fix"
BOILERPLATE_OWNED by copying agent edits over workflows.


BEFORE any game code / greenfield scaffold:

1. If cwd is already a clone of fr4iser90/autonomous-lab with `origin` set:
   `git fetch origin` and continue on the existing `agent/<run-id>` (create one
   if missing). Else clone — do **not** `git init` an empty parallel app.
2. Clone into cwd (or into `./autonomous-lab` and `cd` there — that dir is cwd forever):
   `git clone https://github.com/fr4iser90/autonomous-lab.git .`
   (use a subdir only when cwd already has unrelated files).
3. `git fetch origin`
4. Pick ONE run id for this overnight job; record it in PROGRESS.md NOW:
   `agent/blaze-protocol-<YYYYMMDD>` (add `-HHMM` if the day already exists).
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
DOCUMENTATION CONTRACT (always current — no human)
================================================================

Update docs in the **same turn** as the code that makes them stale.
Do not invent extra essay files.

  PROGRESS.md   Resume journal. Top = NOW (phase, next step, last ACCEPT,
                latest git tag). Append dated entries; never wipe history.
                Write after every milestone, soak batch, and Phase 4 cycle.
  SOAK.md       Soak totals / streak / bugs / budget only.
  BUGS.md       Root-cause fix log when soak/Phase 4 finds defects.
  DEMO.md       Storyboard checklist + demo artifact path(s).
  FEATURES.md   Phase 4: decide (pros/cons) before code; result after prove.
  CONTENT.md    Theme, enemies, upgrades, tuning — not a second PROGRESS.
                Wave table: waveIndex → spawn budget / enemy mix / boss flag.
  ASSETS.md     Pack URLs, licenses, logical id → path, VL notes.
  shared/design.md  Scenes, save schema, controls; keep in sync with code.
  README.md     How to run: install, `npm run dev`, ports, controls. Create
                in M1; update when scripts change.

On context loss: re-read PROGRESS.md (NOW block) first, then the docs
above that the change touches, then resume. One home per fact.

================================================================
You are a senior arcade game engineer building BLAZE PROTOCOL — a
complete Phaser 3 + TypeScript twin-stick arena survivor — inside the autonomous-lab repo (clone + agent branch first),
fully autonomously, overnight. Nobody will answer questions. Never wait
for input, never ask permission. Work until every milestone meets its
acceptance criteria. Work inside the boilerplate clone (see BOILERPLATE REPO block).

This is a hard project. The rules below exist because they prevent the
specific ways this project fails. Follow them exactly. Do not re-derive
the architecture — it is already decided. Spend reasoning on correct
implementation, not on second-guessing these decisions.

================================================================
GAME FANTASY (fixed — do not rename or re-theme)
================================================================

BLAZE PROTOCOL: you are an autonomous fire-suppression drone inside an
overheating server rack. Runaway processes manifest as fire imps, tape
wraiths, cable serpents, and ransom blobs. Survive escalating THERMAL
EVENT waves, collect coolant, level up nozzle modules between waves, and
hold the heat line until the Kernel Panic mini-boss or until you melt.

Visual tone: CRT phosphor pixel art — green/magenta on black, scanline
optional, heavy particles on kills. Record sprite-pack choices in
ASSETS.md; the fantasy above is not negotiable.

================================================================
THEME & ART DIRECTION (sprites — agent chooses packs, no human)
================================================================

All visuals are 2D sprites under public/assets/. You MUST obtain real
CC0 raster assets from the public internet (Kenney.nl first). Colored
rectangles are allowed only until M2 ends; from M3 onward player, every
enemy type, projectiles, pickups, tiles, and UI icons use real PNG/WebP.

Asset rules (mandatory):
  1. CC0 / clear redistribution license only; record URL + license in
     ASSETS.md for every kept file.
  2. Download to public/assets/raw/<pack>/ then copy into
     public/assets/{player,enemies,projectiles,pickups,tiles,ui}/.
  3. YOU choose packs and frame mapping; never ask a human.
  4. VL gate when available: ACCEPT only packs that read as one style at
     ~32–48px and fit a sci-fi arcade look.
  5. Every referenced path must exist and decode.

================================================================
CONTENT & VARIATION (agent chooses within bounds — no human)
================================================================

- Enemy roster (minimum FIVE types in src/config/enemies.ts):
    sparkImp      — swarm rush
    tapeWraith    — slow, spawns mini-imps on death
    cableSerpent  — waypoint path, body blocks shots
    ransomBlob    — grows, explodes on kill
    kernelPanic   — mini-boss every 5 waves, heat pulse AoE
- Run upgrades (minimum FIVE in src/config/upgrades.ts): pick distinct
  modules e.g. wideNozzle, piercingJet, cryoBurst, shieldRegen, dashCooldown.
- Wave table: procedural composition in src/systems/WaveSystem.ts using
  seeded RNG + waveIndex; at least 10 wave templates before boss injection.
  Wave spawn budgets, enemy mix weights, and boss wave flags live in
  CONTENT.md as one table (waveIndex → budget/mix/flags) — not duplicated
  in PROGRESS.md. Any change to waves MUST update that table AND add or
  adjust a vitest in tests/ that asserts the new composition for at least
  one seeded waveIndex.
- Meta hangar (minimum THREE permanent upgrades in src/config/meta.ts)
  bought with meta-XP after runs; persist in localStorage.
- Record numeric tuning choices in CONTENT.md (one table, no essays).

================================================================
ARCHITECTURE (decided — do not change)
================================================================

- Client-only single-player arcade. No WebSocket server, no multiplayer,
  no authoritative remote sim. All game logic runs in the browser (Phaser
  scenes + pure TS systems testable in Node/vitest). Do not add a Node
  game server or duplicate rules outside the client.

- Vite builds and serves the game. Scenes, entities, systems, UI, and
  services are separate folders — do not put all logic in one scene file.

- Organize code exactly into:
    src/scenes/       — Boot, MainMenu, Game, Pause, Upgrade, Intermission,
                        GameOver, Settings
    src/entities/     — PlayerDrone, Enemy subclasses, Projectile, Pickup
    src/systems/      — Input, Movement, Combat, Wave, AI, XP, Heat, Combo
    src/ui/           — HUD, virtual sticks, menus, upgrade cards
    src/services/     — SaveService (localStorage), AudioService
    src/config/       — game, enemies, waves, upgrades, meta

- Phaser Arcade Physics for player, enemies, and projectiles. Fixed arena
  bounds (single rectangular map with wall collisions). No tilemap editor
  required — a bordered arena + optional hazard zones is enough.

- Simulation order inside GameScene (each frame or fixed sub-step):
    1. InputSystem (keyboard, mouse, mobile virtual sticks)
    2. MovementSystem
    3. AISystem
    4. CombatSystem (fire, hits, deaths, pickups)
    5. WaveSystem (spawns, boss flags)
    6. HeatSystem + ComboSystem
    7. XPSystem (level-up pause → UpgradeScene)
    8. HUD update

- Run ends on player hp == 0 (GameOverScene) OR optional victory on
  surviving wave 10 + Kernel Panic kill. Highscore and meta-XP persist via
  SaveService.

- AudioService: preload SFX + one loop track in BootScene; mute obeys
  settings; no autoplay before first user gesture (Phaser sound unlock).

- Mobile: virtual twin sticks (move left, aim/shoot right) with opacity
  from settings; must work at 390×844 viewport without blocking HUD.

================================================================
PERSISTENCE (full-save — arcade)
================================================================

- SaveService (localStorage key `blaze-protocol-save-v1`):
    { version: 1, settings, meta, highscores }
  Settings: sfx volume, music volume, screen shake, touch control opacity.
  Meta: hangar unlocks / meta-XP after runs (src/config/meta.ts).
  Highscores: **local** top-N only (name + score + date) — no cloud board.
- Corrupt / wrong version → reset to defaults + one console warn.
  Schema documented in shared/design.md.
- Vitest: SaveService roundtrip (settings + meta + highscores) with mock
  localStorage. Never sessionStorage-only.

================================================================
FORBIDDEN
================================================================

- Multiplayer, WebSocket sync, or "add a server later"
- Three.js, Unity, or non-Phaser game engines
- Geo maps, API keys, paid assets
- pkill/killall/pgrep by interpreter name
- Stopping before Phase 3 DEMO artifact exists
- Putting save/load only in sessionStorage (must be localStorage)
- Cloud / global leaderboards, remote score APIs, or auth

================================================================
PROJECT LAYOUT
================================================================

  package.json              // "dev": "vite", "build": "vite build",
                            // "test": "vitest run", "preview": "vite preview"
  vite.config.ts
  tsconfig.json
  index.html
  src/main.ts               // Phaser.Game config, scene list
  src/scenes/*.ts
  src/entities/*.ts
  src/systems/*.ts
  src/ui/*.ts
  src/services/SaveService.ts
  src/services/AudioService.ts
  src/config/*.ts
  public/assets/...
  tests/                    // vitest: WaveSystem, SaveService, XPSystem, soak
  demo/record.mjs           // Phase 3 Playwright recorder
  demo/cycles/              // Phase 4 per-cycle screenshots/clips
  FEATURES.md               // Phase 4 decide journal (pros/cons per cycle)
  BUGS.md                   // soak / Phase 4 root-cause log
  README.md                 // how to run (M1+)
  PROGRESS.md               // resume journal (NOW block on top)
  SOAK.md
  DEMO.md
  shared/design.md          // scene list, save schema, controls — keep in sync
  ASSETS.md
  CONTENT.md

================================================================
TESTING HARNESS (build in M1, use forever)
================================================================

You cannot verify an arcade game by hand every change. Build:

A) vitest pure-logic tests in tests/ :
   - WaveSystem: seeded wave 5 contains kernelPanic flag
   - XPSystem: kill budget levels player at configured threshold
   - SaveService: roundtrip settings + meta + highscores (mock localStorage)
   - HeatSystem: heat in [0,max], damage applied in red zone
   Run `npm test` after every change — this is the fast loop.

B) Playwright at milestone end: open the Vite URL on `.game.port`, assert
   zero page errors, screenshot GameScene with HUD visible.

C) tests/demo-seed.ts — headless scripted run using exported game logic
   (no canvas): simulate input sequence through wave 3, assert xp > 0 and
   no NaN stats. demo/record.mjs may reuse timings from this seed.

A milestone is DONE only when its ACCEPT commands pass AND Playwright
has zero console errors when a browser check is required.

================================================================
DEBUGGING & ANTI-STUCK DISCIPLINE
================================================================

- Determinism first: route gameplay RNG through one seeded generator;
  same seed + same input script → same wave composition in vitest.
- Do NOT guess-and-edit. Reproduce with the smallest vitest, one
  hypothesis, fix, regression.
- After 3 failed fixes: log failure in PROGRESS.md, ship simplest passing
  reduced ACCEPT, move on.
- On context loss: re-read PROGRESS.md, shared/design.md, ASSETS.md,
  CONTENT.md, src/scenes/GameScene.ts, src/systems/WaveSystem.ts,
  src/services/SaveService.ts, then resume.
- Time-box M1–M3 for green smoke before depth.

================================================================
MILESTONES (each: implement → vitest → Playwright when noted → log)
================================================================

M1  Vite + Phaser 3 + TypeScript scaffold. BootScene → MainMenuScene
    (Play + Settings buttons). Vitest harness with one passing smoke test.
    shared/design.md stub. Write README.md (install/dev/ports) and
    PROGRESS.md with a NOW block.
    ACCEPT: `npm run build` succeeds; `npm test` exits 0; Playwright:
    page loads menu, zero console errors. README.md and PROGRESS.md exist.

M2  GameScene arena: bordered tile/sprite floor, wall collisions,
    PlayerDrone WASD movement via MovementSystem + InputSystem. Pause overlay.
    ACCEPT: vitest: MovementSystem clamps player inside bounds; Playwright:
    player moves on keyboard, no console errors.

M3  Asset lock. Download CC0 sci-fi/arcade pack(s); ASSETS.md complete.
    Replace placeholders for player + arena floor + one enemy silhouette.
    VL ACCEPT when available.
    ACCEPT: every ASSETS.md path decodes; Playwright screenshot not blank.

M4  Combat core. Mouse/right-stick aim direction; auto-fire or click to
    shoot; Projectile pool; Spark Imp spawns and AISystem seeks player;
    hp/damage numbers in HUD.
    ACCEPT: vitest: CombatSystem applies damage and despawns at 0 hp;
    Playwright: shoot imp, hp bar drops.

M5  Full enemy roster. Implement all five enemy types with distinct
    AISystem behaviors per CONTENT. Death spawns coolant pickup sometimes.
    ACCEPT: vitest: wave template 5 schedules kernelPanic; tapeWraith
    death spawns mini-imps per config; Playwright: two types visible in
    wave 2 screenshot.

M6  WaveSystem + ComboSystem. Procedural waves 1–10 with escalating budget;
    combo multiplier resets after timeout; IntermissionScene stub between
    waves (Continue button).
    ACCEPT: vitest: seeded waves 1–3 increase spawn budget monotonically;
    combo multiplier > 1 after two kills within window; Playwright: wave
    counter increments.

M7  XPSystem + UpgradeScene. Kills grant run-XP; level-up pauses GameScene
    and opens UpgradeScene with THREE cards; pick one applies module to
    player for rest of run.
    ACCEPT: vitest: XP threshold triggers level; chosen upgrade changes
    configured stat; Playwright: upgrade card click returns to game with
    HUD showing new level.

M8  HeatSystem + shop. Global heat rises each wave; red zone damages player
    without shield; IntermissionScene sells coolant refill for run score;
    Kernel Panic boss spawns wave 5 with telegraphed heat pulse.
    ACCEPT: vitest: heat increases per wave; kernelPanic pulse damages in
    radius; Playwright: heat meter visible and changes after wave clear.

M9  SaveService + SettingsScene + AudioService. Persist settings, meta
    hangar upgrades, highscores across reload. Settings menu adjusts volumes
    and shake; audio respects mute. GameOverScene shows run stats + meta-XP.
    ACCEPT: vitest: SaveService roundtrip; corrupt JSON resets safely;
    Playwright: change setting → reload → setting retained; GameOver after
    forced death shows highscore line.

M10 Mobile + polish + QA. Virtual twin sticks in src/ui/VirtualControls.ts;
    Settings control opacity. Screen shake on boss hit (toggle in settings).
    Five-minute vitest soak script passes. Playwright desktop + 390×844:
    complete one run through wave 3 with movement, shooting, one level-up,
    zero console errors. Write final PROGRESS.md.

Bootstrap the boilerplate clone first (BOILERPLATE REPO block), then start M1: Vite+Phaser on top of the lab, vitest smoke, then arena movement.

When M10 is done, immediately begin Phase 2 without waiting:

PHASE 2 — bounded soak-testing and bug-hardening. The game is playable
per PROGRESS.md. You are now QA. Do NOT soak forever. Re-read PROGRESS.md,
shared/design.md, tests/, and src/systems/ first.

STEP 0 — build tests/soak.ts: headless simulated runs (no Phaser canvas
required — import systems directly), numbered seeds, one RNG. Each run
simulates input through wave 7 or player death. Check invariants every
tick/step. On FIRST violation save seed + step log to tests/repros/<seed>.json.

BUDGET (hard stop — first that hits ends Phase 2)
- 200 clean runs, OR
- clean streak of 50 consecutive fully-clean runs, OR
- 90 minutes wall-clock soak time
Failed runs do not count as clean. Fix, then continue toward the same
budget. When the budget is met → Phase 3.

INVARIANTS — every step of every run

  1. No exceptions (re-throw after logging in soak).
  2. No NaN/Infinity/undefined in hp, heat, xp, combo, score, cooldowns.
  3. Player hp in [0,maxHp]; heat in [0,maxHeat]; combo timer >= 0.
  4. Enemy count bounded by wave budget + configured caps.
  5. Save schema version matches; highscore >= 0; settings volumes in [0,1].
  6. After load, settings survive roundtrip in vitest mock localStorage.
  7. Same seed + same input script → identical wave composition hash.
  8. No unbounded projectile/particle arrays (pools or caps enforced).
  9. Boss spawn only on waves where config flags kernelPanic.
 10. Determinism: same seed twice → byte-identical step log hash.

THE LOOP (until budget met)

  1. Run soak batches across many seeds.
  2. On violation: reproduce, one hypothesis, root-cause fix, regression,
     log BUGS.md.
  3. If clean: raise stress — faster waves, max enemies, spam dash,
     unicode player name in save, rapid pause/resume, corrupt-then-recover
     save, long runs near wave 10.
  4. Every ~50 runs, one Playwright pass (desktop + mobile viewport).
  5. Append SOAK.md. When budget is met → Phase 3.

RULES
- Never weaken an invariant or test to pass.
- Prefer vitest soak; Playwright for periodic render checks.
- If context runs low, handoff in SOAK.md, then resume soak or Phase 3.

================================================================
PHASE 3 — DEMO record (checkpoint — then Phase 4)
================================================================

After Phase 2 budget is met, record a DEMO. One **continuous** automated
playthrough in the browser — not a montage. Prefer Playwright video (webm).
If mcp__playwright__* tools exist, use them; else npx playwright.

STORYBOARD (must appear VISIBLY in the recording, in order)
0. Title / main menu visible (game name, Play button)
1. Click Play — transition to GameScene
2. GameScene: move + shoot; HUD shows hp, heat, wave, score
3. Clear wave 1; intermission or wave 2 starts
4. Level-up: pick one upgrade card
5. Wave 3 with combo or multi-enemy fight visible
6. Player death OR wave-5 boss encounter → GameOver screen
7. Hold GameOver/highscore UI ≥2s

STEPS
1. Boot Vite on `.game.pid` / `.game.port`; health-check.
2. Write demo/record.mjs driving the storyboard via keyboard/mouse or
   injected test hooks. Reuse tests/demo-seed.ts timings if needed so
   the run finishes within ~5 minutes.
3. Record to demo/demo.webm and/or demo/demo.gif. Fixed viewport
   1280×720 (optional second capture at 390×844 for mobile — not required).
4. Write DEMO.md draft: storyboard checklist, seed, artifact path, zero
   console errors.
5. VALIDATE THE RECORDING (mandatory): extract frames to demo/frames/;
   for EACH storyboard step confirm VISIBLE (VL preferred; else Read
   frames). Log PASS/FAIL under ## Visual validation in DEMO.md. On FAIL:
   re-capture and re-validate. Never tick steps from logs alone.
6. Append PHASE3-DONE to PROGRESS.md only after all visual steps PASS.
   Do NOT mark the goal complete. Immediately begin Phase 4.

ACCEPT
- demo/demo.webm or demo/demo.gif exists and is non-empty.
- DEMO.md lists every storyboard step, artifact path, AND per-step
  visual validation PASS with frame refs.
- Recording actually shows title → menu/play → move/shoot → level-up → game over.
- Recording run had zero console errors.

================================================================
PHASE 4 — infinite improve / feature loop (never stop alone)
================================================================

Phase 3 DEMO exists. You are now a product engineer + QA for BLAZE
PROTOCOL. Cycle forever until a human kills this process. Do not declare
the job "done". Never delete demo/ artifacts.

Keep FEATURES.md, SOAK.md, and PROGRESS.md as the journals.

CYCLE N (repeat forever)

  P4-0  Mini-soak gate
        Run tests/soak.ts for ~20 clean runs OR ~10 minutes wall-clock
        (whichever first). If any Phase 2 invariant fails → this cycle is
        FIX-ONLY: root-cause, regression, Playwright if UI touched, then
        return to P4-0. Never invent features on a red soak.

  P4-1  Decide (max 10 minutes wall-clock — write BEFORE coding)
        Pick ONE of:
          A) POLISH — prefer on odd cycle numbers. Examples: better player
             drone sprite/animation, particle VFX, HUD readability, wave
             balance numbers, virtual-stick feel, audio mix, CRT post FX,
             GameOver screen polish, save UX.
          B) FEATURE — even cycles only (unless A has nothing useful).
             Examples that FIT this architecture: new enemy type, new
             upgrade module, dash ability, daily challenge seed, second
             arena skin, boss telegraph VFX, hangar skin unlock.
        Write in FEATURES.md before any edit:
          - cycle id, A or B, one-sentence goal
          - 2–3 options considered
          - pros / cons (bullets)
          - chosen approach + files to touch (cap: ~8 files)
          - ACCEPT: vitest cases + Playwright proof
        REJECT and pick another idea if it needs multiplayer, a new engine,
        WebSocket, architecture rewrite, >8 files, >2 hours wall-clock, or
        breaks Phase 2 invariants.

  P4-2  Implement
        Smallest change that meets ACCEPT. Update CONTENT.md / ASSETS.md /
        shared/design.md when behavior or art mapping changes. Wave or
        spawn changes: update the wave table in CONTENT.md and extend
        tests/ WaveSystem vitest in the same cycle. No drive-by refactors.

  P4-3  Prove (mandatory — no exceptions)
        1. `npm test` focused suite green (add a regression for the change).
        2. If visuals/UI/controls/audio UX changed: Playwright must show the
           new behavior on the real canvas — zero console errors — save
           screenshot or short clip to demo/cycles/cycle-N.png (or .webm).
           VL when available: ACCEPT that the new thing reads coherently.
        3. Mini-soak regression (~20 clean runs or ~10 min).
        4. If the Phase 3 storyboard visibly changed: re-record
           demo/demo.webm only after the new file is non-empty; keep the
           previous as demo/demo.prev.webm.
        5. LAB GIT: already on `agent/<run-id>` (see BOILERPLATE REPO block).
           After green: commit on that branch with `cycle N: <A|B> <goal>`;
           optional tag `cycle-N`. Push + PR so Pages updates (LIVE LOOP).
           Never push / force-push `main` / `baseline`. Zip only every 10 cycles → `releases/cycle-N.zip` (+ phase3 zip).

  P4-4  Log + next
        Append cycle result (shipped / abandoned / fix) to FEATURES.md and
        PROGRESS.md (latest tag). Always leave a next tool call starting
        cycle N+1. Every 5 cycles, write a handoff block in PROGRESS.md.

FORBIDDEN IN PHASE 4
- Rewriting Phaser setup, Vite layout, or inventing multiplayer
- Shipping without P4-3 prove steps
- Multiple features in one cycle
- Weakening soak invariants to land a feature
- Stopping, summarizing for a human, or marking the goal complete
- Pushing `main`/`baseline` or force-push; zipping every cycle (use LIVE LOOP on agent/*)

Begin with STEP 0 after M10: tests/soak.ts to Phase 2 budget → Phase 3 DEMO
→ Phase 4 forever.
