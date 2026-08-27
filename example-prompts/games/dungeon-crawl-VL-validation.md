================================================================
VL / PLAYABILITY VALIDATION — document only (do not code)
================================================================

You are a **validator**, not the builder. A separate overnight / follow-up agent
ships **Ashen Delve** on `agent/dungeon-crawl-*`. Your job: play the **live**
build like a human (prefer GitHub Pages), find playability / visual / UX defects,
and write them into **BUGS.md** so the builder fixes them on the next cycle.

FORBIDDEN
- Editing `src/`, tests (except reading **after** a click FAIL), package.json,
  workflows, or any game code. No "quick fixes."
- Spawning subagents for vision — call **`read_image`** on PNG paths yourself.
- **Source-first audits.** Do **not** grep `src/**` before Title → New Delve.
- Pushing `main` / `baseline`. Prefer **no push**; if you must persist findings,
  commit **only** `BUGS.md` (+ optional `demo/validation/` screenshots) on a
  throwaway branch `validate/dungeon-crawl-<YYYYMMDD-HHMM>` — never race the
  builder on `agent/*`.
- Marking create_goal complete. Human kills the process.
- If create_goal fails with "requires a direct human turn" → **IGNORE**; continue.

================================================================
SETUP (fast — then CLICK, do not stall)
================================================================

1. `git status` / `git fetch origin`. Do not share builder dirty `agent/*` WIP.
   Pin SHA cleanly (prefer `origin/main` tip after automerge).
2. **Pin SHA** (record in BUGS.md header): prefer `origin/main`.
3. **Target URL (human path):**
   - If Pages title ≈ **Ashen Delve** (or game name in README `# Current run`)
     and not Lab Boot toy: **MUST use**
     https://fr4iser90.github.io/autonomous-lab/
   - Only if Pages down / wrong title: local preview of pinned checkout
     (`pnpm run preview` / `dev` → `/autonomous-lab/`).
4. Skim **BUGS.md** ## Open only (dedupe). Skip deep PROGRESS until after first click.

================================================================
ORDER OF WORK (mandatory — like a human)
================================================================

**A — Click first (within the first few tool rounds after pin):**
1. Playwright against **Target URL** (Pages preferred).
2. Listen for `pageerror` / console errors.
3. Minimum path **now**:
   - Load title → screenshot `demo/validation/<stamp>/00-title.png`
   - Click **New Delve** / Play / Continue → wait for WebGL dungeon
   - Screenshot `01-dungeon.png` (must not be uniform black)
   - WASD / move briefly if possible → `02-move.png`
   - Attack or bump a mob if present → `03-combat.png`
4. Call **`read_image`** on each PNG → PASS/FAIL notes in BUGS if FAIL.

**B — Deeper play (~5–10 min) when A works:**
- Inventory / death / stairs if unlocked
- Note soft-locks, invisible walls, HUD clipped, unreadable fog, same gray boxes only

**C — Document only:**
Append BUGS.md ## Open with severity (`blocker` / `playability` / `visual` / `polish`),
repro steps, screenshot paths, pinned SHA. Deduplicate.

LOOP: re-check Pages after builder merges; cancel only your own validate branch work.
Never mark the goal complete.
