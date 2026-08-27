/**
 * Signal Ascent — app shell (view state machine).
 * title <-> play. Owns the single EconomyEngine + LayerEngine; views
 * render engine state. M4: restores from the save stub, runs the fixed
 * 20 Hz economy loop (step + re-render), autosaves every 15 s.
 * M5: the stratum (LayerEngine) is restored/saved alongside the economy.
 * M7: the play view renders the layer strip (live stratum window) from it.
 */
import { EconomyEngine } from '../economy/engine'
import { LayerEngine } from '../economy/layers'
import { loadEngineState, saveEngineState } from '../economy/save'
import { buildPlayView, buildTitleView, type PlayView } from './views'

export type View = 'title' | 'play'

export interface Shell {
  readonly current: View
  readonly engine: EconomyEngine
  readonly layers: LayerEngine
  enterPlay: () => void
  returnToTitle: () => void
  destroy: () => void
}

export interface ShellOptions {
  /** Economy tick period in ms (fixed 20 Hz by design). */
  tickMs?: number
  /** Autosave period in ms. */
  autosaveMs?: number
}

export const TICK_MS = 50
export const AUTOSAVE_MS = 15_000

export function createShell(root: HTMLElement, options: ShellOptions = {}): Shell {
  const tickMs = options.tickMs ?? TICK_MS
  const autosaveMs = options.autosaveMs ?? AUTOSAVE_MS
  const loaded = loadEngineState()
  const engine = new EconomyEngine(
    loaded
      ? { signal: loaded.signal, relays: loaded.relays, upgrades: loaded.upgrades }
      : {},
  )
  const layers = new LayerEngine(loaded ? { layer: loaded.layer } : {})
  const titleView = buildTitleView()
  const playView: PlayView = buildPlayView(engine, layers)
  let current: View = 'title'

  // M6: shop tabs — Relays (default) and Resonators panels, one visible.
  const generatorsPanel = playView.root.querySelector('#generators-panel') as HTMLElement
  const upgradesPanel = playView.root.querySelector('#upgrades-panel') as HTMLElement
  const tabRelays = playView.root.querySelector('#tab-relays') as HTMLButtonElement
  const tabUpgrades = playView.root.querySelector('#tab-upgrades') as HTMLButtonElement
  function setShopTab(tab: 'relays' | 'upgrades'): void {
    generatorsPanel.classList.toggle('hidden', tab !== 'relays')
    upgradesPanel.classList.toggle('hidden', tab !== 'upgrades')
    tabRelays.classList.toggle('active', tab === 'relays')
    tabUpgrades.classList.toggle('active', tab === 'upgrades')
  }

  function show(view: View): void {
    current = view
    titleView.classList.toggle('hidden', view !== 'title')
    playView.root.classList.toggle('hidden', view !== 'play')
  }

  // Fixed 20 Hz economy loop: advance the engine, then render play state.
  const tickTimer = setInterval(() => {
    engine.step(tickMs / 1000)
    if (current === 'play') playView.render()
  }, tickMs)
  // Autosave stub (M4/M5): persist engine state + stratum on an interval.
  const saveTimer = setInterval(
    () => saveEngineState(engine.state, layers.state.layer),
    autosaveMs,
  )

  titleView.querySelector('#play-btn')?.addEventListener('click', () => show('play'))
  playView.root.querySelector('#title-btn')?.addEventListener('click', () => show('title'))
  tabRelays.addEventListener('click', () => setShopTab('relays'))
  tabUpgrades.addEventListener('click', () => setShopTab('upgrades'))

  root.replaceChildren(titleView, playView.root)
  show('title')

  return {
    get current(): View {
      return current
    },
    engine,
    layers,
    enterPlay: () => show('play'),
    returnToTitle: () => show('title'),
    destroy: () => {
      clearInterval(tickTimer)
      clearInterval(saveTimer)
    },
  }
}
