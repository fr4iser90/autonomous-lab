# Decisions

- **2026-08-25 — Stack:** Vite + TypeScript + DOM/CSS; no Phaser/Three/game server.
- **2026-08-25 — Hosting:** Private repo; play via DSH/`npm run dev` on 5173. No GitHub Pages (requires public repo or Enterprise).
- **2026-08-25 — Branches:** `baseline` frozen scaffold; `agent/<run-id>` for work; never push `main`/`baseline` from the agent.
- **2026-08-25 — Gates:** `npm run gate` (test + build) is the mechanical Definition of Done; CI runs on PRs/`main`/`agent/**`.
