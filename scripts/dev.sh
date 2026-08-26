#!/usr/bin/env bash
set -euo pipefail

# Port-aware dev launcher. In the main repo this is just `turbo dev` on the
# default ports; inside a worktree it picks up the ports assigned in
# .worktree-meta so several worktrees can run side by side.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
META="$ROOT/.worktree-meta"

if [[ -f "$META" ]]; then
  WEB_PORT="$(grep '^WEB_PORT=' "$META" | head -1 | cut -d= -f2- || true)"
  ADMIN_PORT="$(grep '^ADMIN_PORT=' "$META" | head -1 | cut -d= -f2- || true)"
  [[ -n "${WEB_PORT:-}" ]] && export WEB_PORT
  [[ -n "${ADMIN_PORT:-}" ]] && export ADMIN_PORT
  echo "worktree dev — web :${WEB_PORT:-3100}  admin :${ADMIN_PORT:-3105}"
fi

exec turbo dev "$@"
