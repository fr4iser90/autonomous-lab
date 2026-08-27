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
 * M11: auto-ascend toggle, achievements panel, stats panel, achievement
 *       notification toasts.
 */
import { Decimal } from 'decimal.js'
import { EconomyEngine } from '../economy/engine'
import { RELAYS, getRelay } from '../data/generators'
import { UPGRADES, type UpgradeEffect } from '../data/upgrades'
import { format } from '../economy/format'
import { LAYER_CAP, layerDef } from '../data/layers'
import { harmonicReward, LayerEngine } from '../economy/layers'
import { ACHIEVEMENTS, isAchievementUnlocked, ACHIEVEMENT_COUNT } from '../data/achievements'

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
  render: (opts?: {
    autoAscend?: boolean
    stats?: { totalRelaysBought: number; totalClicks: number; playTime: number }
    achievementNotifs?: string[]
    /** M12: offline check-back signal delta (seconds elapsed, signal gained). */
    checkBack?: { signalDelta: number; elapsedSecs: number }
    /** M12: callback for clearing save (returns void on cancel). */
    onClearSave?: () => boolean | void
  }) => void
  /** Called by the shell when new achievements unlock (M11). */
  onAchievementUnlock?: (ids: string[]) => void
  /** Called by the view when the user harvests signal by clicking (M11). */
  onClick?: () => void
}

