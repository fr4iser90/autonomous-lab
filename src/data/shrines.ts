/** Shrine definitions — P4-2: sacred shrines that grant buffs when activated. */

export type ShrineType = 'heal' | 'buff' | 'shield'

export interface ShrineDef {
  type: ShrineType
  label: string
  emoji: string
  color: string
  emissive: string
  /** Heal percentage of max HP */
  healPct?: number
  /** Damage bonus added to player */
  damageBonus?: number
  /** Damage reduction added to player */
  armorBonus?: number
  /** Duration in seconds for timed buffs */
  duration?: number
}

export const SHRINE_DEFS: Record<ShrineType, ShrineDef> = {
  heal: {
    type: 'heal',
    label: 'Healing Shrine',
    emoji: '💚',
    color: '#22cc66',
    emissive: '#44ff88',
    healPct: 0.3,
  },
  buff: {
    type: 'buff',
    label: 'Battle Shrine',
    emoji: '⚡',
    color: '#ffaa22',
    emissive: '#ffdd44',
    damageBonus: 2,
    duration: 30,
  },
  shield: {
    type: 'shield',
    label: 'Warding Shrine',
    emoji: '🛡️',
    color: '#4488ff',
    emissive: '#66aaff',
    armorBonus: 2,
    duration: 20,
  },
}

/** Pick a random shrine type for placement */
export function randomShrineType(): ShrineType {
  const types: ShrineType[] = ['heal', 'buff', 'shield']
  return types[Math.floor(Math.random() * types.length)]
}

/** Apply shrine effect to player state. Returns log message. */
export function activateShrine(
  type: ShrineType,
  currentHP: number,
  maxHP: number,
  setStatusEffect: (effect: { type: string; ticksLeft: number; damageReduction: number; slowFactor: number }) => void,
): { newHP: number; message: string } {
  const def = SHRINE_DEFS[type]
  switch (type) {
    case 'heal': {
      const healAmt = Math.floor(maxHP * (def.healPct || 0.3))
      const newHP = Math.min(maxHP, currentHP + healAmt)
      return { newHP, message: `${def.emoji} ${def.label}: +${healAmt} HP!` }
    }
    case 'buff': {
      setStatusEffect({ type: 'buff', ticksLeft: def.duration || 30, damageReduction: 0, slowFactor: 1 })
      return { newHP: currentHP, message: `${def.emoji} ${def.label}: +${def.damageBonus} DMG for ${(def.duration || 30)}s!` }
    }
    case 'shield': {
      setStatusEffect({ type: 'shield', ticksLeft: def.duration || 20, damageReduction: def.armorBonus || 2, slowFactor: 1 })
      return { newHP: currentHP, message: `${def.emoji} ${def.label}: +${def.armorBonus} armor for ${(def.duration || 20)}s!` }
    }
  }
}
