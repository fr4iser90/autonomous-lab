/**
 * Troll — regenerating brute with ground-slam attack.
 * P2-2: Tanky variant with slow regeneration and devastating slam.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const TROLL_STATS: MobStats = {
  hp: 25,
  maxHp: 25,
  damage: 6,
  speed: 0.35,
  aggroRange: 10,
  chaseSpeed: 2.2,
}

export class Troll extends MobKit {
  bodyMesh!: THREE.Mesh
  regenCooldown = 0
  slamTimer = 0
  slamAnim = 0

  constructor(_renderer: GameRenderer, stats: MobStats = TROLL_STATS) {
    super(_renderer, 'troll', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Large body
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.35, 1.5, 10)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2a4a2a,
      roughness: 0.8,
    })
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    this.bodyMesh.position.y = 0.75
    this.bodyMesh.castShadow = true
    this.bodyMesh.userData.bob = true
    this.mesh.add(this.bodyMesh)

    // Head
    const headGeo = new THREE.SphereGeometry(0.25, 10, 10)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x3a5a3a,
      roughness: 0.7,
    })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.y = 1.75
    head.userData.bob = true
    this.mesh.add(head)

    // Horns
    const hornGeo = new THREE.ConeGeometry(0.06, 0.3, 4)
    const hornMat = new THREE.MeshStandardMaterial({
      color: 0x1a2a1a,
      roughness: 0.6,
    })
    const leftHorn = new THREE.Mesh(hornGeo, hornMat)
    leftHorn.position.set(-0.15, 2.0, 0)
    leftHorn.rotation.z = -0.3
    this.mesh.add(leftHorn)
    const rightHorn = new THREE.Mesh(hornGeo, hornMat)
    rightHorn.position.set(0.15, 2.0, 0)
    rightHorn.rotation.z = 0.3
    this.mesh.add(rightHorn)

    // Eyes (orange)
    const eyeGeo = new THREE.SphereGeometry(0.04, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff6600,
      emissiveIntensity: 1.5,
    })
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.08, 1.8, 0.2)
    this.mesh.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.08, 1.8, 0.2)
    this.mesh.add(rightEye)

    // Massive arms
    const armGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.8, 6)
    const armMat = new THREE.MeshStandardMaterial({
      color: 0x2a4a2a,
      roughness: 0.8,
    })
    const leftArm = new THREE.Mesh(armGeo, armMat)
    leftArm.position.set(-0.35, 0.8, 0.1)
    leftArm.rotation.x = -0.3
    leftArm.userData.bob = true
    this.mesh.add(leftArm)
    const rightArm = new THREE.Mesh(armGeo, armMat)
    rightArm.position.set(0.35, 0.8, 0.1)
    rightArm.rotation.x = -0.3
    rightArm.userData.bob = true
    this.mesh.add(rightArm)

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6)
    const leftLeg = new THREE.Mesh(legGeo, armMat)
    leftLeg.position.set(-0.12, 0.25, 0)
    this.mesh.add(leftLeg)
    const rightLeg = new THREE.Mesh(legGeo, armMat)
    rightLeg.position.set(0.12, 0.25, 0)
    this.mesh.add(rightLeg)
  }

  /** Ground slam — raises arm then slams down */
  groundSlam(dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return

    const dist = this.distanceTo(playerX, playerZ)
    this.slamTimer += dt

    if (this.slamTimer >= 4 && dist <= this.state.stats.aggroRange && dist > 1.5) {
      // Raise arm
      if (this.slamAnim < 1) {
        this.slamAnim += dt * 2
        if (this.slamAnim > 1) this.slamAnim = 1
        this.bodyMesh.rotation.x = -this.slamAnim * 0.5
      } else {
        // Slam down
        this.slamAnim -= dt * 4
        if (this.slamAnim <= 0) {
          this.slamAnim = 0
          this.slamTimer = 0
          this.bodyMesh.rotation.x = 0
          // Slam visual shake
          this.renderer?.scene.traverse(obj => {
            if (obj instanceof THREE.Mesh && obj.userData.bob) {
              obj.position.y += 0.02
            }
          })
        }
      }
    }
  }

  /** Regenerate 1 HP every 4 seconds */
  regenerate(dt: number): void {
    if (!this.state.alive) return
    this.regenCooldown += dt
    if (this.regenCooldown >= 4 && this.state.stats.hp < this.state.stats.maxHp) {
      this.state.stats.hp = Math.min(this.state.stats.maxHp, this.state.stats.hp + 1)
      this.regenCooldown = 0
    }
  }

  update(dt: number, _playerX: number, _playerZ: number): void {
    super.update(dt, _playerX, _playerZ)
    this.groundSlam(dt, _playerX, _playerZ)
    this.regenerate(dt)
  }
}
