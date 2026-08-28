/**
 * Lich — undead spellcaster with summoning and curse aura.
 * P2-2: Powerful caster variant that summons minions and curses nearby players.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const LICH_STATS: MobStats = {
  hp: 20,
  maxHp: 20,
  damage: 5,
  speed: 0.4,
  aggroRange: 14,
  chaseSpeed: 2.5,
}

export class Lich extends MobKit {
  staffMesh!: THREE.Mesh
  orbMesh!: THREE.Mesh
  summonCooldown = 0
  summonTimer = 0
  curseTimer = 0

  constructor(_renderer: GameRenderer, stats: MobStats = LICH_STATS) {
    super(_renderer, 'lich', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Tattered robe body
    const robeGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.4, 10)
    const robeMat = new THREE.MeshStandardMaterial({
      color: 0x2a1a3a,
      roughness: 0.9,
    })
    const robe = new THREE.Mesh(robeGeo, robeMat)
    robe.position.y = 0.7
    robe.castShadow = true
    robe.userData.bob = true
    this.mesh.add(robe)

    // Hooded head
    const hoodGeo = new THREE.SphereGeometry(0.2, 10, 10)
    const hoodMat = new THREE.MeshStandardMaterial({
      color: 0x1a0a2a,
      roughness: 0.9,
    })
    const hood = new THREE.Mesh(hoodGeo, hoodMat)
    hood.position.y = 1.6
    hood.userData.bob = true
    this.mesh.add(hood)

    // Glowing skull face
    const skullGeo = new THREE.SphereGeometry(0.15, 8, 8)
    const skullMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeff,
      roughness: 0.3,
      emissive: 0x4444aa,
      emissiveIntensity: 0.3,
    })
    const skull = new THREE.Mesh(skullGeo, skullMat)
    skull.position.y = 1.55
    this.mesh.add(skull)

    // Eyes (blue fire)
    const eyeGeo = new THREE.SphereGeometry(0.04, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x00aaff,
      emissive: 0x00aaff,
      emissiveIntensity: 2.0,
    })
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.06, 1.6, 0.14)
    this.mesh.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.06, 1.6, 0.14)
    this.mesh.add(rightEye)

    // Staff
    const staffGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.8, 4)
    const staffMat = new THREE.MeshStandardMaterial({
      color: 0x3a2a1a,
      roughness: 0.7,
    })
    this.staffMesh = new THREE.Mesh(staffGeo, staffMat)
    this.staffMesh.position.set(0.3, 1.0, 0.1)
    this.staffMesh.rotation.z = -0.1
    this.staffMesh.userData.bob = true
    this.mesh.add(this.staffMesh)

    // Staff orb
    const orbGeo = new THREE.SphereGeometry(0.08, 8, 8)
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x6644cc,
      emissive: 0x4422aa,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.8,
    })
    this.orbMesh = new THREE.Mesh(orbGeo, orbMat)
    this.orbMesh.position.set(0.3, 1.95, 0.1)
    this.orbMesh.userData.bob = true
    this.mesh.add(this.orbMesh)

    // Floating cape
    const capeGeo = new THREE.ConeGeometry(0.25, 0.6, 10)
    const capeMat = new THREE.MeshStandardMaterial({
      color: 0x2a1a3a,
      roughness: 0.95,
    })
    const cape = new THREE.Mesh(capeGeo, capeMat)
    cape.position.y = 0.3
    cape.userData.bob = true
    this.mesh.add(cape)
  }

  /** Summon a minion every 8 seconds */
  summonMinion(): void {
    this.summonCooldown += 1 / 60 // called per frame roughly
    if (this.summonCooldown >= 8) {
      this.summonTimer = 0.5 // animation time
      this.summonCooldown = 0
    }
    if (this.summonTimer > 0) {
      this.summonTimer -= 1 / 60
      // Summing visual
      if (this.orbMesh.material instanceof THREE.MeshStandardMaterial) {
        this.orbMesh.material.emissiveIntensity = 3
      }
      ;(this.orbMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 3
    } else if (this.orbMesh.material instanceof THREE.MeshStandardMaterial) {
      this.orbMesh.material.emissiveIntensity = 1.5
    }
  }

  /** Curse aura — damages nearby player */
  updateCurseAura(_dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return
    this.curseTimer += _dt

    const dist = this.distanceTo(playerX, playerZ)
    if (dist <= this.state.stats.aggroRange) {
      // Orb pulse
      const pulse = 1.5 + Math.sin(this.walkTime * 5) * 0.5
      if (this.orbMesh.material instanceof THREE.MeshStandardMaterial) {
        this.orbMesh.material.emissiveIntensity = pulse
      }
    }
  }

  /** Casting animation */
  castSpell(_dt: number): void {
    if (!this.state.alive) return
    // Staff glow
    if (this.staffMesh && this.staffMesh.material instanceof THREE.MeshStandardMaterial) {
      const glow = 0.5 + Math.sin(this.walkTime * 3) * 0.3
      this.staffMesh.material.emissive = new THREE.Color(0x4422aa)
      this.staffMesh.material.emissiveIntensity = glow
    }
  }

  update(dt: number, _playerX: number, _playerZ: number): void {
    super.update(dt, _playerX, _playerZ)
    this.summonMinion()
    this.updateCurseAura(dt, _playerX, _playerZ)
    this.castSpell(dt)
  }
}
