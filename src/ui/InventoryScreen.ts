// InventoryScreen: 36-slot inventory UI

import { getItem } from '../data/items'

export interface InventoryCallbacks {
  onClose: () => void
  onSlotClick: (index: number, itemId: number, count: number) => void
}

export class InventoryScreen {
  private container: HTMLElement

  constructor(callbacks: InventoryCallbacks) {
    this.container = document.createElement('div')
    this.container.id = 'inventory-screen'
    this.container.style.cssText = `
      position: fixed; inset: 0; z-index: 150;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.6);
    `

    const panel = document.createElement('div')
    panel.style.cssText = `
      background: #5a5a5a; padding: 20px; border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `

    const title = document.createElement('h3')
    title.textContent = 'Inventory (E to close)'
    title.style.cssText = 'color: white; margin: 0 0 15px 0; text-align: center;'
    panel.appendChild(title)

    // 36-slot grid (6 rows x 6 cols)
    const grid = document.createElement('div')
    grid.id = 'inventory-grid'
    grid.style.cssText = `
      display: grid; grid-template-columns: repeat(9, 48px);
      grid-template-rows: repeat(4, 48px); gap: 2px;
    `

    for (let i = 0; i < 36; i++) {
      const slot = document.createElement('div')
      slot.id = `inv-slot-${i}`
      slot.style.cssText = `
        width: 48px; height: 48px; background: #8b8b8b;
        border: 2px solid #aaa; border-radius: 3px;
        display: flex; align-items: center; justify-content: center;
        pointer-events: auto; cursor: pointer; position: relative;
      `
      slot.addEventListener('click', () => callbacks.onSlotClick(i, 0, 0))
      grid.appendChild(slot)
    }

    panel.appendChild(grid)
    this.container.appendChild(panel)
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) callbacks.onClose()
    })
    document.body.appendChild(this.container)
  }

  update(slots: Array<{ itemId: number; count: number }>): void {
    for (let i = 0; i < 36; i++) {
      const slot = document.getElementById(`inv-slot-${i}`)
      if (!slot) continue

      // Clear previous
      const prev = slot.querySelector('.item-icon')
      if (prev) prev.remove()

      const item = slots[i]
      if (item.count > 0 && item.itemId > 0) {
        const def = getItem(item.itemId)
        const icon = document.createElement('div')
        icon.className = 'item-icon'
        icon.style.cssText = `
          width: 36px; height: 36px; border-radius: 4px;
          background-color: rgb(${def ? def.iconColor.join(',') : '128,128,128'});
        `
        const count = document.createElement('span')
        count.style.cssText = `
          position: absolute; bottom: 1px; right: 3px;
          font-size: 11px; color: white; font-weight: bold;
          text-shadow: 1px 1px 1px black;
        `
        count.textContent = String(item.count)
        icon.appendChild(count)
        slot.appendChild(icon)
      }
    }
  }

  remove(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
