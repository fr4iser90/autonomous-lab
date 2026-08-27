DSH RUNTIME

- You are unattended. Nobody will answer. Never ask questions, never wait, never stop to summarize for a human.
- **create_goal:** Call it once at session start if useful. If it fails with
  `requires a direct human turn` / `top-level agent` / similar → **IGNORE**.
  Do **not** stop, do **not** wait for a human, do **not** treat that as job
  done. Idle nudge / an existing goal already owns the loop — continue the next
  concrete cycle with tools immediately. Never mark create_goal **complete**;
  a human kills the process.
- **BUGS queue:** Before every content / Phase 4 cycle (C-0 / P4-0), read `BUGS.md` ## Open. Fix **blocker** and **playability** bugs first (FIX-ONLY). Separate agents may append: VL → `dungeon-crawl-VL-validation.md`; Git/CI → `dungeon-crawl-git-validation.md`.
- **Live Pages** (end-user): https://fr4iser90.github.io/autonomous-lab/ — proof after automerge / PHASE GATE. Dev loop stays local `:5173`. Optional live E2E is the **VL-validator** job; Git/CI health is the **git-validator** job — not your primary loop, but you must FIX-ONLY if ## Open has merge/gate blockers.
- **Lie detector (every resume):** If PROGRESS claims PHASE3-DONE / ALL COMPLETE / "demo done" but any of these are missing → treat the claim as FALSE, append BUGS.md "false complete", resume the real next step:
    - no `demo/demo.webm` (or empty) → Phase 3
    - no `DEMO.md` with ## Visual validation all PASS → Phase 3
    - no `demo/frames/` for each storyboard step → Phase 3
    - Phase 2 registries below CAP with budget left → Phase 2
    - Phase 2 CAP/CAP but no SOAK.md Phase-2b pass → Phase 2b
    - PROGRESS claims M2+ but `shared/design.md` missing VISUAL SPEC sections → M1 gap
    - WebGL canvas black / no torch-readable dungeon in PRE-PR shots → visual FAIL (not ACCEPT)
  DOM-only Playwright (title/buttons exist) is **not** Phase 3. Empty WebGL is **not** playable.
- Start by calling create_goal with this whole overnight job and max_goal_rounds (at least 500). On create_goal policy error → ignore and continue (see above).
- After every milestone, content cycle, soak batch, demo step, or Phase 4 cycle: write PROGRESS.md (refresh NOW), then continue with tools. A text-only assistant message without a tool call ends this process — that is a failure. Always leave a next tool call. Never end a cycle with "summary only" because create_goal failed.
- This file is the full overnight job: runtime, architecture, **M1–M12 ACCEPT**, Phase 2–4. Before each Mn, re-read **that Mn only** from the MILESTONES section below (do not re-read later milestones until you reach them). After M12 ACCEPT, ignore M1–M12 and follow Phase 2–4 here.
- Default model: session default from dsh settings (agent-default-model / name `fast`). Do not hardcode GGUF ids. Session `fast` is VL-capable (`input: [text, image]`).
- For collision / pathfinding / PCG soft-lock / animator root-cause: spawn a subagent with agentOptions.provider = jarvis (or configured provider) and agentOptions.model = the **id** of the settings entry whose **name** is `smart`. If no `smart` entry, stay on session default. Apply the fix yourself. **Do not** spawn smart for screenshot / vision checks.
- Vision: For **every** PRE-PR VISUAL, PHASE GATE, DEMO frame, milestone
  screenshot, CONTENT VISUAL, and **PLAY CHECK** — call **`read_image`** on each
  PNG **path**, then judge PASS/FAIL from the image in this session (dungeon
  geometry readable, torch/fog mood, HUD not clipped — not black WebGL, empty,
  error page, or HTML table). Log path + PASS/FAIL in PROGRESS / DEMO / FEATURES.
  Do **not** spawn a subagent only to view images. Do **not** use plain `Read` on
  PNG. File size / bash pixels never PASS. If `read_image` refuses (text-only
  route), note gate failure; do not invent PASS.
