# Roadmap (seed)

Ordered milestones. Keep `TASKS/next.md` pointed at exactly one slice.

1. **M1 — Tighten the toy loop**  
   Polish harvest feedback, passive tick UX, and number formatting. ACCEPT: gate green; HUD updates on click and tick.

2. **M2 — Data-driven generators**  
   Move generators into `src/data/`; buy at least two buildings. ACCEPT: vitest covers buy + production; UI lists buildings.

3. **M3 — Upgrades + save**  
   One upgrade multiplier; save schema v1 in localStorage with corrupt→reset. ACCEPT: vitest roundtrip; reload restores balances.

4. **M4 — Fantasy pass**  
   Lock theme in CONTENT.md; restyle UI to match; README how-to-play. ACCEPT: build green; Pages-ready `base` unchanged.

5. **M5 — Depth**  
   Prestige or second currency; more generators; balance pass. ACCEPT: gate green; PROGRESS notes balance targets.

6. **M6+ — Agent-chosen content cycles**  
   Only after M5; each cycle must leave gate green and update CONTENT.md / PROGRESS.md.
