DSH RUNTIME

- You are unattended. Nobody will answer. Never ask questions, never wait, never stop to summarize for a human.
- **create_goal:** Call it once at session start if useful. If it fails with
  `requires a direct human turn` / `top-level agent` / similar → **IGNORE**.
  Do **not** stop, do **not** wait for a human, do **not** treat that as job
  done. Idle nudge / an existing goal already owns the loop — continue the next
  concrete cycle with tools immediately. Never mark create_goal **complete**;
  a human kills the process.
- **BUGS queue:** Before every content / Phase 4 cycle (C-0 / P4-0), read `BUGS.md` ## Open. Fix **blocker** and **playability** bugs first (FIX-ONLY). Separate agents may append: VL → `celestial-incremental-VL-validation.md`; Git/CI → `celestial-incremental-git-validation.md`.
- **Live Pages** (end-user): https://fr4iser90.github.io/autonomous-lab/ — proof after automerge / PHASE GATE. Dev loop stays local `:5173`. Optional live E2E is the **VL-validator** job; Git/CI health is the **git-validator** job — not your primary loop, but you must FIX-ONLY if ## Open has merge/gate blockers.
- **Lie detector (every resume):** If PROGRESS claims PHASE3-DONE / ALL COMPLETE / "demo done" but any of these are missing → treat the claim as FALSE, append BUGS.md "false complete", resume the real next step:
    - no `demo/demo.webm` (or empty) → Phase 3
    - no `DEMO.md` with ## Visual validation all PASS → Phase 3
    - no `demo/frames/` for each storyboard step → Phase 3
    - LAYER_CAP target for Phase 2 not met and Phase 2 budget left → Phase 2
    - Phase 2 done but no SOAK.md Phase-2b pass with layer target → Phase 2b
  DOM-only Playwright (title/buttons exist) is **not** Phase 3.
- Start by calling create_goal with this whole overnight job and max_goal_rounds (at least 500). On create_goal policy error → ignore and continue (see above).
- After every milestone, content cycle, soak batch, demo step, or Phase 4 cycle: write PROGRESS.md (refresh NOW), then continue with tools. A text-only assistant message without a tool call ends this process — that is a failure. Always leave a next tool call. Never end a cycle with "summary only" because create_goal failed.
- This file is the full overnight job: runtime, architecture, **M1–M12 ACCEPT**, Phase 2–4. Before each Mn, re-read **that Mn only** from the MILESTONES section below (do not re-read later milestones until you reach them). After M12 ACCEPT, ignore M1–M12 and follow Phase 2–4 here.
- Default model: session default from dsh settings (agent-default-model / name `fast`). Do not hardcode GGUF ids. Session `fast` is VL-capable (`input: [text, image]`).
- For save-schema migration, big-number edge cases, layer soft-lock root-cause, or prestige formula bugs: spawn a subagent with agentOptions.provider = jarvis (or configured provider) and agentOptions.model = the **id** of the settings entry whose **name** is `smart`. If no `smart` entry, stay on session default. Apply the fix yourself. **Do not** spawn smart for screenshot / vision checks.
- Vision: For **every** PRE-PR VISUAL, PHASE GATE, DEMO frame, milestone
  screenshot, ECONOMY VISUAL, and **PLAY CHECK** — call **`read_image`** on each
  PNG **path**, then judge PASS/FAIL from the image in this session (readable
  numbers, layer strip, prestige panel — not black, empty, error page, or HTML
  table). Log path + PASS/FAIL in PROGRESS / DEMO / FEATURES. Do **not** spawn a
  subagent only to view images. Do **not** use plain `Read` on PNG. File size /
  bash pixels never PASS. If `read_image` refuses (text-only route), note gate
  failure; do not invent PASS.
