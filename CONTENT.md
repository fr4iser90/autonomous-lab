# VoxelCraft — Content Bible

## Theme
Infinite voxel sandbox (Minecraft-style) — procedural terrain, break/place, inventory, crafting, mobs, day/night, voxel lighting.

## Registries

| Registry | Count | Entries |
|---|---|---|
| blocks | 17 | Grass, Dirt, Stone, Sand, Water, Log, Planks, Leaves, Cobblestone, Snow, Bedrock, Coal Ore, Iron Ore, Crafting Table, Torch, Lava, Air |
| items | 20 | Dirt, Stone, Wood, Planks, Sticks, Wooden Pickaxe, Stone Pickaxe, Iron Pickaxe, Coal, Iron Ingot, Torch, Crafting Table, Apple, Beef, Cooked Beef, Water Bucket, Lava Bucket, Stone Sword, Iron Shovel, Air |
| recipes | 10 | Planks, Sticks, Crafting Table, Torches, Wooden Pickaxe, Stone Pickaxe, Iron Pickaxe, Wooden Sword, Cooked Beef, Iron Spade |
| npcs | 7 | Cow, Pig, Sheep, Chicken, Rabbit, Zombie, Creeper |

```
CAPS: blocks=17/CAP items=18/CAP recipes=10/CAP npcs=7/CAP
NEXT_CYCLE_PRIORITY: recipes
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
| 7 | Rabbit | false | 3 | 0.8 | 0 | Beef |
| 8 | Zombie | true | 20 | 0.7 | 3 | Iron Ingot |
| 9 | Creeper | true | 20 | 0.6 | 10 | Iron Ingot |
