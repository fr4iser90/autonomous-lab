// InstructionsOverlay: First-time instructions for new players

export class InstructionsOverlay {
  private container: HTMLElement

  constructor(onDismiss: () => void) {
    this.container = document.createElement('div')
    this.container.id = 'instructions-overlay'
    this.container.style.cssText = `
      position: fixed; inset: 0; z-index: 200;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.7);
    `

    const panel = document.createElement('div')
    panel.style.cssText = `
      background: #2c2c2c; color: white; padding: 30px; border-radius: 12px;
      max-width: 500px; font-family: 'Courier New', monospace;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `

    panel.innerHTML = `
      <h2 style="margin-top:0;color:#4fc3f7">Welcome to VoxelCraft!</h2>
      <p>Your infinite voxel sandbox world awaits.</p>
      <h3 style="color:#4fc3f7">Controls:</h3>
      <ul style="line-height:2">
        <li><b>WASD</b> - Move</li>
        <li><b>Space</b> - Jump</li>
        <li><b>Shift</b> - Sprint</li>
        <li><b>Left Click</b> - Break block</li>
        <li><b>Right Click</b> - Place block</li>
        <li><b>1-9</b> - Select hotbar slot</li>
        <li><b>E</b> - Open inventory</li>
        <li><b>ESC</b> - Release mouse / pause</li>
      </ul>
      <p style="color:#aaa;font-size:13px">Click anywhere to start playing!</p>
    `

    panel.addEventListener('click', onDismiss)
    this.container.appendChild(panel)
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) onDismiss()
    })
    document.body.appendChild(this.container)
  }

  dismiss(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
