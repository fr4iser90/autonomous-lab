// HUD: In-game heads-up display overlay

export class HUD {
  private container: HTMLElement
  private crosshairEl: HTMLElement
  private hotbarEl: HTMLElement
  private heartsEl: HTMLElement
  private debugEl: HTMLElement
  private miningProgressEl: HTMLElement
  private timeOfDayEl: HTMLElement

  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'hud'
    this.container.style.cssText = `
      position: fixed; inset: 0; z-index: 50;
      pointer-events: none; font-family: 'Courier New', monospace;
    `

    // Crosshair
    this.crosshairEl = document.createElement('div')
    this.crosshairEl.id = 'crosshair'
    this.crosshairEl.style.cssText = `
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 20px; height: 20px;
    `
    this.crosshairEl.innerHTML = `
      <div style="position:absolute;top:50%;left:0;transform:translateY(-50%);width:20px;height:2px;background:white;opacity:0.8"></div>
      <div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:2px;height:20px;background:white;opacity:0.8"></div>
    `
    this.container.appendChild(this.crosshairEl)

    // Hotbar
    this.hotbarEl = document.createElement('div')
    this.hotbarEl.id = 'hotbar'
    this.hotbarEl.style.cssText = `
      position: absolute; bottom: 10px; left: 50%;
      transform: translateX(-50%);
      display: flex; gap: 2px; padding: 4px;
      background: rgba(0,0,0,0.5); border-radius: 4px;
    `
    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div')
      slot.id = `hotbar-slot-${i}`
      slot.style.cssText = `
        width: 48px; height: 48px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 3px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.4); position: relative;
      `
      const label = document.createElement('span')
      label.style.cssText = `
        position: absolute; top: 2px; left: 3px;
        font-size: 10px; color: #aaa;
      `
      label.textContent = String(i + 1)
      slot.appendChild(label)
      this.hotbarEl.appendChild(slot)
    }
    this.container.appendChild(this.hotbarEl)

    // Hearts (10 hearts = 20 HP)
    this.heartsEl = document.createElement('div')
    this.heartsEl.id = 'hearts'
    this.heartsEl.style.cssText = `
      position: absolute; bottom: 70px; left: 50%;
      transform: translateX(-50%);
      font-size: 18px;
    `
    this.heartsEl.textContent = '❤'.repeat(10)
    this.container.appendChild(this.heartsEl)

    // Debug info
    this.debugEl = document.createElement('div')
    this.debugEl.id = 'debug'
    this.debugEl.style.cssText = `
      position: absolute; top: 10px; left: 10px;
      font-size: 12px; color: white;
      text-shadow: 1px 1px 2px black;
      line-height: 1.6;
    `
    this.debugEl.textContent = ''
    this.container.appendChild(this.debugEl)

    // Mining progress bar
    this.miningProgressEl = document.createElement('div')
    this.miningProgressEl.id = 'mining-progress'
    this.miningProgressEl.style.cssText = `
      position: absolute; bottom: 110px; left: 50%;
      transform: translateX(-50%);
      width: 200px; height: 8px;
      background: rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 4px;
      overflow: hidden;
      display: none;
    `
    const progressBar = document.createElement('div')
    progressBar.id = 'mining-progress-fill'
    progressBar.style.cssText = `
      width: 0%; height: 100%;
      background: #ffcc00;
      transition: width 0.05s linear;
    `
    this.miningProgressEl.appendChild(progressBar)
    this.container.appendChild(this.miningProgressEl)

    // Time of day display (M8)
    this.timeOfDayEl = document.createElement('div')
    this.timeOfDayEl.id = 'time-of-day'
    this.timeOfDayEl.style.cssText = `
      position: absolute; top: 10px; right: 10px;
      font-size: 12px; color: white;
      text-shadow: 1px 1px 2px black;
      text-align: right;
      line-height: 1.6;
    `
    this.timeOfDayEl.textContent = ''
    this.container.appendChild(this.timeOfDayEl)

    document.body.appendChild(this.container)
  }

  updateHotbar(selectedSlot: number, items: Array<{ itemId: number; count: number }>): void {
    for (let i = 0; i < 9; i++) {
      const slot = document.getElementById(`hotbar-slot-${i}`)
      if (!slot) continue
      slot.style.borderColor = i === selectedSlot ? '#4fc3f7' : 'rgba(255,255,255,0.3)'
      slot.style.borderWidth = '2px'

      // Remove existing content except label
      const existing = slot.querySelector('.item-icon')
      if (existing) existing.remove()

      const item = items[i]
      if (item && item.count > 0 && item.itemId > 0) {
        const icon = document.createElement('div')
        icon.className = 'item-icon'
        icon.style.cssText = `
          width: 32px; height: 32px; border-radius: 3px;
          background-color: rgb(${item.itemId > 0 ? 100 + item.itemId * 15 : 128},
                                 ${item.itemId > 0 ? 80 + item.itemId * 10 : 128},
                                 ${item.itemId > 0 ? 60 + item.itemId * 8 : 128});
        `
        const count = document.createElement('span')
        count.style.cssText = `
          position: absolute; bottom: 2px; right: 3px;
          font-size: 11px; color: white;
          text-shadow: 1px 1px 1px black;
        `
        count.textContent = String(item.count)
        icon.appendChild(count)
        slot.appendChild(icon)
      }
    }
  }

  updateHearts(hp: number): void {
    const fullHearts = Math.floor(hp / 2)
    const halfHeart = hp % 2
    this.heartsEl.textContent = '❤'.repeat(fullHearts) + (halfHeart ? '🧡' : '') + '💔'.repeat(10 - fullHearts - halfHeart)
  }

  setDebug(text: string): void {
    this.debugEl.textContent = text
  }

  /** Update mining progress bar visibility and fill */
  updateMiningProgress(progress: number, maxProgress: number): void {
    if (maxProgress <= 0) {
      this.miningProgressEl.style.display = 'none'
      return
    }
    this.miningProgressEl.style.display = 'block'
    const fill = this.miningProgressEl.querySelector('#mining-progress-fill') as HTMLElement
    const pct = Math.min(100, (progress / maxProgress) * 100)
    fill.style.width = `${pct}%`
  }

  /** M8: Update time of day display */
  updateTimeOfDay(timeOfDay: number): void {
    // Convert 0-24000 to hour:minute format
    const totalMinutes = Math.floor((timeOfDay / 24000) * 1440)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

    // Phase name
    let phase = 'day'
    if (timeOfDay > 13000 && timeOfDay < 23000) phase = 'night'
    else if (timeOfDay >= 23000 || timeOfDay <= 2000) phase = 'dawn'
    else if (timeOfDay >= 13000 && timeOfDay <= 14000) phase = 'sunset'

    this.timeOfDayEl.textContent = `${timeStr}  ${phase}`
  }

  /** M9: Show a collection notification briefly */
  showDropNotification(name: string, count: number): void {
    // Remove any existing notification
    const existing = document.getElementById('drop-notification')
    if (existing) existing.remove()

    const el = document.createElement('div')
    el.id = 'drop-notification'
    el.style.cssText = `
      position: absolute; bottom: 140px; left: 50%;
      transform: translateX(-50%);
      padding: 6px 14px;
      background: rgba(0,0,0,0.7);
      color: #aaffaa;
      font-size: 14px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      text-shadow: 1px 1px 1px black;
      transition: opacity 0.3s;
    `
    el.textContent = `+${count} ${name}`
    this.container.appendChild(el)

    // Fade out after 1.5 seconds
    setTimeout(() => {
      el.style.opacity = '0'
      setTimeout(() => el.remove(), 300)
    }, 1500)
  }

  remove(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
