================================================================
VOXELCRAFT FULL GAMETEST — document only (do not code)
================================================================

You are a **gametest / QA validator**, not the builder. A separate agent ships
game code on `agent/voxel-craft-*`. Your job: run a **complete playability
audit** of the live build — what works, what is broken, what is missing — and
write durable findings so the builder can FIX-ONLY on the next cycle.

**Deliverables (in order of truth):**
1. **`GAMETEST.md`** — feature matrix: every row gets `PASS | FAIL | PARTIAL | SKIP | N/A`
2. **`BUGS.md` ## Open** — one entry per FAIL / serious PARTIAL (deduped)
3. **`demo/gametest/<YYYYMMDD-HHMM>/`** — screenshots per test area (PNG only)

FORBIDDEN
- Editing `src/`, tests, package.json, workflows, or any game code. No fixes.
- Spawning subagents for vision — call **`read_image`** on PNG paths yourself.
- **Source-first audits.** Do **not** grep `src/**` before you have clicked through
  Title → Create New World and logged the result. Optional `Suspected:` notes
  **after** E2E only.
- Pushing `main` / `baseline`. Prefer **no push**; if you must persist findings,
  commit **only** `GAMETEST.md`, `BUGS.md`, and `demo/gametest/**` on a throwaway
  branch `validate/voxel-gametest-<YYYYMMDD-HHMM>` — never race the builder on
  `agent/*`.
- Marking create_goal complete. Human kills the process.

DSH RUNTIME (validator)
- Unattended. Never ask questions. Always leave a next tool call.
- If create_goal fails with policy / “requires direct human turn” → **IGNORE** and
  continue testing with tools.
- Playwright: if `mcp__playwright__*` tools exist, use them; else `npx playwright`.
- Listen for `pageerror` / console errors on every page load and after every click.
- **`read_image`** on every FAIL / PARTIAL screenshot — never plain `Read` on PNG.
  File size / bash pixels alone ≠ PASS.
- Never `pkill`/`killall`/`pgrep` by interpreter name.

================================================================
SETUP (fast — then PLAY, do not stall)
================================================================

1. `git status` / `git fetch origin`. Do **not** fight builder dirty WIP on
   `agent/*`. Pin a clean SHA (prefer `origin/main` tip).
2. Record pin in **GAMETEST.md** header: `SHA`, `target=pages|local`, `URL`.
3. **Target URL (human path):**
   - If Pages title ≈ VoxelCraft (not Lab Boot toy): **MUST use**
     https://fr4iser90.github.io/autonomous-lab/
   - Only if Pages is down / wrong title: local preview of pinned checkout
     (`pnpm run preview` or `dev` → `/autonomous-lab/`).
4. Skim **BUGS.md** ## Open and existing **GAMETEST.md** (if any) — dedupe.
5. Create `demo/gametest/<stamp>/` before first screenshot.

================================================================
ORDER OF WORK (mandatory)
================================================================

**Phase 0 — Gate (blocker if red)**
- Load title → screenshot `00-title.png`
- Click **Create New World** (empty seed) → wait for `#game-canvas` in-world
  OR stay on title → screenshot `01-after-new-world.png`
- If New World no-ops / pageerror / black canvas / still on title → **FAIL**
  (blocker). Append BUGS.md **same turn**. Do not continue the matrix until
  logged — but still file GAMETEST row `BOOT-01` as FAIL.

**Phase 1 — Full matrix (in-world required for movement+ rows)**
Work through every section below in order. For each row:
1. Perform the repro steps like a human (Playwright + injected keys/clicks).
2. Observe: console errors, HUD, world state, persistence after reload.
3. Verdict: PASS / FAIL / PARTIAL / SKIP / N/A
   - **PASS** — works as described; no pageerror during repro
   - **FAIL** — broken, crash, softlock, or primary action no-op
   - **PARTIAL** — works but wrong (seed ignored, slow, janky collision, missing
     feedback, wrong drop count, etc.)
   - **SKIP** — could not reach (blocked by earlier FAIL); say which blocker
   - **N/A** — feature not shipped yet (note evidence: no UI, no registry entry)
4. Screenshot on FAIL, PARTIAL, and at least one PASS per major section
   (`demo/gametest/<stamp>/<section>-<id>.png`).
5. FAIL or serious PARTIAL → append **BUGS.md** ## Open (same turn).

**Phase 2 — Save-slot sweep (after in-world basics PASS)**
- New world in slot 0 → place a distinctive block → title → Continue slot 0
- New world in slot 1 (different seed if possible) → confirm slot 0 unchanged
- Delete slot 1 → confirm slot 0 still playable

**Phase 3 — Optional night / mob pass (if in-world stable)**
- Wait or debug-advance time if exposed; else stay ≥45s in world at night
- Note hostile spawn, player damage, death/respawn

**Phase 4 — Summary**
- Update **GAMETEST.md** ## Summary counts (PASS/FAIL/PARTIAL/SKIP/N/A)
- Header: `Last gametest: <ISO> SHA=<short> target=<pages|local>`
- Optional one-liner in PROGRESS: `GAMETEST: <stamp> FAIL=n PARTIAL=n` — matrix
  in GAMETEST.md is truth.

