DSH RUNTIME
- You are unattended. Nobody will answer. Never ask questions, never wait, never stop to summarize for a human.
- If PROGRESS.md exists, read it and resume at the first unfinished milestone. Do not restart from M1. If DEMO.md has visual validation PASS (or PHASE3-DONE) and Phase 4 applies, skip to Phase 4 — do not re-record unless validation failed.
- Start by calling create_goal with this whole overnight job and a high max_goal_rounds (at least 300). Never mark the goal complete on your own — a human must kill the process. Phase 3 DEMO is a checkpoint; Phase 4 runs until interrupted.
- After every milestone / Phase 4 cycle: write PROGRESS.md (refresh the NOW block), then continue with tools. A text-only assistant message without a tool call ends this process — that is a failure. Always leave a next tool call.
- Default model: use the session default from dsh settings (agent-default-model / the model named `fast`). Do not hardcode GGUF ids.
- For economy balance explosions, save-schema migration, big-number edge cases, or prestige soft-lock root-cause: spawn a subagent with agentOptions.provider = jarvis (or your configured provider) and agentOptions.model = the **id** of the settings entry whose **name** is `smart` (not the display label alone — look up id from settings). If no `smart` entry exists, stay on the session default. Apply the fix yourself.
- Vision (VL): when validating Playwright DEMO frames or UI screenshots, spawn a vision-capable subagent when available. Use VL to confirm readable numbers, panels, and theme coherence — never to invent economy formulas. Without VL: Read frames yourself; log PASS/FAIL in DEMO.md.
- Playwright: if mcp__playwright__* tools exist, use them for DEMO and visual checks. Otherwise npx playwright / bash. Vitest is the fast loop (economy sim, prestige, save); browsers at milestone end, Phase 3, and UI-touching Phase 4 cycles.
- Stack: Vite + TypeScript + DOM UI (no Phaser, no Three.js, no WebSocket server). Pin typescript + vite in package.json. Work inside the boilerplate clone (see BOILERPLATE REPO block).
- Preview server: stop leftovers → prove port free → `npm run dev` (`run_in_background: true`) → write `$!` to `.game.pid` and bound port to `.game.port` → health-check HTTP before Playwright. Never `pkill`/`killall`/`pgrep` by interpreter name. `pnpm install` (prefer) before first start.

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
   `agent/incremental-<YYYYMMDD>` (add `-HHMM` if the day already exists).
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

  PROGRESS.md   Resume journal. NOW = phase, milestone/cycle, last ACCEPT,
                latest git tag, currency/prestige depth summary.
  SOAK.md       Soak totals / streak / bugs / budget only.
  BUGS.md       Root-cause fixes.
  DEMO.md       Storyboard + visual validation per step.
  FEATURES.md   Phase 4 decide log (pros/cons) before each cycle.
  CONTENT.md    Theme, currency list, generator table, upgrade table,
                prestige layers — single home for economy content.
  shared/design.md  Tick order, save schema, UI panels, notation.
  README.md     install, `npm run dev`, ports, how to play.

On context loss: read PROGRESS.md NOW first, then CONTENT.md economy tables.

================================================================
GAME FANTASY (agent picks ONCE — then fixed)
================================================================

Pick ONE coherent incremental/idle fantasy and stick to it (examples:
"nebula scrap forge", "pixel bakery empire", "deep-sea signal harvest").
Record the name + one paragraph in CONTENT.md on first write. Do not
re-theme mid-job.

Core fantasy must support: a primary clickable resource, buildings that
generate that resource over time, upgrades that multiply rates, at least
one prestige/reset layer that grants a permanent multiplier, and room to
add more currencies and layers in Phase 4.

Visual tone: clean readable UI (cards/panels), large formatted numbers,
progress bars, subtle CSS motion — not a twin-stick arena. Prefer CSS +
DOM; optional tiny Canvas for a click feedback particle burst only.

================================================================
ARCHITECTURE (decided — do not change)
================================================================

- **Client-only** single-player idle game. No multiplayer, no Node game
  server, no authoritative remote sim.
