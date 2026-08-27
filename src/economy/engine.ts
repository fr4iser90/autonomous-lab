/**
 * EconomyEngine — the single source of truth for economy math.
 *
 * All currency math lives here (never in DOM click handlers). Big numbers are
 * decimal.js Decimals: no raw JS number beyond ~1e15.
 *
 * M2: Signal currency + click (+1).
 * M3: Relays (generators) — rising costs, production/sec via step(dt) at 20 Hz.
 * M6: Resonator upgrades — one-time multipliers for click / relay / global output.
 * M8: Ascend (prestige) support — `resetLayerSlice()` wipes the layer economy
 *     on ascend, and the permanent Harmonic multiplier (owned by the
 *     LayerEngine) is injected here via `setHarmonicMult()` so all output math
 *     stays in one engine.
 * M9: harmonicMult is exponential `(1.02)^h` (was `1 + 0.02*h`), enabling
 *     meaningful compounding through deeper layers.
 */
import { Decimal } from 'decimal.js'
import { RELAYS, getRelay } from '../data/generators'
import { UPGRADES, getUpgrade } from '../data/upgrades'

export interface EconomyState {
  /** Cosmic Signal — the base currency (harvested by clicking, produced by Relays). */
  signal: Decimal
  /** Owned relay counts by relay id. */
  relays: Record<string, number>
  /** Owned Resonator upgrade ids (M6). */
  upgrades: Record<string, boolean>
  /** Auto-ascend toggle (M11): when true, ascend immediately when threshold met. */
  autoAscend?: boolean
}

export function initialState(): EconomyState {
  return { signal: new Decimal(0), relays: {}, upgrades: {}, autoAscend: false }
}

export class EconomyEngine {
  readonly state: EconomyState

  /**
   * Permanent all-output multiplier from Harmonics (M8). Owned by the
   * LayerEngine; the shell injects it after load and after each ascend.
   * Non-finite or sub-1 values are rejected (kept at the previous value).
   */
  harmonicMult: Decimal

  constructor(state?: Partial<EconomyState>, harmonicMult?: Decimal.Value) {
    this.state = {
      signal: new Decimal(state?.signal ?? 0),
      relays: { ...(state?.relays ?? {}) },
      upgrades: { ...(state?.upgrades ?? {}) },
      autoAscend: state?.autoAscend ?? false,
    }
    this.harmonicMult = new Decimal(1)
    this.setHarmonicMult(harmonicMult ?? 1)
  }

  /** Replace the injected Harmonic multiplier (M8); rejects corrupt values. */
  setHarmonicMult(value: Decimal.Value): void {
    let next: Decimal
    try {
      next = new Decimal(value)
    } catch {
      return
    }
    if (next.isFinite() && next.gte(1)) this.harmonicMult = next
  }

  /** Signal gained per click (M2 base +1, amplified by click upgrades — M6, Harmonics — M8). */
  clickPower(): Decimal {
    let power = new Decimal(1)
    for (const def of UPGRADES) {
      if (!this.state.upgrades[def.id]) continue
      if (def.effect.kind === 'click-mult') power = power.times(def.effect.value)
    }
    return power.times(this.harmonicMult)
  }

  /** Harvest Signal by clicking. Base amount amplified by click upgrades (M6). */
  click(amount: Decimal.Value = 1): Decimal {
    const gained = new Decimal(amount).times(this.clickPower())
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

  /**
   * Buy as many units of a relay as affordable in a single call (M10).
   * Purchases greedily: each iteration buys one unit at the current cost.
   * Returns the total Signal spent, or 0 if nothing was affordable.
   */
  buyMaxRelay(id: string): Decimal {
    let total = new Decimal(0)
    let spent: Decimal | null
    for (;;) {
      spent = this.buyRelay(id)
      if (spent) total = total.plus(spent)
      else break
    }
    return total
  }

  /** Output multiplier for one relay from its Resonator upgrades (M6). */
  relayMult(relayId: string): Decimal {
    let mult = new Decimal(1)
    for (const def of UPGRADES) {
      const eff = def.effect
      if (this.state.upgrades[def.id] && eff.kind === 'relay-mult' && eff.relayId === relayId) {
        mult = mult.times(eff.value)
      }
    }
    return mult
  }

  /** Multiplier applied to ALL relay output from global upgrades (M6). */
  globalMult(): Decimal {
    let mult = new Decimal(1)
    for (const def of UPGRADES) {
      if (this.state.upgrades[def.id] && def.effect.kind === 'global-mult') {
        mult = mult.times(def.effect.value)
      }
    }
    return mult
  }

  /** Whether a Resonator upgrade is already owned (M6). */
  isUpgradeOwned(id: string): boolean {
    return this.state.upgrades[id] === true
  }

  /** Buy a one-time Resonator upgrade if affordable. Returns cost spent, or null (M6). */
  buyUpgrade(id: string): Decimal | null {
    const def = getUpgrade(id)
    if (!def || this.isUpgradeOwned(id)) return null
    if (this.state.signal.lt(def.cost)) return null
    this.state.signal = this.state.signal.minus(def.cost)
    this.state.upgrades[id] = true
    return def.cost
  }

  /**
   * Total Signal production per second (M3), amplified by Resonator upgrades
   * (M6) and the permanent Harmonic multiplier (M8).
   */
  productionPerSec(): Decimal {
    let total = new Decimal(0)
    for (const def of RELAYS) {
      const owned = this.state.relays[def.id] ?? 0
      if (owned > 0) total = total.plus(def.baseRate.times(owned).times(this.relayMult(def.id)))
    }
    return total.times(this.globalMult()).times(this.harmonicMult)
  }

  /**
   * Wipe the current layer's economy slice on ascend (M8): Signal, Relays,
   * and Resonator upgrades reset to zero. Harmonics live in the LayerEngine
   * and persist across ascends.
   */
  resetLayerSlice(): void {
    this.state.signal = new Decimal(0)
    this.state.relays = {}
    this.state.upgrades = {}
  }

  /**
   * Toggle auto-ascend on/off (M11). When enabled, the shell should call
   * `layers.ascend()` each tick once the threshold is met.
   */
  toggleAutoAscend(): void {
    this.state.autoAscend = !this.state.autoAscend
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
