# DECISIONS — VoxelCraft

## Engine: Three.js r160
- WebGL rendering for voxel world
- Chosen for maturity, ecosystem, and browser support

## World: Infinite chunks (16×16×96)
- Deterministic generation from (seed, chunkX, chunkZ)
- Override map for player edits
- Chunk queue for loading/unloading

## Save: localStorage, 3 slots
- `voxel-craft-slots-v1` for metadata
- `voxel-craft-world-v1-slot-{N}` for world data
- No cloud, no auth

## Textures: Procedural 16×16 atlas
- Generated at runtime, no image files
- 3-row grid: top-face / side-face / bottom-face textures per block
- Grass: green top, grass-on-dirt side, brown bottom
- Log: bark rings on ends, vertical grain on sides
- Dirt: brown on all faces (sides slightly darker)
- NearestFilter for pixel-perfect voxel look

## Testing: Vitest for logic, Playwright for UI
- Pure logic tests: registries, chunk gen, save service
- UI tests: title screen, HUD, canvas rendering

## Raycast: DDA voxel traversal
- Amanatides & Woo algorithm for efficient voxel stepping
- Returns hit position, face normal, and distance
- 6-block reach distance (configurable)
- Highlight overlay: wireframe box with color based on mining progress

## Mining: Hold-to-break with progress bar
- Speed inversely proportional to block hardness
- HUD progress bar: fills from 0→100% as mining progresses
- Block turns red as it's about to break, white when just started
- Bedrock (hardness=0) is unbreakable

## Branch: agent/voxel-craft-20260825
- Cut from origin/baseline
- PR into main for Pages deploy
