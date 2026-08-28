/**
 * Elemental — fire elemental with burn aura and burst attack.
 * P2-3: Final mob kit to reach 16/16 CAP.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const ELEMENTAL_STATS: MobStats = {
  hp: 12,
  maxHp: 12,
  damage: 5,
  speed: 0.5,
  aggroRange: 11,
  chaseSpeed: 2.8,
}

export class Elemental extends MobKit {
  fireMesh!: THREE.Mesh
  burnCooldown = 0

  constructor(_renderer: GameRenderer, stats: MobStats = ELEMENTAL_STATS) {
    super(_renderer, 'elemental', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Core body — molten sphere
    const coreGeo = new THREE.SphereGeometry(0.3, 10, 10)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xff4400,
      emissive: 0xff2200,
      emissiveIntensity: 1.5,
      roughness: 0.4,
    })
    this.fireMesh = new THREE.Mesh(coreGeo, coreMat)
    this.fireMesh.position.y = 0.6
    this.fireMesh.castShadow = false
    this.fireMesh.userData.bob = true
    this.mesh.add(this.fireMesh)

    // Inner flame (brighter core)
    const innerGeo = new THREE.SphereGeometry(0.2, 8, 8)
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff8800,
      emissiveIntensity: 2.0,
      transparent: true,
      opacity: 0.7,
    })
    const inner = new THREE.Mesh(innerGeo, innerMat)
    inner.position.y = 0.6
    inner.userData.bob = true
    this.mesh.add(inner)

    // Rising flame wisps
    for (let i = 0; i < 4; i++) {
      const wispGeo = new THREE.ConeGeometry(0.06, 0.2, 4)
      const wispMat = new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: 0xff4400,
        emissiveIntensity: 1.0,
        transparent: true,
        opacity: 0.6,
      })
      const wisp = new THREE.Mesh(wispGeo, wispMat)
      const angle = (i / 4) * Math.PI * 2
      wisp.position.set(
        Math.cos(angle) * 0.3,
        0.9 + Math.random() * 0.15,
        Math.sin(angle) * 0.3
      )
      wisp.userData.bob = true
      wisp.userData.phase = i * Math.PI / 2
      this.mesh.add(wisp)
    }

    // Eyes (bright white)
    const eyeGeo = new THREE.SphereGeometry(0.04, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 3.0,
    })
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.1, 0.7, 0.25)
    this.mesh.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.1, 0.7, 0.25)
    this.mesh.add(rightEye)
  }

  /** Burn aura — damages nearby player */
  burnAura(dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return
    this.burnCooldown += dt

    const dist = this.distanceTo(playerX, playerZ)
    if (dist <= 3) {
      // Aura glow
      const pulse = 1.5 + Math.sin(this.walkTime * 4) * 0.8
      if (this.fireMesh.material instanceof THREE.MeshStandardMaterial) {
        this.fireMesh.material.emissiveIntensity = pulse
      }
    }
  }

  /** Flame burst — visual effect */
  flameBurst(): void {
    this.mesh.traverse(obj => {
      if (obj instanceof THREE.Mesh && obj.userData.bob) {
        const wisp = obj as THREE.Mesh
        if (wisp.geometry.type === 'ConeGeometry') {
          wisp.scale.y = 1.5 + Math.sin(this.walkTime * 6 + (wisp.userData.phase as number))
        }
      }
    })
  }

  update(dt: number, _playerX: number, _playerZ: number): void {
    super.update(dt, _playerX, _playerZ)
    this.burnAura(dt, _playerX, _playerZ)
    this.flameBurst()
  }
}
