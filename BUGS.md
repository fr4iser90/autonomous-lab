<!-- BOILERPLATE_PLACEHOLDER: run-owned bug queue. Builder drains ## Open every cycle; lab/roles/validate.md (via Followup) appends play/Pages findings only — no separate VL prompt files. -->

# BUGS

Last validation: agent SHA=`fef03b9` — Playwright: 6/6 validation + 3/3 smoke pass. Vitest: 327 pass (2 skipped). Build: 620.61 KB. No new bugs found.
Next validation: 2026-08-29 SHA=6a84d4859e26dab558bd20d3383122c77d30b9e9 (B-CAM+B-LIGHT fixes + validate; Playwright WebGL capture limited — scene verified via HUD DOM + code inspection)

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

- **B-CAM**: Camera angle + look control — nearly top-down view (FOV 40, distance 10, height 7), mouse drag rotation only moved camera not player facing. **Fixed**: FollowCamera params → distance: 12, height: 5, FOV: 55, followLag: 0.10; `onPointerMove` now rotates both camera and player yaw (via `syncYaw` in GameLoop); `onPointerUp` clears mouse-down state; input rotation guarded by mouseDown flag.
- **B-LIGHT**: Floor 1 nearly black — ambient intensity formula `max(0.25, 0.7 - (floor-1)*0.04)` gave 0.7 max, hemisphere light at 0.7, fog at 12–40 range made rooms invisible. **Fixed**: Formula → `max(0.45, 1.1 - (floor-1)*0.07)` (floor 1 = 1.1, min 0.45); TORCH_BASE_INTENSITY 2.0; fog expanded to 20–50; hemisphere light base 1.1; `Transition.advanceToFloor` now calls `setAmbientIntensity` for floor changes.
- **B-15**: Playwright smoke test `#btn-close-settings` → actual ID is `#btn-settings-back` (in `src/app/ui.ts`). **Fixed**: Replaced selector in `tests/smoke.spec.ts:68`.
- **B-16**: Playwright validation tests timed out (30s exceeded) — 7 of 9 failed. Root cause: internal `setTimeout(25000)` boot wait + 300ms key delay + 200ms resume delay ≈ 25.5s, too close to Playwright default. Game DOES boot (confirmed via page snapshots: HP 20/20, Floor 1, Stealth). **Fixed**: Reduced boot timeout from 25s → 5s in `tests/validation.spec.ts` (9 occurrences) and `tests/smoke.spec.ts` (1 occurrence).
- **B-17**: Playwright shop/skill tests used wrong keys (Q/S) — actual key mappings are O (Shop) and T (Skills) per B-10 fix. **Fixed**: Updated test names and keyboard events in `tests/validation.spec.ts` to use `'o'/'KeyO'` and `'t'/'KeyT'`.
- **B-18**: Playwright pause test used custom evaluate code instead of shared `runGameTest` pattern, causing rAF context hangs. **Fixed**: Simplified to `runGameTest` pattern.
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
