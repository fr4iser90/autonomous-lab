/**
 * Relays (generators) — data definitions for Stratum 1 (M3).
 * M5+ will derive generator templates procedurally per layer (layerDef).
 *
 * Cost model: `baseCost * costGrowth^owned` (rising cost, integer exponent).
 * Production: `owned * baseRate` Signal/sec, summed in EconomyEngine.
 */
import { Decimal } from 'decimal.js'

export interface GeneratorDef {
  id: string
  name: string
  flavor: string
  /** Cost of the next unit when owning `n`: baseCost * costGrowth^n. */
  baseCost: Decimal
  baseRate: Decimal
  costGrowth: Decimal
}

const D = (v: number): Decimal => new Decimal(v)

export const RELAYS: readonly GeneratorDef[] = [
  {
    id: 'whisper',
    name: 'Whisper Relay',
    flavor: 'A faint echo, tapped into rhythm.',
    baseCost: D(15),
    baseRate: D(0.5),
    costGrowth: D(1.15),
  },
  {
    id: 'pulse',
    name: 'Pulse Relay',
    flavor: 'Beats like a slow stellar heart.',
    baseCost: D(250),
    baseRate: D(6),
    costGrowth: D(1.15),
  },
  {
    id: 'beam',
    name: 'Beam Relay',
    flavor: 'A needle of light through the dark.',
    baseCost: D(5000),
    baseRate: D(80),
    costGrowth: D(1.15),
  },
  {
    id: 'nova',
    name: 'Nova Relay',
    flavor: 'A flash from a dying star.',
    baseCost: D(100000),
    baseRate: D(50000),
    costGrowth: D(1.12),
  },
]

export function getRelay(id: string): GeneratorDef | undefined {
  return RELAYS.find((r) => r.id === id)
}
