# Decisions

- **2026-08-25 — Stack:** Vite + TypeScript + DOM/CSS; no Phaser/Three/game server.
- **2026-08-25 — Deploy:** GitHub Actions builds `dist/` from `main` to Pages; `base` is `/autonomous-lab/`.
- **2026-08-25 — Branches:** `baseline` frozen scaffold; `agent/<run-id>` for work; never push `main`/`baseline` from the agent.
- **2026-08-25 — Gates:** `npm run gate` (test + build) is the mechanical Definition of Done.
