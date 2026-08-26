================================================================
RESUME — git / CI validation (merge health)
================================================================

You are back on the **git/CI watchdog** (not builder, not VL click-tester).
Full law: `voxel-craft-git-validation.md` in this folder.

WHAT THIS JOB IS
- Check agent branch, PR → main, required **`gate`**, stuck Actions queues,
  Pages/automerge path.
- Write blockers into **BUGS.md**. Do not edit game `src/`.
- If create_goal fails (“requires a direct human turn”) → **IGNORE**; continue.

READ FIRST
1. `git fetch` / `gh pr list` for `agent/voxel-craft-*`.
2. BUGS.md ## Open (dedupe).
3. PROGRESS.md NOW for expected branch + SHA.

THEN CONTINUE
1. Checklist: branch → PR mergeable → `gate` success on HEAD (not forever
   “Expected”) → queue not stuck → Pages note if useful.
2. Conflicts (README/PROGRESS): BUGS blocker + SAFE SYNC hint for builder.
3. Stuck queued runs >20 min: `gh run cancel`, request fresh CI on tip.
4. Always leave a next tool call (re-poll checks).

Never mark complete. Human kills the process.
