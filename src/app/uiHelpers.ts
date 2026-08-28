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

/** P4-4: Update trap hit indicator */
export function updateTrapHit(active: boolean, trapType: string | null): void {
  const el = document.getElementById('trap-hit-label')
  if (!el) return
  if (active && trapType) {
    const colors: Record<string, string> = {
      spike: '#ff4444',
      poison: '#44ff44',
      fire: '#ff8800',
    }
    el.textContent = `⚠ ${trapType.toUpperCase()} TRAP!`
    el.style.color = colors[trapType] || '#ff4444'
    el.style.opacity = '1'
  } else {
    el.style.opacity = '0'
  }
}
