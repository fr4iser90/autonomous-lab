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
]

export function getThemeById(id: string): FloorTheme | undefined {
  return FLOOR_THEMES.find(t => t.id === id)
}

export function getThemeForFloor(floor: number): FloorTheme {
  if (floor <= 3) return FLOOR_THEMES[0] // ash
  return FLOOR_THEMES[1] // crypt
}
