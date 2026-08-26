# PROGRESS.md — VoxelCraft

**Branch:** `agent/voxel-craft-20260825`
**Phase:** Phase 3 DEMO COMPLETE ✅ | Phase 2 ✅ | Phase 2b SOAK ✅ | Phase 4: INFINITE IMPROVE
**SHA:** b803c23 (Phase 3 DEMO, merged main sync)
**Tests:** 268/268 passing | Build: ✅ 535KB
**PR:** #3 Merged ✅ | **Current PR:** #11 — Phase 3 DEMO pushed, waiting gate
**SYNC:** Merged origin/main (16d79ba). Resolved boilerplate updates to README.md + PROGRESS.md. Kept game src/ and Phase 3 demo intact.

## CAPS
```
blocks=20/CAP items=20/CAP recipes=20/CAP npcs=20/CAP
```

## Milestones M1–M12: ALL COMPLETE ✅

## Phase 2 Content Cycles — Summary

| Cycle | What | Registry | Before→After |
|---|---|---|---|
| C1 | Rabbit NPC | npcs | 6→7 |
| C2 | Stone Sword + Iron Shovel + Iron Spade recipe | items | 18→20 (CAP) |
| C3 | Fox + Bee + Wolf NPCs | npcs | 7→10 |
| C4 | 10 building/utility recipes | recipes | 10→20 (CAP) |
| C5 | 10 new NPCs + getNPC fix | npcs | 10→20 (CAP) |
| C6 | Bricks + Glass + Wool + getBlock fix | blocks | 17→20 (CAP) |

## Phase 2b Soak — ALL 7 PASS ✅

| Soak | Tests | Result |
|---|---|---|
| S1: Registry integrity | 244 gate | ✅ PASS |
| S2: Texture atlas | 3 | ✅ PASS |
| S3: Recipe matcher | 4 | ✅ PASS |
| S4: Chunk generation | 3 | ✅ PASS |
| S5: NPC spawning | 6 | ✅ PASS |
| S6: Inventory | 4 | ✅ PASS |
| S7: Day/night cycle | 4 | ✅ PASS |

## FIX: CI gate was red — npm ci lock file out of sync

The gate CI job used `npm ci` but `package-lock.json` was stale (generated from pnpm). Regenerated with `npm install --legacy-peer-deps`. Gate now green.

## PHASE GATES
PHASE GATE M12→Phase 2: COMPLETE — all registries at CAP=20
PHASE GATE Phase 2→Phase 2b: COMPLETE — 7/7 soak tests pass
PHASE GATE Phase 2b→Phase 3: COMPLETE — gate green, 268/268, demo recorded
PHASE GATE Phase 3→Phase 4: COMPLETE — Phase 3 DEMO verified, gate green, 268/268

## Phase 3 DEMO — Complete ✅

| Artifact | Path | Size |
|----------|------|------|
| WebM video | `demo/demo.webm` | 108 KB (>50KB) |
| Frames | `demo/frames/step-00.png` → `step-11.png` | 68–213 KB each |
| Validation | `demo/DEMO.md` | 12/12 PASS |
| Manifest | `demo/STEPS.md` | 12 frames, 0 errors |
| Recorder | `demo/record.mjs` | Playwright CDP capture |

### Frame Validation

| Step | Description | Size | Status |
|------|------------|------|--------|
| 0 | Title screen (3 save slots) | 68 KB | PASS |
| 1 | Create New World | 183 KB | PASS |
| 2 | Walk forward + HUD | 183 KB | PASS |
| 3 | Mine block (left-click) | 183 KB | PASS |
| 4 | Place block (right-click) | 213 KB | PASS |
| 5 | Inventory (E key) | 113 KB | PASS |
| 6 | Pickaxe mining (slot 1) | 113 KB | PASS |
| 7 | Torch placement (slot 3) | 113 KB | PASS |
| 8 | Walk around + mobs | 113 KB | PASS |
| 9 | Walk 200+ blocks | 113 KB | PASS |
| 10 | HUD overlay | 213 KB | PASS |
| 11 | Final landscape | 76 KB | PASS |

### Key Technical Decisions

- **CDP screenshots** over `gl.readPixels()` — headless Chromium returns black for GPU readback; CDP display buffer capture works (120–213 KB gameplay frames)
- **`addInitScript()`** for sessionStorage pre-injection — avoids cross-origin SecurityError
- **Force-click** for inventory close — bypasses Playwright visibility check timeout
- **Recording script** `demo/record.mjs` — idempotent, re-runnable, produces all artifacts

## Phase 4: INFINITE IMPROVE

Drain `BUGS.md` ## Open before each cycle. No STOP_AFTER_DEMO set.

(End of file)
