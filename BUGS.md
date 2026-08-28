<!-- BOILERPLATE_PLACEHOLDER: run-owned bug queue. Builder drains ## Open every cycle; lab/roles/validate.md (via Followup) appends play/Pages findings only — no separate VL prompt files. -->

# BUGS

Last validation: 2026-08-29 SHA=03d549e (Phase 6 Play/smoke — 19/20 PASS, 2 bugs found)

## Open

_(see Fixed section)_

- **B-8**: `#stealth-label` element has inline `style="display:none"` in HTML, only shown after game loop runs ≥1 frame (`main.ts:457`). HUD reports "Stealth: Visible" correctly post-boot, but initial render hides the label. No player-visible impact (first frame is boot).

## Closed

- _(none yet — validator findings documented above)_

## Fixed

- **B-7**: Settings-back now returns to context of origin — from title → title; from pause → game. `main.ts` settings-back handler checks `gameState`: 'menu'/'dead' → title, 'playing' → game. (SHA pending merge)
- B-2: CI gate fail @ 6962d2b — resolved by PR #42 merge (squash-merge to main)
- B-1: CI gate fail @ c9ba04a — resolved by PR #42 merge (squash-merge to main)
- B-6: CI gate fail @ 6962d2b — resolved by PR #42 merge (squash-merge to main)
- B-5: CI gate fail @ c9ba04a — resolved by PR #42 merge (squash-merge to main)
- B-4: False COMPLETE claim in PROGRESS.md (Phase 2 claimed done with mobKits 4/16, items 6/16, floorThemes 2/16) — fixed by P2-1 content expansion (8 mobs, 10 items, 4 themes)
- B-3: CI gate fail @ 229745e — resolved by PR #34 merge (human resolved conflicts)
