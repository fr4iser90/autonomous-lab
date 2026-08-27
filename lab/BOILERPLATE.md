# Boilerplate ownership map

Agents: **read this before editing**. This checkout starts as **toolchain + toys**, not a game.

Files and dirs are tagged:

| Tag | Meaning |
|---|---|
| `BOILERPLATE_OWNED` | Do **not** change on `agent/*` (human/`baseline` only). CI enforces the critical paths. |
| `BOILERPLATE_PLACEHOLDER` | Replace entirely for the run; not design authority until rewritten. |
| `BOILERPLATE_TOY` | Demo/scaffold code — **delete or replace** when the real game starts. Not product fantasy. |
| `RUN_OWNED` | Agent maintains for this run; on merge conflicts prefer run truth for these. |

## Layout

| Tree | Role |
|------|------|
| `lab/**` | Machine docs, roles, example prompts — **BOILERPLATE_OWNED** |
| Repo root run docs + `src/` | Current experiment — **RUN_OWNED** (except README Lab header) |

## BOILERPLATE_OWNED (never touch on agent branches)

- `.github/workflows/**`
- **`lab/**`** (AGENTS, BOILERPLATE, SETUP, MODEL_STACKS, `roles/`, `examples/`)
- Root stubs `AGENTS.md` / `BOILERPLATE.md` (redirects into `lab/` only)
- `scripts/new-run.sh`
- `LICENSE`
- Vite `base: '/autonomous-lab/'` in `vite.config.ts` (you may edit other vite options the game needs)
- **`README.md` Lab header** — everything from the top through the `---` before
  `# Current run`. Do **not** delete or rewrite that block; only update `# Current run`.
- **`eslint.config.js`**, **`.dependency-cruiser.cjs`** — keep `gate` health;
  agents must not delete lint/boundaries to silence failures.

## BOILERPLATE_PLACEHOLDER / TOY → become RUN_OWNED

Replace when the overnight objective / game prompt starts:

- `PROGRESS.md`, `CONTENT.md`, `BUGS.md`, `README.md` **`# Current run` only**
- `index.html`, `src/**`, `tests/**`
- `.autonomy/**` — **optional/legacy**; prefer `PROGRESS.md`. Safe to leave untouched or delete; do not use as primary tracker.

## Conflict resolution cheat-sheet

**Automerge (Actions)** when an `agent/*` PR is CONFLICTING but tip `gate` is
green: merges **into `main`**, then **resets that `agent/*` tip to `main`**
(force-with-lease against the merged tip SHA):

1. **BOILERPLATE_OWNED** → keep **main** (including all of `lab/**`)
2. **RUN_OWNED** (`src/`, `tests/`, `demo/`, run docs, …) → keep **agent**
3. `pnpm run gate` on the merged tree must pass before push to `main`
4. Sync `agent/<run-id>` → `origin/main` so the next push is not forever CONFLICTING

When a human/agent merges `origin/main` into `agent/*` locally (usually unnecessary
after Actions sync):

1. **BOILERPLATE_OWNED** → take main
2. **RUN_OWNED** → keep agent
3. Prefer `git fetch && git reset --hard origin/agent/<run-id>` after a land+sync
   rather than inventing a second `-rebased` branch.

## After the first game merge

Once a game has automerged into `main`, `main` **is** the live game. Further
`agent/*` work continues that line — do not re-introduce toy economy UI or
“waiting for objective” placeholders unless starting a **new** run from
`baseline`. Keep the Autonomous Lab README header; refresh **Current run**.
