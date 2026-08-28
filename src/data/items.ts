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
  { id: 'steel-club', name: 'Steel Club', description: 'Heavy iron-banded club. Crushes armor.', type: 'weapon', value: 9, icon: '🏏' },
  { id: 'health-potion', name: 'Health Potion', description: 'Restores 8 HP.', type: 'potion', value: 8, icon: '🧪' },
  { id: 'greater-potion', name: 'Greater Potion', description: 'Restores 16 HP.', type: 'potion', value: 16, icon: '🧪' },
  { id: 'mega-potion', name: 'Mega Elixir', description: 'Restores 32 HP. Glows blue.', type: 'potion', value: 32, icon: '💎' },
  { id: 'dungeon-key', name: 'Dungeon Key', description: 'Unlocks sealed doors.', type: 'key', value: 1, icon: '🔑' },
  { id: 'iron-shield', name: 'Iron Shield', description: 'Blocks 2 damage per hit.', type: 'armor', value: 2, icon: '🛡️' },
  { id: 'rune-ring', name: 'Rune Ring', description: '+2 max HP. Pulsing runes.', type: 'armor', value: 2, icon: '💍' },
  { id: 'lightning-bow', name: 'Lightning Bow', description: 'Shoots bolts of lightning. +8 damage.', type: 'weapon', value: 8, icon: '🏹' },
  { id: 'poison-dagger', name: 'Poison Dagger', description: 'Inflicts poison for 3 seconds.', type: 'weapon', value: 6, icon: '🗡️' },
  { id: 'plate-armor', name: 'Plate Armor', description: 'Heavy plate. Blocks 4 damage per hit.', type: 'armor', value: 4, icon: '🛡️' },
  { id: 'crystal-orb', name: 'Crystal Orb', description: '+10 max MP. Glows with inner light.', type: 'armor', value: 10, icon: '🔮' },
  { id: 'blessed-amulet', name: 'Blessed Amulet', description: '+3 max HP. Divine protection.', type: 'armor', value: 3, icon: '📿' },
  { id: 'enchanted-boots', name: 'Enchanted Boots', description: '+1 speed. Leaves faint sparkles.', type: 'armor', value: 1, icon: '👢' },
]

export function getItemById(id: string): ItemDef | undefined {
  return ITEMS.find(i => i.id === id)
}
