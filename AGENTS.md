# Autonomous Lab — agent constitution

This repo is the **product workspace** for long DSH autonomy runs. Mechanical gates beat prompt hope.

## Branch model (do not invent a second one)

| Ref | Role | Who writes |
|---|---|---|
| `baseline` | Frozen scaffold reset point. Never force-push. | Human only (rare scaffold upgrades) |
| `main` | Playable production. **GitHub Pages deploys only from here.** | Human merge of green PRs |
| `agent/<run-id>` | One autonomy prompt / experiment | Agent (via `github_*` tools) |

Rules:

1. **Never push to `main` or `baseline`.** Open a PR from `agent/<run-id>` into `main`.
2. **One prompt = one run branch**, cut from `baseline` (clean experiment) or from `main` (continue shipped game). Prefer `baseline` for a new 7-day fantasy.
3. **GitHub Pages has one live URL per repo** (`https://fr4iser90.github.io/autonomous-lab/`). Parallel agent branches are fine; only merged `main` is public-playable. Local/DSH preview on `:5173` covers WIP.
4. Reset a ruined tree: `git fetch origin && git checkout baseline && git checkout -b agent/<new-run-id>`.

Helper: `./scripts/new-run.sh <run-id>` (creates `agent/<run-id>` from `origin/baseline`).

## Stack (fixed)

- Vite + TypeScript + DOM/CSS client game (no Phaser, no Three.js, no game server)
- Vitest for pure logic; Playwright only when validating UI demos in DSH
- `npm run gate` (= `test` + `build`) must pass before claiming a task done
- Preview **5173** only — never bind **3080**

`vite.config.ts` sets `base: '/autonomous-lab/'` for project Pages. Local `npm run dev` still works.

## Autonomy files

When DSH autonomy is active, keep `.autonomy/` current:

| Path | Role |
|---|---|
| `.autonomy/SPEC.md` | Product requirements (slow-changing) |
| `.autonomy/ROADMAP.md` | Ordered milestones |
| `.autonomy/DECISIONS.md` | Durable architecture choices |
| `.autonomy/TASKS/next.md` | The single current task |
| `.autonomy/state.json` | Owned by autonomy tools — do not hand-edit unless repairing |

Also keep human-facing `PROGRESS.md` / `CONTENT.md` / `README.md` in sync with shipped behavior.

## Definition of Done (every Ralph round)

1. Implement **one** concrete task from `.autonomy/TASKS/next.md` (or ROADMAP slice).
2. Update tests for new pure logic.
3. `npm run gate` green locally.
4. Update SPEC/ROADMAP/TASKS/DECISIONS + PROGRESS as needed.
5. Commit on `agent/<run-id>`; `github_push`; open/update PR to `main`.
6. Do **not** mark autonomy `complete` without gate-green evidence and a mergeable PR.

If blocked on human merge, API limits, or missing design choice: set autonomy phase `blocked` with a real blocker — do not speculative-rewrite for hours.

## Out of scope unless SPEC says otherwise

- Rewriting CI/Pages workflows without a failing gate
- Changing `baseline` history
- Cloud saves, auth, multiplayer, or a second public Pages site in this repo
