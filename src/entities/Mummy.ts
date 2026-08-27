/**
 * Mummy — ancient cursed warrior, slows nearby enemies.
 * P2-1: New mob kit variant (mobKits 8/16).
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const MUMMY_STATS: MobStats = {
  hp: 16,
  maxHp: 16,
  damage: 5,
  speed: 0.35,
  aggroRange: 9,
  chaseSpeed: 2.0,
}

export class Mummy extends MobKit {
  bodyMesh!: THREE.Mesh
  headMesh!: THREE.Mesh
  staffMesh!: THREE.Mesh

  constructor(renderer: GameRenderer, stats: MobStats = MUMMY_STATS) {
    super(renderer, 'mummy', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Wrapped body (stacked bandages)
    const bandageMat = new THREE.MeshStandardMaterial({
      color: 0xc8b898,
      roughness: 0.95,
    })

    // Body wraps
    for (let i = 0; i < 6; i++) {
      const wrapGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.15, 8)
      const wrap = new THREE.Mesh(wrapGeo, bandageMat)
      wrap.position.y = 0.3 + i * 0.18
      wrap.userData.bob = true
      this.mesh.add(wrap)
    }

    // Head (wrapped)
    const headGeo = new THREE.SphereGeometry(0.18, 8, 6)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xb8a888,
      roughness: 0.9,
    })
    this.headMesh = new THREE.Mesh(headGeo, headMat)
    this.headMesh.position.y = 1.35
    this.headMesh.userData.bob = true
    this.mesh.add(this.headMesh)

    // Curse glow (green eyes through wraps)
    const eyeGeo = new THREE.SphereGeometry(0.03, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x33ff33,
      emissive: 0x22cc22,
      emissiveIntensity: 1.2,
    })
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.06, 1.38, 0.14)
    this.mesh.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.06, 1.38, 0.14)
    this.mesh.add(rightEye)

    // Staff (wooden with curse gem)
    const staffGeo = new THREE.CylinderGeometry(0.02, 0.025, 1.4, 6)
    const staffMat = new THREE.MeshStandardMaterial({
      color: 0x5a4a3a,
      roughness: 0.9,
    })
    this.staffMesh = new THREE.Mesh(staffGeo, staffMat)
    this.staffMesh.position.set(0.25, 0.7, 0.15)
    this.staffMesh.rotation.z = -0.2
    this.staffMesh.userData.bob = true
    this.mesh.add(this.staffMesh)

    // Gem on staff
    const gemGeo = new THREE.OctahedronGeometry(0.06, 0)
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x33ff33,
      emissive: 0x22cc22,
      emissiveIntensity: 1.5,
      roughness: 0.1,
    })
    const gem = new THREE.Mesh(gemGeo, gemMat)
    gem.position.set(0.27, 1.45, 0.17)
    this.mesh.add(gem)

    // Trailing bandages
    const trailGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.6, 4)
    const trailMat = new THREE.MeshStandardMaterial({
      color: 0xb8a888,
      roughness: 0.95,
      transparent: true,
      opacity: 0.7,
    })
    const trail1 = new THREE.Mesh(trailGeo, trailMat)
    trail1.position.set(-0.15, 0.1, 0.2)
    trail1.rotation.z = 0.3
    this.mesh.add(trail1)
    const trail2 = new THREE.Mesh(trailGeo, trailMat)
    trail2.position.set(0.1, 0.15, 0.25)
    trail2.rotation.z = -0.2
    this.mesh.add(trail2)
  }

  /** Mummy emits a slowing aura as it drifts toward player */
  curseAura(dt: number, playerX: number, playerZ: number): void {
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

      // Drift up and down
      this.mesh.position.y = Math.sin(this.walkTime * 1.5) * 0.1
    }
  }
}
