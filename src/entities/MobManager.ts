// MobManager: Spawns, updates, and renders all mobs in the world

import * as THREE from 'three'
import { World } from '../world/World'
import { Mob } from './Mob'
import type { MobEntity } from './Mob'
import { MobCow, MobPig, MobChicken, MobZombie, MobSkeleton } from '../data/mobs'
import { DropManager } from './DropManager'
import { SoundService } from '../services/SoundService'
import { Projectile } from './Projectile'
import type { ProjectileEntity } from './Projectile'

export interface MobConfig {
  cowCount: number
  pigCount: number
  chickenCount: number
  zombieCount: number
  skeletonCount: number
}

export const DEFAULT_MOB_CONFIG: MobConfig = {
  cowCount: 5,
  pigCount: 4,
  chickenCount: 6,
  zombieCount: 3,
  skeletonCount: 2,
}

export class MobManager {
  private mobs: MobEntity[] = []
  private projectiles: ProjectileEntity[] = []
  private scene: THREE.Scene
  private config: MobConfig
  private dropManager?: DropManager
  private soundService?: SoundService
  private mobsKilledCount: number = 0
  private onPlayerDamaged?: (damage: number) => number // returns new HP
  private onPlayerDeath?: () => void // called when HP reaches 0

  constructor(scene: THREE.Scene, config: MobConfig = DEFAULT_MOB_CONFIG) {
    this.scene = scene
    this.config = config
  }

  /** Get and reset mob kill count (for achievement tracking) */
  getAndResetMobKills(): number {
    const count = this.mobsKilledCount
    this.mobsKilledCount = 0
    return count
  }

  /** Attach drop manager for mob death drops */
  setDropManager(dm: DropManager): void {
    this.dropManager = dm
  }

  /** Attach sound service for mob sounds */
  setSoundService(ss: SoundService): void {
    this.soundService = ss
  }

  /** Attach player damage handler (returns new HP after mob contact damage) */
  setPlayerDamageHandler(fn: (damage: number) => number, onDeath: () => void): void {
    this.onPlayerDamaged = fn
    this.onPlayerDeath = onDeath
  }

  /** Spawn mobs at random positions on the surface */
  spawn(world: World, seed: number): void {
    this.clear()

    const types = [
      { defId: MobCow.id, count: this.config.cowCount },
      { defId: MobPig.id, count: this.config.pigCount },
      { defId: MobChicken.id, count: this.config.chickenCount },
      { defId: MobZombie.id, count: this.config.zombieCount },
      { defId: MobSkeleton.id, count: this.config.skeletonCount },
    ]

    // Simple seeded PRNG for deterministic placement
    let rng = seed
    const nextRand = () => {
      rng = (rng * 1103515245 + 12345) & 0x7fffffff
      return rng / 0x7fffffff
    }

    for (const type of types) {
      for (let i = 0; i < type.count; i++) {
        // Random offset from origin — spread wider for hostile mobs
        const spread = type.defId >= 4 ? 32 : 48 // hostile mobs spawn closer
        const offsetX = Math.floor((nextRand() - 0.5) * spread)
        const offsetZ = Math.floor((nextRand() - 0.5) * spread)
        let x = offsetX * 16 + 8
        let z = offsetZ * 16 + 8

        // Phase 4 P4-1: Safe spawn — find ground level and verify not inside block
        const mob = Mob.create(type.defId, x, 64, z, world)
        if (!mob) continue

        // Check if spawn position collides with any existing mob
        let spawnOk = true
        for (const existing of this.mobs) {
          const ddx = existing.position.x - mob.position.x
          const ddz = existing.position.z - mob.position.z
          const d = Math.sqrt(ddx * ddx + ddz * ddz)
          if (d < 2.0) { // minimum 2-block separation
            spawnOk = false
            break
          }
        }
        if (!spawnOk) continue

        // Create mesh
        mob.mesh = Mob.createMesh(mob.def, mob.hp, mob.maxHp)
        mob.mesh.position.copy(mob.position)
        mob.mesh.rotation.y = mob.rotation
        this.scene.add(mob.mesh)
        this.mobs.push(mob)
      }
    }
  }

