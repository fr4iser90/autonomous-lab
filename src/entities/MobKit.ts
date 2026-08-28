/**
 * MobKit — base class for all dungeon mobs.
 * M5: Goblin mob kit with chase AI.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
export type MobType = 'goblin' | 'shade' | 'stalker' | 'skeleton' | 'bat' | 'ogre' | 'mummy' | 'spider' | 'wolf' | 'zombie' | 'harpy' | 'troll' | 'lich' | 'phantom' | 'elemental'

export interface LootEntry {
  /** Item ID to drop */
  itemId: string
  /** Drop chance 0–1 */
  chance: number
}

/** Loot tables per mob type — keyed by MobType */
const LOOT_TABLES: Record<MobType, LootEntry[]> = {
  goblin: [
    { itemId: 'health-potion', chance: 0.4 },
    { itemId: 'rusty-sword', chance: 0.25 },
  ],
  shade: [
    { itemId: 'health-potion', chance: 0.3 },
    { itemId: 'iron-axe', chance: 0.2 },
  ],
  stalker: [
    { itemId: 'poison-dagger', chance: 0.2 },
    { itemId: 'health-potion', chance: 0.35 },
  ],
  skeleton: [
    { itemId: 'iron-shield', chance: 0.25 },
    { itemId: 'health-potion', chance: 0.3 },
    { itemId: 'iron-axe', chance: 0.15 },
  ],
  bat: [
    { itemId: 'health-potion', chance: 0.3 },
  ],
  ogre: [
    { itemId: 'plate-armor', chance: 0.05 },
    { itemId: 'mega-potion', chance: 0.15 },
    { itemId: 'steel-club', chance: 0.2 },
  ],
  mummy: [
    { itemId: 'blessed-amulet', chance: 0.2 },
    { itemId: 'health-potion', chance: 0.35 },
    { itemId: 'dungeon-key', chance: 0.15 },
  ],
  spider: [
    { itemId: 'poison-dagger', chance: 0.2 },
    { itemId: 'health-potion', chance: 0.3 },
  ],
  wolf: [
    { itemId: 'iron-axe', chance: 0.25 },
    { itemId: 'health-potion', chance: 0.3 },
  ],
  zombie: [
    { itemId: 'health-potion', chance: 0.35 },
    { itemId: 'iron-shield', chance: 0.2 },
  ],
  harpy: [
    { itemId: 'lightning-bow', chance: 0.15 },
    { itemId: 'greater-potion', chance: 0.3 },
  ],
  troll: [
    { itemId: 'steel-club', chance: 0.15 },
    { itemId: 'plate-armor', chance: 0.05 },
    { itemId: 'mega-potion', chance: 0.2 },
  ],
  lich: [
    { itemId: 'crystal-orb', chance: 0.1 },
    { itemId: 'greater-potion', chance: 0.25 },
    { itemId: 'lightning-bow', chance: 0.15 },
  ],
  phantom: [
    { itemId: 'greater-potion', chance: 0.3 },
    { itemId: 'rune-ring', chance: 0.2 },
  ],
  elemental: [
    { itemId: 'flame-staff', chance: 0.15 },
    { itemId: 'mega-potion', chance: 0.25 },
    { itemId: 'crystal-orb', chance: 0.05 },
  ],
}

export function getLootTable(type: MobType): LootEntry[] {
  return LOOT_TABLES[type] ?? []
}

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
