# PROGRESS.md — VoxelCraft

**Branch:** `agent/voxel-craft-20260825`
**Phase:** M2 — Texture atlas + enhanced rendering
**Status:** IN PROGRESS — gate green (35/35 tests, build succeeds)

## MILESTONES
- M1: Vite + Three.js scaffold, title screen (3 slots), HUD, basic world → **COMPLETE ✅**
  - Vite + TypeScript + Three.js r160 scaffold
  - Title screen with 3 save slots, settings sliders
  - SaveService with localStorage persistence (3 slots)
  - 16 block types (grass, dirt, stone, sand, water, log, planks, leaves, cobblestone, snow, bedrock, coal ore, iron ore, crafting table, torch, air)
  - 16 item types, 10 recipes, 6 NPCs
  - Procedural noise-based chunk generation (16×96×16)
  - MeshBuilder with face culling
  - First-person player controller (WASD, jump, sprint, gravity, collision)
  - World manager with chunk loading/unloading
  - HUD overlay (crosshair, debug info)
  - 30 Vitest smoke tests
- M2: Texture atlas + enhanced rendering → IN PROGRESS
  - Procedural 16×16 per-block textures with noise-based variation
  - Texture atlas (16 blocks in single-row canvas texture)
  - MeshBuilder with UV coordinates per face
  - CanvasTexture with NearestFilter (pixel-perfect voxel look)
  - 5 new M2 smoke tests (total 35)
- M3: Raycast break/place with mining progress → PENDING
- M4: Inventory + hotbar + crafting → PENDING
- M5: Biomes + world features (trees, caves) → PENDING
- M6: Voxel lighting (sky + torch) → PENDING
- M7: Mobs (passive + hostile AI) → PENDING
- M8: Day/night cycle + autosave → PENDING

## CAPS
```
blocks=16/CAP items=16/CAP recipes=10/CAP npcs=6/CAP
```

## NEXT
M2: Continue with UV per-face texture mapping (separate cells for top/bottom/sides).