  /** Remove all mobs */
  clear(): void {
    for (const mob of this.mobs) {
      if (mob.mesh && mob.mesh.parent) {
        mob.mesh.parent.remove(mob.mesh)
      }
      // Dispose geometry and materials
      if (mob.mesh) {
        mob.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose())
            } else {
              child.material.dispose()
            }
          }
        })
      }
    }
    this.mobs = []

    // Clean up projectiles
    for (const proj of this.projectiles) {
      Projectile.dispose(proj)
    }
    this.projectiles = []
  }

  /** Update all mobs */
  update(dt: number, playerPos: THREE.Vector3, world: World): void {
    // Phase 4 P4-1: Apply mob-to-mob collision (prevent stacking)
    for (let i = 0; i < this.mobs.length; i++) {
      for (let j = i + 1; j < this.mobs.length; j++) {
        const a = this.mobs[i]
        const b = this.mobs[j]
        const dx = b.position.x - a.position.x
        const dz = b.position.z - a.position.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        const minDist = (a.def.width + b.def.width) * 0.6
        if (dist < minDist && dist > 0.001) {
          const push = (minDist - dist) * 0.5
          const nx = dx / dist * push
          const nz = dz / dist * push
          a.position.x -= nx
          a.position.z -= nz
          b.position.x += nx
          b.position.z += nz
        }
      }
    }

    // Phase 4 P4-2: Skeleton ranged attacks — fire projectiles
    for (const mob of this.mobs) {
      if (mob.def.id === MobSkeleton.id && mob.def.damage > 0) {
        const distToPlayer = mob.position.distanceTo(playerPos)
        // Skeletons shoot when player is in ranged range (10-16 blocks)
        // but not too close (they melee in < 6 range)
        if (distToPlayer >= 10 && distToPlayer <= 16 && mob.shootCooldown <= 0) {
          const projectile = this.fireProjectile(mob, playerPos)
          if (projectile) {
            mob.shootCooldown = 1.8 // 1.8 seconds between shots
          }
        }
      }
    }

    // Update AI
    for (const mob of this.mobs) {
      Mob.updateAI(mob, dt, playerPos, world)

      // Update mesh position
      if (mob.mesh) {
        mob.mesh.position.copy(mob.position)
        mob.mesh.rotation.y = mob.rotation

        // Update HP bar
        Mob.updateHPBar(mob.mesh, mob.def, mob.hp, mob.maxHp)

        // Flash red when hurt
        if (mob.hurtTimer > 0) {
          mob.mesh.children.forEach((child) => {
            if (child instanceof THREE.Mesh && child.material && !(child.material instanceof Array)) {
              child.material.color.lerp(new THREE.Color(1, 0.3, 0.3), 0.3)
            }
          })
        } else {
          // Reset colors - keep original (no action needed for now)
        }
      }
    }

    // Update projectiles
    this.updateProjectiles(dt, world, playerPos)

    // Check player-mob contact (hostile mobs)
    for (const mob of this.mobs) {
      const contact = Mob.checkPlayerContact(mob, playerPos, 20)
      if (contact && this.onPlayerDamaged) {
        const newHp = this.onPlayerDamaged(contact.damage)
        // Check for death
        if (newHp <= 0 && this.onPlayerDeath) {
          this.onPlayerDeath()
        }
      }
    }
  }

  /** Get all mobs */
  getMobs(): MobEntity[] {
    return [...this.mobs]
  }

  /** Get all projectiles */
  getProjectiles(): ProjectileEntity[] {
    return [...this.projectiles]
  }

  /** Get mob by ID */
  getMob(id: number): MobEntity | undefined {
    return this.mobs.find(m => m.id === id)
  }

  /** Fire a projectile from a skeleton toward the player */
  fireProjectile(mob: MobEntity, playerPos: THREE.Vector3): ProjectileEntity | null {
    const dx = playerPos.x - mob.position.x
    const dy = (playerPos.y + 1) - mob.position.y // aim at player's upper body
    const dz = playerPos.z - mob.position.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    if (dist < 1) return null

    const projectile = Projectile.create(
      'skeleton',
      mob.position.x, mob.position.y + 1.5, mob.position.z,
      playerPos.x, playerPos.y + 1, playerPos.z,
      mob.def.damage, // damage from mob definition
    )

    // Create mesh
    projectile.mesh = Projectile.createMesh()
    projectile.mesh.position.copy(projectile.position)
    this.scene.add(projectile.mesh)
    projectile.world = this.mobs.length > 0 ? undefined : undefined // set during update

    this.projectiles.push(projectile)
    this.soundService?.play('pickup') // arrow whoosh

    return projectile
  }

  /** Update all projectiles (physics, collision, cleanup) */
  updateProjectiles(dt: number, world: World, playerPos: THREE.Vector3): void {
    const playerBounds = { minY: playerPos.y, maxY: playerPos.y + 1.8 }
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i]
      proj.playerPos = playerPos
      proj.playerBounds = playerBounds

      const alive = Projectile.update(proj, dt, world)
      if (!alive) {
        Projectile.dispose(proj)
        this.projectiles.splice(i, 1)
        continue
      }

      // Phase 4 P4-2: Check projectile-player collision
      if (Projectile.checkPlayerHit(proj, playerPos, playerBounds)) {
        Projectile.dispose(proj)
        this.projectiles.splice(i, 1)
        // Damage player
        if (this.onPlayerDamaged) {
          const newHp = this.onPlayerDamaged(proj.damage)
          if (newHp <= 0 && this.onPlayerDeath) {
            this.onPlayerDeath()
          }
        }
      }
    }
  }

  /**
   * Phase 4 P4-3: Melee attack — hit the nearest hostile mob in the player's crosshair.
   * Returns the mob id that was hit, or -1 if none.
   */
  meleeHit(
    playerPos: THREE.Vector3,
    dirX: number, dirY: number, dirZ: number,
    meleeRange: number = 3,
    coneAngle: number = Math.PI / 6, // 30° crosshair tolerance
  ): number {
    // Normalize direction
    const len = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ)
    if (len === 0) return -1
    const nx = dirX / len
    const ny = dirY / len
    const nz = dirZ / len

    let bestId = -1
    let bestDist = meleeRange
    const cosAngle = Math.cos(coneAngle)

    for (const mob of this.mobs) {
      // Only hostile mobs
      if (mob.def.type !== 'hostile') continue

      // Distance check (use horizontal distance + 1 for height)
      const ddx = mob.position.x - playerPos.x
      const ddy = mob.position.y + mob.def.height * 0.4 - playerPos.y
      const ddz = mob.position.z - playerPos.z
      const dist = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz)
      if (dist > bestDist) continue

      // Dot product to check if within cone angle
      const dx = ddx / dist
      const dy = ddy / dist
      const dz = ddz / dist
      const dot = dx * nx + dy * ny + dz * nz

      if (dot < cosAngle) continue // outside cone

      bestDist = dist
      bestId = mob.id
    }

    return bestId
  }

  /** Damage a mob */
  damageMob(id: number, amount: number, _world: World): boolean {
    const mob = this.mobs.find(m => m.id === id)
    if (!mob) return false

    const dead = Mob.damage(mob, amount)
    if (dead) {
      this.removeMob(mob)
    } else {
      if (mob.mesh) {
        Mob.updateHPBar(mob.mesh, mob.def, mob.hp, mob.maxHp)
      }
    }
    return dead
  }

  /** Remove a dead mob (dispose mesh, optionally add drops) */
  private removeMob(mob: MobEntity): void {
    this.mobsKilledCount++
    // M10: Play death sound
    this.soundService?.play('mobDeath')

    // Spawn drops before removing
    if (this.dropManager) {
      const drops = Mob.getDrops(mob)
      this.dropManager.spawnMobDrops(mob.id, mob.position.x, mob.position.y, mob.position.z, drops)
    }

    if (mob.mesh && mob.mesh.parent) {
      mob.mesh.parent.remove(mob.mesh)
    }
    if (mob.mesh) {
      mob.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    }
    this.mobs = this.mobs.filter(m => m.id !== mob.id)
  }
}
