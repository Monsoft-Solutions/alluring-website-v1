#!/usr/bin/env bash
set -euo pipefail

# Usage (from INSIDE a worktree): ./scripts/worktree-db.sh [--db reuse|reuse:<name>|clone]
#
# Points this worktree at its own local Postgres database and records ownership
# in .worktree-meta so removal knows whether it may drop it.
#
#   reuse[:<name>]  (default) Share an existing local database — the dev database
#                   by default. NOT owned: worktree-remove never drops it.
#   clone           Copy the local dev database into alluring_wt_<branch>, run
#                   pending migrations against it, and mark it owned. Use this for
#                   anything that touches migrations, seeds, or destructive queries.
#
# Never touches production. The URL it writes is always localhost.

source "$(dirname "${BASH_SOURCE[0]}")/worktree-lib.sh"

DB_MODE="reuse"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --db)
      DB_MODE="${2:-}"
      [[ -n "$DB_MODE" ]] || { echo "Error: --db requires a mode"; exit 1; }
      case "${DB_MODE%%:*}" in
        clone|reuse) ;;
        *) echo "Error: --db must be 'clone' or 'reuse[:<name>]'"; exit 1 ;;
      esac
      shift 2 ;;
    *) echo "Error: unknown argument '$1'"; exit 1 ;;
  esac
done

# Target the worktree we are RUN FROM, not the checkout this script lives in —
# a fresh worktree branched off an older base may not carry these scripts yet.
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
[[ -n "$ROOT" ]] || ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SOURCE_ENV="$ROOT/packages/db/.env.local"
if [[ ! -f "$SOURCE_ENV" ]]; then
  echo "   Error: $SOURCE_ENV not found — cannot resolve the local database."
  exit 1
fi

SOURCE_URL="$(grep -E '^POSTGRES_URL=' "$SOURCE_ENV" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
if [[ -z "$SOURCE_URL" ]]; then
  echo "   Error: no POSTGRES_URL in $SOURCE_ENV"
  exit 1
fi
if [[ "$SOURCE_URL" != *localhost* && "$SOURCE_URL" != *127.0.0.1* ]]; then
  echo "   Error: POSTGRES_URL is not a localhost database — refusing to provision."
  exit 1
fi

url_with_db() { echo "${1%/*}/$2"; }

# The template is whatever this worktree was FIRST cloned from. Re-reading it from
# the (already rewritten) env file on a second run would make the clone its own
# template — and then removal would treat the clone as a reserved database.
TEMPLATE_DB="${WORKTREE_TEMPLATE_DB:-$(meta_get "$ROOT/.worktree-meta" WORKTREE_TEMPLATE_DB)}"
[[ -n "$TEMPLATE_DB" ]] || TEMPLATE_DB="$(basename "${SOURCE_URL%%\?*}")"
ADMIN_URL="$(url_with_db "${SOURCE_URL%%\?*}" postgres)"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
DB_SLUG="$(echo "$BRANCH" | tr 'A-Z' 'a-z' | tr -c 'a-z0-9' '_' | sed 's/__*/_/g; s/^_//; s/_$//')"

case "${DB_MODE%%:*}" in
  reuse)
    DB_NAME="${DB_MODE#reuse}"
    DB_NAME="${DB_NAME#:}"
    [[ -n "$DB_NAME" ]] || DB_NAME="$TEMPLATE_DB"
    DB_OWNED="false"
    echo "   Reusing existing database '$DB_NAME' (shared — never dropped on removal)"
    ;;
  clone)
    DB_NAME="alluring_wt_${DB_SLUG}"
    DB_OWNED="true"
    if psql "$ADMIN_URL" -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -q 1; then
      echo "   Database '$DB_NAME' already exists — reusing it"
    else
      echo "   Cloning '$TEMPLATE_DB' -> '$DB_NAME'..."
      if psql "$ADMIN_URL" -q -c "CREATE DATABASE \"$DB_NAME\" TEMPLATE \"$TEMPLATE_DB\"" 2>/dev/null; then
        echo "   Created via TEMPLATE (instant file-level copy)"
      else
        echo "   TEMPLATE copy unavailable (template in use) — falling back to pg_dump | psql"
        psql "$ADMIN_URL" -q -c "CREATE DATABASE \"$DB_NAME\"" 
        pg_dump "$(url_with_db "${SOURCE_URL%%\?*}" "$TEMPLATE_DB")" \
          | psql -q "$(url_with_db "${SOURCE_URL%%\?*}" "$DB_NAME")" >/dev/null
        echo "   Copied via pg_dump"
      fi
    fi
    ;;
esac

# --- Point every local env file at the chosen database ---
TARGET_URL="$(url_with_db "${SOURCE_URL%%\?*}" "$DB_NAME")"
for f in apps/web/.env.local apps/admin/.env apps/admin/.env.local packages/db/.env.local; do
  [[ -f "$ROOT/$f" ]] || continue
  if [[ "$DB_OWNED" == "true" ]]; then
    # An owned clone isolates the whole worktree: even env files that pointed at a
    # remote database now read the clone, so migrations and the running apps agree.
    before="$(grep -E '^POSTGRES_URL=' "$ROOT/$f" | head -1 | cut -d= -f2- || true)"
    force_db_url "$ROOT/$f" "$TARGET_URL"
    if [[ -n "$before" && "$before" != *localhost* && "$before" != *127.0.0.1* ]]; then
      echo "   ! $f pointed at a REMOTE database — repointed to the local clone"
    fi
  else
    rewrite_local_db_name "$ROOT/$f" "$DB_NAME"
  fi
done
echo "   POSTGRES_URL -> $DB_NAME in apps/web, apps/admin, packages/db"

# --- Record ownership for worktree-remove ---
META="$ROOT/.worktree-meta"
touch "$META"
for kv in "WORKTREE_DB_NAME=$DB_NAME" "WORKTREE_DB_OWNED=$DB_OWNED" "WORKTREE_TEMPLATE_DB=$TEMPLATE_DB"; do
  key="${kv%%=*}"
  if grep -q "^${key}=" "$META"; then
    sed_inplace "s|^${key}=.*|${kv}|" "$META"
  else
    echo "$kv" >> "$META"
  fi
done

# --- Apply pending migrations to a freshly cloned DB ---
if [[ "$DB_OWNED" == "true" ]]; then
  echo "   Applying pending migrations..."
  if env -u ANTHROPIC_API_KEY pnpm db:migrate >/dev/null 2>&1; then
    echo "   Migrations applied"
  else
    echo "   Warning: 'pnpm db:migrate' failed — run it manually inside the worktree"
  fi
fi

echo "   Database ready: $DB_NAME (owned: $DB_OWNED)"
