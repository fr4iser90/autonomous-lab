# Role prompts (machine — not examples)

Part of **`lab/`**. Human pastes **as few prompts as possible**:

| Human pastes | When |
|--------------|------|
| **Initial** once | Short IDEA, or filled `lab/examples/template/TEMPLATE.md`, or `lab/examples/games/<game>.md` |
| **Followup** forever | That game’s `*-followup.md` **or** this pack’s `followup.md` |

Roles below are **laws the agent reads and cycles** — not five separate overnight sessions.

```
lab/roles/concept.md   → if no design yet / big pivot
lab/roles/arch.md      → pin STACK + scaffold
lab/roles/feature.md   → build slices
lab/roles/fix.md       → BUGS blocker/playability
lab/roles/validate.md  → Pages/play → BUGS only (no code)
lab/roles/followup.md  → idle nudge: fix → validate cadence → feature
lab/roles/IDEA.slot.md → short IDEA for greenfield
```

## Per-game examples (target shape)

Under `lab/examples/games/` keep **exactly two** files when possible:

1. `<game>.md` — Initial overnight law  
2. `<game>-followup.md` — Resume (may point at `lab/roles/followup.md` + ACCEPT from Initial)

**No** separate `*-VL-validation.md` / `*-git-validation.md` — validation + gate
hygiene live in **roles** (`validate` + `fix` + Followup cadence).

## Rules

- **One writer** of `src/` at a time (`feature` or `fix`). Validate does not edit `src/`.
- Obey `lab/AGENTS.md` / `lab/BOILERPLATE.md`.
- Unattended: **never ask** the human; decide defaults (SP, stack from MODEL_STACKS) and log in PROGRESS / design.md.
- Prefer short specs. Concept REJECT if >~2 pages without a playable next step.
