# Features — decision log

Decide here BEFORE implementing each Phase 2 C cycle / Phase 4 P4 cycle. One feature per cycle, ≤8 files.

## Open
_(empty — nothing decided yet)_

## Shipped
- M11: **Special layer 10 (Echo Layer)** — `src/data/specialLayers.ts`: ascending from layer 10 grants +1 extra Harmonic (echo bonus). **Auto-ascend toggle** — checkbox on Stats panel (`engine.state.autoAscend`); shell checks each tick, auto-calls `layers.ascend()` once threshold met (safe mode: requires ≥1 Harmonic, prevents accidental layer-1 ascends). **Achievements** — `src/data/achievements.ts`, 10 badges (First Spark, First Relay, Pulse Starter, Beam Alignment, Nova Ignition, First Ascent, Stratum Climber, Echo Walker, Signal Architect, Persistent Ascenter); flags stored in `state.upgrades`, checked each tick, unlock toasts at bottom of screen. **Stats panel** — side-panel showing highest layer, total harmonics, relays bought, total clicks, play time. **Save v5** — new `stats` field (`totalRelaysBought`, `totalClicks`, `playTime`); v4→v5 migration loads zeroes.
- M10: **Buy-max toggle** — checkbox `#buy-max-toggle` in the Relays panel header; when checked, clicking a relay buy button purchases as many affordable units as possible in one go (greedy, highest-tier-first via engine `buyMaxRelay(id)`). The cost cell shows total cost + qty in parentheses; the buy button shows "Buy N" where N is the max count. Default is single-unit buy (unchanged behavior).
- M1: DOM-only app shell (title ↔ play state machine), dark nebula theme, future panel
  slots (#economy-panel, #generators-panel, #upgrades-panel, #prestige-panel, #layer-strip),
  `window.__SIGNAL_ASCENT__` debug handle. Engines (20 Hz tick) planned in shared/design.md.
- M2: **decimal.js** for all currency math (no raw JS number past ~1e15).
  `EconomyEngine` (`src/economy/engine.ts`) is the single source of truth: `state.signal`
  (Decimal), `click(+1)`, `step(dt)` stub for M3 production. `format()`
  (`src/economy/format.ts`): integers < 1000, short-scale suffixes K…Dc with 3
  significant figures (`format(1.5e6)` = "1.50M"), scientific beyond 1e33.
  Harvest button routes through `engine.click()` — no production formula in DOM handlers.
- M3: **Relays** (generators) in the engine — 3 tiers (Whisper 15/+0.5, Pulse 250/+6,
  Beam 5000/+80; next-unit cost ×1.15^owned), `buyRelay()`/`relayCost()`/
  `productionPerSec()` in `EconomyEngine`, `step(dt)` now adds rate×dt. Definitions in
  `src/data/generators.ts` (M5+ derives per-layer templates from `layerDef`).
- M4: **Main PLAY UI** — big Harvest click, live `+X / sec` rate, relay list with buy
  buttons (disabled while unaffordable; cost refreshes after each purchase). The shell
  runs the fixed **20 Hz loop** (`step(0.05)` + re-render) and an **autosave stub**:
  every 15 s it persists `{ version, signal, relays }` to `signal-ascent-save-v1`
  (localStorage, corrupt-safe) and a reload restores progress (`src/economy/save.ts`).
- M5: **Strata (layers)** — `layerDef(N)` (`src/data/layers.ts`): procedural name
  (20 prefixes × 3 generation suffixes, unique for N ≤ LAYER_CAP=50), golden-angle hue
  color, flavor line, ascend threshold `1e6 × 10^(N-1)`; every 10th layer flagged
  `special` (Phase 2 mechanics). `LayerEngine` (`src/economy/layers.ts`): stratum
  state, `canAscend()`/`ascend()` (M8 adds the Harmonics reward + Signal wipe).
  Save bumped to **v2** (`layer` in payload; v1 saves migrate to layer 1).
  **`simulateToLayer(N, seed?)`** in `tests/simulate.ts` is the headless depth truth
  (deterministic, real engine, no DOM) — verified through layer 3.
- M6: **Resonators (upgrades)** — 6 one-time attunements in the shop's second tab
  (Relays ↔ Resonators; definitions in `src/data/upgrades.ts`, all math in the engine):
  Amplified Tap 100 (click ×2), Whisper Harmonics 500 (Whisper ×2),
  Pulse Resonance 5000 (Pulse ×2), Global Resonance 25000 (all output ×1.5),
  Overdrive 10000 (click ×5), Beam Alignment 50000 (Beam ×2). Engine gains
  `clickPower()`/`relayMult()`/`globalMult()`/`buyUpgrade()`; `productionPerSec()`
  = Σ(base × owned × relayMult) × globalMult. The Harvest button label shows the
  live click value. Save bumped to **v3** (`upgrades` in payload; v1/v2 saves
  migrate to none owned).
- M9: **Economy retune** — threshold growth 10× → 3× (`1e6 × 3^(N-1)`), harmonicReward `floor(sqrt(ratio))` → `floor(ratio^0.65)`, harmonicMult linear `1+0.02h` → exponential `(1.02)^h`, Nova Relay (100K cost, 50K/s, 1.12 cost growth) added, fix layer-next showing current vs next threshold. simulateToLayer(10) green in ~20K ticks (seed 0). 80 tests all passing.
- M8: **Ascend (prestige)** — `#prestige-panel` visible when signal ≥ threshold; shows Harmonic reward (`floor(sqrt(signal/threshold))`), target layer name, Ascend button. Shell orchestrates: threshold check → LayerEngine.ascend (advances layer + grants Harmonics) → engine.resetLayerSlice() (wipes Signal/Relays/Resonators) → engine.setHarmonicMult(layers.harmonicMult()) (injects 1 + 0.02×h) → saveEngineState v4. Harmonics persist across ascends; each = +2% all-output. Save v4 adds `harmonics` field with v3 migration. simulateToLayer ascends with cumulative relay tracking.
- M7: **Layer strip (live stratum navigator)** — the play view always renders
  `#layer-strip`: a 5-chip window (current ±2, clamped to 1..LAYER_CAP) with the
  current chip `.active` ("N · <name>", flavor tooltip), plus a
  "Next stratum: <name> at <threshold> Signal" line ("Apex of the Strata" at the
  cap). Header `#here` shows the live stratum name (was hardcoded "Stratum 1").
  `buildPlayView(engine, layers)` takes the LayerEngine; the strip re-renders only
  on layer change (the 20 Hz render is otherwise untouched). +2 shell specs
  (layer-1 window = 3 chips / "1.00M"; restored layer 3 = 5 chips / "100M");
  UI smoke asserts strip visible + "Echo Hollow" + "1.00M".
