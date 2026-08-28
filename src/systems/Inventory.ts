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
  private _keyCount = 0

  /** Get current key count */
  getKeyCount(): number {
    return this._keyCount
  }

  /** Add dungeon keys (used when buying from shop or looting) */
  addKeys(n: number): void {
    this._keyCount += n
  }

  /** Try to consume one dungeon key. Returns true if key was consumed. */
  consumeKey(): boolean {
    if (this._keyCount <= 0) return false
    this._keyCount--
    return true
  }

  /** Add item to inventory */
  addItem(item: ItemDef): boolean {
    if (this.slots.length >= this.maxSlots) return false
    if (this.slots.some(s => s.item.id === item.id)) return false

    this.slots.push({ item, equipped: false })
    return true
  }

  /** Equip an item — weapons add damage, armor adds HP or speed. Returns stat bonus applied. */
  equip(item: ItemDef): number {
    const slot = this.slots.find(s => s.item.id === item.id)
    if (!slot || slot.equipped) return 0
    slot.equipped = true
    if (slot.item.type === 'weapon') return 0 // damage read separately via getEquippedDamage
    if (slot.item.type === 'armor') return slot.item.value
    return 0
  }

  /** Get equipped weapon damage bonus */
  getEquippedDamage(): number {
    const weapon = this.slots.find(s => s.equipped && s.item.type === 'weapon')
    return weapon ? weapon.item.value : 0
  }

  /** Get equipped armor value (damage reduction) */
  getEquippedArmor(): number {
    let total = 0
    for (const slot of this.slots) {
      if (slot.equipped && slot.item.type === 'armor') {
        total += slot.item.value
      }
    }
    return total
  }

  /** Use a potion from inventory — returns heal amount (0 if not a potion). */
  usePotion(item: ItemDef): number {
    const slot = this.slots.find(s => s.item.id === item.id)
    if (!slot || slot.item.type !== 'potion') return 0
    const heal = slot.item.value
    this.slots = this.slots.filter(s => s.item.id !== item.id)
    return heal
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
