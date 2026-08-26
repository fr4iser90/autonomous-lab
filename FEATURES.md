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

## C5 — Add 10 NPCs to reach CAP=20
- **Decision:** Add Donkey, Ocelot, Panda, Parrot, Turtle (passive), Cat, Mooshroom (passive), Skeleton, Spider, Witch (hostile)
- **Rationale:** npcs=10/20 (50%) — second lowest cap%
- **Also:** Fixed getNPC() to use .find() instead of broken array indexing
- **Result:** npcs 10→20 (CAP reached!)
- **Gate:** 244/244 tests pass, build 535KB
- **Remaining gaps:** blocks=17/20 (85% — only remaining gap)

## C6 — Add 3 blocks (Bricks, Glass, Wool) to reach CAP=20
- **Decision:** Add Bricks (id=17), Glass (id=18, transparent), Wool (id=19)
- **Rationale:** blocks=17/20 (85%) — only remaining gap to all-CAP Phase 2 completion
- **Also:** Fixed getBlock() to use .find() for consistency with getNPC()
- **Result:** blocks 17→20 (CAP reached!)
- **Gate:** 244/244 tests pass, build 535KB
- **Phase 2 COMPLETE:** All 4 registries now at CAP=20

## P4-0 — Mob AI Polish: Player HP, Chase, Spawn, Collision ✅ DONE
- **Decision:** Connect player HP to HUD hearts, mob damage callback, death/respawn, better chase steering, safe spawning, mob-to-mob collision
- **Rationale:** All 4 registries at CAP=20; Phase 4 focuses on polish over content fills
- **Changes:**
  - `MobManager.ts`: Replaced hardcoded `playerHp=20` with callback interface (`setPlayerDamageHandler`) for live HP tracking and death respawn
  - `MobManager.ts`: `update()` now delegates damage to player and calls death handler at 0 HP
  - `Mob.ts`: Improved `moveToward()` to try both X and Z independently (previously only tried Z after X was blocked)
  - `Mob.ts`: Passive mobs now look toward player while fleeing (rotation update in updateAI)
  - `Mob.ts`: Added `tryJumpOnStairs` — mobs climb 1-block steps when approaching player
  - `main.ts`: `setupPlayerHP()` wires HUD updateHearts() to game loop + mob damage callbacks
  - `main.ts`: Player death respawns at spawn (x=0, ground Y) with full HP
  - `main.ts`: HUD hearts now animate each frame from actual player HP
- **Gate:** 268/268 tests pass, build 535KB
- **Visual:** Hearts display changes with damage; hostile mobs chase more aggressively; mobs jump over small obstacles

## P4-2 — Skeleton Ranged Attack: Arrows ✅ DONE
- **Decision:** Add projectile system for skeleton ranged attacks; skeletons fire arrows at players in 10-16 block range
- **Rationale:** Skeletons currently behave identically to zombies (melee only). Ranged attacks differentiate hostile mob types and increase gameplay depth
- **Changes:**
  - `Projectile.ts`: New entity system — arrow physics (gravity arc), lifetime (5s), ground/block collision, player AABB hit detection
  - `Projectile.ts`: 3D arrow mesh with shaft, metallic head, white fletching; oriented along velocity vector
  - `MobManager.ts`: Projectile tracking, `fireProjectile()` spawns arrows toward player, `updateProjectiles()` handles physics + collision + cleanup
  - `MobManager.ts`: Skeleton ranged attack — 10-16 block range, 1.8s shoot cooldown per skeleton
  - `Mob.ts`: Added `shootCooldown` to MobEntity interface; countdown in updateAI
  - `Mob.ts`: `shootCooldown` reduced each frame; skeletons fire when player enters ranged range
- **Gate:** 268/268 tests pass, build 542KB
- **Visual:** Arrows visible as 3D objects in-world; player takes damage on direct hit; arrows arc and fall with gravity

## P4-3 — Player Melee Attack: Combat Loop ✅
- **Decision:** Add player melee attack against hostile mobs — complete the combat loop alongside skeleton ranged attacks
- **Rationale:** Players need a way to fight back; currently mobs can damage the player but the player has no offensive capability
- **Changes:**
  - `items.ts`: Added `attackDamage` field to ItemDef; stone sword=4, iron pickaxe=2, stone pickaxe=2, fists=1 (default)
  - `items.ts`: New `getAttackDamage()` accessor — returns item's attackDamage or 1 for fists
  - `Mob.ts`: New `applyKnockback()` — pushes entity away from source position with horizontal force + slight upward pop
  - `MobManager.ts`: New `meleeHit()` — raycast cone check against hostile mobs within 3-block range and 30° cone
  - `main.ts`: New `performMelee()` — checks crosshair for mobs, deals damage from held item, applies knockback + hurt flash
  - `main.ts`: Left-click handler now tries melee first, falls through to block mining on miss
