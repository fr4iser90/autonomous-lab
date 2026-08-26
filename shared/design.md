# Design — Signal Ascent

- **Tick:** fixed 20 Hz (50 ms) `EconomyEngine.step(state, dt)`; production = rate × dt.
- **Big numbers:** `decimal.js` (M2). Never raw JS number past ~1e15. Display: suffixes
  (K, M, B, T, …) then scientific notation. `format(1.5e6)` → "1.50M".
- **Save:** key `signal-ascent-save-v1` → `{ version, settings, state, meta }`.
  Schema changes bump `version` + migration. Autosave every ~15 s + on visibilitychange.
- **Offline:** `min(elapsed, OFFLINE_CAP_MS)` with OFFLINE_CAP_MS = 8 h (M10 modal).
- **Check-back:** 25% production on non-active (deeper) layers (M12; tune here).
- **UI:** DOM-only (no Phaser/Three/WebSocket). Views: title ↔ play; panels:
  economy / relays / upgrades / ascension / layer strip.
- **Testing:** vitest (jsdom) for logic; Playwright UI smoke in gate from M4
  (`npm run gate = npm test && npm run test:ui && npm run build`);
  `simulateToLayer(N, seed?)` in `tests/simulate.ts` is the depth truth.
- **Preview:** port 5173 only (never 3080); dev server pid → `.game.pid`, port → `.game.port`.
