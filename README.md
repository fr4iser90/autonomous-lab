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
| **Agent harness** | [fr4iser90/deepseek-harness](https://github.com/fr4iser90/deepseek-harness) (fork of DeepSeek harness; idle follow-up prompting; Dockerized for server deploy) |
| **Ownership / branches** | [`AGENTS.md`](AGENTS.md) · [`BOILERPLATE.md`](BOILERPLATE.md) |

Local preview: `pnpm install && pnpm run dev` → http://127.0.0.1:5173/autonomous-lab/

## Live loop & gates

```
agent/* commit → Open agent PR → CI `gate` (test + build) → Automerge (squash)
  → main → Pages
```

Pages also chains on Automerge `workflow_run` (GITHUB_TOKEN merges do not re-fire `push`).

| Check / surface | Role |
|---|---|
| `gate` | Required: Vitest + production build |
| `protect-boilerplate` | Agent PRs must not edit workflows / `AGENTS.md` / `BOILERPLATE.md` / … |
| Automerge | Squash `agent/*` → `main` when gate is green |
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

Optional second agent: playability/VL **validation only** →
`example-prompts/games/*-VL-validation.md` (writes `BUGS.md`; does not ship code).

## Example DSH settings (local models)

Copy/merge into `~/.dsh/settings.yaml`. Model **ids** must match your
Jarvis/`models.ini` section names. Replace URL and `KEY`. Roles that prompts
look up by **name**: `fast` (default) and `smart` (hard problems + vision).

```yaml
# Example only — do not commit real tokens.
llm-pi-ai:
  providers:
    jarvis:
      displayName: Jarvis llama.cpp
      api: openai-completions
      streamIdleTimeoutMs: 1000000
      baseURL: https://example.com/v1
      headers:
        Authorization: Bearer KEY
      compat:
        thinkingFormat: qwen
      models:
        - id: YOUR-FAST-GGUF-ID
          name: fast
          contextWindow: 87552
          maxTokens: 32768
          input: [ text, image ]
        - id: YOUR-SMART-GGUF-ID
          name: smart
          contextWindow: 65536
          maxTokens: 32768
          input: [ text, image ]

agent-default-model:
  provider: jarvis
  model: YOUR-FAST-GGUF-ID

permission:
  defaultPreset: danger-full-access
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

<!-- RUN_OWNED: agent updates this section for the shipped game. Keep the
     Autonomous Lab header above intact. -->

## VoxelCraft — Infinite Voxel Sandbox

**Genre:** Voxel sandbox (Minecraft-style) · Vite + TypeScript + Three.js

**Play:** https://fr4iser90.github.io/autonomous-lab/  
Local: `pnpm run dev` → http://127.0.0.1:5173/autonomous-lab/

### Features

- Infinite procedural terrain with biomes
- Break/place blocks with first-person controls
- 3-slot save system with local persistence
- Inventory + crafting (2×2 and 3×3 grids)
- Mobs (passive + hostile)
- Day/night cycle
- Procedural block atlas (no image downloads)

### Run scripts

| Script | Meaning |
|---|---|
| `pnpm test` | Vitest |
| `pnpm run build` | typecheck + Vite build (`base=/autonomous-lab/`) |
| `pnpm run gate` | test + build |
| `pnpm run dev` | Vite on 5173 |

### Autonomy arc

M1–M12 → Phase 2 content to CAP/CAP → Phase 2b soak → Phase 3 DEMO → Phase 4 infinite improve.  
Drain `BUGS.md` ## Open at every cycle start. Optional validator: `example-prompts/games/voxel-craft-VL-validation.md`.
