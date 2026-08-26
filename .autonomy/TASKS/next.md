# Next Task: M3 — Raycast Break/Place with Mining Progress

## Goal
Implement first-person raycasting to break and place blocks, with mining progress (hold to break) and smooth placement feedback.

## Deliverables
1. `src/physics/Raycaster.ts` — First-person raycast from camera through crosshair
   - Casts ray through world, returns first solid block hit
   - Returns hit position, normal, and block position
   - Supports configurable max distance (e.g., 6 blocks reach)
2. `src/physics/BlockInteraction.ts` — Break and place logic
   - Left click: start mining, show progress indicator, break on completion
   - Right click: place selected block (if hotbar has it)
   - Mining progress scales with block hardness
3. Update `src/main.ts` — Wire up mouse events
   - Left click = start mining, hold = progress, release = break if done
   - Right click = place block
   - Block position highlight overlay
4. Update HUD — Show mining progress bar
5. Add tests in `tests/smoke.spec.ts` — raycast hit detection
6. Update PROGRESS.md, ROADMAP.md

## Gate Criteria
- `pnpm run gate` passes
- Raycast hits correct blocks
- Block breaking shows progress
- Block placement works
