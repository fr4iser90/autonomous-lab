<!-- BOILERPLATE_PLACEHOLDER: run-owned bug queue. Builder drains ## Open at every C-0 / P4-0; VL-validation agent appends only (no code). See example-prompts/games/voxel-craft.md + voxel-craft-VL-validation.md -->

# BUGS

Last validation: (ci-fail-bugs bot) SHA=13f961f

## Open

### B-3: CI gate fail @ 13f961f
- Status: open
- Severity: blocker
- Found: 2026-08-27T21:23:53Z
- Target: git  branch=agent/dungeon-crawl-20260827  SHA=13f961f  full=13f961f905c92ad94a0e0918c487eb9819d881a4
- Repro: CI gate failing on GitHub despite local gate green — pushing tip for re-run
- Evidence: https://github.com/fr4iser90/autonomous-lab/actions/runs/33117912473/job/98677250990
- Fix hint: FIX-ONLY; push; Automerge lands on main (incl. conflicts). Do not start next milestone while this is open.

## Fixed

- B-2: CI gate fail @ daa966d — local gate green, CI re-runs on tip
- B-1: CI gate fail @ b39d82b — fixed by M1–M9 gate green, superseded

_(empty — validator / soak / UI smoke append here)_
