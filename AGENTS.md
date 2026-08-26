# Autonomous Lab — agent constitution

This **public** repo is a **genre-agnostic boilerplate** for long autonomy runs. It owns toolchain, CI, branch rules, and live Pages — **not** any concrete game. Genre, milestones, and fantasy come only from the **objective the human pastes into the agent** for that run (see also `example-prompts/` outside the live loop, or the pasted overnight prompt).

Outsiders follow **commits on `agent/*`** and the **live Pages** site fed by automerge into `main`.

Read **`BOILERPLATE.md`** for the allow/deny path lists. When unsure: if a file is marked `BOILERPLATE` / `BOILERPLATE_PLACEHOLDER` / `BOILERPLATE_TOY`, it is **not** game design authority.

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

## Ownership (boilerplate vs run)

| Boilerplate-owned (agent: **do not edit** on `agent/*`) | Run-owned (agent: **replace / grow** from the objective) |
|---|---|
| `.github/workflows/**`, `AGENTS.md`, `BOILERPLATE.md` | `src/**` (delete toys; ship the game) |
| `scripts/new-run.sh`, `LICENSE` | `tests/**`, `demo/**`, `index.html` (game shell) |
| Vite Pages `base` = `/autonomous-lab/` (do not change) | `PROGRESS.md`, `CONTENT.md`, `FEATURES.md`, `SOAK.md`, `BUGS.md`, `DEMO.md` |
| CI/automerge/Pages wiring | `README.md` **`# Current run` only** (game playable section) |
| `README.md` Lab header (above `# Current run`) | `package.json` deps the game needs (keep `gate` / `dev` scripts working) |
| Prefer leave `example-prompts/**` alone | |

**Tracking surface for the run (primary):** `PROGRESS.md` (+ `CONTENT.md` / `FEATURES.md` / … as the overnight prompt requires).  
**Do not** treat boilerplate toy UI (`src/economy.ts`, harvest button) as the product.

### `.autonomy/` (legacy / optional)

`.autonomy/*` may exist as empty templates. **Preferred:** ignore it and track in `PROGRESS.md` / prompt milestones.  
If you touch `.autonomy`, never let it contradict `PROGRESS.md`. Do not invent a second product there. CI does not require filling it.

## Stack defaults (boilerplate)

- Vite + TypeScript client app; preview **5173** only — never bind **3080**
- Prefer **`pnpm install`** over **`npm install`** when both work. One package manager per tree.
- Vitest for pure logic; Playwright when the objective / prompt requires UI demos
- `npm run gate` (= `test` + `build`) must pass before claiming a task done (`pnpm run gate` equivalent)
- Engines (Canvas, Phaser, Three, DOM-only, …) are **chosen by the run objective** — pin the choice in `PROGRESS.md` or `FEATURES.md` / a run `DECISIONS` note when first adopted — do not thrash

## Definition of Done (every autonomy round)

1. Implement **one** concrete task from the overnight prompt / `PROGRESS.md` NOW (not from leftover boilerplate prose).
2. Update Vitest / UI smoke when applicable.
3. `npm run gate` green locally.
4. Update run docs (`PROGRESS` / `CONTENT` / …) to match what shipped.
5. Commit + push on `agent/<run-id>` (PR via Actions or tools).
6. After automerge: sync with `origin/main` (**merge preferred**; see overnight prompt SAFE SYNC) before the next chunk — **without** discarding agent work.
7. Do **not** claim complete without gate-green evidence. Pages follows successful automerge into `main`.

## Out of scope unless the run objective says otherwise

- Baking a specific game genre into `baseline`
- Rewriting CI/Pages/automerge / `AGENTS.md` / `BOILERPLATE.md` / README Lab header from the agent
- Changing `baseline` history
- Cloud saves, auth, multiplayer, or a second Pages site
