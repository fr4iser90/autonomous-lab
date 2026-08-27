<!-- BOILERPLATE_PLACEHOLDER: run-owned bug queue. Builder drains ## Open every cycle; lab/roles/validate.md (via Followup) appends play/Pages findings only — no separate VL prompt files. -->

# BUGS

Last validation: (ci-fail-bugs bot) SHA=c9ba04a

## Open

### B-1: CI gate fail @ c9ba04a
- Status: open
- Severity: blocker
- Found: 2026-08-27T23:06:13Z
- Target: git  branch=agent/dungeon-crawl-20260827  SHA=c9ba04a  full=c9ba04afd36e850a07aaa1a50a84cd178b466c3e
- Repro: 1) open https://github.com/fr4iser90/autonomous-lab/actions/runs/33125035646 2) see job `protect-boilerplate` failed 3) FIX-ONLY until tip gate green on GitHub
- Evidence: https://github.com/fr4iser90/autonomous-lab/actions/runs/33125035646/job/98700992563
- Suspected: local pnpm/npm gate ≠ CI tip — read CI log before claiming ACCEPT
- Fix hint: FIX-ONLY; push; Automerge lands on main (incl. conflicts). Do not start next milestone while this is open.

_(empty — validator / soak / UI smoke append here)_

## Fixed

- B-5: False COMPLETE claim in PROGRESS.md (Phase 2 claimed done with mobKits 4/16, items 6/16, floorThemes 2/16) — fixed by P2-1 content expansion (8 mobs, 10 items, 4 themes)
- B-4: CI gate fail @ 229745e — resolved by PR #34 merge (human resolved conflicts)
- B-3: CI gate fail @ 13f961f — superseded by successful merge into main
- B-2: CI gate fail @ daa966d — local gate green, CI re-runs on tip
- B-1: CI gate fail @ b39d82b — fixed by M1–M9 gate green, superseded
