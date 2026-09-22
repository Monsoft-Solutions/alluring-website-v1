# Starting points (snapshot, 2026-09-22)

A dated snapshot to help pick the next page and plan its assets. **Re-run
the sources before relying on any number**: Search Console with the
`search-console` skill, assets with
`pnpm --filter web audit:procedure-assets --slug <slug> --prod`.

## Search (90 days to 2026-09-19, www property)

| Page                            | Impressions | Clicks | Avg position | Status                         |
| ------------------------------- | ----------: | -----: | -----------: | ------------------------------ |
| `facelift-miami`                |       7,936 |      1 |         63.8 | Template                       |
| `brazilian-butt-lift-bbl-miami` |       5,954 |     16 |         27.1 | **Rebuilt** (#256, #265, #266) |
| `blepharoplasty-miami`          |       4,407 |      0 |         56.4 | Template                       |
| `liposuction-miami`             |       3,989 |      0 |         62.5 | Template                       |
| `mommy-makeover-miami`          |       3,870 |      3 |         60.4 | Template                       |
| `tummy-tuck-miami`              |       3,787 |      2 |         58.3 | Template                       |
| `breast-augmentation-miami`     |       2,293 |      5 |         55.5 | Template                       |
| `breast-lift-miami`             |       1,630 |      1 |         62.4 | Template                       |
| `breast-reduction-miami`        |       1,440 |      1 |         59.2 | Template                       |

Every template page sits on pages 5–7 of Google. The section fell together
the week of 9 Feb 2026 (see the memory
`procedure-pages-fell-section-wide-feb-2026`). The 16 Sep plan named tummy
tuck the next candidate ("tummy tuck cost miami" ≈ 8,300 impressions in 180
days at position ≈ 10, largely on blog URLs) and noted "mommy makeover
miami" ≈ 4,200 at position ≈ 39. Facelift has the most page impressions but
skews older than the core audience. Check the queries before choosing.

The template pages are also the **control group** for the BBL rebuild's
day-28/56/90 read (#260). Rebuilding one removes it from the control.

## Gallery and reviews (production)

"Group" is the gallery group the page reads (the first visible one).
"Not named" counts items whose title and alt don't name the procedure, which
a BBL-style results rail would drop. "AI: other" counts items the gallery's
AI analysis detected as another procedure. Every published gallery item
across the site is missing its width and height.

| Page                | Group: images / videos | Not named | AI: other                            | Duplicates | Detected here, filed elsewhere | Unpublished IG: images (results-like) / videos | B/A pairs | Reviews naming it |
| ------------------- | ---------------------- | --------: | ------------------------------------ | ---------: | -----------------------------: | ---------------------------------------------- | --------: | ----------------: |
| BBL                 | 11 / 1                 |         2 | 1 breast augmentation                |          1 |                              0 | 21 (17) / 61                                   |         1 |                 3 |
| Breast augmentation | 21 / 1                 |        10 | —                                    |          0 |                              1 | 21 (14) / 57                                   |         1 |                 4 |
| Breast lift         | 10 / 0                 |         1 | 2 mommy makeover                     |          0 |                              0 | 9 (5) / 15                                     |         0 |                 4 |
| Breast reduction    | 12 / 0                 |         2 | 7 mommy makeover                     |          0 |                              2 | 3 (1) / 23                                     |         0 |                 3 |
| Tummy tuck          | 7 / 0                  |         0 | 2 mommy makeover                     |          0 |                              0 | 25 (13) / 48                                   |         0 |                 4 |
| Liposuction         | 13 / 2                 |         3 | 3 mommy makeover, 2 breast reduction |          1 |                              1 | 42 (27) / 113                                  |         0 |                 5 |
| Mommy makeover      | 10 / 0                 |         0 | —                                    |          0 |                         **12** | 9 (6) / 15                                     |         0 |                 1 |
| Facelift            | 3 / 0                  |         0 | —                                    |          0 |                              3 | 11 (7) / 15                                    |         0 |                 0 |
| Blepharoplasty      | 3 / 0                  |         1 | **3 facelift**                       |          0 |                              0 | 6 (3) / 4                                      |         0 |                 0 |

What stands out:

- **Blepharoplasty's group holds three facelift photos** (the AI analysis
  detects all three as facelift), so the live page shows facelift results as
  eyelid results. Facelift has only three photos of its own. Fix in the admin
  before either page is rebuilt.
- **Mommy makeover** has twelve of its own photos filed under breast lift,
  breast reduction, liposuction and tummy tuck. Many are genuinely combined
  procedures, so they can belong in both groups: decide per photo.
- **Before/after pairs** exist only for BBL and breast augmentation. The
  slider needs pairs, which the admin builds from published before and after
  photos of the same patient.
- **Unpublished Instagram imports** are the main source of more results. Many
  are promotions quoting prices the practice no longer charges; the audit
  flags every caption with a price. Publish only real results with consent.
- **Reviews**: 70 published reviews with text (4★+), 34 of all 82 synced
  are Google translations. Facelift and blepharoplasty have none naming the
  procedure, so their pages must use the neutral heading, and the practice
  should ask recent patients for reviews.
- **The Google review sync last ran 2026-08-04**. New reviews aren't reaching
  the site. Check the sync (admin → Reviews) before counting on new ones.
- `surgeons-data.ts` still lists Dr. Rita Shats (OB/GYN) with "board
  certified" titles, and Dr. Karlinsky with "Board Certified Cosmetic
  Surgeon". The owner said Dr. Karlinsky is the only surgeon; #248 covers the
  wording. Don't let a new page read either title.
