/** Shop item definitions for Ashen Delve economy system. */

export interface ShopItemDef {
  id: string
  name: string
  description: string
  icon: string
  cost: number // cost in scrap
}

export const SHOP_ITEMS: ShopItemDef[] = [
  { id: 'health-potion-shop', name: 'Health Potion', description: 'Restores 8 HP.', icon: '🧪', cost: 15 },
  { id: 'greater-potion-shop', name: 'Greater Potion', description: 'Restores 16 HP.', icon: '🧪', cost: 30 },
  { id: 'mega-potion-shop', name: 'Mega Elixir', description: 'Restores 32 HP.', icon: '💎', cost: 55 },
  { id: 'iron-shield-shop', name: 'Iron Shield', description: 'Blocks 2 damage per hit.', icon: '🛡️', cost: 25 },
  { id: 'steel-club-shop', name: 'Steel Club', description: 'Heavy iron-banded club. +9 damage.', icon: '🏏', cost: 40 },
  { id: 'dungeon-key-shop', name: 'Dungeon Key', description: 'Unlocks sealed doors.', icon: '🔑', cost: 20 },
  { id: 'blessed-amulet-shop', name: 'Blessed Amulet', description: '+3 max HP. Divine protection.', icon: '📿', cost: 35 },
  { id: 'rune-ring-shop', name: 'Rune Ring', description: '+2 max HP. Pulsing runes.', icon: '💍', cost: 15 },
]

export function getShopItemById(id: string): ShopItemDef | undefined {
  return SHOP_ITEMS.find(i => i.id === id)
}

export function getShopItemsForFloor(floor: number): ShopItemDef[] {
  // Higher floors unlock better items
  if (floor >= 4) return SHOP_ITEMS // all 8 items
  if (floor >= 2) return SHOP_ITEMS.slice(0, 5) // potions + shield + club
  return SHOP_ITEMS.slice(0, 3) // potions only
}
