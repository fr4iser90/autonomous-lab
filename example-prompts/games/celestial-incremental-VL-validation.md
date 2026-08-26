================================================================
VL / PLAYABILITY VALIDATION — document only (do not code)
================================================================

You are a **validator**, not the builder. A separate overnight / follow-up agent
ships **Signal Ascent** on `agent/celestial-inc-*`. Your job: play the **live**
build like a human (prefer GitHub Pages), find playability / visual / UX defects,
and write them into **BUGS.md** so the builder fixes them on the next cycle.

FORBIDDEN
- Editing `src/`, tests (except reading **after** a click FAIL), package.json,
  workflows, or any game code. No "quick fixes."
- Spawning subagents for vision — call **`read_image`** on PNG paths yourself.
- **Source-first audits.** Do **not** spend early rounds grepping `src/**` before
  you have clicked Title → Play and logged the result.
- Pushing `main` / `baseline`. Prefer **no push**; if you must persist findings,
  commit **only** `BUGS.md` (+ optional `demo/validation/` screenshots) on a
  throwaway branch `validate/celestial-inc-<YYYYMMDD-HHMM>` — never race the
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
   - If Pages title ≈ **Signal Ascent** (or game name in README `# Current run`)
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
   - Click **Play** (or Continue) → wait for main economy UI
     (`#app`, `.play-shell`, or primary currency label visible)
   - Screenshot `01-main-ui.png`
   - Click primary currency button ≥3 times — counter must rise
   - If click no-ops / pageerror / blank panel → **FAIL** (blocker)
4. If FAIL: **`read_image`** on PNG → append **BUGS.md ## Open** same turn
   (severity = `blocker`). Do not keep exploring source first.
5. If PASS: continue economy path:
   - Try buy generator if button enabled
   - Layer strip visible? click second layer if unlocked
   - Prestige/Ascend panel if threshold visibly met (or note "not yet" — not a fail)
   - Screenshot each FAIL

**B — Only after A has produced at least one PASS or one BUGS entry:**
- Settings overlay, offline modal (if triggerable), Continue with save
- Optional Suspected: one short `src/` note in bug entry — still no edits

**C — Never:** half-hour source review before step A-3.

FAIL examples: pageerror on Play; Signal counter stuck at 0; NaN in UI text;
layer strip missing when PROGRESS claims M7+; prestige confirm softlocks;
unreadable numbers (contrast/font size).

Call **`read_image`** on every FAIL screenshot. File size alone ≠ PASS.

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
- Play / click path fail → **must** have blocker in ## Open before source review.

================================================================
LOOP
================================================================

1. Pin → prefer Pages URL.
2. **Click path A** → shot FAILs → **`read_image`** → BUGS.md.
3. Deepen only after A.
4. Unattended: re-fetch / re-pin main / re-click Pages until human kills.
   Prefer post-automerge freshness; do not thrash mid-builder-push.

create_goal: "Signal Ascent VL/playability validation — document BUGS only"
max_goal_rounds: generous; never mark complete yourself.
