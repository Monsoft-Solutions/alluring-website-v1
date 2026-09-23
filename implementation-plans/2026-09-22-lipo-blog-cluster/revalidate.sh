#!/usr/bin/env bash
# Revalidate production cache tags without printing the secret, 10 tags per call.
# Usage (from the repo root):
#   bash implementation-plans/2026-09-22-lipo-blog-cluster/revalidate.sh blog-posts sitemap-urls blog-post-a ...
set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo "Pass one or more cache tags" >&2
  exit 1
fi

# apps/admin/.env has held duplicate keys before; the last line wins.
SECRET="$(grep -E '^REVALIDATION_SECRET=' apps/admin/.env | tail -1 | cut -d= -f2- | tr -d '"')"
if [[ -z "$SECRET" ]]; then
  echo "REVALIDATION_SECRET not found in apps/admin/.env" >&2
  exit 1
fi

TAGS=("$@")
for ((i = 0; i < ${#TAGS[@]}; i += 10)); do
  BATCH=("${TAGS[@]:i:10}")
  BODY="$(python3 -c 'import json,sys; print(json.dumps({"secret": sys.argv[1], "tags": sys.argv[2:]}))' "$SECRET" "${BATCH[@]}")"
  echo "tags $((i + 1))-$((i + ${#BATCH[@]})) of ${#TAGS[@]}"
  curl -sS -X POST https://www.alluringplasticsurgery.com/api/revalidate \
    -H 'Content-Type: application/json' \
    --data "$BODY" \
    -w '\nHTTP %{http_code}\n'
done
