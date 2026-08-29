/** Toast notification system — P8-3: stacking toasts with fade/slide animations */

const MAX_STACK = 4
let _nextId = 0
let _container: HTMLDivElement | null = null

/** Ensure the toast container exists in the DOM. */
function getContainer(): HTMLDivElement {
  if (!_container || !_container.isConnected) {
    _container = document.createElement('div')
    _container.id = 'toast-container'
    _container.className = 'toast-container'
    document.body.appendChild(_container)
  }
  return _container
}

/** Test-only reset: clears all internal state. */
export function _reset(): void {
  _nextId = 0
  if (_container && _container.isConnected) {
    _container.remove()
  }
  _container = null
}

/** Dismiss a specific toast by ID. */
export function dismissToast(id: number): void {
  const container = getContainer()
  const el = container.querySelector<HTMLDivElement>(`.toast[data-id="${id}"]`)
  if (!el) return
  const timerId = parseInt(el.dataset.timerId || '0', 10)
  if (timerId) clearTimeout(timerId)
  el.classList.remove('toast-enter', 'visible')
  el.classList.add('toast-exit')
  el.addEventListener('transitionend', () => {
    if (el.parentElement) el.parentElement.removeChild(el)
  })
}

/** Show a toast notification with stacking, fade-in, and auto-dismiss. */
export function showToast(message: string, options: { type?: string; duration?: number; className?: string } = {}): number {
  const id = ++_nextId
  const type = options.type || 'info'
  const duration = options.duration ?? 3000
  const container = getContainer()

  const el = document.createElement('div') as HTMLDivElement
  el.className = `toast toast-${type} visible`
  if (options.className) el.classList.add(options.className)
  el.textContent = message
  el.dataset.id = String(id)

  // Slide-in animation
  requestAnimationFrame(() => {
    el.classList.add('toast-enter')
  })

  container.appendChild(el)

  // Enforce max stack — remove oldest
  const items = container.querySelectorAll<HTMLDivElement>('.toast')
  if (items.length > MAX_STACK) {
    const oldest = items[0]
    const oldestId = parseInt(oldest.dataset.id || '0', 10)
    dismissToast(oldestId)
  }

  // Auto-dismiss
  const timer = setTimeout(() => {
    dismissToast(id)
  }, duration)

  el.dataset.timerId = String(timer)
  return id
}

/** Clear all visible toasts. */
export function clearToasts(): void {
  const container = getContainer()
  const items = container.querySelectorAll<HTMLDivElement>('.toast')
  items.forEach(item => {
    const id = parseInt(item.dataset.id || '0', 10)
    if (id) dismissToast(id)
  })
}
