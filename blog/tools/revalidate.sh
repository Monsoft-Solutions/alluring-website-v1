#!/usr/bin/env bash
# Revalidate production cache tags, 10 per call, without printing the secret.
# Copied from implementation-plans/2026-09-22-lipo-blog-cluster/revalidate.sh.
#
#   bash blog/tools/revalidate.sh [--dry-run] blog-posts sitemap-urls blog-post-<slug> ...
#   bash blog/tools/revalidate.sh --help
#
# --dry-run prints the batches and sends nothing. Any other flag is an error.
#
# Tags (apps/web/app/api/revalidate/route.ts): blog-posts (listings and the
# prerender list), sitemap-urls, blog-post-<slug> (one post's page). After a
# rewrite or a new post: blog-posts sitemap-urls blog-post-<slug>. After a fold:
# every post 01-fold-links.sql edited, then the folded slugs after the delete.
# /sitemap/blog.xml is route ISR (3 h) and no tag reaches it: it catches up alone.
# The secret is the LAST REVALIDATION_SECRET line of apps/admin/.env.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DRY=0
ARGS=()
for a in "$@"; do
  case "$a" in
    --help | -h)
      # This file's header comment, without the shebang.
      sed -n '2,/^[^#]/p' "${BASH_SOURCE[0]}" | sed '$d' | sed -E 's/^# ?//'
      exit 0
      ;;
    --dry-run) DRY=1 ;;
    -*)
      echo "Unknown flag: $a (flags: --dry-run --help)" >&2
      exit 1
      ;;
    *) ARGS+=("$a") ;;
  esac
done
set -- ${ARGS[@]+"${ARGS[@]}"}
if [[ $# -eq 0 ]]; then
  echo "Pass one or more cache tags" >&2
  exit 1
fi
for t in "$@"; do
  if [[ ! "$t" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
    echo "Not a cache tag: $t" >&2
    exit 1
  fi
done

# apps/admin/.env has held duplicate keys before; the last line wins.
SECRET="$(grep -E '^REVALIDATION_SECRET=' "$ROOT/apps/admin/.env" | tail -1 | cut -d= -f2- | tr -d '"')"
if [[ -z "$SECRET" ]]; then
  echo "REVALIDATION_SECRET not found in apps/admin/.env" >&2
  exit 1
fi

TAGS=("$@")
for ((i = 0; i < ${#TAGS[@]}; i += 10)); do
  BATCH=("${TAGS[@]:i:10}")
  echo "tags $((i + 1))-$((i + ${#BATCH[@]})) of ${#TAGS[@]}: ${BATCH[*]}"
  if [[ $DRY -eq 1 ]]; then
    echo "(dry run: not sent)"
    continue
  fi
  BODY="$(python3 -c 'import json,sys; print(json.dumps({"secret": sys.argv[1], "tags": sys.argv[2:]}))' "$SECRET" "${BATCH[@]}")"
  curl -sS -X POST https://www.alluringplasticsurgery.com/api/revalidate \
    -H 'Content-Type: application/json' \
    --data "$BODY" \
    -w '\nHTTP %{http_code}\n'
done
