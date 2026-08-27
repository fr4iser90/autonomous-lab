/**
 * Signal Ascent — app shell (view state machine).
 * title <-> play. Owns the single EconomyEngine; views render its state.
 */
import { EconomyEngine } from '../economy/engine'
import { buildPlayView, buildTitleView } from './views'

export type View = 'title' | 'play'

export interface Shell {
  readonly current: View
  readonly engine: EconomyEngine
  enterPlay: () => void
  returnToTitle: () => void
}

export function createShell(root: HTMLElement): Shell {
  const engine = new EconomyEngine()
  const titleView = buildTitleView()
  const playView = buildPlayView(engine)
  let current: View = 'title'

  function show(view: View): void {
    current = view
    titleView.classList.toggle('hidden', view !== 'title')
    playView.classList.toggle('hidden', view !== 'play')
  }

  titleView.querySelector('#play-btn')?.addEventListener('click', () => show('play'))
  playView.querySelector('#title-btn')?.addEventListener('click', () => show('title'))

  root.replaceChildren(titleView, playView)
  show('title')

  return {
    get current(): View {
      return current
    },
    engine,
    enterPlay: () => show('play'),
    returnToTitle: () => show('title'),
  }
}
