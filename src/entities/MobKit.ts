/**
 * MobKit — base class for all dungeon mobs.
 * M5: Goblin mob kit with chase AI.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'

export type MobType = 'goblin' | 'shade' | 'stalker' | 'skeleton' | 'bat' | 'ogre' | 'mummy' | 'spider' | 'wolf' | 'zombie' | 'harpy' | 'troll' | 'lich' | 'phantom' | 'elemental'

export interface MobStats {
  hp: number
  maxHp: number
  damage: number
  speed: number
  aggroRange: number
  chaseSpeed: number
}

export interface MobState {
  type: MobType
  stats: MobStats
  alive: boolean
  scrapReward: number
}

export abstract class MobKit {
  readonly mesh: THREE.Group
  readonly state: MobState
  protected renderer: GameRenderer
  protected walkTime = 0

  constructor(renderer: GameRenderer, type: MobType, stats: MobStats, scrapReward: number = 0) {
    this.renderer = renderer
    this.state = { type, stats, alive: true, scrapReward }
    this.mesh = new THREE.Group()
    this.buildMesh(renderer, type)
    renderer.scene.add(this.mesh)
  }

  abstract buildMesh(renderer: GameRenderer, type: MobType): void

  setPosition(x: number, y: number, z: number): void {
    this.position.set(x, y, z)
    this.mesh.position.copy(this.position)
  }

  readonly position = new THREE.Vector3()

  /** Distance to player position */
  distanceTo(x: number, z: number): number {
    const dx = this.position.x - x
    const dz = this.position.z - z
    return Math.sqrt(dx * dx + dz * dz)
  }

  /** Update mob each frame */
  update(dt: number, _playerX: number, _playerZ: number): void {
    if (!this.state.alive) return
    this.walkTime += dt
    const bob = Math.sin(this.walkTime * 6) * 0.03
    this.mesh.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.userData.bob) {
        child.position.y += bob
      }
    })
  }

  /** Apply damage and return remaining HP */
  takeDamage(amount: number): number {
    this.state.stats.hp = Math.max(0, this.state.stats.hp - amount)
    if (this.state.stats.hp <= 0) {
      this.state.alive = false
      this.onDeath()
    }
    return this.state.stats.hp
  }

  onDeath(): void {
    this.mesh.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        const mat = obj.material as THREE.MeshStandardMaterial
        mat.transparent = true
        mat.opacity = 0.2
      }
    })
  }

  dispose(): void {
    this.mesh.traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (obj.material) {
          ;(obj.material as THREE.Material).dispose()
        }
      }
    })
    this.renderer.scene.remove(this.mesh)
  }
}
