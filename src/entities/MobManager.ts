// MobManager: Spawns, updates, and renders all mobs in the world

import * as THREE from 'three'
import { World } from '../world/World'
import { Mob } from './Mob'
import type { MobEntity } from './Mob'
import { MobCow, MobPig, MobChicken, MobZombie, MobSkeleton } from '../data/mobs'

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
  private scene: THREE.Scene
  private config: MobConfig
  private playerHp: number = 20

  constructor(scene: THREE.Scene, config: MobConfig = DEFAULT_MOB_CONFIG) {
    this.scene = scene
    this.config = config
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
        // Random offset from origin
        const offsetX = Math.floor((nextRand() - 0.5) * 64)
        const offsetZ = Math.floor((nextRand() - 0.5) * 64)
        const x = offsetX * 16 + 8
        const z = offsetZ * 16 + 8

        const mob = Mob.create(type.defId, x, 64, z, world)
        if (!mob) continue

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
  }

  /** Update all mobs */
  update(dt: number, playerPos: THREE.Vector3, world: World): void {
    this.playerHp = 20 // TODO: pass player HP

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

    // Check player-mob contact (hostile mobs)
    for (const mob of this.mobs) {
      const contact = Mob.checkPlayerContact(mob, playerPos, this.playerHp)
      if (contact) {
        this.playerHp = contact.newHp
        // Flash the player HUD or show damage effect
        // For now, just log (in a real game, this would trigger UI feedback)
      }
    }
  }

  /** Get all mobs */
  getMobs(): MobEntity[] {
    return [...this.mobs]
  }

  /** Get mob by ID */
  getMob(id: number): MobEntity | undefined {
    return this.mobs.find(m => m.id === id)
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
