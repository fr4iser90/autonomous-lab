import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createShell, type Shell } from './shell'
import { SAVE_KEY } from '../economy/save'

let shells: Shell[] = []

function makeRoot(): HTMLElement {
  const root = document.createElement('main')
  root.id = 'app'
  document.body.appendChild(root)
  return root
}

function makeShell(root: HTMLElement): Shell {
  const shell = createShell(root)
  shells.push(shell)
  return shell
}

afterEach(() => {
  for (const shell of shells.splice(0)) shell.destroy()
  document.body.replaceChildren()
})

describe('app shell (M1)', () => {
  it('starts on the title view', () => {
    const root = makeRoot()
    const shell = makeShell(root)
    expect(shell.current).toBe('title')
    expect(root.querySelector('#title-view')?.classList.contains('hidden')).toBe(false)
    expect(root.querySelector('#play-view')?.classList.contains('hidden')).toBe(true)
  })

  it('title shows game name and Play button', () => {
    const root = makeRoot()
    makeShell(root)
    expect(root.querySelector('.game-title')?.textContent).toBe('Signal Ascent')
    expect(root.querySelector('#play-btn')?.textContent).toBe('Play')
  })

  it('Play button switches to play view with economy panel visible', () => {
    const root = makeRoot()
    const shell = makeShell(root)
    root.querySelector('#play-btn')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(shell.current).toBe('play')
    expect(root.querySelector('#economy-panel')?.classList.contains('hidden')).toBe(false)
    expect(root.querySelector('#signal')?.textContent).toBe('0')
  })

  it('Title button returns to the title view', () => {
    const root = makeRoot()
    const shell = makeShell(root)
    shell.enterPlay()
    root.querySelector('#title-btn')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(shell.current).toBe('title')
  })
})

describe('economy wiring (M2)', () => {
  function enterPlay(root: HTMLElement) {
    const shell = makeShell(root)
    root.querySelector('#play-btn')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    return shell
  }

  it('clicking Harvest Signal raises Signal through the engine', () => {
    const root = makeRoot()
    const shell = enterPlay(root)
    const btn = root.querySelector('#click-signal') as HTMLButtonElement
    for (let i = 0; i < 3; i++) btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(root.querySelector('#signal')?.textContent).toBe('3')
    expect(shell.engine.state.signal.toString()).toBe('3')
  })

  it('big Signal renders with the formatter', () => {
    const root = makeRoot()
    const shell = enterPlay(root)
    for (let i = 0; i < 1233; i++) shell.engine.click()
    const btn = root.querySelector('#click-signal') as HTMLButtonElement
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true })) // 1234th click via DOM
    expect(root.querySelector('#signal')?.textContent).toBe('1.23K')
  })
})

