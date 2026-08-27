# Role prompts (compose a run)

Human / harness pastes **one role** + **IDEA slot** + optional **domain appendix**.

```
[ROLE FILE]          e.g. roles/feature.md
+ [IDEA]             roles/IDEA.slot.md filled in
+ [DOMAIN]           domains/game.md OR domains/app.md (optional)
+ [STACK]            auto | three | dom | phaser | …  (see MODEL_STACKS.md)
```

## Roles

| File | When | Writes code? |
|------|------|----------------|
| `concept.md` | Start of run / big pivot | No (spec only) |
| `arch.md` | After concept, before features | Scaffold OK; no feature creep |
| `feature.md` | Main overnight loop | Yes (one slice) |
| `fix.md` | BUGS / red gate / soft-lock | Yes (FIX-ONLY) |
| `followup.md` | **Harness idle nudge / resume** (default) | Via fix→feature cycle |

## Rules

- **One writer** of `src/` at a time (`feature` or `fix`). Concept/Arch do not race Feature.
- Still obey repo `AGENTS.md` / `BOILERPLATE.md` (branch, gate, Pages).
- Genre-specific long milestones can stay under `example-prompts/games/*` — roles are the **generic** path.
- Prefer short specs. Concept REJECT if >~2 pages without a playable next step.
- **Nudge default:** paste `roles/followup.md` only. Genre `*-followup.md` files
  should be thin wrappers that point here + name the pack to re-read for ACCEPT.
