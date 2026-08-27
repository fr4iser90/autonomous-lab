# Overnight Prompt Template

Copy this into `PROMPTS/games/<name>.md`.
Replace every `{{PLACEHOLDER}}` before running.

Run from repo root:
```sh
export DSH_PERMISSION_MODE=danger-full-access
pnpm dsh --profile headless "$(cat PROMPTS/games/<name>.md)"
```

Resume: same command in the same workdir. The agent reads `PROGRESS.md`
first, then the other tracking docs (`CONTENT.md`, `FEATURES.md`, `SOAK.md`,
`BUGS.md`, `DEMO.md`, …) for domain state.

---

## Boilerplate + live Pages (required for every game)

Prompts and the public **autonomous-lab** repo are **independent**. The lab
never embeds or references these prompts. Every game prompt **must** tell the
agent to **consume** the lab as boilerplate — paste from
[`boilerplate-bootstrap.md`](boilerplate-bootstrap.md):

1. Clone `fr4iser90/autonomous-lab`
2. Cut `agent/<game-slug>-<date>` from `baseline` (or `main`)
3. Build the game **inside** that checkout (genre stays in this prompt)
4. After every ACCEPT/cycle — **PRE-PR VISUAL first**: Playwright screenshot of
   the ACCEPT surface; if a smart/vision model is available, it must analyze
   the screenshot and PASS before push. Then: gate → commit → push `agent/*`
   → CI automerge → Pages. No PASS screenshot (+ smart/VL when available) →
   no push/PR.
5. **PHASE GATE** before every phase change (milestones→soak→DEMO→Phase4):
   VL/playable PASS on a screenshot of the finished phase, then LIVE LOOP so
   Pages shows that playable state **before** starting the next phase.

Never local-only `git init`. Never push `main`/`baseline`. Prefer `pnpm install`.
Keep Vite `base` `/autonomous-lab/`. Set `{{GAME_SLUG}}` per game.

## Boilerplate ownership

Every game prompt must include a **BOILERPLATE OWNERSHIP** block: agents must not
edit `BOILERPLATE_OWNED` paths (workflows, AGENTS.md, BOILERPLATE.md, …). Toys
marked `BOILERPLATE_TOY` are not the product. Tracking = PROGRESS/CONTENT — not
`.autonomy` as primary. See repo `lab/BOILERPLATE.md`.


---

## How to split a milestone that is too long

If any `M<N>` grows unwieldy, split it into `M<N>a` / `M<N>b` / `M<N>c`.
Keep the same ACCEPT block and numbering style. Example:

```
M3  3D river scene — SPLIT INTO:
M3a  Procedural map data (banks, water polyline, land AABB).
     ACCEPT: file exists; known bank point is land; mid-river is water.
M3b  Three.js scene + land/water classifier.
     ACCEPT: vitest: walk into water blocked; Playwright: both clients
     show the same river bend.
```

The agent resumes at the first unfinished label, so fine-grained splits
give better crash recovery and shorter context windows per step.

### Milestones stay in the same prompt file

Put full `Mn` ACCEPT in the same `PROMPTS/games/<name>.md` as runtime,
architecture, and Phase 2–4. Do **not** split into a sibling
`<name>.milestones.md`. Before each Mn the agent re-reads **that Mn only**.
Reference: [`games/voxel-craft.md`](../games/voxel-craft.md).

---

## Persistence (pick one when authoring)

Paste **one** profile into every overnight game prompt. Do not leave saves undefined.

| Profile | Use for | Persist | Leaderboard |
|---|---|---|---|
| **settings-only** | Online (TD, MOBA, fishing) | Display name, volume, prefs in `localStorage` | **No** global board. Match scores are ephemeral. |
| **full-save** | Arcade (blaze) | Settings + meta-progress + **local** highscores | Local only |
| **world-save** | Sandbox (voxel) | Settings + world overrides + inventory + **local** stats; **3 save slots** | Local only (e.g. deepest mine) |

Rules for every profile:
- Schema has `version: N`. Corrupt / wrong version → reset to defaults, log once (no silent fail).
- Prefer `localStorage` (or IndexedDB for large world saves). Never sessionStorage-only.
- Vitest roundtrip with mock storage is mandatory when a Save/Settings service exists.
- **No cloud / global leaderboards** in overnight prompts (no auth, no remote score API).

### Paste: settings-only (online)

```
================================================================
PERSISTENCE (settings-only — online)
================================================================

- Match / session state is server memory only — rematch wipes gameplay.
- Client SettingsService (localStorage key {{SAVE_KEY}}-settings-v1):
    { version: 1, displayName, sfxVolume, musicVolume }
  Prefill title-screen name from displayName; write back on Join / settings apply.
- Corrupt JSON → defaults + one console warn. Document schema in shared/protocol.md
  or shared/design.md.
- No world save, no meta-progression, no cloud leaderboard.
- Vitest: SettingsService roundtrip with mock localStorage.
```

