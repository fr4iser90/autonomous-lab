/** Status effects — P7-1: poison, burn, freeze, shield. */

export type StatusId = 'poison' | 'burn' | 'freeze' | 'shield'

export interface StatusEffect {
  type: StatusId
  ticksLeft: number // number of game-loop ticks remaining
  damagePerTick: number // DOT damage (0 for non-DOT effects)
  tickInterval: number // seconds between DOT ticks
  slowFactor: number // 0-1 speed multiplier (1 = no slow)
  damageReduction: number // flat damage reduction
  label: string
  emoji: string
  color: string // HUD indicator color
}

export const STATUS_DEFS: Record<StatusId, Pick<StatusEffect, 'label' | 'emoji' | 'color'>> = {
  poison: { label: 'Poison', emoji: '🧪', color: '#44ff44' },
  burn:   { label: 'Burn',   emoji: '🔥', color: '#ff8800' },
  freeze: { label: 'Frozen', emoji: '❄️', color: '#88ccff' },
  shield: { label: 'Shield', emoji: '🛡️', color: '#8888ff' },
}

/** Create a poison effect: 3 DOT ticks, 2 dmg each, 0.5s interval */
export function poison(durationSecs = 3.0, damagePerTick = 2): StatusEffect {
  return {
    type: 'poison',
    ticksLeft: Math.ceil(durationSecs),
    damagePerTick,
    tickInterval: 0.5,
    slowFactor: 1,
    damageReduction: 0,
    label: STATUS_DEFS.poison.label,
    emoji: STATUS_DEFS.poison.emoji,
    color: STATUS_DEFS.poison.color,
  }
}

/** Create a burn effect: 4 DOT ticks, 3 dmg each, 0.5s interval */
export function burn(durationSecs = 2.0, damagePerTick = 3): StatusEffect {
  return {
    type: 'burn',
    ticksLeft: Math.ceil(durationSecs),
    damagePerTick,
    tickInterval: 0.5,
    slowFactor: 1,
    damageReduction: 0,
    label: STATUS_DEFS.burn.label,
    emoji: STATUS_DEFS.burn.emoji,
    color: STATUS_DEFS.burn.color,
  }
}

/** Create a freeze effect: no DOT, 50% speed slow, 3s duration */
export function freeze(durationSecs = 3.0, slowFactor = 0.5): StatusEffect {
  return {
    type: 'freeze',
    ticksLeft: Math.ceil(durationSecs),
    damagePerTick: 0,
    tickInterval: 1,
    slowFactor,
    damageReduction: 0,
    label: STATUS_DEFS.freeze.label,
    emoji: STATUS_DEFS.freeze.emoji,
    color: STATUS_DEFS.freeze.color,
  }
}

/** Create a shield effect: no DOT, 3 flat damage reduction, 5s duration */
export function shield(durationSecs = 5.0, damageReduction = 3): StatusEffect {
  return {
    type: 'shield',
    ticksLeft: Math.ceil(durationSecs),
    damagePerTick: 0,
    tickInterval: 1,
    slowFactor: 1,
    damageReduction,
    label: STATUS_DEFS.shield.label,
    emoji: STATUS_DEFS.shield.emoji,
    color: STATUS_DEFS.shield.color,
  }
}
