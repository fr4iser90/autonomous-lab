# Autonomous Lab

Agent-operated Vite + TypeScript game lab with mechanical gates and GitHub Pages.

**Play (after merge to `main`):** https://fr4iser90.github.io/autonomous-lab/

## Quick start

```sh
npm install
npm run gate    # test + build — required green before "done"
npm run dev     # http://127.0.0.1:5173
```

## Branch model

```
baseline  ── frozen scaffold (never force-push)
   │
   ├── agent/run-idle-7d     ← one autonomy prompt
   ├── agent/run-roguelite   ← another prompt
   │         │
   │         └── PR ──► main ──► GitHub Pages (one live site)
```

- **Pages = only `main`.** GitHub does not give you one Pages URL per branch.
- **Each prompt → new `agent/<run-id>` branch** (from `baseline` for a clean start).
- Protect `main` and `baseline` in GitHub branch settings (no direct push).

Create a run branch:

```sh
./scripts/new-run.sh idle-7d
```

## DSH autonomy

In the harness workspace (clone of this repo + `GITHUB_TOKEN`):

```text
/autonomy start Ship a fun incremental game on this scaffold; keep npm run gate green; PR agent/* into main; never push main/baseline
```

See `AGENTS.md` and `.autonomy/` for the constitution and seed plan.

## Scripts

| Script | Meaning |
|---|---|
| `npm test` | Vitest |
| `npm run build` | `tsc --noEmit` + Vite production build (`base=/autonomous-lab/`) |
| `npm run gate` | test + build |
| `npm run dev` | Vite on 5173 |
