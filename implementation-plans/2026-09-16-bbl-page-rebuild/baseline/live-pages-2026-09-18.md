# Live pages, measured 2026-09-18

The "before" for #250's gate. Produced by `./check-procedure-pages.sh` against
production; run the same script after the deploy and the table must come back
all-green.

```
page                              html_kb ld+json h1_hidden  hidden dup_imgs  og:image
-------------------------------- -------- ------- --------- ------- -------- ---------
blepharoplasty-miami                  278      27       yes      23        1       200
brazilian-butt-lift-bbl-miami         480      28       yes      23       11       000
breast-augmentation-miami             394      28       yes      23        8       200
breast-lift-miami                     316      28       yes      23        1       200
breast-reduction-miami                320      28       yes      23        1       200
facelift-miami                        281      27       yes      23        1       200
liposuction-miami                     346      28       yes      23        1       200
mommy-makeover-miami                  311      26       yes      23        6       000
tummy-tuck-miami                      401      28       yes      23        7       200*
```

## What each column says

**html_kb** — every page is over the 200 KB target; the BBL page is 480 KB. The
gate is "well under 200 KB".

**ld+json** — 26 to 28 separate `<script type="application/ld+json">` blocks per
page. #250 item 9 folds them into one `@graph`.

**h1_hidden** — whether any `opacity:0` appears before the first `<h1`. An
element's ancestors all open before it, so a clean prefix means the H1 has no
hidden ancestor. Today every page fails: the hero card is wrapped in
framer-motion, so the H1 is invisible until hydration.

**hidden** — `opacity:0` occurrences anywhere on the page, 23 per page. Most sit
below the fold, in the intro, process, why-choose and CTA sections. #250 fixes
the hero; the rest is a follow-up, and this column is how it gets tracked.

**dup_imgs** — distinct image URLs rendered more than once. The three
`contentImages` grids repeat what the markdown already places, so the BBL page
ships 11 images twice. The pages showing `1` have only the hero repeated in the
related-procedure strip, which is acceptable; the gate is 0 duplicates from the
grids.

**og:image** — three of nine are broken, and they are exactly the pages whose
`procedure.image` is an absolute Vercel Blob URL. `${siteUrl}${procedure.image}`
then produces:

```
https://www.alluringplasticsurgery.comhttps//izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/brazilian-butt-lift/hero.webp
```

Broken: `brazilian-butt-lift-bbl-miami`, `mommy-makeover-miami`,
`tummy-tuck-miami`. The other six point at local `/images/procedures/*.jpg`
paths, where the concatenation happens to be harmless — so the fix is the
absolute-URL helper, not a data edit.

\* `tummy-tuck-miami` reported 200 on one run and 000 on another; its og:image
string is malformed the same way as the other two. Treat it as broken.

## Not measured here

`/procedures/rhinoplasty-miami` returns 404 and still collects Search Console
impressions (#250 item 10). It is not in the script's list because it is not a
page; the redirect is the fix.

Lighthouse mobile/desktop and CrUX field data are still to run for #249.
