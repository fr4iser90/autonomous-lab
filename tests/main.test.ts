import { describe, it, expect } from 'vitest'
import { updateHP, updateFloor } from '../src/app/uiHelpers'

describe('uiHelpers', () => {
  beforeEach(() => {
    // Create minimal DOM elements for tests
    document.body.innerHTML = `
      <div class="hp-bar">
        <span class="hp-track"><div id="hp-fill"></div></span>
        <span id="hp-text"></span>
      </div>
      <div id="floor-label"></div>
      <div id="depth-label"></div>
    `
  })

  it('updateHP sets correct fill width', () => {
    updateHP(10, 20)
    const fill = document.getElementById('hp-fill')!
    expect(fill.style.width).toBe('50%')
  })

  it('updateHP handles full HP', () => {
    updateHP(20, 20)
    const fill = document.getElementById('hp-fill')!
    expect(fill.style.width).toBe('100%')
  })

  it('updateHP handles zero HP', () => {
    updateHP(0, 20)
    const fill = document.getElementById('hp-fill')!
    expect(fill.style.width).toBe('0%')
  })

  it('updateHP clamps negative to 0%', () => {
    updateHP(-5, 20)
    const fill = document.getElementById('hp-fill')!
    expect(fill.style.width).toBe('0%')
  })

  it('updateHP clamps over-HP to 100%', () => {
    updateHP(30, 20)
    const fill = document.getElementById('hp-fill')!
    expect(fill.style.width).toBe('100%')
  })

  it('updateHP shows correct text', () => {
    updateHP(15, 20)
    const text = document.getElementById('hp-text')!
    expect(text.textContent).toBe('15/20')
  })

  it('updateHP shows 0 when negative', () => {
    updateHP(-5, 20)
    const text = document.getElementById('hp-text')!
    expect(text.textContent).toBe('0/20')
  })

  it('updateFloor sets floor label', () => {
    updateFloor(5)
    const label = document.getElementById('floor-label')!
    expect(label.textContent).toBe('Floor 5')
  })

  it('updateFloor handles floor 1', () => {
    updateFloor(1)
    const label = document.getElementById('floor-label')!
    expect(label.textContent).toBe('Floor 1')
  })
})
