# SOAK.md — VoxelCraft Phase 2b Stability Soak

## Phase 2b Purpose
After all 4 registries hit CAP=20, soak tests verify the content doesn't break existing gameplay systems.

## Soak Tests

| Test | Description | Status |
|---|---|---|
| S1: Registry integrity | All getBlock/getItem/getRecipe/getNPC return correct entries | ✅ PASS (244/244 gate) |
| S2: Texture atlas | 3×20 grid integrity, valid face data, UV tile math | ✅ PASS (3 tests) |
| S3: Recipe matcher | Shape-aware sub-pattern search with representative recipes | ✅ PASS (4 tests) |
| S4: Chunk generation | All 20 blocks in seed-42 chunks, biome variance, determinism | ✅ PASS (3 tests) |
| S5: NPC spawning | All 20 NPCs valid stats, colors, biomes, passive/hostile split | ✅ PASS (6 tests) |
| S6: Inventory | 20 items + 20 recipes in inventory, 36-slot stacks, hotbar snapshot | ✅ PASS (4 tests) |
| S7: Day/night cycle | Time progression, sky color interpolation, ambient light variation | ✅ PASS (4 tests) |

## Soak Criteria
- ✅ All 7 soak tests PASS (24 soak tests total)
- ✅ No new test failures (268 tests pass, 0 regressions)
- ✅ Build size 535 KB (under 1 MB limit)
- ✅ Build succeeds (tsc + vite build)

## Phase 2b Next
✅ Gate green → Phase 3: DEMO (video + frames + DEMO.md)
