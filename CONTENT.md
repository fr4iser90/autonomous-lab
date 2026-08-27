# Content — Ashen Delve

## Theme (locked at M1)
Procedural dungeon crawler in Three.js. You descend the **Ashen Delve** — a procedurally generated dungeon of ash-stone catacombs and ancient crypts, fighting goblins, shades, stalkers, and the **Boss** on floor 4+.

## Palette (locked at M1)
- Background: `#0a0a0e`
- Floor: `#2a2520`
- Wall: `#1a1815`
- Wall highlight: `#3a3530`
- Accent: `#ff9944`
- Blood: `#cc3333`
- Fog: `#0a0a0e`

## Currencies / Stats
- **HP** — hero health (20 base)
- **Damage** — hero attack power (3 base, boosted by weapons)
- **Floor** — current depth (1–4+), each with BSP-generated layout

## Items
Defined in `src/data/items.ts`:

| ID | Name | Type | Value | Icon |
|----|------|------|-------|------|
| rusty-sword | Rusty Sword | weapon | +3 DMG | ⚔️ |
| iron-axe | Iron Axe | weapon | +5 DMG | 🪓 |
| flame-staff | Flame Staff | weapon | +7 DMG | 🔥 |
| health-potion | Health Potion | potion | +8 HP | 🧪 |
| greater-potion | Greater Potion | potion | +16 HP | 🧪 |
| dungeon-key | Dungeon Key | key | 1 | 🔑 |

Items drop from defeated mobs (loot table seeded by Mulberry32 RNG).

## Floors (themes)
Defined in `src/data/floors.ts`:

| ID | Name | Floor Range | Prototypes |
|----|------|-------------|------------|
| ash | Ash Stone Catacombs | 1–3 | torch, rubble, bone |
| crypt | Ancient Crypt | 4+ | torch, pillar, sarcophagus |

`getThemeForFloor(floor)` switches theme at floor 4.

## Mobs
All extend `MobKit` in `src/entities/`:

| Entity | HP | Damage | Speed | Aggro Range | Chase Speed | Notes |
|--------|----|--------|-------|-------------|-------------|-------|
| Goblin | 6 | 2 | 2.5 | 8 | 2.0 | Standard melee, green/brown |
| Shade | 4 | 1 | 3.0 | 12 | 2.5 | Fast, ghostly, translucent |
| Stalker | 10 | 4 | 1.5 | 6 | 1.2 | Tanky, slow, red |
| Boss | 60 | 8 | 1.8 | 10 | 1.5 | Floor 4+, crown glow, burning eyes |

## Dungeon PCG
BSP room splitting → L-shaped corridors → BFS reachability → stairs in last room. Seed-based via Mulberry32 RNG.

## Audio
Web Audio API procedural: footsteps (0.4s), mob growls (3s), attack swoosh (0.5s), ambient 55Hz drone.

## Save System
Key: `ashen-delve-save-v1` (localStorage). Schema versioned, corrupt-safe. Persists floor, HP, inventory, settings.

## Camera
FollowCamera: distance=10, height=7, FOV=55, followLag=0.08

## Minimap
Canvas 2D top-down. Cell size 3. Floor/door/stairs cells, spawn green, stairs white, player red.
