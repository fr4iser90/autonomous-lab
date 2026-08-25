# Autonomous Lab — agent constitution

This **public** repo is a **genre-agnostic boilerplate** for DSH autonomy experiments. Concrete game goals live in the harness `PROMPTS/` (or the human's pasted objective) — **not** in this repository's defaults. Mechanical gates beat prompt hope. Outsiders judge **merged `main` + Pages**, not raw `agent/*` commits.

## Branch model (do not invent a second one)

| Ref | Role | Who writes |
|---|---|---|
| `baseline` | Frozen boilerplate reset. Never force-push. | Human only (rare scaffold upgrades) |
| `main` | Shipped playable line. **GitHub Pages deploys only from here.** | Human merge of green PRs |
| `agent/<run-id>` | One autonomy prompt / experiment | Agent (via `github_*` tools) |

Rules:

1. **Never push to `main` or `baseline`.** Open a PR from `agent/<run-id>` into `main`.
2. **One prompt = one run branch**, cut from `baseline` for a clean experiment (preferred) or from `main` to continue a shipped line.
3. **Pages has one live URL:** `https://fr4iser90.github.io/autonomous-lab/`. WIP plays on DSH/`npm run dev` `:5173`.
4. Reset: `git fetch origin && git checkout baseline && git checkout -b agent/<new-run-id>` (or `./scripts/new-run.sh <run-id>`).

## What this boilerplate owns vs what the prompt owns

| Boilerplate (this repo) | Run prompt (harness `PROMPTS/` / human objective) |
|---|---|
| Vite + TypeScript toolchain, `npm run gate`, CI, Pages `base` | Genre, fantasy, milestones, engine choice |
| Branch / PR / never-push-main rules | Content caps, DEMO rules, soak budgets |
| Empty `.autonomy/` templates to fill at run start | The actual SPEC/ROADMAP/TASKS content |

Do **not** copy harness prompt files into this git history as the product default. At run start, derive SPEC/ROADMAP/TASKS from the active objective only.

## Stack defaults (boilerplate)

- Vite + TypeScript client app; preview **5173** only — never bind **3080**
- Vitest for pure logic; Playwright only when the run prompt requires UI demos
- `npm run gate` (= `test` + `build`) must pass before claiming a task done
- Vite `base` is `/autonomous-lab/` for project Pages — do not change without updating docs/CI
- Engines (Canvas, Phaser, Three, DOM-only, …) are **prompt-chosen** and must be pinned in `.autonomy/DECISIONS.md` when first adopted — do not thrash

## Autonomy files

| Path | Role |
|---|---|
| `.autonomy/SPEC.md` | Product requirements for **this run** (agent fills from objective) |
| `.autonomy/ROADMAP.md` | Ordered milestones for **this run** |
| `.autonomy/DECISIONS.md` | Durable choices for **this run** |
| `.autonomy/TASKS/next.md` | Single current task |
| `.autonomy/state.json` | Owned by autonomy tools — do not hand-edit unless repairing |

Also keep `PROGRESS.md` / `CONTENT.md` / `README.md` aligned with what actually shipped.

## Definition of Done (every Ralph round)

1. Implement **one** concrete task from `.autonomy/TASKS/next.md`.
2. Update Vitest for new pure logic when applicable.
3. `npm run gate` green locally.
4. Update autonomy docs + PROGRESS as needed.
5. Commit on `agent/<run-id>`; `github_push`; open/update PR to `main`.
6. Do **not** mark autonomy `complete` without gate-green evidence and a mergeable PR. Human merges; Pages follows `main`.

If blocked: set autonomy phase `blocked` with a real blocker.

## Out of scope unless the run objective says otherwise

- Baking a specific game genre into `baseline`
- Rewriting CI/Pages without a failing gate
- Changing `baseline` history
- Cloud saves, auth, multiplayer, or a second Pages site
