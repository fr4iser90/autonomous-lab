/**
 * Boss — large boss mob with multi-hit pattern.
 * M11: Boss room with a powerful enemy.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const BOSS_STATS: MobStats = {
  hp: 60,
  maxHp: 60,
  damage: 8,
  speed: 0.4,
  aggroRange: 12,
  chaseSpeed: 2.0,
}

export class Boss extends MobKit {
  bodyMesh!: THREE.Mesh
  crownMesh!: THREE.Mesh

  constructor(renderer: GameRenderer, stats: MobStats = BOSS_STATS) {
    super(renderer, 'stalker', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Massive body
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.35, 1.8, 12)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x3a1a1a,
      roughness: 0.7,
    })
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    this.bodyMesh.position.y = 0.9
    this.bodyMesh.castShadow = true
    this.bodyMesh.userData.bob = true
    this.mesh.add(this.bodyMesh)

    // Large head
    const headGeo = new THREE.SphereGeometry(0.3, 12, 12)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x4a2a2a,
      roughness: 0.6,
    })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.y = 2.1
    head.userData.bob = true
    this.mesh.add(head)

    // Crown (spiky)
    const crownGeo = new THREE.ConeGeometry(0.35, 0.3, 8)
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xff9944,
      emissive: 0xff6600,
      emissiveIntensity: 0.5,
      roughness: 0.3,
    })
    this.crownMesh = new THREE.Mesh(crownGeo, crownMat)
    this.crownMesh.position.y = 2.5
    this.mesh.add(this.crownMesh)

    // Eyes (burning red)
    const eyeGeo = new THREE.SphereGeometry(0.05, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 2.0,
    })
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.1, 2.15, 0.25)
    this.mesh.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.1, 2.15, 0.25)
    this.mesh.add(rightEye)

    // Cloak
    const cloakGeo = new THREE.ConeGeometry(0.5, 0.8, 12)
    const cloakMat = new THREE.MeshStandardMaterial({
      color: 0x2a1a1a,
      roughness: 0.95,
    })
    const cloak = new THREE.Mesh(cloakGeo, cloakMat)
    cloak.position.y = 0.4
    cloak.userData.bob = true
    this.mesh.add(cloak)
  }

  /** Boss has 2x damage on crits and special visual */
  bossAttack(dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return

    const dist = this.distanceTo(playerX, playerZ)
    if (dist <= this.state.stats.aggroRange && dist > 1.5) {
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

      // Crown glow pulse
      const pulse = 0.5 + Math.sin(this.walkTime * 3) * 0.3
      const mat = this.crownMesh.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = pulse
    }
  }
}
