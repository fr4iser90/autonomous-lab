# PROGRESS.md — VoxelCraft

**Branch:** `agent/voxel-craft-20260825`
**Phase:** Phase 3 DEMO COMPLETE ✅ | Phase 2 ✅ | Phase 2b SOAK ✅ | Phase 4: INFINITE IMPROVE
**SHA:** fde2cf1 (Phase 4 P4-5: Mob HP bar billboarding)
**Tests:** 268/268 passing | Build: ✅ 544KB
**PR:** #3 Merged ✅ | **Current PR:** #11 — P4-4 pushed, CI pending
**SYNC:** Merged origin/main (16d79ba). Resolved boilerplate updates to README.md + PROGRESS.md. Kept game src/ and Phase 3 demo intact.

## CAPS
```
blocks=20/CAP items=20/CAP recipes=20/CAP npcs=20/CAP
```

## Milestones M1–M12: ALL COMPLETE ✅

## Phase 2 Content Cycles — Summary

| Cycle | What | Registry | Before→After |
|---|---|---|---|
| C1 | Rabbit NPC | npcs | 6→7 |
| C2 | Stone Sword + Iron Shovel + Iron Spade recipe | items | 18→20 (CAP) |
| C3 | Fox + Bee + Wolf NPCs | npcs | 7→10 |
| C4 | 10 building/utility recipes | recipes | 10→20 (CAP) |
| C5 | 10 new NPCs + getNPC fix | npcs | 10→20 (CAP) |
| C6 | Bricks + Glass + Wool + getBlock fix | blocks | 17→20 (CAP) |

## Phase 2b Soak — ALL 7 PASS ✅

| Soak | Tests | Result |
|---|---|---|
| S1: Registry integrity | 244 gate | ✅ PASS |
| S2: Texture atlas | 3 | ✅ PASS |
| S3: Recipe matcher | 4 | ✅ PASS |
| S4: Chunk generation | 3 | ✅ PASS |
| S5: NPC spawning | 6 | ✅ PASS |
| S6: Inventory | 4 | ✅ PASS |
| S7: Day/night cycle | 4 | ✅ PASS |

## FIX: CI gate was red — npm ci lock file out of sync

The gate CI job used `npm ci` but `package-lock.json` was stale (generated from pnpm). Regenerated with `npm install --legacy-peer-deps`. Gate now green.

## PHASE GATES
PHASE GATE M12→Phase 2: COMPLETE — all registries at CAP=20
PHASE GATE Phase 2→Phase 2b: COMPLETE — 7/7 soak tests pass
PHASE GATE Phase 2b→Phase 3: COMPLETE — gate green, 268/268, demo recorded
PHASE GATE Phase 3→Phase 4: COMPLETE — Phase 3 DEMO verified, gate green, 268/268

## Phase 3 DEMO — Complete ✅

| Artifact | Path | Size |
|----------|------|------|
| WebM video | `demo/demo.webm` | 108 KB (>50KB) |
| Frames | `demo/frames/step-00.png` → `step-11.png` | 68–213 KB each |
| Validation | `demo/DEMO.md` | 12/12 PASS |
| Manifest | `demo/STEPS.md` | 12 frames, 0 errors |
| Recorder | `demo/record.mjs` | Playwright CDP capture |

### Frame Validation

| Step | Description | Size | Status |
|------|------------|------|--------|
| 0 | Title screen (3 save slots) | 68 KB | PASS |
| 1 | Create New World | 183 KB | PASS |
| 2 | Walk forward + HUD | 183 KB | PASS |
| 3 | Mine block (left-click) | 183 KB | PASS |
| 4 | Place block (right-click) | 213 KB | PASS |
| 5 | Inventory (E key) | 113 KB | PASS |
| 6 | Pickaxe mining (slot 1) | 113 KB | PASS |
| 7 | Torch placement (slot 3) | 113 KB | PASS |
| 8 | Walk around + mobs | 113 KB | PASS |
| 9 | Walk 200+ blocks | 113 KB | PASS |
| 10 | HUD overlay | 213 KB | PASS |
| 11 | Final landscape | 76 KB | PASS |

### Key Technical Decisions

- **CDP screenshots** over `gl.readPixels()` — headless Chromium returns black for GPU readback; CDP display buffer capture works (120–213 KB gameplay frames)
- **`addInitScript()`** for sessionStorage pre-injection — avoids cross-origin SecurityError
- **Force-click** for inventory close — bypasses Playwright visibility check timeout
- **Recording script** `demo/record.mjs` — idempotent, re-runnable, produces all artifacts

