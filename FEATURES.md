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
