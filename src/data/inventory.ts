// Inventory data model and operations for VoxelCraft
// 36-slot inventory (9 hotbar + 27 main inventory)

import { getItem } from './items'

export interface InventorySlot {
  itemId: number  // 0 = empty
  count: number   // 0 = empty
}

export interface InventoryState {
  slots: InventorySlot[]   // 36 slots
  selectedSlot: number     // hotbar selection 0-8
}

export const INVENTORY_SLOTS = 36
export const HOTBAR_SIZE = 9
export const MAIN_INV_OFFSET = 9 // slots 9-35 are main inventory
export const DEFAULT_MAX_STACK = 64

/**
 * Create a new empty inventory.
 */
export function createInventory(): InventorySlot[] {
  return Array.from({ length: INVENTORY_SLOTS }, () => ({ itemId: 0, count: 0 }))
}

/**
 * Create a fresh inventory state with a given hotbar selection.
 */
export function createInventoryState(selectedSlot: number = 0): InventoryState {
  return {
    slots: createInventory(),
    selectedSlot: Math.max(0, Math.min(selectedSlot, HOTBAR_SIZE - 1)),
  }
}

/**
 * Count how many slots contain items (non-empty).
 */
export function countUsedSlots(slots: InventorySlot[]): number {
  return slots.filter(s => s.itemId > 0 && s.count > 0).length
}

/**
 * Check if a specific slot is empty.
 */
export function isSlotEmpty(slots: InventorySlot[], index: number): boolean {
  if (index < 0 || index >= INVENTORY_SLOTS) return true
  const slot = slots[index]
  return slot.itemId <= 0 || slot.count <= 0
}

/**
 * Check if two slots are compatible for stacking (same item, stackable).
 */
function canStack(slotA: InventorySlot, slotB: InventorySlot): boolean {
  if (slotA.itemId !== slotB.itemId) return false
  if (slotA.itemId <= 0) return false
  const def = getItem(slotA.itemId)
  if (!def) return false
  return def.stackable
}

/**
 * Get the maximum stack size for a given item.
 */
export function getMaxStackSize(itemId: number): number {
  const def = getItem(itemId)
  return def ? def.maxStack : DEFAULT_MAX_STACK
}

/**
 * Get the count of an item across all slots.
 */
export function getTotalItemCount(slots: InventorySlot[], itemId: number): number {
  return slots.reduce((sum, s) => {
    if (s.itemId === itemId) return sum + s.count
    return sum
  }, 0)
}

/**
 * Find the first empty slot in the inventory.
 * @returns slot index or -1 if full
 */
export function findEmptySlot(slots: InventorySlot[]): number {
  for (let i = 0; i < INVENTORY_SLOTS; i++) {
    if (isSlotEmpty(slots, i)) return i
  }
  return -1
}

/**
 * Find slots that contain a given item (for stacking).
 */
export function findItemSlots(slots: InventorySlot[], itemId: number): number[] {
  return slots.reduce<number[]>((result, s, i) => {
    if (s.itemId === itemId && s.count > 0) result.push(i)
    return result
  }, [])
}

/**
 * Try to stack items into existing slots of the same type.
 * Returns true if all items were stacked, false if some remain.
 */
export function tryStack(items: InventorySlot, slots: InventorySlot[], startIndex: number): boolean {
  if (items.itemId <= 0 || items.count <= 0) return true

  let remaining = items.count
  for (let i = startIndex; i < INVENTORY_SLOTS && remaining > 0; i++) {
    const slot = slots[i]
    if (canStack(slot, items)) {
      const def = getItem(slot.itemId)
      const space = (def ? def.maxStack : DEFAULT_MAX_STACK) - slot.count
      if (space > 0) {
        const add = Math.min(remaining, space)
        slot.count += add
        remaining -= add
      }
    }
  }

  // If still remaining, put in empty slots
  if (remaining > 0) {
    for (let i = startIndex; i < INVENTORY_SLOTS && remaining > 0; i++) {
      if (isSlotEmpty(slots, i)) {
        const def = getItem(items.itemId)
        slots[i] = { itemId: items.itemId, count: Math.min(remaining, def ? def.maxStack : DEFAULT_MAX_STACK) }
        remaining -= slots[i].count
      }
    }
  }

  return remaining <= 0
}

/**
 * Insert an item into the inventory, stacking where possible.
 * Returns the remaining count that didn't fit (0 = fully inserted).
 */
