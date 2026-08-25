# Autonomous Lab — agent constitution

This **public** repo is the product workspace for a long DSH autonomy experiment (incremental tower defense). Mechanical gates beat prompt hope. Outsiders should judge **merged `main` + Pages**, not raw `agent/*` commits.

## Branch model (do not invent a second one)

| Ref | Role | Who writes |
|---|---|---|
| `baseline` | Frozen scaffold reset point. Never force-push. | Human only (rare scaffold upgrades) |
| `main` | Shipped playable line. **GitHub Pages deploys only from here.** | Human merge of green PRs |
| `agent/<run-id>` | One autonomy prompt / experiment | Agent (via `github_*` tools) |

Rules:

1. **Never push to `main` or `baseline`.** Open a PR from `agent/<run-id>` into `main`.
2. **One prompt = one run branch**, cut from `baseline` (clean experiment) or from `main` (continue shipped game). Prefer `baseline` for a new 7-day run.
3. **Pages has one live URL:** `https://fr4iser90.github.io/autonomous-lab/`. WIP plays on DSH/`npm run dev` `:5173`.
4. Reset a ruined tree: `git fetch origin && git checkout baseline && git checkout -b agent/<new-run-id>`.

Helper: `./scripts/new-run.sh <run-id>` (creates `agent/<run-id>` from `origin/baseline`).

## Stack (fixed)

- Vite + TypeScript client game; **no** Three.js, **no** game server, **no** multiplayer
- Combat/render: **Canvas2D or Phaser 3** — pick ONE in M1, pin in `package.json` + DECISIONS.md, do not flip later
- Economy / combat sim / save logic in pure modules under `src/`, covered by Vitest
- Playwright only for UI demos in DSH (not required for every gate)
- `npm run gate` (= `test` + `build`) must pass before claiming a task done
- Preview **5173** only — never bind **3080**
- Vite `base` is `/autonomous-lab/` for project Pages — do not change without updating Pages docs

## Product fantasy (incremental TD hybrid)

Document details in CONTENT.md. Keep this order:

1. **G0** Enemies walk a path; player **clicks enemies** for damage/scrap; tower shop locked
2. **G1** Click-power upgrades
3. **G2** Auto-click tiers
4. **G3** Towers unlock → place/upgrade; TD becomes primary DPS
5. **G4** Escalating waves + **prestige** soft-reset (meta multiplier). UI says Prestige/Ascend/Reboot — never “wall”

## Autonomy files

| Path | Role |
|---|---|
| `.autonomy/SPEC.md` | Product requirements |
| `.autonomy/ROADMAP.md` | Ordered milestones |
| `.autonomy/DECISIONS.md` | Durable architecture choices |
| `.autonomy/TASKS/next.md` | The single current task |
| `.autonomy/state.json` | Owned by autonomy tools — do not hand-edit unless repairing |

Also keep `PROGRESS.md` / `CONTENT.md` / `README.md` current.

## Definition of Done (every Ralph round)

1. Implement **one** concrete task from `.autonomy/TASKS/next.md`.
2. Update Vitest for new pure logic.
3. `npm run gate` green locally.
4. Update SPEC/ROADMAP/TASKS/DECISIONS + PROGRESS as needed.
5. Commit on `agent/<run-id>`; `github_push`; open/update PR to `main`.
6. Do **not** mark autonomy `complete` without gate-green evidence and a mergeable PR. Human merges; Pages follows `main`.

If blocked: set autonomy phase `blocked` with a real blocker — no endless speculative rewrites.

## Out of scope unless SPEC says otherwise

- Rewriting CI/Pages workflows without a failing gate
- Changing `baseline` history
- Cloud saves, auth, multiplayer, or a second Pages site
- Replacing the engine after M1 pin (Canvas ↔ Phaser flip)
