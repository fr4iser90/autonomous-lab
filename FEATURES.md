# Features — Ashen Delve

## M12: Full Integration
**DungeonPCG** — BSP room splitting with L-shaped corridors, BFS reachability verification. Seed-based generation via Mulberry32 RNG. Stairs placed in last room.

**PlayerKit** — Capsule body, sphere head, cone helm, inverted cone cloak. Walk bob animation, attack lean.

**Mob System** — 7 mob variants (Goblin, Shade, Stalker, Skeleton, Bat, Ogre, Mummy) + Boss. Chase AI with configurable aggro/chase ranges. Specialized AI: Skeleton ranged, Bat swarm, Ogre charge, Mummy curse aura. Fade animation on death.

**Boss** — 60 HP, golden crown with emissive glow, burning red eyes (intensity 2.0), cloak. Crown glow pulses during attacks.

**CombatEngine** — Melee attacks, 15% crit chance (2x damage), combat log with emoji (💥 CRIT, 💀 death). Max 20 log entries.

**Inventory** — 10 items (4 weapons, 3 potions, 1 key, 2 armor). Items drop from mobs. Toggle with E key.

**Floor Themes** — 4 themes: Ash Stone Catacombs (1–3), Ancient Crypt (4–6), Elven Ruins (7–9), Magma Caverns (10+). Procedural color palette.

**AudioEngine** — Web Audio procedural: footsteps, mob growls, attack swoosh, ambient 55Hz drone. Volume controls.

**Minimap** — Canvas 2D top-down overlay. Floor/door/stairs cells, spawn green, stairs white, player red.

**SaveService** — localStorage persistence, schema versioned, corrupt-safe.

**Camera** — FollowCamera with configurable distance/height/FOV/lag.

## M11: Boss + Minimap
- Boss entity with crown emissive glow
- Canvas minimap overlay

## M10: Audio + Settings
- Procedural Web Audio API sounds
- AudioSettings: masterVolume, sfxVolume, reduceMotion

## M9: 3+ Mobs + PropField
- Shade and Stalker mob variants
- PropField: torches, rubble, bone piles

## M8: Floor Themes
- 2 floor themes with distinct palettes
- Theme switching at floor 4

## M7: Loot + Inventory
- Item definitions and loot drops
- Inventory system with E key toggle

## M6: CombatEngine
- Melee combat, crit system, death handling

## M5: Mob Kit + Chase AI
- Abstract MobKit with type-specific buildMesh
- ChaseAI with aggro range, chase speed

## M4: Player + Input
- WASD movement, left-click attack
- FollowCamera integration

## M3: DungeonPCG
- BSP generation, corridor generation, BFS reachability

## M2: Three.js Bootstrap
- Scene, renderer, lighting, camera

## M1: Visual Spec + Shell
- Title screen, game canvas, style sheet

## P2: Phase 2 Content Expansion
- **4 new mobs**: Skeleton (ranged), Bat (swarm), Ogre (tanky brute), Mummy (curse aura)
- **4 new items**: steel-club (+9 DMG), mega-potion (+32 HP), iron-shield (+2 DEF), rune-ring (+2 HP)
- **2 new floor themes**: Elven Ruins (floors 7–9), Magma Caverns (10+)
- mobKits: 8/16, items: 10/16, floorThemes: 4/16
