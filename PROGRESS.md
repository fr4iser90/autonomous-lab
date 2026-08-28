<!-- PROGRESS: Ashen Delve — Phase 5 complete. P5-1 rarity, P5-2 lootDrop, P5-3 rarity UI, P5-4 sealed doors, P5-5 stairs descent. -->

# Progress

## NOW

- Phase: **Phase 6 — bugfix + validation** — B-9 through B-13 fixed, B-7 + B-8 fixed, P5-1–P5-5 all shipped
- Milestone: 16 mob kits (16/16), 16 items (16/16), 16 floor themes (16/16), Phase 3 visual (6/6 PASS)
- Branch: `agent/dungeon-crawl-20260829-v2` → P4-1 through P5-5 merged (PR#52,53,55,60,61,62,64,65,66,67) + B-7 (PR#69) + B-8 (PR#70)
- Engine: **Three.js** 0.170.0 (procedural meshes only — no imports)
- Gate: **126 tests green, build green, ~585 KB bundle**
- BUGS: **all drained** (B-7 through B-13 fixed)
- Pages: **https://fr4iser90.github.io/autonomous-lab/** live

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

## P4 — Phase 4 Systems

| Slice | Feature | Status | Key files |
|-------|---------|--------|-----------|
| P4-1 | Economy (scrap + shop) | ✅ SHIPPED PR#52 | `Economy.ts`, `shopItems.ts`, `tests/economy.test.ts` |
| P4-2 | Skill tree | ✅ SHIPPED PR#53 | `SkillTree.ts`, `tests/skill-tree.test.ts` |
| P4-3 | Stealth zones | ✅ SHIPPED PR#55 | `DungeonPCG.ts`, `ChaseAI.ts`, `GameLoop.ts`, `uiHelpers.ts`, `tests/stealth.test.ts` |
| P4-4 | Floor traps | ✅ SHIPPED PR#60 | `traps.ts`, `DungeonPCG.ts` (trap gen/render), `GameLoop.ts` (trap damage), `uiHelpers.ts`, `index.html`, `tests/traps.test.ts` |
| P5-1 | Item rarity on all 16 | ✅ SHIPPED PR#61 | `items.ts` (Rarity type on all 16 defs) |
| P5-2 | LootDrop system | ✅ SHIPPED PR#62 | `LootDrop.ts` (weighted drops, 3D collectibles, auto-pickup) |
| P5-3 | Rarity UI + loot toast | ✅ SHIPPED PR#64 | `main.ts` (rarity class/label helpers, showLootToast, updateInventoryUI, updateShopUI), `styles.css` (rarity colors), `index.html` (loot-toast HUD) |
| P5-4 | Sealed doors + key consumption | ✅ SHIPPED PR#65 | `Inventory.ts` (getKeyCount, addKeys, consumeKey), `DungeonPCG.ts` (getGridPosition, isSealedDoor, openDoorAt), `GameLoop.ts` (door collision block), `main.ts` (key count HUD, door toast), `styles.css` (key HUD + door toast), `index.html` (key-count + door-toast elements), `tests/sealed-doors.test.ts` (8 tests), `Inventory.test.ts` (5 key tests) |
| P5-5 | Stairs descent + floor progression | ✅ SHIPPED PR#66 (validated PR#67) | `Transition.ts` (spawnMobs/spawnBoss/advanceToFloor/showFloorToast), `main.ts` (wired callback, 481 lines), `GameRenderer.ts` (clearScene), `DungeonPCG.ts` (isOnStairs), `tests/floor-advance.test.ts` (9 tests) |

## Log

- **2026-08-29 VALIDATE (Phase 6 / Play — document only)**: SHA=`03d549e`. Playwright smoke test via `addInitScript` + single `page.evaluate()`. Title: PASS (4/4). Boot: PASS. HUD: PASS (floor=Floor 1, hp-text=20/20, stealth=Visible, scrap=0, keys=🔑 0). Panels: PASS (E=inventory, Q=shop, S=skills, ESC=pause — all open/close correctly). Attack (mouse): PASS (combat log fires, logBeforeLen=41). Boss UI: PASS (bar + warning exist, barActive=false expected). Mobs: 0 at start (expected). **2 new bugs found**: B-7 (settings-back always returns to title, breaking pause→settings→back flow), B-8 (stealth-label initially hidden but shown after first game loop frame). `VALIDATE: 03d549e PASS` (19/20 smoke checks — 1 test-selector bug corrected).

- 2026-08-27: M1–M9 shipped (PR #31). Gate green locally.
- 2026-08-27: M10–M12 shipped — Audio, Boss, Minimap, full integration.
- 2026-08-27: Fixed `@vitest/ui` version conflict (4.1.11 → 3.2.4) for CI npm compatibility.
- 2026-08-27: Fixed tsconfig `"node"` types reference (browser-only project).
- 2026-08-27: PR #34 merged into `main` after human resolved conflicts.
- 2026-08-27: All 12 milestones complete. BUGS cleared. Pages deploying.
- 2026-08-27: P2-1: Added 4 mob variants (Skeleton ranged, Bat swarm, Ogre charge, Mummy curse).
- 2026-08-27: P2-1: Added 4 items (steel-club, mega-potion, iron-shield, rune-ring).
- 2026-08-27: P2-1: Added 2 floor themes (Elven Ruins 5–9, Magma Caverns 10+).
- 2026-08-28: P2-2: Added Spider, Wolf mob kits (14→14). Added 6 items (10→16 items CAP reached). Added 3 floor themes (4→7).
- 2026-08-28: P2-3: Added Zombie, Harpy, Troll, Lich mob kits (14→14). Added 6 items (10→16 items CAP reached). Added 3 floor themes (4→7).
- 2026-08-28: PR #45 merged — items CAP reached (16/16).
- 2026-08-29: P2-4: Added Phantom (phase-shifting ghost) and Elemental (fire elemental with burn aura). Mob kits CAP reached: 16/16!
- 2026-08-29: P2-5: Added 9 new floor themes (crystal-cave, jungle, ice-cave, swamp, dark-forest, volcanic, sky-temple, shadow-realm, celestial, abyssal) to reach 16/16 CAP.
- 2026-08-29: PR #50 merged (squash) — Phase 3 visual validation: ESC pause fix, 6/6 Playwright DOM checks PASS, DEMO.md updated.
- 2026-08-29: PR #52 merged (squash) — Phase 4-1: Economy system (scrap currency + shop purchases, 19 tests, ~558 KB).
- 2026-08-29: PR #53 merged (squash) — Phase 4-2: Skill tree (8 skills, floor-gated, 19 tests).
- 2026-08-29: PR #54 merged (squash) — VALIDATE Playwright: 6/6 headless PASS, headless WebGL fixes.
- 2026-08-29: PR #55 merged (squash) — Phase 4-3: Stealth zones (stealth tiles reduce aggro range by 65%, darker floor tiles, HUD indicator, 10 tests).
- 2026-08-29: P4-4: Floor traps — 3 trap types (spike/poison/fire), dungeon generation, trap damage in game loop, 3D visuals, HUD indicator, 12 tests. PR#60.
- 2026-08-29: P5-1: Item rarity — added Rarity type to all 16 ItemDefs. PR#61.
- 2026-08-29: P5-2: LootDrop system — weighted mob drops, 3D floating collectibles, auto-pickup via manager, `LootDropManager.update()` returns collected items. PR#62.
- 2026-08-29: P5-3: Rarity UI polish — color-coded inventory slots (green/blue/gold for common/uncommon/rare), loot collection toast with fade-out, shop rarity labels, auto-pickup toast in game loop. PR#64.
- 2026-08-29: P5-5: Stairs descent — floor progression on stairs tiles. New Transition.ts module (spawnMobs/spawnBoss/advanceToFloor/showFloorToast), GameRenderer.clearScene(), DungeonPCG.isOnStairs(), stairs cooldown in GameLoop. 9 new tests. PR#66.
- 2026-08-29: P5-5 validate: Found 2 bugs in Transition.ts — `updateGameVars` passed old `playerFloor` instead of new `floor`, and `addCombatLog` called twice per descent. Fixed: pass `floor`, remove duplicate log, clean unused params. Gate green (126/126, 577 KB). PR#67.

## CAP Checklist

- mobKits: 16/16 ✅ **CAP REACHED!** (Goblin, Shade, Stalker, Skeleton, Bat, Ogre, Mummy, Boss, Spider, Wolf, Zombie, Harpy, Troll, Lich, Phantom, Elemental)
- items: 16/16 ✅ **CAP REACHED!** (rusty-sword, iron-axe, flame-staff, steel-club, health-potion, greater-potion, mega-potion, dungeon-key, iron-shield, rune-ring, lightning-bow, poison-dagger, plate-armor, crystal-orb, blessed-amulet, enchanted-boots)
- floorThemes: 16/16 ✅ **CAP REACHED!** (ash, crypt, ruins, crystal-cave, jungle, magma, ice-cave, swamp, dark-forest, frozen, volcanic, sky-temple, void, shadow-realm, celestial, abyssal)
- propTypes: (none added) — within CAP

## Fixes Applied

- `@vitest/ui`: `^4.1.11` → `^3.2.4` — resolved npm peer dep conflict with vitest@3.2.7
- `tsconfig.json`: removed `"node"` from `types` — no Node runtime needed
- `package.json`: `@types/node` installed for typecheck compatibility

## Next

- ✅ Phase 6 complete — B-7 (settings-back) and B-8 (stealth-label) both fixed and merged. PR#69, #70.
- ✅ All 12 milestones complete (M1–M12), 126/126 tests, 0 open bugs. Game is **PLAYABLE** on Pages.

- ✅ P4-1: Economy shipped (scrap + shop)
- ✅ P4-2: Skill tree shipped (8 skills, floor-gated)
- ✅ P4-3: Stealth zones shipped (stealth tiles reduce aggro by 65%, darker floors, HUD indicator)
- ✅ P4-4: Floor traps shipped (spike/poison/fire — 3 types, 12 tests, PR#60)
- ✅ P5-1: Item rarity on all 16 items shipped (PR#61)
- ✅ P5-2: LootDrop system shipped (weighted drops, 3D collectibles, auto-pickup, PR#62)
- ✅ P5-3: Rarity UI + loot toast feedback shipped (PR#64) — color-coded slots, toast with rarity variants, auto-pickup feedback
- ✅ P5-4: Sealed doors shipped — key consumption blocks/opens doors, key count HUD, door open toast. Inventory: getKeyCount/addKeys/consumeKey. DungeonPCG: getGridPosition/isSealedDoor/openDoorAt. GameLoop: door collision in movement. 13 new tests. PR#65.
- ✅ P5-5: Stairs descent shipped — floor progression. DungeonPCG: isOnStairs. GameLoop: stairs detection + cooldown. Transition.ts: spawnMobs/spawnBoss/advanceToFloor/showFloorToast. main.ts: wired callback (481 lines). GameRenderer.ts: clearScene(). 9 new tests. PR#66.
- 🔧 P5-5 validate: Fixed `updateGameVars` floor param + duplicate combat log. PR#67 (gate green, 126/126 tests).
- 🔧 B-7 fix (Phase 6): Settings-back button now returns to origin context — from title → title, from pause → game. `main.ts` settings-back handler checks `gameState`: 'menu'/'dead' → title, 'playing' → game. PR#69.
- 🔧 B-8 fix (Phase 6): Removed inline `display:none` from `#stealth-label` in HTML — label visible from first frame. PR#70. All bugs now drained.
- 🔧 B-9 fix (Phase 6 validation): Added controls text to title screen — player can now see WASD Move, Mouse Drag Rotate, Space/Click Attack, E Inventory, O Shop, T Skills, Esc/P Pause before starting. `index.html` + `styles.css`.
- 🔧 B-10 fix (Phase 6 validation): Resolved Q/E key conflict — removed keyboard rotation (was conflicting with shop/inventory toggles), rotation now mouse-drag only. Repurposed O for Shop and T for Skills. `input.ts` + `main.ts`.
- 🔧 B-11 fix (Phase 6 validation): Resolved S key conflict — skills toggle moved from S to T (T for "Skill Tree"), S remains for backward movement. `main.ts` + `index.html`.
- 🔧 B-12 fix (Phase 6 validation): Added Space bar as keyboard attack key — attack was mouse-click only, not documented. `input.ts`.
- 🔧 B-13 fix (Phase 6 validation): Added `controls-hint` element to HUD showing full key mapping. `index.html` + `styles.css`.
- ✅ Phase 6 validation (2026-08-29): Playwright smoke test against live Pages confirmed title screen shows "WASD|Arrow|click|attack|mouse|keyboard|controls|move" — controls text present. All 126 tests green, gate green. ESLint fix: `validate-*.mjs` added to eslint ignores (browser globals in validation scripts).