### Paste: full-save (arcade)

```
================================================================
PERSISTENCE (full-save — arcade)
================================================================

- SaveService (localStorage key {{SAVE_KEY}}-save-v1):
    { version: 1, settings, meta, highscores }
  Settings: volumes, shake, control opacity. Meta: unlocks / XP after runs.
  Highscores: local top-N only (name + score + date).
- Corrupt → defaults + one console warn. Schema in shared/design.md.
- No cloud / global leaderboard.
- Vitest: SaveService roundtrip (settings + meta + highscores).
```

### Paste: world-save (sandbox)

```
================================================================
PERSISTENCE (world-save — sandbox)
================================================================

- Exactly **3 world slots** (indices 0, 1, 2). One active slot while playing.
- SaveService (localStorage or IndexedDB):
    index key {{SAVE_KEY}}-slots-v1 →
      { version: 1, settings, activeSlot, slots: [SlotMeta|null, SlotMeta|null, SlotMeta|null] }
    SlotMeta: { name, seed, updatedAt, statsSummary }
    world key {{SAVE_KEY}}-world-v1-slot-{N} →
      { version: 1, seed, overrides, inventory, stats }
  settings are shared across slots; world data is per-slot.
  overrides = player block edits; stats = local records (blocks mined,
  deepest Y, distance walked). Autosave into the **active** slot on pause /
  title return / ~60s interval.
- Title UI: list 3 slots (Empty / name + last played). Actions per slot:
  Continue (occupied), New world (empty or confirm overwrite), Delete.
- Corrupt slot → that slot becomes Empty + one console warn; other slots intact.
- No cloud / global leaderboard. Never merge two slots into one blob.
- Vitest: roundtrip slot 0; write slot 1 independently; load slot 0 still intact;
  place-break-save-load restores override in the active slot.
```

---

## The template

```
DSH RUNTIME
- You are unattended. Nobody will answer. Never ask questions, never wait,
  never stop to summarize for a human.
- Work in the CURRENT directory. {{CWD_GUARD}}
- If PROGRESS.md exists, read it and resume at the first unfinished milestone.
  Do not restart from M1.
- Start by calling create_goal with this whole overnight job and a high
  max_goal_rounds (at least 200). Mark the goal complete only after Phase 3
  DEMO is recorded and DEMO.md is written.
- After every milestone: write PROGRESS.md, then continue with tools.
  A text-only assistant message without a tool call ends this process —
  that is a failure. Always leave a next tool call.
- Default model: use the session default from dsh settings
  (agent-default-model / the model named `fast`). Do not hardcode GGUF ids.
- For {{HARD_PROBLEM_HINT}}: spawn a subagent with agentOptions.provider = jarvis (or your configured provider)
  and agentOptions.model = the **id** of the settings entry whose **name** is `smart`.
  If no `smart` entry exists, stay on the session default. Apply the fix yourself.
- {{PLAYWRIGHT_HINT}}
- {{KILL_GUARD}}
- {{EXTRA_RUNTIME_RULES}}

================================================================
{{JOB_TITLE}}
================================================================

{{JOB_DESCRIPTION}}

================================================================
ARCHITECTURE (decided — do not change)
================================================================

{{ARCHITECTURE_BULLETS}}

================================================================
PERSISTENCE ({{PERSISTENCE_PROFILE}})
================================================================

{{PERSISTENCE_BULLETS}}

================================================================
FORBIDDEN
================================================================

{{FORBIDDEN_LIST}}

================================================================
PROJECT LAYOUT
================================================================

{{LAYOUT}}

================================================================
TESTING HARNESS (build in M1, use forever)
================================================================

{{TEST_HARNESS_DESCRIPTION}}

================================================================
DEBUGGING & ANTI-STUCK
================================================================

- Do not guess-and-edit. Reproduce with the smallest failing test,
  one hypothesis.
- After 3 failed fixes: write the failure into PROGRESS.md, ship the
  simplest version that passes a reduced check, move on.
- On context loss: re-read PROGRESS.md, {{CONTEXT_RECOVERY_FILES}},
  then resume.
- Time-box {{EARLY_MILESTONES}} to get a green smoke. Depth comes after.

================================================================
MILESTONES
================================================================

M1  {{M1_TITLE}}
    {{M1_BODY}}
    ACCEPT: {{M1_ACCEPT}}

M2  {{M2_TITLE}}
    {{M2_BODY}}
    ACCEPT: {{M2_ACCEPT}}

{{MORE_MILESTONES}}

================================================================
PHASE 2 — bounded soak
================================================================

When the last milestone is done, immediately begin Phase 2.
Do NOT run forever. Stop soak when the budget below is met, then go to
Phase 3.

STEP 0 — build a soak loop: boot, run N operations, dispose, repeat
with numbered seeds. Check invariants every iteration.

BUDGET (hard stop — pick the first that hits)
- Max {{SOAK_MATCH_CAP}} clean matches/sessions, OR
- Clean streak of {{SOAK_CLEAN_STREAK}} consecutive fully-clean runs, OR
- Wall-clock soak budget of {{SOAK_WALL_MINUTES}} minutes
Whichever comes first ends Phase 2. On a failure, fix, then continue
counting toward the same budget (failed runs do not count as clean).

INVARIANTS
{{SOAK_INVARIANTS}}

THE LOOP
1. Run batches until the budget is met.
2. On fail: reproduce, one hypothesis, fix, regression, BUGS.md.
3. If clean: raise stress within the remaining budget.
4. Every {{SOAK_PLAYWRIGHT_INTERVAL}}, one Playwright pass.
5. Append SOAK.md. When budget is met → Phase 3.

RULES
- Never weaken an invariant.
- Prefer headless soak; Playwright for periodic render checks.
- If context runs low, write a handoff in SOAK.md, then resume soak
  or Phase 3 from the handoff.

================================================================
PHASE 3 — DEMO record (required before stop)
================================================================

After Phase 2 budget is met (or immediately after the last milestone if
soak was already completed in a prior resume), record a DEMO.

GOAL
Produce a short, truthful playthrough that a human can watch without
running the game. Prefer Playwright video (webm) or a frame→GIF pipeline.
If mcp__playwright__* tools exist, use them; else npx playwright.

STEPS
1. Boot the real game server from this tree (pid/port files as usual).
2. Write demo/record.mjs (or .spec.ts): a scripted two-client (or one-
   client + bots) storyboard that drives {{DEMO_STORYBOARD}}.
3. Record to demo/demo.webm and/or demo/demo.gif. Keep one fixed
   viewport. Hold the final settled state long enough to read HUD text.
4. Write DEMO.md: storyboard steps, seed if any, commit/tree note,
   path to the artifact, zero console errors confirmation.
5. Append a DONE line to PROGRESS.md. Mark the goal complete.
   STOP — do not restart soak.

ACCEPT
- demo/demo.webm or demo/demo.gif exists and is non-empty.
- DEMO.md lists the storyboard and artifact path.
- Recording run had zero console errors on clients and the server.

Bootstrap the boilerplate clone first (BOILERPLATE REPO block), then start M1.
```