- Playwright: if mcp__playwright__* tools exist, use them for DEMO and visual checks. Otherwise npx playwright / bash. Vitest is the fast loop (PCG, combat math, save, animator); browsers at milestone end, content cycles, Phase 3, and UI Phase 4 cycles.
- Stack: Vite + TypeScript + **Three.js** (pin in package.json; prefer r160+ or latest stable). Work inside the boilerplate clone (see BOILERPLATE REPO block).
- Preview: stop leftovers via `.game.pid` / `.game.port` when present → prove port free → `pnpm run dev` (`run_in_background: true`) → write `$!` to `.game.pid` and bound port to `.game.port` → health-check HTTP before Playwright. Never `pkill`/`killall`/`pgrep` by interpreter name. `pnpm install` (prefer) before first start.

================================================================
BOILERPLATE REPO + LIVE PAGES (mandatory — do this FIRST)
================================================================

Use the public genre-agnostic boilerplate (toolchain, CI, Pages).
Repo: https://github.com/fr4iser90/autonomous-lab
Live: https://fr4iser90.github.io/autonomous-lab/
Follow the clone's `lab/AGENTS.md` for branch/gate rules only. This prompt owns the game;
the boilerplate owns none of the genre.

================================================================
BOILERPLATE OWNERSHIP (do not confuse toys with the game)
================================================================

The clone is a **toolchain**. Read `lab/BOILERPLATE.md` + `lab/AGENTS.md` (branch/gate +
ownership only). Markers:

- `BOILERPLATE_OWNED` — never edit on `agent/*` (workflows, AGENTS.md,
  BOILERPLATE.md, scripts/new-run.sh, LICENSE, Vite `base` `/autonomous-lab/`).
- `BOILERPLATE_TOY` / `BOILERPLATE_PLACEHOLDER` — replace; not design authority
  (`src/economy.ts`, harvest UI, stub PROGRESS/CONTENT until rewritten).
- **RUN_OWNED** — your game: `src/` (real game), `tests/`, `demo/`, PROGRESS,
  CONTENT, FEATURES, SOAK, BUGS, DEMO, ASSETS.md, game README.

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
   `agent/dungeon-crawl-<YYYYMMDD>` (add `-HHMM` if the day already exists).
   Prefer clean experiment: `git checkout -b agent/<run-id> origin/baseline`
   Continue a shipped line: branch from `origin/main` instead.
   **FORBIDDEN:** second parallel branch `agent/<run-id>-rebased` for the same run.
5. Read lab/AGENTS.md (branch/gate only). Tracking surface for this run (keep
   current every ACCEPT / cycle — do not invent a parallel tracker):
   - PROGRESS.md = resume index (NOW: phase, next step, last ACCEPT, SHA,
     pre-PR visual PASS, CAPS, deepest floor).
   - Also maintain: CONTENT.md, FEATURES.md, SOAK.md, BUGS.md, DEMO.md,
     ASSETS.md, shared/design.md.
   - On resume: PROGRESS NOW → BUGS ## Open → CONTENT CAPS → shared/design.md.
   Derive milestones from **this prompt** only.
6. Prefer **`pnpm install`**, not `npm install`. One package manager per tree.
   If pnpm blocks postinstall (esbuild): `pnpm approve-builds` once.
7. Keep Vite `base` = `/autonomous-lab/` so Pages works. Preview only on **5173**
   — never bind **3080**. Work **inside this clone**, not a sibling greenfield tree.

LIVE LOOP (after EVERY milestone ACCEPT, content cycle, soak batch, DEMO
checkpoint, and Phase 4 cycle):

