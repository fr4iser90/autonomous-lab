# Autonomous Lab

Agent-operated Vite + TypeScript game lab with mechanical gates (`npm run gate`) and PR-based shipping. The repo stays **private**; play via local/DSH preview on port **5173** (not GitHub Pages).

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
   │         └── PR ──► main   ← integration / "shipped" line
```

- **Each prompt → new `agent/<run-id>` branch** (from `baseline` for a clean start).
- Protect `main` and `baseline` in GitHub branch settings (no direct push).
- Preview WIP in DSH/`npm run dev`; merge to `main` when a run is worth keeping.

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
| `npm run build` | `tsc --noEmit` + Vite production build |
| `npm run gate` | test + build |
| `npm run dev` | Vite on 5173 |