- Playwright: if mcp__playwright__* tools exist, use them for DEMO and visual checks. Otherwise npx playwright / bash. Vitest is the fast loop (engine, prestige, simulateToLayer, save); browsers at milestone end, UI content cycles, Phase 3, and UI Phase 4 cycles.
- Stack: Vite + TypeScript + **DOM UI only** (no Phaser, no Three.js, no WebSocket server). Pin typescript + vite in package.json. Work inside the boilerplate clone (see BOILERPLATE REPO block).
- Preview: stop leftovers → prove port free → `pnpm run dev` (`run_in_background: true`) → write `$!` to `.game.pid` and bound port to `.game.port` → health-check HTTP before Playwright. Never `pkill`/`killall`/`pgrep` by interpreter name. `pnpm install` (prefer) before first start.

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
   `agent/celestial-inc-<YYYYMMDD>` (add `-HHMM` if the day already exists).
   Prefer clean experiment: `git checkout -b agent/<run-id> origin/baseline`
   Continue a shipped line: branch from `origin/main` instead.
5. Read lab/AGENTS.md (branch/gate only). Tracking surface for this run (keep
   current every ACCEPT / cycle — do not invent a parallel tracker):
   - PROGRESS.md = resume index (NOW: phase, next step, last ACCEPT, SHA,
     pre-PR visual PASS, LAYER_CAP, deepest soak layer).
   - Also maintain the other tracking docs this prompt names whenever they
     change: CONTENT.md (registries/caps/theme/layer formulas), FEATURES.md,
     SOAK.md, BUGS.md, DEMO.md, shared/design.md.
   - On resume / context loss: read PROGRESS NOW first, then CONTENT LAYER_CAP
     and layer formulas, FEATURES open decide, SOAK layer targets.
   Derive milestones from **this prompt** only. Do not invent a second product
   outside the clone.
6. Prefer **`pnpm install`**, not `npm install`. One package manager per tree.
   If pnpm blocks postinstall (esbuild): `pnpm approve-builds` once.
7. Keep Vite `base` = `/autonomous-lab/` so Pages works. Preview only on **5173**
   — never bind **3080**. Work **inside this clone**, not a sibling greenfield tree.

LIVE LOOP (after EVERY milestone ACCEPT, content cycle, soak batch, DEMO
checkpoint, and Phase 4 cycle — this is how outsiders follow progress live):

0. PRE-PR VISUAL (mandatory — BEFORE commit / push / open or update PR):
   - Run TESTING HARNESS **D** (UI smoke): Title → Play must work with **zero
     pageerror**; main economy UI visible; fail → FIX-ONLY, no push.
   - If this slice **added/changed economy content** (layer, upgrade pack,
     special layer, theme band): include **ECONOMY VISUAL** shots (see section
     below) — not only the title screen.
   - Capture ≥1 Playwright screenshot of the current ACCEPT surface (PNG under
     `demo/pre-pr/` or the milestone/cycle folder). Must not be black/empty.
   - **`read_image` (no subagent):** call `read_image` on the PNG path, then judge
     PASS/FAIL yourself (scrap/signal counter readable, layer strip or prestige
     panel visible when relevant). On FAIL: fix, re-shot, re-validate — do **not**
     push/PR.
   - Record in PROGRESS.md NOW: screenshot path + validator `read_image` + PASS.
     No PASS → no push.
1. `pnpm run gate` (or `npm run gate`) green locally — includes UI smoke when
   `test:ui` / Playwright harness exists (see TESTING HARNESS D).
2. Commit on `agent/<run-id>` with a short message.
3. Run **SAFE SYNC** (below) before relying on automerge.
4. Push with github_* tools (or `git push -u origin HEAD`). Never push to
   `main` / `baseline`.
5. Open/update PR into `main` if required. CI `gate` → automerge → Pages.
6. After automerge or SAFE SYNC: refresh PROGRESS NOW (branch, SHA, LAYER_CAP,
   deepest soak layer, next step). Always leave a next tool call.

FORBIDDEN (instant revert / stop and redo correctly):
- Greenfield Vite tree that ignores the boilerplate clone
- Pushing or force-pushing `main` / `baseline`
- Push without PASS pre-PR screenshot (`read_image` + judgment)
- Declaring visual PASS from file size / dimensions / bash pixel dumps alone
- Starting the next phase without PHASE GATE PASS + LIVE LOOP toward main/Pages
- Forking Modding Tree / importing TMT as the engine (build **your own** LayerEngine)
- Adding a new prestige **system** per layer (layers = **data + formulas** only)
- Second economy engine mid-run; weakening NaN/negative/layer-reachability checks

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
NEVER: `git reset --hard origin/main`, force-push main/baseline.