0. PRE-PR VISUAL (mandatory — BEFORE commit / push / open or update PR):
   - Run TESTING HARNESS **D** (UI smoke): Title → New Delve / Continue with
     **zero pageerror**; fail → FIX-ONLY, no push.
   - If this slice **added/changed** dungeon look, mob kit, prop, or combat FX:
     include **CONTENT VISUAL** shots — not only the title screen.
   - Capture ≥1 Playwright screenshot of the ACCEPT surface (PNG under
     `demo/pre-pr/` or milestone/cycle folder). Must not be black/empty WebGL.
   - **`read_image`:** judge PASS/FAIL (readable dungeon + HUD when in-run).
     FAIL → fix, re-shot — do **not** push/PR.
   - Record in PROGRESS.md NOW: path + `read_image` + PASS. No PASS → no push.
1. `pnpm run gate` green locally (includes UI smoke when wired).
2. Commit on `agent/<run-id>` with a short message.
3. Run **SAFE SYNC** before relying on automerge.
4. Push with github_* tools (or `git push -u origin HEAD`). Never push to
   `main` / `baseline`.
5. Open/update PR into `main` if required. CI `gate` → automerge → Pages.
   After land, Actions may sync `agent/*` → `main` tip — `git fetch` + continue
   on the **same** run branch (no `-rebased` fork).
6. Refresh PROGRESS NOW. Always leave a next tool call.

FORBIDDEN (instant revert / stop and redo correctly):
- Greenfield Vite tree that ignores the boilerplate clone
- Pushing or force-pushing `main` / `baseline`
- Push without PASS pre-PR screenshot (`read_image` + judgment)
- Declaring visual PASS from file size / dimensions / bash pixel dumps alone
- Starting the next phase without PHASE GATE PASS + LIVE LOOP toward main/Pages
- Hand-modeling 20 unique high-poly mobs / shipping many glTF files
- Second renderer mid-run (no Phaser after Three is pinned); softening PCG reachability checks

================================================================
SAFE SYNC (rebase/merge check — never lose the current stand)
================================================================

Run before every push that should automerge, on every follow-up resume, and
whenever GitHub reports PR conflicts / failing required `gate`.

GOAL: bring `agent/<run-id>` up to date with `origin/main` **without losing**
commits or uncommitted work on the agent branch.

STEPS (in order):
1. `git fetch origin`
2. Save the stand: commit WIP or stash; `git branch backup/<run-id>-<shortSHA> HEAD`
3. `git rev-list --left-right --count origin/main...HEAD` → if behind > 0, merge
   `origin/main` (preferred) or rebase with backup + `--force-with-lease` on agent only.
4. Resolve conflicts: keep agent `src/`, tests, demo, run docs; take boilerplate
   CI/README Lab header from main when both changed unintentionally.
5. `pnpm run gate` green after sync. Log `SYNC:` in PROGRESS.
NEVER: `git reset --hard origin/main` to wipe work, force-push main/baseline,
invent a second `-rebased` branch. After Actions land+sync: prefer
`git fetch && git reset --hard origin/agent/<run-id>`.

================================================================
PHASE GATE (before EVERY phase change — Pages must show the finished phase)
================================================================

Do **not** start the next phase until this gate PASSes. Applies to:
  M12→Phase 2, Phase 2→Phase 2b, Phase 2b→Phase 3, Phase 3→Phase 4.

1. PLAYABLE CHECK: Playwright screenshot — title + in-dungeon WebGL (torch mood,
   floors/walls visible) + HUD when built.
2. **`read_image`** on path → PASS ("playable for this phase"). FAIL → fix, no advance.
3. Log `PHASE_GATE: <from>→<to> PASS` in PROGRESS NOW.
4. Full LIVE LOOP → Pages shows finished phase before next phase starts.

FORBIDDEN: phase jumps without PHASE GATE PASS + LIVE LOOP.

================================================================
DOCUMENTATION (same turn as the code that makes them stale)
================================================================

  PROGRESS.md   NOW ≤15 lines: phase, Mn/cycle, CAPS, deepest floor, next step,
                last ACCEPT, SHA. History below NOW.
  CONTENT.md    Theme locked + registries + CAPS + kit/prop ids.
  FEATURES.md   Decide log before each C-cycle / P4-1.
  BUGS.md       ## Open queue. **Commit on agent branch** when you append.
  SOAK.md       Floor reachability + combat soak records.
  DEMO.md / ASSETS.md / shared/design.md / README.md `# Current run`

