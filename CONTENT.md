# Content bible — Signal Ascent

## Theme (locked at M1)
Celestial-inspired layered prestige idle. You are a Signal Ascenter climbing the **Strata**:
harvest **Signal** (click + Relays), buy Upgrades, then **Ascend** to the next layer for a
permanent **Harmonics** multiplier. Deep prestige loops with check-back rewards, no ads, no IAP.
Original names/mechanics — inspired by multi-layer prestige idles, nothing imported (no TMT/Modding Tree).

## Currencies
- **Signal** — per-layer currency. Click +1 base (EconomyEngine, M2; Resonators
  multiply clicks from M6 — all math in `src/economy/`, never DOM-only); Relays
  produce /sec (M3+).
- **Number format** — `format()` in `src/economy/format.ts`: integers < 1000, then
  short-scale suffixes K…Dc with 3 significant figures (`format(1.5e6)` = "1.50M"),
  scientific beyond 1e33.
- **Harmonics** — meta currency gained on Ascend (prestige of layer N). Each grants a
  permanent multiplicative bonus to Signal production. (M8+)

## Layer model (live at M5)
- `layerDef(N)` factory (`src/data/layers.ts`) — procedural name (unique for N ≤ 50:
  20 celestial prefixes × Hollow/Reach/Spire by generation), golden-angle hue color,
  flavor line, ascend threshold.
- Ascend threshold from layer N → N+1: `1e6 * 1.1^(N-1)` (1e6, 1.1e6, 1.21e6, …) —
  lowered from 3× in M9 → 1.5× → 1.2× → 1.1× (M12 final) so simulateToLayer(50)
  reaches within 2M ticks (BALANCE: ≤1.1×).
  Verified by `simulateToLayer` (M9: through layer 10; M12: layer 20 in ~1.45M ticks;
  layer 50 in ~1.05M ticks at 1.1× growth / 5% harmonics / 0.75 power).
- `LayerEngine` (`src/economy/layers.ts`) tracks the stratum; `ascend()` advances only
  past the threshold. Prestige reward: `floor((signal / threshold)^0.75)` Harmonics
  — power raised from 0.5 (sqrt) → 0.65 (M9) → 0.75 (M12) so deeper ascends grant
  more harmonics per step. M8: linear harmonic mult `1 + 0.02*h` → M9: exponential
  `(1.02)^h` → M12: `(1.05)^h` so higher counts scale faster.
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
- **Nova Relay** — "A flash from a dying star." — 100,000 Signal, +5,000/sec (M9)
(M5+ derives per-layer relay templates procedurally from `layerDef(N)`.)

## Resonators — Upgrades (M6, live)
One-time attunements under the **Resonators** shop tab (the Relays/Resonators tab
pair in the shop panel). Definitions in `src/data/upgrades.ts`; all cost/effect math
lives in `EconomyEngine` (`buyUpgrade`, `clickPower`, `relayMult`, `globalMult`) —
never DOM-only. Owned flags persist in save v3 (`upgrades` field).
Effect kinds: `click-mult` (Signal per click), `relay-mult` (one relay's output),
`global-mult` (ALL relay output).
- **Amplified Tap** — "Your clicks echo one octave higher." — 100 Signal — Click ×2
- **Overdrive** — "Every tap rings like a struck bell." — 10,000 Signal — Click ×5
- **Whisper Harmonics** — "The whisperers sing in tune." — 500 Signal — Whisper Relay ×2
- **Pulse Resonance** — "Pulses stack into standing waves." — 5,000 Signal — Pulse Relay ×2
- **Beam Alignment** — "The beams find the same crack in the sky." — 50,000 Signal — Beam Relay ×2
- **Global Resonance** — "Everything hums at the same frequency." — 25,000 Signal — All output ×1.5
- **Nova Cascade** — "The nova becomes a cascade of light." — 1,000,000 Signal — Nova Relay ×3 (P4-1 cycle 2)
- **Echo Burst** — "Every echo collapses into a single chord." — 5,000,000 Signal — All output ×2 (P4-1 cycle 2)
(M9+ extends the list; effects compose multiplicatively: relay base × owned × relayMult × globalMult.)

## Strata — Layer Strip (M7, live; P4-1 switch)
Always-visible navigator in the play view (`#layer-strip`): a 5-chip window of the
strata (current ±2, clamped to 1..LAYER_CAP), the current chip highlighted
(`.layer-chip.active`), chip text "N · <layer name>" with the layer's flavor line as
tooltip. Below the chips: "Next stratum: <name> at <threshold> Signal"
("Apex of the Strata" at the cap). The header line shows the live stratum name —
"You are here: <name>" from `LayerEngine.def` (was hardcoded "Stratum 1").
Rendered purely from engine state; the strip rebuilds only when the layer changes.
Chips are clickable at P4-1: clicking a chip calls `LayerEngine.switchLayer(N)` (check-back view,
only allowed to previously reached layers < current). Hover effect: blue glow + background tint.
M8's Ascension panel performs the prestige; switch-layer is a different action (navigation only).

## Autosave (M4 stub, v2 at M5, v3 at M6)
- Key: `signal-ascent-save-v1` (localStorage), payload
  `{ version: 3, signal, relays, layer, upgrades, meta.savedAt }`.
- The shell autosaves every **15 s** and on a fresh load restores signal + relay counts
  + stratum + owned Resonators (`src/economy/save.ts`); corrupt/wrong-version payloads
  are ignored, never fatal. v1 saves (no `layer`) migrate to layer 1; v1/v2 saves
  (no `upgrades`) migrate to none owned.
- M10 adds settings + offline progress (8 h cap, 25% check-back) on top of the same key.

## Names
- Generators = **Relays** (≥3 tiers, rising cost — see above).
- Upgrades = **Resonators** (M6: ≥5, multipliers).
- Prestige action = **Ascend**; panel = **Ascension**.
- Special layers (10/20/30/40/50) get distinct names/mechanics in Phase 2.
