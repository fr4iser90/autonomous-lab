/**
 * LayerEngine — stratum state machine (M5).
 * Tracks the current layer and exposes the ascend threshold check.
 *
 * M8 adds the Ascend action proper: reaching the threshold lets the player
 * ascend — the layer advances and Harmonics are granted:
 * `floor(sqrt(signal / threshold))` (at least 1 when the threshold is met).
 * Harmonics are the permanent prestige currency: each one boosts ALL output
 * by +2% forever (stacking). The layer-slice wipe (Signal/Relays/Resonators)
 * is owned by EconomyEngine.resetLayerSlice(); the shell runs it after a
 * successful ascend.
 */
import { Decimal } from 'decimal.js'
import { LAYER_CAP, layerDef, type LayerDef } from '../data/layers'

export interface LayerState {
  /** Current stratum, 1-based, ≤ LAYER_CAP. */
  layer: number
  /** Harmonics earned from ascends (M8) — permanent, never reset. */
  harmonics: number
}

/** Permanent all-output bonus per Harmony (M8): +2%, stacking linearly. */
export const HARMONIC_BONUS = new Decimal(0.02)

export function clampLayer(n: number): number {
  // ±Infinity (corrupt save): +∞ → cap, −∞/NaN → layer 1.
  if (!Number.isFinite(n)) return n > 0 ? LAYER_CAP : 1
  const v = Math.floor(n)
  return Math.min(LAYER_CAP, Math.max(1, v))
}

/** Clamp a stored harmonics count (corrupt save safety). */
export function clampHarmonics(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

/**
 * Harmonics earned by ascending out of a layer with the given Signal total
 * (M8 → M9): floor((signal / threshold)^0.65). 0 below the threshold, ≥ 1 at it.
 *
 * M9 retune: power raised from 0.5 (sqrt) to 0.65 to give faster harmonic
 * growth through deeper layers, compensating for the steeper exponential
 * threshold curve (3× per layer).  The old sqrt was too shallow —
 * sim stalled at layer 4.
 */
export function harmonicReward(signal: Decimal.Value, threshold: Decimal.Value): number {
  const ratio = new Decimal(signal).div(threshold)
  if (!ratio.isFinite() || ratio.lt(1)) return 0
  return ratio.pow(0.65).floor().toNumber()
}

export class LayerEngine {
  readonly state: LayerState

  constructor(state?: Partial<LayerState>) {
    this.state = {
      layer: clampLayer(state?.layer ?? 1),
      harmonics: clampHarmonics(state?.harmonics ?? 0),
    }
  }

  /** Definition of the current layer. */
  get def(): LayerDef {
    return layerDef(this.state.layer)
  }

  /** Definition of the next layer, or null at LAYER_CAP. */
  get next(): LayerDef | null {
    return this.state.layer >= LAYER_CAP ? null : layerDef(this.state.layer + 1)
  }

  /** Can the given Signal total ascend from the current layer? */
  canAscend(signal: Decimal.Value): boolean {
    return new Decimal(signal).gte(this.def.threshold)
  }

  /**
   * Ascend one stratum (M8): requires the threshold, grants
   * floor(sqrt(signal / threshold)) Harmonics, and advances the layer.
   * Returns false (no-op) at the cap or below the threshold.
   */
  ascend(signal: Decimal.Value): boolean {
    if (!this.next || !this.canAscend(signal)) return false
    this.state.harmonics += harmonicReward(signal, this.def.threshold)
    this.state.layer += 1
    return true
  }

  /**
   * Permanent all-output multiplier from owned Harmonics (M8 → M9):
   * (1 + HARMONIC_BONUS)^h — exponential compounding.
   *
   * M9: switched from linear `1 + 0.02*h` to exponential `(1.02)^h`
   * so higher harmonic counts scale faster, enabling multi-layer
   * progression within the sim tick budget.
   */
  harmonicMult(): Decimal {
    return new Decimal(1).plus(HARMONIC_BONUS).pow(this.state.harmonics)
  }
}
