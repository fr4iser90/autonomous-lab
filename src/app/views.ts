/**
 * Signal Ascent — view builders.
 * M2: the play view is live for the economy — all click math goes through
 * EconomyEngine (never DOM-only formulas); views only render engine state.
 */
import { EconomyEngine } from '../economy/engine'
import { format } from '../economy/format'

export function buildTitleView(): HTMLElement {
  const section = document.createElement('section')
  section.id = 'title-view'
  section.className = 'view'
  section.innerHTML = `
    <p class="eyebrow">strata · prestige · signal</p>
    <h1 class="game-title">Signal Ascent</h1>
    <p class="tagline">Harvest cosmic Signal. Build Relays. Ascend through the Strata.</p>
    <button id="play-btn" type="button">Play</button>
  `
  return section
}

export function buildPlayView(engine: EconomyEngine): HTMLElement {
  const section = document.createElement('section')
  section.id = 'play-view'
  section.className = 'view hidden'
  section.innerHTML = `
    <header id="play-header">
      <h1 class="game-title small">Signal Ascent</h1>
      <p id="here" class="muted">You are here: Stratum 1</p>
      <button id="title-btn" type="button" class="ghost">Title</button>
    </header>
    <div id="play-body">
      <section id="economy-panel" class="panel" aria-label="Economy">
        <p class="label">Signal</p>
        <p id="signal" class="stat">0</p>
        <p id="rate" class="muted">+0 / sec</p>
        <button id="click-signal" type="button">Harvest Signal (+1)</button>
        <p id="economy-note" class="muted">Every click harvests Signal. Relays come next.</p>
      </section>
      <aside id="side-panels" aria-label="Panels">
        <nav id="layer-strip" class="hidden" aria-label="Layer navigator"></nav>
        <section id="generators-panel" class="panel hidden" aria-label="Relays"></section>
        <section id="upgrades-panel" class="panel hidden" aria-label="Upgrades"></section>
        <section id="prestige-panel" class="panel hidden" aria-label="Ascension"></section>
      </aside>
    </div>
  `

  const signalEl = section.querySelector('#signal') as HTMLElement
  const clickBtn = section.querySelector('#click-signal') as HTMLButtonElement

  function renderSignal(): void {
    signalEl.textContent = format(engine.state.signal)
  }

  clickBtn.addEventListener('click', () => {
    engine.click()
    renderSignal()
  })
  renderSignal()

  return section
}
