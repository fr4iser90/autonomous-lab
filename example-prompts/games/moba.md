DSH RUNTIME (this harness, not pi)
- You are unattended. Nobody will answer. Never ask questions, never wait, never stop to summarize for a human.
- If PROGRESS.md exists, read it and resume at the first unfinished milestone. Do not restart from M1. If DEMO.md exists with visual validation PASS (or PHASE3-DONE is set) and Phase 4 has not been abandoned, skip straight to Phase 4 — do not re-record the demo unless validation failed or the storyboard changed. If the NOW block contains `STOP_AFTER_DEMO: true`, after PHASE3-DONE mark the goal complete and STOP — do not enter Phase 4 (demo-only run; human sets that flag in PROGRESS before resume).
- Start by calling create_goal with this whole overnight job and a high max_goal_rounds (at least 200). Never mark the goal complete on your own — a human must kill the process, except when STOP_AFTER_DEMO applies after Phase 3. Phase 3 DEMO is a checkpoint; Phase 4 runs until interrupted.
- After every milestone: write PROGRESS.md (refresh the NOW block), then continue with tools. A text-only assistant message without a tool call ends this process — that is a failure. Always leave a next tool call (tests, soak, fix, or the next milestone).
- Default model: use the session default from dsh settings (agent-default-model / the model named `fast`). Do not hardcode GGUF ids.
- For gnarly netcode, desync, invariant root-cause, or architecture bugs: spawn a subagent with agentOptions.provider = jarvis (or your configured provider) and agentOptions.model = the **id** of the settings entry whose **name** is `smart` (not the display label alone — look up id from settings). If no `smart` entry exists, stay on the session default. Apply the fix yourself.
- Vision (VL): when validating Playwright DEMO frames, optional CC0 GLTF packs, or milestone arena screenshots, spawn a vision-capable subagent (prefer the strongest VL slot this harness exposes). Use VL to ACCEPT/REJECT asset candidates and per-step storyboard visibility — never to invent game rules. If no VL is available, Read extracted frames yourself and record the fallback in DEMO.md / ASSETS.md; do not stop waiting for VL.
- Playwright: if mcp__playwright__* tools exist, use them for visual checks. Otherwise use npx playwright / bash. Headless WebSocket tests are the fast loop; browsers only at milestone end.
- Pin Three.js to r128 (CDN). Work inside the boilerplate clone (see BOILERPLATE REPO block).
- Kill leftovers with `kill "$(cat .game.pid)"` and `fuser -k "$(cat .game.port)/tcp"` when those files exist, confirm the port is not listening, start (`run_in_background: true`), write `$!` to `.game.pid` and the bound TCP port to `.game.port` (reuse that file if it exists), then wait for a health/HTTP check on that port before any client. Never `pkill`/`killall`/`pgrep` by interpreter name (`node`, `python`) — that kills this harness. `job_kill` only stops jobs from this session. pnpm install (prefer) before the first npm start.

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
   `agent/moba-<YYYYMMDD>` (add `-HHMM` if the day already exists).
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
  CONTENT.md    Theme, maps, hero roster, minion spawn table — not a second PROGRESS.
  ASSETS.md     Optional CC0 GLTF paths, licenses, id→path, VL notes.
  shared/protocol.md  Wire protocol; keep in sync with code.
  README.md     How to run: install, start, port files, controls. Create
                in M1; update when scripts change.

On context loss: re-read PROGRESS.md (NOW block) first, then the docs
above that the change touches, then resume. One home per fact.

================================================================
You are a senior multiplayer game engineer building a 3D online MOBA from
scratch, fully autonomously, overnight. Nobody will answer questions.
Never wait for input, never ask permission. Work until every milestone
meets its acceptance criteria. Work inside the boilerplate clone (see BOILERPLATE REPO block).

This is a hard project. The rules below exist because they prevent the
specific ways this project fails. Follow them exactly. Do not re-derive
the architecture - it is already decided; spend your reasoning on
correct implementation, not on second-guessing these decisions.

