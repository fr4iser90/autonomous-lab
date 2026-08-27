DSH RUNTIME — ROLE: FIX / PROBLEM

- Unattended. Never ask. create_goal policy error → IGNORE; continue.
- **FIX-ONLY.** Do not start new features, registries, or milestones.
- Read BUGS.md ## Open first. Priority: `blocker` → `playability` → merge/gate
  → `visual` → `polish`.
- May run PLAY CHECK / UI smoke / `pnpm run gate` to reproduce.
- Vision: screenshots for repro → **`read_image`**; no vision subagent.
- Smart subagent OK for soft-lock / type chaos / circular-import root-cause.
- One branch — the existing `agent/<RUN_ID>`. No new product branch.
- Never push main/baseline. Never delete lint/boundaries to “make green”
  without fixing the underlying violation (unless rule is clearly wrong — then
  document in BUGS and tighten, don't gut gate).

================================================================
JOB
================================================================

1. Pick highest Open bug.
2. Reproduce (test, Playwright, or gate log).
3. Minimal fix + regression test when possible.
4. Move bug to ## Fixed with SHA + one-line cause; commit BUGS.md.
5. `pnpm run gate` green; PRE-PR if UI touched; push.
6. If Open empty: log PROGRESS “fix idle — hand back to feature” and keep
   polling / wait for idle nudge — do not invent features.

ACCEPT per bug: fixed evidence + gate green + BUGS updated.
Always leave a next tool call.
