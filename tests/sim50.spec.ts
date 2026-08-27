/** Quick soak test for simulateToLayer(50) feasibility. */
import { describe, it, expect } from 'vitest'
import { simulateToLayer } from './simulate'

describe('simulateToLayer(50) soak', () => {
  it('reaches layer 50 within 2M ticks (seed 0)', { timeout: 60000 }, () => {
    const r = simulateToLayer(50, { seed: 0, maxTicks: 2_000_000 })
    console.log(`L50 seed 0: ok=${r.ok} reached=${r.reached} ticks=${r.ticks} harmonics=${r.harmonics} fail=${r.fail}`)
    expect(r.ok).toBe(true)
    expect(r.reached).toBeGreaterThanOrEqual(50)
  })

  it('reaches layer 50 within 2M ticks (seed 42)', { timeout: 60000 }, () => {
    const r = simulateToLayer(50, { seed: 42, maxTicks: 2_000_000 })
    console.log(`L50 seed 42: ok=${r.ok} reached=${r.reached} ticks=${r.ticks} harmonics=${r.harmonics} fail=${r.fail}`)
    expect(r.ok).toBe(true)
    expect(r.reached).toBeGreaterThanOrEqual(50)
  })
})
