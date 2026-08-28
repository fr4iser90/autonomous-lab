/**
 * Wolf — fast pack hunter that charges in bursts and howls.
 * P2-2: New mob kit variant (mobKits 10/16).
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const WOLF_STATS: MobStats = {
  hp: 12,
  maxHp: 12,
  damage: 4,
  speed: 0.5,
  aggroRange: 14,
  chaseSpeed: 4.5,
}

export class Wolf extends MobKit {
  bodyMesh!: THREE.Mesh
  headMesh!: THREE.Mesh
  tailMesh!: THREE.Mesh
  chargeTimer = 0
  isCharging = false

  constructor(renderer: GameRenderer, stats: MobStats = WOLF_STATS) {
    super(renderer, 'wolf', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    const furMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 })
    const darkFurMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 })
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff8800, emissiveIntensity: 1.8 })

    // Body (elongated box)
    const bodyGeo = new THREE.BoxGeometry(0.3, 0.25, 0.7)
    const body = new THREE.Mesh(bodyGeo, furMat)
    body.position.y = 0.4
    this.bodyMesh = body
    this.mesh.add(body)

    // Dark spine along back
    const spineGeo = new THREE.BoxGeometry(0.12, 0.08, 0.65)
    const spine = new THREE.Mesh(spineGeo, darkFurMat)
    spine.position.set(0, 0.55, 0)
    this.mesh.add(spine)

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.2, 6)
    const neck = new THREE.Mesh(neckGeo, furMat)
    neck.position.set(0, 0.45, 0.35)
    neck.rotation.x = Math.PI * 0.15
    this.mesh.add(neck)

    // Head (elongated snout shape)
    const headGeo = new THREE.BoxGeometry(0.18, 0.18, 0.35)
    const head = new THREE.Mesh(headGeo, furMat)
    head.position.set(0, 0.52, 0.55)
    this.headMesh = head
    this.mesh.add(head)

    // Snout
    const snoutGeo = new THREE.BoxGeometry(0.12, 0.1, 0.2)
    const snout = new THREE.Mesh(snoutGeo, darkFurMat)
    snout.position.set(0, 0.45, 0.72)
    this.mesh.add(snout)

    // Ears (triangular)
    const earGeo = new THREE.ConeGeometry(0.04, 0.1, 3)
    const earL = new THREE.Mesh(earGeo, furMat)
    earL.position.set(-0.08, 0.65, 0.5)
    earL.rotation.z = 0.2
    this.mesh.add(earL)
    const earR = new THREE.Mesh(earGeo, furMat)
    earR.position.set(0.08, 0.65, 0.5)
    earR.rotation.z = -0.2
    this.mesh.add(earR)

    // Eyes (amber glow)
    const eyeGeo = new THREE.SphereGeometry(0.025, 4, 4)
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat)
    eyeL.position.set(-0.07, 0.55, 0.68)
    this.mesh.add(eyeL)
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat)
    eyeR.position.set(0.07, 0.55, 0.68)
    this.mesh.add(eyeR)

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.025, 0.3, 4)
    interface LegPos { x: number; y: number; z: number }
    const legPositions: LegPos[] = [
      { x: -0.1, y: 0.15, z: 0.2 },
      { x: 0.1, y: 0.15, z: 0.2 },
      { x: -0.1, y: 0.15, z: -0.2 },
      { x: 0.1, y: 0.15, z: -0.2 },
    ]
    legPositions.forEach((lp) => {
      const leg = new THREE.Mesh(legGeo, darkFurMat)
      leg.position.set(lp.x, lp.y, lp.z)
      leg.userData.bob = true
      this.mesh.add(leg)
    })

    // Tail
    const tailGeo = new THREE.CylinderGeometry(0.02, 0.04, 0.3, 4)
    const tail = new THREE.Mesh(tailGeo, darkFurMat)
    tail.position.set(0, 0.45, -0.45)
    tail.rotation.x = -0.5
    this.tailMesh = tail
    this.mesh.add(tail)
  }

  /** Wolf patrols, then charges at player when in range */
  chargeAI(dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return

    const dist = this.distanceTo(playerX, playerZ)
    const speed = this.state.stats

    if (dist <= speed.aggroRange && dist > 1.0) {
      const dx = playerX - this.position.x
      const dz = playerZ - this.position.z
      const len = Math.sqrt(dx * dx + dz * dz)

      if (dist <= 6.0 && !this.isCharging) {
        this.isCharging = true
        this.chargeTimer = 2.0
      }

      if (this.isCharging) {
        const chargeSpeed = speed.chaseSpeed * 1.8
        this.position.x += (dx / len) * chargeSpeed * dt
        this.position.z += (dz / len) * chargeSpeed * dt
        this.chargeTimer -= dt
        if (this.chargeTimer <= 0) {
          this.isCharging = false
        }
      } else {
        this.position.x += (dx / len) * speed.speed * dt * 2
        this.position.z += (dz / len) * speed.speed * dt * 2
      }

      this.position.y = 0
      this.mesh.position.copy(this.position)
      const angle = Math.atan2(dx, dz)
      this.mesh.rotation.y = angle

      // Tail wagging when charging
      if (this.isCharging) {
        this.tailMesh.rotation.y = Math.sin(this.walkTime * 20) * 0.4
        this.tailMesh.rotation.x = -0.5 - Math.abs(Math.sin(this.walkTime * 20)) * 0.3
      } else {
        this.tailMesh.rotation.y *= 0.9
      }

      // Leg animation
      this.mesh.children.forEach((child) => {
        if (child.userData.bob) {
          const phase = this.walkTime * (this.isCharging ? 15 : 8)
          child.rotation.x = Math.sin(phase) * 0.3
        }
      })
    } else if (dist <= speed.aggroRange) {
      const dx = playerX - this.position.x
      const dz = playerZ - this.position.z
      const len = Math.sqrt(dx * dx + dz * dz) || 1
      this.position.x -= (dx / len) * speed.speed * dt * 0.5
      this.position.z -= (dz / len) * speed.speed * dt * 0.5
      this.mesh.position.copy(this.position)
      const angle = Math.atan2(dx, dz)
      this.mesh.rotation.y = angle
    }
  }
}