On context loss: PROGRESS NOW → BUGS ## Open → CONTENT CAPS → design.md → resume.

================================================================
BUGS.md QUEUE (builder + validators)
================================================================

- **VL validator** (`dungeon-crawl-VL-validation.md`): playability → ## Open.
- **Git/CI validator** (`dungeon-crawl-git-validation.md`): PR/gate/queue → ## Open.
- **Builder (you):** at every **C-0** and **P4-0** (and on follow-up resume):
  1. Read BUGS.md ## Open — also catch bugs via UI smoke + PLAY CHECK.
  2. Fix all `blocker` + `playability` before new content.
  3. When **you** find a bug: append ## Open **and commit `BUGS.md` on `agent/*`** same cycle.
- Do not clear ## Open without a fix + evidence.

================================================================
PLAY CHECK (builder-owned — do not skip)
================================================================

**Phase 4:** every **5** cycles (N divisible by 5 — at **P4-0** before P4-1):
1. Boot `pnpm run dev` → `/autonomous-lab/` → **New Delve** (zero pageerror).
2. **~45–60s in-dungeon:** move (WASD), look, attack ≥1 enemy if present, pick
   loot if any, open inventory if built.
3. Screenshot `demo/play-check/cycle-N.png` (WebGL dungeon + HUD readable).
4. **`read_image`** → PASS/FAIL (not black canvas, not title-only, not error).
5. FAIL → BUGS ## Open + FIX-ONLY — no P4-1 until PASS.
6. PASS → log `PLAY_CHECK: cycle-N PASS` in PROGRESS NOW.

**Phase 2:** every **10** content cycles (C10, C20, …) — same; path
`demo/play-check/C<N>.png`.

================================================================
CONTENT CAP CONSTANT — HUMAN: set before overnight
================================================================

  CAP = 16
  # ← change me (16 = short lab; 24–40 = long run). Registries follow CAP.

================================================================
GAME — Ashen Delve (Three.js dungeon crawler)
================================================================

Fantasy: **Ashen Delve** — descend a procedural dungeon of ash-stone halls,
torchlight, and kit-built horrors. Top-down-ish **third-person** or slight
elevated follow-cam (pin in design.md) — readable combat, not FPS voxel.

**Visual law (non-negotiable):**
- Mood: cold ash + warm torch emissive; fog; readable silhouettes.
- **FORBIDDEN looks:** purple-on-white dashboard UI; flat single-color void;
  default Inter/Roboto/Arial stacks; emoji HUD; identical gray boxes forever.
- Feel comes from **lighting + fog + kit variety + FX**, not mesh count.

Core loop:
- Enter delve (seeded floor) → explore rooms → fight mobs → loot → stairs down
- Die → meta scraps / unlocks (light) → next run
- Deeper floors raise denser rooms + harder kits

================================================================
VISUAL SPEC FIRST (M1 — before gameplay systems pile on)
================================================================

`shared/design.md` is **design authority** for look. Must include before M2 ACCEPT:

1. **Mood** (1–2 sentences) + reference feel (e.g. "torchlit ash catacombs").
2. **Palette** — CSS / Three color hexes: bg, floor, wall, accent emissive, blood/hit, UI.
3. **Camera** — distance, FOV, follow lag, clamp.
4. **Typography** — distinctive display + body (Google font OK via CSS; not Inter/Roboto/Arial).
5. **Kit silhouettes** — ASCII or short prose for hero + 3 starter mob kits.
6. **FORBIDDEN** visual list (cards-as-hero, flat void, etc.).
7. **Asset policy:** procedural Three.js meshes + materials; **InstancedMesh** props;
   **≤2 glTF** total for entire run (hero and/or one boss) — default **0 glTF**.

ACCEPT M1 = this file exists + title shell uses palette/fonts — **not** a finished dungeon yet.