================================================================
PHASE GATE (before EVERY phase change — Pages must show the finished phase)
================================================================

Do **not** start the next phase until this gate PASSes. Applies to:
  M12→Phase 2, Phase 2→Phase 2b, Phase 2b→Phase 3, Phase 3→Phase 4.

1. PLAYABLE CHECK: boot; Playwright screenshot of playable economy UI for the
   finished phase (title + main panel + layer strip when built).
2. **`read_image`** on path → PASS ("playable for this phase"). FAIL → fix, no advance.
3. Log `PHASE_GATE: <from>→<to> PASS` in PROGRESS NOW.
4. Full LIVE LOOP → Pages shows finished phase before next phase starts.

FORBIDDEN: phase jumps without PHASE GATE PASS + LIVE LOOP.

================================================================
DOCUMENTATION (same turn as the code that makes them stale)
================================================================

  PROGRESS.md   NOW ≤15 lines: phase, Mn/cycle, LAYER_CAP, deepest soak layer,
                next step, last ACCEPT, SHA. History below NOW.
  CONTENT.md    Theme locked + layer formulas + SPECIAL_LAYER registry + CAPS.
  FEATURES.md   Decide log before each C-cycle / P4-1.
  BUGS.md       ## Open queue. **Commit on agent branch** when you append.
  SOAK.md       Layer targets + batch results + simulateToLayer records.
  DEMO.md / shared/design.md / README.md `# Current run`

On context loss: PROGRESS NOW → BUGS ## Open → CONTENT LAYER_CAP → resume.

================================================================
BUGS.md QUEUE (builder + validators)
================================================================

- **VL validator** (`celestial-incremental-VL-validation.md`): playability → ## Open.
- **Git/CI validator** (`celestial-incremental-git-validation.md`): PR/gate/queue → ## Open.
- **Builder (you):** at every **C-0** and **P4-0** (and on follow-up resume):
  1. Read BUGS.md ## Open — do not rely on validators alone; UI smoke + PLAY CHECK too.
  2. Fix all `blocker` + `playability` before new content.
  3. When **you** find a bug: append ## Open **and commit `BUGS.md` on `agent/*`** same cycle.
- Do not clear ## Open without a fix + evidence.

================================================================
PLAY CHECK (builder-owned — do not skip)
================================================================

Light UI smoke runs every LIVE LOOP. **PLAY CHECK** is a deeper economy pass on
a schedule so layers/features do not stack on a broken title screen.

**Phase 4:** every **5** cycles (N divisible by 5 — at **P4-0** before P4-1):
1. Boot `pnpm run dev` → `/autonomous-lab/` → **Play** (zero pageerror).
2. **Economy path (~60s):** click primary currency ≥5 times (counter rises);
   buy ≥1 generator if affordable; open layer strip / switch layer if unlocked;
   if prestige available on current layer, screenshot prestige panel (need not
   confirm reset unless seeded fast-forward hook exists).
3. Screenshot `demo/play-check/cycle-N.png` (main UI + readable numbers + layer
   nav if built).
4. **`read_image`** → PASS/FAIL (not blank, numbers readable, not error overlay).
5. FAIL → BUGS ## Open + FIX-ONLY on `agent/*` — no P4-1 until PASS.
6. PASS → log `PLAY_CHECK: cycle-N PASS` in PROGRESS NOW.

**Phase 2:** every **10** content cycles (C10, C20, …) — same; path
`demo/play-check/C<N>.png`.

External validators are watchdogs; **you** own playable truth on the agent branch.

================================================================
LAYER CAP — experimental depth target
================================================================

  LAYER_CAP = 50          # human may raise in PROGRESS before long runs (stretch 150)
  SPECIAL_EVERY = 10      # layers 10, 20, 30… get special mechanics (documented)
  PHASE4_BULK = 10        # adding layers in Phase 4: +10 per bulk FEATURE cycle max