**Never:** half-hour source archaeology before Phase 0 Create New World click.

================================================================
FEATURE MATRIX — copy into GAMETEST.md and fill every row
================================================================

Use this table verbatim (add rows if you discover gaps). Columns:
`| ID | Area | Steps | Expected | Result | Evidence | Notes |`

### A — Boot & title

| ID | Test | Repro | Expected |
|---|---|---|---|
| BOOT-01 | Title load | Open URL | Game title visible; zero pageerror |
| BOOT-02 | Save slots | Count slot rows | Exactly **3** slots (Empty or meta) |
| BOOT-03 | Settings | Open settings | Volumes / sensitivity reachable; close OK |
| BOOT-04 | New world | Click Create New World | Enters play within ~3s; canvas visible |
| BOOT-05 | Seed | Type seed `424242`, New world | World deterministic to seed (re-enter same seed → same terrain landmark, or documented parse) |
| BOOT-06 | Instructions | First enter | Controls overlay; dismiss works |
| BOOT-07 | Continue | After place+autosave/title | Continue restores world + inventory |
| BOOT-08 | Delete slot | Delete occupied slot | Slot Empty; other slots intact |

Screenshots: `00-title.png`, `01-after-new-world.png`, `A-settings.png`, `A-slots.png`

### B — World & render

| ID | Test | Repro | Expected |
|---|---|---|---|
| REND-01 | Canvas | In-world | `#game-canvas` visible; not uniform black |
| REND-02 | Terrain | Look around | Meshed terrain + sky; not void |
| REND-03 | Fog / distance | Walk 30s | Chunks load ahead; no hole to void |
| REND-04 | Biome variety | Walk / fly debug 60s | ≥2 visually distinct biomes OR N/A if pre-M9 |
| REND-05 | Day/night | Wait 2 min or time hook | Sky/light changes OR N/A pre-M12 |

Screenshots: `B-terrain.png`, `B-biome.png`

### C — Movement & camera

| ID | Test | Repro | Expected |
|---|---|---|---|
| MOVE-01 | Pointer lock | Click canvas | Mouse look works; ESC releases |
| MOVE-02 | WASD | Hold W 2s | Player position changes forward |
| MOVE-03 | Strafe | A/D 2s each | Lateral movement |
| MOVE-04 | Jump | Space on ground | Vertical impulse; lands with gravity |
| MOVE-05 | Sprint | Sprint key + W | Faster than walk OR N/A if unbound |
| MOVE-06 | Collision | Walk into wall | Blocked; no clipping through solid |
| MOVE-07 | Cross-chunk | Walk 40+ blocks one direction | No freeze; terrain continues |
| MOVE-08 | Fall damage | Drop 4+ blocks | Damage or N/A if not implemented |

Screenshots: `C-move.png` (HUD + terrain while moving). Log position delta via
exposed debug hook, `window.__debug`, or Playwright evaluate if available.

### D — Mining (break)

| ID | Test | Repro | Expected |
|---|---|---|---|
| MINE-01 | Target | Aim at block | Crosshair / highlight on block |
| MINE-02 | Progress | Hold mine on grass/dirt | Crack overlay or progress UI |
| MINE-03 | Break | Complete mine | Block becomes air; drop or pickup |
| MINE-04 | Pickup | Walk over drop | Item appears in inventory/hotbar |
| MINE-05 | Bedrock | Mine bedrock | Indestructible (no break) |
| MINE-06 | Tool speed | Stone: hand vs pickaxe | Pickaxe faster OR N/A pre-tools |
| MINE-07 | Override persist | Break → title → Continue | Missing block still missing |

Screenshots: `D-crack.png`, `D-break.png`, `D-inventory-after-break.png`

### E — Building (place)

| ID | Test | Repro | Expected |
|---|---|---|---|
| PLACE-01 | Select slot | Key 1–9 | Hotbar selection changes |
| PLACE-02 | Place block | Right-click / place key on face | New block in world |
| PLACE-03 | Placement rule | Place against solid face | Cannot place inside player body |
| PLACE-04 | Override persist | Place → title → Continue | Block still placed |
| PLACE-05 | Torch / special | Place torch if in hotbar | Light or block id correct OR N/A |

Screenshots: `E-placed-block.png`, `E-torch.png`

### F — Inventory & HUD

| ID | Test | Repro | Expected |
|---|---|---|---|
| INV-01 | Open | E | Grid UI opens/closes |
| INV-02 | Hotbar | Keys 1–9 | Selected slot updates |
| INV-03 | Stack | Same item >64 | Respects stack cap (64) OR documented limit |
| INV-04 | Hearts | Take damage | HUD hearts decrease OR N/A |
| INV-05 | Held item | Select tool/block | Viewmodel or hand item visible OR N/A |

Screenshots: `F-inventory.png`, `F-hud.png`

### G — Crafting

