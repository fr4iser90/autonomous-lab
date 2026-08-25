# Roadmap — incremental TD

Ordered milestones. Keep `TASKS/next.md` on exactly one slice.

1. **M1 — Engine pin + map stub**  
   Choose Canvas2D or Phaser 3; pin deps; draw path + one enemy walking; click deals 1 dmg. ACCEPT: gate green; DECISIONS names the engine.

2. **M2 — Scrap + click power (G0→G1)**  
   Scrap from damage/kills; click-power shop; tower shop visible but locked. ACCEPT: vitest for damage/scrap/shop; HUD updates.

3. **M3 — Auto-click (G2)**  
   At least two auto-click tiers with documented targeting. ACCEPT: vitest rates; UI toggles/upgrades.

4. **M4 — Towers (G3)**  
   Unlock build bar; ≥2 tower types; place/upgrade on buildable tiles; towers deal damage. ACCEPT: vitest combat sim; playable on preview.

5. **M5 — Waves + save**  
   Escalating waves; lives; save schema v1. ACCEPT: vitest roundtrip; reload restores run.

6. **M6 — Prestige + fantasy pass (G4 lite)**  
   Soft-reset for meta currency/multiplier; theme in CONTENT.md; README how-to-play. ACCEPT: gate green; Pages `base` unchanged.

7. **M7+ — Content cycles**  
   More towers/enemies/upgrades; balance; keep gate green; update CONTENT/PROGRESS each cycle.
