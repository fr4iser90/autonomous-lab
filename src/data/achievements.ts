/**
 * Signal Ascent — Achievement system (M11).
 *
 * One-time unlock badges that track progress milestones.
 * Definitions live here; checks run in the engine each tick (shell calls
 * `checkAchievements()`); the view renders unlocked badges.
 *
 * Achievements are persistent — they survive resets/ascends because
 * the unlock flag is stored in the economy state (upgrades section).
 */
import type { EconomyState } from '../economy/engine'

export interface AchievementDef {
  id: string
  name: string
  description: string
  /** Human-readable progress hint (e.g. "Reach layer 10"). */
  progressHint: string
  /** Returns true when this achievement should be unlocked. */
  check: (state: EconomyState, totalRelays: number, totalClicks: number, currentLayer: number) => boolean
}

/**
 * Check a list of achievements against current engine state and return
 * which ones newly unlocked (were false before).
 *
 * Achievement flags are stored as boolean entries in `state.upgrades`
 * (reuse the same field — achievement ids are distinct from upgrade ids).
 * Returns the list of achievement ids that were just unlocked.
 */
export function checkAchievements(
  achievements: readonly AchievementDef[],
  state: EconomyState,
  totalRelays: number,
  totalClicks: number,
  currentLayer: number,
): string[] {
  const newlyUnlocked: string[] = []
  for (const def of achievements) {
    if (state.upgrades[def.id]) continue
    if (def.check(state, totalRelays, totalClicks, currentLayer)) {
      state.upgrades[def.id] = true
      newlyUnlocked.push(def.id)
    }
  }
  return newlyUnlocked
}

/** Whether an achievement is unlocked. */
export function isAchievementUnlocked(state: EconomyState, id: string): boolean {
  return state.upgrades[id] === true
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  {
    id: 'ach-first-click',
    name: 'First Spark',
    description: 'Harvest your first Signal.',
    progressHint: 'Click "Harvest Signal" once',
    check: (_state, _relays, clicks) => clicks >= 1,
  },
  {
    id: 'ach-first-relay',
    name: 'First Relay',
    description: 'Buy your first Relay.',
    progressHint: 'Buy a Whisper Relay',
    check: (state) => (state.relays.whisper ?? 0) >= 1,
  },
  {
    id: 'ach-first-pulse',
    name: 'Pulse Starter',
    description: 'Buy your first Pulse Relay.',
    progressHint: 'Buy a Pulse Relay',
    check: (state) => (state.relays.pulse ?? 0) >= 1,
  },
  {
    id: 'ach-first-beam',
    name: 'Beam Alignment',
    description: 'Buy your first Beam Relay.',
    progressHint: 'Buy a Beam Relay',
    check: (state) => (state.relays.beam ?? 0) >= 1,
  },
  {
    id: 'ach-first-nova',
    name: 'Nova Ignition',
    description: 'Buy your first Nova Relay.',
    progressHint: 'Buy a Nova Relay',
    check: (state) => (state.relays.nova ?? 0) >= 1,
  },
  {
    id: 'ach-first-ascend',
    name: 'First Ascent',
    description: 'Ascend to layer 2 for the first time.',
    progressHint: 'Reach the ascend threshold and press Ascend',
    check: (_state, _relays, _clicks, layer) => layer >= 2,
  },
  {
    id: 'ach-layer-5',
    name: 'Stratum Climber',
    description: 'Reach layer 5.',
    progressHint: 'Ascend through 4 layers',
    check: (_state, _relays, _clicks, layer) => layer >= 5,
  },
  {
    id: 'ach-layer-10',
    name: 'Echo Walker',
    description: 'Ascend from the Echo Layer (layer 10) for the bonus Harmonic.',
    progressHint: 'Reach layer 10 and ascend',
    check: (_state, _relays, _clicks, layer) => layer >= 10,
  },
  {
    id: 'ach-100-relays',
    name: 'Signal Architect',
    description: 'Own 100 total Relays.',
    progressHint: 'Buy 100 Relays across all tiers',
    check: (_state, relays) => relays >= 100,
  },
  {
    id: 'ach-1000-clicks',
    name: 'Persistent Ascenter',
    description: 'Click "Harvest Signal" 1 000 times.',
    progressHint: 'Click the harvest button 1 000 times',
    check: (_state, _relays, clicks) => clicks >= 1_000,
  },
]

export const ACHIEVEMENT_COUNT = ACHIEVEMENTS.length