describe('relay list, live loop, autosave stub (M4)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function enterPlay(root: HTMLElement): Shell {
    const shell = makeShell(root)
    root.querySelector('#play-btn')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    return shell
  }

  function clickHarvest(root: HTMLElement, times: number): void {
    const btn = root.querySelector('#click-signal') as HTMLButtonElement
    for (let i = 0; i < times; i++) btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }

  it('lists all three relays with disabled buy buttons at Signal 0', () => {
    const root = makeRoot()
    enterPlay(root)
    const rows = root.querySelectorAll('#relay-list .relay-row')
    expect(rows.length).toBe(3)
    expect(rows[0].getAttribute('data-relay-id')).toBe('whisper')
    for (const id of ['whisper', 'pulse', 'beam']) {
      expect((root.querySelector(`#buy-${id}`) as HTMLButtonElement).disabled).toBe(true)
    }
  })

  it('buying a relay deducts Signal and updates the owned count', () => {
    const root = makeRoot()
    const shell = enterPlay(root)
    clickHarvest(root, 15)
    const buyBtn = root.querySelector('#buy-whisper') as HTMLButtonElement
    expect(buyBtn.disabled).toBe(false)
    buyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect((root.querySelector('.relay-row[data-relay-id="whisper"] .relay-owned') as HTMLElement).textContent).toBe('1')
    expect(root.querySelector('#signal')?.textContent).toBe('0')
    expect(shell.engine.state.relays.whisper).toBe(1)
    // next cost: 15 * 1.15 = 17.25 -> "17.3"
    expect((root.querySelector('.relay-row[data-relay-id="whisper"] .relay-cost') as HTMLElement).textContent).toBe('17.3')
  })

  it('the 20 Hz loop adds production while a relay is owned', () => {
    const root = makeRoot()
    const shell = enterPlay(root)
    clickHarvest(root, 15)
    ;(root.querySelector('#buy-whisper') as HTMLButtonElement).dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(root.querySelector('#rate')?.textContent).toBe('+0.5 / sec')
    // 2 s of game time: 40 ticks x 50 ms -> +1.0 Signal
    vi.advanceTimersByTime(2000)
    expect(shell.engine.state.signal.toString()).toBe('1')
    expect(root.querySelector('#signal')?.textContent).toBe('1')
  })

  it('autosave stub persists engine state + stratum every 15 s', () => {
    const root = makeRoot()
    const shell = enterPlay(root)
    clickHarvest(root, 5)
    expect(localStorage.getItem(SAVE_KEY)).toBeNull()
    vi.advanceTimersByTime(15000)
    const raw = localStorage.getItem(SAVE_KEY)
    expect(raw).not.toBeNull()
    const saved = JSON.parse(raw as string)
    expect(saved.version).toBe(3)
    expect(saved.signal).toBe('5')
    expect(saved.layer).toBe(1)
    expect(saved.upgrades).toEqual({})
    // a fresh shell restores the saved signal
    shell.destroy()
    shells.splice(shells.indexOf(shell), 1)
    const again = makeShell(makeRoot())
    expect(again.engine.state.signal.toString()).toBe('5')
    expect(again.layers.state.layer).toBe(1)
  })

  it('restores a saved stratum (M5)', () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: 2, signal: '42', relays: {}, layer: 3, meta: { savedAt: 1 } }),
    )
    const root = makeRoot()
    const shell = enterPlay(root)
    expect(shell.layers.state.layer).toBe(3)
    expect(shell.layers.def.id).toBe(3)
    expect(root.querySelector('#signal')?.textContent).toBe('42')
  })
})

