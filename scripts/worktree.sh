#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/worktree.sh <branch-name> [issue-number] [options]
#
# Creates an isolated git worktree as a sibling directory of the repo, with its
# own dev ports, env files, node_modules and (optionally) its own database.
#
# Options:
#   --base <branch>   Remote branch to branch from (default: master)
#   --editor <name>   cursor | code | zed. Falls back to $VISUAL / $EDITOR / auto-detect
#   --db <mode>       reuse (default) | reuse:<name> | clone — see scripts/worktree-db.sh
#   --no-install      Skip the node_modules clone + pnpm install
#   --no-open         Don't open an editor
#
# Everything it writes is gitignored, so the worktree starts clean.

source "$(dirname "${BASH_SOURCE[0]}")/worktree-lib.sh"

BRANCH=""
ISSUE=""
BASE_BRANCH="master"
EDITOR_CHOICE=""
DB_MODE="reuse"
DO_INSTALL="true"
DO_OPEN="true"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base)    BASE_BRANCH="${2:-}"; [[ -n "$BASE_BRANCH" ]] || { echo "Error: --base requires a branch"; exit 1; }; shift 2 ;;
    --editor)  EDITOR_CHOICE="${2:-}"; [[ -n "$EDITOR_CHOICE" ]] || { echo "Error: --editor requires a name"; exit 1; }; shift 2 ;;
    --db)      DB_MODE="${2:-}"; [[ -n "$DB_MODE" ]] || { echo "Error: --db requires a mode"; exit 1; }; shift 2 ;;
    --no-install) DO_INSTALL="false"; shift ;;
    --no-open)    DO_OPEN="false"; shift ;;
    -*)        echo "Error: unknown flag '$1'"; exit 1 ;;
    *)
      if   [[ -z "$BRANCH" ]]; then BRANCH="$1"
      elif [[ -z "$ISSUE"  ]]; then ISSUE="$1"
      fi
      shift ;;
  esac
done

if [[ -z "$BRANCH" ]]; then
  echo "Usage: ./scripts/worktree.sh <branch-name> [issue-number] [--base <branch>] [--editor <name>] [--db <mode>] [--no-install] [--no-open]"
  exit 1
fi
if [[ "$BRANCH" =~ ^[0-9]+$ ]]; then
  echo "Error: '$BRANCH' looks like an issue number. Pass a branch name first, e.g."
  echo "  ./scripts/worktree.sh feat/hero-lcp-single-video 200"
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
REPO_NAME="$(basename "$REPO_ROOT")"
PARENT_DIR="$(dirname "$REPO_ROOT")"
SAFE_BRANCH="$(echo "$BRANCH" | tr '/' '-')"
WT_PREFIX="${REPO_NAME}-wt-"
WORKTREE_DIR="${PARENT_DIR}/${WT_PREFIX}${SAFE_BRANCH}"
REPO_SLUG="$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || echo "$REPO_SLUG_DEFAULT")"

[[ -w "$PARENT_DIR" ]]      || { echo "Error: cannot write to $PARENT_DIR"; exit 1; }
[[ ! -d "$WORKTREE_DIR" ]]  || { echo "Error: worktree already exists at $WORKTREE_DIR"; exit 1; }

TOTAL=9
step() { echo ""; echo "=> [$1/$TOTAL] $2"; }

# --- 1. Allocate a free port pair (web, admin) ---
step 1 "Allocating dev ports"
USED=$'3100\n3105\n'
for meta in "${PARENT_DIR}/${WT_PREFIX}"*/.worktree-meta; do
  [[ -f "$meta" ]] || continue
  for k in WEB_PORT ADMIN_PORT; do
    p="$(meta_get "$meta" "$k")"
    [[ -n "$p" ]] && USED="${USED}${p}"$'\n'
  done
done
WEB_PORT=$WEB_PORT_BASE
while echo "$USED" | grep -qx "$WEB_PORT" || echo "$USED" | grep -qx "$((WEB_PORT + 1))" \
      || ! port_free "$WEB_PORT" || ! port_free "$((WEB_PORT + 1))"; do
  WEB_PORT=$((WEB_PORT + 2))
  [[ $WEB_PORT -lt 3200 ]] || { echo "Error: no free port pair below 3200"; exit 1; }
