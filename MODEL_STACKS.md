<!-- Human-maintained. Agents: read when STACK=auto or choosing engine; do not invent a parallel matrix. -->

# Model × stack catalog

Use this when a **Concept/Arch** role picks a stack, or a Feature run has `STACK=auto`.
Pin the choice in `PROGRESS.md` / `shared/design.md` on first adopt — **do not thrash**.

Local lab defaults (this host): see [`SETUP.md`](SETUP.md) (`fast` ≈ Qwen3.6 VL, `smart` ≈ Qwen3.8).

## How to read the table

| Rating | Meaning |
|--------|---------|
| **Strong** | Overnight agents usually ship playable slices |
| **OK** | Works with tight ACCEPT + vision gates |
| **Weak** | Avoid as default; needs human assets / smaller scope |
| **Skip** | Not for unattended runs here |

## Catalog (heuristic — update when models change)

| Stack / surface | Qwen3.6-class (`fast`) | Qwen3.8-class (`smart`) | Notes for Arch |
|-----------------|------------------------|-------------------------|----------------|
| Vite + TS + **DOM UI** | Strong | Strong | Incremental, tools, dashboards |
| Vite + TS + **Canvas 2D** | Strong | Strong | Top-down, pixel-ish, charts |
| Vite + TS + **Three.js** (primitives / kits / PCG) | Strong | Strong | Dungeon, sandbox toys; prefer kits not glTF zoos |
| Three.js + **many glTF / rigs** | Weak | OK | Cap ≤1–2 glTF; else procedural kits |
| **Phaser 3** | OK | OK | 2D games; pin version; don't dual-engine |
| **Pixel art atlases** (procedural) | Strong | Strong | Prefer codegen atlas over downloading packs |
| **Web Audio** SFX stubs | OK | OK | Beeps OK; don't block ACCEPT on music |
| **Node game server / WS multiplayer** | Weak | Weak | Out of scope unless objective says so |
| **React/Vue SPA product UI** | OK | Strong | Apps/tools; still need design spec first |
| **Native mobile / Electron** | Skip | Skip | Not Pages-compatible for this lab |
| **UE5 / Unity** | Skip | Skip | Wrong repo |
| Long-horizon **agentic refactors** | OK | Strong | Use `smart` for soft-lock / schema root-cause only |

## Stack pick algorithm (STACK=auto)

1. Read human **IDEA** + domain (`game` | `app` | `lib`).
2. Prefer **Pages-playable** browser stack (Vite).
3. Game 3D → Three.js kits/PCG unless IDEA demands Phaser 2D.
4. App/CRUD → DOM or light React **only if** Arch pins it; default DOM for overnight simplicity.
5. Write one paragraph in `shared/design.md`: stack + why + forbidden dual-engine.
6. Feature agent must not change family mid-run.

## Gates that always apply (repo)

Regardless of stack: `pnpm run gate` = **typecheck + lint + boundaries + test + build**.
See `package.json`, `eslint.config.js`, `.dependency-cruiser.cjs`.