---

## Placeholder reference

| Placeholder | What to write |
|---|---|
| `{{CWD_GUARD}}` | What the agent should check in cwd (e.g. `no AGENTS.md → STOP`) |
| `{{HARD_PROBLEM_HINT}}` | When to escalate to `smart` (already in template body) |
| *(models)* | Resolve `fast` / `smart` from `~/.dsh/settings.yaml` — never bake GGUF ids into game prompts |
| `{{HARD_PROBLEM_HINT}}` | When to escalate (e.g. `gnarly netcode, geometry`) |
| `{{PLAYWRIGHT_HINT}}` | `if mcp__playwright__* tools exist, use them; otherwise npx playwright / bash` |
| `{{KILL_GUARD}}` | `Never pkill/killall/pgrep by interpreter name` |
| `{{EXTRA_RUNTIME_RULES}}` | Harness- or job-specific rules (see browser-spa.md lines 9–11) |
| `{{JOB_TITLE}}` | One-line role description |
| `{{JOB_DESCRIPTION}}` | 2–4 sentences |
| `{{ARCHITECTURE_BULLETS}}` | Decided constraints, one bullet per invariant |
| `{{PERSISTENCE_PROFILE}}` | `settings-only` / `full-save` / `world-save` |
| `{{PERSISTENCE_BULLETS}}` | Paste the matching Persistence profile above |
| `{{SAVE_KEY}}` | e.g. `tower-defense`, `blaze-protocol` |
| `{{FORBIDDEN_LIST}}` | What the agent must never do (instant revert) |
| `{{LAYOUT}}` | File/package tree of what to ADD |
| `{{TEST_HARNESS_DESCRIPTION}}` | A), B), C) test files and their contracts |
| `{{CONTEXT_RECOVERY_FILES}}` | Files to re-read after context loss |
| `{{EARLY_MILESTONES}}` | e.g. `M1–M3` |
| `{{M<N>_TITLE/BODY/ACCEPT}}` | Per milestone — see split guidance above |
| `{{MORE_MILESTONES}}` | Paste additional M blocks |
| `{{SOAK_INVARIANTS}}` | Numbered list of must-hold conditions |
| `{{SOAK_MATCH_CAP}}` | e.g. `200` clean matches |
| `{{SOAK_CLEAN_STREAK}}` | e.g. `50` consecutive clean |
| `{{SOAK_WALL_MINUTES}}` | e.g. `90` |
| `{{SOAK_PLAYWRIGHT_INTERVAL}}` | e.g. `~50 batches` or `~100 sessions` |
| `{{DEMO_STORYBOARD}}` | What the recording must show (join → play → win/catch) |
