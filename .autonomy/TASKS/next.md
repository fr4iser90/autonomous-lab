# Next Task: M6 — Voxel Lighting (sky + torch)

## Goal
Implement a simple voxel lighting system with sky light and torch light.

## Deliverables
1. `src/physics/Lighting.ts` — Lighting data model
   - Light level per block: 0–15 (4-bit)
   - Sky light propagation (decreases by 1 per block height)
   - Torch emits light level 14 in radius 8
   - `updateLighting(world)` — full lighting pass

2. Update `src/graphics/MeshBuilder.ts` — Lighting-aware colors
   - Vertex color adjusted by light level (darker = less light)
   - Torch blocks glow (self-lit)

3. Update `src/main.ts` — Wire lighting update on chunk rebuild
   - After break/place: call lighting pass for affected chunks

4. Add tests in `tests/smoke.spec.ts` — lighting operations

## Gate Criteria
- `pnpm run gate` passes
- Torch placed on wall illuminates nearby blocks
- Underground areas are darker than surface
