<!-- BOILERPLATE_PLACEHOLDER: run-owned bug queue. Builder drains ## Open
at every C-0 / P4-0; VL-validation agent appends only (no code). See
example-prompts/games/voxel-craft.md + voxel-craft-VL-validation.md -->

# BUGS

Last validation: (ci-fail-bugs bot) SHA=12684d9

## Open

### B-2: CI gate fail @ 12684d9
- Status: open
- Severity: blocker
- Found: 2026-08-27T14:37:04Z
- Target: git  branch=agent/celestial-inc-20260826  SHA=12684d9  full=12684d9b8dc0b985db33bc1bd7084ff5a9b29d13
- Repro: 1) open https://github.com/fr4iser90/autonomous-lab/actions/runs/33083131230 2) see job `gate` failed 3) FIX-ONLY until tip gate green on GitHub
- Evidence: https://github.com/fr4iser90/autonomous-lab/actions/runs/33083131230/job/98555476123
- Suspected: local pnpm/npm gate ≠ CI tip — read CI log before claiming ACCEPT
- Fix hint: FIX-ONLY; push; Automerge lands on main (incl. conflicts). Do not start next milestone while this is open.

### B-1: CI gate fail @ 3a07770
- Status: open
- Severity: blocker
- Found: 2026-08-27T14:30:13Z
- Target: git  branch=agent/celestial-inc-20260826  SHA=3a07770  full=3a0777013cd8eec67faca510955829327cdb29a4
- Repro: 1) open https://github.com/fr4iser90/autonomous-lab/actions/runs/33081520233 2) see job `gate` failed 3) FIX-ONLY until tip gate green on GitHub
- Evidence: https://github.com/fr4iser90/autonomous-lab/actions/runs/33081520233/job/98553209196
- Suspected: local pnpm/npm gate ≠ CI tip — read CI log before claiming ACCEPT
- Fix hint: FIX-ONLY; push; Automerge lands on main (incl. conflicts). Do not start next milestone while this is open.

## Fixed

_(move entries here after repro passes; keep short SHA + fix one-liner)_
