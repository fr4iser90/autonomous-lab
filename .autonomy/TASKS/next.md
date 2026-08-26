# Next Task: M1 — Vite + Three.js scaffold

## Goal
Build the VoxelCraft game scaffold with:
1. Vite + TypeScript + Three.js r160 on the boilerplate
2. Title screen with 3 save slots (Continue/New/Delete)
3. SaveService with localStorage persistence
4. Basic world generation (noise-based terrain)
5. Three.js renderer with chunk meshing
6. First-person player controller
7. HUD overlay (crosshair, hotbar, debug)
8. Vitest smoke tests for all modules

## Deliverables
- src/data/blocks.ts, items.ts, recipes.ts, npcs.ts
- src/services/SaveService.ts
- src/ui/TitleScreen.ts, HUD.ts, InventoryScreen.ts, InstructionsOverlay.ts
- src/world/Noise.ts, Chunk.ts, World.ts
- src/player/Player.ts
- src/graphics/Renderer.ts, MeshBuilder.ts
- src/main.ts (entry point)
- tests/smoke.spec.ts
- PROGRESS.md, CONTENT.md, README.md

## Gate Criteria
- `pnpm run gate` (test + build) passes
- Playwright: title screen loads with 3 slot rows
- Canvas renders terrain mesh (not black)
