<!--
  README has TWO parts:
  1) AUTONOMOUS LAB (below, until "Current run") — preserve on agent/*; human/baseline updates only.
  2) Current run — RUN_OWNED; overnight agent rewrites for the shipped game.
  See BOILERPLATE.md
-->

# Autonomous Lab

Public sandbox for **long unattended agent runs**. Most of what you see in `src/`
and on the live site is **AI-generated** — used to probe **local LLM** capability
(coding, vision, overnight persistence), not as a hand-authored product.

| | |
|---|---|
| **Live (last green automerge → Pages)** | https://fr4iser90.github.io/autonomous-lab/ |
| **Objectives / example prompts** | [`example-prompts/`](example-prompts/) |
| **Agent harness** | [fr4iser90/deepseek-harness](https://github.com/fr4iser90/deepseek-harness) (fork; idle nudge; Docker) |
| **This host’s setup** | [`SETUP.md`](SETUP.md) — Strix Halo 128 GB, fast/smart models, prompt routing |
| **Model × stack** | [`MODEL_STACKS.md`](MODEL_STACKS.md) |
| **Role prompts** | [`example-prompts/roles/`](example-prompts/roles/) |
| **Ownership / branches** | [`AGENTS.md`](AGENTS.md) · [`BOILERPLATE.md`](BOILERPLATE.md) |

Local preview: `pnpm install && pnpm run dev` → http://127.0.0.1:5173/autonomous-lab/

## Prompt routing (short)

| Session | Paste | Model |
|---|---|---|
| Role path (concept→arch→feature/fix) | `roles/*.md` + IDEA + `domains/*` | **fast** (+ `read_image` when UI) |
| Idle nudge / resume | **`roles/followup.md`** (generic) | **fast** |
| Overnight / follow-up (genre pack) | genre `games/*.md` (+ thin `*-followup` wrapper) | **fast** + `read_image` (~50–60 tok/s) |
| VL / playability validation | `*-VL-validation.md` (+ follow-up) | **smart** + `read_image` (~15–20 tok/s) |
| Git / CI validation | `*-git-validation.md` (+ follow-up) | **fast** — PR / `gate` / Actions queue |

Full hardware, GGUF ids, and `settings.yaml`: **[`SETUP.md`](SETUP.md)**.

## Live loop & gates

```
agent/* commit → Open agent PR → CI `gate` (typecheck + lint + boundaries + test + build)
  → Automerge (squash or conflict-resolve) → main → Pages → sync agent/* tip to main
```

Pages also chains on Automerge `workflow_run` (GITHUB_TOKEN merges do not re-fire `push`).

| Check / surface | Role |
|---|---|
| `gate` | Required: typecheck + eslint + dependency-cruiser + Vitest + production build |
| `protect-boilerplate` | Agent PRs must not edit workflows / `AGENTS.md` / `BOILERPLATE.md` / … |
| Automerge | Squash (or conflict-resolve) `agent/*` → `main` when tip gate is green; then reset that `agent/*` to `main` |
| Pages | Deploys **only** from `main` (what outsiders play) |
| PRE-PR / PHASE GATE | Prompt law: playable shot + vision when available before publish / phase change |

Broken `gate` → no merge → Pages stays on the last green `main`.

| Branch | Meaning |
|---|---|
| `baseline` | Frozen boilerplate reset |
| `agent/<run-id>` | One autonomy experiment |
| `main` | Live playable line + Pages |

## Quick start (human)

```sh
pnpm install   # or npm install
pnpm run gate
pnpm run dev
./scripts/new-run.sh <run-id>
```

Paste an objective from `example-prompts/` (or your own) into the harness with
this checkout as the workspace. Set overnight **CAP** in the prompt (often `CAP = 20`
for a short lab; raise for long runs).

Optional second agent: playability/VL **validation only** on **smart** →
`example-prompts/games/*-VL-validation.md` (writes `BUGS.md`; does not ship code).

## Example DSH settings

See **[`SETUP.md`](SETUP.md)** for the full yaml used on this Strix Halo box
(`fast` = Qwen3.6 VL, `smart` = Qwen3.8 VL). Minimal shape:

```yaml
# Example only — do not commit real tokens. Full copy in SETUP.md.
agent-default-model:
  provider: jarvis
  model: Qwen3.6-35B-A3B-MTP-UD-Q4_K_XL-VL   # name: fast
# Register a second model with name: smart (Qwen3.8 … VL) for validation sessions.
```

## One-time GitHub setup

1. Repo **Public**; Pages **Source = GitHub Actions**
2. Rulesets: `protect-main` (PR + required **`gate`**), `protect-baseline` (you only)
3. Actions → Workflow permissions: **Read and write** + allow Actions to create PRs
4. Bootstrap: workflows must exist on the default branch once; then agent automerge works

## Scripts

| Script | Meaning |
|---|---|
| `pnpm test` / `npm test` | Vitest |
| `pnpm run build` | typecheck + Vite build (`base=/autonomous-lab/`) |
| `pnpm run gate` | test + build |
| `pnpm run dev` | Vite on 5173 |

---

# Current run

<!-- RUN_OWNED: agent replaces this section for the shipped game. Keep the
     Autonomous Lab header above intact. -->

**Ashen Delve** — a Three.js procedural dungeon crawler. Descend the Ashen Delve:
BSP-generated catacombs with chase AI mobs, combat, loot, and a Boss.

- Live: https://fr4iser90.github.io/autonomous-lab/
- Run branch: `agent/dungeon-crawl-20260827` · tracking: `PROGRESS.md`
- Stack: Vite + TypeScript + Three.js 0.170 · BSP dungeon PCG · procedural audio
- Status: M1–M12 shipped, Phase 2 content expansion (CAP: 4/16 mobKits, 6/16 items, 2/16 floorThemes)