- **Gate:** 268/268 tests pass, build 544KB
- **Visual:** Mobs knock back and flash red when hit; hit sound plays; left-click on mobs damages them, left-click on blocks mines them

## P4-4 — Health Regeneration ✅
- **Decision:** Add player health regeneration — heals 1 HP every 2s after 5s without taking damage
- **Rationale:** Players have no way to recover from combat damage without respawning; regeneration adds survival depth and reduces frustration
- **Changes:**
  - `Player.ts`: New `damageFreeTimer` property tracks seconds since last damage
  - `Player.ts`: New `regenerate(dt, maxHp)` — heals 1 HP every 2s after 5s damage-free, stops at maxHp
  - `main.ts`: `damageFreeTimer` reset to 0 on mob contact damage + lava damage
  - `main.ts`: `damageFreeTimer` reset to 0 on player death/respawn
  - `main.ts`: `player.regenerate(dt)` called every frame after `player.update()`
- **Gate:** 268/268 tests pass, build 544KB
- **Visual:** Player slowly recovers HP when safe; damage resets the regen timer

## P4-5 — Mob HP Bar Billboarding ✅
- **Decision:** Make mob HP bars billboard (face the camera) so they are always readable from any angle
- **Rationale:** HP bars existed but were static planes facing +Z — nearly invisible from most camera angles, defeating their purpose
- **Changes:**
  - `Mob.ts`: `updateHPBar()` accepts optional `cameraPos: THREE.Vector3` — calls `lookAt(cameraPos)` on HP bar + background planes; background always visible (bar hidden at 0 HP); simplified color to flat green/yellow/red
  - `MobManager.ts`: `update()` passes `playerPos` as camera position to `updateHPBar()` for every mob each frame
  - `main.ts`: Melee hit handler passes `renderer.camera.position` to `updateHPBar()` for instant post-hit feedback
  - `Mob.ts`: HP bar background (`hpBarBg`) now always visible (was previously not managed separately)
- **Gate:** 268/268 tests pass, build 544KB
- **Visual:** HP bars now always face the player regardless of mob rotation or camera angle

## P4-6 — Block Breaking Particles ✅
- **Decision:** Add visual particle burst when breaking blocks — satisfying block-break feedback like Minecraft
- **Rationale:** Blocks disappear instantly when broken with no visual feedback; particles add satisfying "pop" and confirm break action
- **Changes:**
  - `Particle.ts` (new): `ParticleManager` — `spawnBlockBreak(x, y, z, color)` creates 12 particles with random outward velocity; `update(dt)` applies gravity, fades alpha over 1.5s lifetime, shrinks proportionally, disposes dead particles to prevent memory leaks
  - `main.ts`: `ParticleManager` instantiated, scene attached, particles spawned on block break via `getBlock()` lookup for color match, updated every frame in game loop
- **Gate:** 268/268 tests pass, build 546KB
- **Visual:** 12 colored cubes burst outward from each broken block, falling with gravity and fading — matches the broken block's color

## P4-7 — Unique Ambient Sounds Per Mob Type
- **Decision:** Give each mob type a procedurally unique ambient sound via Web Audio API synthesis
- **Rationale:** All 8 ambient streams (cow, pig, chicken, zombie, skeleton, sheep, wolf, bee) previously shared only 3 generic sounds; unique sounds add world immersion
- **Changes:**
  - `SoundService.ts`: New `MobAmbientType` union type; `scheduleAmbient()` now takes `MobAmbientType` instead of `SoundName`; `playMobAmbient()` dispatches to 8 unique synthesis methods
  - **8 procedural sounds:** Cow moo (sawtooth+vibrato), pig snort (noise burst), chicken peep (sine chirp), sheep baa (sawtooth sweep), zombie groan (dual detuned saw), skeleton rattle (modulated noise), wolf howl (sine sweep+vibrato), bee buzz (square+sub LP)
  - **HurtFlash.ts fix:** Removed unused `this.scene` field and `opacity` destructuring to resolve TS6133 errors
- **Gate:** 268/268 tests pass, build 551KB
- **Audio:** 8 concurrent ambient streams with unique timbres, 3–12s random intervals
