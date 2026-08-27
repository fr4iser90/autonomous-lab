<!-- Human-maintained lab host notes. Agents: do not rewrite. See lab/BOILERPLATE.md -->

# Lab setup (this machine)

How **this** Autonomous Lab is run: harness, prompts, models, hardware.
The public game on Pages is whatever last automerged to `main` — not this file.

Machine files live under **`lab/`**. Root = current experiment.

## Harness

- **Repo:** [fr4iser90/deepseek-harness](https://github.com/fr4iser90/deepseek-harness)
- Fork of DeepSeek’s agent harness; **idle / nudge prompting** so long sessions
  keep going when the model stalls; **Dockerized** for server deploy.
- Workspace = this `autonomous-lab` checkout (`agent/<run-id>` for builds).

## Prompts (what gets pasted where)

| Job | Prompt | Model role |
|---|---|---|
| **Greenfield (short)** | IDEA + [`template/TEMPLATE.md`](examples/template/TEMPLATE.md) law | **`fast`** |
| **Genre Initial** | `lab/examples/games/<game>.md` only | **`fast`** + `read_image` |
| **Forever resume / idle nudge** | `<game>-followup.md` **or** `lab/roles/followup.md` | **`fast`** |
| Roles (machine, not separate pastes) | `lab/roles/{concept,arch,feature,fix,validate,followup}.md` | pulled by Followup |
| Hard code root-cause only | optional **`smart`** subagent — **not** for PNGs | |

**Per game under examples:** exactly **two** files when possible (`<game>.md` +
`<game>-followup.md`). Play/Pages checks = **`lab/roles/validate.md`** inside
the Followup cadence — no `*-VL-validation.md` / `*-git-validation.md`.

Builder drains `BUGS.md` ## Open every cycle; validate role **documents** only.

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

Overnight / Followup sessions use **`agent-default-model` → fast** (with
`read_image` for VALIDATE / PRE-PR). Optional **smart** only for hard
root-cause subagents — not required for Pages play checks.
