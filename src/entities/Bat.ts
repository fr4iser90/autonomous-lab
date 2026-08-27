/**
 * Bat — small, fast flying swarm mob.
 * P2-1: New mob kit variant (mobKits 6/16).
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const BAT_STATS: MobStats = {
  hp: 4,
  maxHp: 4,
  damage: 2,
  speed: 0.8,
  aggroRange: 10,
  chaseSpeed: 4.0,
}

export class Bat extends MobKit {
  bodyMesh!: THREE.Mesh
  wing1Mesh!: THREE.Mesh
  wing2Mesh!: THREE.Mesh

  constructor(renderer: GameRenderer, stats: MobStats = BAT_STATS) {
    super(renderer, 'bat', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Small body
    const bodyGeo = new THREE.SphereGeometry(0.1, 6, 6)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2a2028,
      roughness: 0.9,
    })
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    this.bodyMesh.position.y = 0.5
    this.bodyMesh.castShadow = true
    this.bodyMesh.userData.bob = true
    this.mesh.add(this.bodyMesh)

    // Wings (flat planes)
    const wingGeo = new THREE.PlaneGeometry(0.5, 0.2)
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x3a3038,
      roughness: 0.95,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    })

    this.wing1Mesh = new THREE.Mesh(wingGeo, wingMat)
    this.wing1Mesh.position.set(-0.25, 0.55, 0)
    this.wing1Mesh.userData.bob = true
    this.wing1Mesh.userData.wing = true
    this.mesh.add(this.wing1Mesh)

    this.wing2Mesh = new THREE.Mesh(wingGeo, wingMat.clone())
    this.wing2Mesh.position.set(0.25, 0.55, 0)
    this.wing2Mesh.userData.bob = true
    this.wing2Mesh.userData.wing = true
    this.mesh.add(this.wing2Mesh)

    // Ears (triangles)
    const earGeo = new THREE.ConeGeometry(0.025, 0.06, 3)
    const earMat = new THREE.MeshStandardMaterial({
      color: 0x4a3a42,
      roughness: 0.8,
    })
    const leftEar = new THREE.Mesh(earGeo, earMat)
    leftEar.position.set(-0.06, 0.6, -0.05)
    leftEar.rotation.x = Math.PI
    this.mesh.add(leftEar)
    const rightEar = new THREE.Mesh(earGeo, earMat)
    rightEar.position.set(0.06, 0.6, -0.05)
    rightEar.rotation.x = Math.PI
    this.mesh.add(rightEar)

    // Eyes (red dots)
    const eyeGeo = new THREE.SphereGeometry(0.015, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xff3333,
      emissive: 0xff0000,
      emissiveIntensity: 0.8,
    })
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.04, 0.52, 0.08)
    this.mesh.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.04, 0.52, 0.08)
    this.mesh.add(rightEye)
  }

  /** Bats swoop erratically toward player */
  swarmAI(dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return

    const dist = this.distanceTo(playerX, playerZ)
    if (dist <= this.state.stats.aggroRange && dist > 0.6) {
      const dx = playerX - this.position.x
      const dz = playerZ - this.position.z
      const len = Math.sqrt(dx * dx + dz * dz)

      // Erratic zigzag movement
      const zigzag = Math.sin(this.walkTime * 8) * 0.5
      const speed = this.state.stats.chaseSpeed * dt
      this.position.x += (dx / len) * speed + zigzag * dt
      this.position.z += (dz / len) * speed
      this.mesh.position.copy(this.position)

      // Flying up and down
      this.mesh.position.y = 0.4 + Math.sin(this.walkTime * 3) * 0.15

      // Face player
      const angle = Math.atan2(dx, dz)
      this.mesh.rotation.y = angle
    }

    // Wing flap animation
    const flap = Math.sin(this.walkTime * 20) * 0.6
    if (this.wing1Mesh) {
      this.wing1Mesh.rotation.y = flap
    }
    if (this.wing2Mesh) {
      this.wing2Mesh.rotation.y = -flap
    }
  }
}
