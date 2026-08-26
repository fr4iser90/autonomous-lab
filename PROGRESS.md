# PROGRESS.md — VoxelCraft

**Branch:** `agent/voxel-craft-20260825`
**Phase:** M1 — Vite + Three.js scaffold, title screen, save service
**Status:** COMPLETE — gate green (30/30 tests, build succeeds)

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
- M2: Texture atlas + enhanced rendering → PENDING
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
M2: Implement texture atlas and enhanced chunk meshing with per-face UVs.
