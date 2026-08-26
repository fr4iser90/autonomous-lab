# PROGRESS.md — VoxelCraft

**Branch:** `agent/voxel-craft-20260825`
**Phase:** M6 — Voxel lighting (sky + torch)
**Status:** COMPLETE — gate green (113/113 tests, build succeeds ~506KB)

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
- M2: Texture atlas + per-face UV mapping → **COMPLETE ✅**
  - Procedural 16×16 per-block textures with noise-based variation
  - 3-row atlas grid: top / side / bottom face textures per block
  - Grass: green top, grass-on-dirt side, dirt bottom
  - Log: bark rings on ends, vertical grain on sides
  - Per-face UV mapping in MeshBuilder (face type → row lookup)
  - CanvasTexture with NearestFilter (pixel-perfect voxel look)
  - 8 M2 smoke tests (total 38)
  - Fixed dead code in main.ts renderer disposal
- M3: Raycast break/place with mining progress → **COMPLETE ✅**
  - DDA voxel raycasting (Amanatides & Woo algorithm)
  - First-person raycast from camera through crosshair (6-block reach)
  - Returns hit position, face normal, and distance
  - Left-click hold-to-break with mining progress bar
  - Mining speed inversely proportional to block hardness
  - Right-click place block adjacent to hit face
  - Wireframe block highlight overlay (color shifts red as block breaks)
  - Chunk rebuild on break/place
  - 8 M3 smoke tests (total 46)
- M4: Inventory + hotbar + crafting → **COMPLETE ✅**
  - 36-slot inventory with hotbar (slots 0–8)
  - Item stacking with maxStack per item type
  - insert/remove/swap/transfer operations
  - 2×2 inventory crafting + 3×3 crafting table grid
  - Recipe matching with sub-pattern search in larger grids
  - Block break drops items into shared inventory
  - E key toggles inventory overlay, 1-9 selects hotbar slot
  - 42 M4 smoke tests (total 88)
- M5: Biomes + world features → **COMPLETE ✅**
  - 5 biome system: Plains, Desert, Snow, Forest, Mountains
  - Biome affects terrain height, surface block, and features
  - Multi-octave FBM with pre-computed 3D noise caches for performance
  - Cave generation: lower caves (y=5-30) and upper caves (y=25-45)
  - Ore generation: iron (y<20) and coal (y<40) with noise-based placement
  - Tree generation: 3-5 block trunk + rounded leaf canopy
  - Forest biomes have 15% tree density, plains 5%
  - 12 M5 smoke tests (total 100)
- M6: Voxel lighting (sky + torch) → **COMPLETE ✅**
  - `ChunkLighting` class with skyLight + blockLight Uint8Arrays per chunk (16×96×16)
  - Sky light: top-down column pass, blocked by opaque blocks (15→0)
  - Block light: BFS flood-fill from torches (level 14, decays 1/block, 6-neighbor)
  - `isLightSource()` and `getLightSourceLevel()` helpers
  - MeshBuilder: lighting-aware vertex colors (brightness = 0.25 + light/15 × 0.75)
  - Switched from MeshBasicMaterial to MeshStandardMaterial with vertexColors
  - Lighting calculated on chunk load and after block changes (including neighbors for torch propagation)
  - BlockTorch at id=15: transparent, solid=false, color [255, 200, 50]
  - 13 M6 smoke tests (total 113)
- M7: Mobs (passive + hostile AI) → PENDING
- M8: Day/night cycle + autosave → PENDING

## CAPS
```
blocks=16/CAP items=16/CAP recipes=10/CAP npcs=6/CAP
```

## NEXT
M7: Mobs (passive + hostile AI).
