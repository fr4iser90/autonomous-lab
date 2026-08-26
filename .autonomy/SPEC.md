# SPEC — VoxelCraft

## Goal

Infinite voxel sandbox game (Minecraft-style) in the browser using Vite + TypeScript + Three.js r160. Procedural terrain, break/place, inventory, crafting, mobs, day/night, voxel lighting.

## Hard requirements (always)

- Client work stays compatible with Vite + `pnpm run gate`
- Keep Vite `base` = `/autonomous-lab/`
- Ship via `agent/<run-id>` PRs into `main` (Pages from `main` only)
- Never push `main` or `baseline`

## Run-specific requirements

1. **Infinite horizontal world**: Chunks loaded on-demand, no world edge
2. **16×16 texture atlas**: Procedural at runtime (no image files)
3. **Break/place blocks**: Raycast with mining progress
4. **36-slot inventory** with hotbar (E toggle, 1-9 select)
5. **Crafting**: 2×2 (inventory) + 3×3 (crafting table)
6. **3-slot save** via localStorage (slots 0–2)
7. **Mobs**: ≥4 passive + ≥2 hostile
8. **Day/night cycle**: Sky gradient, sun/moon
9. **Voxel lighting**: Sky + torch block light
10. **CAP**: blocks=20, items=20, recipes=20, npcs=20

## Non-goals

- Multiplayer, cloud saves, auth, external assets
