/**
 * Signal Ascent — view builders.
 * M2: play view is live for the economy — all click math goes through
 *     EconomyEngine (never DOM-only formulas); views only render engine state.
 * M4: main PLAY UI — big click, live rate, relay list with buy buttons,
 *     autosave stub wired in the shell (not in the view).
 */
import { EconomyEngine } from '../economy/engine'
import { RELAYS } from '../data/generators'
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

export interface PlayView {
  readonly root: HTMLElement
  /** Re-render every engine-owned number (called by the 20 Hz shell loop). */
  render: () => void
}

export function buildPlayView(engine: EconomyEngine): PlayView {
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
        <p id="economy-note" class="muted">Relays produce Signal every second. Progress autosaves.</p>
      </section>
      <aside id="side-panels" aria-label="Panels">
        <nav id="layer-strip" class="hidden" aria-label="Layer navigator"></nav>
        <section id="generators-panel" class="panel" aria-label="Relays">
          <h2 class="panel-title">Relays</h2>
          <ul id="relay-list" class="relay-list">
            ${RELAYS.map((r) => `
              <li class="relay-row" data-relay-id="${r.id}">
                <div class="relay-main">
                  <p class="relay-name">${r.name}</p>
                  <p class="relay-flavor muted">${r.flavor}</p>
                  <p class="relay-stat muted"><span class="relay-owned">0</span> owned · +${format(r.baseRate)}/s each</p>
                </div>
                <div class="relay-buy">
                  <p class="relay-cost">${format(r.baseCost)}</p>
                  <button id="buy-${r.id}" class="ghost" type="button" disabled>Buy</button>
                </div>
              </li>`).join('')}
          </ul>
        </section>
        <section id="upgrades-panel" class="panel hidden" aria-label="Upgrades"></section>
        <section id="prestige-panel" class="panel hidden" aria-label="Ascension"></section>
      </aside>
    </div>
  `

  const signalEl = section.querySelector('#signal') as HTMLElement
  const rateEl = section.querySelector('#rate') as HTMLElement
  const clickBtn = section.querySelector('#click-signal') as HTMLButtonElement

  function render(): void {
    signalEl.textContent = format(engine.state.signal)
    rateEl.textContent = `+${format(engine.productionPerSec())} / sec`
    for (const def of RELAYS) {
      const row = section.querySelector(`.relay-row[data-relay-id="${def.id}"]`)
      if (!row) continue
      const owned = engine.state.relays[def.id] ?? 0
      ;(row.querySelector('.relay-owned') as HTMLElement).textContent = String(owned)
      const cost = engine.relayCost(def.id)
      ;(row.querySelector('.relay-cost') as HTMLElement).textContent = format(cost)
      ;(row.querySelector(`#buy-${def.id}`) as HTMLButtonElement).disabled = engine.state.signal.lt(cost)
    }
  }

  clickBtn.addEventListener('click', () => {
    engine.click()
    render()
  })

  for (const def of RELAYS) {
    const buyBtn = section.querySelector(`#buy-${def.id}`) as HTMLButtonElement
    buyBtn.addEventListener('click', () => {
      engine.buyRelay(def.id)
      render()
    })
  }

  render()

  return { root: section, render }
}
