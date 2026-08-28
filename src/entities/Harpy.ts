/**
 * Harpy — flying beast with swoop attack and screech.
 * P2-2: Aerial variant that dives at players.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const HARPY_STATS: MobStats = {
  hp: 10,
  maxHp: 10,
  damage: 4,
  speed: 0.6,
  aggroRange: 15,
  chaseSpeed: 4.0,
}

export class Harpy extends MobKit {
  wingMesh!: THREE.Mesh
  diveCooldown = 0
  diveTimer = 0

  constructor(_renderer: GameRenderer, stats: MobStats = HARPY_STATS) {
    super(_renderer, 'harpy', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 8)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x5a4a3a,
      roughness: 0.7,
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = 1.0
    body.castShadow = true
    body.userData.bob = true
    this.mesh.add(body)

    // Head
    const headGeo = new THREE.SphereGeometry(0.15, 8, 8)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x6a5a4a,
      roughness: 0.6,
    })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.y = 1.6
    head.userData.bob = true
    this.mesh.add(head)

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.05, 0.15, 4)
    const beakMat = new THREE.MeshStandardMaterial({
      color: 0xff9944,
      roughness: 0.5,
    })
    const beak = new THREE.Mesh(beakGeo, beakMat)
    beak.position.set(0, 1.55, 0.18)
    beak.rotation.x = Math.PI / 2
    this.mesh.add(beak)

    // Eyes (yellow)
    const eyeGeo = new THREE.SphereGeometry(0.03, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 1.0,
    })
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.06, 1.65, 0.12)
    this.mesh.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.06, 1.65, 0.12)
    this.mesh.add(rightEye)

    // Wings
    const wingShape = new THREE.Shape()
    wingShape.moveTo(0, 0)
    wingShape.lineTo(-0.6, 0.3)
    wingShape.lineTo(-0.5, -0.1)
    wingShape.lineTo(0, 0)
    const wingGeo = new THREE.ShapeGeometry(wingShape)
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x4a3a2a,
      roughness: 0.8,
      side: THREE.DoubleSide,
    })
    this.wingMesh = new THREE.Mesh(wingGeo, wingMat)
    this.wingMesh.position.set(0, 1.1, 0)
    this.wingMesh.userData.bob = true
    this.mesh.add(this.wingMesh)

    // Mirror wing
    const wingMesh2 = new THREE.Mesh(wingGeo, wingMat)
    wingMesh2.position.set(0, 1.1, 0)
    wingMesh2.scale.x = -1
    wingMesh2.userData.bob = true
    this.mesh.add(wingMesh2)

    // Floating offset (harpy flies)
    this.mesh.position.y = 1.5
  }

  /** Flying swoop — rises then dives at player */
  swoopAttack(dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return

    const dist = this.distanceTo(playerX, playerZ)
    this.diveCooldown += dt

    // Wing flap animation
    const flap = Math.sin(this.walkTime * 8) * 0.3
    this.wingMesh.rotation.z = flap

    if (this.diveCooldown >= 3 && dist <= this.state.stats.aggroRange && dist > 1.5) {
      this.diveTimer += dt
      if (this.diveTimer < 1.5) {
        // Rising
        this.mesh.position.y += 2 * dt
      } else {
        // Diving
        this.mesh.position.y -= 4 * dt
        const dx = playerX - this.position.x
        const dz = playerZ - this.position.z
        const len = Math.sqrt(dx * dx + dz * dz)
        if (len > 0) {
          this.position.x += (dx / len) * this.state.stats.chaseSpeed * dt * 1.5
          this.position.z += (dz / len) * this.state.stats.chaseSpeed * dt * 1.5
        }
      }
      this.mesh.position.x = this.position.x
      this.mesh.position.z = this.position.z

      // Face player
      const angle = Math.atan2(playerX - this.position.x, playerZ - this.position.z)
      this.mesh.rotation.y = angle

      if (this.diveTimer >= 2) {
        this.diveCooldown = 0
        this.diveTimer = 0
      }
    } else if (this.diveCooldown >= 3) {
      this.diveTimer = 0
      // Return to flight height
      if (this.mesh.position.y > 1.5) {
        this.mesh.position.y -= 1 * dt
      }
    }
  }

  update(dt: number, _playerX: number, _playerZ: number): void {
    super.update(dt, _playerX, _playerZ)
    // Gentle hover
    this.mesh.position.y += Math.sin(this.walkTime * 2) * 0.005
  }
}
