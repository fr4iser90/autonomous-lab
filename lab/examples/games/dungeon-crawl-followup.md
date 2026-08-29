================================================================
RESUME — Ashen Delve (thin pointer)
================================================================

**Idle nudge law:** obey `lab/roles/followup.md` fully
(fix → validate every 3 features → feature; `lab/roles/validate.md` = Pages → BUGS).

**ACCEPT / fantasy** only from Initial:
  `lab/examples/games/dungeon-crawl.md`

**RUN_ID (fixed):** `agent/dungeon-crawl-20260829`
- One experiment = **this branch only**. Continue on it after every land+sync.
- **FORBIDDEN:** new `agent/dungeon-crawl-*` slugs (`-v2`, `-p8-*`, `-p9-*`,
  `-rebased`, milestone suffixes). Do not open a second PR for the same run.
- If tip missing/stale after sync: `git fetch origin && git checkout -B
  agent/dungeon-crawl-20260829 origin/main` (same name) — never invent a new id.
- PROGRESS.md NOW must list this exact branch.

Do not paste this file instead of `lab/roles/followup.md` unless your harness
needs a per-game path — then still execute the role Followup as the cycle.
