# Autonomous Lab

Public **7-day agent experiment**: an incremental tower-defense hybrid, built by DSH autonomy on `agent/*` branches, merged to `main` when gate-green.

**Play (after Pages is enabled on the public repo):** https://fr4iser90.github.io/autonomous-lab/

Local/DSH preview: `npm run dev` → http://127.0.0.1:5173

## What this is

| Surface | Meaning |
|---|---|
| `baseline` | Frozen scaffold — reset point |
| `agent/<run-id>` | One autonomy prompt (WIP; may be messy) |
| `main` | Shipped line + GitHub Pages |
| CI `npm run gate` | `test` + `build` must stay green |

Agent-built code on purpose. Expect chaos on `agent/*`; judge the experiment by **playable `main`** and green Actions.

## Quick start

```sh
npm install
npm run gate
npm run dev
```

New 7-day run:

```sh
./scripts/new-run.sh incremental-td-7d
```

## DSH autonomy (example)

```text
/autonomy start 7-day incremental TD hybrid on this scaffold: click-first enemies → auto-click → towers/waves → prestige. Keep npm run gate green. PR agent/* into main only. Never push main/baseline. Pages deploys from main after human merge.
```

See `AGENTS.md` and `.autonomy/`.

## Make the repo public + Pages (one-time human)

1. GitHub → Settings → General → Danger zone → **Change visibility → Public**
2. Settings → Pages → Source: **GitHub Actions**
3. Protect `main` and `baseline` (no direct push; require PR + green CI on `main`)

## Scripts

| Script | Meaning |
|---|---|
| `npm test` | Vitest |
| `npm run build` | typecheck + Vite build (`base=/autonomous-lab/`) |
| `npm run gate` | test + build |
| `npm run dev` | Vite on 5173 |
