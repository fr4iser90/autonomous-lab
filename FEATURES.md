# Features — decision log

Decide here BEFORE implementing each Phase 2 C cycle / Phase 4 P4 cycle. One feature per cycle, ≤8 files.

## Open
_(empty — nothing decided yet)_

## Shipped
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
- M7: **Layer strip (live stratum navigator)** — the play view always renders
  `#layer-strip`: a 5-chip window (current ±2, clamped to 1..LAYER_CAP) with the
  current chip `.active` ("N · <name>", flavor tooltip), plus a
  "Next stratum: <name> at <threshold> Signal" line ("Apex of the Strata" at the
  cap). Header `#here` shows the live stratum name (was hardcoded "Stratum 1").
  `buildPlayView(engine, layers)` takes the LayerEngine; the strip re-renders only
  on layer change (the 20 Hz render is otherwise untouched). +2 shell specs
  (layer-1 window = 3 chips / "1.00M"; restored layer 3 = 5 chips / "100M");
  UI smoke asserts strip visible + "Echo Hollow" + "1.00M".
