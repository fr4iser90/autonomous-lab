# Demo — Phase 3 storyboard

Storyboard steps 0–9 per overnight law (title → Play → clicks → generators → upgrade →
layer strip → Ascend with Harmonics → layer 2–3 UI → stats panel → hold ≥2s).
Recording: `demo/record.mjs` (Playwright) → `demo/demo.webm` + `demo/frames/<step>.png`.

Status: **COMPLETE** — Phase 3 ACCEPT.

## Visual validation

| Step | Frame | Description | read_image |
|------|-------|-------------|------------|
| 0 | `frames/step0-title.png` | Title screen "Signal Ascent" + Play button, subtitle "Harvest cosmic Signal. Build Relays. Ascend through the Strata." | **PASS** |
| 1 | `frames/step1-main-ui.png` | Main UI: Signal 0, Harvest Signal (+1) button, layer strip "1 · Echo Hollow" active, next "Halo Hollow at 1.10M Signal", 4 relays listed | **PASS** |
| 2 | `frames/step2-clicks.png` | After 10 clicks: Signal 5.3, +0.5/sec production ticking, 1 Whisper Relay owned | **PASS** |
| 3 | `frames/step3-generator.png` | Whisper Relay purchased (1 owned, +0.5/s each), Signal 17.3, "First Relay" achievement banner | **PASS** |
| 4 | `frames/step4-upgrade.png` | Resonators tab: Amplified Tap attuned (click ×2), Signal 100.4, click power +2, 6 upgrades listed | **PASS** |
| 5 | `frames/step5-strip.png` | Layer strip shows 1–5 layers: Echo Hollow → Halo Hollow → Drift Hollow → Veil Hollow → Cinder Hollow | **PASS** |
| 6 | `frames/step6-ascend.png` | After ascend: "You are here: Halo Hollow" (layer 2), Signal 0, click +1.1 (harmonics boosting), "First Spark · First Ascent" banner | **PASS** |
| 7 | `frames/step7-layer2.png` | After second ascend: "You are here: Drift Hollow" (layer 3), Signal 0, click +1.2, Resonators panel with global resonance visible | **PASS** |
| 8 | `frames/step8-stats.png` | Stats panel: Highest Layer 3, Total Harmonics 4, Relays Bought 2, Total Clicks 10, Auto-Ascend toggle | **PASS** |
| 9 | `frames/step9-settled.png` | Settled UI ≥2s: all panels readable, Harmonics boosting click power, layer strip shows progress through 5 layers | **PASS** |

## Artifact summary

- **`demo/demo.webm`**: 2.0s video, 10 frames at 5 fps, VP9 encoded, ~290KB
- **`demo/frames/`**: 10 PNG screenshots, 1280×800–1561px
- Zero console errors during recording
- Ascend mechanic shows: Harmonics visible in click power (+1.1, +1.2), stats show Total Harmonics 4
- Layer strip shows ≥5 layers with distinct names (Echo Hollow → Halo Hollow → Drift Hollow → Veil Hollow → Cinder Hollow)
- Cross-layer buff: Global Resonance upgrade (×1.5 all output), Harmonic multiplier stacking
