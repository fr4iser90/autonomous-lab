/**
 * EconomyEngine — the single source of truth for economy math.
 *
 * All currency math lives here (never in DOM click handlers). Big numbers are
 * decimal.js Decimals: no raw JS number beyond ~1e15.
 *
 * M2: Signal currency + click (+1).
 * M3: Relays (generators) — rising costs, production/sec via step(dt) at 20 Hz.
 * Upgrades (M6) and layers (M5) extend this without changing the click/buy path.
 */
import { Decimal } from 'decimal.js'
import { RELAYS, getRelay } from '../data/generators'

export interface EconomyState {
  /** Cosmic Signal — the base currency (harvested by clicking, produced by Relays). */
  signal: Decimal
  /** Owned relay counts by relay id. */
  relays: Record<string, number>
}

export function initialState(): EconomyState {
  return { signal: new Decimal(0), relays: {} }
}

export class EconomyEngine {
  readonly state: EconomyState

  constructor(state?: Partial<EconomyState>) {
    this.state = {
      signal: new Decimal(state?.signal ?? 0),
      relays: { ...(state?.relays ?? {}) },
    }
  }

  /** Harvest Signal by clicking. Default +1 per click (M2). */
  click(amount: Decimal.Value = 1): Decimal {
    const gained = new Decimal(amount)
    this.state.signal = this.state.signal.plus(gained)
    return gained
  }

  /** Cost of the next unit of a relay: baseCost * growth^owned (M3). */
  relayCost(id: string): Decimal {
    const def = getRelay(id)
    if (!def) throw new Error(`unknown relay: ${id}`)
    const owned = this.state.relays[id] ?? 0
    return def.baseCost.times(def.costGrowth.pow(owned))
  }

  /** Buy one relay unit if affordable. Returns the spent amount, or null. */
  buyRelay(id: string): Decimal | null {
    if (!getRelay(id)) return null
    const cost = this.relayCost(id)
    if (this.state.signal.lt(cost)) return null
    this.state.signal = this.state.signal.minus(cost)
    this.state.relays[id] = (this.state.relays[id] ?? 0) + 1
    return cost
  }

  /** Total Signal production per second (M3). */
  productionPerSec(): Decimal {
    let total = new Decimal(0)
    for (const def of RELAYS) {
      const owned = this.state.relays[def.id] ?? 0
      if (owned > 0) total = total.plus(def.baseRate.times(owned))
    }
    return total
  }

  /**
   * Advance the economy by dt seconds (20 Hz ticks in the live loop).
   * Production = rate × dt (fixed design, shared/design.md).
   */
  step(dt: number): void {
    const prod = this.productionPerSec()
    if (prod.gt(0)) this.state.signal = this.state.signal.plus(prod.times(dt))
  }
}
