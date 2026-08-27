# Progress — Signal Ascent (run agent/celestial-inc-20260826)

## NOW
- Phase: Milestones M1–M12
- Milestone: M7 (layer strip: always-visible stratum window + live #here + next-threshold line) — gate green, pre-PR visual PASS
- Branch: agent/celestial-inc-20260826 (from origin/baseline @ 394f599)
- LAYER_CAP: 50 (live, src/data/layers.ts — Phase 4 bulk-raises +10/cycle)
- deepest_soak_layer: 3 (simulateToLayer(3) green, seed 0)
- Last ACCEPT: M5 — merged to main as ff39c88 (PR #20, pre-M6 head); M6+M7 on agent branch pending new PR
- Last SHA: 2bd8193 (M7 code commit; SAFE SYNC merge 27723ba over ff39c88)
- Pre-PR visual: all 4 shots read_image PASS (title / play-0 / play-5 / post-buy Whisper 1/17.3, +0.5/sec, Signal 0.8; layer strip: Echo Hollow active, "Next stratum: Halo Hollow at 1.00M Signal")
- Gate: `npm test && npm run test:ui && npm run build` — 62 vitest + self-managed UI smoke + build
- Note: ports 5173–5176 held by foreign run; our dev server on 5177 (.game.port drives Playwright)
- Next: push M6+M7 → new PR (CI gate) → M8 (Ascend: `floor(sqrt(signal/threshold))` Harmonics reward + Signal wipe + prestige panel)

## Log
- 2026-08-26: M7 built — layer strip always visible in the play view: `#layer-strip` un-hidden; 5-chip stratum window (current ±2, clamped to 1..LAYER_CAP, current chip `.active`), chip text "N · <layer name>" with flavor tooltip; "Next stratum: <name> at <threshold> Signal" line ("Apex of the Strata" at cap); header `#here` shows the live stratum name (was hardcoded "Stratum 1"). `buildPlayView(engine, layers)` now takes the LayerEngine; strip re-renders only on layer change (20 Hz render untouched otherwise). +2 shell specs (layer 1 → 3-chip window, "1.00M"; restored layer 3 → 5 chips, "100M") + UI smoke asserts strip visible + "Echo Hollow" + "1.00M". 62 vitest + UI smoke + build green → 2bd8193.
- 2026-08-26: M7 pre-PR visual PASS (read_image): all 4 shots re-captured + PASS — m1-play/m2-play/m4-play show the layer strip ("You are here: Echo Hollow", chips 1/2/3 with 1 active, "Next stratum: Halo Hollow at 1.00M Signal"); m1-title unchanged.
- 2026-08-26: SYNC: SAFE SYNC — merged origin/main (ff39c88 = PR #20 squash; automerge landed on the pre-M6 head 2ad93aa, so main had M5 while the branch carried M5+M6+M7); 8 add/add conflicts (docs + shell/save M6-M7 deltas + m2-play.png), all taken --ours; tree byte-identical to 2bd8193 (0-line diff); gate green post-sync → 27723ba.
- 2026-08-26: M6 built — 6 Resonator upgrades (`src/data/upgrades.ts`): Amplified Tap 100 (click ×2), Whisper Harmonics 500 (Whisper ×2), Pulse Resonance 5000 (Pulse ×2), Global Resonance 25000 (all output ×1.5), Overdrive 10000 (click ×5), Beam Alignment 50000 (Beam ×2); engine gains `clickPower()`/`relayMult()`/`globalMult()`/`buyUpgrade()`, `productionPerSec()` = Σ(base × owned × relayMult) × globalMult; Relays/Resonators shop tab in the UI; Harvest label shows live click value; save **v3** (`upgrades` in payload; v1/v2 saves migrate to none owned). 60 vitest + UI smoke (tab assertions) + build green → fc5d543.
- 2026-08-26: M6 pre-PR visual PASS (read_image): all 4 shots re-captured + PASS — m1-title (title view), m1-play (Signal 0, shop tabs), m2-play (Signal 5), m4-play (Whisper 1/17.3, +0.5/sec, Signal 0.8).
- 2026-08-26: Run started. Cloned boilerplate; branch agent/celestial-inc-20260826 from origin/baseline.
- 2026-08-26: M1 — replaced toy src with Signal Ascent title+play shell (DOM), shell state machine + 4 vitest smoke tests; pinned typescript 5.9.3 / vite 7.3.6; esbuild builds enabled (pnpm-workspace.yaml allowBuilds); docs seeded (CONTENT/shared-design/FEATURES/SOAK/DEMO/README Current-run). Gate green.
- 2026-08-26: M1 pre-PR visual PASS (read_image): demo/pre-pr/m1-title.png, m1-play.png. Ports 5173–5176 held by foreign run → dev on 5177 (.game.port drives Playwright).
- 2026-08-26: SYNC: SAFE SYNC — merged origin/main (VoxelCraft line) into agent branch; kept agent Signal Ascent src/+run docs, dropped foreign game artifacts + .autonomy legacy state; backup/celestial-inc-20260826-121d41e; gate green post-sync.
- 2026-08-26: M1 ACCEPT — PR #16 CI green + automerged squash to main @ 24bccea; Pages live.
- 2026-08-26: M2 — decimal.js 10.6.0; EconomyEngine (Signal, click +1, step stub) + format() (K…Dc 3-sig-fig suffixes, scientific >1e33); Harvest button routed through engine (no DOM formulas); 17 vitest tests green (incl. 100 clicks → Signal == 100, format(1.5e6) = "1.50M"); UI smoke now clicks 5× and asserts Signal 5.
- 2026-08-26: M2 pre-PR visual PASS (read_image): demo/pre-pr/m2-play.png — SIGNAL 5, live Harvest (+1), zero pageerror.
- 2026-08-26: SYNC: SAFE SYNC — merged origin/main (24bccea = M1 squash) into M2; conflicts on M2-touched run files only, kept ours; backup/celestial-inc-20260826-9884d07; tree byte-identical to M2 commit, gate green post-sync (b182c26).
- 2026-08-26: M2 LIVE LOOP — pushed M2 (9884d07) + SAFE SYNC (b182c26) → PR #17 opened (M2: big numbers + EconomyEngine).
- 2026-08-26: M3 — Relays in engine: 3 tiers (Whisper/Pulse/Beam), next-unit cost ×1.15^owned, buyRelay/relayCost/productionPerSec, step(dt) adds rate×dt. `src/data/generators.ts` holds definitions (M5 derives per-layer). 23 vitest green incl. ACCEPT: buy Whisper @100 → 85; 20 ticks ×50ms → 85.5.
- 2026-08-26: M3 pre-PR visual PASS (read_image): UI unchanged (engine-only) — demo/pre-pr/m2-play.png, zero pageerror.
- 2026-08-26: M2 ACCEPT — PR #17 CI green + automerged squash to main @ ffa397a; Pages live.
- 2026-08-26: SYNC: SAFE SYNC — merged origin/main (ffa397a = M2 squash) into M3; conflicts on engine.ts/engine.spec.ts/FEATURES/PROGRESS only, kept ours; backup/celestial-inc-20260826-469587f; tree byte-identical to M3 commit, gate green post-sync (a425b12).
- 2026-08-26: M3 LIVE LOOP — pushed 614bfff..cdd479c (SAFE SYNC + docs fix) → PR #18 opened (M3: Relays, 3 tiers, rising cost, production/sec).
- 2026-08-26: M4 — main PLAY UI: relay list with per-tier buy buttons (disabled while unaffordable, live cost), big Harvest click, `+X / sec` rate line; shell runs fixed 20 Hz loop (step + render) and autosave stub (`src/economy/save.ts`, key `signal-ascent-save-v1`, 15 s interval, corrupt-safe, restores on load). 33 vitest green (incl. fake-timer: 20 Hz production, buy → owned 1, autosave round-trip). UI smoke now self-manages: reuses `.game.port` if up else spawns vite on 5173, installs chromium if missing; asserts buy Whisper @15 → owned 1, rate +0.5/sec, production ticking. Gate = test + test:ui + build.
- 2026-08-26: M4 pre-PR visual PASS (read_image): demo/pre-pr/m4-play.png — relay list (Whisper 1 owned / 17.3, Pulse 250, Beam 5.00K), +0.5/sec, Signal 0.8, zero pageerror.
- 2026-08-26: M3 ACCEPT — PR #18 CI green + automerged squash to main @ 74bd47c; Pages live.
- 2026-08-26: M4 LIVE LOOP — pushed f4cae86 → PR #19 opened (M4: relay list, 20 Hz loop, autosave stub; gate = test + test:ui + build).
- 2026-08-26: M5 built — `src/data/layers.ts` (layerDef 1–50: unique names, golden-angle colors, threshold 1e6×10^(N-1), special every 10), `src/economy/layers.ts` (LayerEngine + clamp, ±Inf corrupt-save safe), save v2 (layer in payload, v1→layer 1 migration), `tests/simulate.ts` (simulateToLayer, seeded deterministic sim) green through layer 3. 48 vitest + UI smoke + build green → a73ddbc.
- 2026-08-26: M5 pre-PR visual PASS (read_image): smoke re-captured all four shots — m1-title (title view), m1-play (Signal 0), m2-play (Signal 5), m4-play (Whisper 1/17.3, +0.5/sec) — UI unchanged in M5 (engine-only).
- 2026-08-26: M4 ACCEPT — PR #19 CI green + automerged squash to main @ c2cc723; Pages live.
- 2026-08-26: SYNC: SAFE SYNC — merged origin/main (c2cc723 = M4 squash) over M5; 8 add/add conflicts (squash re-added M4 files), all taken --ours; tree byte-identical to a73ddbc (0-line diff); gate green post-sync → 349900d.
- 2026-08-26: SYNC: SAFE SYNC — merged origin/main (74bd47c = M3 squash) into M4; conflicts on CONTENT/FEATURES/PROGRESS only, kept ours; backup/celestial-inc-20260826-f4cae86; tree byte-identical to M4, gate green post-sync (3b5c309).
