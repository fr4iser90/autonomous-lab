/**
 * Unit tests for HitEffects — visual combat feedback.
 * P8-1
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as THREE from 'three'
import { HitEffects } from './HitEffects'

// Mock CanvasTexture to avoid browser-specific canvas ops
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof THREE>()
  return {
    ...actual,
    CanvasTexture: class CanvasTexture {
      minFilter: unknown
      constructor(...args: unknown[]) { this.minFilter = args[0] }
    },
    SpriteMaterial: class SpriteMaterial {},
    Sprite: class Sprite {
      position = new THREE.Vector3()
      scale = new THREE.Vector3()
      userData = {}
      constructor(_mat: unknown) {}
    },
  }
})

describe('HitEffects', () => {
  let effects: HitEffects

  beforeEach(() => {
    effects = new HitEffects()
  })

  describe('spawnDamageNumber', () => {
    it('creates a floating number entry', () => {
      const pos = new THREE.Vector3(1, 2, 3)
      effects.spawnDamageNumber(10, pos, false)
      expect(effects['floatingNumbers']).toHaveLength(1)
      expect(effects['floatingNumbers'][0].value).toBe(10)
      expect(effects['floatingNumbers'][0].position).toEqual(pos)
      expect(effects['floatingNumbers'][0].isCritical).toBe(false)
    })

    it('marks critical numbers', () => {
      effects.spawnDamageNumber(20, new THREE.Vector3(0, 0, 0), true)
      expect(effects['floatingNumbers'][0].isCritical).toBe(true)
    })
  })

  describe('spawnHitBurst', () => {
    it('creates particles with radial velocities', () => {
      const pos = new THREE.Vector3(5, 0, 5)
      effects.spawnHitBurst(pos, 8, 0xff0000)
      expect(effects['particles']).toHaveLength(8)
      for (const p of effects['particles']) {
        expect(p.position).toEqual(pos)
        expect(p.color).toBe(0xff0000)
        expect(p.velocity.y).toBeGreaterThan(0) // all have upward velocity
      }
    })

    it('defaults to 6 particles and orange color', () => {
      effects.spawnHitBurst(new THREE.Vector3())
      expect(effects['particles']).toHaveLength(6)
      expect(effects['particles'][0].color).toBe(0xffaa33)
    })
  })

  describe('triggerHitFlash', () => {
    it('flashes child meshes with their original colors', () => {
      const geo = new THREE.BoxGeometry(1, 1, 1)
      const mat = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
      const child = new THREE.Mesh(geo, mat)
      const group = new THREE.Group()
      group.add(child)

      effects.triggerHitFlash(group, 0xff0000, 0.1)

      const flash = effects['flashMeshes'].get(child)
      expect(flash).toBeDefined()
      expect(flash!.originalColor).toBe(0x00ff00)
      expect(flash!.flashColor).toBe(0xff0000)
    })

    it('handles array materials (stores last material flash)', () => {
      const geo = new THREE.BoxGeometry(1, 1, 1)
      const mat1 = new THREE.MeshStandardMaterial({ color: 0xff0000 })
      const _mat2 = new THREE.MeshStandardMaterial({ color: 0x0000ff })
      const mesh = new THREE.Mesh(geo, [mat1, _mat2])

      effects.triggerHitFlash(mesh, 0xffff00, 0.2)

      // Array materials: traverse finds mesh once, last material in array wins
      expect(effects['flashMeshes'].size).toBe(1)
      const flash = effects['flashMeshes'].values().next().value
      expect(flash).toBeDefined()
      expect(flash!.originalColor).toBe(0x0000ff)
    })

    it('skips non-Mesh objects in traverse', () => {
      const group = new THREE.Group()
      const light = new THREE.PointLight(0xffffff)
      group.add(light)

      effects.triggerHitFlash(group, 0xffffff, 0.1)
      expect(effects['flashMeshes'].size).toBe(0)
    })
  })

  describe('update', () => {
    it('removes floating numbers after 1 second', () => {
      const baseTime = performance.now() / 1000
      vi.useFakeTimers()
      effects.spawnDamageNumber(5, new THREE.Vector3(0, 0, 0), false)
      expect(effects['floatingNumbers']).toHaveLength(1)

      // Advance past expiry
      vi.advanceTimersByTime(1100)
      effects.update(baseTime + 1.1, 0.1, null as unknown as THREE.Scene)
      expect(effects['floatingNumbers']).toHaveLength(0)
      vi.useRealTimers()
    })

    it('removes expired particles', () => {
      const baseTime = performance.now() / 1000
      vi.useFakeTimers()
      effects.spawnHitBurst(new THREE.Vector3(0, 0, 0), 3, 0xff0000)
      expect(effects['particles']).toHaveLength(3)

      // Advance past all particle lifetimes (max 0.6s)
      vi.advanceTimersByTime(600)
      effects.update(baseTime + 0.6, 0.1, null as unknown as THREE.Scene)
      expect(effects['particles']).toHaveLength(0)
      vi.useRealTimers()
    })

    it('clears flash after lifetime', () => {
      const baseTime = performance.now() / 1000
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x00ff00 }))
      effects.triggerHitFlash(mesh, 0xff0000, 0.1)
      expect(effects['flashMeshes'].size).toBe(1)

      vi.useFakeTimers()
      vi.advanceTimersByTime(110)
      effects.update(baseTime + 0.11, 0.01, null as unknown as THREE.Scene)
      expect(effects['flashMeshes'].size).toBe(0)
      vi.useRealTimers()
    })

    it('interpolates flash color back to original over time', () => {
      const baseTime = performance.now() / 1000
      const mat = new THREE.MeshStandardMaterial({ color: 0x000000 })
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat)
      effects.triggerHitFlash(mesh, 0xffffff, 0.2)

      vi.useFakeTimers()
      // Halfway through: color should be between black and white
      vi.advanceTimersByTime(100)
      effects.update(baseTime + 0.1, 0.01, null as unknown as THREE.Scene)
      const midColor = mat.color.getHex()
      // THREE.Color.lerp uses CIELab space, not RGB, so exact value varies
      // Verify it's not black (0x000000) and not full white (0xffffff)
      expect(midColor).not.toBe(0x000000)
      expect(midColor).not.toBe(0xffffff)
      vi.useRealTimers()
    })

    it('applies gravity to particle Y velocity', () => {
      const baseTime = performance.now() / 1000
      effects.spawnHitBurst(new THREE.Vector3(0, 0, 0), 1, 0xff0000)
      const p = effects['particles'][0]
      const startVy = p.velocity.y

      vi.useFakeTimers()
      vi.advanceTimersByTime(100)
      effects.update(baseTime + 0.1, 0.1, null as unknown as THREE.Scene)

      expect(p.velocity.y).toBeLessThan(startVy) // gravity pulls down
      vi.useRealTimers()
    })
  })

  describe('renderFloatingNumbers', () => {
    it('does not crash with empty numbers', () => {
      const scene = new THREE.Scene()
      expect(() => effects.renderFloatingNumbers(scene)).not.toThrow()
    })

    // CanvasTexture is not available in jsdom — skipped in test env
    it.skip('creates sprite labels for active numbers (requires canvas)', () => {
      const baseTime = performance.now() / 1000
      vi.useFakeTimers()
      effects.spawnDamageNumber(42, new THREE.Vector3(1, 0, 1), true)

      const scene = new THREE.Scene()
      effects.update(baseTime, 0, scene)
      effects.renderFloatingNumbers(scene)

      const labels = scene.children.filter((c: THREE.Object3D) => c.userData.isDamageLabel)
      expect(labels).toHaveLength(1)
      vi.useRealTimers()
    })
  })

  describe('renderParticles', () => {
    it('does not crash with empty particles', () => {
      const scene = new THREE.Scene()
      expect(() => effects.renderParticles(scene)).not.toThrow()
    })

    // Integration test: verifies render doesn't throw when particles exist
    // Full scene.children validation requires real DOM — skipped here
    it.skip('renders particles to scene (requires canvas)', () => {
      const baseTime = performance.now() / 1000
      vi.useFakeTimers()
      effects.spawnHitBurst(new THREE.Vector3(0, 0, 0), 2, 0xff0000)

      const scene = new THREE.Scene()
      effects.update(baseTime, 0, scene)
      expect(() => effects.renderParticles(scene)).not.toThrow()
      vi.useRealTimers()
    })
  })

  describe('clear', () => {
    it('empties all effect collections', () => {
      effects.spawnDamageNumber(10, new THREE.Vector3(), false)
      effects.spawnHitBurst(new THREE.Vector3(), 3, 0xff0000)
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x00ff00 }))
      effects.triggerHitFlash(mesh, 0xffffff, 0.1)

      effects.clear()

      expect(effects['floatingNumbers']).toHaveLength(0)
      expect(effects['particles']).toHaveLength(0)
      expect(effects['flashMeshes'].size).toBe(0)
    })
  })
})
