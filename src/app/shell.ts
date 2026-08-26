/**
 * Signal Ascent — app shell (view state machine).
 * title <-> play. No economy math here (EconomyEngine lands M2).
 */
import { buildPlayView, buildTitleView } from './views'

export type View = 'title' | 'play'

export interface Shell {
  readonly current: View
  enterPlay: () => void
  returnToTitle: () => void
}

export function createShell(root: HTMLElement): Shell {
  const titleView = buildTitleView()
  const playView = buildPlayView()
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
    enterPlay: () => show('play'),
    returnToTitle: () => show('title'),
  }
}
