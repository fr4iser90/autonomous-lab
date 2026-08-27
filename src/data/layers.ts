/**
 * Signal Ascent — Strata (layers) data.
 * `layerDef(N)` is the single procedural source for a layer's name, color,
 * flavor and ascend threshold. Phase 2 special layers (every 10th) get
 * distinct names/mechanics on top of this — the `special` flag is the hook.
 *
 * Ascend threshold from layer N → N+1: `1e6 × 10^(N-1)`
 * (1e6, 1e7, 1e8, …) — tuned by M5 soak / Phase 2.
 */
import { Decimal } from 'decimal.js'

/** Soft ceiling on layer id. Phase 4 raises this in bulk (+10 per cycle). */
export const LAYER_CAP = 50
/** Special (prestige-flavored) layers every N-th stratum. */
export const SPECIAL_EVERY = 10

const BASE_THRESHOLD = new Decimal(1e6)
/**
 * Threshold growth per layer — 3× (M9: lowered from 10× to prevent soft-locks).
 * BALANCE: ≤3–5× per layer; 10× caused simulateToLayer(10) to stall at layer 4.
 */
const GROWTH = new Decimal(3)

const PREFIXES = [
  'Echo', 'Halo', 'Drift', 'Veil', 'Cinder', 'Lumen', 'Zephyr', 'Nova', 'Ion', 'Prism',
  'Ember', 'Quasar', 'Nebula', 'Gale', 'Bloom', 'Shard', 'Mote', 'Slate', 'Aurel', 'Vesper',
]
/** One suffix per 20-layer generation keeps all names ≤ LAYER_CAP unique. */
const GENERATIONS = ['Hollow', 'Reach', 'Spire']
const FLAVORS = [
  'Where the first echoes settle.',
  'A thin membrane between hums.',
  'Signal light bends here.',
  'Old harmonics drift in slow orbits.',
  'The dark breathes at this depth.',
  'Resonance pools like water.',
  'Fragments of older ascents.',
  'The hum thickens into chord.',
  'Light arrives already answered.',
  'Every pulse remembers the last one.',
  'A hush with a pulse inside it.',
  'The stratum that sings itself.',
]

export interface LayerDef {
  /** 1-based stratum id. */
  id: number
  name: string
  flavor: string
  /** UI accent (procedural hue, golden-angle step). */
  color: string
  /** Signal required to ascend from this layer to the next. */
  threshold: Decimal
  /** True every SPECIAL_EVERY-th stratum (Phase 2 gives them mechanics). */
  special: boolean
}

export function layerDef(n: number): LayerDef {
  if (!Number.isInteger(n) || n < 1 || n > LAYER_CAP) {
    throw new Error(`layerDef: N must be an integer in 1..${LAYER_CAP}, got ${n}`)
  }
  const i = n - 1
  const hue = Math.round((i * 137.5) % 360)
  return {
    id: n,
    name: `${PREFIXES[i % PREFIXES.length]} ${GENERATIONS[Math.floor(i / PREFIXES.length)]}`,
    flavor: FLAVORS[i % FLAVORS.length],
    color: `hsl(${hue}, 68%, 62%)`,
    threshold: BASE_THRESHOLD.times(GROWTH.pow(i)),
    special: n % SPECIAL_EVERY === 0,
  }
}
