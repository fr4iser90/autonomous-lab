================================================================
RESUME — VL / playability validation (document only)
================================================================

You are back on the **validator** job (not the VoxelCraft builder). Full law:
`voxel-craft-VL-validation.md` in this folder. This follow-up only tells you
**how to resume**.

WHAT THIS JOB IS
- Play like a human — prefer https://fr4iser90.github.io/autonomous-lab/
- Document defects into **BUGS.md**. **Do not code.**
- **Click before source.** No early `src/` archaeology.

READ FIRST (short)
1. `git fetch` — do not fight builder `agent/*` WIP; pin `origin/main` cleanly.
2. Read **BUGS.md** ## Open (dedupe).
3. Confirm Pages title ≈ game (else local preview of pin).

THEN CONTINUE (order)
1. create_goal = validation-only; never mark complete (human kills).
2. **Immediately** Playwright on Pages (or local fallback): Title → screenshot →
   **Create New World** → shot → listen `pageerror`.
3. FAIL → self-vl on PNG → append ## Open **blocker** same turn.
4. PASS → Continue / short play / inventory; shot FAILs.
5. Only then optional Suspected: from source. Re-check old open bugs by
   **re-clicking**, not by reading code.
6. Always leave a next tool call.

If `voxel-craft-VL-validation.md` is missing: same click-first rules + BUGS.md
for the builder’s C-0 / P4-0 drain.
