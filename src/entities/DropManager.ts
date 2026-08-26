// DropManager: Manages ground item drops — spawning, updating, collecting

import * as THREE from 'three'
import { DropItem } from './DropItem'
import type { DropItemEntity } from './DropItem'
import { DropBeef, DropApple, DropStone, DropDirt, DropCoal, DropIronIngot, DropStick } from '../data/drops'

export interface DropConfig {
  despawnTime: number // seconds before auto-despawn (0 = never)
}

export const DEFAULT_DROP_CONFIG: DropConfig = {
  despawnTime: 240, // 4 minutes
}

export class DropManager {
  private drops: DropItemEntity[] = []
  private scene: THREE.Scene
  private config: DropConfig
  private lastCollectedName = ''
  private lastCollectedCount = 0

  constructor(scene: THREE.Scene, config: DropConfig = DEFAULT_DROP_CONFIG) {
    this.scene = scene
    this.config = config
  }

  /** Spawn a single drop item */
  spawnDrop(itemId: number, x: number, y: number, z: number, count: number): DropItemEntity | null {
    const dropId = this.mapItemToDrop(itemId)
    if (!dropId) return null

    const drop = DropItem.create(dropId, x, y, z)
    drop.count = count

    // Create mesh
    const color = DropItem.getDropColor(dropId)
    drop.mesh = DropItem.createMesh(dropId, color)
    drop.mesh.position.copy(drop.position)
    this.scene.add(drop.mesh)

    // Give it a small random velocity (from mob death or block break)
    drop.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      2 + Math.random() * 2,
      (Math.random() - 0.5) * 2,
    )

    this.drops.push(drop)
    return drop
  }

  /** Spawn multiple drops at a position */
  spawnDrops(drops: Array<{ itemId: number; count: number }>, x: number, y: number, z: number): void {
    for (const drop of drops) {
      if (drop.count > 0) {
        this.spawnDrop(drop.itemId, x, y, z, drop.count)
      }
    }
  }

  /** Spawn a drop from a mob's death */
  spawnMobDrops(_mobId: number, x: number, y: number, z: number, drops: Array<{ itemId: number; count: number }>): void {
    this.spawnDrops(drops, x, y, z)
  }

  /** Clear all drops (dispose meshes) */
  clear(): void {
    for (const drop of this.drops) {
      if (drop.mesh && drop.mesh.parent) {
        drop.mesh.parent.remove(drop.mesh)
      }
      if (drop.mesh) {
        drop.mesh.traverse((child) => {
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
    this.drops = []
  }

  /** Update all drops */
  update(dt: number, playerPos: THREE.Vector3, playerBounds: { minY: number; maxY: number }): void {
    let collected = false
    let collectedDrop: DropItemEntity | null = null

    // Update physics and bobbing
    for (const drop of this.drops) {
      DropItem.applyPhysics(drop, dt)
      DropItem.updateBob(drop, dt)

      // Check for collection
      if (!collected && DropItem.canCollect(drop, playerPos, playerBounds)) {
        collected = true
        collectedDrop = drop
      }
    }

    // Remove collected drops
    if (collectedDrop) {
      collectedDrop.mesh?.parent?.remove(collectedDrop.mesh)
      this.drops = this.drops.filter(d => d.id !== collectedDrop!.id)
      this.lastCollectedName = collectedDrop.name
      this.lastCollectedCount = collectedDrop.count
    }

    // Auto-despawn old drops
    if (this.config.despawnTime > 0) {
      this.drops = this.drops.filter(d => d.age < this.config.despawnTime)
    }
  }

  /** Check if a player has just collected an item (for HUD notification) */
  getLatestCollection(): { name: string; count: number } | null {
    if (this.lastCollectedName) {
      const name = this.lastCollectedName
      const count = this.lastCollectedCount
      this.lastCollectedName = ''
      this.lastCollectedCount = 0
      return { name, count }
    }
    return null
  }

  /** Get all drops */
  getDrops(): DropItemEntity[] {
    return [...this.drops]
  }

  /** Map item ID to drop type ID */
  private mapItemToDrop(itemId: number): number | null {
    // Simple mapping from item IDs to drop type IDs
    switch (itemId) {
      case 14: return DropBeef.id // Beef
      case 13: return DropApple.id // Apple
      case 2: return DropStone.id // Stone
      case 1: return DropDirt.id // Dirt
      case 9: return DropCoal.id // Coal
      case 10: return DropIronIngot.id // Iron Ingot
      case 5: return DropStick.id // Stick
      default: return null
    }
  }
}
