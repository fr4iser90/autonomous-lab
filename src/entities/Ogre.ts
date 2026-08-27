/**
 * Ogre — massive brute, very slow but extremely tanky and hits hard.
 * P2-1: New mob kit variant (mobKits 7/16).
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const OGRE_STATS: MobStats = {
  hp: 30,
  maxHp: 30,
  damage: 7,
  speed: 0.25,
  aggroRange: 8,
  chaseSpeed: 1.8,
}

export class Ogre extends MobKit {
  bodyMesh!: THREE.Mesh
  headMesh!: THREE.Mesh
  clubMesh!: THREE.Mesh

  constructor(renderer: GameRenderer, stats: MobStats = OGRE_STATS) {
    super(renderer, 'ogre', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Massive body
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.4, 1.6, 10)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x5a4a30,
      roughness: 0.9,
    })
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    this.bodyMesh.position.y = 0.8
    this.bodyMesh.castShadow = true
    this.bodyMesh.userData.bob = true
    this.mesh.add(this.bodyMesh)

    // Head (large blocky)
    const headGeo = new THREE.BoxGeometry(0.45, 0.4, 0.4)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x6a5a40,
      roughness: 0.85,
    })
    this.headMesh = new THREE.Mesh(headGeo, headMat)
    this.headMesh.position.y = 1.85
    this.headMesh.userData.bob = true
    this.mesh.add(this.headMesh)

    // Nose (large protrusion)
    const noseGeo = new THREE.BoxGeometry(0.15, 0.12, 0.15)
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x7a6a50,
      roughness: 0.8,
    })
    const nose = new THREE.Mesh(noseGeo, noseMat)
    nose.position.set(0, 1.8, 0.25)
    this.mesh.add(nose)

    // Eyes (small, angry)
    const eyeGeo = new THREE.SphereGeometry(0.04, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffaa33,
      emissive: 0xff8800,
      emissiveIntensity: 0.6,
    })
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.12, 1.9, 0.18)
    this.mesh.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.12, 1.9, 0.18)
    this.mesh.add(rightEye)

    // Club (large stick)
    const clubGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 6)
    const clubMat = new THREE.MeshStandardMaterial({
      color: 0x4a3a2a,
      roughness: 0.95,
    })
    this.clubMesh = new THREE.Mesh(clubGeo, clubMat)
    this.clubMesh.position.set(0.45, 1.0, 0.15)
    this.clubMesh.rotation.z = -0.4
    this.clubMesh.castShadow = true
    this.clubMesh.userData.bob = true
    this.mesh.add(this.clubMesh)

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.6, 6)
    const armMat = new THREE.MeshStandardMaterial({
      color: 0x5a4a30,
      roughness: 0.9,
    })
    const leftArm = new THREE.Mesh(armGeo, armMat)
    leftArm.position.set(-0.4, 0.9, 0)
    leftArm.rotation.z = 0.3
    this.mesh.add(leftArm)
    const rightArm = new THREE.Mesh(armGeo, armMat)
    rightArm.position.set(0.35, 0.9, 0.1)
    rightArm.rotation.z = -0.5
    this.mesh.add(rightArm)

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.6, 6)
    const leftLeg = new THREE.Mesh(legGeo, armMat)
    leftLeg.position.set(-0.15, 0.3, 0)
    this.mesh.add(leftLeg)
    const rightLeg = new THREE.Mesh(legGeo, armMat)
    rightLeg.position.set(0.15, 0.3, 0)
    this.mesh.add(rightLeg)
  }

  /** Ogre charges forward slowly but hits with devastating force */
  chargeAI(dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return

    const dist = this.distanceTo(playerX, playerZ)
    if (dist <= this.state.stats.aggroRange && dist > 1.0) {
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

      // Slow ground shake
      if (Math.floor(this.walkTime * 2) % 2 === 0) {
        this.mesh.position.y = Math.sin(this.walkTime * 6) * 0.02
      }
    }
  }
}
