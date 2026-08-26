// Projectile: Arrow/ranged attack entities fired by skeletons

import * as THREE from 'three'
import { World } from '../world/World'

export interface ProjectileEntity {
  id: number
  damage: number
  owner: 'skeleton' // distinguish friendly/hostile
  position: THREE.Vector3
  velocity: THREE.Vector3
  mesh: THREE.Group | null
  age: number
  lifetime: number // seconds before despawn
  world?: World
  playerPos?: THREE.Vector3
  playerBounds?: { minY: number; maxY: number }
}

export class Projectile {
  private static nextId = 0

  /** Create a new projectile */
  static create(
    owner: 'skeleton',
    fromX: number, fromY: number, fromZ: number,
    targetX: number, targetY: number, targetZ: number,
    damage: number,
    lifetime: number = 5, // 5 seconds max range
  ): ProjectileEntity {
    const dx = targetX - fromX
    const dy = targetY - fromY
    const dz = targetZ - fromZ
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    // Normalize and scale to arrow speed (12 blocks/sec)
    const speed = 12
    const velocity = new THREE.Vector3(
      (dx / dist) * speed,
      (dy / dist) * speed,
      (dz / dist) * speed,
    )

    return {
      id: Projectile.nextId++,
      damage,
      owner,
      position: new THREE.Vector3(fromX, fromY, fromZ),
      velocity,
      mesh: null,
      age: 0,
      lifetime,
      world: undefined,
      playerPos: undefined,
      playerBounds: undefined,
    }
  }

  /** Create a Three.js arrow mesh */
  static createMesh(): THREE.Group {
    const group = new THREE.Group()

    // Arrow shaft (thin cylinder)
    const shaftGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 6)
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0x8B6914,
      roughness: 0.8,
    })
    const shaft = new THREE.Mesh(shaftGeo, shaftMat)
    shaft.rotation.x = Math.PI / 2
    group.add(shaft)

    // Arrow head (cone)
    const headGeo = new THREE.ConeGeometry(0.04, 0.1, 6)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.5,
    })
    const head = new THREE.Mesh(headGeo, headMat)
    head.rotation.x = Math.PI / 2
    head.position.z = 0.3
    group.add(head)

    // Arrow fletching (two small planes)
    const fletchGeo = new THREE.PlaneGeometry(0.12, 0.06)
    const fletchMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    })
    const fletch1 = new THREE.Mesh(fletchGeo, fletchMat)
    fletch1.position.z = -0.25
    fletch1.rotation.y = 0
    group.add(fletch1)
    const fletch2 = new THREE.Mesh(fletchGeo, fletchMat)
    fletch2.position.z = -0.25
    fletch2.rotation.y = Math.PI / 2
    group.add(fletch2)

    return group
  }

  /** Update projectile physics (gravity + move) */
  static update(projectile: ProjectileEntity, dt: number, world: World): boolean {
    // Gravity (small arc)
    projectile.velocity.y -= 3 * dt

    // Move
    projectile.position.x += projectile.velocity.x * dt
    projectile.position.y += projectile.velocity.y * dt
    projectile.position.z += projectile.velocity.z * dt

    // Age
    projectile.age += dt
    projectile.world = world

    // Check ground collision
    const bx = Math.floor(projectile.position.x)
    const by = Math.floor(projectile.position.y)
    const bz = Math.floor(projectile.position.z)
    const blockId = world.getBlock(bx, by, bz)
    if (blockId > 0) {
      // Hit ground/block — despawn
      return false
    }

    // Despawn if expired
    if (projectile.age > projectile.lifetime) {
      return false
    }

    // Despawn if fell into void
    if (projectile.position.y < -20) {
      return false
    }

    // Update mesh
    if (projectile.mesh) {
      projectile.mesh.position.copy(projectile.position)
      // Orient arrow along velocity vector
      const vel = projectile.velocity
      const len = vel.length()
      if (len > 0.001) {
        const dir = vel.clone().normalize()
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir)
        projectile.mesh.quaternion.copy(quaternion)
      }
    }

    return true
  }

  /** Check if projectile hits the player's bounding box */
  static checkPlayerHit(
    projectile: ProjectileEntity,
    playerPos: THREE.Vector3,
    playerBounds: { minY: number; maxY: number },
  ): boolean {
    const px = projectile.position.x
    const py = projectile.position.y
    const pz = projectile.position.z

    // Simple AABB vs point collision
    const playerWidth = 0.5
    const hitX = Math.abs(px - playerPos.x) < playerWidth
    const hitY = py >= playerBounds.minY && py <= playerBounds.maxY
    const hitZ = Math.abs(pz - playerPos.z) < playerWidth

    return hitX && hitY && hitZ
  }

  /** Clean up projectile mesh */
  static dispose(projectile: ProjectileEntity): void {
    if (projectile.mesh && projectile.mesh.parent) {
      projectile.mesh.parent.remove(projectile.mesh)
      projectile.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
      projectile.mesh = null
    }
  }
}
