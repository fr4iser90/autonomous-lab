<!-- BOILERPLATE_PLACEHOLDER: run-owned bug queue. Builder drains ## Open at every C-0 / P4-0; VL-validation agent appends only (no code). See example-prompts/games/voxel-craft.md + voxel-craft-VL-validation.md -->

# BUGS

Last validation: (ci-fail-bugs bot) SHA=daa966d

## Open

### B-2: CI gate fail @ daa966d
- Status: open
- Severity: blocker
- Found: 2026-08-27T21:13:39Z
- Target: git  branch=agent/dungeon-crawl-20260827  SHA=daa966d  full=daa966d591ba3f3ab06a15b0ae37932d1e0f95a8
- Repro: 1) open https://github.com/fr4iser90/autonomous-lab/actions/runs/33117099930 2) see job `gate` failed 3) FIX-ONLY until tip gate green on GitHub
- Evidence: https://github.com/fr4iser90/autonomous-lab/actions/runs/33117099930/job/98674463406
- Suspected: local pnpm/npm gate ≠ CI tip — read CI log before claiming ACCEPT
- Fix hint: FIX-ONLY; push; Automerge lands on main (incl. conflicts). Do not start next milestone while this is open.

### B-1: CI gate fail @ b39d82b
- Status: open
- Severity: blocker
- Found: 2026-08-27T21:02:54Z
- Target: git  branch=agent/dungeon-crawl-20260827  SHA=b39d82b  full=b39d82b8554d7fc61391452f1f422a116cfa1509
- Repro: 1) open https://github.com/fr4iser90/autonomous-lab/actions/runs/33116236102 2) see job `gate` failed 3) FIX-ONLY until tip gate green on GitHub
- Evidence: https://github.com/fr4iser90/autonomous-lab/actions/runs/33116236102/job/98671525049
- Suspected: local pnpm/npm gate ≠ CI tip — read CI log before claiming ACCEPT
- Fix hint: FIX-ONLY; push; Automerge lands on main (incl. conflicts). Do not start next milestone while this is open.

_(empty — validator / soak / UI smoke append here)_

## Fixed

_(move entries here after repro passes; keep short SHA + fix one-liner)_
