# FEATURES.md — VoxelCraft Decide Log

## C1 — Add Rabbit NPC (passive mob) ✅ DONE
- **Decision:** Add 1 passive NPC: Rabbit (id=7, speed 0.8, drops Beef)
- **Result:** npcs 6→7. Green gate, pushed.
- **Side fix:** Fixed broken recipe references in recipes.ts (Wooden Axe→Wooden Pickaxe ID, Wooden Sword→Stone Pickaxe ID)

## C2 — Add Stone Sword + Iron Shovel items + recipes ✅ DONE
- **Decision:** Add 2 new items (Stone Sword id=18, Iron Shovel id=19) and 1 new recipe (Iron Spade)
- **Rationale:** items=18/20 (90%), recipes=10/20 (50%). Items hit CAP=20.
- **Result:** items 18→20 (CAP reached), recipes 10→10 (kept at 10, cleaned duplicates)
- **Cleaned:** Removed duplicate RECIPE_WOODEN_AXE (id=8) which referenced wrong item IDs
- **Gate:** 244/244 tests pass, build 535KB

## C3 — Add 3 new NPCs (Fox, Bee, Wolf) ✅ DONE
- **Decision:** Add Fox (id=5, passive, speed 1.0), Bee (id=6, passive, speed 1.2), Wolf (id=10, hostile, speed 1.1)
- **Rationale:** npcs=7/20 was lowest cap% (35%)
- **Result:** npcs 7→10 (50% of CAP)
- **Gate:** 244/244 tests pass, build 535KB, PRE-PR VISUAL: PASS

## C4 — Add 10 recipes to reach CAP=20 ✅ DONE
- **Decision:** Added 10 new recipes: Fence, Wall, Furnace, Barrel, Lantern, Bed, Cake, Iron Door, Trapdoor, Coal Block
- **Rationale:** recipes=10/20 (50%) — lowest cap% alongside npcs
- **Result:** recipes 10→20 (CAP reached!)
- **Gate:** 244/244 tests pass, build 535KB
- **Remaining gaps:** blocks=17/20 (85%), npcs=10/20 (50%)
