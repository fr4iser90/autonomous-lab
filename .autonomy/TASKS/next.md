# Next task

**M1 — Engine pin + map stub**

- Pick **Canvas2D** or **Phaser 3**, add the dependency, record the choice in `.autonomy/DECISIONS.md`.
- Show a fixed enemy path and at least one enemy walking toward the base.
- Player click on an enemy deals **1** damage; enemy dies at 0 HP.
- Keep Vite `base` = `/autonomous-lab/`. Leave the harvest toy only if still useful as a HUD stub — prefer replacing the boot screen with the map.

ACCEPT:

- [ ] Engine pinned in DECISIONS.md + package.json
- [ ] Path + click-damage enemy visible in `npm run dev`
- [ ] Pure combat/damage helpers covered by Vitest where practical
- [ ] `npm run gate` passes
- [ ] PROGRESS.md notes the engine choice
