/**
 * LootDrop — 3D floating collectible item that appears when a mob dies.
 * P5-2: Loot drops — weighted drops from mobs, auto-pickup on proximity.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import type { ItemDef, ItemRarity } from '../data/items'

/** A single floating loot item in the world */
export class LootDrop {
  /** The Three.js group that represents this drop */
  readonly mesh: THREE.Group
  /** The item definition for this drop */
  readonly item: ItemDef
  /** Position on the floor */
  readonly x: number
  readonly z: number
  /** Time since spawn (seconds) */
  spawnTime: number
  /** Whether this drop has been collected */
  collected = false
  /** Fade-out started (for removal) */
  fading = false

  private _renderer: GameRenderer
  private _glowLight: THREE.PointLight
  private _glowMesh: THREE.Mesh
  private _bobPhase: number

  constructor(renderer: GameRenderer, item: ItemDef, x: number, z: number, spawnTime: number) {
    this._renderer = renderer
    this.item = item
    this.x = x
    this.z = z
    this.spawnTime = spawnTime
    this._bobPhase = Math.random() * Math.PI * 2
    this.mesh = new THREE.Group()
    this.mesh.position.set(x, 0, z)

    // Build mesh from item type
    this._buildMesh(item)

    // Add emissive glow
    this._glowMesh = this._makeGlowMesh(item.rarity)
    this.mesh.add(this._glowMesh)

    this._glowLight = this._makeGlowLight(item.rarity)
    this.mesh.add(this._glowLight)

    renderer.scene.add(this.mesh)
  }

  // --- Glow colors by rarity ---

  private _glowColor(rarity: ItemRarity): number {
    switch (rarity) {
      case 'common': return 0x88cc44
      case 'uncommon': return 0x44aaff
      case 'rare': return 0xffaa22
    }
  }

  private _buildMesh(item: ItemDef): void {
    switch (item.type) {
      case 'weapon': {
        // Small sword shape: blade + hilt
        const bladeGeo = new THREE.BoxGeometry(0.08, 0.35, 0.02)
        const bladeMat = new THREE.MeshStandardMaterial({
          color: 0xcccccc, roughness: 0.3, metalness: 0.8,
        })
        const blade = new THREE.Mesh(bladeGeo, bladeMat)
        blade.position.y = 0.175
        blade.castShadow = true
        this.mesh.add(blade)

        const hiltGeo = new THREE.BoxGeometry(0.16, 0.06, 0.02)
        const hiltMat = new THREE.MeshStandardMaterial({
          color: 0x6b4226, roughness: 0.7, metalness: 0.2,
        })
        const hilt = new THREE.Mesh(hiltGeo, hiltMat)
        hilt.position.y = 0
        hilt.castShadow = true
        this.mesh.add(hilt)
        return
      }
      case 'potion': {
        // Flattened bottle shape
        const bodyGeo = new THREE.SphereGeometry(0.12, 8, 6)
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0xff4466, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.85,
        })
        const body = new THREE.Mesh(bodyGeo, bodyMat)
        body.position.y = 0.1
        body.scale.y = 1.2
        body.castShadow = true
        this.mesh.add(body)

        const neckGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6)
        const neckMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.5 })
        const neck = new THREE.Mesh(neckGeo, neckMat)
        neck.position.y = 0.25
        this.mesh.add(neck)
        return
      }
      case 'key': {
        const keyGeo = new THREE.TorusGeometry(0.1, 0.025, 6, 12)
        const keyMat = new THREE.MeshStandardMaterial({
          color: 0xffd700, roughness: 0.2, metalness: 0.9,
        })
        const key = new THREE.Mesh(keyGeo, keyMat)
        key.position.y = 0.15
        key.castShadow = true
        this.mesh.add(key)

        const pinGeo = new THREE.BoxGeometry(0.03, 0.12, 0.02)
        const pin = new THREE.Mesh(pinGeo, keyMat)
        pin.position.set(0, 0.06, 0)
        pin.castShadow = true
        this.mesh.add(pin)
        return
      }
      case 'armor':
      default: {
        // Shield shape — flattened cylinder
        const shieldGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 8)
        const shieldMat = new THREE.MeshStandardMaterial({
          color: 0x888899, roughness: 0.5, metalness: 0.6,
        })
        const shield = new THREE.Mesh(shieldGeo, shieldMat)
        shield.rotation.x = Math.PI / 2
        shield.position.y = 0.15
        shield.castShadow = true
        this.mesh.add(shield)

        const rimGeo = new THREE.TorusGeometry(0.14, 0.015, 6, 8)
        const rimMat = new THREE.MeshStandardMaterial({
          color: 0xaaaaaa, roughness: 0.3, metalness: 0.8,
        })
        const rim = new THREE.Mesh(rimGeo, rimMat)
        rim.rotation.x = Math.PI / 2
        rim.position.y = 0.15
        this.mesh.add(rim)
        return
      }
    }
  }

  private _makeGlowMesh(rarity: ItemRarity): THREE.Mesh {
    const color = this._glowColor(rarity)
    const glowGeo = new THREE.SphereGeometry(0.2, 8, 6)
    const glowMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.35,
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    glow.position.y = 0.15
    return glow
  }

  private _makeGlowLight(rarity: ItemRarity): THREE.PointLight {
    const color = this._glowColor(rarity)
    const light = new THREE.PointLight(color, 0.6, 3, 2)
    light.position.y = 0.15
    return light
  }

  /** Update this drop each frame */
  update(dt: number, time: number): void {
    if (this.collected) return
    if (this.fading) {
      // Fade out over 0.3s
      const mat = this._glowMesh.material as THREE.MeshStandardMaterial
      mat.opacity = Math.max(0, mat.opacity - dt * 3)
      this._glowLight.intensity *= 0.9
      return
    }

    // Bob up and down
    const bob = Math.sin(time * 3 + this._bobPhase) * 0.04
    this.mesh.position.y = bob

    // Slow rotation
    this.mesh.rotation.y += dt * 0.8

    // Pulse glow
    const pulse = 0.7 + 0.3 * Math.sin(time * 2 + this._bobPhase)
    this._glowLight.intensity = 0.6 * pulse
  }

  /** Remove this drop from the scene */
  remove(): void {
    this.fading = true
    setTimeout(() => {
      this._renderer.scene.remove(this.mesh)
      this.mesh.traverse((obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (obj.material) {
            ;(obj.material as THREE.Material).dispose()
          }
        }
      })
    }, 300)
  }
}

