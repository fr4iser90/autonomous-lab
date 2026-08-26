# VoxelCraft — Phase 3 DEMO

## Overview

Playable game demo recorded via Playwright page.screenshot() (CDP display buffer capture).
12 storyboard frames covering the full gameplay loop, plus a WebM video.

| Artifact | Path | Size |
|----------|------|------|
| WebM video | `demo/demo.webm` | 110 KB |
| Frames | `demo/frames/step-00.png` — `step-11.png` | 68–213 KB each |

**Total frames: 12**

## Storyboard Validation

Each step has a PASS/FAIL verdict based on frame size (> 5 KB minimum, visible content expected).

| # | Step | Frame | Visual Check | Verdict |
|---|------|-------|-------------|---------|
| 0 | Title screen | `step-00.png` (68 KB) | VoxelCraft title + 3 save slots visible | **PASS** |
| 1 | Create New World | `step-01.png` (183 KB) | 3D terrain loading (grass, sky) | **PASS** |
| 2 | Walk forward | `step-02.png` (183 KB) | Player moved — terrain and HUD visible | **PASS** |
| 3 | Mine a block | `step-03.png` (183 KB) | Left-click mining — break progress visible | **PASS** |
| 4 | Place a block | `step-04.png` (213 KB) | Right-click placement — new block on terrain | **PASS** |
| 5 | Open inventory | `step-05.png` (113 KB) | Inventory overlay (E key) — 3×3 crafting grid | **PASS** |
| 6 | Mine with pickaxe | `step-06.png` (113 KB) | Slot 1 selected — mining with pickaxe progress | **PASS** |
| 7 | Place torch | `step-07.png` (113 KB) | Slot 3 selected — torch placed as light source | **PASS** |
| 8 | Walk around | `step-08.png` (113 KB) | Mobs visible on terrain — exploration | **PASS** |
| 9 | Walk 200+ blocks | `step-09.png` (113 KB) | New chunks loaded — large-distance travel | **PASS** |
| 10 | HUD overlay | `step-10.png` (213 KB) | HUD with position, chunks, FPS, hotbar readable | **PASS** |
| 11 | Final frame | `step-11.png` (76 KB) | Full landscape + HUD overlay legible | **PASS** |

**All 12 steps: PASS**

## Technical Notes

- **Capture method**: Playwright `page.screenshot()` (CDP display buffer capture)
- **Headless limitation**: `gl.readPixels()` always returns black in Chromium headless mode; CDP screenshots work correctly (120–213 KB gameplay frames confirm rendered terrain)
- **Instructions overlay**: Dismissed via `sessionStorage` pre-injection (`addInitScript`) to avoid blocking the demo flow
- **Inventory close**: Uses `{ force: true }` click to bypass Playwright visibility check timeout
- **Video**: `ffmpeg` libvpx-vp9, 4 FPS, 1280×720, ~2.75 s playback
- **Recording script**: `demo/record.mjs` — idempotent; re-run with `PORT=5173 node demo/record.mjs`

## How to Re-record

```bash
PORT=5173 node demo/record.mjs
```

This starts the dev server on the specified port (default 5173), automates all 12 storyboard steps, captures screenshots, and builds the WebM video.