After M12: engine must support **at least** layers 1–20 procedural; vitest
`simulateToLayer(20)` green.

Phase 2: flesh out **special layers** at 10, 20, 30, 40, 50 (one per C-cycle max).

Phase 2b soak target: **simulateToLayer(50)** green (fast-forward sim, not browser).

Phase 4: raise LAYER_CAP in steps (50 → 75 → 100 → 125 → 150) via **bulk layer
data** cycles — never one layer per cycle as the default expansion mode.

Record current LAYER_CAP and `deepest_soak_layer` in PROGRESS NOW every ACCEPT.

================================================================
GAME — Signal Ascent (Celestial-inspired layered prestige incremental)
================================================================

Fantasy: **Signal Ascent** — harvest cosmic **Signal**, build **Relays**,
ascend through **Strata** (prestige layers). Inspired by deep prestige idle
games like [Celestial Incremental](https://galaxy.click/play/470) (multi-layer
progression, check-back, long horizon) but **original names/mechanics** — not
a TMT port, not a clone.

Core loop per layer N:
- Click + generators produce layer currency
- Upgrades multiply rates
- Hit threshold → **Ascend** (prestige) → grant **Harmonics** (meta currency)
- Ascending resets layer N state; keeps deeper layer progress + Harmonics stack
- Layer N+1 unlocks; procedural names/colors from `layerDef(N)`

Visual tone: dark nebula background, readable panels, large formatted numbers,
layer strip / mini-tree always visible (address navigation pain from Celestial-style
games), subtle CSS motion, optional click particle burst (tiny canvas OK).

================================================================
ARCHITECTURE (decided — do not change)
================================================================

- **Client-only** single-player. No multiplayer, no Node game server.
- **LayerEngine + EconomyEngine** in `src/systems/`:
    - `EconomyEngine.step(state, dt)` — fixed 20 Hz tick; all production math here.
    - `LayerEngine` — layerDef(N), prestige(N), reset rules, global mult stack.
    - **Never** put production formulas only in DOM click handlers.
- **Data-driven layers** in `src/data/`:
    - `layers.ts` — layerDef(N) factory (threshold, names, colors, gen templates)
    - `generators.ts`, `upgrades.ts`, `specialLayers.ts` (10, 20, 30… overrides)
    - UI reads registries; vitest tests without DOM.
- **Big numbers**: `decimal.js` or tested `{ mantissa, exponent }`. Display suffixes
  then scientific. No raw JS number for balances past ~1e15.
