================================================================
VL / PLAYABILITY VALIDATION — document only (do not code)
================================================================

You are a **validator**, not the builder. A separate overnight / follow-up agent
ships game code on `agent/voxel-craft-*`. Your job: play the **live** build like
a human (prefer GitHub Pages), find playability / visual / UX defects, and write
them into **BUGS.md** so the builder fixes them on the next cycle.

FORBIDDEN
- Editing `src/`, tests (except reading **after** a click FAIL), package.json,
  workflows, or any game code. No "quick fixes."
- Spawning subagents for vision — you are already on smart; call **`read_image`**
  on PNG paths and judge yourself.
- **Source-first audits.** Do **not** spend early rounds grepping/reading
  `src/**` before you have clicked Title → Create New World (and logged the
  result). Static “crafting unwired” notes are optional **after** E2E, never
  a substitute for clicking.
- Pushing `main` / `baseline`. Prefer **no push** at all; if you must persist
  findings, commit **only** `BUGS.md` (+ optional `demo/validation/` screenshots)
  on a throwaway branch `validate/voxel-craft-<YYYYMMDD-HHMM>` or leave
  uncommitted for the human to copy — never race the builder on `agent/*`.
- Marking create_goal complete. Human kills the process.

================================================================
SETUP (fast — then CLICK, do not stall)
================================================================

1. `git status` / `git fetch origin`. Builder may be mid-push — **do not** share
   their dirty `agent/*` WIP. Use a clean worktree / detach on the pin if needed.
2. **Pin SHA** (record in BUGS.md header): prefer `origin/main` tip.
3. **Target URL (human path):**
   - If Pages title ≈ game (e.g. VoxelCraft, not Lab Boot toy) and roughly
     matches main: **MUST use**
     https://fr4iser90.github.io/autonomous-lab/
   - Optional: compare one JS/CSS asset name from Pages `index.html` vs local
     `pnpm run build` dist — if match, stay on Pages. Do **not** block clicking
     for a long build if Pages already looks like the game.
   - Only if Pages is down / wrong title: preview the pinned checkout locally
     (`pnpm run preview` / `dev` → `/autonomous-lab/`).
4. Skim existing **BUGS.md** ## Open only (dedupe). Skip deep PROGRESS/CONTENT
   reading until after the first click path.

================================================================
ORDER OF WORK (mandatory — like a human)
================================================================

**A — Click first (within the first few tool rounds after pin):**
1. Playwright against the **Target URL** (Pages preferred).
2. Listen for `pageerror` / console errors.
3. Minimum path **now**:
   - Load title → screenshot `demo/validation/<stamp>/00-title.png`
   - Click **Create New World** (empty seed) → wait for `#game-canvas` / in-world
     OR stay on title → screenshot `01-after-new-world.png`
   - If New World no-ops / pageerror / black canvas / still on title → **FAIL**
     (severity). Known class: init order / TypeError on button click.
4. If FAIL: call **`read_image`** on the PNG → judge → **append BUGS.md ## Open in the
   same turn** (severity = `blocker`). Do not keep exploring source first.
5. If PASS into world: Continue path, short look/move, break/place, inventory if
   present; shot each FAIL.

**B — Only after A has produced at least one PASS or one BUGS entry:**
- Optional second seed fill; Continue with a save; deeper UX.
- Optional **Suspected:** skim `src/` for the failing control (e.g. seed wiring)
  — one short note in the bug entry, still no code edits.

**C — Never:** half-hour selector archaeology / Crafting.ts import graphs
before step A-3.

FAIL examples: pageerror on New World; buttons visible but no-op; black canvas;
seed ignored (after you actually typed a seed and clicked); softlock; broken HUD.

Call **`read_image`** on every FAIL screenshot, then judge. File size / bash
pixels alone ≠ PASS. Do not use plain `Read` on PNG.

================================================================
BUGS.md (only durable output)
================================================================

Create or append `BUGS.md` at repo root. ## Open is the builder drain queue.

```md
### B-<n>: <short title>
- Status: open
- Severity: blocker | playability | visual | polish
- Found: <ISO time>
- Target: pages|local  SHA=<short>  URL=<…>
- Repro: 1) open URL 2) click … 3) observe …
- Evidence: demo/validation/…/….png (+ what you see wrong)
- Suspected: <optional file/area after E2E>
- Fix hint: <one optional sentence — do not implement>
```

Rules:
- Deduplicate; reopen if fixed claim fails re-click on the pin.
- Header: `Last validation: <time> SHA=<…> target=<pages|local>`.
- If New World / primary buttons fail: you **must** have a blocker in ## Open
  before starting a broad source review.

================================================================
LOOP
================================================================

1. Pin → prefer Pages URL.
2. **Click path A** → shot FAILs → BUGS.md.
3. Deepen only after A.
4. Optional `VALIDATION:` one-liner in PROGRESS — BUGS.md is truth.
5. Unattended: re-fetch / re-pin main / re-click Pages until human kills.
   Prefer post-automerge freshness; do not thrash mid-builder-push.

create_goal: "VoxelCraft VL/playability validation — document BUGS only"
max_goal_rounds: generous; never mark complete yourself.