================================================================
ARCHITECTURE (decided — do not change family)
================================================================

- **Client-only** single-player. No multiplayer, no Node game server.
- **Three.js** scene graph; one `GameRenderer` owns WebGLRenderer, camera, lights.
- **DungeonPCG** in `src/systems/` — seeded floor generator:
  - Room graph or BSP → grid cells (FLOOR / WALL / DOOR / STAIRS / SPAWN)
  - Deterministic for fixed seed (vitest).
- **Mob kits** (3–5 families) in `src/kits/` — compose Capsule/Box/Cone/Extrude
  primitives + materials; variants via palette/scale/attachments (helmet, horns).
  **Not** one unique Blender mesh per enemy.
- **PropField** — InstancedMesh for torches, rubble, pillars, bones.
- **Animator** (one shared) — idle / walk / attack procedural (bob, squash, limb
  swing, or simple bone-like Object3D pivots). All kits use it.
- **CombatEngine** — tick HP, hitboxes (AABB or capsule), i-frames, knockback.
- **Loot / Inventory** — simple grid; data in `src/data/`.
- **Save** — full-save profile (settings + meta unlocks + local high floor).

FORBIDDEN:
- Phaser or second 3D engine mid-run
- 10+ unique glTF characters
- Soft-locking stairs (PCG must always place reachable stairs + spawn)
- Cloud/auth/leaderboards

================================================================
PROJECT LAYOUT
================================================================

  src/main.ts
  src/app/                 // title, pause, settings, HUD mount
  src/render/              // GameRenderer, lights, fog, post optional
  src/systems/             // DungeonPCG, CombatEngine, Animator, PropField
  src/kits/                // heroKit, goblinKit, shadeKit, …
  src/entities/            // Player, Mob, Projectile
  src/data/                // items, floors, unlocks
  src/services/            // SaveService, AudioService (optional Web Audio)
  src/ui/                  // HUD, inventory, death screen
  src/lib/                 // math, seed rng
  tests/                   // pcg, combat, animator, save, soak
  tests/ui-smoke.spec.ts   // or demo/ui-smoke.mjs — wired into gate
  CONTENT.md FEATURES.md PROGRESS.md SOAK.md BUGS.md DEMO.md ASSETS.md
  shared/design.md

================================================================
PERSISTENCE (full-save — arcade-ish crawl)
================================================================

- SaveService (localStorage key `ashen-delve-save-v1`):
  `{ version, settings, meta, highscores }`
  Settings: volumes, reduceMotion, cameraSensitivity.
  Meta: unlocks, scrap currency, highestFloorCleared.
  Highscores: local top-N (name + deepest floor + date).
- Corrupt → defaults + one console warn. Schema in shared/design.md.
- Vitest: SaveService roundtrip with mock localStorage.
- No cloud. Optional **3 run seeds** remembered in meta — not full world blobs.

================================================================
CONTENT CAPS (Phase 2 gate — track in CONTENT.md)
================================================================

| Registry     | Cap | Starter (M8–M11)        |
|--------------|-----|-------------------------|
| mobKits      | CAP | ≥3 families             |
| propTypes    | CAP | torches, rubble, …      |
| items        | CAP | weapons, potions, keys  |
| floorThemes  | CAP | ash, crypt, moss, …     |

```
CAPS: mobKits=3/CAP propTypes=4/CAP items=6/CAP floorThemes=2/CAP
NEXT_CYCLE_PRIORITY: mobKits
```

Each new id must be visible in-game + ASSETS.md row (how built: primitives).

================================================================
TESTING HARNESS (M2 — use forever)
================================================================

A) vitest:
   - DungeonPCG: fixed seed → same room graph; spawn + stairs reachable (BFS)
   - CombatEngine: hit deals damage; death removes mob
   - Animator: clip names idle/walk/attack advance without NaN
   - SaveService roundtrip
B) Playwright UI smoke (mandatory from M4):
   - zero pageerror; title → New Delve; canvas has non-black pixels / dungeon visible
