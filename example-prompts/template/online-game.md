# Online game skeleton

Copy this file to `PROMPTS/games/<name>.md` and replace every `{{PLACEHOLDER}}`.
Do not run this file with unfilled placeholders.

Authority: [`template/TEMPLATE.md`](TEMPLATE.md)

---

```
DSH RUNTIME
- You are unattended. Nobody will answer. Never ask questions, never wait, never stop to summarize for a human.
- If PROGRESS.md exists, read it and resume at the first unfinished milestone. Do not restart from M1. If DEMO.md has visual validation PASS (or PHASE3-DONE) and Phase 4 applies, skip to Phase 4 — do not re-record unless validation failed.
- Start by calling create_goal with this whole overnight job and a high max_goal_rounds (at least 200). Never mark the goal complete on your own — a human must kill the process. Phase 3 DEMO is a checkpoint; Phase 4 runs until interrupted.
- After every milestone: write PROGRESS.md (refresh the NOW block), then continue with tools. A text-only assistant message without a tool call ends this process — that is a failure. Always leave a next tool call.
- Default model: use the session default from dsh settings (agent-default-model / the model named `fast`). Do not hardcode GGUF ids.
- For {{HARD_PROBLEM_HINT}}: spawn a subagent with agentOptions.provider = jarvis (or your configured provider) and agentOptions.model = the **id** of the settings entry whose **name** is `smart` (not the display label alone — look up id from settings). If no `smart` entry exists, stay on the session default. Apply the fix yourself.
- {{VL_HINT}}
- Playwright: if mcp__playwright__* tools exist, use them for visual checks and DEMO recording. Otherwise use npx playwright / bash. Headless WebSocket tests are the fast loop; browsers only at milestone end and Phase 3.
- {{RENDERING_RUNTIME_LINE}}
- Every server (re)start is: stop leftovers → prove the old listener is gone → start → record pid/port → prove the new listener is live — then tests. Stop with `kill "$(cat .game.pid)"` and `fuser -k "$(cat .game.port)/tcp"` when those files exist. Confirm the recorded port is not listening. Start the game server (`run_in_background: true`), write `$!` to `.game.pid`, write the TCP port this process actually bound to `.game.port` (if that file already exists, bind that same port). Wait until a health/HTTP check on that port succeeds before any client. Never `pkill`/`killall`/`pgrep` by interpreter name (`node`, `python`) — that kills this harness. `job_kill` only stops jobs from this session. pnpm install (prefer) before the first start.

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
   `agent/{{GAME_SLUG}}-<YYYYMMDD>` (add `-HHMM` if the day already exists).
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
  SOAK.md       Soak totals / streak / bugs / budget only.
  BUGS.md       Root-cause fix log when soak/Phase 4 finds defects.
  DEMO.md       Storyboard checklist + demo artifact path(s).
  FEATURES.md   Phase 4: decide (pros/cons) before code; result after prove.
  CONTENT.md    Theme, maps, roster, spawn/wave tables — not a second PROGRESS.
  ASSETS.md     Pack URLs, licenses, logical id → path, VL notes.
  shared/protocol.md  Wire protocol; keep in sync with code.
  README.md     How to run: install, start, port files, controls. Create in M1.

On context loss: re-read PROGRESS.md (NOW block) first, then the docs
above that the change touches, then resume. One home per fact.

================================================================
{{JOB_TITLE}}
================================================================

{{JOB_DESCRIPTION}}

================================================================
CONTENT & VARIATION (agent chooses within bounds — no human)
================================================================

- Theme: pick ONE coherent theme; record in CONTENT.md (one paragraph max).
- Maps: at least {{MIN_MAPS}} distinct map JSON files under map/; layouts must differ.
- Roster: at least {{MIN_UNITS}} distinct playable or placeable types with distinct stats.
- Spawn/wave table: record in CONTENT.md as one table (index → composition/budget).
  When spawn logic changes, add or update a headless/vitest regression in server/test/.

{{CONTENT_EXTRA}}

================================================================
ARCHITECTURE (decided — do not change)
================================================================

- Authoritative server. Server owns ALL game state. Clients send INPUTS only and RENDER snapshots.
- HTTP and WebSocket share one TCP port; write bound port to `.game.port`.
- Fixed 20 Hz tick (dt = 50ms). Snapshots stamped with tick index.
{{ARCHITECTURE_BULLETS}}
{{SESSION_MODE_BULLETS}}
{{RENDERING_BULLETS}}

================================================================
ENTRY UI (uniform shell — required for online games)
================================================================

  1. TITLE — #title-screen: game title, name input, [Join] button.
  2. LOBBY — #lobby-screen after ws connect: player list, mapId, countdown.
  3. MATCH — gameplay canvas + HUD; title/lobby hidden.

Headless may join immediately; Playwright and Phase 3 DEMO must show
title → lobby → match. public/index.html + public/style.css.

================================================================
PERSISTENCE (settings-only — online)
================================================================

- Match / session state is server memory only — rematch wipes gameplay.
- Client SettingsService (localStorage key {{SAVE_KEY}}-settings-v1):
    { version: 1, displayName, sfxVolume, musicVolume }
  Prefill title-screen name from displayName; write back on Join / settings apply.
- Corrupt JSON → defaults + one console warn. Document schema in shared/protocol.md.
- No world save, no meta-progression, no cloud / global leaderboard.
- Vitest or headless node test: SettingsService roundtrip with mock localStorage.

================================================================
FORBIDDEN
================================================================

- Offline-only / duplicate singleplayer codebase
- Client-side authoritative damage, economy, or win detection
- Google Maps, MapLibre, OSM, lat/lon geo APIs
- pkill/killall/pgrep by interpreter name
- Unity, Godot, engine swap mid-job
- Cloud leaderboards, remote score APIs, or auth
- sessionStorage-only settings (must be localStorage)
{{FORBIDDEN_EXTRA}}

================================================================
PROJECT LAYOUT
================================================================

{{LAYOUT}}

================================================================
TESTING HARNESS (build in M1, use forever)
================================================================

A) server/test/headless-client.js — two fake ws clients; run after every change.
B) Playwright — zero console errors; HUD updates visible at milestone end.
C) server/test/demo-seed.js — headless path to gameover with fixed seed for DEMO.

================================================================
MILESTONES
================================================================

{{MILESTONES}}

================================================================
PHASE 2 — bounded soak
================================================================

Budget (first wins): {{SOAK_MATCH_CAP}} clean sessions OR {{SOAK_CLEAN_STREAK}} clean streak OR {{SOAK_WALL_MINUTES}} minutes wall-clock.

{{SOAK_INVARIANTS}}

When budget met → Phase 3.

================================================================
PHASE 3 — DEMO record (checkpoint — then Phase 4)
================================================================

STORYBOARD (visible in order):
0. Title screen: game name, name field, Join button visible
1. Lobby after Join
{{DEMO_STORYBOARD}}

VALIDATE RECORDING: extract demo/frames/; per-step PASS/FAIL in DEMO.md; hp and scores must not go negative in capture path.

RESUME: if PHASE3-DONE + visual PASS → skip to Phase 4.

================================================================
PHASE 4 — infinite improve / feature loop (never stop alone)
================================================================

P4-0 mini-soak → P4-1 FEATURES.md decide → P4-2 implement (~{{PHASE4_MAX_FILES}} files) → P4-3 prove + push agent/* (LIVE LOOP) → P4-4 log → repeat.

Forbidden: architecture rewrite, push to main/baseline, multiple features per cycle.

Bootstrap AUTONOMOUS-LAB first, then start M1.
```

