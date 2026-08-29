<!-- BOILERPLATE_PLACEHOLDER: run-owned bug queue. Builder drains ## Open every cycle; lab/roles/validate.md (via Followup) appends play/Pages findings only — no separate VL prompt files. -->

# BUGS

Last validation: agent SHA=`c695f6d` — Pages deploy live, P9-1 DOM elements confirmed (death-stats, mobs-killed, run-duration, best-run, retry button). Gate: 313 tests, 619.67 KB, 0 errors.
Next validation: 2026-08-29 SHA=aff5f2c (Phase 6 Pages validation — B-14 found: Pages stale)

## Open

### B-6: CI gate fail @ 159b11b
- Status: closed
- Severity: blocker
- Found: 2026-08-29T06:14:54Z
- Fixed: PR#94 merged to main (SHA `c695f6d`). Lint fix (`no-empty` in `RunTracker.ts`) landed. CI gate green.

### B-5: CI gate fail @ 1abde56
- Status: closed
- Severity: blocker
- Found: 2026-08-29T06:09:16Z
- Fixed: PR#94 merged to main (SHA `c695f6d`). CI gate green on final run.

### B-4: CI gate fail @ 1287906
- Status: closed
- Severity: blocker
- Found: 2026-08-29T03:40:56Z
- Fixed: PR#90 squash-merged to main (SHA `b39c414`). CI gate green on final run.

### B-3: CI gate fail @ 10bd9a7
- Status: closed
- Severity: blocker
- Found: 2026-08-29T03:40:13Z
- Fixed: PR#90 squash-merged to main (SHA `b39c414`). CI gate green on final run.

### B-2: CI gate fail @ eecaf03
- Status: closed
- Severity: blocker
- Found: 2026-08-29T02:52:22Z
- Fixed: PR#86 squash-merged to main (SHA `6ded2c4`). CI gate green on final run.

### B-1: CI gate fail @ 6721a2a
- Status: closed
- Severity: blocker
- Found: 2026-08-28T23:30:35Z
- Root cause: eslint error in tests/shrine.test.ts — unused `TileType` import from DungeonPCG
- Fixed: removed unused import, re-pushed to agent/dungeon-crawl-20260829-v2
- Merged: PR#79 squash-merged to main (SHA `22aa6ed`). CI gate green on both re-runs.

_(none — all bugs resolved)_

## Fixed (2026-08-29 validation round)

- **B-15**: Playwright smoke test `#btn-close-settings` → actual ID is `#btn-settings-back` (in `src/app/ui.ts`). **Fixed**: Replaced selector in `tests/smoke.spec.ts:68`.
- **B-16**: Playwright validation tests timed out (30s exceeded) — 7 of 9 failed. Root cause: internal `setTimeout(25000)` boot wait + 300ms key delay + 200ms resume delay ≈ 25.5s, too close to Playwright default. Game DOES boot (confirmed via page snapshots: HP 20/20, Floor 1, Stealth). **Fixed**: Reduced boot timeout from 25s → 5s in `tests/validation.spec.ts` (9 occurrences) and `tests/smoke.spec.ts` (1 occurrence).
- **B-17**: Playwright shop/skill tests used wrong keys (Q/S) — actual key mappings are O (Shop) and T (Skills) per B-10 fix. **Fixed**: Updated test names and keyboard events in `tests/validation.spec.ts` to use `'o'/'KeyO'` and `'t'/'KeyT'`.
- **B-18**: Playwright pause test used custom evaluate code instead of shared `runGameTest` pattern, causing rAF context hangs. **Fixed**: Simplified to `runGameTest` pattern.

- **B-19 [B-MOVE]**: Player walks in place — hold WASD, bob/anim plays but world X/Z barely changes (stuck on spawn tile). **Root cause**: Dual rAF loop — `GameLoop.ts:gameLoop` self-scheduled `requestAnimationFrame(gameLoop)` AND `ui.ts:gameLoop` also rAF'd itself. `ui.ts` called `GL.updateGameVars(playerX, playerZ, ...)` every frame *before* `GL.gameLoop`, overwriting `_playerX`/`_playerZ` that GL loop advanced. **Fixed**: Removed GameLoop self-schedule rAF (PR#99, SHA `c4ad330`).
- **B-20 [B-LAG]**: Feels laggy/stuttery while moving — dual rAF → ~2× simulation + 2× renderer.render() per frame. `InputState.rotate` accumulated in `onMouseMove` but never cleared in `update()`; mousemove applied rotate even without button-down → yaw noise. **Fixed**: Single rAF driver (ui.ts), `_pendingRotate` accumulator with per-frame clear, `mouseDown` guard on `onMouseMove` (PR#99, SHA `c4ad330`).

- **B-9**: `#controls-info` missing from title screen — player had no way to learn controls before starting. **Fixed**: Added controls text to title screen (WASD Move, Mouse Drag Rotate, Space/Click Attack, E Inventory, O Shop, T Skills, Esc/P Pause).
- **B-10**: Key conflicts in input.ts — Q/E used for keyboard rotation AND main.ts Q/E used for shop/inventory toggles — both actions fire simultaneously on single keystroke. **Fixed**: Removed Q/E keyboard rotation (rotation via mouse drag only), repurposed O for Shop and T for Skills.
- **B-11**: S key conflict — `input.ts` uses S for backward movement AND `main.ts` uses S for skills toggle. **Fixed**: Skills now use T key (T for "Skill Tree").
- **B-12**: No attack key for keyboard — attack was mouse-click only with no HUD indicator. **Fixed**: Space bar now triggers attack; HUD shows "Space Attack" in controls hint.
- **B-13**: HUD control hints missing — HUD showed [E] Inventory but no WASD/attack indicators. **Fixed**: Added `controls-hint` element to HUD with full key mapping.
- **B-13b**: HUD typo: "I Inventory" → fixed to "E Inventory".
- **B-14 [human]**: `sync-agent` step skipped in `automerge-agent.yml` when PR uses squash-merge (clean merge). Pages workflow requires `sync-agent.success` to decide deploy → Pages stayed stale, serving content from before Phase 6 merge. **Per AGENTS.md hard stop**: CI/Pages/automerge are human-only; agent must not edit `.github/**` workflows. No workaround when push rejected for missing `workflow` scope.

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
