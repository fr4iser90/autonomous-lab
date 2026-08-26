# Next Task: M2 — Texture Atlas + Enhanced Rendering

## Goal
Replace flat-color block rendering with a procedural 16×16 texture atlas. Each block type gets a unique texture generated at runtime (no image files).

## Deliverables
1. `src/graphics/TextureAtlas.ts` — Procedural texture generator + atlas texture creation
   - 16×16 pixel per-block textures with variation (noise-based)
   - Atlas layout: N blocks × 16×16 cells packed into a single texture
   - Use THREE.CanvasTexture for runtime generation
   - Expose `getUVForFace(blockId, faceIndex)` for consistent UV mapping
2. Update `src/graphics/MeshBuilder.ts` — Per-face UV coordinates
   - Generate UVs mapping each face to the correct atlas cell
   - Switch from `vertexColors` to `map` (atlas texture)
   - Keep hidden-face culling
3. Update `src/graphics/Renderer.ts` — Apply atlas texture
   - Create atlas once, reuse across chunks
   - Apply to chunk meshes
4. Add tests in `tests/smoke.spec.ts` — texture atlas smoke tests
   - Atlas has correct dimensions
   - Each block has a unique texture
   - UV mapping is correct
5. Update PROGRESS.md, CONTENT.md, ROADMAP.md

## Gate Criteria
- `pnpm run gate` passes
- Atlas texture generates at runtime
- Chunk meshes use texture atlas with UVs
