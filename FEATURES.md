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

## P4: Phase 4 Systems

- **Economy** — Scrap currency, shop UI with 5 purchasable items, buy/sell/inventory sync. `Economy.ts`, `shopItems.ts`.
- **Skill tree** — 8 nodes across 3 tiers, skill points from level-ups, UI overlay. `SkillTree.ts`, `tests/skill-tree.test.ts`.
- **Stealth zones** — Player moves at 0.5× speed in dark tiles, Stalker chase AI ignores stealth. `ChaseAI.ts`, `uiHelpers.ts`.
- **Floor traps** — 3 trap types (spike/poison/fire), triggered on walk, `traps.ts` data, DungeonPCG placement, `GameLoop.ts` damage.
- **Item rarity** — Rarity enum (common/uncommon/rare), all 16 items tagged. `items.ts`.
- **LootDrop system** — Weighted drops from mobs, 3D floating collectibles, auto-pickup. `LootDrop.ts`.
- **Rarity UI + loot toast** — Color-coded inventory slots, toast notifications. `main.ts`, `styles.css`, `index.html`.
- **Sealed doors + key consumption** — 4 sealed doors per floor, dungeon key required. `Inventory.ts` (keys), `DungeonPCG.ts` (isSealedDoor/openDoorAt), `GameLoop.ts` (collision block).
- **Stairs descent + floor progression** — BSP-generated stairs in last room, floor counter, `Transition.ts` module.
- **Sacred shrines** — 3 types: Healing (+30% max HP instant), Battle (+2 damage, 30s buff), Warding (+2 armor/damage reduction, 20s). 3D glowing pedestals with pulsing orbs. `shrines.ts`, DungeonPCG shrine gen/render, `GameLoop.ts` activation + buff timer, `ui.ts` proximity prompt + [R] key, `index.html`, `styles.css`, `tests/shrine.test.ts` (16 tests).
