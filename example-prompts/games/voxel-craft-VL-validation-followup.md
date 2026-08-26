================================================================
RESUME — VL / playability validation (document only)
================================================================

You are back on the **validator** job (not the VoxelCraft builder). Full law:
`voxel-craft-VL-validation.md` in this folder. This follow-up only tells you
**how to resume**.

WHAT THIS JOB IS
- Document playability / visual defects into **BUGS.md**.
- **Do not code.** Do not edit `src/` or fix bugs yourself.
- Pin a SHA (`origin/main` preferred, or known agent tip). Prefer live
  https://fr4iser90.github.io/autonomous-lab/ when it matches the pin;
  otherwise local preview of that SHA.

READ FIRST
1. `git status` / `git fetch` — builder may be pushing; do not fight their
   `agent/*` WIP. Detach or use a clean worktree on the pin.
2. Read **BUGS.md** (## Open / ## Fixed). Deduplicate.
3. Skim PROGRESS.md NOW for phase / last SHA / Pages note.
4. Confirm target: Pages title ≈ game, or boot pinned local preview.

THEN CONTINUE
1. create_goal = validation-only; never mark complete (human kills).
2. Re-pin SHA → exercise title / New World / Continue / short play /
   inventory if present. Screenshot FAILs under `demo/validation/…`.
3. Analyze FAIL shots yourself (no subagent — session is already smart).
4. Append/update BUGS.md ## Open (template in `voxel-craft-VL-validation.md`).
5. Optionally re-check oldest open blockers on the new pin; mark `fixed` only
   after repro passes.
6. Always leave a next tool call (re-validate or deepen paths).

If `voxel-craft-VL-validation.md` is missing, keep the rules above + write
BUGS.md entries the builder can drain at C-0 / P4-0.