- **simulateToLayer(N, seed?)`** in `tests/simulate.ts` — fast-forward buy script;
  assert no NaN, prestige reachable each layer, no soft-lock to target N. This is
  the **primary truth** for layer depth — run every P4-0 and after layer cap changes.
- **Offline progress**: `min(elapsedMs, OFFLINE_CAP_MS)` through engine (default 8h).
- **Check-back lite** (M12+): passive production for **non-active** layers at reduced
  rate (e.g. 25%) — must be vitest-tested; Celestial-style "tabs idle" without
  requiring the player to sit on one tab.
- **Save** key `signal-ascent-save-v1`: `{ version, settings, state, meta }`.
  state includes per-layer currencies/gens/upgrades, harmonics, activeLayer,
  lastTickAt, stats. Migrate on version bump — document in shared/design.md.

FORBIDDEN:
- Modding Tree fork / TMT dependency as the core engine
- Hand-writing 100 unique layer **systems** (only special layers override template)
- Second economy engine; soft-locking prestige at any layer ≤ LAYER_CAP
- sessionStorage-only saves; cloud/auth/leaderboards

================================================================
PROJECT LAYOUT
================================================================

  src/main.ts
  src/app/                  // title, play shell, settings
  src/ui/                   // clicker, generators, upgrades, prestige, layerStrip, offlineModal
  src/systems/              // EconomyEngine, LayerEngine, OfflineService, CheckBackService
  src/services/             // SaveService, AudioService (optional)
  src/data/                 // layers, generators, upgrades, specialLayers
  src/lib/                  // bignum + format
  tests/                    // engine, prestige, save, simulateToLayer, soak
  tests/ui-smoke.spec.ts    // or demo/ui-smoke.mjs — wired into gate
  CONTENT.md FEATURES.md PROGRESS.md SOAK.md BUGS.md DEMO.md shared/design.md

================================================================
TESTING HARNESS (M1 — use forever)
================================================================

A) vitest:
   - EconomyEngine: ticks, buy gen, upgrades, no NaN
   - LayerEngine: prestige resets correct layer slice; harmonics > 0; mult > 1
   - simulateToLayer(20) then (50) as milestones progress
   - offline catch-up within cap
   - check-back: inactive layer gains at documented rate when active elsewhere
   - SaveService roundtrip + corrupt reset + post-prestige persist

B) Playwright UI smoke (mandatory in gate from M4):
   - zero pageerror; title → Play; click raises Signal; buy gen updates UI

C) tests/soak.ts: scripted buy path for simulated hours; layer reachability

D) **UI interaction gate (mandatory from M4):**
   Maintain `tests/ui-smoke.spec.ts` and/or `demo/ui-smoke.mjs` + `test:ui`.
   Run before every LIVE LOOP push; wire into `gate` when stable:
   `gate` = `npm test && npm run test:ui && npm run build` (or equivalent).

E) **PLAY CHECK** (scheduled): see PLAY CHECK section; every 5 P4 / 10 Phase 2 cycles.

================================================================
ECONOMY VISUAL (layer / special / upgrade pack changes — mandatory)
================================================================

Whenever you **add or visibly change** layer content (special layer, upgrade pack,
theme band, new automation UI), commit **in-game DOM** screenshots:

PATHS:
  demo/content/C<N>-layer-<id>.png       special layer or layer band
  demo/content/cycle-N-<feature>.png     Phase 4 feature proof
  demo/cycles/cycle-N.png                overview: main UI + layer strip
  demo/pre-pr/…                          LIVE LOOP

CAPTURE:
  1. Boot dev server, Play → main economy UI (zero pageerror).
  2. Playwright screenshot with **readable numbers** and **layer strip** visible.
  3. For special layer N: navigate to layer N (or debug seed) before shot.

FORBIDDEN as ECONOMY VISUAL:
  - Markdown tables, terminal output, CONTENT.md screenshots
  - Title-only / button count / file-size checks
  - Blank or unreadable number text

Validate with **`read_image`**: PASS only if numbers/panels/layer nav are readable.

================================================================
MILESTONES (M1–M12 — full ACCEPT in this file)
================================================================

Before each Mn: read **that Mn only**. When M12 ACCEPT → **PHASE GATE** (M12→Phase 2)
with `read_image` + LIVE LOOP, then Phase 2.

M1  Vite + TS scaffold on boilerplate clone. Title + Play shell. vitest smoke.
    PROGRESS.md NOW. shared/design.md stub (tick rate, save key).
    ACCEPT: `pnpm run gate` OK; Playwright title loads.

M2  Big-number lib + format. EconomyEngine: currency **Signal**, click +1.
    Theme **Signal Ascent** locked in CONTENT.md.
    ACCEPT: vitest: 100 clicks → Signal == 100; format(1.5e6) readable.

M3  Generators (≥3 types) with rising costs + production/sec. Buy in engine.
    ACCEPT: vitest: buy gen; after 20 ticks Signal increased by expected amount.

M4  Main PLAY UI: big click, Signal display, generator list, autosave stub.
    UI smoke harness D started.
    ACCEPT: Playwright: click raises Signal; buy gen updates count; zero pageerror.

M5  **LayerEngine** + **layerDef(N)** factory. Layers 1–3 procedural (names,
    thresholds, gen templates from N). Active layer state in save.
    ACCEPT: vitest: layerDef(1) ≠ layerDef(2); simulateToLayer(3) green with seed.

M6  Upgrades (≥5) with unlock conditions. Shop tab. Multipliers documented.
    ACCEPT: vitest: upgrade doubles rate as defined; Playwright: shop visible.

M7  **Layer strip / navigator** (always visible): shows layers 1..unlocked max,
    current layer highlighted, click to switch. "You are here: Stratum N" header.
    ACCEPT: Playwright: strip visible with ≥2 layers after unlock; `read_image` PASS.

M8  **Ascend (prestige)** on active layer: threshold → confirm → reset layer slice;
    grant **Harmonics**; permanent mult stack. Prestige panel UI.
    ACCEPT: vitest: ascend grants harmonics > 0, mult > 1; layer currency reset;
    Playwright: prestige panel visible when threshold met (seed ok).

M9  Layers 4–10 procedural from factory. simulateToLayer(10) green.
    Buy-max toggle on generators.
    ACCEPT: vitest: simulateToLayer(10) no NaN, each prestige reachable;
    SOAK.md records simulateToLayer(10) pass.

M10 Offline catch-up + modal (capped). Settings: notation, reduceMotion, volume.
    ACCEPT: vitest: 60s offline catch-up; cap enforced; Playwright: modal once.

M11 **Special layer 10** template in specialLayers.ts (unique modifier — e.g.
    challenge softcap or bonus harmonics — document in CONTENT.md). Achievements
    bar (≥8). Stats panel (total clicks, time, highest layer).
    ACCEPT: vitest: special layer 10 rules apply; achievement unlocks once;
    Playwright: achievement or stats visible.

M12 **Check-back lite** (inactive layers produce at 25% — tune in design.md).
    Full SaveService + hard reset confirm. simulateToLayer(20) green.
    Mobile-ish single column layout. 5-min vitest soak green.
    ACCEPT: vitest: check-back + simulateToLayer(20) + save through ascend;
    Playwright full smoke; SOAK.md simulateToLayer(20) pass.

When M12 done → PHASE GATE → Phase 2.

================================================================
PHASE 2 — special layer cycles until LAYER_CAP specials defined
================================================================

Goal: define **special layers** at 10, 20, 30, 40, 50 (and document formulas).
Do **not** add layers one-by-one as separate engines — extend specialLayers +
layerDef overrides only.

BUDGET: 50 cycles OR all five special layers ACCEPT OR 120 min Phase 2.

CYCLE (C1, C2, …)

  C-0  Read BUGS.md ## Open → fix blocker/playability. `npm test` green.
       On C10, C20, … run **PLAY CHECK** before C-1.
  C-1  FEATURES.md before code. **One** special layer band OR upgrade pack OR
       automation stub OR theme CSS band per cycle. REJECT: new engine, >8 files,
       breaks simulateToLayer reachability.
  C-2  Implement; update CONTENT.md special layer docs; extend vitest +
       simulateToLayer for affected layer range.
  C-3  `npm test` green; **ECONOMY VISUAL** for the slice; `read_image` PASS;
       LIVE LOOP.
  C-4  PROGRESS NOW: special layers done [10,20,…], next C.

When budget met and specials through 50 documented → PHASE GATE → Phase 2b.

================================================================
PHASE 2b — layer soak (once, before DEMO)
================================================================

Run **simulateToLayer(50)** (seed documented in SOAK.md) + tests/soak.ts
**10 min** or **200 batches**. Log deepest layer, harmonics, any soft-lock seeds.

INVARIANTS:
1. No NaN / Infinity in any currency or rate through layer 50 sim.
2. Prestige/Ascend reachable at every layer ≤ 50 in sim script.
3. Save → load restores layer progress + harmonics.
4. Check-back does not exceed documented rate caps.
5. Deterministic sim for fixed seed.

Fix BUGS on fail. No Phase 3 until Phase-2b green + PHASE GATE (2b→3) + LIVE LOOP.

================================================================
PHASE 3 — DEMO (checkpoint — then Phase 4 forever)
================================================================

One continuous Playwright recording — real UI clicks where possible.

STORYBOARD (visible, in order)
0. Title + Play/Continue
1. Main UI: Signal counter + click target + layer strip (layer 1 active)
2. Click several times; Signal increases
3. Buy ≥1 generator; rate/owned updates
4. Buy or reveal ≥1 upgrade
5. Layer strip shows ≥2 layers; switch layer once (if unlocked)
6. (Seeded / INCREMENTAL_FAST=1 ok) Ascend layer 1 → Harmonics visible
7. simulate or play to layer 2–3 UI; strip shows progress
8. Hold settled UI ≥2s (numbers readable in frame)

STEPS: demo/record.mjs; demo/demo.webm; demo/frames/ per step; DEMO.md visual
validation with **`read_image`** per frame. PHASE3-DONE only when all PASS.
PHASE GATE (3→4) + LIVE LOOP. Do **not** complete the goal → Phase 4.

ACCEPT: non-empty webm; zero console errors; every frame `read_image` PASS.

================================================================
PHASE 4 — infinite expand (never stop alone)
================================================================

Cycle forever until a human kills this process. Never delete demo/ artifacts.
**Default FEATURE bias:** deepen layer cap + Celestial-ish systems at template level.

CYCLE N (repeat forever)

  P4-0  Read BUGS.md ## Open → fix blocker/playability.
        Run simulateToLayer(current LAYER_CAP) — must green before features.
        Mini-soak ~20 batches OR ~10 min. On N divisible by 5: **PLAY CHECK**
        before P4-1 — FAIL → FIX-ONLY.
        Log deepest_soak_layer in PROGRESS.

  P4-1  FEATURES.md BEFORE code (≤10 min). Pick ONE:
        A) POLISH (prefer odd): number format, layer strip UX, click VFX, themes,
           balance ±20%, accessibility, offline modal, buy-max UX, copy.
        B) FEATURE (prefer even — default when soak green):
           - **Bulk +10 layers** (raise LAYER_CAP; layerDef only — max ~5 files)
           - special layer for new band (every SPECIAL_EVERY)
           - new upgrade pack (2–5 upgrades) per layer band
           - automation (auto-buy cheapest gen / auto-ascend when safe)
           - check-back rate upgrade or new passive subsystem
           - achievement pack / evolution-style meta shop (harmonics sink)
           - challenge modifier for a layer band
           - theme skin CSS for strata band
        Write: cycle id, A/B, goal, files (cap ~8), ACCEPT tests including
        simulateToLayer after cap change.
        REJECT: second engine, TMT import, multiplayer, cloud, >8 files, >2h,
        soft-lock at any layer ≤ LAYER_CAP, human spreadsheet required.

  P4-2  Smallest change. Update CONTENT.md layer formulas + LAYER_CAP in PROGRESS.
        Bump save version only if schema changes; migrate documented.

  P4-3  Prove: vitest + simulateToLayer(LAYER_CAP) green; UI change → Playwright +
        ECONOMY VISUAL + `read_image`; mini-soak; storyboard change → re-record
        demo/demo.webm (keep .prev); commit `cycle N: <A|B> <goal>`; tag `cycle-N`;
        LIVE LOOP push agent branch.

  P4-4  PROGRESS NOW: LAYER_CAP, harmonics depth summary, deepest soak, cycle N+1.
        Handoff every 5 cycles (include PLAY CHECK + simulateToLayer result).

**Stretch goals** (Phase 4, after LAYER_CAP ≥ 100):
- simulateToLayer(150) green
- jukebox/settings stub, save bank UI stub (no cloud)
- "hall of ascensions" stats lore panel (CSS only)

FORBIDDEN IN PHASE 4
- Second economy engine; deleting prestige/harmonics; weakening layer sim checks
- Shipping without P4-3; multiple unrelated features per cycle
- Stopping or marking the goal complete

Flow: M1–M12 → PHASE GATE → Phase 2 specials → PHASE GATE → Phase 2b
simulateToLayer(50) → PHASE GATE → Phase 3 demo.webm → PHASE GATE → Phase 4 forever.

Bootstrap the boilerplate clone first (BOILERPLATE REPO block), then begin M1.
If false COMPLETE claims exist, run the lie detector and resume at the first real gap.
