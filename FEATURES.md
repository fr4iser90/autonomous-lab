# Features — Ashen Delve

## M12: Full Integration
**DungeonPCG** — BSP room splitting with L-shaped corridors, BFS reachability verification. Seed-based generation via Mulberry32 RNG. Stairs placed in last room.

**PlayerKit** — Capsule body, sphere head, cone helm, inverted cone cloak. Walk bob animation, attack lean.

**Mob System** — Goblin (standard melee), Shade (fast ghost), Stalker (slow tanky). Chase AI with configurable aggro/chase ranges. Fade animation on death.

**Boss** — 60 HP, golden crown with emissive glow, burning red eyes (intensity 2.0), cloak. Crown glow pulses during attacks.

**CombatEngine** — Melee attacks, 15% crit chance (2x damage), combat log with emoji (💥 CRIT, 💀 death). Max 20 log entries.

**Inventory** — 6 items (3 weapons, 2 potions, 1 key). Items drop from mobs. Toggle with E key.

**Floor Themes** — 2 themes: Ash Stone Catacombs (floors 1–3), Ancient Crypt (4+). Procedural color palette.

**AudioEngine** — Web Audio procedural: footsteps, mob growls, attack swoosh, 55Hz ambient drone. Volume controls.

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
