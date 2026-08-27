/**
 * Skeleton — bone warrior, fights at range with arrow volleys.
 * P2-1: New mob kit variant (mobKits 5/16).
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const SKELETON_STATS: MobStats = {
  hp: 8,
  maxHp: 8,
  damage: 3,
  speed: 0.4,
  aggroRange: 12,
  chaseSpeed: 1.5,
}

export class Skeleton extends MobKit {
  bodyMesh!: THREE.Mesh
  weaponMesh!: THREE.Mesh

  constructor(renderer: GameRenderer, stats: MobStats = SKELETON_STATS) {
    super(renderer, 'skeleton', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Ribs (stacked horizontal cylinders)
    const ribGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.1, 6)
    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xe8dcc8,
      roughness: 0.85,
    })

    for (let i = 0; i < 4; i++) {
      const rib = new THREE.Mesh(ribGeo, boneMat)
      rib.position.y = 0.4 + i * 0.18
      rib.userData.bob = true
      this.mesh.add(rib)
    }

    // Spine
    const spineGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 4)
    const spine = new THREE.Mesh(spineGeo, boneMat)
    spine.position.y = 0.8
    spine.userData.bob = true
    this.mesh.add(spine)

    // Head (skull)
    const skullGeo = new THREE.SphereGeometry(0.15, 8, 6)
    const skull = new THREE.Mesh(skullGeo, boneMat)
    skull.position.y = 1.35
    skull.userData.bob = true
    this.mesh.add(skull)

    // Eye sockets (dark)
    const socketGeo = new THREE.SphereGeometry(0.035, 4, 4)
    const socketMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 1.0,
    })
    const leftSocket = new THREE.Mesh(socketGeo, socketMat)
    leftSocket.position.set(-0.06, 1.38, 0.12)
    this.mesh.add(leftSocket)
    const rightSocket = new THREE.Mesh(socketGeo, socketMat)
    rightSocket.position.set(0.06, 1.38, 0.12)
    this.mesh.add(rightSocket)

    // Bow (curved stick)
    const bowGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 4)
    const bowMat = new THREE.MeshStandardMaterial({
      color: 0x5a4a3a,
      roughness: 0.9,
    })
    this.weaponMesh = new THREE.Mesh(bowGeo, bowMat)
    this.weaponMesh.position.set(0.2, 0.9, 0.2)
    this.weaponMesh.rotation.z = Math.PI * 0.15
    this.weaponMesh.userData.bob = true
    this.mesh.add(this.weaponMesh)

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.5, 4)
    const leftLeg = new THREE.Mesh(legGeo, boneMat)
    leftLeg.position.set(-0.08, 0.25, 0)
    this.mesh.add(leftLeg)
    const rightLeg = new THREE.Mesh(legGeo, boneMat)
    rightLeg.position.set(0.08, 0.25, 0)
    this.mesh.add(rightLeg)
  }

  /** Skeleton looses arrows at player from range */
  rangedAttack(dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return

    const dist = this.distanceTo(playerX, playerZ)
    if (dist <= this.state.stats.aggroRange && dist > 2.0) {
      // Move to keep distance
      const dx = playerX - this.position.x
      const dz = playerZ - this.position.z
      const len = Math.sqrt(dx * dx + dz * dz)
      if (len > 5.0) {
        // Move closer if too far
        this.position.x += (dx / len) * this.state.stats.speed * dt
        this.position.z += (dz / len) * this.state.stats.speed * dt
      } else if (len < 3.0) {
        // Back off if too close
        this.position.x -= (dx / len) * this.state.stats.speed * dt
        this.position.z -= (dz / len) * this.state.stats.speed * dt
      }
      this.mesh.position.copy(this.position)

      // Face player
      const angle = Math.atan2(dx, dz)
      this.mesh.rotation.y = angle
    }
  }
}
