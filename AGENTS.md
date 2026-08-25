# Autonomous Lab — agent constitution

This **public** repo is a **genre-agnostic boilerplate** for long autonomy runs. It owns toolchain, CI, branch rules, and live Pages — **not** any concrete game. Genre, milestones, and fantasy come only from the **objective the human pastes into the agent** for that run. Outsiders follow **commits on `agent/*`** and the **live Pages** site fed by automerge into `main`.

## Branch model (do not invent a second one)

| Ref | Role | Who writes |
|---|---|---|
| `baseline` | Frozen boilerplate reset. Never force-push. | Human only (rare scaffold upgrades) |
| `main` | Live playable line. **GitHub Pages deploys only from here.** | Automerge of green `agent/*` PRs (or human) |
| `agent/<run-id>` | One autonomy run / experiment | Agent (via `github_*` tools) |

Rules:

1. **Never push to `main` or `baseline`.** Work only on `agent/<run-id>`.
2. **One run = one branch**, cut from `baseline` for a clean experiment (preferred) or from `main` to continue a shipped line.
3. **Live loop:** push `agent/*` → workflow opens/updates PR → CI `gate` → automerge squash into `main` → Pages rebuilds.
4. **Pages URL:** `https://fr4iser90.github.io/autonomous-lab/`. WIP also on local `npm run dev` / `pnpm run dev` `:5173`.
5. New run: agent runs `git fetch origin && git checkout -b agent/<run-id> origin/baseline` (human may use `./scripts/new-run.sh` as a local shortcut for the same git steps).

## What this boilerplate owns vs what the run owns

| Boilerplate (this repo) | Active run objective (pasted into the agent) |
|---|---|
| Vite + TypeScript toolchain, `npm run gate`, CI, Pages `base`, automerge | Genre, fantasy, milestones, engine choice |
| Branch / PR / never-push-main rules | Content caps, DEMO rules, soak budgets |
| Empty `.autonomy/` templates to fill at run start | The actual SPEC/ROADMAP/TASKS content |

Do **not** bake a specific game into `baseline`. At run start, derive SPEC/ROADMAP/TASKS from the **active objective only**.

## Stack defaults (boilerplate)

- Vite + TypeScript client app; preview **5173** only — never bind **3080**
- Prefer **`pnpm install`** over **`npm install`** when both work (especially in deploy containers where `NODE_ENV=production` can make npm skip devDependencies). One package manager per tree; drop the other lockfile if switching. If pnpm blocks postinstall scripts (esbuild), run `pnpm approve-builds` once.
- Vitest for pure logic; Playwright only when the objective requires UI demos
- `npm run gate` (= `test` + `build`) must pass before claiming a task done (`pnpm run gate` is equivalent)
- Vite `base` is `/autonomous-lab/` for project Pages — do not change without updating docs/CI
- Engines (Canvas, Phaser, Three, DOM-only, …) are **chosen by the run objective** and must be pinned in `.autonomy/DECISIONS.md` when first adopted — do not thrash

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
5. Commit + `github_push` on `agent/<run-id>` (open PR if tools require it; Actions also opens one).
6. After automerge, **rebase onto `origin/main`** (or merge `main`) before the next chunk so the next PR stays small.
7. Do **not** mark autonomy `complete` without gate-green evidence on the run. Pages follows successful automerge.

If blocked: set autonomy phase `blocked` with a real blocker.

## Out of scope unless the run objective says otherwise

- Baking a specific game genre into `baseline`
- Rewriting CI/Pages/automerge without a failing gate
- Changing `baseline` history
- Cloud saves, auth, multiplayer, or a second Pages site
