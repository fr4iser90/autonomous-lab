import { describe, expect, it } from 'vitest'
import { createShell } from './shell'

function makeRoot(): HTMLElement {
  const root = document.createElement('main')
  root.id = 'app'
  document.body.appendChild(root)
  return root
}

describe('app shell (M1)', () => {
  it('starts on the title view', () => {
    const root = makeRoot()
    const shell = createShell(root)
    expect(shell.current).toBe('title')
    expect(root.querySelector('#title-view')?.classList.contains('hidden')).toBe(false)
    expect(root.querySelector('#play-view')?.classList.contains('hidden')).toBe(true)
  })

  it('title shows game name and Play button', () => {
    const root = makeRoot()
    createShell(root)
    expect(root.querySelector('.game-title')?.textContent).toBe('Signal Ascent')
    expect(root.querySelector('#play-btn')?.textContent).toBe('Play')
  })

  it('Play button switches to play view with economy panel visible', () => {
    const root = makeRoot()
    const shell = createShell(root)
    root.querySelector('#play-btn')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(shell.current).toBe('play')
    expect(root.querySelector('#economy-panel')?.classList.contains('hidden')).toBe(false)
    expect(root.querySelector('#signal')?.textContent).toBe('0')
  })

  it('Title button returns to the title view', () => {
    const root = makeRoot()
    const shell = createShell(root)
    shell.enterPlay()
    root.querySelector('#title-btn')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(shell.current).toBe('title')
  })
})