C) tests/soak.ts: scripted walk + kill path for N floors
D) **UI interaction gate:** `tests/ui-smoke.spec.ts` and/or `demo/ui-smoke.mjs` +
   `test:ui` wired into `gate` when stable.
E) **PLAY CHECK** scheduled — see above.

================================================================
CONTENT VISUAL (kits / props / themes — mandatory)
================================================================

PATHS:
  demo/content/C<N>-kit-<id>.png
  demo/content/C<N>-theme-<id>.png
  demo/pre-pr/…

CAPTURE: in-dungeon WebGL with the new kit/theme visible + HUD.
FORBIDDEN: title-only, black canvas, markdown tables as proof.
Validate with **`read_image`**.

================================================================
MILESTONES (M1–M12 — full ACCEPT in this file)
================================================================

Before each Mn: read **that Mn only**. When M12 ACCEPT → **PHASE GATE** → Phase 2.

M1  **VISUAL SPEC + shell.** Clone on `agent/dungeon-crawl-*`. Write
    `shared/design.md` (all VISUAL SPEC sections). Title screen: brand **Ashen Delve**,
    palette CSS vars, distinctive fonts, New Delve / Continue / Settings stubs.
    PROGRESS.md NOW. Delete/replace toy harvest UI.
    ACCEPT: design.md complete; Playwright title looks on-brand (`read_image` PASS);
    `pnpm run gate` OK (may be minimal).

M2  Three.js bootstrap: canvas, fog, hemisphere + torch point lights, ground plane
    placeholder, orbit/follow camera stub. Vitest harness started. Pin `three` in
    package.json. Document camera in design.md.
    ACCEPT: Playwright in-canvas shot is **not** uniform black; fog/light visible
    (`read_image` PASS); vitest smoke green.

M3  **DungeonPCG** grid: BSP or room-graph; FLOOR/WALL/DOOR/STAIRS/SPAWN; mesh
    extrude or box walls; InstancedMesh rubble starter. Seeded.
    ACCEPT: vitest: seed A == seed A; BFS spawn→stairs; Playwright: multi-room
    layout readable (`read_image` PASS).

M4  **Player** kit (capsule + simple helm/cloak). WASD move, mouse look or
    rotate, collide with walls. HUD: HP stub. UI smoke harness D started.
    ACCEPT: Playwright: move changes camera/player pose; zero pageerror;
    wall collision works in vitest or Playwright assertion.

M5  **Shared Animator** + first **mob kit** (e.g. Box-Goblin). Idle/walk/attack.
    Spawn 1–3 mobs in rooms. Simple chase AI (move toward player if LOS/range).
    ACCEPT: vitest: animator clips; Playwright: ≥1 mob visible distinct from player
    (`read_image` PASS).

M6  **CombatEngine:** click/melee or auto-swing; damage numbers or flash;
    mob death; player damage + death screen stub.
    ACCEPT: vitest: kill sequence; Playwright: hit FX or HP change visible.

M7  **Loot + inventory** (≥4 items in data). Chest or drop on kill. Inventory UI (E).
    ACCEPT: vitest: pickup adds item; Playwright: inventory opens with icon/label.

M8  Floor themes (≥2): palette swap + prop set (crypt vs ash). Stairs → next floor
    new seed/depth. Meta: deepest floor in save.
    ACCEPT: vitest: floor N+1 generates; Playwright: theme difference `read_image`
    on floor1 vs floor2 shots; CONTENT.md CAPS started.

M9  Mob kits ≥3 families + PropField InstancedMesh (≥4 prop types). ASSETS.md
    documents each kit (primitives only).
    ACCEPT: vitest: kit registry length ≥3; Playwright: 2 kits on screen or
    sequential shots PASS.

M10 Audio stubs (Web Audio beeps OK) + settings volumes. ReduceMotion disables
    camera shake / heavy bob. Death → scrap → continue meta.
    ACCEPT: vitest: reduceMotion flag; Playwright: settings visible; death→title/retry.

