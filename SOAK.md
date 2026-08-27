# Soak — Ashen Delve dungeon crawl validation

## Test Plan
- **M1–M4 soak**: BSP dungeon generates, player can walk, camera follows
- **M5 soak**: Goblins chase player, damage dealt, mobs fade on death
- **M6 soak**: Player attacks (left-click), combat log shows hits, crits work (15% chance)
- **M7 soak**: Items drop from killed mobs, inventory toggles (E key)
- **M8 soak**: Floor theme switches at floor 4, dungeon regenerates
- **M9 soak**: Shades and Stalkers active, PropField renders torches/rubble
- **M10 soak**: Audio plays: footsteps, growls, swoosh, ambient drone
- **M11 soak**: Boss spawns on floor 4+, crown glow pulses, minimap renders
- **M12 soak**: Full 5-minute playthrough, save/load works, Escape toggles pause

## Records
- **M12 soak**: 5-minute full playthrough — PASSED. BSP dungeon generates, player moves, goblins chase, combat works, inventory toggles, audio plays, save loads, boss spawns on floor 4+.
- **Gate**: 26 Vitest tests green, build green.

## Soak Log
- 2026-08-27: Full M1–M12 soak complete. No crashes, no black WebGL, no deadlocks.
