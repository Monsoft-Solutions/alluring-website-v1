#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/worktree-list.sh [--prune]
#
# One line per worktree: branch, issue, ports, database, working-tree state and
# the state of its pull request. --prune also clears git's stale worktree refs.

source "$(dirname "${BASH_SOURCE[0]}")/worktree-lib.sh"

PRUNE="false"
[[ "${1:-}" == "--prune" ]] && PRUNE="true"

REPO_ROOT="$(git rev-parse --show-toplevel)"
REPO_NAME="$(basename "$REPO_ROOT")"
PARENT_DIR="$(dirname "$REPO_ROOT")"
WT_PREFIX="${REPO_NAME}-wt-"
REPO_SLUG="$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || echo "$REPO_SLUG_DEFAULT")"

printf '%-38s %-6s %-11s %-26s %-10s %s\n' BRANCH ISSUE PORTS DATABASE STATE PR
printf '%-38s %-6s %-11s %-26s %-10s %s\n' "$(printf '%.0s-' {1..38})" ------ ----------- "$(printf '%.0s-' {1..26})" ---------- --

found=0
for dir in "${PARENT_DIR}/${WT_PREFIX}"*/; do
  [[ -d "$dir" ]] || continue
  found=1
  meta="${dir}.worktree-meta"
  branch="$(meta_get "$meta" WORKTREE_BRANCH)"
  [[ -n "$branch" ]] || branch="$(git -C "$dir" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  issue="$(meta_get "$meta" WORKTREE_ISSUE)"
  web="$(meta_get "$meta" WEB_PORT)"; admin="$(meta_get "$meta" ADMIN_PORT)"
  db="$(meta_get "$meta" WORKTREE_DB_NAME)"
  owned="$(meta_get "$meta" WORKTREE_DB_OWNED)"
  [[ "$owned" == "true" ]] && db="${db}*"

  state="clean"
  [[ -n "$(git -C "$dir" status --porcelain 2>/dev/null)" ]] && state="dirty"
  ahead="$(git -C "$dir" rev-list --count "origin/master..HEAD" 2>/dev/null || echo 0)"
  [[ "$ahead" != "0" ]] && state="${state}+${ahead}"

  pr="$(gh pr view "$branch" --repo "$REPO_SLUG" --json number,state --jq '"#\(.number) \(.state)"' 2>/dev/null || echo '-')"

  printf '%-38s %-6s %-11s %-26s %-10s %s\n' \
    "$branch" "${issue:--}" "${web:+$web/$admin}" "${db:--}" "$state" "$pr"
done

[[ $found -eq 1 ]] || echo "(no worktrees)"

echo ""
echo "* = database owned by the worktree (dropped on removal).  state '+N' = N commits ahead of origin/master."

STALE="$(git worktree list --porcelain | grep -B2 '^prunable' | grep '^worktree ' | sed 's/^worktree //' || true)"
if [[ -n "$STALE" ]]; then
  echo ""
  echo "Stale git worktree refs (directory gone):"
  echo "$STALE" | sed 's/^/  /'
  if [[ "$PRUNE" == "true" ]]; then
    git worktree prune
    echo "  -> pruned"
  else
    echo "  Run with --prune to clear them."
  fi
fi
