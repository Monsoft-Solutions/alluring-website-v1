#!/usr/bin/env bash
#
# The #250 gate, measured against served HTML. Run it before the template
# repair for the baseline and after the deploy for the gate.
#
#   ./check-procedure-pages.sh                        # production
#   ./check-procedure-pages.sh http://localhost:3112  # a local build
#
# Reports per page: HTML weight, JSON-LD block count, whether the H1 ships under
# an opacity:0 style, the og:image URL and its HTTP status, and how many <img>
# elements repeat a URL already on the page.
set -uo pipefail

HOST="${1:-https://www.alluringplasticsurgery.com}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

SLUGS=(
  blepharoplasty-miami
  brazilian-butt-lift-bbl-miami
  breast-augmentation-miami
  breast-lift-miami
  breast-reduction-miami
  facelift-miami
  liposuction-miami
  mommy-makeover-miami
  tummy-tuck-miami
)

printf '%-32s %8s %7s %9s %7s %8s %9s\n' page html_kb ld+json h1_hidden hidden dup_imgs og:image
printf '%-32s %8s %7s %9s %7s %8s %9s\n' '--------------------------------' -------- ------- --------- ------- -------- ---------

fail=0
for slug in "${SLUGS[@]}"; do
  html="$TMP/$slug.html"
  curl -sS -o "$html" "$HOST/procedures/$slug" || { echo "$slug: fetch failed"; fail=1; continue; }

  kb=$(( $(wc -c < "$html") / 1024 ))
  ld=$(grep -o 'application/ld+json' "$html" | wc -l | tr -d ' ')

  # Does the H1 ship invisible? An element's ancestors all open before it, so
  # if no opacity:0 appears anywhere before the first <h1, the H1 has no hidden
  # ancestor. (A hidden earlier *sibling* also trips this — deliberately
  # conservative.) `hidden` counts what is left elsewhere on the page.
  if head -c "$(grep -bo '<h1' "$html" | head -1 | cut -d: -f1)" "$html" \
     | grep -q 'opacity:0'; then h1_hidden=yes; else h1_hidden=no; fi
  hidden=$(grep -o 'opacity:0' "$html" | wc -l | tr -d ' ')

  # Every <img src> on the page; a URL appearing twice is an image rendered
  # twice (the contentImages grids repeat the markdown's inline images).
  dup=$(grep -o '<img[^>]*src="[^"]*"' "$html" \
        | sed 's/.*src="//;s/"$//' \
        | sed 's/.*\/_next\/image?url=//;s/&.*//' \
        | sort | uniq -d | wc -l | tr -d ' ')

  og=$(grep -o 'property="og:image" content="[^"]*"' "$html" \
       | head -1 | sed 's/.*content="//;s/"$//')
  if [[ -n "$og" ]]; then
    status=$(curl -s -o /dev/null -w '%{http_code}' "$og" 2>/dev/null)
    status="${status:-000}"
  else
    status=none
  fi

  printf '%-32s %8s %7s %9s %7s %8s %9s\n' "$slug" "$kb" "$ld" "$h1_hidden" "$hidden" "$dup" "$status"

  [[ "$status" == "200" ]] || { fail=1; echo "    og:image -> $og"; }
  [[ "$h1_hidden" == "no" ]] || fail=1
  [[ "$kb" -lt 200 ]] || fail=1
  [[ "$dup" -eq 0 ]] || fail=1
done

echo
if [[ "$fail" -eq 0 ]]; then
  echo "PASS — every page: og:image 200, no opacity:0, under 200 KB, no duplicate images."
else
  echo "FAIL — see the rows above. This is the expected state before #250."
fi
exit "$fail"
