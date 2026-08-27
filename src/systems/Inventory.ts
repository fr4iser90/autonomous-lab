/**
 * Inventory system — collect items, equip weapons, use potions.
 * M7: Loot drops, inventory grid, chest openings.
 */
import type { ItemDef } from '../data/items'

export interface InventorySlot {
  item: ItemDef
  equipped: boolean
}

export interface Chest {
  hasOpened: boolean
  contents: ItemDef[]
}

export class Inventory {
  private slots: InventorySlot[] = []
  private readonly maxSlots = 6
  private readonly chests: Map<string, Chest> = new Map()

  /** Add item to inventory */
  addItem(item: ItemDef): boolean {
    if (this.slots.length >= this.maxSlots) return false
    if (this.slots.some(s => s.item.id === item.id)) return false

    this.slots.push({ item, equipped: false })
    return true
  }

  /** Equip a weapon item */
  equip(item: ItemDef): boolean {
    const slot = this.slots.find(s => s.item.id === item.id)
    if (!slot) return false
    slot.equipped = true
    return true
  }

  /** Use a potion from inventory */
  usePotion(item: ItemDef): boolean {
    const slot = this.slots.find(s => s.item.id === item.id)
    if (!slot || slot.item.type !== 'potion') return false
    // Remove from inventory after use
    this.slots = this.slots.filter(s => s.item.id !== item.id)
    return true
  }

  /** Get equipped weapon damage */
  getEquippedDamage(): number {
    const weapon = this.slots.find(s => s.equipped && s.item.type === 'weapon')
    return weapon ? weapon.item.value : 1 // bare hands = 1
  }

  /** Get all slots */
  getSlots(): InventorySlot[] {
    return [...this.slots]
  }

  /** Create a loot chest at a dungeon position */
  createChest(_positionKey: string, _floorNumber: number): Chest {
    return { hasOpened: false, contents: [] }
  }

  /** Open a chest and return contents */
  openChest(_positionKey: string): ItemDef[] {
    return []
  }

  /** Check if chest is opened */
  isChestOpened(_positionKey: string): boolean {
    return false
  }

  /** Get chest contents for rendering */
  getChestContents(_positionKey: string): ItemDef[] {
    return []
  }

  /** Reset inventory */
  reset(): void {
    this.slots = []
    this.chests.clear()
  }
}