export function buildPlayView(
  engine: EconomyEngine,
  layers: LayerEngine,
  onAscend: () => void,
  opts?: { onAchievementUnlock?: (ids: string[]) => void; onClick?: () => void },
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
            <div class="panel-toggles">
              <label class="buy-max-label">
                <input type="checkbox" id="buy-max-toggle" />
                <span>Buy Max</span>
              </label>
            </div>
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
        <section id="achievements-panel" class="panel hidden" aria-label="Achievements">
          <h2 class="panel-title">Achievements</h2>
          <p id="ach-progress" class="muted">0 / ${ACHIEVEMENT_COUNT}</p>
          <ul id="ach-list" class="relay-list"></ul>
        </section>
        <section id="stats-panel" class="panel hidden" aria-label="Statistics">
          <h2 class="panel-title">Statistics</h2>
          <ul id="stats-list" class="stats-list">
            <li><span class="stats-label">Highest Layer</span><span id="stat-layer" class="stats-value">1</span></li>
            <li><span class="stats-label">Total Harmonics</span><span id="stat-harmonics" class="stats-value">0</span></li>
            <li><span class="stats-label">Relays Bought</span><span id="stat-relays" class="stats-value">0</span></li>
            <li><span class="stats-label">Total Clicks</span><span id="stat-clicks" class="stats-value">0</span></li>
            <li><span class="stats-label">Play Time</span><span id="stat-time" class="stats-value">0:00</span></li>
          </ul>
          <div class="panel-title-wrap" style="margin-top:12px;">
            <label class="auto-ascend-label">
              <input type="checkbox" id="auto-ascend-toggle" />
              <span>Auto-Ascend</span>
            </label>
          </div>
          <p id="auto-ascend-note" class="muted">Requires ≥1 Harmonic owned. Safe mode prevents accidental layer-1 ascends.</p>
        </section>
      </aside>
    </div>
    <div id="ach-notif" class="ach-notif hidden"></div>
    <div id="check-back" class="check-back hidden"></div>
    <div id="settings-row" class="panel panel-title-wrap">
      <button id="clear-save-btn" class="ghost" type="button">Clear Save</button>
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
  const achProgress = section.querySelector('#ach-progress') as HTMLElement
  const achList = section.querySelector('#ach-list') as HTMLElement
  const statLayer = section.querySelector('#stat-layer') as HTMLElement
  const statHarmonics = section.querySelector('#stat-harmonics') as HTMLElement
  const statRelays = section.querySelector('#stat-relays') as HTMLElement
  const statClicks = section.querySelector('#stat-clicks') as HTMLElement
  const statTime = section.querySelector('#stat-time') as HTMLElement
  const autoAscendCheckbox = section.querySelector('#auto-ascend-toggle') as HTMLInputElement
  const achNotif = section.querySelector('#ach-notif') as HTMLElement
  const checkBackEl = section.querySelector('#check-back') as HTMLElement
  const clearSaveBtn = section.querySelector('#clear-save-btn') as HTMLButtonElement
  let buyMax = false
  let autoAscend = false
  let renderedLayer = -1
  let renderedCheckBack: string | null = null

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

  function formatTime(ms: number): string {
    const s = Math.floor(ms / 1000)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  function renderAchievements(unlocked: number): void {
    achProgress.textContent = `${unlocked} / ${ACHIEVEMENT_COUNT}`
    const html = ACHIEVEMENTS.map((a) => {
      const isUnlocked = isAchievementUnlocked(engine.state, a.id)
      return `<li class="ach-row ${isUnlocked ? 'ach-unlocked' : 'ach-locked'}">
        <span class="ach-icon">${isUnlocked ? '✦' : '·'}</span>
        <div class="ach-info">
          <p class="ach-name">${a.name}</p>
          <p class="ach-desc muted">${a.description}</p>
          <p class="ach-hint muted">${a.progressHint}</p>
        </div>
      </li>`
    }).join('')
    achList.innerHTML = html
  }

  function render(renderOpts: {
    autoAscend?: boolean
    stats?: { totalRelaysBought: number; totalClicks: number; playTime: number }
    achievementNotifs?: string[]
    checkBack?: { signalDelta: number; elapsedSecs: number }
    onClearSave?: () => boolean | void
  } = {}): void {
    buyMax = buyMaxCheckbox.checked
    autoAscend = autoAscendCheckbox.checked
    engine.state.autoAscend = autoAscend

    renderStrip()

    // M8: prestige panel — visible only once the layer threshold is met.
    const canAscend = layers.next !== null && layers.canAscend(engine.state.signal)
    prestigePanel.classList.toggle('hidden', !canAscend)
    if (canAscend) {
      const reward = harmonicReward(engine.state.signal, layers.def.threshold)
      const echo = 0 // echo bonus handled in LayerEngine.ascend
      const next = layers.next!
      prestigeReward.textContent = `Gain ${format(reward)} Harmonic${reward === 1 ? '' : 's'}${echo > 0 ? ` + ${echo} Echo Bonus` : ''} — ascend to ${next.name}.`
      ascendBtn.disabled = false
    } else {
      ascendBtn.disabled = true
    }

    signalEl.textContent = format(engine.state.signal)
    rateEl.textContent = `+${format(engine.productionPerSec())} / sec`
    clickBtn.textContent = `Harvest Signal (+${format(engine.clickPower())})`

    // Relays.
    for (const def of RELAYS) {
      const row = section.querySelector(`.relay-row[data-relay-id="${def.id}"]`)
      if (!row) continue
      const owned = engine.state.relays[def.id] ?? 0
      ;(row.querySelector('.relay-owned') as HTMLElement).textContent = String(owned)
      const cost = engine.relayCost(def.id)
      const costEl = row.querySelector('.relay-cost') as HTMLElement
      const buyBtn = row.querySelector(`#buy-${def.id}`) as HTMLButtonElement
      if (buyMax) {
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

    // Upgrades.
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

    // Achievements.
    const unlockedCount = ACHIEVEMENTS.filter((a) => isAchievementUnlocked(engine.state, a.id)).length
    renderAchievements(unlockedCount)

    // Stats.
    if (renderOpts) {
      const s = renderOpts.stats
      if (s) {
        statLayer.textContent = String(layers.state.layer)
        statHarmonics.textContent = String(layers.state.harmonics)
        statRelays.textContent = String(s.totalRelaysBought)
        statClicks.textContent = String(s.totalClicks)
        statTime.textContent = formatTime(s.playTime)
      }
      // Auto-ascend toggle state.
      autoAscendCheckbox.checked = autoAscend
    }

    // Achievement notification toasts.
    if (renderOpts?.achievementNotifs && renderOpts.achievementNotifs.length > 0) {
      achNotif.textContent = `✦ ${renderOpts.achievementNotifs.join(' · ')}`
      achNotif.classList.remove('hidden')
    } else {
      achNotif.classList.add('hidden')
    }

    // M12: check-back notification (offline progress).
    const cb = renderOpts.checkBack
    if (cb && cb.elapsedSecs > 0) {
      const key = `${cb.signalDelta.toFixed(1)}|${cb.elapsedSecs}`
      if (key !== renderedCheckBack) {
        const mins = Math.floor(cb.elapsedSecs / 60)
        const hrs = Math.floor(mins / 60)
        const timeStr = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`
        checkBackEl.innerHTML = `⏳ <strong>Check-back:</strong> +${format(new Decimal(cb.signalDelta))} Signal (${timeStr} offline)`
        renderedCheckBack = key
        checkBackEl.classList.remove('hidden')
      }
    } else {
      checkBackEl.classList.add('hidden')
      renderedCheckBack = null
    }

    // M12: clear save button.
    clearSaveBtn.addEventListener('click', () => {
      if (renderOpts.onClearSave === undefined || renderOpts.onClearSave()) {
        localStorage.removeItem('signal-ascent-save-v1')
        // Reload page to restart fresh.
        location.reload()
      }
    }, { once: true })
  }

  clickBtn.addEventListener('click', () => {
    engine.click()
    // M11: signal click to the shell for stats tracking.
    opts?.onClick?.()
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

  // M10: buy-max toggle on the generators panel.
  buyMaxCheckbox.addEventListener('change', () => {
    buyMax = buyMaxCheckbox.checked
    render()
  })

  // M11: auto-ascend toggle on the stats panel.
  autoAscendCheckbox.addEventListener('change', () => {
    autoAscend = autoAscendCheckbox.checked
    engine.state.autoAscend = autoAscend
    render()
  })

  // M8: the view only forwards the click — the shell orchestrates the ascend.
  ascendBtn.addEventListener('click', () => {
    onAscend()
    render()
  })

  render()

  return { root: section, render, onAchievementUnlock: opts?.onAchievementUnlock, onClick: opts?.onClick }
}