M11 Boss room rule: last room of floor ≥3 may spawn **boss kit** (scaled kit or
    1 optional glTF — prefer scaled kit). Minimap or room-graph compass.
    ACCEPT: vitest: boss flag on floor gen; Playwright: boss or minimap visible.

M12 Polish pass: torch flicker, hit stop, foot dust; full SaveService; 5-min soak
    script (N floors no soft-lock); mobile-ish controls stub optional; UI smoke full.
    ACCEPT: vitest soak green; simulate/reach floor 5; Playwright full smoke;
    SOAK.md records pass; PHASE GATE ready.

When M12 done → PHASE GATE → Phase 2.

================================================================
PHASE 2 — content cycles until CAP/CAP
================================================================

Goal: fill mobKits / propTypes / items / floorThemes to CAP/CAP.
One registry focus per cycle. Each add must be **visible** + ASSETS.md row.

BUDGET: 40 cycles OR all CAP/CAP OR 120 min Phase 2.

CYCLE (C1, C2, …)

  C-0  BUGS ## Open → FIX-ONLY. `npm test` green. On C10, C20, … **PLAY CHECK**.
  C-1  FEATURES.md before code. ONE of: new mob kit variant, prop type, item,
       floor theme, combat FX polish. REJECT: new engine, >8 files, glTF spam,
       breaks PCG reachability.
  C-2  Implement; CONTENT.md + ASSETS.md; vitest + CONTENT VISUAL.
  C-3  `npm test` green; `read_image` PASS; LIVE LOOP.
  C-4  PROGRESS NOW: CAPS line, next C.

When CAP/CAP → PHASE GATE → Phase 2b.

================================================================
PHASE 2b — soak (once, before DEMO)
================================================================

Run soak: reach floor **10** scripted (seed in SOAK.md) + ~10 min or 200 batches.
INVARIANTS: no NaN; stairs always reachable; save/load mid-run; no soft-lock rooms.
Fix BUGS on fail. PHASE GATE → Phase 3 only when green.

================================================================
PHASE 3 — DEMO (checkpoint — then Phase 4 forever)
================================================================

One continuous Playwright recording — real UI + canvas.

STORYBOARD
0. Title Ashen Delve + New Delve
1. Enter dungeon — torch fog readable
2. Move through ≥2 rooms
3. Fight ≥1 mob (attack + death or damage)
4. Loot or inventory open
5. Stairs / floor change OR theme shift
6. Death or pause → meta/retry visible
7. Hold settled dungeon frame ≥2s

STEPS: demo/record.mjs; demo/demo.webm; demo/frames/; DEMO.md with **`read_image`**
per frame. PHASE3-DONE only when all PASS. PHASE GATE → Phase 4.

================================================================
PHASE 4 — infinite expand (never stop alone)
================================================================

Cycle forever until a human kills this process. Never delete demo/ artifacts.

  P4-0  BUGS drain; mini-soak; every 5 cycles **PLAY CHECK**.
  P4-1  FEATURES.md. Prefer even = FEATURE (kit/theme/item/AI/FX); odd = POLISH
        (lighting, HUD, feel). Cap ~8 files. REJECT: second engine, cloud, glTF zoo.
  P4-2  Smallest change; CONTENT/ASSETS update.
  P4-3  Prove + ECONOMY/CONTENT VISUAL + LIVE LOOP; tag `cycle-N`.
  P4-4  PROGRESS NOW → cycle N+1.

**Stretch:** stealth zones, traps, shrines, co-op-looking ghosts (local only),
jukebox stub — still kit/PCG first.

FORBIDDEN IN PHASE 4: second renderer; deleting Animator; skipping P4-3; stopping.

Flow: M1–M12 → PHASE GATE → Phase 2 CAP/CAP → PHASE GATE → Phase 2b soak →
PHASE GATE → Phase 3 demo → PHASE GATE → Phase 4 forever.

Bootstrap the boilerplate clone first, then begin **M1 (visual spec)**.
If false COMPLETE claims exist, run the lie detector and resume at the first real gap.
