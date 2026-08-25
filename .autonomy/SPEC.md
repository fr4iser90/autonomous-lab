# Product spec — incremental TD (7-day public experiment)

## Goal

Ship a coherent **incremental tower-defense hybrid** that strangers can play on GitHub Pages after merges to `main`: click-first combat → auto-click → towers/waves → prestige.

## Hard requirements

- Client-only (no game server, no auth, no cloud save)
- Vite + TypeScript; Canvas2D **or** Phaser 3 (one engine, pinned in M1)
- Pure modules for economy/combat/save under `src/`, Vitest-covered
- `npm run gate` green before any "done" claim
- Ship via `agent/<run-id>` PRs into `main`; Pages deploys from `main` only
- Keep Vite `base` = `/autonomous-lab/`

## Player-facing MVP (enough to prove the experiment)

1. Visible path + spawning enemies + lives/leak rules
2. Click-enemy damage + scrap HUD
3. Click-power shop (G1) and at least one auto-click tier (G2)
4. Tower unlock (G3): place at least two tower types; towers shoot
5. Wave escalation + prestige soft-reset with a permanent meta multiplier (G4 lite)
6. localStorage save schema `version` (corrupt → reset)
7. README how-to-play; CONTENT.md tables for towers/enemies/upgrades

## Non-goals

- Multiplayer, accounts, payments
- Three.js / fog-exploration maps
- Calling prestige a “wall” in UI copy
- Making `agent/*` look tidy — only `main` must stay playable