export function insertItem(slots: InventorySlot[], itemId: number, count: number): number {
  if (count <= 0) return 0

  let remaining = count
  const item: InventorySlot = { itemId, count }

  // First try to stack into existing slots
  if (!tryStack(item, slots, 0)) {
    remaining = item.count
  } else {
    remaining = 0
  }

  // Then try empty slots
  if (remaining > 0) {
    for (let i = 0; i < INVENTORY_SLOTS && remaining > 0; i++) {
      if (isSlotEmpty(slots, i)) {
        const def = getItem(itemId)
        const slotCount = Math.min(remaining, def ? def.maxStack : DEFAULT_MAX_STACK)
        slots[i] = { itemId, count: slotCount }
        remaining -= slotCount
      }
    }
  }

  return remaining
}

/**
 * Remove items from the inventory.
 * Returns true if all requested items were removed.
 */
export function removeItem(slots: InventorySlot[], itemId: number, count: number): boolean {
  if (count <= 0) return true

  let toRemove = count
  // Collect all slots with this item
  const slotsWithItem = findItemSlots(slots, itemId)

  for (const idx of slotsWithItem) {
    if (toRemove <= 0) break
    const slot = slots[idx]
    const remove = Math.min(toRemove, slot.count)
    slot.count -= remove
    toRemove -= remove
    if (slot.count <= 0) {
      slot.itemId = 0
      slot.count = 0
    }
  }

  return toRemove <= 0
}

/**
 * Move item from one slot to another.
 * Used for drag-and-drop in UI.
 */
export function moveSlot(slots: InventorySlot[], from: number, to: number): void {
  if (from === to || from < 0 || from >= INVENTORY_SLOTS || to < 0 || to >= INVENTORY_SLOTS) return
  const temp = { ...slots[from] }
  slots[from] = { ...slots[to] }
  slots[to] = temp
}

/**
 * Swap two slots (full swap including counts).
 */
export function swapSlots(slots: InventorySlot[], a: number, b: number): void {
  if (a === b || a < 0 || a >= INVENTORY_SLOTS || b < 0 || b >= INVENTORY_SLOTS) return
  const temp = slots[a]
  slots[a] = slots[b]
  slots[b] = temp
}

/**
 * Transfer an item from the source slot to the destination slot.
 * If dest is empty, move entire source. If dest has same item, stack.
 * Returns true if a transfer occurred.
 */
export function transferToSlot(
  slots: InventorySlot[],
  fromSlot: number,
  toSlot: number,
  amount: number = 1,
): boolean {
  if (fromSlot < 0 || fromSlot >= INVENTORY_SLOTS || toSlot < 0 || toSlot >= INVENTORY_SLOTS) return false
  const from = slots[fromSlot]
  if (from.itemId <= 0 || from.count <= 0) return false

  const to = slots[toSlot]

  if (to.itemId <= 0 || to.count <= 0) {
    // Destination empty: transfer requested amount
    const transfer = Math.min(amount, from.count)
    slots[toSlot] = { itemId: from.itemId, count: transfer }
    from.count -= transfer
    if (from.count <= 0) {
      from.itemId = 0
      from.count = 0
    }
    return transfer > 0
  }

  if (canStack(from, to)) {
    // Same item: try to stack
    const def = getItem(from.itemId)
    const space = (def ? def.maxStack : DEFAULT_MAX_STACK) - to.count
    const transfer = Math.min(amount, space, from.count)
    to.count += transfer
    from.count -= transfer
    if (from.count <= 0) {
      from.itemId = 0
      from.count = 0
    }
    return transfer > 0
  }

  // Different item: no transfer
  return false
}

/**
 * Select the hotbar slot by number key (1-9 → 0-8).
 */
export function selectHotbarSlot(_slots: InventorySlot[], numberKey: number): number {
  const idx = Math.max(0, Math.min(numberKey - 1, HOTBAR_SIZE - 1))
  // Just return the selected slot index; main.ts handles storing it
  return idx
}

/**
 * Get a snapshot of the hotbar (first 9 slots).
 */
export function getHotbarSnapshot(slots: InventorySlot[]): InventorySlot[] {
  return slots.slice(0, HOTBAR_SIZE).map(s => ({ ...s }))
}

/**
 * Check if the inventory is full.
 */
export function isInventoryFull(slots: InventorySlot[]): boolean {
  return countUsedSlots(slots) >= INVENTORY_SLOTS
}
