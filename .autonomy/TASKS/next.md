# Next Task: Phase 2 — Content Cycle 1 (Reach CAP for all registries)

## Goal
Fill out block, item, recipe, and NPC registries to reach CAP targets: blocks=20, items=20, recipes=20, npcs=20.

## Current State
- Blocks: 17 (id 0-16: Air, Dirt, Grass, Stone, Cobblestone, Planks, Log, Leaves, Sand, Bedrock, Torch, CraftingTable, CoalOre, IronOre, GoldOre, Water, Lava)
- Items: 17 (id 0-16)
- Recipes: need to check current count
- NPCs: need to check current count
- CAP targets: blocks=20, items=20, recipes=20, npcs=20

## Deliverables (Phase 2 Cycle 1)
1. Add 3 new blocks (total 20): e.g., Brick, Glass, DiamondOre
2. Add 3 new items (total 20): e.g., Brick item, Glass item, Diamond
3. Add recipes for new blocks/items (reach 20 total)
4. Add NPCs to reach 20 total (if needed)
5. Update texture atlas for new blocks
6. Add recipes for new blocks (e.g., glass from sand, brick from clay)
7. Gate: `pnpm run gate` must pass

## Gate Criteria
- `pnpm run gate` passes
- All registries reach or approach CAP targets
- Texture atlas updated with new cells
- All new blocks have UV mappings and colors
