/**
 * Signal Ascent — view builders.
 * M2: play view is live for the economy — all click math goes through
 *     EconomyEngine (never DOM-only formulas); views only render engine state.
 * M4: main PLAY UI — big click, live rate, relay list with buy buttons,
 *     autosave stub wired in the shell (not in the view).
 * M6: shop tabs (Relays / Resonators) + Resonator upgrade list with buy.
 * M7: layer strip always visible — live stratum window (5 chips) + next-threshold.
 * M8: Ascend (prestige) panel — visible once the layer threshold is met, shows
 *     the Harmonic reward, ascends through the `onAscend` callback (the shell
 *     orchestrates the slice wipe + multiplier update; the view only renders
 *     and forwards clicks).
 * M10: buy-max toggle on generators panel — checkbox switches between buying
 *     single units (default) and buying as many as affordable in one click.
 */
import { Decimal } from 'decimal.js'
import { EconomyEngine } from '../economy/engine'
import { RELAYS, getRelay } from '../data/generators'
import { UPGRADES, type UpgradeEffect } from '../data/upgrades'
import { format } from '../economy/format'
import { LAYER_CAP, layerDef } from '../data/layers'
import { harmonicReward, LayerEngine } from '../economy/layers'

/** Short human description of an upgrade effect (render only — M6). */
function upgradeEffectText(effect: UpgradeEffect): string {
  switch (effect.kind) {
    case 'click-mult':
      return `Click ×${effect.value}`
    case 'relay-mult':
      return `${getRelay(effect.relayId)?.name ?? effect.relayId} ×${effect.value}`
    case 'global-mult':
      return `All output ×${effect.value}`
  }
}

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

