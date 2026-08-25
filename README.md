# Autonomous Lab

**Genre-agnostic boilerplate** for public DSH autonomy experiments. CI gates + **automerge** + GitHub Pages so a long agent run stays **live**. Concrete game prompts stay in the harness (`PROMPTS/`).

**Play (live after green automerge):** https://fr4iser90.github.io/autonomous-lab/

Local/DSH preview: `npm run dev` → http://127.0.0.1:5173

## Live loop (mode A)

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
npm install
npm run gate
npm run dev
./scripts/new-run.sh <run-id>
```

Then run your harness `PROMPTS/…` objective in DSH against this workspace.

## DSH autonomy (shape)

```text
/autonomy start <harness PROMPTS objective>; keep npm run gate green; push agent/* only; never push main/baseline; automerge + Pages follow green CI
```

## One-time GitHub setup

1. Repo **Public**; Pages **Source = GitHub Actions** (not Jekyll/Static HTML templates)
2. Rulesets: `protect-main` (PR + required check **`gate`**, no bypass), `protect-baseline` (restrict updates; bypass = you only)
3. Settings → Actions → General → Workflow permissions:
   - **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
4. Rulesets: `protect-main` (PR + required check **`gate`**, no bypass), `protect-baseline` (restrict updates; bypass = you only)
5. First bootstrap: merge PR that adds the Automerge workflows onto `main` once (workflows only run from the default branch). After that, agent pushes automerge themselves.
6. Pages **Source = GitHub Actions** (ignore Jekyll/Static HTML template cards)

## Scripts

| Script | Meaning |
|---|---|
| `npm test` | Vitest |
| `npm run build` | typecheck + Vite build (`base=/autonomous-lab/`) |
| `npm run gate` | test + build |
| `npm run dev` | Vite on 5173 |
