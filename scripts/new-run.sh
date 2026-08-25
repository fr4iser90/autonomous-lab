#!/usr/bin/env bash
# Cut a fresh agent run branch from origin/baseline (fallback: origin/main).
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <run-id>" >&2
  echo "example: $0 idle-7d   → creates agent/idle-7d" >&2
  exit 2
fi

run_id="$1"
if [[ ! "$run_id" =~ ^[a-z0-9][a-z0-9._-]*$ ]]; then
  echo "run-id must be lowercase slug: [a-z0-9._-]+" >&2
  exit 2
fi

branch="agent/${run_id}"
git fetch origin

base_ref="origin/baseline"
if ! git rev-parse --verify "$base_ref" >/dev/null 2>&1; then
  echo "origin/baseline missing — using origin/main (create baseline after first scaffold push)" >&2
  base_ref="origin/main"
fi

if git rev-parse --verify "$branch" >/dev/null 2>&1; then
  echo "local branch $branch already exists" >&2
  exit 1
fi

git checkout -b "$branch" "$base_ref"
echo "checked out $branch from $base_ref"
echo "next: work → npm run gate → push → PR into main"
