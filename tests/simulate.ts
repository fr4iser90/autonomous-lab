/**
 * Headless depth simulation — the "depth truth" (shared/design.md).
 *
 * `simulateToLayer(target, seed?)` plays the real EconomyEngine + LayerEngine
 * forward (fixed dt, no DOM) with a deterministic strategy and a seeded RNG,
 * and reports whether the target stratum is reachable without NaN/Infinity.
 * Same target + seed → identical report (Phase 2b invariant).
 */
import { EconomyEngine } from '../src/economy/engine'
import { LayerEngine } from '../src/economy/layers'
import { LAYER_CAP } from '../src/data/layers'
import { RELAYS } from '../src/data/generators'

export interface SimOptions {
  /** RNG seed (default 0). Drives click jitter; 0 = fully deterministic. */
  seed?: number
  /** Step size in seconds (default 0.05 = one 20 Hz tick). */
  dt?: number
  /** Hard tick budget before the sim reports failure (default 2_000_000). */
  maxTicks?: number
  /** Simulated clicks per second (default 1 — a light human hand). */
  clickRate?: number
}

export interface SimReport {
  ok: boolean
  target: number
  reached: number
  ticks: number
  seconds: number
  signal: string
  relays: Record<string, number>
  fail: string | null
}

/** mulberry32 — tiny deterministic PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function simulateToLayer(target: number, options: SimOptions = {}): SimReport {
  if (!Number.isInteger(target) || target < 1 || target > LAYER_CAP) {
    throw new Error(`simulateToLayer: target must be an integer in 1..${LAYER_CAP}, got ${target}`)
  }
  const seed = options.seed ?? 0
  const dt = options.dt ?? 0.05
  const maxTicks = options.maxTicks ?? 2_000_000
  const clickRate = options.clickRate ?? 1
  const rng = mulberry32(seed)

  const economy = new EconomyEngine()
  const layers = new LayerEngine()
  const report = (fail: string | null): SimReport => ({
    ok: fail === null && layers.state.layer >= target && economy.state.signal.isFinite(),
    target,
    reached: layers.state.layer,
    ticks: 0, // patched below
    seconds: 0,
    signal: economy.state.signal.toString(),
    relays: { ...economy.state.relays },
    fail,
  })

  // Cached next-unit costs: only the just-bought relay's cost changes,
  // so a single `1.15^owned` pow per buy instead of ~150 per tick.
  const costs = RELAYS.map((r) => economy.relayCost(r.id))
  const cheapest = () => {
    let m = costs[0]
    for (let i = 1; i < costs.length; i++) if (costs[i].lt(m)) m = costs[i]
    return m
  }

  let ticks = 0
  for (;;) {
    if (layers.state.layer >= target) break
    if (ticks >= maxTicks) {
      const r = report('maxTicks exceeded')
      r.ticks = ticks
      r.seconds = ticks * dt
      return r
    }
    // Light human clicking: one click per 1/clickRate seconds, seeded jitter.
    if (clickRate > 0 && rng() < dt * clickRate) economy.click(1)

    economy.step(dt)
    ticks += 1

    // Buy as much as possible this tick: highest tier affordable, up to 50 buys.
    if (economy.state.signal.gte(cheapest())) {
      for (let buys = 0; buys < 50; buys++) {
        let idx = -1
        for (let i = RELAYS.length - 1; i >= 0; i--) {
          if (economy.state.signal.gte(costs[i])) {
            idx = i
            break
          }
        }
        if (idx < 0) break
        if (economy.buyRelay(RELAYS[idx].id) !== null) {
          costs[idx] = economy.relayCost(RELAYS[idx].id)
        } else {
          break
        }
      }
    }

    // Ascend the moment the threshold is met (repeat for multi-layer gaps).
    while (layers.next !== null && layers.canAscend(economy.state.signal)) {
      if (!layers.ascend(economy.state.signal)) break
    }

    // Invariant: no NaN/Infinity anywhere along the way.
    if (ticks % 1000 === 0 && !economy.state.signal.isFinite()) {
      const r = report('non-finite signal during sim')
      r.ticks = ticks
      r.seconds = ticks * dt
      return r
    }
  }

  const r = report(null)
  r.ticks = ticks
  r.seconds = ticks * dt
  return r
}
