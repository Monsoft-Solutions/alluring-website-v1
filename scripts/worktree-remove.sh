#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/worktree-remove.sh <branch-name> [--keep-db] [--drop-db] [--confirm-unmerged]
#
# Removes a worktree, its Claude Code memory link, its stale git refs and — only
# when the worktree OWNS it — its database.
#
# Safety:
#   - Refuses to delete a worktree with unmerged commits or uncommitted changes
#     unless a human types 'confirm'. Non-interactive runs abort instead.
#   - Only drops a database created by --db clone. The shared dev database is
#     hard-guarded regardless of flags.
#
# Flags:
#   --keep-db           Never drop the database
#   --drop-db           Drop it even when ownership is unknown (pre-meta worktrees)
#   --confirm-unmerged  Skip the interactive gate (scripted use — careful)

source "$(dirname "${BASH_SOURCE[0]}")/worktree-lib.sh"

BRANCH=""
KEEP_DB="false"
FORCE_DROP_DB="false"
CONFIRM_UNMERGED="false"
BASE_BRANCH="master"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --keep-db)          KEEP_DB="true"; shift ;;
    --drop-db)          FORCE_DROP_DB="true"; shift ;;
    --confirm-unmerged) CONFIRM_UNMERGED="true"; shift ;;
    --base)             BASE_BRANCH="${2:-master}"; shift 2 ;;
    -*)                 echo "Error: unknown flag '$1'"; exit 1 ;;
    *)                  [[ -z "$BRANCH" ]] && BRANCH="$1"; shift ;;
  esac
done

[[ -n "$BRANCH" ]] || { echo "Usage: ./scripts/worktree-remove.sh <branch-name> [--keep-db] [--drop-db] [--confirm-unmerged]"; exit 1; }

REPO_ROOT="$(git rev-parse --show-toplevel)"
REPO_NAME="$(basename "$REPO_ROOT")"
PARENT_DIR="$(dirname "$REPO_ROOT")"
SAFE_BRANCH="$(echo "$BRANCH" | tr '/' '-')"
WORKTREE_DIR="${PARENT_DIR}/${REPO_NAME}-wt-${SAFE_BRANCH}"

[[ -d "$WORKTREE_DIR" ]] || { echo "Error: no worktree at $WORKTREE_DIR"; exit 1; }

WORKTREE_ABS="$(cd "$WORKTREE_DIR" && pwd)"
WORKTREE_SLUG="$(echo "$WORKTREE_ABS" | sed 's|[/._]|-|g; s|^-||')"

META="$WORKTREE_DIR/.worktree-meta"
DB_NAME="$(meta_get "$META" WORKTREE_DB_NAME)"
DB_OWNED="$(meta_get "$META" WORKTREE_DB_OWNED)"
TEMPLATE_DB="$(meta_get "$META" WORKTREE_TEMPLATE_DB)"
TEMPLATE_DB="${TEMPLATE_DB:-$TEMPLATE_DB_DEFAULT}"
[[ -n "$DB_OWNED" ]] || DB_OWNED="unknown"

# Admin connection, derived from the worktree's own local URL.
ADMIN_URL=""
if [[ -f "$WORKTREE_DIR/packages/db/.env.local" ]]; then
  LOCAL_URL="$(grep -E '^POSTGRES_URL=' "$WORKTREE_DIR/packages/db/.env.local" | head -1 | cut -d= -f2- | tr -d '"'"'" )"
  LOCAL_URL="${LOCAL_URL%%\?*}"
  [[ "$LOCAL_URL" == *localhost* || "$LOCAL_URL" == *127.0.0.1* ]] && ADMIN_URL="${LOCAL_URL%/*}/postgres"
fi

# --- Merge-safety gate ---
echo "Checking merge status against origin/$BASE_BRANCH..."
git -C "$WORKTREE_DIR" fetch origin "$BASE_BRANCH" -q || echo "   Warning: fetch failed, using cached ref"

