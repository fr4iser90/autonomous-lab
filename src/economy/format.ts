/**
 * format() — human-readable rendering of big numbers (decimal.js backed).
 *
 * Rules (locked for M2):
 * - < 1000: integer if whole ("0", "123"), else one decimal ("999.5").
 * - >= 1000: short-scale suffix groups of 10^3 with 3 significant figures:
 *   format(1.5e6) === "1.50M", format(45.6e6) === "45.6M", format(999e6) === "999M".
 * - Beyond the named suffixes: scientific, "2.50e36".
 */
import { Decimal } from 'decimal.js'

export const SUFFIXES: readonly string[] = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
]

export function format(value: Decimal.Value): string {
  const d = new Decimal(value)
  if (d.isNegative()) return `-${format(d.negated())}`
  if (d.lt(1000)) {
    return d.mod(1).isZero() ? d.toFixed(0) : d.toDecimalPlaces(1).toFixed(1)
  }
  let tier = Math.floor(d.log(10).toNumber() / 3)
  // Guard against rounding overflow (e.g. 999.999M -> "1000M"): bump the tier.
  for (let guard = 0; guard < 2; guard++) {
    if (tier >= SUFFIXES.length) break
    const scaled = d.div(Decimal.pow(10, tier * 3))
    const wholeDigits = scaled.log(10).floor().toNumber() + 1
    const decimals = Math.max(0, 3 - wholeDigits)
    const rendered = scaled.toDecimalPlaces(decimals).toFixed(decimals)
    if (Number(rendered) < 1000) return `${rendered}${SUFFIXES[tier]}`
    tier += 1
  }
  // Scientific notation for huge values.
  const exp = d.log(10).floor().toNumber()
  const mantissa = d.div(Decimal.pow(10, exp))
  return `${mantissa.toDecimalPlaces(2).toFixed(2)}e${exp}`
}
