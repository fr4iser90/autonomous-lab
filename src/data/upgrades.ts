/**
 * Resonator upgrades (M6) — one-time purchases that amplify the economy.
 * Costs/effects live here (data), applied by EconomyEngine (never the DOM).
 *
 * Effect kinds:
 *  - click-mult:  multiplies Signal per click by `value`
 *  - relay-mult:  multiplies one relay's output by `value`
 *  - global-mult: multiplies ALL relay production by `value`
 */
import { Decimal } from 'decimal.js'

export type UpgradeEffect =
  | { kind: 'click-mult'; value: number }
  | { kind: 'relay-mult'; relayId: string; value: number }
  | { kind: 'global-mult'; value: number }

export interface UpgradeDef {
  readonly id: string
  readonly name: string
  readonly flavor: string
  readonly cost: Decimal
  readonly effect: UpgradeEffect
}

export const UPGRADES: readonly UpgradeDef[] = [
  {
    id: 'amp',
    name: 'Amplified Tap',
    flavor: 'Your clicks echo one octave higher.',
    cost: new Decimal(100),
    effect: { kind: 'click-mult', value: 2 },
  },
  {
    id: 'overdrive',
    name: 'Overdrive',
    flavor: 'Every tap rings like a struck bell.',
    cost: new Decimal(10_000),
    effect: { kind: 'click-mult', value: 5 },
  },
  {
    id: 'whisper-harmonics',
    name: 'Whisper Harmonics',
    flavor: 'The whisperers sing in tune.',
    cost: new Decimal(500),
    effect: { kind: 'relay-mult', relayId: 'whisper', value: 2 },
  },
  {
    id: 'pulse-resonance',
    name: 'Pulse Resonance',
    flavor: 'Pulses stack into standing waves.',
    cost: new Decimal(5_000),
    effect: { kind: 'relay-mult', relayId: 'pulse', value: 2 },
  },
  {
    id: 'beam-alignment',
    name: 'Beam Alignment',
    flavor: 'The beams find the same crack in the sky.',
    cost: new Decimal(50_000),
    effect: { kind: 'relay-mult', relayId: 'beam', value: 2 },
  },
  {
    id: 'global-resonance',
    name: 'Global Resonance',
    flavor: 'Everything hums at the same frequency.',
    cost: new Decimal(25_000),
    effect: { kind: 'global-mult', value: 1.5 },
  },
  // Cycle 2 — P4-1 FEATURE: new upgrades with global + relay-burst
  {
    id: 'nova-cascade',
    name: 'Nova Cascade',
    flavor: 'The nova becomes a cascade of light.',
    cost: new Decimal(1_000_000),
    effect: { kind: 'relay-mult', relayId: 'nova', value: 3 },
  },
  {
    id: 'echo-burst',
    name: 'Echo Burst',
    flavor: 'Every echo collapses into a single chord.',
    cost: new Decimal(5_000_000),
    effect: { kind: 'global-mult', value: 2 },
  },
  // Cycle 3 — P4-1 FEATURE: mid-to-high tier upgrades (fill gaps in 100K–1M range)
  {
    id: 'cascade-tap',
    name: 'Cascade Tap',
    flavor: 'Each tap spawns a cascade of harmonics.',
    cost: new Decimal(100_000),
    effect: { kind: 'click-mult', value: 10 },
  },
  {
    id: 'echo-harmonics',
    name: 'Echo Harmonics',
    flavor: 'The whispers find their echo chamber.',
    cost: new Decimal(50_000),
    effect: { kind: 'relay-mult', relayId: 'whisper', value: 5 },
  },
  {
    id: 'pulse-chorus',
    name: 'Pulse Chorus',
    flavor: 'Pulses synchronize into a grand chorus.',
    cost: new Decimal(250_000),
    effect: { kind: 'relay-mult', relayId: 'pulse', value: 5 },
  },
  {
    id: 'beam-coherence',
    name: 'Beam Coherence',
    flavor: 'Beams lock phase, forming a coherent wavefront.',
    cost: new Decimal(1_000_000),
    effect: { kind: 'relay-mult', relayId: 'beam', value: 5 },
  },
  {
    id: 'symphony',
    name: 'Symphony',
    flavor: 'All frequencies resolve into one symphony.',
    cost: new Decimal(500_000),
    effect: { kind: 'global-mult', value: 3 },
  },
]

export function getUpgrade(id: string): UpgradeDef | undefined {
  return UPGRADES.find((u) => u.id === id)
}
