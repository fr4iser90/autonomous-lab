/** Floor theme definitions — 16 themes, CAP reached */

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
    id: 'crystal-cave',
    name: 'Crystal Cave',
    floorColors: {
      floor: '#1a2030',
      wall: '#101825',
      wallHighlight: '#3a4a60',
      fog: '#0a0e18',
      bg: '#0a0e18',
    },
    propTypes: ['torch', 'crystal-cluster', 'glow-moss'],
  },
  {
    id: 'jungle',
    name: 'Jungle Temple',
    floorColors: {
      floor: '#202a15',
      wall: '#152010',
      wallHighlight: '#304020',
      fog: '#0a0e08',
      bg: '#0a0e08',
    },
    propTypes: ['torch', 'vine', 'mossy-statue'],
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
    propTypes: ['torch', 'lava-pool', 'obsidian-spire'],
  },
  {
    id: 'ice-cave',
    name: 'Glacial Ice Cave',
    floorColors: {
      floor: '#1a2835',
      wall: '#10202a',
      wallHighlight: '#304858',
      fog: '#0a0e14',
      bg: '#0a0e14',
    },
    propTypes: ['torch', 'ice-shard', 'frost-arch'],
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
    propTypes: ['torch', 'reed', 'rotting-log'],
  },
  {
    id: 'dark-forest',
    name: 'Dark Forest Hollow',
    floorColors: {
      floor: '#1e2018',
      wall: '#141610',
      wallHighlight: '#2a2d22',
      fog: '#0a0c08',
      bg: '#0a0c08',
    },
    propTypes: ['torch', 'gnarled-root', 'haunted-stump'],
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
    propTypes: ['torch', 'icicle', 'frozen-chalice'],
  },
  {
    id: 'volcanic',
    name: 'Volcanic Forge',
    floorColors: {
      floor: '#2a1810',
      wall: '#1a0e08',
      wallHighlight: '#3a2818',
      fog: '#120a06',
      bg: '#120a06',
    },
    propTypes: ['torch', 'forge-anvil', 'ember-pit'],
  },
  {
    id: 'sky-temple',
    name: 'Sky Temple',
    floorColors: {
      floor: '#28283a',
      wall: '#1e1e30',
      wallHighlight: '#3e3e55',
      fog: '#121220',
      bg: '#121220',
    },
    propTypes: ['torch', 'floating-platform', 'cloud-column'],
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
    propTypes: ['torch', 'rift', 'void-crystal'],
  },
  {
    id: 'shadow-realm',
    name: 'Shadow Realm',
    floorColors: {
      floor: '#121018',
      wall: '#0a0810',
      wallHighlight: '#22202a',
      fog: '#040408',
      bg: '#040408',
    },
    propTypes: ['torch', 'shadow-pool', 'wraith-banner'],
  },
  {
    id: 'celestial',
    name: 'Celestial Arena',
    floorColors: {
      floor: '#2a2838',
      wall: '#1e1c2c',
      wallHighlight: '#4a4860',
      fog: '#100e18',
      bg: '#100e18',
    },
    propTypes: ['torch', 'celestial-ring', 'star-pillar'],
  },
  {
    id: 'abyssal',
    name: 'Abyssal Core',
    floorColors: {
      floor: '#1a0a15',
      wall: '#100510',
      wallHighlight: '#2a1520',
      fog: '#080208',
      bg: '#080208',
    },
    propTypes: ['torch', 'abyssal-tentacle', 'soul-fire'],
  },
]

export function getThemeById(id: string): FloorTheme | undefined {
  return FLOOR_THEMES.find(t => t.id === id)
}

export function getThemeForFloor(floor: number): FloorTheme {
  if (floor <= 1) return FLOOR_THEMES[0]      // ash
  if (floor <= 3) return FLOOR_THEMES[1]      // crypt
  if (floor <= 5) return FLOOR_THEMES[2]      // ruins
  if (floor <= 7) return FLOOR_THEMES[3]      // crystal-cave
  if (floor <= 9) return FLOOR_THEMES[4]      // jungle
  if (floor <= 11) return FLOOR_THEMES[5]     // magma
  if (floor <= 13) return FLOOR_THEMES[6]     // ice-cave
  if (floor <= 15) return FLOOR_THEMES[7]     // swamp
  if (floor <= 17) return FLOOR_THEMES[8]     // dark-forest
  if (floor <= 19) return FLOOR_THEMES[9]     // frozen
  if (floor <= 21) return FLOOR_THEMES[10]    // volcanic
  if (floor <= 23) return FLOOR_THEMES[11]    // sky-temple
  if (floor <= 25) return FLOOR_THEMES[12]    // void
  if (floor <= 27) return FLOOR_THEMES[13]    // shadow-realm
  if (floor <= 29) return FLOOR_THEMES[14]    // celestial
  return FLOOR_THEMES[15]                      // abyssal
}
