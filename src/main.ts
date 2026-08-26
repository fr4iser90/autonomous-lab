/**
 * Signal Ascent — entry point (M1: title + play shell).
 */
import { createShell, type Shell } from './app/shell'

interface GameDebug {
  shell: Shell
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
window.__SIGNAL_ASCENT__ = { shell }
