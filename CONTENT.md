# Content bible — Signal Ascent

## Theme (locked at M1)
Celestial-inspired layered prestige idle. You are a Signal Ascenter climbing the **Strata**:
harvest **Signal** (click + Relays), buy Upgrades, then **Ascend** to the next layer for a
permanent **Harmonics** multiplier. Deep prestige loops with check-back rewards, no ads, no IAP.
Original names/mechanics — inspired by multi-layer prestige idles, nothing imported (no TMT/Modding Tree).

## Currencies
- **Signal** — per-layer currency. Click +1 base; Relays produce /sec. (M2+)
- **Harmonics** — meta currency gained on Ascend (prestige of layer N). Each grants a
  permanent multiplicative bonus to Signal production. (M8+)

## Layer model (planned; formulas defined at M5)
- `layerDef(N)` factory (`src/data/layers.ts`) — procedural name, color, ascend threshold.
- Ascend threshold N: `1e6 * 10^(N-1)` (1e6, 1e7, 1e8, …) — tune in M5 soak.
- Prestige reward: `floor(sqrt(signal / threshold))` Harmonics — tune in M8.
- Deeper layers keep their Signal (no per-layer prestige wipe of deeper layers).

## Visual tone
Dark nebula background, violet→cyan accents, big tabular-nums stats, layer strip always
visible in play view. `prefers-reduced-motion` respected. See `src/styles.css`.

## Names
- Generators = **Relays** (M3: ≥3 tiers, rising cost).
- Upgrades = **Resonators** (M6: ≥5, multipliers).
- Prestige action = **Ascend**; panel = **Ascension**.
- Special layers (10/20/30/40/50) get distinct names/mechanics in Phase 2.
