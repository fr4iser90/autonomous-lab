<!-- BOILERPLATE_PLACEHOLDER: run-owned bug queue. Builder drains ## Open every cycle; lab/roles/validate.md (via Followup) appends play/Pages findings only — no separate VL prompt files. -->

# BUGS

Last validation: 2026-08-29 SHA=03d549e (Phase 6 Play/smoke — 19/20 PASS, 2 bugs found)

## Open

_(none — all bugs resolved)_

## Fixed (2026-08-29 validation round)

- **B-9**: `#controls-info` missing from title screen — player had no way to learn controls before starting. **Fixed**: Added controls text to title screen (WASD Move, Mouse Drag Rotate, Space/Click Attack, E Inventory, O Shop, T Skills, Esc/P Pause).
- **B-10**: Key conflicts in input.ts — Q/E used for keyboard rotation AND main.ts Q/E used for shop/inventory toggles — both actions fire simultaneously on single keystroke. **Fixed**: Removed Q/E keyboard rotation (rotation via mouse drag only), repurposed O for Shop and T for Skills.
- **B-11**: S key conflict — `input.ts` uses S for backward movement AND `main.ts` uses S for skills toggle. **Fixed**: Skills now use T key (T for "Skill Tree").
- **B-12**: No attack key for keyboard — attack was mouse-click only with no HUD indicator. **Fixed**: Space bar now triggers attack; HUD shows "Space Attack" in controls hint.
- **B-13**: HUD control hints missing — HUD showed [E] Inventory but no WASD/attack indicators. **Fixed**: Added `controls-hint` element to HUD with full key mapping.

## Closed

- _(none yet — validator findings documented above)_

## Fixed

- **B-8**: `#stealth-label` inline `display:none` removed from `index.html` — label visible from first frame, matching HUD state.
- **B-7**: Settings-back now returns to context of origin — from title → title; from pause → game. `main.ts` settings-back handler checks `gameState`: 'menu'/'dead' → title, 'playing' → game. (SHA pending merge)
- B-2: CI gate fail @ 6962d2b — resolved by PR #42 merge (squash-merge to main)
- B-1: CI gate fail @ c9ba04a — resolved by PR #42 merge (squash-merge to main)
- B-6: CI gate fail @ 6962d2b — resolved by PR #42 merge (squash-merge to main)
- B-5: CI gate fail @ c9ba04a — resolved by PR #42 merge (squash-merge to main)
- B-4: False COMPLETE claim in PROGRESS.md (Phase 2 claimed done with mobKits 4/16, items 6/16, floorThemes 2/16) — fixed by P2-1 content expansion (8 mobs, 10 items, 4 themes)
- B-3: CI gate fail @ 229745e — resolved by PR #34 merge (human resolved conflicts)
