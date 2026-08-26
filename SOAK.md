# SOAK.md — VoxelCraft Phase 2b Stability Soak

## Phase 2b Purpose
After all 4 registries hit CAP=20, soak tests verify the content doesn't break existing gameplay systems.

## Soak Tests

| Test | Description | Status |
|---|---|---|
| S1: Registry integrity | All getBlock/getItem/getRecipe/getNPC return correct entries | ✅ 244/244 gate pass |
| S2: Texture atlas | 3×20 grid renders without errors | Pending |
| S3: Recipe matcher | Shape-aware sub-pattern search works with all 20 recipes | Pending |
| S4: Chunk generation | All 20 blocks render correctly in generated chunks | Pending |
| S5: NPC spawning | All 20 NPCs spawn in correct biomes | Pending |
| S6: Inventory | 20 items + 20 recipes work in inventory/crafting | Pending |
| S7: Day/night cycle | Color interpolation works with all block colors | Pending |

## Soak Criteria
- All 7 soak tests must PASS
- No new test failures
- Build size stays under 1MB
- UI smoke test passes (canvas visible, no JS errors)

## Phase 2b Next
After S1–S7 all PASS → Phase 3: DEMO (video + frames + DEMO.md)
