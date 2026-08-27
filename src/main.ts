/**
 * Signal Ascent — entry point (M1: title + play shell).
 */
import { createShell, type Shell } from './app/shell'
import { Decimal } from 'decimal.js'

interface GameDebug {
  shell: Shell
  dev?: { setSignal: (n: number) => void; ascend: () => void }
}

declare global {
  interface Window {
    __SIGNAL_ASCENT__?: GameDebug
  }
}

const root = document.querySelector('#app')
if (!(root instanceof HTMLElement)) {
  throw new Error('Missing required #app root element')
}

const shell = createShell(root)
const debug: GameDebug = {
  shell,
  dev: {
    setSignal: (n: number) => { shell.engine.state.signal = new Decimal(n) },
    ascend: () => { shell.ascend() },
  },
}
window.__SIGNAL_ASCENT__ = debug
