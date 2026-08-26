#!/usr/bin/env bash
# Shared helpers for the worktree scripts. Sourced, never executed directly.

REPO_SLUG_DEFAULT="Monsoft-Solutions/alluring-website-v1"
TEMPLATE_DB_DEFAULT="alluring-autopilot-dev"
WEB_PORT_BASE=3110   # main repo keeps 3100/3105; worktrees start above it
ENV_FILES=(
  "apps/web/.env.local"
  "apps/web/.env.production"
  "apps/admin/.env"
  "apps/admin/.env.local"
  "packages/db/.env.local"
  ".mcp.json"
  ".claude/settings.local.json"
)

# Databases that must never be dropped, whatever the flags say.
is_reserved_db() {
  case "$1" in
    "${TEMPLATE_DB:-$TEMPLATE_DB_DEFAULT}"|alluring-autopilot-dev|allruing-website-v1|allruing-website-v2|alluring_dashboard|postgres|template0|template1) return 0 ;;
    *) return 1 ;;
  esac
}

# Read a KEY=VALUE out of a .worktree-meta / .env style file.
meta_get() {
  local file="$1" key="$2"
  [[ -f "$file" ]] || return 0
  grep "^${key}=" "$file" 2>/dev/null | head -1 | cut -d= -f2- || true
}

# Is the TCP port free on localhost?
port_free() {
  ! lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

# sed -i that works on both BSD (macOS) and GNU.
sed_inplace() {
  if [[ "$(uname)" == "Darwin" ]]; then sed -i '' "$@"; else sed -i "$@"; fi
}

# Copy-on-write copy where the filesystem supports it (APFS / btrfs / xfs),
# falling back to a normal recursive copy elsewhere.
cow_copy() {
  local src="$1" dest="$2"
  if [[ "$(uname)" == "Darwin" ]]; then
    cp -c -R "$src" "$dest" 2>/dev/null || cp -R "$src" "$dest"
  else
    cp --reflink=auto -R "$src" "$dest"
  fi
}

# Rewrite the database name inside every uncommented localhost POSTGRES_URL
# line of a file. Remote (Supabase) URLs and commented lines are left alone.
rewrite_local_db_name() {
  local file="$1" db_name="$2"
  [[ -f "$file" ]] || return 0
  local tmp
  tmp="$(mktemp)"
  DB_NAME="$db_name" awk '
    /^[[:space:]]*#/ { print; next }
    /^POSTGRES_URL=/ {
      line = $0
      if (line ~ /localhost/ || line ~ /127\.0\.0\.1/) {
        # split off an optional ?query suffix, swap the last path segment
        query = ""
        body = substr(line, index(line, "=") + 1)
        q = index(body, "?")
        if (q > 0) { query = substr(body, q); body = substr(body, 1, q - 1) }
        sub(/\/[^\/]*$/, "/" ENVIRON["DB_NAME"], body)
        print "POSTGRES_URL=" body query
        next
      }
    }
    { print }
  ' "$file" > "$tmp" && mv "$tmp" "$file"
}

# Point every uncommented POSTGRES_URL line at one explicit URL, whatever it held
# before. Used by --db clone: a half-isolated worktree (migrations on the clone,
# the app still reading a remote database) is worse than no isolation at all.
force_db_url() {
  local file="$1" url="$2"
  [[ -f "$file" ]] || return 0
  local tmp
  tmp="$(mktemp)"
  DB_URL="$url" awk '
    /^[[:space:]]*#/ { print; next }
    /^POSTGRES_URL=/ { print "POSTGRES_URL=" ENVIRON["DB_URL"]; next }
    { print }
  ' "$file" > "$tmp" && mv "$tmp" "$file"
}
