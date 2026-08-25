# Autonomous Lab

**Genre-agnostic boilerplate** for public DSH autonomy experiments. CI gates + branch model + GitHub Pages. Concrete game prompts stay in the harness (`PROMPTS/`) — not as defaults in this repo.

**Play (after the repo is public and Pages is enabled):** https://fr4iser90.github.io/autonomous-lab/

Local/DSH preview: `npm run dev` → http://127.0.0.1:5173

## Surfaces

| Ref | Meaning |
|---|---|
| `baseline` | Frozen boilerplate — reset point |
| `agent/<run-id>` | One prompt / experiment (WIP) |
| `main` | Shipped line + GitHub Pages |
| `npm run gate` | `test` + `build` must stay green |

Judge experiments by **playable `main`** and green Actions, not by messy `agent/*` history.

## Quick start

```sh
npm install
npm run gate
npm run dev
```

New run from baseline:

```sh
./scripts/new-run.sh <run-id>
```

Example: `./scripts/new-run.sh run-2026-08-25` — then paste/run your harness prompt in DSH against this workspace. The agent fills `.autonomy/*` from that objective.

## DSH autonomy (shape only — objective comes from your prompt)

```text
/autonomy start <paste or summarize the harness PROMPTS objective>; keep npm run gate green; PR agent/* into main; never push main/baseline; Pages deploys from main after human merge
```

See `AGENTS.md`.

## One-time GitHub setup

1. Make the repo **Public** (required for free Pages)
2. Settings → Pages → Source: **GitHub Actions**
3. Protect `main` and `baseline` (PR + green CI)

## Scripts

| Script | Meaning |
|---|---|
| `npm test` | Vitest |
| `npm run build` | typecheck + Vite build (`base=/autonomous-lab/`) |
| `npm run gate` | test + build |
| `npm run dev` | Vite on 5173 |
