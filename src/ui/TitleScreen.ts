// TitleScreen: Main menu with 3 save slots, New World, Continue, Delete

import { SaveService } from '../services/SaveService'

export interface TitleCallbacks {
  onNewWorld: (slot: number) => void
  onContinue: (slot: number) => void
  onDelete: (slot: number) => void
}

export class TitleScreen {
  private container: HTMLElement
  private callbacks: TitleCallbacks
  private saveService: SaveService

  constructor(saveService: SaveService, callbacks: TitleCallbacks) {
    this.saveService = saveService
    this.callbacks = callbacks
    this.container = this.createUI()
    document.body.appendChild(this.container)
    this.refreshSlots()
  }

  private createUI(): HTMLElement {
    const container = document.createElement('div')
    container.id = 'title-screen'
    container.style.cssText = `
      position: fixed; inset: 0; z-index: 100;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: linear-gradient(180deg, #1a0a2e 0%, #2d1b69 50%, #1a0a2e 100%);
      color: white; font-family: 'Courier New', monospace;
    `

    const title = document.createElement('h1')
    title.id = 'game-title'
    title.textContent = 'VoxelCraft'
    title.style.cssText = `
      font-size: 48px; margin-bottom: 8px;
      text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
      letter-spacing: 4px;
    `
    container.appendChild(title)

    const subtitle = document.createElement('p')
    subtitle.textContent = 'Infinite Voxel Sandbox'
    subtitle.style.cssText = `
      font-size: 16px; color: #aaa; margin-bottom: 40px;
    `
    container.appendChild(subtitle)

    // Settings section
    const settingsPanel = document.createElement('div')
    settingsPanel.id = 'settings-panel'
    settingsPanel.style.cssText = `
      margin-bottom: 30px; padding: 15px;
      border: 1px solid rgba(255,255,255,0.2); border-radius: 8px;
      background: rgba(0,0,0,0.3);
    `
    settingsPanel.innerHTML = `
      <label style="display:block;margin-bottom:8px">Master Volume: <span id="vol-display">100%</span></label>
      <input type="range" id="master-volume" min="0" max="100" value="100" style="width:200px">
      <label style="display:block;margin-top:8px">Sensitivity: <span id="sens-display">100%</span></label>
      <input type="range" id="sensitivity" min="10" max="200" value="100" style="width:200px">
    `
    container.appendChild(settingsPanel)

    // Volume/sensitivity controls
    const volSlider = settingsPanel.querySelector('#master-volume') as HTMLInputElement
    const sensSlider = settingsPanel.querySelector('#sensitivity') as HTMLInputElement
    volSlider.addEventListener('input', () => {
      const v = parseInt(volSlider.value)
      const sv = parseInt(sensSlider.value)
      document.getElementById('vol-display')!.textContent = v + '%'
      this.saveService.saveSettings({
        ...this.saveService.getSettings(),
        masterVolume: v / 100,
        sensitivity: sv / 100,
      })
    })
    sensSlider.addEventListener('input', () => {
      const v = parseInt(sensSlider.value)
      const mv = parseInt(volSlider.value)
      document.getElementById('sens-display')!.textContent = v + '%'
      this.saveService.saveSettings({
        ...this.saveService.getSettings(),
        masterVolume: mv / 100,
        sensitivity: v / 100,
      })
    })

    // Slot rows
    const slotContainer = document.createElement('div')
    slotContainer.id = 'slot-container'
    slotContainer.style.cssText = `
      display: flex; flex-direction: column; gap: 10px; width: 500px;
    `
    container.appendChild(slotContainer)

    for (let i = 0; i < 3; i++) {
      const row = document.createElement('div')
      row.id = `slot-row-${i}`
      row.style.cssText = `
        display: flex; align-items: center; gap: 10px;
        padding: 12px; border-radius: 6px;
        background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
      `

      const slotInfo = document.createElement('div')
      slotInfo.id = `slot-info-${i}`
      slotInfo.style.cssText = 'flex: 1;'
      row.appendChild(slotInfo)

      const continueBtn = document.createElement('button')
      continueBtn.id = `continue-btn-${i}`
      continueBtn.textContent = '▶ Continue'
      continueBtn.style.cssText = `
        padding: 8px 16px; background: #2ecc71; color: white;
        border: none; border-radius: 4px; cursor: pointer; font-size: 14px;
      `
      continueBtn.addEventListener('click', () => this.callbacks.onContinue(i))
      row.appendChild(continueBtn)

      const deleteBtn = document.createElement('button')
      deleteBtn.id = `delete-btn-${i}`
      deleteBtn.textContent = '✕'
      deleteBtn.style.cssText = `
        padding: 8px 12px; background: #e74c3c; color: white;
        border: none; border-radius: 4px; cursor: pointer; font-size: 14px;
      `
      deleteBtn.addEventListener('click', () => this.callbacks.onDelete(i))
      row.appendChild(deleteBtn)

      slotContainer.appendChild(row)
    }

    // New World section
    const newWorld = document.createElement('div')
    newWorld.id = 'new-world-section'
    newWorld.style.cssText = `
      margin-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 8px;
    `
    const newLabel = document.createElement('p')
    newLabel.textContent = 'Create New World'
    newLabel.style.cssText = 'font-size: 14px; color: #aaa;'
    newWorld.appendChild(newLabel)

    const seedInput = document.createElement('input')
    seedInput.id = 'seed-input'
    seedInput.type = 'number'
    seedInput.placeholder = 'Seed (leave empty for random)'
    seedInput.style.cssText = `
      padding: 8px; width: 300px; background: rgba(0,0,0,0.5);
      color: white; border: 1px solid rgba(255,255,255,0.3);
      border-radius: 4px; font-size: 14px;
    `
    newWorld.appendChild(seedInput)

    const createBtn = document.createElement('button')
    createBtn.id = 'create-world-btn'
    createBtn.textContent = 'Create New World'
    createBtn.style.cssText = `
      padding: 10px 30px; background: #3498db; color: white;
      border: none; border-radius: 4px; cursor: pointer; font-size: 16px;
    `
    createBtn.addEventListener('click', () => {
      this.callbacks.onNewWorld(0)
    })
    newWorld.appendChild(createBtn)

    container.appendChild(newWorld)

    return container
  }

  refreshSlots(): void {
    const slots = this.saveService.getSlots()
    for (let i = 0; i < 3; i++) {
      const meta = slots[i]
      const info = document.getElementById(`slot-info-${i}`)
      const continueBtn = document.getElementById(`continue-btn-${i}`) as HTMLButtonElement | null
      if (!info || !continueBtn) continue

      if (meta) {
        info.innerHTML = `
          <div style="font-size:16px;font-weight:bold">${meta.name}</div>
          <div style="font-size:12px;color:#aaa">Seed: ${meta.seed} | Last: ${meta.lastPlayed ? new Date(meta.lastPlayed).toLocaleDateString() : 'N/A'}</div>
          <div style="font-size:11px;color:#888">Mined: ${meta.blocksMined} | Deep: ${meta.deepestY} | Walked: ${Math.floor(meta.distanceWalked)} blocks</div>
          <div style="font-size:10px;color:#666">🏆 ${meta.achievements || 0} achievements</div>
        `
        continueBtn.disabled = false
        continueBtn.style.opacity = '1'
      } else {
        info.innerHTML = `
          <div style="font-size:16px;color:#666">Empty</div>
          <div style="font-size:12px;color:#555">Slot ${i + 1}</div>
        `
        continueBtn.disabled = true
        continueBtn.style.opacity = '0.4'
      }
    }
  }

  remove(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
