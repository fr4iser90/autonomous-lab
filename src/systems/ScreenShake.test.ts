/**
 * Unit tests for ScreenShake — camera shake on damage.
 * P8-1
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Vector3 } from 'three'
import { ScreenShake } from './ScreenShake'

describe('ScreenShake', () => {
  let shake: ScreenShake

  beforeEach(() => {
    shake = new ScreenShake()
  })

  describe('trigger', () => {
    it('sets intensity and duration', () => {
      shake.trigger(0.2, 0.5)
      expect(shake.getMagnitude()).toBeGreaterThan(0)
    })

    it('higher intensity overrides lower', () => {
      shake.trigger(0.05, 0.1)
      shake.trigger(0.3, 0.2)
      expect(shake.getMagnitude()).toBeGreaterThan(0.2)
    })

    it('shorter duration does not extend existing duration', () => {
      shake.trigger(0.2, 0.5)
      shake.trigger(0.2, 0.1)
      // Duration stays at 0.5 (max of both)
      expect(shake.getMagnitude()).toBeGreaterThan(0)
    })
  })

  describe('update', () => {
    it('returns zero offset when no shake is active', () => {
      const offset = shake.update(0.016, new Vector3(0, 0, 0))
      expect(offset.x).toBe(0)
      expect(offset.y).toBe(0)
      expect(offset.z).toBe(0)
    })

    it('returns non-zero offset when shake is active', () => {
      shake.trigger(0.15, 0.3)
      const offset = shake.update(0.016, new Vector3(0, 0, 0))
      // At least one component should be non-zero due to sin-based noise
      const mag = Math.abs(offset.x) + Math.abs(offset.y) + Math.abs(offset.z)
      expect(mag).toBeGreaterThan(0)
    })

    it('fades out over duration', () => {
      shake.trigger(0.2, 0.5)
      const mag0 = shake.getMagnitude()
      expect(mag0).toBeGreaterThan(0)

      vi.useFakeTimers()
      vi.advanceTimersByTime(400)
      shake.update(0.1, new Vector3(0, 0, 0))
      const mag400 = shake.getMagnitude()
      expect(mag400).toBeLessThan(mag0)
      vi.useRealTimers()
    })

    it('stops after duration elapses', () => {
      shake.trigger(0.15, 0.3)
      vi.useFakeTimers()
      // Simulate 6 frames at 60fps (total 0.3s) to exceed duration
      for (let i = 0; i < 6; i++) {
        shake.update(0.0167, new Vector3(0, 0, 0))
      }
      // One more frame — should be past duration
      const offset = shake.update(0.01, new Vector3(0, 0, 0))
      expect(offset.x).toBe(0)
      expect(offset.y).toBe(0)
      expect(offset.z).toBe(0)
      vi.useRealTimers()
    })

    it('is deterministic for same time constant', () => {
      shake.trigger(0.15, 0.3)
      const t = performance.now() / 1000
      const offset1 = shake.update(0.016, new Vector3(0, 0, 0))

      shake.trigger(0.15, 0.3)
      vi.useFakeTimers()
      vi.setSystemTime(t * 1000)
      const offset2 = shake.update(0.016, new Vector3(0, 0, 0))

      expect(offset2.x).toBe(offset1.x)
      expect(offset2.y).toBe(offset1.y)
      expect(offset2.z).toBe(offset1.z)
      vi.useRealTimers()
    })
  })

  describe('getMagnitude', () => {
    it('returns 0 when no shake', () => {
      expect(shake.getMagnitude()).toBe(0)
    })

    it('returns positive value after trigger', () => {
      shake.trigger(0.25, 0.4)
      expect(shake.getMagnitude()).toBeGreaterThan(0)
    })

    it('decreases over time during shake', () => {
      shake.trigger(0.3, 1.0)
      const magStart = shake.getMagnitude()
      vi.useFakeTimers()
      vi.advanceTimersByTime(500)
      shake.update(0.5, new Vector3(0, 0, 0))
      const magEnd = shake.getMagnitude()
      expect(magEnd).toBeLessThan(magStart)
      vi.useRealTimers()
    })
  })

  describe('shakeOffset getter', () => {
    it('returns a Vector3', () => {
      expect(shake.shakeOffset).toBeInstanceOf(Vector3)
    })

    it('returns zero Vector3 when idle', () => {
      expect(shake.shakeOffset.x).toBe(0)
    })

    it('returns shake offset after trigger and update', () => {
      shake.trigger(0.15, 0.3)
      // After trigger but before update, intensity hasn't been consumed
      // The getter returns the current _shakeOffset which may still be zero
      // until update is called
      const updated = shake.update(0.016, new Vector3(0, 0, 0))
      expect(shake.shakeOffset).toBe(updated)
    })
  })
})