## Placeholder quick reference

| Placeholder | Example |
|---|---|
| `{{JOB_TITLE}}` | Online 2D lane defense |
| `{{JOB_DESCRIPTION}}` | 2–4 sentences of fantasy |
| `{{MIN_MAPS}}` | `2` |
| `{{MIN_UNITS}}` | `3` towers + `3` enemy types |
| `{{HARD_PROBLEM_HINT}}` | netcode, pathing, invariant root-cause |
| `{{VL_HINT}}` | 2D: VL for assets; 3D: VL for demo frames optional |
| `{{RENDERING_RUNTIME_LINE}}` | Canvas2D or Three.js r128 |
| `{{ARCHITECTURE_BULLETS}}` | Paste 2D or 3D profile from TEMPLATE |
| `{{SESSION_MODE_BULLETS}}` | Solo + bots default |
| `{{RENDERING_BULLETS}}` | Same profile snippet |
| `{{MILESTONES}}` | M1–M10 blocks from a reference game |
| `{{SOAK_*}}` | Match tower-defense defaults unless genre needs less |
| `{{DEMO_STORYBOARD}}` | Ordered lobby → gameover steps |
| `{{PHASE4_MAX_FILES}}` | `8` |
| `{{SAVE_KEY}}` | e.g. `tower-defense` |

After filling, add `PROMPTS/games/<name>.md` alongside the existing game prompts.
