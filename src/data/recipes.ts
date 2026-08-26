// Crafting recipes for VoxelCraft
// Supports 2x2 (inventory) and 3x3 (crafting table) grids

export interface Recipe {
  readonly id: number
  readonly resultItemId: number
  readonly resultCount: number
  readonly width: number
  readonly height: number
  // Pattern: each row is an array of item ids (0 = empty), length = width
  readonly pattern: number[][]
}

export const RECIPE_PLANKS: Recipe = {
  id: 1, resultItemId: 4, resultCount: 4, width: 1, height: 1,
  pattern: [[3]] // 1 log -> 4 planks
}

export const RECIPE_STICKS: Recipe = {
  id: 2, resultItemId: 5, resultCount: 4, width: 2, height: 2,
  pattern: [[3, 0], [3, 0]] // 2 planks (vertical) -> 4 sticks
}

export const RECIPE_CRAFTING_TABLE: Recipe = {
  id: 3, resultItemId: 12, resultCount: 1, width: 2, height: 2,
  pattern: [[4, 4], [4, 4]] // 4 planks -> crafting table
}

export const RECIPE_TORCHES: Recipe = {
  id: 4, resultItemId: 11, resultCount: 4, width: 2, height: 2,
  pattern: [[5, 0], [10, 0]] // stick + coal -> 4 torches
}

export const RECIPE_WOODEN_PICKAXE: Recipe = {
  id: 5, resultItemId: 6, resultCount: 1, width: 3, height: 3,
  pattern: [[4, 4, 4], [0, 5, 0], [0, 5, 0]] // 3 planks top + 2 sticks
}

export const RECIPE_STONE_PICKAXE: Recipe = {
  id: 6, resultItemId: 7, resultCount: 1, width: 3, height: 2,
  pattern: [[2, 2, 2], [0, 5, 0], [0, 5, 0]] // 3 stone top + 2 sticks
}

export const RECIPE_IRON_PICKAXE: Recipe = {
  id: 7, resultItemId: 8, resultCount: 1, width: 3, height: 2,
  pattern: [[10, 10, 10], [0, 5, 0], [0, 5, 0]] // 3 iron ingots + 2 sticks
}

export const RECIPE_WOODEN_SWORD: Recipe = {
  id: 9, resultItemId: 18, resultCount: 1, width: 2, height: 3,
  pattern: [[4, 0], [4, 0], [5, 0]] // 2 planks + 1 stick -> stone sword
}

export const RECIPE_COOKED_BEEF: Recipe = {
  id: 10, resultItemId: 15, resultCount: 1, width: 1, height: 1,
  pattern: [[14]] // raw beef -> cooked beef (smelting placeholder)
}

export const RECIPE_IRON_SPADE: Recipe = {
  id: 12, resultItemId: 19, resultCount: 1, width: 2, height: 3,
  pattern: [[10, 0], [0, 5], [0, 5]] // 1 iron ingot + 2 sticks -> iron shovel
}

export const ALL_RECIPES: ReadonlyArray<Recipe> = [
  RECIPE_PLANKS, RECIPE_STICKS, RECIPE_CRAFTING_TABLE, RECIPE_TORCHES,
  RECIPE_WOODEN_PICKAXE, RECIPE_STONE_PICKAXE, RECIPE_IRON_PICKAXE,
  RECIPE_WOODEN_SWORD, RECIPE_COOKED_BEEF,
  RECIPE_IRON_SPADE,
]

export function getRecipe(id: number): Recipe | undefined {
  return ALL_RECIPES[id]
}

export function findRecipe(pattern: number[][], pw: number, ph: number): Recipe | undefined {
  for (const recipe of ALL_RECIPES) {
    if (!recipe) continue
    // Try to find recipe pattern at any offset within the grid
    const maxDy = ph - recipe.height
    const maxDx = pw - recipe.width
    if (maxDy < 0 || maxDx < 0) continue // recipe bigger than grid
    for (let dy = 0; dy <= maxDy; dy++) {
      for (let dx = 0; dx <= maxDx; dx++) {
        let match = true
        // Check all recipe pattern cells match the corresponding grid cells
        for (let y = 0; y < recipe.height && match; y++) {
          for (let x = 0; x < recipe.width && match; x++) {
            if (recipe.pattern[y][x] !== pattern[y + dy]?.[x + dx]) match = false
          }
        }
        // Check no extra items in grid outside the recipe pattern
        if (match) {
          for (let y = 0; y < ph && match; y++) {
            for (let x = 0; x < pw && match; x++) {
              const gridCell = pattern[y][x]
              const ry = y - dy
              const rx = x - dx
              // Grid cell must be covered by recipe pattern and match
              if (ry >= 0 && ry < recipe.height && rx >= 0 && rx < recipe.width) {
                if (recipe.pattern[ry][rx] !== gridCell) match = false
              } else if (gridCell !== 0) {
                // Extra item not part of recipe
                match = false
              }
            }
          }
        }
        if (match) return recipe
      }
    }
  }
  return undefined
}

export const RECIPE_COUNT = ALL_RECIPES.length
