/**
 * EconomyEngine — the single source of truth for economy math.
 *
 * All currency math lives here (never in DOM click handlers). Big numbers are
 * decimal.js Decimals: no raw JS number beyond ~1e15.
 *
 * M2 scope: Signal currency + click (+1). Generators (M3), upgrades (M6) and
 * layers (M5) extend `EconomyState`/step without changing the click path.
 */
import { Decimal } from 'decimal.js'

export interface EconomyState {
  /** Cosmic Signal — the base currency (harvested by clicking, produced by Relays). */
  signal: Decimal
}

export function initialState(): EconomyState {
  return { signal: new Decimal(0) }
}

export class EconomyEngine {
  readonly state: EconomyState

  constructor(state?: Partial<EconomyState>) {
    this.state = {
      signal: new Decimal(state?.signal ?? 0),
    }
  }

  /** Harvest Signal by clicking. Default +1 per click (M2). */
  click(amount: Decimal.Value = 1): Decimal {
    const gained = new Decimal(amount)
    this.state.signal = this.state.signal.plus(gained)
    return gained
  }

  /**
   * Advance the economy by dt seconds (20 Hz ticks in the live loop).
   * M2: no production yet — kept so M3 generators plug in without API churn.
   */
  step(_dt: number): void {
    // M3: signal += sum(generator output) * dt
  }
}
