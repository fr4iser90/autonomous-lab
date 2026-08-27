/** Item definitions for Ashen Delve */

export interface ItemDef {
  id: string
  name: string
  description: string
  type: 'weapon' | 'potion' | 'key' | 'armor'
  value: number // stat bonus (damage for weapons, heal for potions, etc.)
  icon: string // ASCII icon for inventory
}

export const ITEMS: ItemDef[] = [
  { id: 'rusty-sword', name: 'Rusty Sword', description: 'A worn blade. Better than nothing.', type: 'weapon', value: 3, icon: '⚔️' },
  { id: 'iron-axe', name: 'Iron Axe', description: 'Sturdy axe for chipping through ash-stone.', type: 'weapon', value: 5, icon: '🪓' },
  { id: 'flame-staff', name: 'Flame Staff', description: 'A staff with ember trapped within.', type: 'weapon', value: 7, icon: '🔥' },
  { id: 'health-potion', name: 'Health Potion', description: 'Restores 8 HP.', type: 'potion', value: 8, icon: '🧪' },
  { id: 'greater-potion', name: 'Greater Potion', description: 'Restores 16 HP.', type: 'potion', value: 16, icon: '🧪' },
  { id: 'dungeon-key', name: 'Dungeon Key', description: 'Unlocks sealed doors.', type: 'key', value: 1, icon: '🔑' },
]

export function getItemById(id: string): ItemDef | undefined {
  return ITEMS.find(i => i.id === id)
}
