#!/usr/bin/env bash
# Trigger a cron job against the local dev server (default) or a deployed URL.
#
# Usage:
#   ./scripts/trigger-cron.sh heartbeat
#   ./scripts/trigger-cron.sh autopilot-ideation
#   BASE_URL=https://admin.example.com ./scripts/trigger-cron.sh autopilot-content
#
# Reads CRON_SECRET from the environment, falling back to apps/admin/.env.local
# then apps/admin/.env.
set -euo pipefail

JOB="${1:?Usage: trigger-cron.sh <job> (heartbeat | autopilot-ideation | autopilot-content)}"
BASE_URL="${BASE_URL:-http://localhost:3105}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -z "${CRON_SECRET:-}" ]; then
    for envfile in "$SCRIPT_DIR/../.env.local" "$SCRIPT_DIR/../.env"; do
        if [ -f "$envfile" ]; then
            CRON_SECRET="$(grep -E '^CRON_SECRET=' "$envfile" | head -1 | cut -d= -f2- || true)"
            [ -n "$CRON_SECRET" ] && break
        fi
    done
fi

if [ -z "${CRON_SECRET:-}" ]; then
    echo "CRON_SECRET not set (env, .env.local, or .env)" >&2
    exit 1
fi

echo "→ GET $BASE_URL/api/cron/$JOB"
curl -sS -w '\nHTTP %{http_code} in %{time_total}s\n' \
    -H "Authorization: Bearer $CRON_SECRET" \
    "$BASE_URL/api/cron/$JOB"
