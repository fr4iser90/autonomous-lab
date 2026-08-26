// DropItem: Ground item entities that players can walk over to collect

import * as THREE from 'three'
import { getDropType } from '../data/drops'

export interface DropItemEntity {
  id: number
  dropId: number
  itemId: number
  count: number
  name: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  rotation: number
  mesh: THREE.Group | null
  age: number
  bOb: number
}

export class DropItem {
  private static nextId = 1

  /** Create a new drop item entity */
  static create(dropId: number, x: number, y: number, z: number): DropItemEntity {
    const dropType = getDropType(dropId)
    if (!dropType) throw new Error(`Unknown drop type: ${dropId}`)

    const count = dropType.defaultCount
    return {
      id: DropItem.nextId++,
      dropId,
      itemId: dropType.itemId,
      count,
      name: dropType.name,
      position: new THREE.Vector3(x, y, z),
      velocity: new THREE.Vector3(0, 0, 0),
      rotation: Math.random() * Math.PI * 2,
      mesh: null,
      age: 0,
      bOb: 0,
    }
  }

  /** Create a Three.js mesh for a drop item */
  static createMesh(_dropId: number, color: [number, number, number]): THREE.Group {
    const group = new THREE.Group()

    // Small cube body (0.3 x 0.3 x 0.3)
    const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        color[0] / 255,
        color[1] / 255,
        color[2] / 255,
      ),
    })
    const mesh = new THREE.Mesh(geometry, material)
    group.add(mesh)

    // Outline ring
    const ringGeo = new THREE.RingGeometry(0.2, 0.3, 16)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = -0.16
    group.add(ring)

    return group
  }

  /** Check if two drop items can merge (same drop type) */
  static canMerge(a: DropItemEntity, b: DropItemEntity): boolean {
    return a.dropId === b.dropId
  }

  /** Merge counts (not actually merging, just for reference) */
  static mergeCount(a: DropItemEntity, b: DropItemEntity): number {
    return a.count + b.count
  }

  /** Apply gravity and settling physics */
  static applyPhysics(entity: DropItemEntity, dt: number): void {
    // Gravity
    entity.velocity.y -= 15 * dt

    // Move
    entity.position.x += entity.velocity.x * dt
    entity.position.y += entity.velocity.y * dt
    entity.position.z += entity.velocity.z * dt

    // Ground check (y = 0 is approximate ground level for drops)
    if (entity.position.y < 0.2) {
      entity.position.y = 0.2
      entity.velocity.y = 0

      // Friction to settle
      entity.velocity.x *= 0.9
      entity.velocity.z *= 0.9
    }

    // Age-based despawn (4 minutes = 240 seconds, ~14400 ticks at 60fps)
    entity.age += dt
  }

  /** Update bobbing animation */
  static updateBob(entity: DropItemEntity, dt: number): void {
    entity.bOb += dt * 3 // bob frequency
    entity.rotation += dt * 0.5 // slow rotation

    // Apply bob offset
    const bobHeight = Math.sin(entity.bOb) * 0.1
    entity.position.y = 0.2 + bobHeight

    // Update mesh
    if (entity.mesh) {
      entity.mesh.position.copy(entity.position)
      entity.mesh.rotation.y = entity.rotation
    }
  }

  /** Check if player can collect this drop (proximity) */
  static canCollect(drop: DropItemEntity, playerPos: THREE.Vector3, playerBounds: { minY: number; maxY: number }): boolean {
    const dist = drop.position.distanceTo(playerPos)
    if (dist > 1.5) return false

    // Check height overlap
    if (playerBounds.minY > drop.position.y + 0.5 || playerBounds.maxY < drop.position.y - 0.3) return false

    return true
  }

  /** Get the color for a drop type */
  static getDropColor(dropId: number): [number, number, number] {
    const dropType = getDropType(dropId)
    return dropType ? dropType.color : [128, 128, 128]
  }
}
