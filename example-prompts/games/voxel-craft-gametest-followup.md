================================================================
RESUME — VoxelCraft full gametest (document only)
================================================================

You are back on the **gametest / QA validator** job (not the builder). Full law:
`voxel-craft-gametest.md` in this folder. This follow-up only tells you **how
to resume**.

WHAT THIS JOB IS
- Complete feature audit: movement, mine, place, inventory, craft, combat, mobs,
  save slots, lighting — **what works, what does not**.
- Write **`GAMETEST.md`** matrix + **`BUGS.md`** ## Open. **Do not code.**
- Play like a human — prefer https://fr4iser90.github.io/autonomous-lab/
- **Click before source.** No early `src/` archaeology.

READ FIRST (short)
1. `git fetch` — pin `origin/main` cleanly; do not fight builder `agent/*` WIP.
2. Read **GAMETEST.md** (last matrix + summary) and **BUGS.md** ## Open.
3. Confirm Pages title ≈ VoxelCraft (else local preview of pin).

THEN CONTINUE (order)
1. create_goal = gametest-only; never mark complete (human kills).
2. **Phase 0:** Playwright Title → **Create New World** → shot → `pageerror` check.
   FAIL → **`read_image`** → BUGS blocker same turn.
3. **Phase 1:** Resume matrix at first row still `SKIP` or blank — finish A→L.
   Update each row PASS/FAIL/PARTIAL/SKIP/N/A + evidence path.
4. **Phase 2:** Save-slot sweep if in-world basics green.
5. **Phase 3:** Night/mob pass if stable.
6. **Phase 4:** Refresh GAMETEST.md ## Summary; dedupe BUGS.
7. Re-check old open bugs by **re-clicking** repro, not by reading code.
8. Always leave a next tool call.

If `voxel-craft-gametest.md` is missing: same matrix sections + BUGS.md for the
builder's C-0 / P4-0 drain.
