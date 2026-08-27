<!-- PROGRESS: Ashen Delve — Phase 2 complete. All 12 milestones shipped. Merged to main via PR #34. -->

# Progress

## NOW

- Phase: **complete** — M1–M12 all shipped, merged to `main`
- Milestone: Full playable game deployed to Pages
- Branch: `agent/dungeon-crawl-20260827` → PR #34 merged into `main`
- Engine: **Three.js** 0.170.0 (procedural meshes only — no imports)
- Gate: **26 tests green, build green, ~500 KB bundle**
- BUGS: all cleared

## Milestones

| # | Name | Status | Key files |
|---|------|--------|-----------|
| M1 | Visual Spec + Shell | ✅ | `shared/design.md`, `index.html`, `src/styles.css` |
| M2 | Three.js Bootstrap | ✅ | `src/render/GameRenderer.ts`, `src/render/camera.ts` |
| M3 | DungeonPCG | ✅ | `src/systems/DungeonPCG.ts` (BSP + corridors + BFS) |
| M4 | Player + Input | ✅ | `src/kits/playerKit.ts`, `src/systems/input.ts` |
| M5 | Mob Kit + Chase AI | ✅ | `src/entities/MobKit.ts`, `src/entities/Goblin.ts`, `src/systems/ChaseAI.ts`, `src/entities/Animator.ts` |
| M6 | CombatEngine | ✅ | `src/systems/CombatEngine.ts` (melee, crit, death, combat log) |
| M7 | Loot + Inventory | ✅ | `src/systems/Inventory.ts`, `src/data/items.ts` |
| M8 | Floor Themes | ✅ | `src/data/floors.ts` |
| M9 | 3+ Mobs + PropField | ✅ | `src/entities/Shade.ts`, `src/entities/Stalker.ts`, `src/render/PropField.ts` |
| M10 | Audio + Settings | ✅ | `src/systems/AudioEngine.ts` (Web Audio procedural) |
| M11 | Boss + Minimap | ✅ | `src/entities/Boss.ts`, `src/render/Minimap.ts` |
| M12 | Polish + Integration | ✅ | `src/main.ts` (full game loop) |

## Log

- 2026-08-27: M1–M9 shipped (PR #31). Gate green locally.
- 2026-08-27: M10–M12 shipped — Audio, Boss, Minimap, full integration.
- 2026-08-27: Fixed `@vitest/ui` version conflict (4.1.11 → 3.2.4) for CI npm compatibility.
- 2026-08-27: Fixed tsconfig `"node"` types reference (browser-only project).
- 2026-08-27: PR #34 merged into `main` after human resolved conflicts.
- 2026-08-27: All 12 milestones complete. BUGS cleared. Pages deploying.

## CAP Checklist

- mobKits: 4/16 (Goblin, Shade, Stalker, Boss) — well below CAP
- items: 6/16 — well below CAP
- floorThemes: 2/16 — well below CAP
- propTypes: (none added) — within CAP

## Fixes Applied

- `@vitest/ui`: `^4.1.11` → `^3.2.4` — resolved npm peer dep conflict with vitest@3.2.7
- `tsconfig.json`: removed `"node"` from `types` — no Node runtime needed
- `package.json`: `@types/node` installed for typecheck compatibility

## Next (Phase 3+)

- Extended dungeon floors (depth scaling with BSP recursion)
- More mob variants, loot tables, skill tree
- Playwright UI smoke tests for title/game screens
- Soak testing for extended playthroughs
