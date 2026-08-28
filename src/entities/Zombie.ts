/**
 * Zombie — slow undead with regeneration and shambling gait.
 * P2-2: Undead variant that regenerates HP slowly.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const ZOMBIE_STATS: MobStats = {
  hp: 15,
  maxHp: 15,
  damage: 3,
  speed: 0.3,
  aggroRange: 8,
  chaseSpeed: 1.8,
}

export class Zombie extends MobKit {
  bodyMesh!: THREE.Mesh
  regenCooldown = 0

  constructor(_renderer: GameRenderer, stats: MobStats = ZOMBIE_STATS) {
    super(_renderer, 'zombie', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Rotated grey body
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.2, 8)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x3a4a3a,
      roughness: 0.9,
    })
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    this.bodyMesh.position.y = 0.6
    this.bodyMesh.castShadow = true
    this.bodyMesh.userData.bob = true
    this.mesh.add(this.bodyMesh)

    // Head
    const headGeo = new THREE.SphereGeometry(0.18, 8, 8)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x4a5a4a,
      roughness: 0.8,
    })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.y = 1.4
    head.userData.bob = true
    this.mesh.add(head)

    // Eyes (green glow)
    const eyeGeo = new THREE.SphereGeometry(0.03, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 1.5,
    })
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.07, 1.45, 0.15)
    this.mesh.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.07, 1.45, 0.15)
    this.mesh.add(rightEye)

    // Arms (reaching forward)
    const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 4)
    const armMat = new THREE.MeshStandardMaterial({
      color: 0x3a4a3a,
      roughness: 0.9,
    })
    const leftArm = new THREE.Mesh(armGeo, armMat)
    leftArm.position.set(-0.25, 0.8, 0.2)
    leftArm.rotation.x = -Math.PI / 3
    leftArm.userData.bob = true
    this.mesh.add(leftArm)
    const rightArm = new THREE.Mesh(armGeo, armMat)
    rightArm.position.set(0.25, 0.8, 0.2)
    rightArm.rotation.x = -Math.PI / 3
    rightArm.userData.bob = true
    this.mesh.add(rightArm)

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 4)
    const leftLeg = new THREE.Mesh(legGeo, armMat)
    leftLeg.position.set(-0.08, 0.2, 0)
    this.mesh.add(leftLeg)
    const rightLeg = new THREE.Mesh(legGeo, armMat)
    rightLeg.position.set(0.08, 0.2, 0)
    this.mesh.add(rightLeg)

    // Ragged cloak
    const cloakGeo = new THREE.ConeGeometry(0.25, 0.6, 8)
    const cloakMat = new THREE.MeshStandardMaterial({
      color: 0x2a3a2a,
      roughness: 0.95,
    })
    const cloak = new THREE.Mesh(cloakGeo, cloakMat)
    cloak.position.y = 0.3
    cloak.userData.bob = true
    this.mesh.add(cloak)
  }

  /** Regenerate 1 HP every 5 seconds when not being attacked */
  regenerate(dt: number): void {
    if (!this.state.alive) return
    this.regenCooldown += dt
    if (this.regenCooldown >= 5 && this.state.stats.hp < this.state.stats.maxHp) {
      this.state.stats.hp = Math.min(this.state.stats.maxHp, this.state.stats.hp + 1)
      this.regenCooldown = 0
    }
  }

  update(dt: number, _playerX: number, _playerZ: number): void {
    super.update(dt, _playerX, _playerZ)
    this.regenerate(dt)
    // Shambling animation
    const shamble = Math.sin(this.walkTime * 4) * 0.05
    this.mesh.rotation.z = shamble
  }
}