- **Data-driven economy** in `src/data/` (currencies.ts, generators.ts,
  upgrades.ts, prestige.ts). UI reads registries; formulas live in
  `src/systems/` and are unit-tested without the DOM.
- **Fixed timestep economy tick** at 20 Hz (dt = 50ms) in a pure
  `EconomyEngine.step(state, dt)` — wall-clock only for offline catch-up
  and UI raf. Never put production math only in React/DOM handlers.
- **Big numbers**: use a small decimal / scientific notation helper
  (prefer a maintained dep such as `decimal.js`, or a tested internal
  `{ mantissa, exponent }` type). Display with short suffixes (K, M, B,
  T, … then scientific). Never use raw JS number for balances once they
  can exceed ~1e15.
- **Offline progress**: on load, apply `min(elapsedMs, OFFLINE_CAP_MS)`
  through the engine (default cap 8 hours). Show a summary modal once.
- **Simulation order each tick**:
    1. apply generator production → currencies
    2. apply passive upgrade multipliers (already baked into rates or applied here — pick one and document in shared/design.md)
    3. check unlock conditions / achievements
    4. clamp negatives to zero; assert no NaN/Infinity in debug builds

================================================================
ENTRY UI (uniform shell)
================================================================

  1. TITLE — game name, [Play] / [Continue], [Settings], optional short
     tagline. Continue loads save; Play starts or resumes.
  2. PLAY — main layout: resource header, big click target, generator
     list, upgrade shop tabs, prestige panel (locked until threshold).
  3. Settings overlay — volumes / number notation / reset save (confirm).

Playwright and DEMO must show title → Play/Continue → main economy UI.

================================================================
PERSISTENCE (full-save — arcade/idle)
================================================================

- SaveService (localStorage key `incremental-save-v1`):
    { version: 1, settings, state, meta }
  state: currencies, generator counts, owned upgrades, prestige currency,
  lastTickAt (epoch ms), unlock flags, stats (total clicks, total prestige).
  settings: sfxVolume, numberNotation (`suffix`|`scientific`), reduceMotion.
  meta: optional local "best prestige layer reached" / playtime — not a
  global leaderboard.
- Autosave every ~15s and on visibilitychange / beforeunload / prestige.
- Corrupt / wrong version → defaults + one console warn. Schema in
  shared/design.md.
- Vitest: SaveService roundtrip; offline catch-up increases currency;
  prestige resets layer-0 generators but keeps prestige currency.
- **One save profile** (not 3 world slots). Confirm-dialog hard reset only.
- No cloud / global leaderboard / auth.

================================================================
FORBIDDEN
================================================================

- Multiplayer, WebSocket, Phaser, Three.js, Unity, Godot
- Cloud leaderboards, remote score APIs, auth
- sessionStorage-only saves
- Putting production formulas only in click handlers (must be in engine)
- Soft-locking prestige (prestige must always be reachable in soak seeds)
- Weakening economy invariants to land a Phase 4 feature
- pkill/killall/pgrep by interpreter name
- Architecture rewrite or "second economy engine" mid-Phase-4

================================================================
PROJECT LAYOUT
================================================================

  package.json              // "dev": "vite", "test": "vitest run", "build": "vite build"
  vite.config.ts
  index.html
  src/main.ts
  src/app/                  // title, play shell, settings
  src/ui/                   // panels: clicker, generators, upgrades, prestige, offline modal
  src/systems/              // EconomyEngine, OfflineService, UnlockService
  src/services/             // SaveService, AudioService (optional Web Audio beeps)
  src/data/                 // currencies, generators, upgrades, prestige
  src/lib/                  // big-number + format
  tests/                    // vitest: engine, prestige, save, soak
  CONTENT.md
  FEATURES.md
  PROGRESS.md
  SOAK.md
  DEMO.md
  BUGS.md
  shared/design.md
  README.md

================================================================
TESTING HARNESS (M1 — use forever)
================================================================