================================================================
ARCHITECTURE (decided - do not change)
================================================================

- Authoritative server. The server owns ALL game state and is the only
  thing that decides outcomes. Clients send INPUTS only and RENDER
  snapshots only. A client never computes damage, movement resolution,
  deaths, or gold. If you ever find yourself writing game logic in the
  client, stop and move it to the server.

- HTTP and WebSocket share one TCP port: the port this project binds. After listen, write that exact number to `.game.port`. If `.game.port` already exists, bind that same port.

- Fixed timestep simulation. The server runs a fixed 20 Hz tick
  (dt = 50ms). All simulation advances in whole ticks. Never simulate
  using wall-clock deltas. Each tick has an integer index; snapshots are
  stamped with their tick.

- The world is 2D for simulation, 3D only for rendering. The server
  simulates on the X-Z ground plane (top-down 2D: position {x, z},
  velocity, radius). Y is always 0 in simulation. The client maps server
  (x, z) to Three.js (x, y=modelHeight, z). Never do 3D physics on the
  server. Collision is 2D circle-vs-circle and circle-vs-AABB.

- Client rendering uses snapshot interpolation with a render delay.
  The client keeps a buffer of the last ~3 snapshots and renders the
  world INTERPOLATED at (now - 100ms) between the two snapshots that
  straddle that time. This hides jitter. Do NOT implement client-side
  prediction or rollback - it is out of scope and will break you. Local
  input may optimistically move only the local camera target, nothing
  authoritative.

- Session mode: one authoritative server only — no offline/singleplayer
  fork. Solo = one human client on a team + bots fill all other hero
  slots (both teams). Co-op/versus = humans join either team; empty slots
  are bots via server/ai.js. Match ends when a nexus dies (gameover).
  Rematch fully resets state. Disconnect mid-match: slot becomes a bot;
  rejoin allowed — must not crash.

================================================================
ENTRY UI (uniform shell — required)
================================================================

Every online game uses the same three-screen client flow before gameplay:

  1. TITLE — full-page `#title-screen`: game title (from CONTENT.md theme),
     optional tagline, name `<input>` (default "Player"), [Join] button.
     No WebSocket gameplay until Join (or Enter in the name field).
  2. LOBBY — after Join connects: `#lobby-screen` with player list, mapId
     label or picker when ≥2 maps, team slots, countdown or host Start.
     Solo: bots fill all other hero slots on both teams after countdown.
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

- Match / session state is server memory only — rematch wipes gameplay
  (entities, gold, scores). Do not persist match progress.
- Client SettingsService in public/settings.js (localStorage key
  `moba-settings-v1`):
    { version: 1, displayName, sfxVolume, musicVolume }
  Prefill title-screen name from displayName; write back on Join and when
  a settings control changes. Corrupt JSON → defaults + one console warn.
  Schema note in shared/protocol.md.
- No world save, no meta-progression, no cloud / global leaderboard.
- Headless/vitest: SettingsService roundtrip with mock localStorage.

================================================================
CONTENT & VARIATION (agent chooses within bounds — no human)
================================================================

- Theme: pick ONE coherent fantasy/sci-fi MOBA skin and record it in
  CONTENT.md — one paragraph max (mesh colors, team names, ability names).
- Maps: at least TWO distinct arena JSON files under map/ (e.g.
  arena-single-lane.json, arena-three-lane.json). Each has two bases,
  nexuses, lane waypoints, wall AABBs. Layouts must differ. Server
  selects mapId on join or in lobby.
- Hero roster: at least TWO playable hero archetypes (e.g. bruiser +
  mage) with distinct Q/W/E/R in config.js; bots may use either.
