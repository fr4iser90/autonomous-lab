# Role prompts (machine — not examples)

Part of **`lab/`** (boilerplate). Human / harness may paste **one** role + IDEA,
or paste a genre Initial once then a **single Followup** forever (Followup cycles
fix→feature internally).

```
[ROLE FILE]          e.g. lab/roles/feature.md
+ [IDEA]             lab/roles/IDEA.slot.md filled in
+ [DOMAIN]           lab/examples/domains/game.md OR app.md (optional)
+ [STACK]            auto | three | dom | phaser | …  (see lab/MODEL_STACKS.md)
```

## Roles

| File | When | Writes code? |
|------|------|----------------|
| `concept.md` | Start of run / big pivot | No (spec only) |
| `arch.md` | After concept, before features | Scaffold OK; no feature creep |
| `feature.md` | Main overnight loop | Yes (one slice) |
| `fix.md` | BUGS / red gate / soft-lock | Yes (FIX-ONLY) |
| `followup.md` | Generic resume / idle nudge | Via fix→feature cycle |

## Rules

- **One writer** of `src/` at a time (`feature` or `fix`). Concept/Arch do not race Feature.
- Obey `lab/AGENTS.md` / `lab/BOILERPLATE.md` (branch, gate, Pages).
- Genre packs live under `lab/examples/games/*` (templates). Prefer **one Initial +
  one fat Followup** for a long experiment — do not require pasting every role file.
- Prefer short specs. Concept REJECT if >~2 pages without a playable next step.
