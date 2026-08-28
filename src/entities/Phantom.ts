/**
 * Phantom — intangible ghost that phases in and out of visibility.
 * P2-3: Final mob kit to reach 16/16 CAP.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const PHANTOM_STATS: MobStats = {
  hp: 8,
  maxHp: 8,
  damage: 3,
  speed: 0.7,
  aggroRange: 12,
  chaseSpeed: 3.0,
}

export class Phantom extends MobKit {
  phaseTimer = 0
  phaseCooldown = 0
  visible = true

  constructor(_renderer: GameRenderer, stats: MobStats = PHANTOM_STATS) {
    super(_renderer, 'phantom', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Ethereal body — semi-transparent
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.25, 1.0, 8)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x6666cc,
      transparent: true,
      opacity: 0.4,
      roughness: 0.3,
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = 0.5
    body.castShadow = false
    body.userData.bob = true
    this.mesh.add(body)

    // Ghostly head
    const headGeo = new THREE.SphereGeometry(0.18, 8, 8)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x8888ee,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
    })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.y = 1.2
    head.userData.bob = true
    this.mesh.add(head)

    // Ghostly eyes (white)
    const eyeGeo = new THREE.SphereGeometry(0.04, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2.0,
    })
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.07, 1.25, 0.15)
    this.mesh.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.07, 1.25, 0.15)
    this.mesh.add(rightEye)

    // Trailing wisps
    for (let i = 0; i < 3; i++) {
      const wispGeo = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 4, 4)
      const wispMat = new THREE.MeshStandardMaterial({
        color: 0x8888ee,
        transparent: true,
        opacity: 0.2,
      })
      const wisp = new THREE.Mesh(wispGeo, wispMat)
      wisp.position.set(
        (Math.random() - 0.5) * 0.3,
        -0.2 - Math.random() * 0.3,
        (Math.random() - 0.5) * 0.2
      )
      wisp.userData.bob = true
      this.mesh.add(wisp)
    }
  }

  /** Phase in and out of visibility */
  phaseShift(dt: number): void {
    this.phaseTimer += dt
    if (this.phaseTimer >= 3) {
      this.visible = !this.visible
      this.phaseTimer = 0
      this.phaseCooldown = 0.5 // brief vulnerability after phase
    }
    // Update opacity
    this.mesh.traverse(obj => {
      if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
        if (this.visible) {
          obj.material.opacity = Math.min(0.5, obj.material.opacity + dt * 0.3)
        } else {
          obj.material.opacity = Math.max(0.1, obj.material.opacity - dt * 0.3)
        }
      }
    })
  }

  /** Floating movement */
  floatMovement(dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return

    const dist = this.distanceTo(playerX, playerZ)
    if (dist <= this.state.stats.aggroRange && dist > 1.5) {
      const dx = playerX - this.position.x
      const dz = playerZ - this.position.z
      const len = Math.sqrt(dx * dx + dz * dz)
      this.position.x += (dx / len) * this.state.stats.chaseSpeed * dt
      this.position.z += (dz / len) * this.state.stats.chaseSpeed * dt
      this.mesh.position.copy(this.position)

      // Face player
      const angle = Math.atan2(dx, dz)
      this.mesh.rotation.y = angle
    }

    // Hover animation
    this.mesh.position.y = Math.sin(this.walkTime * 2) * 0.1
  }

  update(dt: number, playerX: number, playerZ: number): void {
    super.update(dt, playerX, playerZ)
    this.phaseShift(dt)
    this.floatMovement(dt, playerX, playerZ)
  }
}
