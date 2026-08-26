/**
 * BOILERPLATE_TOY — scaffold economy demo only. Delete or replace when the real game starts.
 * See BOILERPLATE.md. Not product fantasy.
 *
 * Pure economy step used by the UI and unit tests.
 * Keep production math out of DOM handlers.
 */
export type EconomyState = {
  energy: number
  perTick: number
}

export function createEconomy(perTick = 0): EconomyState {
  return { energy: 0, perTick }
}

/**
 * Advance the economy by one fixed tick.
 * @param state Current balances and rates
 * @returns Next state (new object)
 */
export function step(state: EconomyState): EconomyState {
  return {
    energy: state.energy + state.perTick,
    perTick: state.perTick,
  }
}

/**
 * Manual harvest click: +1 energy and +0.1 passive rate.
 * @param state Current balances and rates
 * @returns Next state (new object)
 */
export function harvest(state: EconomyState): EconomyState {
  return {
    energy: state.energy + 1,
    perTick: Number((state.perTick + 0.1).toFixed(2)),
  }
}

/**
 * Format a balance for the HUD.
 * @param value Numeric balance
 * @returns Display string
 */
export function formatEnergy(value: number): string {
  if (!Number.isFinite(value)) return '0'
  if (Math.abs(value) < 1000) return value.toFixed(value % 1 === 0 ? 0 : 1)
  return value.toExponential(2)
}
