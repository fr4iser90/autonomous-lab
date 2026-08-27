# Content bible — Signal Ascent

## Theme (locked at M1)
Celestial-inspired layered prestige idle. You are a Signal Ascenter climbing the **Strata**:
harvest **Signal** (click + Relays), buy Upgrades, then **Ascend** to the next layer for a
permanent **Harmonics** multiplier. Deep prestige loops with check-back rewards, no ads, no IAP.
Original names/mechanics — inspired by multi-layer prestige idles, nothing imported (no TMT/Modding Tree).

## Currencies
- **Signal** — per-layer currency. Click +1 base (EconomyEngine, M2 — all math in
  `src/economy/`, never DOM-only); Relays produce /sec (M3+).
- **Number format** — `format()` in `src/economy/format.ts`: integers < 1000, then
  short-scale suffixes K…Dc with 3 significant figures (`format(1.5e6)` = "1.50M"),
  scientific beyond 1e33.
- **Harmonics** — meta currency gained on Ascend (prestige of layer N). Each grants a
  permanent multiplicative bonus to Signal production. (M8+)

## Layer model (live at M5)
- `layerDef(N)` factory (`src/data/layers.ts`) — procedural name (unique for N ≤ 50:
  20 celestial prefixes × Hollow/Reach/Spire by generation), golden-angle hue color,
  flavor line, ascend threshold.
- Ascend threshold from layer N → N+1: `1e6 * 10^(N-1)` (1e6, 1e7, 1e8, …) —
  verified by `simulateToLayer` (M5: through layer 3).
- `LayerEngine` (`src/economy/layers.ts`) tracks the stratum; `ascend()` advances only
  past the threshold. Prestige reward: `floor(sqrt(signal / threshold))` Harmonics —
  the Ascend action (reward + wipe) lands in M8.
- Deeper layers keep their Signal (no per-layer prestige wipe of deeper layers).
- Special layers (10/20/30/40/50) are flagged in the def; distinct names/mechanics in Phase 2.

## Visual tone
Dark nebula background, violet→cyan accents, big tabular-nums stats, layer strip always
visible in play view. `prefers-reduced-motion` respected. See `src/styles.css`.

## Generators — Relays (M3, live)
Owned counts and all cost/production math live in `EconomyEngine` (`src/economy/engine.ts`);
definitions in `src/data/generators.ts`. Cost of next unit: `baseCost × 1.15^owned`.
- **Whisper Relay** — "A faint echo, tapped into rhythm." — 15 Signal, +0.5/sec
- **Pulse Relay** — "Beats like a slow stellar heart." — 250 Signal, +6/sec
- **Beam Relay** — "A needle of light through the dark." — 5,000 Signal, +80/sec
(M5+ derives per-layer relay templates procedurally from `layerDef(N)`.)

## Autosave (M4 stub, v2 at M5)
- Key: `signal-ascent-save-v1` (localStorage), payload
  `{ version: 2, signal, relays, layer, meta.savedAt }`.
- The shell autosaves every **15 s** and on a fresh load restores signal + relay counts
  + stratum (`src/economy/save.ts`); corrupt/wrong-version payloads are ignored,
  never fatal. v1 saves (no `layer`) migrate to layer 1.
- M10 adds settings + offline progress (8 h cap, 25% check-back) on top of the same key.

## Names
- Generators = **Relays** (≥3 tiers, rising cost — see above).
- Upgrades = **Resonators** (M6: ≥5, multipliers).
- Prestige action = **Ascend**; panel = **Ascension**.
- Special layers (10/20/30/40/50) get distinct names/mechanics in Phase 2.