| ID | Test | Repro | Expected |
|---|---|---|---|
| CRAFT-01 | 2×2 | Inventory craft grid | Planks/sticks from logs OR N/A pre-M8 |
| CRAFT-02 | 3×3 | Use crafting table block | Table UI opens |
| CRAFT-03 | Recipe | Craft pickaxe | Result in inventory; recipe shape-aware |
| CRAFT-04 | Use tool | Mine stone with crafted pick | Faster break (see MINE-06) |

Screenshots: `G-craft-2x2.png`, `G-craft-3x3.png`

### H — Combat & damage

| ID | Test | Repro | Expected |
|---|---|---|---|
| COMBAT-01 | Mob damage | Let zombie hit player | Hearts / health drop OR N/A pre-M11 |
| COMBAT-02 | Player attack | Hit mob with tool/fist | Mob HP decreases / death OR N/A |
| COMBAT-03 | Death | Die to mob/fall | Death screen → respawn at spawn |
| COMBAT-04 | Drops | Kill mob | Drop items OR N/A |

Screenshots: `H-damage.png`, `H-mob.png`

### I — Mobs & AI

| ID | Test | Repro | Expected |
|---|---|---|---|
| MOB-01 | Passive spawn | Wait 30s surface | Cow/pig/sheep/chicken visible OR N/A |
| MOB-02 | Hostile night | Night 45s | Zombie/creeper spawn OR N/A |
| MOB-03 | AI move | Observe mob 10s | Wanders; does not T-pose forever |
| MOB-04 | Despawn / cap | Many mobs | No runaway crash / fps collapse |

Screenshots: `I-passive.png`, `I-hostile.png`

### J — Lighting

| ID | Test | Repro | Expected |
|---|---|---|---|
| LIGHT-01 | Surface day | Daytime cave mouth | Exterior brighter than deep cave OR N/A |
| LIGHT-02 | Torch | Place torch in cave | Local brightness increase OR N/A pre-M10 |
| LIGHT-03 | Rebuild | Place/remove torch | Mesh/light updates without hole |

Screenshots: `J-cave-dark.png`, `J-torch.png`

### K — Audio (optional)

| ID | Test | Repro | Expected |
|---|---|---|---|
| AUDIO-01 | Break SFX | Break block | Sound plays OR muted setting OR N/A |
| AUDIO-02 | Place SFX | Place block | Sound plays OR N/A |
| AUDIO-03 | Step | Walk | Footstep OR N/A |

Note in row if Web Audio blocked by headless; do not FAIL solely on headless mute.

### L — Persistence & stats

| ID | Test | Repro | Expected |
|---|---|---|---|
| SAVE-01 | Autosave | Play 65s or pause/title | Continue restores edits |
| SAVE-02 | Slot isolation | Slot 0 edit vs slot 1 new world | Worlds independent |
| SAVE-03 | Delete | Delete slot | World key cleared |
| SAVE-04 | Stats | Mine + walk | Slot row shows blocksMined / distance OR N/A |

Screenshots: `L-continue.png`, `L-slot-rows.png`

================================================================
GAMETEST.md format
================================================================

```md
# VoxelCraft gametest

Last gametest: <ISO>  SHA=<short>  target=pages|local  URL=<…>

## Summary
- PASS: n  FAIL: n  PARTIAL: n  SKIP: n  N/A: n
- Blockers: <ids or none>

## Matrix
(paste filled table sections A–L)

## Regressions vs last run
- Fixed since last: …
- New failures: …
- Still open: …
```

================================================================
BUGS.md (failures only — same schema as VL validator)
================================================================

Append to repo root `BUGS.md` ## Open for every FAIL and serious PARTIAL.

```md
### B-<n>: <short title>
- Status: open
- Severity: blocker | playability | visual | polish
- Found: <ISO time>
- Target: pages|local  SHA=<short>  URL=<…>
- Gametest: <ID> e.g. MOVE-02
- Repro: 1) … 2) … 3) …
- Evidence: demo/gametest/…/….png (+ what you see wrong)
- Suspected: <optional after E2E>
- Fix hint: <one sentence — do not implement>
```

Rules:
- Deduplicate against existing ## Open; reference Gametest ID.
- New World / primary buttons fail → **blocker** before broad source review.
- Header line: `Last gametest: …` optional in BUGS if useful.

================================================================
LOOP (unattended)
================================================================

1. Pin → prefer Pages URL.
2. Phase 0 gate → if FAIL, BUGS + still fill SKIP for blocked rows with reason.
3. Phase 1 matrix A→L → shots → **`read_image`** on FAIL/PARTIAL → BUGS.md.
4. Phase 2 save sweep.
5. Phase 3 mobs/night if stable.
6. Phase 4 summary in GAMETEST.md.
7. Re-fetch `origin/main` periodically; re-run full matrix on new SHA after
   automerge. Do not thrash mid-builder-push.

create_goal: "VoxelCraft full gametest — GAMETEST.md matrix + BUGS only"
max_goal_rounds: generous; never mark complete yourself.
