# Initial prompt template (one file → one experiment)

**Goal:** Human pastes **one Initial**, then forever **one Followup**.  
Roles (`lab/roles/*`) are pulled by the agent — not pasted as five sessions.

Copy to `lab/examples/games/<slug>.md` (optional archive) **or** paste directly
into the harness with IDEA filled. Replace `{{…}}`.

Companion resume / idle nudge: always **`lab/roles/followup.md`**.  
Optional archive: thin `lab/examples/games/<slug>-followup.md` that only names
the Initial for ACCEPT (not a second nudge body).

---

## IDEA (required)

```
{{IDEA}}          # e.g. "Tetris — clear lines, increasing speed, local high score"
{{GAME_SLUG}}     # e.g. tetris-20260828
{{CAP}}           # content/depth cap or "infinite Phase 4"
```

Optional overrides (else agent **decides** and logs in PROGRESS / design.md):

```
{{MODE}}          # default: singleplayer  (multiplayer OUT unless stated)
{{STACK}}         # default: auto → lab/MODEL_STACKS.md
{{PERSIST}}       # default: local full-save
```

---

## DSH RUNTIME (paste into overnight body)

```
DSH RUNTIME
- Unattended. Never ask. Never wait. Never stop to summarize for a human.
- create_goal once if useful; policy error → IGNORE; continue with tools.
  Never mark create_goal complete. Human kills the process.
- Pull machine laws from lab/roles/: concept → arch (once) → then followup
  cycle (fix → validate every 3 → demo every 5 → feature). See lab/roles/README.md.
- Read lab/AGENTS.md + lab/BOILERPLATE.md (branch/gate/ownership only).
  Never edit lab/**, .github/workflows, LICENSE, eslint/depcruise configs.
- Branch: agent/{{GAME_SLUG}} from baseline (new) or continue existing tip.
  One run = one branch. No *-rebased.
- Stack: {{STACK}} (auto → pin from lab/MODEL_STACKS.md; Tetris-like → DOM/Canvas2D).
- Mode: {{MODE}}. Persist: {{PERSIST}}.
- Gate: pnpm run gate. Preview :5173. Vite base /autonomous-lab/.
- Vision: every PRE-PR / VALIDATE / DEMO frame → read_image PASS/FAIL.
- Live: push agent/* → CI → automerge → Pages https://fr4iser90.github.io/autonomous-lab/
- Tracking: PROGRESS.md NOW primary (+ CONTENT/FEATURES/SOAK/BUGS/DEMO as needed).
- If the genre needs first-run teaching: ship **one Tutorial mode for basics
  only** (core loop) early — not a tutorial per feature. Prefer it as the
  Validate/Demo/PLAY CHECK path. Per-content proof stays CONTENT VISUAL + demo.md.
- Always leave a next tool call.
```

---

## BOOT SEQUENCE (agent)

1. Clone/checkout lab; cut or resume `agent/{{GAME_SLUG}}`.
2. If no `shared/design.md` → **concept** then **arch** (write design + pin STACK).
3. Implement playable vertical slice → PRE-PR `read_image` → gate → push.
4. Hand off to **Followup** loop — paste / nudge **`lab/roles/followup.md`**.

ACCEPT (Initial done enough to Followup): design pinned, something playable on
Pages or proven local PRE-PR, PROGRESS NOW has next slice.

---

## Defaults (do not ask)

| Ambiguity | Default |
|-----------|---------|
| MP vs SP | singleplayer |
| Engine | simplest for IDEA (see MODEL_STACKS) |
| Netcode / auth / cloud | OUT |
| Art | primitives / CSS; ≤2 glTF if 3D |
