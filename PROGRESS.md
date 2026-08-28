<!-- PROGRESS: Ashen Delve — Phase 2 in progress. M1–M12 shipped, PHASE 2 content expansion underway. -->

# Progress

## NOW

- Phase: **Phase 2 — content expansion** — M1–M12 complete, CAP reached on mobKits + items
- Milestone: 16 mob kits (16/16), 16 items (16/16), 7 floor themes (7/16)
- Branch: `agent/dungeon-crawl-20260829` → PR #46 (in progress)
- Engine: **Three.js** 0.170.0 (procedural meshes only — no imports)
- Gate: **23 tests green, build green, ~553 KB bundle**
- BUGS: all cleared
- PR #45 merged (squash) — items CAP reached!

## Milestones

| # | Name | Status | Key files |
|---|------|--------|-----------|
| M1 | Visual Spec + Shell | ✅ | `shared/design.md`, `index.html`, `src/styles.css` |
| M2 | Three.js Bootstrap | ✅ | `src/render/GameRenderer.ts`, `src/render/camera.ts` |
| M3 | DungeonPCG | ✅ | `src/systems/DungeonPCG.ts` (BSP + corridors + BFS) |
| M4 | Player + Input | ✅ | `src/kits/playerKit.ts`, `src/systems/input.ts` |
| M5 | Mob Kit + Chase AI | ✅ | `src/entities/MobKit.ts`, `src/entities/Goblin.ts`, `src/systems/ChaseAI.ts`, `src/entities/Animator.ts` |
| M6 | CombatEngine | ✅ | `src/systems/CombatEngine.ts` (melee, crit, death, combat log) |
| M7 | Loot + Inventory | ✅ | `src/systems/Inventory.ts`, `src/data/items.ts` |
| M8 | Floor Themes | ✅ | `src/data/floors.ts` |
| M9 | 3+ Mobs + PropField | ✅ | `src/entities/Shade.ts`, `src/entities/Stalker.ts`, `src/render/PropField.ts` |
| M10 | Audio + Settings | ✅ | `src/systems/AudioEngine.ts` (Web Audio procedural) |
| M11 | Boss + Minimap | ✅ | `src/entities/Boss.ts`, `src/render/Minimap.ts` |
| M12 | Polish + Integration | ✅ | `src/main.ts` (full game loop) |

## P2 — Phase 2 Content Expansion

| Content | Shipped | Total | CAP |
|---------|---------|-------|-----|
| Mob Kits | 14 | 16 | skeleton, bat, ogre, mummy |
| Items | 16 | 16 | steel-club, mega-potion, iron-shield, rune-ring |
| Floor Themes | 7 | 16 | elven ruins (5–9), magma caverns (10+) |

## Log

- 2026-08-27: M1–M9 shipped (PR #31). Gate green locally.
- 2026-08-27: M10–M12 shipped — Audio, Boss, Minimap, full integration.
- 2026-08-27: Fixed `@vitest/ui` version conflict (4.1.11 → 3.2.4) for CI npm compatibility.
- 2026-08-27: Fixed tsconfig `"node"` types reference (browser-only project).
- 2026-08-27: PR #34 merged into `main` after human resolved conflicts.
- 2026-08-27: All 12 milestones complete. BUGS cleared. Pages deploying.
- 2026-08-27: P2-1: Added 4 mob variants (Skeleton ranged, Bat swarm, Ogre charge, Mummy curse).
- 2026-08-27: P2-1: Added 4 items (steel-club, mega-potion, iron-shield, rune-ring).
- 2026-08-27: P2-1: Added 2 floor themes (Elven Ruins 5–9, Magma Caverns 10+).
- 2026-08-28: P2-2: Added Spider, Wolf mob kits (10→14 mobKits). Extracted game loop to GameLoop.ts.
- 2026-08-28: P2-3: Added Zombie, Harpy, Troll, Lich mob kits (14→14). Added 6 items (10→16 items CAP reached). Added 3 floor themes (4→7).
- 2026-08-28: PR #45 merged — items CAP reached (16/16).
- 2026-08-29: P2-4: Added Phantom (phase-shifting ghost) and Elemental (fire elemental with burn aura). Mob kits CAP reached: 16/16!

## CAP Checklist

- mobKits: 16/16 ✅ **CAP REACHED!** (Goblin, Shade, Stalker, Skeleton, Bat, Ogre, Mummy, Boss, Spider, Wolf, Zombie, Harpy, Troll, Lich, Phantom, Elemental)
- items: 16/16 ✅ **CAP REACHED!** (rusty-sword, iron-axe, flame-staff, steel-club, health-potion, greater-potion, mega-potion, dungeon-key, iron-shield, rune-ring, lightning-bow, poison-dagger, plate-armor, crystal-orb, blessed-amulet, enchanted-boots)
- floorThemes: 7/16 (ash, crypt, ruins, magma, swamp, frozen, void) — halfway to CAP
- propTypes: (none added) — within CAP

## Fixes Applied

- `@vitest/ui`: `^4.1.11` → `^3.2.4` — resolved npm peer dep conflict with vitest@3.2.7
- `tsconfig.json`: removed `"node"` from `types` — no Node runtime needed
- `package.json`: `@types/node` installed for typecheck compatibility

## Next (Phase 2b → Phase 3)

- Finish Phase 2: reach CAP on mobKits, items, floorThemes
- Phase 2b: soak testing with all content types
- Phase 3: demo (webm, storyboard frames, visual validation)
- Phase 4: economy, skill tree, stealth zones