- Minions, towers, shop items: names and stats match the theme.
- Minion spawn schedule: record in CONTENT.md as one table (waveIndex or
  tickOffset → count per lane / team). When spawn logic changes, add or
  update a headless regression in server/test/ that asserts the table for
  at least one wave index (same pattern as blaze WaveSystem vitest).

================================================================
THEME & ART DIRECTION (agent chooses — no human)
================================================================

3D visuals use Three.js meshes in public/render.js. Default: procedural
primitives (capsules, boxes) with team colors, fog, and simple particles.

Optional upgrade from M4 onward: download CC0 low-poly GLTF (Kenney,
Quaternius, or similar clear license) into public/assets/raw/ then
public/assets/models/. Record every kept file in ASSETS.md (id → path →
URL → license). Primitives remain valid fallback if a model fails to load.

Rules:
  1. CC0 / clear redistribution only; no paid stock or scraped game assets.
  2. YOU choose packs, scale, and team tinting; never ask a human.
  3. VL gate when available: ACCEPT models that read as one style at arena
     scale; REJECT mixed packs or broken GLTF.
  4. Do not block milestones on animation rigs — static meshes only.

================================================================
WIRE PROTOCOL (decided)
================================================================

JSON messages over one WebSocket per client. Every message: {t, ...}
where t is the type string.

Client -> Server:
  {t:"join", name}
  {t:"input", seq, move:{x,z}, aim:{x,z}}
  {t:"cast", seq, slot:"Q"|"W"|"E"|"R", target:{x,z}}
  {t:"buy", itemId}
  {t:"ping", ts}

Server -> Client:
  {t:"welcome", playerId, tickRate, mapId}
  {t:"lobby", players:[...], countdown}
  {t:"snapshot", tick, you:{gold,...}, ents:[ ...entities... ]}
  {t:"event", tick, kind:"death"|"levelup"|"towerDown"|"nexusDown"|
     "hit"|"cast", data}
  {t:"gameover", winner}
  {t:"pong", ts}

An entity in a snapshot is a flat object:
  {id, kind:"hero"|"minion"|"tower"|"nexus"|"projectile",
   team:0|1, x, z, hp, maxHp, ...kind-specific}

================================================================
SERVER ENTITY MODEL (decided)
================================================================

One in-memory Game object per match holds entities keyed by integer id.
Every entity has {id, kind, team, x, z, radius, hp, maxHp} plus kind-
specific fields. Each tick, in this fixed order:
  1. apply queued client inputs to their heroes
  2. run AI (minions path along lane waypoints; towers acquire nearest
     valid enemy; bots decide inputs)
  3. integrate movement (clamp to map, resolve collisions)
  4. resolve attacks/abilities/projectiles, apply damage, handle deaths
     (award gold/xp, start respawn timers), emit events
  5. check win condition
  6. build and broadcast the snapshot for this tick

Lanes are polylines of waypoints in the active map JSON; minions follow
them. Record map choices in CONTENT.md.

