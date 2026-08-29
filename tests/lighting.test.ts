/**
 * Lighting system unit tests
 * P8-4: Torch flicker + ambient light falloff.
 * Tests the pure math functions from src/utils/lighting.ts.
 */
import { describe, it, expect } from 'vitest'
import { torchIntensity, TORCH_BASE_INTENSITY, ambientIntensity } from '../src/utils/lighting.js'

describe('torchIntensity', () => {
  it('returns a value in [0.6, ~1.1] at t=0 for any torch', () => {
    for (let i = 0; i < 10; i++) {
      const val = torchIntensity(0, i)
      expect(val).toBeGreaterThanOrEqual(0.6)
      expect(val).toBeLessThanOrEqual(1.1)
    }
  })

  it('changes over time (flicker is not constant)', () => {
    const i = 3
    const v0 = torchIntensity(0, i)
    const v1 = torchIntensity(0.5, i)
    const v2 = torchIntensity(1.0, i)

    // At least one of these should differ (very high probability given irrational frequencies)
    const differs = v0 !== v1 || v1 !== v2
    expect(differs).toBe(true)
  })

  it('each torch produces different intensities at the same time', () => {
    const time = 2.5
    const vals = Array.from({ length: 8 }, (_, idx) => torchIntensity(time, idx))

    const unique = new Set(vals)
    expect(unique.size).toBeGreaterThan(4) // at least half should be different
  })

  it('intensity stays within valid range over a long time window', () => {
    for (let t = 0; t < 100; t += 0.05) {
      for (const i of [0, 1, 2, 3, 5, 7]) {
        const val = torchIntensity(t, i)
        expect(val).toBeGreaterThanOrEqual(0.55)
        expect(val).toBeLessThanOrEqual(1.4)
      }
    }
  })

  it('draft bursts occasionally produce intensity > 1.0 (1.25× mod)', () => {
    // Check a 20-second window for bursts
    let hadBurst = false
    for (let t = 0; t < 20; t += 0.05) {
      for (const i of [0, 1, 2]) {
        if (torchIntensity(t, i) > 1.05) {
          hadBurst = true
          break
        }
      }
      if (hadBurst) break
    }
    expect(hadBurst).toBe(true)
  })

  it('multiplies by base intensity to get actual light value', () => {
    const t = 0
    const base = TORCH_BASE_INTENSITY // 1.7
    const val = torchIntensity(t, 0)
    const actualIntensity = base * val

    expect(actualIntensity).toBeGreaterThan(1.0)
    expect(actualIntensity).toBeLessThan(1.9)
  })

  it('torch indices produce monotonic phase progression (different chars)', () => {
    const t = 5.0
    const vals = [0, 1, 2, 3, 4, 5, 6, 7].map(i => torchIntensity(t, i))

    // All 8 torches should produce different values (irrational phase offsets)
    const unique = new Set(vals)
    expect(unique.size).toBe(8)
  })
})

describe('ambientIntensity', () => {
  it('returns base intensity 1.1 at floor 1', () => {
    expect(ambientIntensity(1)).toBeCloseTo(1.1, 4)
  })

  it('reduces intensity with floor depth', () => {
    const f1 = ambientIntensity(1)
    const f5 = ambientIntensity(5)
    const f10 = ambientIntensity(10)

    expect(f1).toBeGreaterThan(f5)
    expect(f5).toBeGreaterThan(f10)
  })

  it('follows the formula: max(0.45, 1.1 - (floor-1)*0.07)', () => {
    expect(ambientIntensity(1)).toBeCloseTo(1.1, 4)
    expect(ambientIntensity(5)).toBeCloseTo(0.82, 4)  // 1.1 - 4*0.07
    expect(ambientIntensity(10)).toBeCloseTo(0.47, 4) // 1.1 - 9*0.07
  })

  it('clamps to minimum 0.45 for deep floors', () => {
    // Floor 16: 1.1 - 15*0.07 = 0.05, clamped to 0.45
    expect(ambientIntensity(16)).toBeCloseTo(0.45, 4)
    // Floor 50: still clamped
    expect(ambientIntensity(50)).toBeCloseTo(0.45, 4)
  })

  it('returns positive values for all floor numbers', () => {
    for (const floor of [1, 2, 5, 10, 16, 50, 100]) {
      expect(ambientIntensity(floor)).toBeGreaterThan(0)
    }
  })

  it('all 16 game floors have valid ambient intensity', () => {
    for (let floor = 1; floor <= 16; floor++) {
      const intensity = ambientIntensity(floor)
      expect(intensity).toBeGreaterThanOrEqual(0.45)
      expect(intensity).toBeLessThanOrEqual(1.1)
    }
  })
})
