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
- **Floor** — current depth (1–10+), each with BSP-generated layout

## Items
Defined in `src/data/items.ts`:

| ID | Name | Type | Value | Icon |
|----|------|------|-------|------|
| rusty-sword | Rusty Sword | weapon | +3 DMG | ⚔️ |
| iron-axe | Iron Axe | weapon | +5 DMG | 🪓 |
| flame-staff | Flame Staff | weapon | +7 DMG | 🔥 |
| steel-club | Steel Club | weapon | +9 DMG | 🏏 |
| health-potion | Health Potion | potion | +8 HP | 🧪 |
| greater-potion | Greater Potion | potion | +16 HP | 🧪 |
| mega-potion | Mega Elixir | potion | +32 HP | 💎 |
| dungeon-key | Dungeon Key | key | 1 | 🔑 |
| iron-shield | Iron Shield | armor | +2 DEF | 🛡️ |
| rune-ring | Rune Ring | armor | +2 HP | 💍 |

Items drop from defeated mobs (loot table seeded by Mulberry32 RNG).

## Floors (themes)
Defined in `src/data/floors.ts`:

| ID | Name | Floor Range | Prototypes |
|----|------|-------------|------------|
| ash | Ash Stone Catacombs | 1–3 | torch, rubble, bone |
| crypt | Ancient Crypt | 4–6 | torch, pillar, sarcophagus |
| ruins | Elven Ruins | 7–9 | torch, column, fountain |
| magma | Magma Caverns | 10+ | torch, lava-pool, crystal |

`getThemeForFloor(floor)` switches themes at floors 4, 7, 10.

## Mobs
All extend `MobKit` in `src/entities/`:

| Entity | HP | Damage | Speed | Aggro Range | Chase Speed | Notes |
|--------|----|--------|-------|-------------|-------------|-------|
| Goblin | 10 | 3 | 0.5 | 8 | 2.5 | Standard melee, green/brown |
| Shade | 8 | 5 | 0.3 | 10 | 1.8 | Fast ghost, translucent, fade |
| Stalker | 14 | 4 | 0.6 | 6 | 3.5 | Fast, aggressive, tanky arms |
| Skeleton | 8 | 3 | 0.4 | 12 | 1.5 | Ranged attacker, bows arrows |
| Bat | 4 | 2 | 0.8 | 10 | 4.0 | Small swarm, erratic flight |
| Ogre | 30 | 7 | 0.25 | 8 | 1.8 | Massive brute, devastating hits |
| Mummy | 16 | 5 | 0.35 | 9 | 2.0 | Slow aura, green curse glow |
| Boss | 60 | 8 | 0.4 | 12 | 2.0 | Floor 4+, crown glow, burning eyes |

## Dungeon PCG
BSP room splitting → L-shaped corridors → BFS reachability → stairs in last room. Seed-based via Mulberry32 RNG.

## Shrines
Defined in `src/data/shrines.ts` — 3 shrine types placed randomly on each floor (non-spawn, non-stairs floor tile):

| Type | ID | Effect | Duration |
|------|----|--------|----------|
| Healing | `heal` | Instant HP restore (+30% max HP) | Instant |
| Battle | `buff` | +2 damage to player attacks | 30s (ticks) |
| Warding | `shield` | +2 armor (damage reduction) | 20s (ticks) |

Activation: Player walks near shrine → [R] key prompt appears → confirms activation. Visual: 3D glowing pedestal with pulsing orb. One shrine per floor.

## Audio
Web Audio API procedural: footsteps (0.4s), mob growls (3s), attack swoosh (0.5s), ambient 55Hz drone.

## Save System
Key: `ashen-delve-save-v1` (localStorage). Schema versioned, corrupt-safe. Persists floor, HP, inventory, settings.

## Camera
FollowCamera: distance=10, height=7, FOV=55, followLag=0.08

## Minimap
Canvas 2D top-down. Cell size 3. Floor/door/stairs cells, spawn green, stairs white, player red.