A) vitest:
   - EconomyEngine: N ticks with 1 generator increase currency by expected rate
   - buy generator deducts cost and raises production
   - upgrade multiplier applies
   - prestige: resets layer-0 state, grants prestige currency, permanent mult > 1
   - offline: lastTickAt in the past → catch-up within cap
   - SaveService roundtrip + corrupt reset
   - format: 1.5e6 → readable suffix string

B) Playwright: zero console errors; title → play; click increases currency
   text; buy generator updates UI.

C) tests/soak.ts: run engine for simulated 24h at high speed with a scripted
   buy path; assert no NaN, currency non-decreasing except on prestige, and
   prestige threshold still reachable.

================================================================
MILESTONES
================================================================

M1  Vite + TS scaffold. Title + Play shell. vitest smoke. README +
    PROGRESS.md NOW. shared/design.md stub (tick rate, save key).
    ACCEPT: `npm run build` + `npm test` OK; Playwright title loads.

M2  Big-number lib + format helpers + EconomyEngine stub with one currency
    `scrap` and click → +1. CONTENT.md theme locked.
    ACCEPT: vitest: 100 clicks → scrap == 100 (exact); format(1500) readable.

M3  Generators registry (≥3 types) with cost curves (rising cost) and
    production/sec. Buy button; engine produces on tick.
    ACCEPT: vitest: buy gen0 once; after 20 ticks scrap increased by expected
    amount; cannot buy if unaffordable.

M4  Main PLAY UI: big click target, scrap display, generator list with
    costs and rates, autosave. Offline stub stores lastTickAt.
    ACCEPT: Playwright: click raises scrap; buy gen updates owned count.

M5  Upgrades (≥5) with unlock conditions (scrap earned or gens owned).
    Multipliers on click and/or generators. Shop tab UI.
    ACCEPT: vitest: owning upgrade U doubles click or gen rate as defined;
    Playwright: unlock appears when threshold met.

M6  Offline catch-up + summary modal (capped). Settings: notation toggle.
    ACCEPT: vitest: lastTickAt = now - 60s → +~60s production; cap enforced;
    Playwright: modal shows once then dismisses.

M7  Prestige layer 1: threshold on scrap (or total earned); confirm;
    reset gens/upgrades/scrap; grant prestige currency; permanent mult.
    Prestige panel UI. Save survives prestige.
    ACCEPT: vitest: prestige grants >0 prestige currency and mult > 1;
    layer-0 scrap == 0 after; Playwright: prestige flow visible.

M8  Second currency OR prestige shop (≥3 spends) that spend prestige
    currency for permanent bonuses. CONTENT.md tables complete for
    starter set. Audio click beep optional.
    ACCEPT: vitest: prestige buy changes permanent mult; soak seed can
    reach prestige in <10k simulated ticks.

M9  Achievements / milestones bar (≥8) that grant small one-time bonuses
    or cosmetics (CSS class). Stats panel (total clicks, time played).
    ACCEPT: vitest: achievement unlocks once; Playwright: toast or list update.

M10 Polish + QA: reduceMotion, hard-reset confirm, mobile-ish layout
    (max-width column), 5-minute vitest soak green, Playwright full smoke.
    Write PROGRESS.md.

When M10 is done → Phase 2 immediately.

================================================================
PHASE 2 — bounded soak
================================================================

Budget (first wins): 200 clean soak batches OR 50 clean streak OR 60 minutes.

INVARIANTS (every soak batch)
1. No NaN / Infinity in any currency or rate.
2. Currencies never negative.
3. Production over a fixed seed+buy script is deterministic (±0 for exact
   decimal, or documented epsilon for float mantissa).
4. Prestige threshold reachable with the scripted buy path.
5. Save → clear memory → load restores scrap and gen counts.
6. Offline catch-up ≤ OFFLINE_CAP_MS equivalent production.

On fail: fix, BUGS.md, continue budget. Prefer vitest soak; Playwright every
~25 batches. When budget met → Phase 3.

================================================================
PHASE 3 — DEMO record (checkpoint — then Phase 4)
================================================================

