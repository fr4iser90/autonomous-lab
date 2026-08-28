/** Pure UI helper functions — no DOM access, testable in jsdom */

export function updateHP(current: number, max: number): void {
  const fill = document.getElementById('hp-fill')
  const text = document.getElementById('hp-text')
  if (fill) {
    const pct = Math.max(0, Math.min(100, (current / max) * 100))
    fill.style.width = pct + '%'
  }
  if (text) {
    text.textContent = `${Math.max(0, current)}/${max}`
  }
}

export function updateFloor(floor: number): void {
  const label = document.getElementById('floor-label')
  if (label) {
    label.textContent = `Floor ${floor}`
  }
}

export function updateDepth(depth: number): void {
  const label = document.getElementById('depth-label')
  if (label) {
    label.textContent = `Depth: ${depth}`
  }
}

/** P4-3: Update stealth zone indicator */
export function updateStealth(inStealth: boolean): void {
  const label = document.getElementById('stealth-label')
  if (label) {
    label.textContent = inStealth ? 'Stealth: Hidden' : 'Stealth: Visible'
    label.style.color = inStealth ? '#66aaff' : '#e8dcc8'
  }
}
