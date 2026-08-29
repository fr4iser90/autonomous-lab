<!-- BOILERPLATE_PLACEHOLDER: run-owned bug queue. Builder drains ## Open every cycle; lab/roles/validate.md (via Followup) appends play/Pages findings only — no separate VL prompt files. -->

# BUGS

Last validation: (ci-fail-bugs bot) SHA=10bd9a7
Next validation: 2026-08-29 SHA=aff5f2c (Phase 6 Pages validation — B-14 found: Pages stale)

## Open

### B-3: CI gate fail @ 10bd9a7
- Status: open
- Severity: blocker
- Found: 2026-08-29T03:40:13Z
- Target: git  branch=agent/dungeon-crawl-20260829-v2-p8-1-hit-effects  SHA=10bd9a7  full=10bd9a797a22c37f1235a25dae2970733356c744
- Repro: 1) open https://github.com/fr4iser90/autonomous-lab/actions/runs/33231957658 2) see job `gate` failed 3) FIX-ONLY until tip gate green on GitHub
- Evidence: https://github.com/fr4iser90/autonomous-lab/actions/runs/33231957658/job/99046210989
- Suspected: local pnpm/npm gate ≠ CI tip — read CI log before claiming ACCEPT
- Fix hint: FIX-ONLY; push; Automerge lands on main (incl. conflicts). Do not start next milestone while this is open.

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
