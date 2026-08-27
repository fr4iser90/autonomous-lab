/**
 * Signal Ascent — app shell (view state machine).
 * title <-> play. Owns the single EconomyEngine + LayerEngine; views
 * render engine state. M4: restores from the save stub, runs the fixed
 * 20 Hz economy loop (step + re-render), autosaves every 15 s.
 * M5: the stratum (LayerEngine) is restored/saved alongside the economy.
 * M7: the play view renders the layer strip (live stratum window) from it.
 * M8: Ascend (prestige) orchestration — the ONLY place both engines meet:
 *     check threshold → LayerEngine.ascend (grants Harmonics) →
 *     engine.resetLayerSlice() → inject the new harmonic mult → save.
 * M11: Stats tracking (totalRelaysBought, totalClicks, playTime) persisted
 *       in save v5. Auto-ascend toggle (engine autoAscend flag).
 *       Achievement checks each tick; unlock notifications rendered.
 */
import { EconomyEngine } from '../economy/engine'
import { LayerEngine } from '../economy/layers'
import { loadEngineState, saveEngineState } from '../economy/save'
import { checkAchievements, ACHIEVEMENTS } from '../data/achievements'
import { buildPlayView, buildTitleView, type PlayView } from './views'

export type View = 'title' | 'play'

export interface Shell {
  readonly current: View
  readonly engine: EconomyEngine
  readonly layers: LayerEngine
  /** Cumulative stats tracked since load. */
  readonly stats: { totalRelaysBought: number; totalClicks: number; playTime: number }
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

  // M8: layers (with permanent Harmonics) are built first so the engine can
  // start with the correct harmonic multiplier; the shell keeps them in sync.
  const layers = new LayerEngine(
    loaded ? { layer: loaded.layer, harmonics: loaded.harmonics } : {},
  )

  const engineState = loaded
    ? { signal: loaded.signal, relays: loaded.relays, upgrades: loaded.upgrades }
    : undefined
  const engine = new EconomyEngine(engineState, layers.harmonicMult())

  // M11: achievement tracking.
  let lastRelayCount = 0
  let totalRelaysBought = loaded ? loaded.stats.totalRelaysBought : 0
  let totalClicks = loaded ? loaded.stats.totalClicks : 0
  let playTimeMs = loaded ? loaded.stats.playTime : 0
  let lastTime = Date.now()
  let achievementNotifs: string[] = []
  let notifTimer = 0

  const titleView = buildTitleView()

  // M8: ascend orchestration — the only place both engines meet.
  function ascend(): void {
    if (!layers.canAscend(engine.state.signal)) return
    if (!layers.ascend(engine.state.signal)) return
    // M11: count relays bought this ascend cycle.
    totalRelaysBought += Object.values(engine.state.relays).reduce((a, b) => a + b, 0)
    engine.resetLayerSlice()
    engine.setHarmonicMult(layers.harmonicMult())
    saveEngineState(engine.state, layers.state.layer, layers.state.harmonics, {
      totalRelaysBought,
      totalClicks,
      playTime: playTimeMs,
    })
  }

  // M11: handle auto-ascend.
  function checkAutoAscend(): void {
    if (!engine.state.autoAscend) return
    // Safe mode: only auto-ascend if ≥ 1 Harmonic owned (prevents accidental
    // layer-1 ascends at 0 harmonics).
    if (layers.state.harmonics < 1) return
    if (!layers.canAscend(engine.state.signal)) return
    if (!layers.ascend(engine.state.signal)) return
    totalRelaysBought += Object.values(engine.state.relays).reduce((a, b) => a + b, 0)
    engine.resetLayerSlice()
    engine.setHarmonicMult(layers.harmonicMult())
  }

  const playView: PlayView = buildPlayView(engine, layers, ascend, {
    onAchievementUnlock(ids: string[]): void {
      achievementNotifs = ids.map((id) => {
        const a = ACHIEVEMENTS.find((x) => x.id === id)
        return a ? a.name : id
      })
      notifTimer = 5000 // show for 5 s
    },
    onClick(): void {
      totalClicks++
    },
  })

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
    const now = Date.now()
    const elapsed = (now - lastTime) / 1000
    lastTime = now
    playTimeMs += elapsed

    engine.step(tickMs / 1000)

    if (current === 'play') {
      // M11: auto-ascend check before render.
      checkAutoAscend()

      // M11: stats tracking — relays bought.
      const currentRelayCount = Object.values(engine.state.relays).reduce((a, b) => a + b, 0)
      const newRelays = currentRelayCount - lastRelayCount
      if (newRelays > 0) totalRelaysBought += newRelays
      lastRelayCount = currentRelayCount

      // M11: achievement check.
      const newlyUnlocked = checkAchievements(
        ACHIEVEMENTS,
        engine.state,
        totalRelaysBought,
        totalClicks,
        layers.state.layer,
      )
      if (newlyUnlocked.length > 0 && playView.onAchievementUnlock) {
        playView.onAchievementUnlock(newlyUnlocked)
      }

      playView.render({
        autoAscend: engine.state.autoAscend ?? false,
        stats: { totalRelaysBought, totalClicks, playTime: playTimeMs },
        achievementNotifs,
      })

      // Decrement achievement notification timer.
      if (notifTimer > 0) {
        notifTimer -= tickMs
        if (notifTimer <= 0) achievementNotifs = []
      }
    }
  }, tickMs)

  // Autosave (M4–M11): persist engine state + stratum + Harmonics + stats on an interval.
  const saveTimer = setInterval(
    () =>
      saveEngineState(engine.state, layers.state.layer, layers.state.harmonics, {
        totalRelaysBought,
        totalClicks,
        playTime: playTimeMs,
      }),
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
    get stats(): { totalRelaysBought: number; totalClicks: number; playTime: number } {
      return { totalRelaysBought, totalClicks, playTime: playTimeMs }
    },
    enterPlay: () => show('play'),
    returnToTitle: () => show('title'),
    destroy: () => {
      clearInterval(tickTimer)
      clearInterval(saveTimer)
    },
  }
}
