/** Trap definitions — P4-4: floor traps with damage and visual feedback. */

export enum TrapType {
  SPIKE = 'spike',
  POISON = 'poison',
  FIRE = 'fire',
}

export interface TrapDef {
  type: TrapType
  damage: number
  color: string
  emissive: string
  label: string
}

export const TRAP_DEFS: Record<TrapType, TrapDef> = {
  [TrapType.SPIKE]: {
    type: TrapType.SPIKE,
    damage: 5,
    color: '#888888',
    emissive: '#ff4444',
    label: 'Spike',
  },
  [TrapType.POISON]: {
    type: TrapType.POISON,
    damage: 3,
    color: '#448844',
    emissive: '#44ff44',
    label: 'Poison',
  },
  [TrapType.FIRE]: {
    type: TrapType.FIRE,
    damage: 7,
    color: '#aa5500',
    emissive: '#ff8800',
    label: 'Fire',
  },
}

/** Pick a random trap type for placement */
export function randomTrapType(): TrapType {
  const types = Object.values(TrapType)
  return types[Math.floor(Math.random() * types.length)]
}
