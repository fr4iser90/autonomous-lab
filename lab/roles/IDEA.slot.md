================================================================
IDEA SLOT (fill before pasting a role)
================================================================

Copy this block under the role prompt (or harness injects it).

```
IDEA:
  TITLE:     {{short name}}
  DOMAIN:    game | app | lib
  ONE_LINER: {{what the user does in one sentence}}
  MUST_HAVE: {{3 bullets max}}
  MUST_NOT:  {{2–5 bullets — scope cuts}}
  STACK:     auto | dom | canvas2d | three | phaser | other:{{x}}
  RUN_ID:    agent/{{slug}}-{{YYYYMMDD}}
  BRANCH_FROM: baseline   # or main to continue a shipped line
  NOTES:     {{optional references / mood}}
```

If STACK=auto, Arch (or Feature if Arch skipped) reads `lab/MODEL_STACKS.md` and pins
the stack in `shared/design.md` + PROGRESS NOW.
