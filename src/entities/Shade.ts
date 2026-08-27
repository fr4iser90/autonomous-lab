/**
 * Shade — spectral mob, slow but tricky to hit.
 * M9: Second mob kit type.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const DEFAULT_STATS: MobStats = {
  hp: 8,
  maxHp: 8,
  damage: 5,
  speed: 0.3,
  aggroRange: 10,
  chaseSpeed: 1.8,
}

export class Shade extends MobKit {
  bodyMesh!: THREE.Mesh

  constructor(renderer: GameRenderer, stats: MobStats = DEFAULT_STATS) {
    super(renderer, 'shade', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Semi-transparent flowing body
    const bodyGeo = new THREE.CylinderGeometry(0.12, 0.25, 1.0, 8)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2a2040,
      roughness: 0.9,
      transparent: true,
      opacity: 0.7,
    })
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    this.bodyMesh.position.y = 0.5
    this.bodyMesh.castShadow = true
    this.bodyMesh.userData.bob = true
    this.mesh.add(this.bodyMesh)

    // Floating head
    const headGeo = new THREE.SphereGeometry(0.15, 8, 8)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x3a3050,
      transparent: true,
      opacity: 0.8,
    })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.y = 1.1
    head.userData.bob = true
    this.mesh.add(head)

    // Glowing eyes
    const eyeGeo = new THREE.SphereGeometry(0.025, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x6644aa,
      emissive: 0x6644aa,
      emissiveIntensity: 1.5,
    })
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.06, 1.13, 0.12)
    this.mesh.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.06, 1.13, 0.12)
    this.mesh.add(rightEye)
  }

  /** Shade floats slowly toward player */
  floatAI(dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return

    const dist = this.distanceTo(playerX, playerZ)
    if (dist <= this.state.stats.aggroRange && dist > 1.2) {
      const dx = playerX - this.position.x
      const dz = playerZ - this.position.z
      const len = Math.sqrt(dx * dx + dz * dz)
      const speed = this.state.stats.speed * dt
      this.position.x += (dx / len) * speed
      this.position.z += (dz / len) * speed
      this.mesh.position.copy(this.position)

      // Face player
      const angle = Math.atan2(dx, dz)
      this.mesh.rotation.y = angle

      // Float up and down
      this.mesh.position.y = 0.3 + Math.sin(this.walkTime * 1.5) * 0.2
    }
  }
}
