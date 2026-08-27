/**
 * Signal Ascent — Special layers data (M11).
 *
 * Layer 10 is a special "Echo" layer: ascending from it grants an extra
 * Harmonic (Echo Bonus) as a milestone reward.  The bonus is flat (+1)
 * and does not scale — it exists purely to make layer 10 feel distinct
 * from the surrounding strata.
 *
 * Phase 2 will add more special layers at 20, 30, 40, 50.
 */
export interface SpecialLayerDef {
  /** Layer id that has special mechanics. */
  layer: number
  /** Short name used in UI. */
  name: string
  /** Flavor text explaining the special mechanic. */
  flavor: string
  /**
   * Extra harmonics granted when ascending from this layer, on top of the
   * standard `harmonicReward(signal, threshold)` formula.
   */
  echoBonus: number
}

/** Layer 10 — "Echo Layer": ascending grants +1 bonus Harmonic. */
export const SPECIAL_LAYERS: ReadonlyArray<SpecialLayerDef> = [
  {
    layer: 10,
    name: 'Echo Layer',
    flavor:
      'A celestial echo — ascend here to carry the resonance forward.',
    echoBonus: 1,
  },
]

export function getSpecialLayer(n: number): SpecialLayerDef | undefined {
  return SPECIAL_LAYERS.find((s) => s.layer === n)
}

/**
 * Return the echo bonus for ascending from the given layer, if any.
 * 0 for ordinary layers.
 */
export function echoBonusFor(layer: number): number {
  const special = getSpecialLayer(layer)
  return special ? special.echoBonus : 0
}

/**
 * Build a combined "flavor" string for a special layer:
 * `layerDef(N) flavor` + `— "special flavor"`.
 * Returns plain layerDef flavor for non-special layers.
 */
export function specialFlavor(n: number, baseFlavor: string): string {
  const special = getSpecialLayer(n)
  if (!special) return baseFlavor
  return `${baseFlavor} — ${special.flavor}`
}
