import { describe, expect, it } from 'vitest'
import { Decimal } from 'decimal.js'
import { format } from './format'

describe('format (M2)', () => {
  it('format(1.5e6) is readable: "1.50M"', () => {
    expect(format(1.5e6)).toBe('1.50M')
  })

  it('small values: integers stay integers, fractions one decimal', () => {
    expect(format(0)).toBe('0')
    expect(format(1)).toBe('1')
    expect(format(123)).toBe('123')
    expect(format(999)).toBe('999')
    expect(format(999.5)).toBe('999.5')
    expect(format(0.5)).toBe('0.5')
  })

  it('suffix groups with 3 significant figures', () => {
    expect(format(1500)).toBe('1.50K')
    expect(format(1000)).toBe('1.00K')
    expect(format(45.6e6)).toBe('45.6M')
    expect(format(999e6)).toBe('999M')
    expect(format(1.5e15)).toBe('1.50Qa')
    expect(format(1.5e18)).toBe('1.50Qi')
    expect(format(2.2e21)).toBe('2.20Sx')
  })

  it('rounding overflow bumps the tier (999.999M -> 1.000B)', () => {
    expect(format(999.999e6)).toBe('1.000B')
  })

  it('beyond named suffixes falls back to scientific', () => {
    expect(format(1e36)).toBe('1.00e36')
    expect(format(2.5e36)).toBe('2.50e36')
    expect(format(new Decimal('123456789012345678901234567890'))).toBe('123Oc')
    expect(format(new Decimal('1.2345e38'))).toBe('1.23e38')
  })

  it('handles negatives and Decimal inputs', () => {
    expect(format(-1500)).toBe('-1.50K')
    expect(format(new Decimal('1500000'))).toBe('1.50M')
  })
})