================================================================
PROJECT LAYOUT
================================================================

  package.json         // "start": "node server/index.js", dep: ws
  server/index.js      // http static server + ws + match manager
  server/game.js       // Game class: tick loop, entities, rules
  server/map.js        // load/validate map/*.json
  server/ai.js         // minion/tower/bot behavior
  server/config.js     // all tunable constants (speeds, dmg, cds, gold)
  map/*.json           // ≥2 arena layouts
  CONTENT.md           // theme, map list, hero roster, spawn table
  ASSETS.md            // optional GLTF mapping
  FEATURES.md          // Phase 4 decide journal
  BUGS.md              // soak / Phase 4 root-cause log
  README.md            // how to run (M1+)
  PROGRESS.md          // resume journal (NOW block on top)
  SOAK.md
  DEMO.md
  public/index.html    // #title-screen, #lobby-screen, canvas + HUD + CDN Three.js
  public/style.css     // title, lobby, HUD chrome
  public/settings.js   // SettingsService — localStorage settings-only
  public/client.js     // ws, input, snapshot buffer, interpolation, render
  public/render.js     // Three.js scene, meshes, camera
  shared/protocol.md   // the wire protocol + settings schema note, kept in sync with code
================================================================
TESTING HARNESS (build this in milestone 1, use it forever)
================================================================

You cannot verify multiplayer by hand. Build automated tests:

A) server/test/headless-client.js : a Node script using the `ws` package
   that connects as a fake client, can send join/input/cast, and asserts
   on received snapshots. Use TWO headless clients in one script to test
   interaction without a browser. This is your fast, deterministic test
   loop - run it after every change.

B) Playwright for the RENDERING path: open TWO browser pages for
   versus/co-op checks (solo demo may use one page + bots on both teams),
   confirm zero console errors, screenshot both, verify heroes move and
   HUD values update.

C) server/test/demo-seed.js — headless script with a fixed seed that
   drives a full match to nexus death (gameover); demo/record.mjs reuses
   this seed when real-time play is too slow.

A milestone is DONE only when its assertions pass AND both browser
consoles are clean.

================================================================
DEBUGGING & ANTI-STUCK DISCIPLINE
================================================================

- Determinism first: same inputs -> same ticks. Route ALL randomness
  through one seeded RNG. Add a "replay" mode that feeds scripted inputs
  so you can reproduce a bug without a browser.
- When something is wrong, do NOT guess-and-edit. Add structured logging
  (tick, entity id, before/after values) for the suspect system,
  reproduce with a headless test, read the numbers, form ONE hypothesis,
  test it.
- Time-box each milestone. After 3 failed fixes on a feature: write the
  failure and what you tried into PROGRESS.md, ship the simplest version
  that passes a reduced check, move on. Never let one feature block the
  whole night.
- Keep PROGRESS.md as a real engineering journal. If you lose context,
  re-read PROGRESS.md, shared/protocol.md, CONTENT.md, server/game.js,
  and public/client.js, then resume at the first unfinished milestone.
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
    ACCEPT: headless test connects two clients, server reports 2
    players, one disconnects and drops cleanly. Playwright: title screen
    loads; fill name, click Join, lobby visible; two tabs connect, no
    console errors. README.md and PROGRESS.md exist.

M2  Authoritative movement + interpolation. 20Hz tick, input moves the
    hero server-side, snapshots broadcast, client renders all heroes as
    boxes with snapshot interpolation at now-100ms.
    ACCEPT: headless client sending "move +x" for 1s sees its hero.x
    increase monotonically and stop at the wall; a second client sees it
    move. Playwright: two tabs move independently, no desync after 60s.

M3  3D arena + camera. Write ≥2 map/*.json layouts. Three.js map per
    mapId: two bases, a nexus per team, lane(s) with walls, ground,
    lighting/fog. Isometric follow camera with edge-pan. Server map data
    (wall AABBs, lane waypoints) matches the visual map.
    ACCEPT: heroes cannot walk through walls on each map. Playwright:
    map renders identically on both clients for the joined mapId; camera
    follows the local hero.

M4  Hero stats + auto-attack. hp/mana/movespeed/attack range+damage+speed
    in config.js. Server auto-attacks nearest enemy in range, applies
    damage, handles death + respawn timer at base. HUD shows hp/mana/
    respawn.
    ACCEPT: headless - two enemy heroes in range, one's hp decreases at
    the configured rate, hits 0, respawns after the timer. Playwright:
    damaged hero's healthbar drops on BOTH clients.

M5  Abilities Q/W/E/R (R = ultimate). A skillshot projectile, a targeted
    nuke, a dash/shield, and an ultimate. Client requests cast; server
    validates cooldown/mana/range, spawns the effect, applies damage,
    emits an event; client shows cooldown UI.
    ACCEPT: headless - casting Q at an enemy reduces its hp only on a
    hit; on cooldown is rejected. Playwright: abilities visibly damage
    the other player across the network.

M6  Minions. Waves spawn from each nexus on a timer, path the lane
    waypoints, auto-attack enemies in range, die, grant last-hit gold.
    ACCEPT: headless - waves from both teams meet mid-lane and fight;
    last-hitting a minion increments only the killer's gold. Playwright:
    minions visibly march and fight.

M7  Towers. Per-lane towers attack the nearest valid enemy (standard
    aggro), have hp, and block progress: the nexus is invulnerable until
    its lane tower(s) are down.
    ACCEPT: headless - a tower kills minions in range; a hero cannot
    damage the nexus until the tower is destroyed. Playwright: tower
    fires, can be destroyed by a hero+minion push.

M8  Economy + shop + bots. Gold from minions/towers/kills; a base shop
    for 3-4 stat items; death/respawn scaling. ai.js fills empty hero
    slots on BOTH teams. Solo = one human + bots everywhere else.
    ACCEPT: headless - buying an item raises the right stat and deducts
    gold; a bot-vs-bot match runs 3 minutes without the server crashing;
    one-human-plus-bots match starts and processes ticks.

M9  Match flow. Title → lobby (name + Join) → match; solo = one human +
    bots fill all slots; fill empty slots with bots; start countdown; match;
    win when a nexus dies → victory/defeat screen + rematch that fully
    resets state.
    ACCEPT: headless - forcing a nexus to 0 hp ends the match with the
    correct winner; rematch resets all entities and gold. Playwright:
    title → join lobby → play → win/lose screen → rematch works.

M10 Robustness + settings + final QA. SettingsService roundtrip (name +
    volumes) survives reload. A client disconnecting mid-match is replaced
    by a bot with no crash and can rejoin; snapshot size stays bounded; a
    5-minute two-client-plus-bots match runs with no errors and no
    unbounded memory growth. Then a full end-to-end Playwright match with
    TWO real browser clients: title name prefilled from settings; move, cast,
    last-hit, destroy a tower, kill the enemy nexus, see the win screen -
    zero console errors on both clients and the server. Write the final
    PROGRESS.md.

Bootstrap the boilerplate clone first (BOILERPLATE REPO block), then start M1 on top of it (testing harness
before writing any gameplay.

When M10 is done, immediately begin Phase 2 without waiting:

PHASE 2 - bounded soak-testing and bug-hardening. The MOBA is playable
per PROGRESS.md. You are now a QA + reliability engineer. Zero bugs is
the standard: any crash, error, or invariant violation is a defect that
must be root-cause fixed, not silenced. Do NOT soak forever. Re-read
PROGRESS.md, shared/protocol.md, CONTENT.md, server/game.js, server/ai.js,
and public/client.js first.

STEP 0 - build the soak harness (before anything else)

Create server/test/soak.js: a headless driver that runs FULL bot-vs-bot
matches with no browser, as fast as possible (uncapped tick), one after
another until the budget below is met. Each match uses a numbered seed
so it is reproducible. All randomness goes through one seeded RNG in
config.js.

soak.js must, every match: run to a nexus death or a hard tick cap
(a match that never ends is a bug), check the invariants below after
every tick, and on the FIRST violation freeze and save the seed + tick +
full input/event log to server/test/repros/<seed>-<tick>.json. Track a
"clean streak" of consecutive fully-clean matches.

BUDGET (hard stop — first that hits ends Phase 2)
- 200 clean matches, OR
- clean streak of 50 consecutive fully-clean matches, OR
- 90 minutes wall-clock soak time
Failed runs do not count as clean. Fix, then continue toward the same
budget. When the budget is met → Phase 3.

INVARIANTS - must hold on EVERY tick of EVERY match

  1. No exceptions (wrap the tick in try/catch that RE-THROWS after
     logging - crashing the soak is correct, swallowing errors is not).
  2. No NaN/Infinity/undefined in any numeric field.
  3. hp in [0,maxHp]; mana in [0,maxMana]; gold >= 0; cooldowns >= 0.
  4. Every position is inside map bounds and not inside a wall AABB.
  5. Entity ids unique; despawned entities never referenced; projectiles
     always cleaned up.
  6. Snapshot is valid JSON, references only existing ids, under a size
     cap.
  7. Gold is conserved: granted == sum of bounties (none created/lost).
  8. Every match terminates before the tick cap (no soft-lock, no two
     immortal entities stuck forever).
  9. No unbounded growth over a match (entity count, event queue, arrays
     stay bounded).
 10. Determinism: the same seed twice produces byte-identical tick logs.

THE LOOP (until budget met)

  1. Run a batch of soak matches across many seeds.
  2. If any match violated an invariant, crashed, or soft-locked:
       a. Reproduce from the saved repro (deterministic).
       b. Add structured logging, reproduce, read the numbers, confirm
          ONE hypothesis.
       c. Fix the ROOT CAUSE. Never clamp/hide a symptom (e.g. do not
          Math.max(0, hp) to dodge invariant 3 - find why it went
          negative).
       d. Add the failing seed as a permanent regression case.
       e. Re-run regressions + the batch; continue only when green.
       f. Log symptom, seed, root cause, fix in BUGS.md.
  3. If the batch was clean, RAISE THE STRESS for the next batch within
     the remaining budget: more bots / bigger waves / more projectiles;
     bots that spam abilities; bots that buy everything instantly;
     random mid-match disconnects and rejoins; many matches back-to-back
     (cross-match state bleed, leaks); edge positions (wall-hugging,
     stacking, off-map casts); very long matches near the tick cap.
  4. Every ~50 matches, run ONE real two-client Playwright match end to
     end and confirm zero console errors on both clients and the server.
  5. Append a status line to SOAK.md (total matches, clean streak, bugs
     found+fixed, current stressor, peak counts, budget remaining).
     When budget is met → Phase 3.

RULES
- Never weaken an invariant or a test to make it pass.
- Prefer fast headless soak for finding bugs; Playwright only for the
  periodic render/network confirmation.
- Keep fixes minimal; re-run regressions after every fix.
- If context runs low, write a crisp handoff in SOAK.md so a fresh
  session resumes soak or Phase 3.

================================================================
PHASE 3 - DEMO record (checkpoint — then Phase 4)
================================================================

After Phase 2 budget is met, record a DEMO. One **continuous** automated
match from lobby through **gameover** — not a highlight montage. Prefer
Playwright video (webm). If mcp__playwright__* tools exist, use them;
else npx playwright.

STORYBOARD (must appear VISIBLY in the recording, in order)
0. Title screen: game name, name field, Join button visible
1. Lobby: two browsers join OR one browser (solo) + bots fill all slots
2. Match starts; both teams visible in the 3D arena
3. Local hero moves; camera follows
4. Cast at least one ability (Q/W/E/R) — cast/VFX/projectile visible
5. Last-hit a minion (or clear damage to a minion wave)
6. Destroy a lane tower
7. Kill enemy nexus → win/defeat screen — hold ≥2s so HUD text is readable

STEPS
1. Boot the real game server from this tree (pid/port as usual).
2. Write demo/record.mjs driving the storyboard above. Reuse
   server/test/demo-seed.js when needed so gameover occurs within ~5 min
   while still showing real UI actions (move, cast, etc.).
3. Record to demo/demo.webm and/or demo/demo.gif. Fixed viewport
   (1280×720). Hold win/defeat screen ≥2s.
4. Write DEMO.md draft: storyboard checklist, seed, mapId, solo vs
   two-browser note, artifact path, zero console errors.
5. VALIDATE THE RECORDING (mandatory — watch it, do not trust logs alone)
   Extract frames to demo/frames/ (early/mid/combat/gameover). For EACH
   storyboard step, confirm it is VISIBLE. Prefer VL on frames
   (ACCEPT/REJECT per step: moved? cast? minion? tower? win screen?).
   Without VL: Read the frames yourself. Write ## Visual validation in
   DEMO.md with per-step PASS/FAIL. On any FAIL: fix recorder/seed,
   re-capture, re-validate. hp of entities must not go negative in the
   capture path either (clamp/fix if seed left tower at -1).
6. Append PHASE3-DONE to PROGRESS.md only after visual validation all
   PASS. Do NOT mark the goal complete. Immediately begin Phase 4.

ACCEPT
- demo/demo.webm or demo/demo.gif exists and is non-empty.
- DEMO.md lists every storyboard step, artifact path, AND visual
  validation PASS for every step (with frame refs).
- Recording actually shows title → lobby → move → cast → combat → gameover
  (not black screen, not empty arena, not HUD-only).
- Recording run had zero console errors.

RESUME RULE
- If this workdir already has PHASE3-DONE + DEMO.md visual PASS: skip
  Phase 3 and enter Phase 4 immediately on resume.

================================================================
PHASE 4 — infinite improve / feature loop (never stop alone)
================================================================

Phase 3 DEMO exists. You are now a product engineer + QA. Cycle forever
until a human kills this process. Do not declare the job "done". Never
delete demo/ artifacts. Journal: FEATURES.md, SOAK.md, PROGRESS.md.

CYCLE N (repeat forever)

  P4-0  Mini-soak gate
        Run server/test/soak.js for ~20 clean matches OR ~10 minutes.
        On invariant fail → FIX-ONLY (root-cause, regression, Playwright
        if UI), then return to P4-0. Never invent features on a red soak.

  P4-1  Decide (max 10 minutes — write BEFORE coding)
        Pick ONE of:
          A) POLISH (prefer odd cycles): hero mesh/VFX, ability telegraph,
             HUD, camera, tower/minion silhouettes, win-screen, bot
             last-hit quality, fog/lighting.
          B) FEATURE (even cycles): new shop item, new ability effect
             polish within existing QWER slots, jungle camp (small),
             ward/vision pickup, rematch UI polish, second hero archetype
             stats skin (same kit), announcer event text.
        Write in FEATURES.md: cycle id, A/B, goal, options, pros/cons,
        approach, files (cap ~8), ACCEPT. REJECT if it needs prediction/
        rollback, new engine, >8 files, >2h, or breaks invariants /
        authoritative server rules.

  P4-2  Implement — smallest change; update CONTENT.md / ASSETS.md /
        protocol.md when behavior changes. No drive-by refactors.

  P4-3  Prove (mandatory)
        1. Headless regression green.
        2. Visual/UI change → Playwright on real clients, zero console
           errors, demo/cycles/cycle-N.png (or .webm). VL when available.
        3. Mini-soak regression (~20 clean / ~10 min).
        4. Storyboard changed → re-record demo/demo.webm; keep
           demo/demo.prev.webm.
        5. LAB GIT: already on `agent/<run-id>` (see BOILERPLATE REPO block).
           After green: commit on that branch with `cycle N: <A|B> <goal>`;
           optional tag `cycle-N`. Push + PR so Pages updates (LIVE LOOP).
           Never push / force-push `main` / `baseline`. Zip only every 10 cycles → `releases/cycle-N.zip` (+ phase3 zip).

  P4-4  Log + next
        Append to FEATURES.md and PROGRESS.md (latest tag). Always next
        tool call (cycle N+1). Handoff every 5 cycles.

FORBIDDEN IN PHASE 4
- Client-side damage/authority; rewriting agent-loop-style netcode;
  Three.js version churn for no reason
- Shipping without P4-3; multiple features per cycle; weakening invariants
- Stopping or marking the goal complete
- Pushing `main`/`baseline` or force-push; zipping every cycle (use LIVE LOOP on agent/*)

Begin with STEP 0 after M10: soak → Phase 3 DEMO → Phase 4 forever.