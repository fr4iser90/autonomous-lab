/** Floor theme definitions */

export interface FloorTheme {
  id: string
  name: string
  floorColors: {
    floor: string
    wall: string
    wallHighlight: string
    fog: string
    bg: string
  }
  propTypes: string[]
}

export const FLOOR_THEMES: FloorTheme[] = [
  {
    id: 'ash',
    name: 'Ash Stone Catacombs',
    floorColors: {
      floor: '#2a2520',
      wall: '#1a1815',
      wallHighlight: '#3a3530',
      fog: '#0a0a0e',
      bg: '#0a0a0e',
    },
    propTypes: ['torch', 'rubble', 'bone'],
  },
  {
    id: 'crypt',
    name: 'Ancient Crypt',
    floorColors: {
      floor: '#1e2a25',
      wall: '#15201a',
      wallHighlight: '#2a3a30',
      fog: '#0e1210',
      bg: '#0e1210',
    },
    propTypes: ['torch', 'pillar', 'sarcophagus'],
  },
  {
    id: 'ruins',
    name: 'Elven Ruins',
    floorColors: {
      floor: '#2a2830',
      wall: '#1a1a22',
      wallHighlight: '#3a3a48',
      fog: '#0a0a10',
      bg: '#0a0a10',
    },
    propTypes: ['torch', 'column', 'fountain'],
  },
  {
    id: 'magma',
    name: 'Magma Caverns',
    floorColors: {
      floor: '#2a1510',
      wall: '#1a0a08',
      wallHighlight: '#3a2015',
      fog: '#100806',
      bg: '#100806',
    },
    propTypes: ['torch', 'lava-pool', 'crystal'],
  },
  {
    id: 'swamp',
    name: 'Murky Swamp',
    floorColors: {
      floor: '#1a2515',
      wall: '#101a0c',
      wallHighlight: '#2a3520',
      fog: '#0e1508',
      bg: '#0e1508',
    },
    propTypes: ['torch', 'reed', 'mushroom'],
  },
  {
    id: 'frozen',
    name: 'Frozen Crypt',
    floorColors: {
      floor: '#1a2530',
      wall: '#101a25',
      wallHighlight: '#2a3a4a',
      fog: '#0a0e15',
      bg: '#0a0e15',
    },
    propTypes: ['torch', 'icicle', 'frozen-pool'],
  },
  {
    id: 'void',
    name: 'Void Nexus',
    floorColors: {
      floor: '#15101a',
      wall: '#0a0810',
      wallHighlight: '#2a2035',
      fog: '#06040a',
      bg: '#06040a',
    },
    propTypes: ['torch', 'rift', 'floating-shard'],
  },
]

export function getThemeById(id: string): FloorTheme | undefined {
  return FLOOR_THEMES.find(t => t.id === id)
}

export function getThemeForFloor(floor: number): FloorTheme {
  if (floor <= 3) return FLOOR_THEMES[0] // ash
  if (floor <= 6) return FLOOR_THEMES[1] // crypt
  if (floor <= 9) return FLOOR_THEMES[2] // ruins
  if (floor <= 12) return FLOOR_THEMES[3] // magma
  if (floor <= 15) return FLOOR_THEMES[4] // swamp
  if (floor <= 18) return FLOOR_THEMES[5] // frozen
  return FLOOR_THEMES[6] // void
}
