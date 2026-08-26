# Boilerplate ownership map

Agents: **read this before editing**. This checkout starts as **toolchain + toys**, not a game.

Files and dirs are tagged:

| Tag | Meaning |
|---|---|
| `BOILERPLATE_OWNED` | Do **not** change on `agent/*` (human/`baseline` only). CI enforces the critical paths. |
| `BOILERPLATE_PLACEHOLDER` | Replace entirely for the run; not design authority until rewritten. |
| `BOILERPLATE_TOY` | Demo/scaffold code — **delete or replace** when the real game starts. Not product fantasy. |
| `RUN_OWNED` | Agent maintains for this run; on merge conflicts prefer run truth for these. |

## BOILERPLATE_OWNED (never touch on agent branches)

- `.github/workflows/**`
- `AGENTS.md`
- `BOILERPLATE.md`
- `scripts/new-run.sh`
- `LICENSE`
- Vite `base: '/autonomous-lab/'` in `vite.config.ts` (you may edit other vite options the game needs)

## BOILERPLATE_PLACEHOLDER / TOY → become RUN_OWNED

Replace when the overnight objective / game prompt starts:

- `PROGRESS.md`, `CONTENT.md`, `BUGS.md`, `README.md` (game sections)
- `index.html`, `src/**`, `tests/**`
- `.autonomy/**` — **optional/legacy**; prefer `PROGRESS.md`. Safe to leave untouched or delete; do not use as primary tracker.

## Conflict resolution cheat-sheet

When merging `origin/main` into `agent/*`:

1. **BOILERPLATE_OWNED** → take `main` / keep workflow files unchanged.
2. **RUN_OWNED game** (`src/`, `tests/`, `demo/`, run docs) → keep **agent** version.
3. Never `reset --hard` to main to “clear” conflicts.

## After the first game merge

Once a game has automerged into `main`, `main` **is** the live game. Further `agent/*` work continues that line — do not re-introduce toy economy UI or “waiting for objective” placeholders unless starting a **new** run from `baseline`.