/**
 * LootDropManager — spawns, tracks, and collects loot drops.
 * Max 8 active drops; drops auto-despawn after 60s.
 */
export class LootDropManager {
  private drops: LootDrop[] = []
  private readonly maxDrops = 8
  private readonly despawnSeconds = 60
  private readonly pickupRadius = 0.8

  constructor(
    private readonly _renderer: GameRenderer,
    /** Callback to add item to inventory (returns false if full/duplicate) */
    private readonly _addItem: (item: ItemDef) => boolean,
    /** Callback to log a collection message */
    private readonly _log: (msg: string) => void,
  ) {}

  /** Spawn a loot drop at a position */
  spawn(item: ItemDef, x: number, z: number): boolean {
    if (this.drops.length >= this.maxDrops) return false
    const drop = new LootDrop(this._renderer, item, x, z, Date.now())
    this.drops.push(drop)
    return true
  }

  /** Update all drops; returns any newly collected item defs */
  update(dt: number, time: number, playerX: number, playerZ: number): ItemDef[] {
    const collected: ItemDef[] = []

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i]
      if (drop.collected) continue

      // Check despawn
      if (Date.now() - drop.spawnTime > this.despawnSeconds * 1000) {
        drop.remove()
        this.drops.splice(i, 1)
        continue
      }

      drop.update(dt, time)

      // Check proximity to player for auto-pickup
      const dx = drop.x - playerX
      const dz = drop.z - playerZ
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist <= this.pickupRadius) {
        // Try to add to inventory
        if (this._addItem(drop.item)) {
          drop.collected = true
          const rarityLabel = drop.item.rarity ? ` [${drop.item.rarity}]` : ''
          this._log(`🎒 Collected ${drop.item.icon} ${drop.item.name}${rarityLabel}!`)
          collected.push(drop.item)
          drop.remove()
          this.drops.splice(i, 1)
        }
        // If inventory reject, player must move away and try again
      }
    }

    return collected
  }

  /** Get active drops (not collected, not fading) */
  getDrops(): LootDrop[] {
    return this.drops.filter(d => !d.collected && !d.fading)
  }

  /** Get drop count */
  getDropCount(): number {
    return this.drops.length
  }

  /** Clear all drops (e.g., on game reset) */
  clear(): void {
    for (const drop of this.drops) {
      drop.remove()
    }
    this.drops = []
  }
}
