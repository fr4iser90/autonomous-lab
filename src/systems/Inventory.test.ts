/**
 * Inventory system tests — potion use, equip, damage/armor bonuses, shop→inventory.
 * P5-1: Item functionality
 */
import { Inventory } from './Inventory'
import type { ItemDef } from '../data/items'
import { getItemById } from '../data/items'
import { shopIdToItemId } from '../data/shopItems'

const item = (id: string, name: string, type: ItemDef['type'], value: number, rarity: 'common' | 'uncommon' | 'rare' = 'common'): ItemDef =>
  ({ id, name, description: 'test', type, value, icon: 'x', rarity })

describe('Inventory', () => {
  let inv: Inventory

  beforeEach(() => { inv = new Inventory() })

  // --- addItem ---

  it('adds item to empty inventory', () => {
    const sword = item('rusty-sword', 'Rusty Sword', 'weapon', 3)
    expect(inv.addItem(sword)).toBe(true)
    expect(inv.getSlots().length).toBe(1)
  })

  it('rejects duplicate item by id', () => {
    const potion = item('health-potion', 'Health Potion', 'potion', 8)
    expect(inv.addItem(potion)).toBe(true)
    expect(inv.addItem(potion)).toBe(false)
    expect(inv.getSlots().length).toBe(1)
  })

  it('rejects when inventory full (6 slots)', () => {
    for (let i = 0; i < 6; i++) inv.addItem(item(`item-${i}`, `Item ${i}`, 'key', 1))
    expect(inv.getSlots().length).toBe(6)
    expect(inv.addItem(item('extra', 'Extra', 'key', 1))).toBe(false)
  })

  // --- equip ---

  it('equips armor and returns value bonus', () => {
    const shield = item('iron-shield', 'Iron Shield', 'armor', 2)
    expect(inv.addItem(shield)).toBe(true)
    const bonus = inv.equip(shield)
    expect(bonus).toBe(2)
    expect(inv.getSlots()[0].equipped).toBe(true)
  })

  it('equipping weapon returns 0 (damage read via getEquippedDamage)', () => {
    const sword = item('rusty-sword', 'Rusty Sword', 'weapon', 3)
    inv.addItem(sword)
    const bonus = inv.equip(sword)
    expect(bonus).toBe(0)
    expect(inv.getSlots()[0].equipped).toBe(true)
  })

  it('equipping same item twice returns 0 (already equipped)', () => {
    const shield = item('iron-shield', 'Iron Shield', 'armor', 2)
    inv.addItem(shield); inv.equip(shield)
    expect(inv.equip(shield)).toBe(0)
  })

  // --- getEquippedDamage ---

  it('returns weapon value when equipped', () => {
    const sword = item('rusty-sword', 'Rusty Sword', 'weapon', 3)
    inv.addItem(sword); inv.equip(sword)
    expect(inv.getEquippedDamage()).toBe(3)
  })

  it('returns 0 when no weapon equipped', () => {
    expect(inv.getEquippedDamage()).toBe(0)
  })

  it('returns 0 when weapon not equipped', () => {
    const sword = item('rusty-sword', 'Rusty Sword', 'weapon', 5)
    inv.addItem(sword)
    expect(inv.getEquippedDamage()).toBe(0)
  })

  // --- getEquippedArmor ---

  it('sums multiple equipped armor values', () => {
    const shield = item('iron-shield', 'Iron Shield', 'armor', 2)
    const amulet = item('blessed-amulet', 'Blessed Amulet', 'armor', 3)
    inv.addItem(shield); inv.addItem(amulet)
    inv.equip(shield); inv.equip(amulet)
    expect(inv.getEquippedArmor()).toBe(5)
  })

  it('returns 0 when no armor equipped', () => {
    expect(inv.getEquippedArmor()).toBe(0)
  })

  // --- usePotion ---

  it('uses a potion and returns heal amount', () => {
    const potion = item('health-potion', 'Health Potion', 'potion', 8)
    inv.addItem(potion)
    const heal = inv.usePotion(potion)
    expect(heal).toBe(8)
    expect(inv.getSlots().length).toBe(0) // consumed
  })

  it('returns 0 when no matching item', () => {
    expect(inv.usePotion(item('nope', 'Nope', 'potion', 5))).toBe(0)
  })

  it('returns 0 when item is not a potion', () => {
    const sword = item('rusty-sword', 'Rusty Sword', 'weapon', 3)
    inv.addItem(sword)
    expect(inv.usePotion(sword)).toBe(0)
  })

  it('uses the correct potion by id from existing slots', () => {
    const potion1 = item('health-potion', 'Health Potion', 'potion', 8)
    const potion2 = item('greater-potion', 'Greater Potion', 'potion', 16)
    inv.addItem(potion1); inv.addItem(potion2)
    expect(inv.usePotion(potion2)).toBe(16)
    expect(inv.getSlots().length).toBe(1)
    expect(inv.getSlots()[0].item.id).toBe('health-potion')
  })

  // --- getItemById ---

  it('looks up item by id from ITEMS', () => {
    const it = getItemById('rusty-sword')
    expect(it).toBeDefined()
    expect(it?.name).toBe('Rusty Sword')
    expect(it?.type).toBe('weapon')
    expect(it?.value).toBe(3)
  })

  it('returns undefined for unknown id', () => {
    expect(getItemById('nonexistent')).toBeUndefined()
  })
})

describe('shopIdToItemId', () => {
  it('strips -shop suffix', () => {
    expect(shopIdToItemId('health-potion-shop')).toBe('health-potion')
    expect(shopIdToItemId('rusty-sword-shop')).toBe('rusty-sword')
  })

  it('returns undefined for non-shop ids', () => {
    expect(shopIdToItemId('health-potion')).toBeUndefined()
  })
})

describe('shop → inventory flow', () => {
  it('shopIdToItemId maps shop item to real item, addItem adds to inventory', () => {
    const itemId = shopIdToItemId('health-potion-shop')
    expect(itemId).toBe('health-potion')
    const it = itemId ? getItemById(itemId) : undefined
    expect(it).toBeDefined()
    expect(it?.type).toBe('potion')
    const inv = new Inventory()
    expect(inv.addItem(it!)).toBe(true)
    expect(inv.getSlots().length).toBe(1)
  })

  it('shop weapon → inventory → equip → damage bonus', () => {
    const inv = new Inventory()
    const itemId = shopIdToItemId('rusty-sword-shop')
    const it = itemId ? getItemById(itemId) : undefined
    expect(it).toBeDefined()
    expect(inv.addItem(it!)).toBe(true)
    inv.equip(it!)
    expect(inv.getEquippedDamage()).toBe(3)
  })
})
