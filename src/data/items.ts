// Item types for VoxelCraft

export interface ItemDef {
  readonly id: number
  readonly name: string
  readonly stackable: boolean
  readonly maxStack: number
  readonly iconColor: [number, number, number]
  /** Attack damage when used as a weapon (default 1 for fists) */
  readonly attackDamage?: number
}

export const ItemAir: ItemDef = { id: 0, name: 'Air', stackable: false, maxStack: 1, iconColor: [0, 0, 0] }
export const ItemDirt: ItemDef = { id: 1, name: 'Dirt', stackable: true, maxStack: 64, iconColor: [139, 90, 43] }
export const ItemStone: ItemDef = { id: 2, name: 'Stone', stackable: true, maxStack: 64, iconColor: [128, 128, 128] }
export const ItemWood: ItemDef = { id: 3, name: 'Wood', stackable: true, maxStack: 64, iconColor: [101, 67, 33] }
export const ItemPlanks: ItemDef = { id: 4, name: 'Planks', stackable: true, maxStack: 64, iconColor: [205, 133, 63] }
export const ItemStick: ItemDef = { id: 5, name: 'Stick', stackable: true, maxStack: 64, iconColor: [160, 82, 45] }
export const ItemWoodenPickaxe: ItemDef = { id: 6, name: 'Wooden Pickaxe', stackable: false, maxStack: 1, iconColor: [205, 133, 63], attackDamage: 1 }
export const ItemStonePickaxe: ItemDef = { id: 7, name: 'Stone Pickaxe', stackable: false, maxStack: 1, iconColor: [128, 128, 128], attackDamage: 2 }
export const ItemIronPickaxe: ItemDef = { id: 8, name: 'Iron Pickaxe', stackable: false, maxStack: 1, iconColor: [200, 200, 200], attackDamage: 2 }
export const ItemCoal: ItemDef = { id: 9, name: 'Coal', stackable: true, maxStack: 64, iconColor: [50, 50, 50] }
export const ItemIronIngots: ItemDef = { id: 10, name: 'Iron Ingot', stackable: true, maxStack: 64, iconColor: [200, 180, 160] }
export const ItemTorch: ItemDef = { id: 11, name: 'Torch', stackable: true, maxStack: 64, iconColor: [255, 200, 50] }
export const ItemCraftingTable: ItemDef = { id: 12, name: 'Crafting Table', stackable: true, maxStack: 64, iconColor: [180, 120, 60] }
export const ItemApple: ItemDef = { id: 13, name: 'Apple', stackable: true, maxStack: 64, iconColor: [200, 50, 50] }
export const ItemBeef: ItemDef = { id: 14, name: 'Beef', stackable: true, maxStack: 64, iconColor: [150, 50, 50] }
export const ItemCookedBeef: ItemDef = { id: 15, name: 'Cooked Beef', stackable: true, maxStack: 64, iconColor: [180, 80, 40] }
export const ItemWaterBucket: ItemDef = { id: 16, name: 'Water Bucket', stackable: true, maxStack: 1, iconColor: [30, 144, 255] }
export const ItemLavaBucket: ItemDef = { id: 17, name: 'Lava Bucket', stackable: true, maxStack: 1, iconColor: [255, 69, 0] }
export const ItemStoneSword: ItemDef = { id: 18, name: 'Stone Sword', stackable: false, maxStack: 1, iconColor: [128, 128, 128], attackDamage: 4 }
export const ItemIronShovel: ItemDef = { id: 19, name: 'Iron Shovel', stackable: false, maxStack: 1, iconColor: [200, 200, 200], attackDamage: 1 }

export const ALL_ITEMS: ReadonlyArray<ItemDef> = [
  ItemAir, ItemDirt, ItemStone, ItemWood, ItemPlanks,
  ItemStick, ItemWoodenPickaxe, ItemStonePickaxe, ItemIronPickaxe,
  ItemCoal, ItemIronIngots, ItemTorch, ItemCraftingTable,
  ItemApple, ItemBeef, ItemCookedBeef,
  ItemWaterBucket, ItemLavaBucket,
  ItemStoneSword, ItemIronShovel,
]

export function getItem(id: number): ItemDef | undefined {
  return ALL_ITEMS[id]
}

/**
 * Get the attack damage of an item slot.
 * Returns 1 (fists) if the slot is empty or the item has no attackDamage.
 */
export function getAttackDamage(itemId: number): number {
  const def = getItem(itemId)
  return def?.attackDamage ?? 1
}

export const ITEM_COUNT = ALL_ITEMS.length
