# Next Task: M4 — Inventory + Hotbar + Crafting

## Goal
Implement the player inventory system with hotbar selection, 36-slot inventory UI, and basic crafting recipes.

## Deliverables
1. `src/data/inventory.ts` — Inventory data model + operations
   - 36-slot inventory array with item counts
   - Hotbar selection (1-9 keys, slots 0-8)
   - Drop item on ground (Q key)
2. `src/ui/InventoryScreen.ts` — Extended to show full 36-slot grid (E toggle)
   - Full inventory grid display
   - Drag-and-drop placeholder (click to select)
3. Update `src/main.ts` — Wire E key for inventory toggle
   - Show/hide inventory screen
   - Update HUD hotbar display
4. `src/physics/Crafting.ts` — 2×2 inventory crafting + 3×3 crafting table
   - Recipe matching by pattern
   - Result item insertion
5. Add tests in `tests/smoke.spec.ts` — inventory operations
6. Update PROGRESS.md, ROADMAP.md

## Gate Criteria
- `pnpm run gate` passes
- Inventory opens/closes with E
- Hotbar updates with 1-9 keys
- Crafting produces correct results