One continuous Playwright recording.

STORYBOARD (visible in order)
0. Title screen + Play/Continue
1. Main UI: scrap counter + big click target visible
2. Click several times; scrap increases
3. Buy at least one generator; owned count / rate updates
4. Buy or reveal at least one upgrade
5. (Seeded if needed) reach prestige threshold → confirm prestige →
   prestige currency / mult visible
6. Hold settled PLAY UI ≥2s (numbers readable)

STEPS: demo/record.mjs may inject a debug seed / fast-forward hook
(`INCREMENTAL_FAST=1`) so prestige fits in ~5 min — UI path must still be
real clicks/buys. Extract demo/frames/; ## Visual validation PASS/FAIL.
PHASE3-DONE only when all PASS. Do NOT mark goal complete → begin Phase 4.

ACCEPT: non-empty webm/gif; zero console errors; storyboard validated.

================================================================
PHASE 4 — infinite expand (never stop alone)
================================================================

Phase 3 DEMO exists. You are now a systems designer + QA for an idle game.
Cycle forever until a human kills this process. Do not declare the job done.
Never delete demo/ artifacts.

This genre thrives on expansion: **prefer FEATURE cycles** that add
economy content (new generators, upgrades, currencies, prestige layers,
automation) while keeping the engine + save schema coherent.

CYCLE N (repeat forever)

  P4-0  Mini-soak gate
        Run tests/soak.ts ~20 clean batches OR ~10 minutes. On fail →
        FIX-ONLY (root-cause, regression), then P4-0 again. Never invent
        features on a red soak.

  P4-1  Decide (≤10 min — write FEATURES.md BEFORE code)
        Pick ONE of:
          A) POLISH (prefer odd cycles): number formatting, panel layout,
             click VFX, balance tweaks (±20% costs/rates), copy, accessibility,
             offline modal UX, save UX.
          B) FEATURE (prefer even cycles — idle default bias toward B when
             soak is green): examples that FIT this architecture:
             - new generator tier
             - new upgrade pack (2–5 related upgrades)
             - new currency + sink (must wire production path)
             - prestige layer 2+ (reset rules documented)
             - automation ("auto-buy cheapest gen" toggle)
             - challenge / ascension modifier
             - achievement pack
             - theme skin CSS (still same fantasy)
        Write: cycle id, A/B, goal, 2–3 options, pros/cons, approach,
        files (cap ~8), ACCEPT tests.
        REJECT if: multiplayer, new engine, cloud LB, >8 files, >2h,
        breaks invariants, soft-locks prestige, or needs a human economy
        spreadsheet (keep formulas simple and documented in CONTENT.md).

  P4-2  Implement
        Smallest change. Update CONTENT.md tables whenever currencies /
        generators / upgrades / prestige change. Extend vitest in the same
        cycle. Bump save `version` only if schema fields added; migrate old
        saves or reset-with-warn — document in shared/design.md.
        No drive-by refactors.

  P4-3  Prove (mandatory)
        1. `npm test` green (new assertions for the feature).
        2. UI change → Playwright proof + demo/cycles/cycle-N.png|.webm;
           VL when available.
        3. Mini-soak regression.
        4. Storyboard changed → re-record demo/demo.webm; keep .prev.
        5. LAB GIT: already on `agent/<run-id>` (see BOILERPLATE REPO block).
           Commit `cycle N: <A|B> <goal>`; optional tag `cycle-N`. Push + PR (LIVE LOOP).
           Never push / force-push `main` / `baseline`.
           Zip every 10 cycles → `releases/cycle-N.zip`.

  P4-4  Log PROGRESS.md NOW (list currencies + prestige depth). Next = N+1.
        Handoff every 5 cycles.

FORBIDDEN IN PHASE 4
- Second economy engine; deleting prestige; weakening NaN/negative checks
- Shipping without P4-3; multiple unrelated features per cycle
- Stopping or marking the goal complete

Bootstrap the boilerplate clone first (BOILERPLATE REPO block), then begin M1.
