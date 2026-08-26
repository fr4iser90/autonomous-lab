# VoxelCraft — Content Bible

## Theme
Infinite voxel sandbox (Minecraft-style) — procedural terrain, break/place, inventory, crafting, mobs, day/night, voxel lighting.

## Registries

| Registry | Count | Entries |
|---|---|---|
| blocks | 20 | Grass, Dirt, Stone, Sand, Water, Log, Planks, Leaves, Cobblestone, Snow, Bedrock, Coal Ore, Iron Ore, Crafting Table, Torch, Lava, Bricks, Glass, Wool, Air |
| items | 20 | Dirt, Stone, Wood, Planks, Sticks, Wooden Pickaxe, Stone Pickaxe, Iron Pickaxe, Coal, Iron Ingot, Torch, Crafting Table, Apple, Beef, Cooked Beef, Water Bucket, Lava Bucket, Stone Sword, Iron Shovel, Air |
| recipes | 20 | Planks, Sticks, Crafting Table, Torches, Wooden Pickaxe, Stone Pickaxe, Iron Pickaxe, Wooden Sword, Cooked Beef, Iron Spade, Fence, Wall, Furnace, Barrel, Lantern, Bed, Cake, Iron Door, Trapdoor, Coal Block |
| npcs | 20 | Cow, Pig, Sheep, Chicken, Fox, Bee, Rabbit, Zombie, Creeper, Wolf, Donkey, Ocelot, Panda, Parrot, Turtle, Cat, Mooshroom, Skeleton, Spider, Witch |

```
CAPS: blocks=20/CAP items=20/CAP recipes=20/CAP npcs=20/CAP
PHASE 2 COMPLETE — All 4 registries at CAP=20
```

## Block Details

| ID | Name | Color | Hardness | Transparent |
|---|---|---|---|---|
| 0 | Air | [0,0,0] | 0 | true |
| 1 | Grass | [34,139,34] | 1 | false |
| 2 | Dirt | [139,90,43] | 1 | false |
| 3 | Stone | [128,128,128] | 3 | false |
| 4 | Sand | [210,180,140] | 1 | false |
| 5 | Water | [30,144,255] | 0 | true |
| 6 | Log | [101,67,33] | 2 | false |
| 7 | Planks | [205,133,63] | 2 | false |
| 8 | Leaves | [34,139,34] | 1 | true |
| 9 | Cobblestone | [105,105,105] | 3 | false |
| 10 | Snow | [255,255,255] | 1 | false |
| 11 | Bedrock | [50,50,50] | 0 | false |
| 12 | Coal Ore | [70,70,70] | 4 | false |
| 13 | Iron Ore | [180,150,130] | 5 | false |
| 14 | Crafting Table | [180,120,60] | 2 | false |
| 15 | Torch | [255,200,50] | 1 | true |
| 16 | Lava | [255,69,0] | 0 | true |
| 17 | Bricks | [170,85,65] | 3 | false |
| 18 | Glass | [200,220,255] | 1 | true |
| 19 | Wool | [240,240,240] | 1 | false |

## Item Details

| ID | Name | Stackable | Max Stack |
|---|---|---|---|
| 0 | Air | false | 1 |
| 1 | Dirt | true | 64 |
| 2 | Stone | true | 64 |
| 3 | Wood | true | 64 |
| 4 | Planks | true | 64 |
| 5 | Sticks | true | 64 |
| 6 | Wooden Pickaxe | false | 1 |
| 7 | Stone Pickaxe | false | 1 |
| 8 | Iron Pickaxe | false | 1 |
| 9 | Coal | true | 64 |
| 10 | Iron Ingot | true | 64 |
| 11 | Torch | true | 64 |
| 12 | Crafting Table | true | 64 |
| 13 | Apple | true | 64 |
| 14 | Beef | true | 64 |
| 15 | Cooked Beef | true | 64 |

## NPC Details

| ID | Name | Hostile | HP | Speed | Damage | Drop |
|---|---|---|---|---|---|---|
| 1 | Cow | false | 10 | 0.5 | 0 | Beef |
| 2 | Pig | false | 4 | 0.5 | 0 | Beef |
| 3 | Sheep | false | 4 | 0.5 | 0 | Leaves |
| 4 | Chicken | false | 2 | 0.6 | 0 | Apple |
| 5 | Fox | false | 5 | 1.0 | 0 | Beef |
| 6 | Bee | false | 1 | 1.2 | 1 | Apple |
| 7 | Rabbit | false | 3 | 0.8 | 0 | Beef |
| 8 | Zombie | true | 20 | 0.7 | 3 | Iron Ingot |
| 9 | Creeper | true | 20 | 0.6 | 10 | Iron Ingot |
| 10 | Wolf | true | 8 | 1.1 | 2 | Beef |
| 11 | Donkey | false | 15 | 0.7 | 0 | Beef |
| 12 | Ocelot | false | 4 | 1.3 | 0 | Apple |
| 13 | Panda | false | 6 | 0.4 | 0 | Apple |
| 14 | Parrot | false | 2 | 1.5 | 0 | Apple |
| 15 | Turtle | false | 3 | 0.3 | 0 | Beef |
| 16 | Cat | false | 5 | 0.9 | 0 | Apple |
| 17 | Mooshroom | false | 10 | 0.5 | 0 | Cooked Beef |
| 18 | Skeleton | true | 15 | 0.6 | 2 | Coal |
| 19 | Spider | true | 8 | 1.0 | 2 | Beef |
| 20 | Witch | true | 25 | 0.5 | 5 | Torch |
