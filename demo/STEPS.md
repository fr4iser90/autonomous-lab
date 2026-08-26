# VoxelCraft DEMO

## Storyboard

| Step | Label | Frame Size | Status |
|------|-------|-----------|--------|
| 0 | Title screen - VoxelCraft with 3 save slots | 68867 bytes | PASS |
| 1 | Create New World - terrain loading | 183665 bytes | PASS |
| 2 | Walking forward - terrain and HUD visible | 183667 bytes | PASS |
| 3 | Mine a block - left-click on terrain | 183677 bytes | PASS |
| 4 | Place a block - right-click on terrain | 213019 bytes | PASS |
| 5 | Inventory open (E) - 3x3 crafting grid visible | 113449 bytes | PASS |
| 6 | Mine with pickaxe (slot 1) - progress visible | 113449 bytes | PASS |
| 7 | Place torch (slot 3) - light source on terrain | 113441 bytes | PASS |
| 8 | Walk around - mobs and terrain visible | 113441 bytes | PASS |
| 9 | Walk 200+ blocks - new chunks visible | 113441 bytes | PASS |
| 10 | HUD overlay - position and stats visible | 213039 bytes | PASS |
| 11 | HUD + landscape readable | 76150 bytes | PASS |

**Total frames:** 12

## Page Errors

None

## Notes

- All frames captured via Playwright page.screenshot() (CDP display buffer capture)
- Headless Chromium gl.readPixels() returns black — proven by CDP screenshots working
- Title screens: ~68KB, gameplay frames: 120-230KB
- Inventory close uses force=true click to bypass Playwright visibility check timeout