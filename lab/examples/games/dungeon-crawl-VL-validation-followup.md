================================================================
RESUME — VL / playability validator (do not code the game)
================================================================

You are resuming the **Ashen Delve VL validator** job
(`dungeon-crawl-VL-validation.md`). You do **not** build features.

1. `git fetch` — pin `origin/main` cleanly; do not fight builder `agent/*` WIP.
2. Read BUGS.md ## Open (dedupe).
3. Re-open `dungeon-crawl-VL-validation.md` for click-first law + FORBIDDEN.
4. create_goal if useful; policy error → IGNORE; continue with tools.
5. Playwright Pages (prefer) → Title → New Delve → dungeon screenshots →
   **`read_image`** → append new findings to BUGS.md only.
6. Always leave a next tool call. Never mark create_goal complete.
