/** P8-3: ToastSystem unit tests */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { showToast, dismissToast, clearToasts, _reset } from '../src/systems/ToastSystem'

// Helper to flush toast exit animations — jsdom doesn't fire transitionend
function flushToasts() {
  const container = document.getElementById('toast-container')
  container?.querySelectorAll<HTMLDivElement>('.toast.toast-exit').forEach(el => {
    el.dispatchEvent(new Event('transitionend'))
  })
}

describe('ToastSystem', () => {
  beforeEach(() => {
    _reset()
    // jsdom has no rAF — run callbacks synchronously so toast-enter is added
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    _reset()
  })

  it('showToast creates a toast element in the container', () => {
    const id = showToast('Test message')
    expect(id).toBe(1)
    const container = document.getElementById('toast-container')
    expect(container).not.toBeNull()
    const toast = container!.querySelector('.toast')
    expect(toast).not.toBeNull()
    expect(toast?.textContent).toBe('Test message')
  })

  it('showToast returns incrementing IDs', () => {
    const id1 = showToast('First')
    const id2 = showToast('Second')
    expect(id2).toBe(id1 + 1)
  })

  it('showToast with type applies correct CSS class', () => {
    showToast('Loot!', { type: 'loot' })
    const toast = document.querySelector('.toast-loot')
    expect(toast).not.toBeNull()
  })

  it('showToast with className adds extra class', () => {
    showToast('Rare item!', { type: 'loot', className: 'rarity-rare' })
    const toast = document.querySelector('.toast.rarity-rare')
    expect(toast).not.toBeNull()
  })

  it('showToast adds visible and toast-enter classes', () => {
    const id = showToast('Animated toast')
    const toast = document.querySelector<HTMLDivElement>(`.toast[data-id="${id}"]`)
    expect(toast).not.toBeNull()
    expect(toast!.classList.contains('visible')).toBe(true)
    expect(toast!.classList.contains('toast-enter')).toBe(true)
  })

  it('clearToasts removes all toasts', () => {
    showToast('First')
    showToast('Second')
    showToast('Third')
    clearToasts()
    flushToasts()
    const container = document.getElementById('toast-container')
    const remaining = container?.querySelectorAll('.toast')
    expect(remaining?.length).toBe(0)
  })

  it('dismissToast removes a specific toast by id', () => {
    const id1 = showToast('Keep me')
    showToast('Remove me')
    dismissToast(id1)
    flushToasts()
    const container = document.getElementById('toast-container')
    const remaining = container?.querySelectorAll('.toast')
    expect(remaining?.length).toBe(1)
    expect(remaining?.[0]?.dataset.id).toBe('2')
  })

  it('toasts have the correct duration set', () => {
    const id = showToast('Temp', { duration: 5000 })
    const toast = document.querySelector<HTMLDivElement>(`.toast[data-id="${id}"]`)
    expect(toast).not.toBeNull()
    expect(parseInt(toast!.dataset.timerId || '0', 10)).toBeGreaterThan(0)
  })
})
