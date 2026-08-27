/** BOILERPLATE_TOY tests — replace when the real game lands. See BOILERPLATE.md */
import { describe, expect, it } from 'vitest'
import { createEconomy, formatEnergy, harvest, step } from './economy'

describe('economy', () => {
  it('starts at zero', () => {
    expect(createEconomy()).toEqual({ energy: 0, perTick: 0 })
  })

  it('harvests energy and grows passive rate', () => {
    const next = harvest(createEconomy())
    expect(next.energy).toBe(1)
    expect(next.perTick).toBe(0.1)
  })

  it('steps by perTick', () => {
    const next = step({ energy: 2, perTick: 0.5 })
    expect(next).toEqual({ energy: 2.5, perTick: 0.5 })
  })

  it('formats small and large values', () => {
    expect(formatEnergy(12)).toBe('12')
    expect(formatEnergy(12.5)).toBe('12.5')
    expect(formatEnergy(12_500)).toBe('1.25e+4')
  })
})
