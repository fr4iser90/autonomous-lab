# VoxelCraft — Infinite Voxel Sandbox

**Genre:** Voxel sandbox (Minecraft-style) built with Vite + TypeScript + Three.js r160.

**Play (live after green automerge):** https://fr4iser90.github.io/autonomous-lab/

Local/DSH preview: `pnpm run dev` → http://127.0.0.1:5173

## Features

- Infinite procedural terrain with biomes
- Break/place blocks with first-person controls
- 3-slot save system with local persistence
- Inventory + crafting (2×2 and 3×3 grids)
- Mobs (passive + hostile)
- Day/night cycle
- 16 block types with procedural rendering

## Quick Start

```sh
pnpm install
pnpm run gate
pnpm run dev
```

## Live Loop

```
agent/* commit → Open agent PR → CI gate → Automerge → main → Pages
```

## DSH Autonomy

```
VoxelCraft — infinite voxel sandbox. M1 through M12 milestones, Phase 2 content cycles to CAP/CAP, Phase 3 DEMO, Phase 4 infinite improvement.
```

## Scripts

| Script | Meaning |
|---|---|
| `pnpm test` | Vitest |
| `pnpm run build` | typecheck + Vite build (`base=/autonomous-lab/`) |
| `pnpm run gate` | test + build |
| `pnpm run dev` | Vite on 5173 |
