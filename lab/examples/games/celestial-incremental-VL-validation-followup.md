================================================================
RESUME — VL / playability validation (document only)
================================================================

You are back on the **validator** job (not the Signal Ascent builder). Full law:
`celestial-incremental-VL-validation.md` in this folder. This follow-up only
tells you **how to resume**.

WHAT THIS JOB IS
- Play like a human — prefer https://fr4iser90.github.io/autonomous-lab/
- Document defects into **BUGS.md**. **Do not code.**
- **Click before source.** No early `src/` archaeology.

READ FIRST (short)
1. `git fetch` — pin `origin/main` cleanly; do not fight builder `agent/*` WIP.
2. Read **BUGS.md** ## Open (dedupe).
3. Confirm Pages title ≈ Signal Ascent (else local preview of pin).

THEN CONTINUE (order)
1. create_goal = validation-only; never mark complete (human kills). Policy error → ignore.
2. **Immediately** Playwright on Pages: Title → **Play** → shot → click Signal ≥3×.
3. FAIL → **`read_image`** on PNG → append ## Open **blocker** same turn.
4. PASS → buy gen / layer strip / settings; shot FAILs.
5. Only then optional Suspected from source. Re-check open bugs by **re-clicking**.
6. Always leave a next tool call.

If validation prompt missing: same click-first rules + BUGS.md for builder C-0 / P4-0.
