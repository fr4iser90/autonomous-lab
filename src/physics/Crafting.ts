// Crafting system for VoxelCraft
// Supports 2x2 (inventory) and 3x3 (crafting table) grids

import { findRecipe } from '../data/recipes'
import type { Recipe } from '../data/recipes'
import { insertItem } from '../data/inventory'
import type { InventorySlot } from '../data/inventory'

export interface CraftingGrid {
  width: number
  height: number
  items: (number | null)[] // flat array, null = empty cell
}

export interface CraftingResult {
  recipe: Recipe
  grid: CraftingGrid
}

export const CRAFTING_INVENTORY_WIDTH = 2
export const CRAFTING_INVENTORY_HEIGHT = 2
export const CRAFTING_TABLE_WIDTH = 3
export const CRAFTING_TABLE_HEIGHT = 3

/**
 * Create an empty crafting grid for the inventory (2x2).
 */
export function createInventoryCraftingGrid(): CraftingGrid {
  return {
    width: CRAFTING_INVENTORY_WIDTH,
    height: CRAFTING_INVENTORY_HEIGHT,
    items: Array(CRAFTING_INVENTORY_WIDTH * CRAFTING_INVENTORY_HEIGHT).fill(null),
  }
}

/**
 * Create an empty crafting grid for the crafting table (3x3).
 */
export function createCraftingTableGrid(): CraftingGrid {
  return {
    width: CRAFTING_TABLE_WIDTH,
    height: CRAFTING_TABLE_HEIGHT,
    items: Array(CRAFTING_TABLE_WIDTH * CRAFTING_TABLE_HEIGHT).fill(null),
  }
}

/**
 * Build a pattern array from a crafting grid for recipe matching.
 */
export function gridToPattern(grid: CraftingGrid): number[][] {
  const pattern: number[][] = []
  for (let y = 0; y < grid.height; y++) {
    const row: number[] = []
    for (let x = 0; x < grid.width; x++) {
      row.push(grid.items[y * grid.width + x] ?? 0)
    }
    pattern.push(row)
  }
  return pattern
}

/**
 * Find a matching recipe for the given crafting grid.
 * Returns undefined if no recipe matches.
 */
export function findCraftingRecipe(grid: CraftingGrid): Recipe | undefined {
  const pattern = gridToPattern(grid)
  return findRecipe(pattern, grid.width, grid.height)
}

/**
 * Check if a crafting grid has any items placed in it.
 */
export function isGridEmpty(grid: CraftingGrid): boolean {
  return grid.items.every(i => i === null || i === 0)
}

/**
 * Place an item into the crafting grid.
 * @returns true if the item was placed
 */
export function placeInGrid(grid: CraftingGrid, slot: number, itemId: number): boolean {
  if (slot < 0 || slot >= grid.items.length) return false
  if (grid.items[slot] !== null && grid.items[slot] !== itemId) return false
  grid.items[slot] = itemId
  return true
}

/**
 * Remove an item from the crafting grid.
 */
export function removeFromGrid(grid: CraftingGrid, slot: number): void {
  if (slot >= 0 && slot < grid.items.length) {
    grid.items[slot] = null
  }
}

/**
 * Clear the entire crafting grid.
 */
export function clearGrid(grid: CraftingGrid): void {
  grid.items.fill(null)
}

/**
 * Craft an item from the recipe, consuming matching items from the grid.
 * The result is returned as a slot: { itemId, count }.
 * Returns undefined if no recipe matches.
 */
export function craft(grid: CraftingGrid): InventorySlot | undefined {
  const recipe = findCraftingRecipe(grid)
  if (!recipe) return undefined

  // Check if all required items are in the grid at the right positions
  for (let y = 0; y < recipe.height; y++) {
    for (let x = 0; x < recipe.width; x++) {
      const cellId = recipe.pattern[y]?.[x] ?? 0
      if (cellId === 0) continue // empty pattern cell
      const gridIdx = y * grid.width + x
      const gridItemId = grid.items[gridIdx]
      if (gridItemId !== cellId) return undefined
    }
  }

  // Consume items from the grid
  for (let i = 0; i < grid.items.length; i++) {
    if (grid.items[i] !== null) {
      removeFromGrid(grid, i)
    }
  }

  // Return the result
  return { itemId: recipe.resultItemId, count: recipe.resultCount }
}

/**
 * Add crafted result to the inventory.
 * Returns true if the item was fully placed.
 */
export function addCraftedResult(inventory: InventorySlot[], result: InventorySlot): boolean {
  if (result.itemId <= 0 || result.count <= 0) return false
  const remaining = insertItem(inventory, result.itemId, result.count)
  return remaining <= 0
}

/**
 * Validate that the player has the required items in their inventory for a recipe.
 */
export function canCraftRecipe(inventory: InventorySlot[], recipe: Recipe): boolean {
  // Build a count map of inventory items
  const counts = new Map<number, number>()
  for (const slot of inventory) {
    if (slot.itemId > 0) {
      counts.set(slot.itemId, (counts.get(slot.itemId) ?? 0) + slot.count)
    }
  }

  // Check each pattern cell
  for (const row of recipe.pattern) {
    for (const cellId of row) {
      if (cellId === 0) continue
      const available = counts.get(cellId) ?? 0
      if (available <= 0) return false
    }
  }
  return true
}

/**
 * Quick craft: find and execute a recipe from the current grid state,
 * adding the result to the inventory.
 * This is the main entry point for "click craft" in the UI.
 */
export function quickCraft(
  grid: CraftingGrid,
  inventory: InventorySlot[],
): InventorySlot | undefined {
  const result = craft(grid)
  if (result) {
    addCraftedResult(inventory, result)
    return result
  }
  return undefined
}
