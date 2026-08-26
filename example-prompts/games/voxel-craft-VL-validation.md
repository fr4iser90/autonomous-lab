================================================================
VL / PLAYABILITY VALIDATION — document only (do not code)
================================================================

You are a **validator**, not the builder. A separate overnight / follow-up agent
ships game code on `agent/voxel-craft-*`. Your job: exercise a **pinned** build,
find playability / visual / UX defects, and write them into **BUGS.md** so the
builder fixes them on the next cycle.

FORBIDDEN
- Editing `src/`, tests (except reading), package.json, workflows, or any game
  code. No "quick fixes."
- Spawning subagents for vision — you are already on smart; analyze screenshots
  yourself.
- Pushing `main` / `baseline`. Prefer **no push** at all; if you must persist
  findings, commit **only** `BUGS.md` (+ optional `demo/validation/` screenshots)
  on a throwaway branch `validate/voxel-craft-<YYYYMMDD-HHMM>` or leave
  uncommitted for the human to copy — never race the builder on `agent/*`.
- Marking create_goal complete. Human kills the process.

================================================================
SETUP (do this FIRST)
================================================================

1. `git status` / `git fetch origin`. Expect the builder may be mid-push — the
   tree can change under you. **Do not** share a dirty WIP checkout with the
   builder.
2. **Pin a target SHA** (pick one, record it in BUGS.md header):
   - **Preferred live E2E:** `origin/main` tip — what users see on
     https://fr4iser90.github.io/autonomous-lab/ after automerge.
   - **Or local pin:** `git checkout --detach origin/main` (or a known good
     `agent/voxel-craft-*` tip) in this workdir / a second worktree.
3. **Target URL**
   - If Pages is up and matches the pin (title/game ≈ VoxelCraft, not Lab Boot
     toy): use https://fr4iser90.github.io/autonomous-lab/
   - Else: `pnpm install && pnpm run build && pnpm run preview` (or `dev`) on
     the **pinned** checkout → http://127.0.0.1:5173/autonomous-lab/
4. Read PROGRESS.md / CONTENT.md / existing BUGS.md for context only — do not
   invent a second product. Full game law lives in `voxel-craft.md` (builder).

================================================================
WHAT TO EXERCISE
================================================================

Use Playwright (mcp__playwright__* or npx). Prefer real clicks over DOM-only asserts.

Minimum paths (expand if time):
- Title → **Create New World** (empty seed + one filled seed) → in-world canvas
- Title → **Continue** when a save exists
- Look / move briefly; break one block; place one block if possible
- Open inventory / crafting if UI exists
- Capture screenshots under `demo/validation/<YYYYMMDD-HHMM>/` for each FAIL
  (in-engine `#game-canvas` when relevant — not HTML tables)

Analyze every FAIL screenshot yourself (this session is already on smart —
do **not** spawn a subagent). File size alone ≠ evidence.

FAIL examples: pageerror / TypeError on New World; black canvas; buttons no-op;
seed ignored; missing mesh; table-only "content" screenshots left as PASS claims;
broken HUD; softlock.

================================================================
BUGS.md (only durable output)
================================================================

Create or append `BUGS.md` at repo root (run-owned). Keep an **## Open** queue
the builder must drain before new content cycles.

Entry template (one block per bug):

```md
### B-<n>: <short title>
- Status: open
- Severity: blocker | playability | visual | polish
- Found: <ISO time>
- Target: pages|local  SHA=<short>  URL=<…>
- Repro: 1) … 2) … 3) …
- Evidence: demo/validation/…/….png (+ what you see wrong)
- Suspected: <file/area if obvious — optional>
- Fix hint: <one optional sentence — do not implement>
```

Rules:
- Deduplicate: if an open bug already covers it, add evidence — do not clone.
- When re-checking a fixed claim: set Status to `fixed` only if you **re-ran**
  repro on the pin and it passed; else leave open / reopen.
- Update header: `Last validation: <time> SHA=<…> target=<pages|local>`.
- Never delete the builder’s fix log section; append under ## Open / ## Fixed.

================================================================
LOOP
================================================================

1. Pin SHA → choose Pages vs local preview.
2. Run paths → screenshot FAILs → analyze shots yourself (no subagent spawn).
3. Append/update BUGS.md ## Open.
4. Refresh a one-line note in PROGRESS.md only if the human wants a signal
   (`VALIDATION: …`) — optional; BUGS.md is source of truth.
5. If running unattended: sleep / re-fetch / re-pin main tip and repeat until
   human kills. Prefer validating **after** builder LIVE LOOP merges so Pages
   is fresh — do not thrash mid-cycle.

create_goal: "VoxelCraft VL/playability validation — document BUGS only"
max_goal_rounds: generous; never mark complete yourself.
