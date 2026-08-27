# Autonomous Lab — agent constitution

This **public** repo is a **genre-agnostic boilerplate** for long autonomy runs. It owns toolchain, CI, branch rules, and live Pages — **not** any concrete game. Genre, milestones, and fantasy come only from the **objective the human pastes into the agent** for that run (see also `lab/examples/` templates, or the pasted overnight prompt).

Outsiders follow **commits on `agent/*`** and the **live Pages** site fed by automerge into `main`.

Read **`lab/BOILERPLATE.md`** for the allow/deny path lists. When unsure: if a file is marked `BOILERPLATE` / `BOILERPLATE_PLACEHOLDER` / `BOILERPLATE_TOY`, it is **not** game design authority.

**Layout:** `lab/` = machine (docs, roles, examples). Repo **root** = current experiment (`src/`, run docs, Pages app).

## Branch model (do not invent a second one)

| Ref | Role | Who writes |
|---|---|---|
| `baseline` | Frozen boilerplate reset. Never force-push. | Human only (rare scaffold upgrades) |
| `main` | Live playable line. **GitHub Pages deploys only from here.** | Automerge of green `agent/*` PRs (or human) |
| `agent/<run-id>` | One autonomy run / experiment | Agent (via `github_*` tools) |

Rules:

1. **Never push to `main` or `baseline`.** Work only on `agent/<run-id>`.
2. **One run = one branch** (`agent/<run-id>`). Do **not** open a parallel
   `agent/<run-id>-rebased` (or second PR) for the same experiment — that forks
   history and causes permanent conflicts. Cut from `baseline` for a clean
   experiment (preferred) or from `main` to continue a shipped line.
3. **Live loop:** push `agent/*` → workflow opens/updates PR → CI `gate` on
   agent tip → automerge into **`main`** → Pages rebuilds → **Actions resets
   that `agent/*` tip to `origin/main`** (force-with-lease against the merged
   tip SHA) so the next cycle starts clean.
   - Clean PR: squash-merge.
   - **CONFLICTING PR:** Actions merges **agent → `main`** with path rules
     (run-owned from agent, `BOILERPLATE_OWNED` from main), runs `gate` on the
     result, pushes **`main`**, closes the PR, then syncs `agent/*` → `main`.
   - **CI tip red (local green ≠ GitHub):** workflow `ci-fail-bugs` appends a
     `blocker` to `BUGS.md` on that `agent/*` branch and pushes. Builder must
     FIX-ONLY that entry before the next milestone. Local `gate` alone is not ACCEPT.
4. **Pages URL:** `https://fr4iser90.github.io/autonomous-lab/`. WIP also on local `npm run dev` / `pnpm run dev` `:5173`.
5. New run: agent runs `git fetch origin && git checkout -b agent/<run-id> origin/baseline` (human may use `./scripts/new-run.sh` as a local shortcut for the same git steps).
6. After a land+sync: `git fetch origin && git reset --hard origin/agent/<run-id>`
   (or continue committing on the tip Actions just moved). Never invent a second
   branch to “fix conflicts”.

## Ownership (boilerplate vs run)

| Boilerplate-owned (agent: **do not edit** on `agent/*`) | Run-owned (agent: **replace / grow** from the objective) |
|---|---|
| `.github/workflows/**`, **`lab/**`** | `src/**` (delete toys; ship the game) |
| `scripts/new-run.sh`, `LICENSE` | `tests/**`, `demo/**`, `index.html` (game shell) |
| Vite Pages `base` = `/autonomous-lab/` (do not change) | `PROGRESS.md`, `CONTENT.md`, `FEATURES.md`, `SOAK.md`, `BUGS.md`, `DEMO.md` |
| CI/automerge/Pages wiring | `README.md` **`# Current run` only** (game playable section) |
| `README.md` Lab header (above `# Current run`) | `package.json` deps the game needs (keep `gate` / `dev` scripts working) |

**Tracking surface for the run (primary):** `PROGRESS.md` (+ `CONTENT.md` / `FEATURES.md` / … as the overnight prompt requires).  
**Do not** treat boilerplate toy UI (`src/economy.ts`, harvest button) as the product.

### `.autonomy/` (legacy / optional)

`.autonomy/*` may exist as empty templates. **Preferred:** ignore it and track in `PROGRESS.md` / prompt milestones.  
If you touch `.autonomy`, never let it contradict `PROGRESS.md`. Do not invent a second product there. CI does not require filling it.

## Stack defaults (boilerplate)

- Vite + TypeScript client app; preview **5173** only — never bind **3080**
- Prefer **`pnpm install`** over **`npm install`** when both work. One package manager per tree.
- Vitest for pure logic; Playwright when the objective / prompt requires UI demos
- `npm run gate` / `pnpm run gate` = **typecheck + lint + boundaries + test + build**
  (runs may also add `test:ui`). Must pass before claiming a task done.
- Engines (Canvas, Phaser, Three, DOM-only, …) — see **`lab/MODEL_STACKS.md`**; pin in
  `PROGRESS.md` / `shared/design.md` on first adopt — do not thrash
- Role laws: `lab/roles/*` (+ IDEA). Example genre packs: `lab/examples/games/*`.
  Typical loop: **one Initial** then **one Followup** forever (Followup cycles
  fix→feature; do not require pasting multiple role files each nudge).

## Definition of Done (every autonomy round)

1. Implement **one** concrete task from the overnight prompt / `PROGRESS.md` NOW (not from leftover boilerplate prose).
2. Update Vitest / UI smoke when applicable.
3. `npm run gate` green **locally**.
4. Tip **GitHub** check `gate` green (or FIX-ONLY open CI `BUGS.md` blockers from
   `ci-fail-bugs`). Local green alone is not enough to claim ACCEPT / next Mn.
5. Update run docs (`PROGRESS` / `CONTENT` / …) to match what shipped.
6. Commit + push on `agent/<run-id>` (PR via Actions or tools).
7. After automerge into `main`: Actions syncs `agent/*` → `main` tip. Continue
   on that same branch (fetch/reset if local tip is stale). Do **not** open a
   second `-rebased` branch.
8. Do **not** claim complete without gate-green evidence **on GitHub**. Pages follows successful automerge into `main`.

## Out of scope unless the run objective says otherwise

- Baking a specific game genre into `baseline`
- Rewriting CI/Pages/automerge / `lab/**` / README Lab header from the agent
- Changing `baseline` history
- Cloud saves, auth, multiplayer, or a second Pages site
