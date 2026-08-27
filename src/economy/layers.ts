/**
 * LayerEngine — stratum state machine (M5).
 * Tracks the current layer and exposes the ascend threshold check.
 * M8 adds the Ascend action proper (Signal wipe + Harmonics reward);
 * until then `ascend()` only advances when the threshold is met.
 */
import { Decimal } from 'decimal.js'
import { LAYER_CAP, layerDef, type LayerDef } from '../data/layers'

export interface LayerState {
  /** Current stratum, 1-based, ≤ LAYER_CAP. */
  layer: number
}

export function clampLayer(n: number): number {
  // ±Infinity (corrupt save): +∞ → cap, −∞/NaN → layer 1.
  if (!Number.isFinite(n)) return n > 0 ? LAYER_CAP : 1
  const v = Math.floor(n)
  return Math.min(LAYER_CAP, Math.max(1, v))
}

export class LayerEngine {
  readonly state: LayerState

  constructor(state?: Partial<LayerState>) {
    this.state = { layer: clampLayer(state?.layer ?? 1) }
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
   * Advance one layer if the threshold is met. Returns false (no-op) at the
   * cap or below the threshold. M8 will consume Signal + grant Harmonics here.
   */
  ascend(signal: Decimal.Value): boolean {
    if (!this.next || !this.canAscend(signal)) return false
    this.state.layer += 1
    return true
  }
}
