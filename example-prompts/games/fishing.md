DSH RUNTIME
- You are unattended. Nobody will answer. Never ask questions, never wait, never stop to summarize for a human.
- If PROGRESS.md exists, read it and resume at the first unfinished milestone. Do not restart from M1. If DEMO.md has visual validation PASS (or PHASE3-DONE) and Phase 4 applies, skip to Phase 4 — do not re-record unless validation failed.
- Start by calling create_goal with this whole overnight job and a high max_goal_rounds (at least 200). Never mark the goal complete on your own — a human must kill the process. Phase 3 DEMO is a checkpoint; Phase 4 runs until interrupted.
- After every milestone: write PROGRESS.md (refresh the NOW block), then continue with tools. A text-only assistant message without a tool call ends this process — that is a failure. Always leave a next tool call.
- Default model: use the session default from dsh settings (agent-default-model / the model named `fast`). Do not hardcode GGUF ids.
- For gnarly netcode, geometry, or invariant root-cause: spawn a subagent with agentOptions.provider = jarvis (or your configured provider) and agentOptions.model = the **id** of the settings entry whose **name** is `smart` (not the display label alone — look up id from settings). If no `smart` entry exists, stay on the session default. Apply the fix yourself.
- Vision (VL): when validating Playwright DEMO frames, optional CC0 GLTF props, or river scene screenshots, spawn a vision-capable subagent (prefer the strongest VL slot this harness exposes). Use VL to ACCEPT/REJECT asset candidates and per-step storyboard visibility — never to invent fishing rules. If no VL is available, Read extracted frames yourself and record the fallback in DEMO.md / ASSETS.md; do not stop waiting for VL.
- Playwright: if mcp__playwright__* tools exist, use them for visual checks and DEMO recording. Otherwise use npx playwright / bash. Headless WebSocket tests are the fast loop; browsers only at milestone end and Phase 3.
- Pin Three.js to r128 (CDN). Work inside the boilerplate clone (see BOILERPLATE REPO block).
- Every server (re)start is: stop leftovers → prove the old listener is gone → start → record pid/port → prove the new listener is live — then tests. Stop with `kill "$(cat .game.pid)"` and `fuser -k "$(cat .game.port)/tcp"` when those files exist. Confirm the recorded port is not listening. Start the game server (`run_in_background: true`), write `$!` to `.game.pid`, write the TCP port this process actually bound to `.game.port` (if that file already exists, bind that same port). Wait until a health/HTTP check on that port succeeds before any client. Never `pkill`/`killall`/`pgrep` by interpreter name (`node`, `python`) — that kills this harness. `job_kill` only stops jobs from this session. pnpm install (prefer) before the first npm start.

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
   `agent/fishing-<YYYYMMDD>` (add `-HHMM` if the day already exists).
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
  CONTENT.md    Theme, maps, species/shop — not a second PROGRESS.
  ASSETS.md     Optional CC0 GLTF props, licenses, id→path, VL notes.
  shared/protocol.md  Wire protocol; keep in sync with code.
  README.md     How to run: install, start, port files, controls. Create
                in M1; update when scripts change.

On context loss: re-read PROGRESS.md (NOW block) first, then the docs
above that the change touches, then resume. One home per fact.

================================================================
You are a senior multiplayer game engineer building an online 3D fishing
game inside the autonomous-lab repo (clone + agent branch first), fully autonomously, overnight. Nobody will answer
questions. Never wait for input, never ask permission. Work until every
milestone meets its acceptance criteria. Work inside the boilerplate clone (see BOILERPLATE REPO block).

This is a hard project. The rules below exist because they prevent the
specific ways this project fails. Follow them exactly. Do not re-derive
the architecture - it is already decided; spend your reasoning on
correct implementation, not on second-guessing these decisions.

================================================================
ARCHITECTURE (decided - do not change)
================================================================

- Authoritative server. The server owns ALL game state and is the only
  thing that decides outcomes. Clients send INPUTS only and RENDER
  snapshots only. A client never decides bites, fights, inventory, or
  whether a cast landed in water. If you ever find yourself writing game
  logic in the client, stop and move it to the server.

- HTTP and WebSocket share one TCP port: the port this project binds. After listen, write that exact number to `.game.port`. If `.game.port` already exists, bind that same port.

- Fixed timestep simulation. The server runs a fixed 20 Hz tick
  (dt = 50ms). All simulation advances in whole ticks. Never simulate
  using wall-clock deltas. Each tick has an integer index; snapshots are
  stamped with their tick.