done
ADMIN_PORT=$((WEB_PORT + 1))
echo "   web: $WEB_PORT   admin: $ADMIN_PORT"

# --- 2. Create the worktree ---
step 2 "Creating worktree"
git fetch origin "$BASE_BRANCH" -q
if git show-ref --verify --quiet "refs/heads/$BRANCH" || git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  echo "   Branch '$BRANCH' exists — checking it out"
  git worktree add "$WORKTREE_DIR" "$BRANCH"
else
  echo "   New branch '$BRANCH' from origin/$BASE_BRANCH"
  git worktree add "$WORKTREE_DIR" -b "$BRANCH" "origin/$BASE_BRANCH"
fi
echo "   $WORKTREE_DIR"

# --- 3. Copy gitignored env + tooling config ---
step 3 "Copying env and local config"
for f in "${ENV_FILES[@]}"; do
  if [[ -f "$REPO_ROOT/$f" ]]; then
    mkdir -p "$WORKTREE_DIR/$(dirname "$f")"
    cp "$REPO_ROOT/$f" "$WORKTREE_DIR/$f"
    echo "   + $f"
  else
    echo "   - $f (not in main repo, skipped)"
  fi
done

# --- 4. node_modules (copy-on-write clone, then reconcile) ---
step 4 "Installing dependencies"
if [[ "$DO_INSTALL" == "true" ]]; then
  if [[ -d "$REPO_ROOT/node_modules" ]]; then
    echo "   Cloning node_modules (copy-on-write)..."
    cow_copy "$REPO_ROOT/node_modules" "$WORKTREE_DIR/node_modules"
    for d in apps packages; do
      for pkg in "$REPO_ROOT/$d"/*/; do
        [[ -d "${pkg}node_modules" ]] || continue
        # The main checkout may hold packages that don't exist on this branch yet.
        [[ -d "$WORKTREE_DIR/$d/$(basename "$pkg")" ]] || continue
        target="$WORKTREE_DIR/$d/$(basename "$pkg")/node_modules"
        [[ -e "$target" ]] || cow_copy "${pkg}node_modules" "$target"
      done
    done
  fi
  echo "   Reconciling with pnpm..."
  if (cd "$WORKTREE_DIR" && env -u ANTHROPIC_API_KEY pnpm install --prefer-offline --silent); then
    echo "   Dependencies ready"
  else
    echo "   Warning: pnpm install failed — run it manually inside the worktree"
  fi
  # apps/admin imports @workspace/* from dist/, which is gitignored. Without this the
  # admin dev server cannot resolve a single workspace import. Turbo's cache came
  # along with node_modules, so this is seconds, not minutes.
  echo "   Building workspace packages..."
  if (cd "$WORKTREE_DIR" && env -u ANTHROPIC_API_KEY pnpm turbo build --filter='./packages/*' >/dev/null 2>&1); then
    echo "   Workspace packages built"
  else
    echo "   Warning: package build failed — run 'pnpm turbo build --filter=./packages/*' inside the worktree"
  fi
else
  echo "   Skipped (--no-install)"
fi

# --- 5. Provision the database ---
step 5 "Provisioning database (--db $DB_MODE)"
(cd "$WORKTREE_DIR" && bash "$REPO_ROOT/scripts/worktree-db.sh" --db "$DB_MODE")

# --- 6. Write .worktree-meta ---
step 6 "Writing .worktree-meta"
{
  echo "WORKTREE_BRANCH=$BRANCH"
  echo "WORKTREE_ISSUE=${ISSUE:-}"
  echo "WORKTREE_BASE=$BASE_BRANCH"
  echo "WEB_PORT=$WEB_PORT"
  echo "ADMIN_PORT=$ADMIN_PORT"
  echo "WORKTREE_CREATED=$(date +%Y-%m-%d)"
} >> "$WORKTREE_DIR/.worktree-meta"
echo "   Ports and branch recorded (pnpm dev reads this file)"

# --- 7. Link Claude Code memory + write .issue.md ---
step 7 "Linking Claude Code memory"
WORKTREE_ABS="$(cd "$WORKTREE_DIR" && pwd)"
MAIN_ABS="$(cd "$REPO_ROOT" && pwd)"
slugify_path() { echo "$1" | sed 's|[/._]|-|g; s|^-||'; }
MAIN_MEMORY="$HOME/.claude/projects/-$(slugify_path "$MAIN_ABS")/memory"
WT_MEMORY_DIR="$HOME/.claude/projects/-$(slugify_path "$WORKTREE_ABS")"
if [[ -d "$MAIN_MEMORY" ]]; then
  mkdir -p "$WT_MEMORY_DIR"
  ln -sfn "$MAIN_MEMORY" "$WT_MEMORY_DIR/memory"
  echo "   $WT_MEMORY_DIR/memory -> main repo memory"
else
  echo "   Skipped (no memory dir in the main repo yet)"
fi

if [[ -n "$ISSUE" ]]; then
  TITLE="$(gh issue view "$ISSUE" --repo "$REPO_SLUG" --json title --jq .title 2>/dev/null || true)"
  {
    echo "$ISSUE"
    echo "https://github.com/$REPO_SLUG/issues/$ISSUE"
    [[ -n "$TITLE" ]] && echo "$TITLE"
  } > "$WORKTREE_DIR/.issue.md"
  echo "   .issue.md -> #$ISSUE ${TITLE:+($TITLE)}"
fi

# --- 8. Assign the issue ---
step 8 "Updating GitHub"
if [[ -n "$ISSUE" ]]; then
  if gh issue edit "$ISSUE" --repo "$REPO_SLUG" --add-assignee @me >/dev/null 2>&1; then
    echo "   Assigned #$ISSUE to $(gh api user --jq .login 2>/dev/null || echo you)"
  else
    echo "   Warning: could not assign #$ISSUE (continuing)"
  fi
else
  echo "   Skipped (no issue number)"
fi

# --- 9. Open the editor + summary ---
step 9 "Done"
open_in_editor() {
  local name="$1" label="$2" app="$3"
  if command -v "$name" &>/dev/null; then
    "$name" "$WORKTREE_DIR" &>/dev/null &
    echo "   Opened in $label"; return 0
  fi
  if [[ "$(uname)" == "Darwin" && -n "$app" && -d "/Applications/${app}.app" ]]; then
    open -a "$app" "$WORKTREE_DIR"; echo "   Opened in $label"; return 0
  fi
  return 1
}
open_by_name() {
  case "$1" in
    cursor) open_in_editor cursor Cursor Cursor ;;
    code)   open_in_editor code "VS Code" "Visual Studio Code" ;;
    zed)    open_in_editor zed Zed Zed ;;
    *)      open_in_editor "$1" "$1" "" ;;
  esac
}
if [[ "$DO_OPEN" == "true" ]]; then
  opened=0
  if   [[ -n "$EDITOR_CHOICE" ]]; then open_by_name "$EDITOR_CHOICE" && opened=1 || echo "   Error: editor '$EDITOR_CHOICE' not found"
  elif [[ -n "${VISUAL:-}" ]];    then open_by_name "$VISUAL" && opened=1
  elif [[ -n "${EDITOR:-}" ]];    then open_by_name "$EDITOR" && opened=1
  fi
  if [[ $opened -eq 0 && -z "$EDITOR_CHOICE" ]]; then
    open_in_editor cursor Cursor Cursor \
      || open_in_editor code "VS Code" "Visual Studio Code" \
      || open_in_editor zed Zed Zed \
      || echo "   Open manually: cd $WORKTREE_DIR"
  fi
fi

DB_NAME="$(meta_get "$WORKTREE_DIR/.worktree-meta" WORKTREE_DB_NAME)"
DB_OWNED="$(meta_get "$WORKTREE_DIR/.worktree-meta" WORKTREE_DB_OWNED)"
cat <<SUMMARY

========================================
Worktree ready: $WORKTREE_DIR
Branch:    $BRANCH  (from origin/$BASE_BRANCH)
Ports:     web http://localhost:$WEB_PORT   admin http://localhost:$ADMIN_PORT
Database:  $DB_NAME  (owned: $DB_OWNED)

  cd $WORKTREE_DIR && pnpm dev

Remove when done (from the main repo):
  pnpm worktree:remove $BRANCH
========================================
SUMMARY

if [[ -n "$ISSUE" ]]; then
  echo ""
  echo "Issue #$ISSUE linked via .issue.md — open the worktree and run /tackle"
fi
