# Progress — Signal Ascent (run agent/celestial-inc-20260826)

## NOW
- Phase: Milestones M1–M12
- Milestone: M4 (main PLAY UI: relay list + 20 Hz loop + autosave stub) — gate green, pre-PR visual PASS
- Branch: agent/celestial-inc-20260826 (from origin/baseline @ 394f599)
- LAYER_CAP: 50 (planned; LayerEngine lands M5)
- deepest_soak_layer: n/a (simulateToLayer lands M5)
- Last ACCEPT: M2 — merged to main as ffa397a (PR #17); M3 in PR #18 (CI pending → automerge)
- Last SHA: cdd479c (M3 docs fix) = origin/agent/celestial-inc-20260826; M4 commit pending
- Pre-PR visual: demo/pre-pr/m4-play.png — read_image PASS (relay list, owned 1, cost 17.3, +0.5/sec, Signal 0.8)
- Gate: `npm test && npm run test:ui && npm run build` — 33 vitest + self-managed UI smoke + build
- Note: ports 5173–5176 held by foreign run; our dev server on 5177 (.game.port drives Playwright)
- Next: commit M4 → push (updates PR #18) → then M5 LayerEngine (layers 1–3 + simulateToLayer(3))

## Log
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
