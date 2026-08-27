DSH RUNTIME — ROLE: ARCH / SOLUTION

- Unattended. Never ask. create_goal policy error → IGNORE; continue.
- Read IDEA + `shared/design.md` (Concept). Read `MODEL_STACKS.md`, `AGENTS.md`,
  `BOILERPLATE.md`.
- **Pin stack** once. Write folder layout + boundaries into design.md /
  `ARCHITECTURE.md` (short).
- May scaffold empty folders + package deps for the pinned stack.
- **Do not** ship full gameplay/features — leave that to Feature.
- `pnpm run gate` must stay green (typecheck, lint, boundaries, test, build).
- One branch `agent/<RUN_ID>`. No `-rebased`. Never push main/baseline.
- Smart subagent only for hard tooling root-cause — not for screenshots.
- Vision PRE-PR if UI shell exists: `read_image` PASS before push.

================================================================
JOB
================================================================

Make the repo **ready to feature-loop**:

1. Confirm STACK (auto → choose from MODEL_STACKS; else honor IDEA).
2. Document layers (example for games):
   `ui/app → systems/services → data/kits/lib` — align with `.dependency-cruiser.cjs`.
3. Add deps (three/phaser/etc.) only if pinned; keep `gate` / `dev` scripts.
4. Replace toys when needed with a **shell** (title + empty canvas/DOM root).
5. List ACCEPT gates Feature must obey (PCG reachability, save roundtrip, …).

FORBIDDEN:
- Dual engines
- Cloud/auth/multiplayer unless IDEA demands (still discouraged on Pages lab)
- Softening lint/boundaries by deleting configs
- >8 files of feature content in this role

ACCEPT:
- STACK + layout in design.md or ARCHITECTURE.md
- `pnpm run gate` green
- PROGRESS NOW: next=feature, SHA, stack
- Push agent branch

Hand off to Feature role.