export function buildPlayView(
  engine: EconomyEngine,
  layers: LayerEngine,
  onAscend: () => void,
): PlayView {
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
        <nav id="layer-strip" aria-label="Layer navigator"></nav>
        <nav id="shop-tabs" aria-label="Shop tabs">
          <button id="tab-relays" type="button" class="shop-tab active">Relays</button>
          <button id="tab-upgrades" type="button" class="shop-tab">Resonators</button>
        </nav>
        <section id="generators-panel" class="panel" aria-label="Relays">
          <div class="panel-title-wrap">
            <h2 class="panel-title">Relays</h2>
            <label class="buy-max-label">
              <input type="checkbox" id="buy-max-toggle" />
              <span>Buy Max</span>
            </label>
          </div>
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
        <section id="upgrades-panel" class="panel hidden" aria-label="Resonators">
          <h2 class="panel-title">Resonators</h2>
          <ul id="upgrade-list" class="relay-list">
            ${UPGRADES.map((u) => `
              <li class="upgrade-row" data-upgrade-id="${u.id}">
                <div class="relay-main">
                  <p class="relay-name">${u.name}</p>
                  <p class="relay-flavor muted">${u.flavor}</p>
                  <p class="relay-stat muted">${upgradeEffectText(u.effect)}</p>
                </div>
                <div class="relay-buy">
                  <p class="relay-cost">${format(u.cost)}</p>
                  <button id="buy-${u.id}" class="ghost" type="button" disabled>Attune</button>
                </div>
              </li>`).join('')}
          </ul>
        </section>
        <section id="prestige-panel" class="panel hidden" aria-label="Ascension">
          <h2 class="panel-title">Ascend</h2>
          <p id="prestige-reward" class="muted"></p>
          <p id="prestige-note" class="muted">Resets this layer's Signal, Relays and Resonators. Each Harmony permanently boosts all output +2%.</p>
          <button id="ascend-btn" type="button" disabled>Ascend</button>
        </section>
      </aside>
    </div>
  `

  const signalEl = section.querySelector('#signal') as HTMLElement
  const rateEl = section.querySelector('#rate') as HTMLElement
  const clickBtn = section.querySelector('#click-signal') as HTMLButtonElement
  const hereEl = section.querySelector('#here') as HTMLElement
  const stripEl = section.querySelector('#layer-strip') as HTMLElement
  const prestigePanel = section.querySelector('#prestige-panel') as HTMLElement
  const prestigeReward = section.querySelector('#prestige-reward') as HTMLElement
  const ascendBtn = section.querySelector('#ascend-btn') as HTMLButtonElement
  const buyMaxCheckbox = section.querySelector('#buy-max-toggle') as HTMLInputElement
  let buyMax = false
  let renderedLayer = -1

  // M7: stratum window around the current layer (rebuild only on layer change).
  function renderStrip(): void {
    if (renderedLayer === layers.state.layer) return
    renderedLayer = layers.state.layer
    const curId = layers.state.layer
    const cur = layers.def
    hereEl.textContent = `You are here: ${cur.name}`
    const start = Math.max(1, curId - 2)
    const end = Math.min(LAYER_CAP, curId + 2)
    const chips: string[] = []
    for (let n = start; n <= end; n++) {
      const d = layerDef(n)
      const cls = n === curId ? 'layer-chip active' : 'layer-chip'
      chips.push(`<span class="${cls}" data-layer-chip="${n}" title="${d.flavor}">${n} · ${d.name}</span>`)
    }
    const next = layers.next
    const nextLine = next
      ? `<p class="layer-next muted">Next stratum: ${next.name} at ${format(next.threshold)} Signal</p>`
      : `<p class="layer-next muted">Apex of the Strata</p>`
    stripEl.innerHTML = chips.join('') + nextLine
  }

  function render(): void {
    buyMax = buyMaxCheckbox.checked
    renderStrip()
    // M8: prestige panel — visible only once the layer threshold is met.
    const canAscend = layers.next !== null && layers.canAscend(engine.state.signal)
    prestigePanel.classList.toggle('hidden', !canAscend)
    if (canAscend) {
      const reward = harmonicReward(engine.state.signal, layers.def.threshold)
      const next = layers.next!
      prestigeReward.textContent = `Gain ${format(reward)} Harmonic${reward === 1 ? '' : 's'} — ascend to ${next.name}.`
      ascendBtn.disabled = false
    } else {
      ascendBtn.disabled = true
    }
    signalEl.textContent = format(engine.state.signal)
    rateEl.textContent = `+${format(engine.productionPerSec())} / sec`
    clickBtn.textContent = `Harvest Signal (+${format(engine.clickPower())})`
    for (const def of RELAYS) {
      const row = section.querySelector(`.relay-row[data-relay-id="${def.id}"]`)
      if (!row) continue
      const owned = engine.state.relays[def.id] ?? 0
      ;(row.querySelector('.relay-owned') as HTMLElement).textContent = String(owned)
      const cost = engine.relayCost(def.id)
      const costEl = row.querySelector('.relay-cost') as HTMLElement
      const buyBtn = row.querySelector(`#buy-${def.id}`) as HTMLButtonElement
      if (buyMax) {
        // Count max affordable units
        let qty = 0
        let totalCost = new Decimal(0)
        const signal = engine.state.signal
        let tempCost = cost
        while (signal.gte(tempCost)) {
          qty++
          totalCost = totalCost.plus(tempCost)
          tempCost = tempCost.times(def.costGrowth)
        }
        if (qty > 0) {
          costEl.innerHTML = `${format(totalCost)} <span class="muted">(${qty} × ${format(cost)})</span>`
          buyBtn.textContent = `Buy ${qty}`
          buyBtn.disabled = false
        } else {
          costEl.textContent = format(cost)
          buyBtn.textContent = 'Buy'
          buyBtn.disabled = true
        }
      } else {
        costEl.textContent = format(cost)
        buyBtn.textContent = 'Buy'
        buyBtn.disabled = engine.state.signal.lt(cost)
      }
    }
    for (const def of UPGRADES) {
      const row = section.querySelector(`.upgrade-row[data-upgrade-id="${def.id}"]`)
      if (!row) continue
      const btn = row.querySelector(`#buy-${def.id}`) as HTMLButtonElement
      if (engine.isUpgradeOwned(def.id)) {
        btn.textContent = 'Attuned'
        btn.disabled = true
        row.classList.add('owned')
      } else {
        btn.textContent = 'Attune'
        btn.disabled = engine.state.signal.lt(def.cost)
      }
    }
  }

  clickBtn.addEventListener('click', () => {
    engine.click()
    render()
  })

  for (const def of RELAYS) {
    const buyBtn = section.querySelector(`#buy-${def.id}`) as HTMLButtonElement
    buyBtn.addEventListener('click', () => {
      if (buyMax) {
        engine.buyMaxRelay(def.id)
      } else {
        engine.buyRelay(def.id)
      }
      render()
    })
  }

  for (const def of UPGRADES) {
    const buyBtn = section.querySelector(`#buy-${def.id}`) as HTMLButtonElement
    buyBtn.addEventListener('click', () => {
      engine.buyUpgrade(def.id)
      render()
    })
  }

  // M10: buy-max toggle on the generators panel
  buyMaxCheckbox.addEventListener('change', () => {
    buyMax = buyMaxCheckbox.checked
    render()
  })

  // M8: the view only forwards the click — the shell orchestrates the ascend
  // (threshold check, harmonics grant, slice wipe, multiplier update, save).
  ascendBtn.addEventListener('click', () => {
    onAscend()
    render()
  })

  render()

  return { root: section, render }
}