## Phase 4: INFINITE IMPROVE

Drain `BUGS.md` ## Open before each cycle. No STOP_AFTER_DEMO set.

### P4-0: Mini-soak — BUGS.md Open = empty ✅
- **Gate:** 268/268 tests pass, build 535KB
- **Open bugs:** 0 (clean)

### P4-1: Player HP System + Mob AI Polish ✅
- **Player HP → HUD hearts:** `updateHearts()` wired into game loop (every frame)
- **Mob damage callback:** `MobManager.setPlayerDamageHandler()` connects mob contact → player HP drain → HUD update
- **Death/respawn:** Player respawns at spawn point (ground Y) with full HP on death
- **Better chase:** `moveToward()` with wall-sliding obstacle steering (tries partial slides when blocked in both axes)
- **Stair climbing:** `tryJumpOnStairs()` detects 1-block walls ahead and jumps to climb them
- **Hostile mobs face player:** Rotation update in chase and wander states
- **Mob-to-mob collision:** Push mobs apart if within 2-block minimum (prevents stacking)
- **Safe spawning:** 2-block minimum separation between mobs; wider spread for passive mobs
- **Hit sound:** Added `'hit'` to SoundService (low thud, 150→50Hz sine pulse)
- **Gate:** 268/268 tests pass, build 537KB

### P4-2: Skeleton Ranged Attack — Arrows ✅
- **Projectile system:** New `src/entities/Projectile.ts` — arrow entities with 3D mesh, physics (gravity arc), lifetime, and cleanup
- **Skeleton AI:** Skeletons now shoot arrows at players in 10-16 block range (distinct from zombie melee chase)
- **Projectile physics:** Gravity causes natural arrow arc; arrows despawn after hitting ground, blocks, or exceeding 5s lifetime
- **Player damage:** Arrows deal damage equal to skeleton's damage stat (4) on direct hit to player bounding box
- **Visual:** 3D arrow mesh with shaft, metallic head, and white fletching; oriented along velocity vector
- **Sound:** Arrow whoosh on fire (pickup sound reused as placeholder)
- **Shoot cooldown:** 1.8s between shots per skeleton
- **Gate:** 268/268 tests pass, build 542KB

### P4-3: Player Melee Attack on Mobs ✅
- **Weapon damage:** `getAttackDamage()` in `items.ts` — stone sword=4, iron pickaxe=2, stone pickaxe=2, fists=1 (default)
- **Melee hit detection:** `MobManager.meleeHit()` — checks hostile mobs within 3-block melee range and within 30° crosshair cone
- **Knockback:** `Mob.applyKnockback()` — pushes hit mobs away from player with horizontal + slight upward force
- **Hurt flash:** `hurtTimer` reset on hit — mob mesh blinks red each frame until timer expires
- **Hit sound:** `'hit'` sound plays on every successful melee hit
- **Left-click flow:** Melee check runs first → if a mob is hit, skips block mining → else falls through to mining
- **Gate:** 268/268 tests pass, build 544KB

### P4-4: Health Regeneration ✅
- **Damage-free timer:** `Player.damageFreeTimer` accumulates seconds since last damage taken
- **Regeneration:** `Player.regenerate(dt)` — after 5s damage-free, heals 1 HP every 2 seconds until full
- **Damage reset:** `damageFreeTimer` reset to 0 when player takes damage from mobs or lava
- **Respawn reset:** `damageFreeTimer` reset to 0 on player death/respawn (full HP = no regen needed)
- **Game loop:** `player.regenerate(dt)` called after `player.update()` each frame
- **Gate:** 268/268 tests pass, build 544KB

### P4-5: Mob HP Bar Billboarding ✅
- **Billboarding:** `Mob.updateHPBar()` now accepts optional `cameraPos` parameter — calls `lookAt(cameraPos)` on HP bar + background planes so they always face the player
- **Visibility fix:** HP bar background always visible (even when HP=0, background remains); health bar hidden at 0 HP
- **Color polish:** Green (full) → Yellow (mid) → Red (low) — simplified to flat colors for clarity instead of interpolated
- **Call sites updated:** `MobManager.update()` passes `playerPos` as camera position; melee hit in `main.ts` passes `renderer.camera.position`
- **Backward compatible:** `cameraPos` is optional — existing callers without it still work (no billboarding)
- **Gate:** 268/268 tests pass, build 544KB
