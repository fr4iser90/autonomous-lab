<!-- BOILERPLATE_PLACEHOLDER: human-facing boilerplate README. On a game run, rewrite the playable sections for the shipped game; keep Pages URL + live-loop notes accurate. See BOILERPLATE.md -->

# Autonomous Lab

**Genre-agnostic boilerplate** for long public autonomy runs. CI gates + **automerge** + GitHub Pages so a run stays **live**. This repo does **not** ship game genres or overnight objectives — those come from whatever objective the human pastes into the agent for that run.

**Ownership:** see [`BOILERPLATE.md`](BOILERPLATE.md) and [`AGENTS.md`](AGENTS.md). Scaffold toys under `src/` are **not** the product.

**Play (live after green automerge):** https://fr4iser90.github.io/autonomous-lab/

Local preview: `pnpm install && pnpm run dev` (or npm) → http://127.0.0.1:5173/autonomous-lab/

## Live loop

```
agent/* commit → Open agent PR → CI gate → Automerge (squash) → main → Pages
```

| Surface | Meaning |
|---|---|
| `baseline` | Frozen boilerplate |
| `agent/<run-id>` | Experiment branch (follow commits here) |
| `main` | Automerge target + Pages |
| Actions `CI` / `Open agent PR` / `Automerge agent PRs` | Automation |

Broken `gate` → no merge → Pages stays on last green `main`.

## Quick start

```sh
pnpm install   # or npm install
pnpm run gate
pnpm run dev
./scripts/new-run.sh <run-id>
```

Then paste your run objective into the agent with this checkout as the workspace.

## Autonomy shape

```text
start with the pasted objective; keep gate green; push agent/* only; never push main/baseline;
never edit BOILERPLATE_OWNED paths; automerge + Pages follow green CI
```

## One-time GitHub setup

1. Repo **Public**; Pages **Source = GitHub Actions** (not Jekyll/Static HTML templates)
2. Rulesets: `protect-main` (PR + required check **`gate`**, no bypass), `protect-baseline` (restrict updates; bypass = you only)
3. Settings → Actions → General → Workflow permissions:
   - **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
4. First bootstrap: merge PR that adds the Automerge workflows onto `main` once (workflows only run from the default branch). After that, agent pushes automerge themselves.

## Scripts

| Script | Meaning |
|---|---|
| `npm test` / `pnpm test` | Vitest |
| `npm run build` | typecheck + Vite build (`base=/autonomous-lab/`) |
| `npm run gate` | test + build (+ protect-boilerplate on agent PRs in CI) |
| `npm run dev` | Vite on 5173 |
