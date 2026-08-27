/**
 * Goblin — first mob kit. Small, green, aggressive.
 * M5: Goblin mesh from primitives + chase AI.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType } from './MobKit'
import type { MobStats } from './MobKit'

const DEFAULT_STATS: MobStats = {
  hp: 10,
  maxHp: 10,
  damage: 3,
  speed: 0.5,
  aggroRange: 8,
  chaseSpeed: 2.5,
}

export class Goblin extends MobKit {
  bodyMesh!: THREE.Mesh
  headMesh!: THREE.Mesh
  weaponMesh!: THREE.Mesh

  constructor(renderer: GameRenderer, stats: MobStats = DEFAULT_STATS) {
    super(renderer, 'goblin', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Body (short cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.7, 8)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x4a6a3a,
      roughness: 0.85,
    })
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    this.bodyMesh.position.y = 0.35
    this.bodyMesh.castShadow = true
    this.bodyMesh.userData.bob = true
    this.mesh.add(this.bodyMesh)

    // Head (larger sphere)
    const headGeo = new THREE.SphereGeometry(0.18, 8, 8)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x5a7a4a,
      roughness: 0.8,
    })
    this.headMesh = new THREE.Mesh(headGeo, headMat)
    this.headMesh.position.y = 0.85
    this.headMesh.castShadow = true
    this.headMesh.userData.bob = true
    this.mesh.add(this.headMesh)

    // Eyes (red spheres)
    const eyeGeo = new THREE.SphereGeometry(0.03, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xff3333,
      emissive: 0xff2222,
      emissiveIntensity: 1.0,
    })
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.08, 0.88, 0.15)
    this.mesh.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.08, 0.88, 0.15)
    this.mesh.add(rightEye)

    // Weapon (small axe-like stick)
    const weaponGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.5, 6)
    const weaponMat = new THREE.MeshStandardMaterial({
      color: 0x6a4a2a,
      roughness: 0.9,
    })
    this.weaponMesh = new THREE.Mesh(weaponGeo, weaponMat)
    this.weaponMesh.position.set(0.22, 0.4, 0.1)
    this.weaponMesh.rotation.x = 0.3
    this.weaponMesh.castShadow = true
    this.mesh.add(this.weaponMesh)
  }

  /** Chase AI — moves toward player if in range */
  chaseAI(dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return

    const dist = this.distanceTo(playerX, playerZ)
    if (dist <= this.state.stats.aggroRange) {
      // Move toward player
      const dx = playerX - this.position.x
      const dz = playerZ - this.position.z
      const len = Math.sqrt(dx * dx + dz * dz)
      if (len > 0.3) {
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
}
