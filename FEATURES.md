# Features — Ashen Delve

## P12: Phase 12: Boss Trophy Tracking
- **Boss kill counter** — Persistent trophy icon (👑) in HUD showing total boss kills across runs. `RunTracker.getBossKills()`, `updateTrophyUI()`.
- **Boss kill toast** — "👑 Boss Defeated!" toast with floor number on boss death (melee or DOT). Integrated into `GameLoop.ts` mob death path.
- **Death screen boss stats** — Boss-kill count displayed on death screen alongside mobs slain. `checkPlayerDeath` returns `bossKills` in snapshot.
- **Best run boss stat** — Best run display now includes boss kills: "🏆 Best Run: Floor N · M mobs · B bosses".

## P9: Phase 9: Quality of Life

- **Quick-Use Hotbar** — Bottom-center bar with 4 quick-use slots. Number keys 1-4 for instant potion/key use. Potion cooldown: 1 second (overlay + red border during cooldown). Event delegation click handler on parent element. Inventory: `tryQuickUsePotion()`, `tryQuickUseKey()`, `isOnCooldown()`, `resetCooldowns()`. UI: `updateQuickUseBar()`, `handleQuickUse()`, `setQuickUseUpdate()`. Bundle: 619.01 KB. 319 tests (313+6 P9-2).

## P8: Phase 8 Polish
- **HitEffects + ScreenShake** — Floating damage numbers, hit burst particles, mesh flash, screen shake on all damage events. `HitEffects.ts`, `ScreenShake.ts`.
- **Audio feedback** — `critHit()` (sharp square), `playerHit()` (dull triangle), `death()` (descending sawtooth) at all 6 damage points. `AudioEngine.ts`.
- **Toast polish** — Improved positioning/styling for loot, floor-advance, door, and shrine toasts. `styles.css`, `ui.ts`.
- **Dynamic lighting** — Organic torch flicker (irrational frequency ratios + draft bursts), ambient light intensity fades with floor depth (0.7 → 0.25 over 16 floors). `lighting.ts` (pure math), `GameRenderer.ts`, `GameLoop.ts`.

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