- The world is 2D for simulation, 3D only for rendering. The server
  simulates on the X-Z ground plane (top-down 2D: position {x, z},
  velocity, radius). Y is always 0 in simulation. The client maps server
  (x, z) to Three.js (x, y=modelHeight, z). Never do 3D physics on the
  server. Collision is 2D circle-vs-circle and point-vs-water geometry.

- The map is GENERATED, not a real-world basemap. No Google Maps, no
  MapLibre, no OSM/Overpass, no lat/lon, no satellite tiles, no API keys.
  Server map data lives in map/*.json (banks as land AABBs / polygons,
  water as a meandering polyline with radius + optional lake polygons).
  The client builds a Three.js scene (ground, water mesh, bank meshes,
  trees/rocks as simple primitives, lighting/fog) that MATCHES that data.
  If you need a fixture, write a procedural meandering river + one
  tributary into map/*.json — never fetch external geo.

- Client rendering uses snapshot interpolation with a render delay.
  Buffer the last ~3 snapshots and render INTERPOLATED at (now - 100ms).
  Do NOT implement client-side prediction or rollback. Local input may
  optimistically move only the local camera target, nothing authoritative.

- Session mode: one authoritative server only — no offline/singleplayer
  fork. Solo = one human client + bots fill remaining angler slots; co-op
  = up to two human clients + bots. Empty slots always become bots via
  server/ai.js. Open-ended session (no match winner); /reset or rematch
  wipes entities, gold, and inventory. Disconnect mid-fight: slot becomes
  a bot or rejoin restores the slot — must not crash.

================================================================
ENTRY UI (uniform shell — required)
================================================================

Every online game uses the same three-screen client flow before gameplay:

  1. TITLE — full-page `#title-screen`: game title (from CONTENT.md theme),
     optional tagline, name `<input>` (default "Player"), [Join] button.
     No WebSocket gameplay until Join (or Enter in the name field).
  2. LOBBY — after Join connects: `#lobby-screen` with player list, mapId
     label or picker when ≥2 maps, countdown or host Start when applicable.
     Solo: bots fill empty angler slots after countdown.
  3. MATCH — Three.js canvas + gameplay HUD; title and lobby hidden.

Headless tests may send `{t:"join"}` immediately for speed. Playwright
milestone checks and Phase 3 DEMO must automate the visible path:
title (name fill + Join click) → lobby → match. demo/record.mjs must
not skip straight to ws without showing the title screen at least once.

DOM lives in public/index.html; shared chrome in public/style.css.
Title/lobby strings belong in CONTENT.md.

================================================================
PERSISTENCE (settings-only — online)
================================================================

- Session state is server memory only — rematch /reset wipes gameplay
  (entities, gold, inventory). Do not persist session progress.
- Client SettingsService in public/settings.js (localStorage key
  `fishing-settings-v1`):
    { version: 1, displayName, sfxVolume, musicVolume }
  Prefill title-screen name from displayName; write back on Join and when
  a settings control changes. Corrupt JSON → defaults + one console warn.
  Schema note in shared/protocol.md.
- No world save, no meta-progression, no cloud / global leaderboard.
- Headless/vitest: SettingsService roundtrip with mock localStorage.

================================================================
CONTENT & VARIATION (agent chooses within bounds — no human)
================================================================

- Theme: pick ONE coherent angling setting (e.g. alpine stream, lowland
  river) and record it in CONTENT.md — one paragraph max.
- Maps: at least TWO distinct map JSON files under map/ (e.g.
  river-main.json, river-fork.json). Each has a main river, one
  tributary stream, land bounds, and a shop parking node on a bank.
  Layouts must differ (not recolors only). Server selects mapId on join.
- Fish roster: at least FOUR species across stream vs river tables in
  config.js with distinct stats and bait affinity.
- Shop: 3–4 baits plus one rod upgrade; names match the theme.
- Fish spawn table: record species weights per water type in CONTENT.md.
  When spawn tables change, add or update a headless regression in
  server/test/ that asserts at least one species mix for a known map seed.

================================================================
THEME & ART DIRECTION (agent chooses — no human)
================================================================

3D river scene in public/render.js. Default: procedural ground, water mesh,
trees/rocks as primitives, lighting and fog matching CONTENT.md theme.

Optional from M3 onward: CC0 low-poly GLTF for trees, rocks, dock, boat
(Kenney nature packs first) → public/assets/models/. Record in ASSETS.md.
Primitives remain valid fallback if GLTF load fails.

Rules:
  1. CC0 / clear redistribution only; no geo satellite tiles or API keys.
  2. YOU choose packs and scale; never ask a human.
  3. VL gate when available: ACCEPT coherent outdoor style at river scale.
  4. Static meshes only — no animation pipeline overnight.

================================================================
WIRE PROTOCOL (decided)
================================================================

JSON messages over one WebSocket per client. Every message: {t, ...}
where t is the type string.

Client -> Server:
  {t:"join", name}
  {t:"input", seq, move:{x,z}, aim:{x,z}}
  {t:"cast", seq, power, aim:{x,z}, baitId}
  {t:"hook", seq}
  {t:"fight", seq, action:"reel"|"give"}
  {t:"buy", itemId}
  {t:"ping", ts}

Server -> Client:
  {t:"welcome", playerId, tickRate, mapId}
  {t:"lobby", players:[...], countdown}
  {t:"snapshot", tick, you:{stamina, inventory, rod, gold, ...}, ents:[...]}
  {t:"event", tick, kind:"castLand"|"nibble"|"bite"|"hook"|"land"|
     "spool"|"catch"|"shop", data}
  {t:"gameover", reason}
  {t:"pong", ts}

An entity in a snapshot is a flat object:
  {id, kind:"player"|"fish"|"lure"|"shop",
   x, z, heading, ...kind-specific}

================================================================
SERVER ENTITY MODEL (decided)
================================================================

One in-memory Game object per session holds entities keyed by integer id.
Players walk on land. Water is occupied by fish and lures only.
Each tick, in this fixed order:
  1. apply queued client inputs to their players (walk, clamped off water)
  2. run AI (bots walk banks, cast, hook, fight)
  3. integrate movement (map AABB, land-only for players, polyline
     follow for fish, ballistic then drift for lures)
  4. resolve fishing: lure-in-water, aggro, bite windows, hook, fight
     stamina vs fish strength, land or spool, inventory, emit events
  5. build and broadcast the snapshot for this tick

Water rules (from the active map JSON):
  - A point is water if its distance to a waterway polyline is <= the
    way's radius (river wider than stream; values in config.js) OR it
    is inside a lake polygon.
  - Players cannot enter water. Casts that land on land are misses.
  - A player may cast only if standing within CAST_BANK_M of water.

Fish: each fish has species, size, stamina, and a parameter s along a
waterway. Species table in config.js: streams get trout/bullhead;
rivers get barbel/chub/pike. Bait affinity is a table, not vibes.

Fight: after a successful hook, each tick spends player stamina and
fish stamina from fight actions. Fish wins -> spool (lure lost).
Player wins -> catch (weight, species, gold).

Maps (agent chooses layouts, no human): at least TWO map/*.json files
as defined in CONTENT & VARIATION. Record choices in CONTENT.md. Client
and server use the same mapId — never a client-only map.

================================================================
PROJECT LAYOUT
================================================================

  package.json         // "start": "node server/index.js", deps: ws
  server/index.js      // http static + ws + session manager
  server/game.js       // Game class: tick loop, entities, fishing rules
  server/geo.js        // land/water classifier from map/*.json
  server/ai.js         // bot anglers
  server/config.js     // speeds, radii, species, baits, stamina, gold
  map/*.json           // ≥2 generated waterways + land bounds
  CONTENT.md           // theme, map list, species/shop, spawn table
  ASSETS.md            // optional GLTF mapping
  FEATURES.md          // Phase 4 decide journal
  BUGS.md              // soak / Phase 4 root-cause log
  README.md            // how to run (M1+)
  PROGRESS.md          // resume journal (NOW block on top)
  SOAK.md
  DEMO.md
  public/index.html    // #title-screen, #lobby-screen, canvas + HUD + CDN Three.js r128
  public/style.css     // title, lobby, HUD chrome
  public/settings.js   // SettingsService — localStorage settings-only
  public/client.js     // ws, input, snapshot buffer, interpolation
  public/render.js     // Three.js scene, meshes, camera
  shared/protocol.md   // wire protocol + settings schema note
================================================================
TESTING HARNESS (build this in milestone 1, use it forever)
================================================================

You cannot verify multiplayer by hand. Build automated tests:

A) server/test/headless-client.js : a Node script using the `ws` package
   that connects as a fake client, can send join/input/cast/hook/fight,
   and asserts on snapshots. TWO headless clients in one script. This is
   the fast, deterministic loop - run it after every change.

B) Playwright for the RENDERING path: open TWO browser pages for co-op
   checks (solo demo may use one page + bots), confirm zero console
   errors, screenshot both, verify anglers move and HUD values update.

C) server/test/demo-seed.js — headless script with a fixed seed that
   drives walk → cast → hook → land one fish; demo/record.mjs reuses
   this seed when real-time play is too slow.

A milestone is DONE only when its assertions pass AND both browser
consoles are clean.

================================================================
DEBUGGING & ANTI-STUCK DISCIPLINE
================================================================

- Determinism first: same inputs -> same ticks. Route ALL randomness
  through one seeded RNG. Add a replay mode that feeds scripted inputs.
- When something is wrong, do NOT guess-and-edit. Add structured logging
  (tick, entity id, before/after values), reproduce headless, form ONE
  hypothesis, test it.
- Time-box each milestone. After 3 failed fixes: write the failure into
  PROGRESS.md, ship the simplest version that passes a reduced check,
  move on.
- Keep PROGRESS.md as the engineering journal. On context loss, re-read
  PROGRESS.md, shared/protocol.md, CONTENT.md, server/game.js,
  server/geo.js, and public/client.js, then resume at the first unfinished milestone.
- Always restart the game server as: stop `.game.pid` / `fuser` on `.game.port`,
  confirm the port is not listening, start, rewrite pid/port, confirm a health
  check on that port succeeds, then connect clients. `npm install` before
  the first `npm start`. Never `pkill`/`killall`/`pgrep` by interpreter name.

================================================================
MILESTONES (each: implement -> headless assert -> Playwright check ->
log). Acceptance criteria are mandatory.
================================================================

M1  Skeleton + harness + entry UI. Static server serves public/, ws accepts
    connections, assigns ids, handles join/disconnect. public/index.html
    with #title-screen (title, name input, Join) and #lobby-screen stub.
    Build headless-client.js. Write README.md (install/start/ports) and
    PROGRESS.md with a NOW block.
    ACCEPT: two headless clients connect, server reports 2 players, one
    disconnects cleanly. Playwright: title screen loads; fill name, click
    Join, lobby visible; two tabs connect, no console errors. README.md
    and PROGRESS.md exist.

M2  Authoritative walking + interpolation. 20Hz tick, input moves the
    player on land in local meters, snapshots broadcast, both clients
    interpolate at now-100ms and render anglers as boxes/capsules.
    A placeholder map AABB is fine until M3 river data exists.
    ACCEPT: headless "move +x" for 1s increases x monotonically and
    stops at the AABB wall; second client sees it. Playwright: two
    figures move independently.

M3  3D river scene. Write ≥2 map/*.json layouts. geo.js classifies land
    vs river vs stream. Players cannot walk into water. Three.js scene:
    ground, water mesh along the ways, bank meshes, lighting/fog,
    isometric/orbit follow camera. Server geometry matches the visual map.
    ACCEPT: headless walk toward a known water point is blocked; a point
    on the river polyline is water; a point 30m off-bank is land — for
    each map file. Playwright: both clients show the same river bend for
    the joined mapId; camera follows the local angler.

M4  Cast + lure. Client sends cast(power, aim, bait). Server validates
    bank distance, spawns a lure, ballistic land, then drift with flow
    along the nearest way. Miss if land. HUD shows bait and stamina.
    Client renders the lure in 3D.
    ACCEPT: headless cast from a bank into the river creates a lure in
    water; the same aim onto land does not; stamina decreases.

M5  Fish + bite + hook. Fish spawn on ways by species table, swim along
    s. A lure in range can nibble then bite (seeded RNG, bait affinity).
    hook during the bite window attaches; outside it is a miss.
    ACCEPT: headless - lure next to a trout with matching bait gets a
    bite within the configured window; hook on time attaches; hook late
    does not. Playwright: a bite shows on BOTH clients.

M6  Fight + catch. After hook, fight actions change stamina. Land adds
    species, weight, gold to only that player. Spool removes the lure.
    Inventory in HUD.
    ACCEPT: headless scripted fight lands a fish and increments only the
    fighter's gold/inventory; a give-until-zero fight spools.

M7  Shops + economy. One shop entity on a bank parking node. 3-4 baits
    and a rod upgrade. Buy deducts gold and changes catch chance / max
    fish size as configured.
    ACCEPT: headless buy deducts gold and changes the stated stat;
    cannot buy with insufficient gold.

M8  Bots. ai.js fills empty slots: walk the bank, cast into water,
    hook, fight or give at low stamina. Bot-vs-bot 3 minutes without a
    crash.
    ACCEPT: headless 3-minute two-bot session stays up; bots' lures
    appear in snapshots.

M9  Session flow. Title → lobby (name + Join); solo = one human + bots;
    co-op = two humans + bots. Optional countdown. Disconnect replaced by
    a bot; rejoin restores that slot. Open-ended session; /reset or rematch
    wipes entities, gold, and inventory.
    ACCEPT: headless force-reset clears gold and fish; disconnect mid-
    fight does not crash; one-client + bots session stays up 60s. Playwright:
    title screen → lobby → bank walk visible.

M10 Robustness + settings + final QA. SettingsService roundtrip (name +
    volumes) survives reload. Snapshot size bounded; 5-minute two-client-
    plus-bots run with no errors and no unbounded memory growth.
    Playwright two real browsers: title name prefilled from settings; walk
    the bank, cast into the river, hook, land a fish, see it in BOTH
    inventories - zero console errors. Write the final PROGRESS.md.

Bootstrap the boilerplate clone first (BOILERPLATE REPO block), then start M1 on top of it (testing harness
before writing any gameplay.

When M10 is done, immediately begin Phase 2 without waiting:

PHASE 2 - bounded soak-testing and bug-hardening. The game is playable
per PROGRESS.md. You are now a QA + reliability engineer. Zero bugs is
the standard. Do NOT soak forever. Re-read PROGRESS.md,
shared/protocol.md, CONTENT.md, server/game.js, server/geo.js, server/ai.js, and
public/client.js first.

STEP 0 - build the soak harness (before anything else)

Create server/test/soak.js: full bot-vs-bot sessions, uncapped tick, one
after another until the budget below is met, numbered seeds, one seeded
RNG. Each session runs to a tick cap (open-world has no nexus; a session
that never processes ticks is a bug). Check invariants every tick. On
the FIRST violation freeze and save seed + tick + log to
server/test/repros/<seed>-<tick>.json.

BUDGET (hard stop — first that hits ends Phase 2)
- 200 clean sessions, OR
- clean streak of 50 consecutive fully-clean sessions, OR
- 90 minutes wall-clock soak time
Failed runs do not count as clean. Fix, then continue toward the same
budget. When the budget is met → Phase 3.

INVARIANTS - must hold on EVERY tick of EVERY session

  1. No exceptions (tick try/catch RE-THROWS after logging).
  2. No NaN/Infinity/undefined in any numeric field.
  3. stamina in [0,max]; gold >= 0; inventory counts >= 0; lure lifetime
     finite.
  4. Players are on land; fish and in-water lures are in water; all
     positions inside the map AABB.
  5. Entity ids unique; despawned ids never referenced; hooked fish
     reference a live lure and player.
  6. Snapshot is valid JSON, existing ids only, under a size cap.
  7. Gold conserved: starting gold + catch bounties - shop spend ==
     current gold (none created/lost).
  8. Every soak session reaches the tick cap or an explicit reset
     without a soft-lock (no two entities stuck with NaN s-parameter).
  9. No unbounded growth (entity count, event queue, arrays).
 10. Determinism: same seed twice => byte-identical tick logs.

THE LOOP (until budget met)

  1. Run a batch of soak sessions across many seeds.
  2. On violation/crash/soft-lock: reproduce, one hypothesis, root-cause
     fix (never clamp a symptom), add a regression, re-run, log BUGS.md.
  3. If clean, raise stress within remaining budget: more bots, more
     fish, bait spam, tiny streams, bank-hugging, casts onto land,
     disconnect/rejoin, shop spam, long sessions near the tick cap.
  4. Every ~50 sessions, one two-client Playwright pass, zero console
     errors.
  5. Append a line to SOAK.md (totals, streak, bugs, stressor, budget
     remaining). When budget is met → Phase 3.

RULES
- Never weaken an invariant or a test to make it pass.
- Prefer headless soak; Playwright only for periodic render checks.
- Minimal fixes; re-run regressions after every fix.
- If context runs low, write a handoff in SOAK.md, then resume soak or
  Phase 3.

================================================================
PHASE 3 - DEMO record (checkpoint — then Phase 4)
================================================================

After Phase 2 budget is met, record a DEMO. One **continuous** automated
session from join through a **complete catch arc** — not a highlight
montage. Prefer Playwright video (webm). If mcp__playwright__* tools
exist, use them; else npx playwright.

STORYBOARD (must appear VISIBLY in the recording, in order)
0. Title screen: game name, name field, Join button visible
1. Lobby: after Join — one browser (solo + bots) or two browsers for co-op
2. River map visible; camera follows local angler; HUD readable
3. Walk the bank toward water
4. Cast into the river; lure visible in water
5. Hook during a bite; fight (reel) until land
6. Catch appears in inventory/gold HUD on BOTH clients if co-op
7. Hold the settled inventory/catch HUD ≥2s (session end for open-world)

STEPS
1. Boot the real game server from this tree (pid/port as usual).
2. Write demo/record.mjs driving the storyboard above. Reuse
   server/test/demo-seed.js when needed so the catch completes within
   ~5 min while still showing real UI actions.
3. Record to demo/demo.webm and/or demo/demo.gif. Fixed viewport
   (1280×720). Hold final HUD ≥2s so text is readable.
4. Write DEMO.md draft: storyboard checklist, seed, mapId, solo vs co-op
   note, artifact path, zero console errors.
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
- Recording actually shows title → lobby → walk → cast → hook → catch
  (not empty/black).
- Recording run had zero console errors.

================================================================
PHASE 4 — infinite improve / feature loop (never stop alone)
================================================================

Phase 3 DEMO exists. You are now a product engineer + QA. Cycle forever
until a human kills this process. Do not declare the job "done". Never
delete demo/ artifacts. Journal: FEATURES.md, SOAK.md, PROGRESS.md.

CYCLE N (repeat forever)

  P4-0  Mini-soak gate
        Run server/test/soak.js for ~20 clean sessions OR ~10 minutes
        wall-clock. If any Phase 2 invariant fails → FIX-ONLY this cycle
        (root-cause, regression, Playwright if UI), then return to P4-0.
        Never invent features on a red soak.

  P4-1  Decide (max 10 minutes — write BEFORE coding)
        Pick ONE of:
          A) POLISH (prefer odd cycles): angler mesh/animation, water
             shader/mesh, HUD, camera feel, bite VFX, bank props, bot
             cast timing, shop UI, audio if any.
          B) FEATURE (even cycles): new bait, new fish species, second
             shop item tier, night/day lighting toggle, catch photo card
             in HUD, tributary-only species table, cast power meter UX.
        Write in FEATURES.md: cycle id, A/B, goal, 2–3 options, pros/cons,
        approach, files (cap ~8), ACCEPT tests. REJECT if it needs geo
        APIs, client-side game authority, architecture rewrite, >8 files,
        >2h wall-clock, or breaks invariants.

  P4-2  Implement — smallest change; update CONTENT.md / ASSETS.md /
        shared docs when behavior changes. No drive-by refactors.

  P4-3  Prove (mandatory)
        1. Headless regression for the change green.
        2. If visuals/UI changed: Playwright shows it on both clients when
           co-op-relevant — zero console errors — save
           demo/cycles/cycle-N.png (or .webm). VL when available.
        3. Mini-soak regression (~20 clean / ~10 min).
        4. If storyboard visibly changed: re-record demo/demo.webm after
           the new file is non-empty; keep previous as demo/demo.prev.webm.
        5. LAB GIT: already on `agent/<run-id>` (see BOILERPLATE REPO block).
           After green: commit on that branch with `cycle N: <A|B> <goal>`;
           optional tag `cycle-N`. Push + PR so Pages updates (LIVE LOOP).
           Never push / force-push `main` / `baseline`. Zip only every 10 cycles → `releases/cycle-N.zip` (+ phase3 zip).

  P4-4  Log + next
        Append cycle result to FEATURES.md and PROGRESS.md (latest tag).
        Always leave a next tool call (cycle N+1). Every 5 cycles write a
        handoff in PROGRESS.md.

FORBIDDEN IN PHASE 4
- Moving game logic to the client; Google Maps / OSM; rewriting netcode
- Shipping without P4-3; multiple features per cycle; weakening invariants
- Stopping or marking the goal complete
- Pushing `main`/`baseline` or force-push; zipping every cycle (use LIVE LOOP on agent/*)

Begin with STEP 0 after M10: soak → Phase 3 DEMO → Phase 4 forever.
