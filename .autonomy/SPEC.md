# Product spec (seed)

## Goal

Evolve this scaffold into a coherent **incremental / idle** browser game that is fun to click for a few minutes and keeps a clear fantasy.

## Hard requirements

- Client-only (no game server, no auth, no cloud save)
- Vite + TypeScript + DOM/CSS
- Economy math in pure modules under `src/`, covered by Vitest
- `npm run gate` green before any "done" claim
- Ship via `agent/<run-id>` PRs into `main` (Pages deploys from `main` only)

## Player-facing MVP

1. One primary resource with a big readable number
2. Manual harvest action
3. At least two generators that produce over time
4. At least one upgrade multiplier
5. localStorage save/load with schema `version`
6. Short README "how to play"

## Non-goals (unless ROADMAP later promotes them)

- Multiplayer, accounts, payments
- Engine rewrites (Phaser/Three)
- Multiple GitHub Pages sites in this repository
