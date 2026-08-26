<!-- Human-maintained lab host notes. Agents: do not rewrite. See BOILERPLATE.md -->

# Lab setup (this machine)

How **this** Autonomous Lab is run: harness, prompts, models, hardware.
The public game on Pages is whatever last automerged to `main` — not this file.

## Harness

- **Repo:** [fr4iser90/deepseek-harness](https://github.com/fr4iser90/deepseek-harness)
- Fork of DeepSeek’s agent harness; **idle / nudge prompting** so long sessions
  keep going when the model stalls; **Dockerized** for server deploy.
- Workspace = this `autonomous-lab` checkout (`agent/<run-id>` for builds).

## Prompts (what gets pasted where)

| Job | Prompt | Model role |
|---|---|---|
| Overnight build | `example-prompts/games/<game>.md` | **`fast`** — self-vl on screenshots (no vision subagent) |
| Resume / stuck run | `example-prompts/games/<game>-followup.md` | **`fast`** — same |
| Idle **nudge** (harness) | short continue cue from DSH idle prompting | **`fast`** (same session) |
| Hard code root-cause only | (spawned from overnight) meshing/lighting/AI | optional **`smart`** subagent — **not** for PNGs |
| Playability / VL validation | `example-prompts/games/<game>-VL-validation.md` | **`smart`** session — **click Pages first**, then BUGS.md (no source-first) |
| Validation resume | `…-VL-validation-followup.md` | **`smart`** — same click-first order |

Builder drains `BUGS.md` ## Open at every cycle; validator **only documents** bugs.

Set overnight **CAP** in the game prompt before a long run (`CAP = 20` short lab;
raise for multi-day).

## Hardware

| | |
|---|---|
| Platform | **AMD Strix Halo** (AI PC) |
| Memory | **128 GB unified RAM** |
| Serving | Jarvis / llama.cpp OpenAI-compatible API (see settings below) |

Rough decode (local, this box — ballpark, not a bench claim):

| Role | Model (GGUF id / family) | ~tok/s |
|---|---|---|
| **fast** | Qwen3.6 35B-A3B MTP Q4_K_XL VL | **~50–60** |
| **smart** | Qwen3.8 27B MTP Q4_K_XL VL | **~15–20** |

Both registered with `input: [text, image]` so PRE-PR / validation can read PNGs.

## `~/.dsh/settings.yaml` (shape used here)

Model **ids** must match Jarvis/`models.ini` section names. Replace `baseURL` /
`KEY` for your deploy — do not commit secrets.

```yaml
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
        - id: Qwen3.6-35B-A3B-MTP-UD-Q4_K_XL-VL
          name: fast
          contextWindow: 87552
          maxTokens: 32768
          input: [ text, image ]
        - id: Qwen3.8-27B-UD-Q4_K_XL-MTP-VL
          name: smart
          contextWindow: 65536
          maxTokens: 32768
          input: [ text, image ]

agent-default-model:
  provider: jarvis
  model: Qwen3.6-35B-A3B-MTP-UD-Q4_K_XL-VL

ui-onboarding:
  welcomeNoticeVersion: 2026-08-13.1

permission:
  defaultPreset: danger-full-access

agent-presets:
  default: standard
```

Overnight sessions use **`agent-default-model` → fast**. Start validation sessions
with the **smart** model selected (or an equivalent preset) so the whole
VL-validation job stays on smart without spawning helpers.