describe('shop tabs + Resonators (M6)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function enterPlay(root: HTMLElement): Shell {
    const shell = makeShell(root)
    root.querySelector('#play-btn')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    return shell
  }

  function clickHarvest(root: HTMLElement, times: number): void {
    const btn = root.querySelector('#click-signal') as HTMLButtonElement
    for (let i = 0; i < times; i++) btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }

  it('defaults to the Relays tab; Resonators tab reveals the upgrade list', () => {
    const root = makeRoot()
    enterPlay(root)
    expect((root.querySelector('#tab-relays') as HTMLButtonElement).classList.contains('active')).toBe(true)
    expect((root.querySelector('#tab-upgrades') as HTMLButtonElement).classList.contains('active')).toBe(false)
    expect(root.querySelector('#generators-panel')?.classList.contains('hidden')).toBe(false)
    expect(root.querySelector('#upgrades-panel')?.classList.contains('hidden')).toBe(true)
    ;(root.querySelector('#tab-upgrades') as HTMLButtonElement).dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(root.querySelector('#upgrades-panel')?.classList.contains('hidden')).toBe(false)
    expect(root.querySelector('#generators-panel')?.classList.contains('hidden')).toBe(true)
    expect(root.querySelectorAll('#upgrade-list .upgrade-row').length).toBe(6)
    // nothing affordable at Signal 0
    for (const id of ['amp', 'overdrive', 'whisper-harmonics', 'pulse-resonance', 'beam-alignment', 'global-resonance']) {
      expect((root.querySelector(`#buy-${id}`) as HTMLButtonElement).disabled).toBe(true)
    }
  })

  it('buying an upgrade from the DOM deducts Signal and marks it Attuned', () => {
    const root = makeRoot()
    const shell = enterPlay(root)
    clickHarvest(root, 100)
    ;(root.querySelector('#tab-upgrades') as HTMLButtonElement).dispatchEvent(new MouseEvent('click', { bubbles: true }))
    const buyBtn = root.querySelector('#buy-amp') as HTMLButtonElement
    expect(buyBtn.disabled).toBe(false)
    buyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(root.querySelector('#signal')?.textContent).toBe('0')
    expect(buyBtn.textContent).toBe('Attuned')
    expect(buyBtn.disabled).toBe(true)
    expect(shell.engine.isUpgradeOwned('amp')).toBe(true)
    // click power is now ×2
    clickHarvest(root, 1)
    expect(root.querySelector('#signal')?.textContent).toBe('2')
    expect((root.querySelector('#click-signal') as HTMLButtonElement).textContent).toBe('Harvest Signal (+2)')
  })

  it('restores saved upgrades (M6)', () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 3,
        signal: '5',
        relays: {},
        layer: 1,
        upgrades: { amp: true },
        meta: { savedAt: 1 },
      }),
    )
    const root = makeRoot()
    const shell = enterPlay(root)
    expect(shell.engine.clickPower().toString()).toBe('2')
    ;(root.querySelector('#tab-upgrades') as HTMLButtonElement).dispatchEvent(new MouseEvent('click', { bubbles: true }))
    const buyBtn = root.querySelector('#buy-amp') as HTMLButtonElement
    expect(buyBtn.textContent).toBe('Attuned')
    expect(buyBtn.disabled).toBe(true)
  })
})

describe('layer strip (M7)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function enterPlay(root: HTMLElement): Shell {
    const shell = makeShell(root)
    root.querySelector('#play-btn')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    return shell
  }

  it('shows the strip with the live stratum at layer 1', () => {
    const root = makeRoot()
    enterPlay(root)
    expect(root.querySelector('#layer-strip')?.classList.contains('hidden')).toBe(false)
    expect(root.querySelector('#here')?.textContent).toBe('You are here: Echo Hollow')
    const chips = root.querySelectorAll('#layer-strip .layer-chip')
    expect(chips.length).toBe(3) // window clamped at the low end: layers 1..3
    expect(root.querySelector('.layer-chip[data-layer-chip="1"]')?.textContent).toContain('Echo Hollow')
    expect(root.querySelector('.layer-chip[data-layer-chip="1"]')?.classList.contains('active')).toBe(true)
    expect(root.querySelector('.layer-chip[data-layer-chip="2"]')?.classList.contains('active')).toBe(false)
    const nextLine = root.querySelector('.layer-next')
    expect(nextLine?.textContent).toContain('Halo Hollow')
    expect(nextLine?.textContent).toContain('1.00M')
  })

  it('re-renders the strip for a restored stratum (layer 3)', () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 3,
        signal: '42',
        relays: {},
        layer: 3,
        upgrades: {},
        meta: { savedAt: 1 },
      }),
    )
    const root = makeRoot()
    const shell = enterPlay(root)
    expect(shell.layers.state.layer).toBe(3)
    expect(root.querySelector('#here')?.textContent).toBe('You are here: Drift Hollow')
    const chips = root.querySelectorAll('#layer-strip .layer-chip')
    expect(chips.length).toBe(5) // layers 1..5 around the current
    expect(root.querySelector('.layer-chip[data-layer-chip="3"]')?.classList.contains('active')).toBe(true)
    const nextLine = root.querySelector('.layer-next')
    expect(nextLine?.textContent).toContain('Veil Hollow')
    expect(nextLine?.textContent).toContain('100M')
  })
})
