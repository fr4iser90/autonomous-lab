/**
 * Stalker — fast, aggressive melee mob.
 * M9: Third mob kit type.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const DEFAULT_STATS: MobStats = {
  hp: 14,
  maxHp: 14,
  damage: 4,
  speed: 0.6,
  aggroRange: 6,
  chaseSpeed: 3.5,
}

export class Stalker extends MobKit {
  bodyMesh!: THREE.Mesh
  arm1Mesh!: THREE.Mesh
  arm2Mesh!: THREE.Mesh

  constructor(renderer: GameRenderer, stats: MobStats = DEFAULT_STATS) {
    super(renderer, 'stalker', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Body (tall thin cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.12, 0.15, 1.1, 8)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2a1a1a,
      roughness: 0.9,
    })
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    this.bodyMesh.position.y = 0.55
    this.bodyMesh.castShadow = true
    this.bodyMesh.userData.bob = true
    this.mesh.add(this.bodyMesh)

    // Head (elongated)
    const headGeo = new THREE.CylinderGeometry(0.1, 0.14, 0.25, 8)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x3a2a2a,
      roughness: 0.85,
    })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.y = 1.2
    head.userData.bob = true
    this.mesh.add(head)

    // Arms (reaching forward)
    const armGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.6, 6)
    const armMat = new THREE.MeshStandardMaterial({
      color: 0x2a1a1a,
      roughness: 0.9,
    })
    this.arm1Mesh = new THREE.Mesh(armGeo, armMat)
    this.arm1Mesh.position.set(-0.2, 0.6, 0.3)
    this.arm1Mesh.rotation.x = -0.5
    this.arm1Mesh.userData.bob = true
    this.mesh.add(this.arm1Mesh)

    this.arm2Mesh = new THREE.Mesh(armGeo, armMat)
    this.arm2Mesh.position.set(0.2, 0.6, 0.3)
    this.arm2Mesh.rotation.x = -0.5
    this.arm2Mesh.userData.bob = true
    this.mesh.add(this.arm2Mesh)

    // Eyes (white dots)
    const eyeGeo = new THREE.SphereGeometry(0.02, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
    })
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.05, 1.22, 0.12)
    this.mesh.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.05, 1.22, 0.12)
    this.mesh.add(rightEye)
  }

  /** Stalker dashes toward player */
  dashAI(dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return

    const dist = this.distanceTo(playerX, playerZ)
    if (dist <= this.state.stats.aggroRange && dist > 0.8) {
      const dx = playerX - this.position.x
      const dz = playerZ - this.position.z
      const len = Math.sqrt(dx * dx + dz * dz)
      const speed = this.state.stats.chaseSpeed * dt
      this.position.x += (dx / len) * speed
      this.position.z += (dz / len) * speed
      this.mesh.position.copy(this.position)

      // Face player
      const angle = Math.atan2(dx, dz)
      this.mesh.rotation.y = angle
    }
  }
}