SAFE="true"; REASON=""
if ! git -C "$WORKTREE_DIR" diff --quiet "origin/$BASE_BRANCH" 2>/dev/null; then
  SAFE="false"; REASON="branch has changes not in origin/$BASE_BRANCH"
fi
if [[ -n "$(git -C "$WORKTREE_DIR" status --porcelain 2>/dev/null)" ]]; then
  SAFE="false"; REASON="${REASON:+$REASON; }uncommitted or untracked changes present"
fi

if [[ "$SAFE" == "true" ]]; then
  echo "   Safe: fully contained in origin/$BASE_BRANCH and clean."
else
  echo ""
  echo "⚠️  Not safe to delete: $REASON."
  AHEAD="$(git -C "$WORKTREE_DIR" log --oneline "origin/$BASE_BRANCH..HEAD" 2>/dev/null || true)"
  [[ -n "$AHEAD" ]] && { echo ""; echo "   Commits not in origin/$BASE_BRANCH:"; echo "$AHEAD" | sed 's/^/     /'; }
  DIRTY="$(git -C "$WORKTREE_DIR" status --porcelain 2>/dev/null || true)"
  [[ -n "$DIRTY" ]] && { echo ""; echo "   Uncommitted / untracked:"; echo "$DIRTY" | sed 's/^/     /'; }
  echo ""
  if [[ "$CONFIRM_UNMERGED" == "true" ]]; then
    echo "   Proceeding anyway (--confirm-unmerged)."
  elif [[ -t 0 ]]; then
    read -r -p "   Type 'confirm' to delete this un-merged worktree (anything else aborts): " ANSWER || ANSWER=""
    [[ "$ANSWER" == "confirm" ]] || { echo "   Aborted — worktree kept."; exit 1; }
  else
    echo "   Refusing to delete un-merged work non-interactively."
    echo "   Re-run in a terminal and type 'confirm', or pass --confirm-unmerged."
    exit 1
  fi
fi

echo ""
echo "Removing worktree at $WORKTREE_DIR..."
git worktree remove --force "$WORKTREE_DIR" || git worktree remove --force --force "$WORKTREE_DIR"

echo "Cleaning up Claude Code memory link..."
rm -rf "$HOME/.claude/projects/-${WORKTREE_SLUG}"

echo "Pruning stale worktree refs..."
git worktree prune

drop_db() {
  local name="$1"
  [[ -n "$name" ]] || { echo "No database recorded — nothing to drop."; return 0; }
  if is_reserved_db "$name"; then
    echo "Refusing to drop reserved/shared database '$name'."; return 0
  fi
  if [[ -z "$ADMIN_URL" ]]; then
    echo "No local admin connection resolved — leaving '$name' in place."; return 0
  fi
  if ! psql "$ADMIN_URL" -tAc "SELECT 1 FROM pg_database WHERE datname = '$name'" 2>/dev/null | grep -q 1; then
    echo "Database '$name' does not exist — nothing to drop."; return 0
  fi
  psql "$ADMIN_URL" -q -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$name' AND pid <> pg_backend_pid();" \
    >/dev/null 2>&1 || true
  psql "$ADMIN_URL" -q -c "DROP DATABASE IF EXISTS \"$name\""
  echo "Dropped database '$name'."
}

if   [[ "$KEEP_DB" == "true" ]];      then echo "Kept database '${DB_NAME:-none}' (--keep-db)."
elif [[ "$DB_OWNED" == "true" ]];     then drop_db "$DB_NAME"
elif [[ "$DB_OWNED" == "false" ]];    then echo "Kept shared database '${DB_NAME:-unknown}' (reused, not owned)."
elif [[ "$FORCE_DROP_DB" == "true" ]];then echo "Ownership unknown; dropping anyway (--drop-db)."; drop_db "$DB_NAME"
else echo "Kept database '${DB_NAME:-unknown}' (ownership unknown — pass --drop-db to remove it)."
fi

echo ""
echo "Done. Worktree '$BRANCH' removed."
echo "Delete the branch too, if it is merged:  git branch -d $BRANCH"
