<!-- PROGRESS: Ashen Delve — Phase 2 complete. All 12 milestones shipped. -->

# Progress

## NOW

- Phase: **complete** — M1–M12 all shipped
- Milestone: Full playable game deployed to Pages
- Branch: `agent/dungeon-crawl-20260827` → PR #31 → `main`
- Engine: **Three.js** 0.170.0 (procedural meshes only — no imports)
- Gate: **24 tests green, build green, 500 KB bundle**

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

- 2026-08-27: M1–M9 shipped (PR #31). Gate green.
- 2026-08-27: M10 shipped — AudioEngine with Web Audio procedural audio.
- 2026-08-27: M11 shipped — Boss mob with crown glow, Canvas minimap overlay.
- 2026-08-27: M12 shipped — Full integration, audio timing, combat log, gate green.
- 2026-08-27: All 12 milestones complete. PR #31 on track for automerge.

## CAP Checklist

- mobKits: 4/16 (Goblin, Shade, Stalker, Boss) — well below CAP
- items: 6/16 — well below CAP
- floorThemes: 2/16 — well below CAP
- propTypes: (none added) — within CAP

## Next (Phase 3+)

- Extended dungeon floors (depth scaling)
- More mob variants, loot tables, skill tree
- Playwright UI smoke tests for title/game screens
