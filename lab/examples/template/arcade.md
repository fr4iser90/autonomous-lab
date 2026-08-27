# Arcade game skeleton

Copy this file to `PROMPTS/games/<name>.md` and replace every `{{PLACEHOLDER}}`.
Do not run this file with unfilled placeholders.

Authority: [`TEMPLATE.md`](TEMPLATE.md) · reference game: [`../games/blaze-protocol.md`](../games/blaze-protocol.md)

Solo Phaser/Vite arcade — **no** WebSocket server. Persistence = **full-save**.

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
- Playwright: if mcp__playwright__* tools exist, use them for visual checks and DEMO recording. Otherwise use npx playwright / bash. Vitest is the fast loop; browsers only at milestone end and Phase 3.
- Stack: Phaser 3 + TypeScript + Vite. Work inside the boilerplate clone (see BOILERPLATE REPO block).
- Preview server: stop leftovers → start Vite → `.game.pid` / `.game.port` → health-check. Never pkill by interpreter name. pnpm install (prefer) before first start.

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
   `agent/{{GAME_SLUG}}-<YYYYMMDD>` (add `-HHMM` if the day already exists).
   Prefer clean experiment: `git checkout -b agent/<run-id> origin/baseline`
   Continue a shipped line: branch from `origin/main` instead.
5. Read lab/AGENTS.md (branch/gate only). Tracking surface for this run (keep
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

  PROGRESS.md / SOAK.md / BUGS.md / DEMO.md / FEATURES.md / CONTENT.md /
  ASSETS.md / shared/design.md / README.md — same roles as TEMPLATE.md.
  Save schema lives in shared/design.md.

================================================================
{{JOB_TITLE}}
================================================================

{{JOB_DESCRIPTION}}

================================================================
ARCHITECTURE (decided — do not change)
================================================================

- Client-only single-player arcade. No WebSocket multiplayer server.
- Vite + Phaser scenes / entities / systems / ui / services.
{{ARCHITECTURE_BULLETS}}

================================================================
ENTRY UI
================================================================

  1. TITLE / MainMenu — Play, Settings, highscore list (local).
  2. PLAY — GameScene + HUD.
  3. GameOver — score + return to menu.

================================================================
PERSISTENCE (full-save — arcade)
================================================================

- SaveService (localStorage key {{SAVE_KEY}}-save-v1):
    { version: 1, settings, meta, highscores }
  Highscores = local top-N only. No cloud leaderboard.
- Corrupt → defaults + one console warn. Vitest roundtrip mandatory.

================================================================
FORBIDDEN
================================================================

- Multiplayer / authoritative remote sim
- Cloud leaderboards / auth / remote score APIs
- sessionStorage-only saves
- pkill by interpreter name
{{FORBIDDEN_EXTRA}}

================================================================
PROJECT LAYOUT / MILESTONES / PHASES
================================================================

{{LAYOUT}}
{{MILESTONES}}

Phase 2 soak → Phase 3 DEMO (title → play → gameover) → Phase 4 optional.

Bootstrap the boilerplate clone first (BOILERPLATE REPO block), then start M1.
```
