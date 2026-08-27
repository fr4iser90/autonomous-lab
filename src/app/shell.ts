/**
 * Signal Ascent — app shell (view state machine).
 * title <-> play. Owns the single EconomyEngine; views render its state.
 * M4: restores state from the save stub, runs the fixed 20 Hz economy
 * loop (step + re-render), and autosaves every 15 s.
 */
import { EconomyEngine } from '../economy/engine'
import { loadEngineState, saveEngineState } from '../economy/save'
import { buildPlayView, buildTitleView, type PlayView } from './views'

export type View = 'title' | 'play'

export interface Shell {
  readonly current: View
  readonly engine: EconomyEngine
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
  const engine = new EconomyEngine(loadEngineState() ?? {})
  const titleView = buildTitleView()
  const playView: PlayView = buildPlayView(engine)
  let current: View = 'title'

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
  // Autosave stub (M4): persist engine state on an interval.
  const saveTimer = setInterval(() => saveEngineState(engine.state), autosaveMs)

  titleView.querySelector('#play-btn')?.addEventListener('click', () => show('play'))
  playView.root.querySelector('#title-btn')?.addEventListener('click', () => show('title'))

  root.replaceChildren(titleView, playView.root)
  show('title')

  return {
    get current(): View {
      return current
    },
    engine,
    enterPlay: () => show('play'),
    returnToTitle: () => show('title'),
    destroy: () => {
      clearInterval(tickTimer)
      clearInterval(saveTimer)
    },
  }
}
