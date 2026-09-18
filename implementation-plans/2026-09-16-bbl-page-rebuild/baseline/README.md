# Baseline — epic #246, issue #249

The numbers every later read is measured against, taken **before** anything
ships (#250 included) and with a control: the eight procedure pages that get the
template repair but not the BBL module.

Pulled 2026-09-18, Search Console window ending **2026-09-13** (the last day
with complete data). The 11 Sep title change and redirects (#229) and the 15 Sep
price change are still settling; a later snapshot mixes their effect in.

## Files

| File                                 | What it is                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `pull-bbl.mts`                       | The tool. Re-run with a different `--end` for the day-28/56/90 cuts.                               |
| `baseline-2026-09-13.json`           | Weekly series, page totals, cluster cut.                                                           |
| `baseline-2026-09-13-query-page.csv` | Every query × page row for `/procedures/*`, 90 and 180 days.                                       |
| `lead-definition.md`                 | What counts as a BBL lead, and the count today. #260 reuses it.                                    |
| `ai-citation-panel-2026-09-18.md` | 4 engines x 8 prompts. Cited on the brand query, nothing else. |
| `live-pages-2026-09-18.md`           | HTML weight, og:image, JSON-LD and hidden-H1 measurements per page — the "before" for #250's gate. |

## Re-running

```bash
pnpm build   # packages/seo is read from dist/; a stale dist serves old code
node node_modules/.pnpm/tsx@*/node_modules/tsx/dist/cli.mjs \
  implementation-plans/2026-09-16-bbl-page-rebuild/baseline/pull-bbl.mts \
  --end 2026-10-11 \
  --out implementation-plans/2026-09-16-bbl-page-rebuild/baseline/day28-2026-10-11.json
```

Credentials come from `apps/admin/.env` (`GOOGLE_CLIENT_EMAIL`,
`GOOGLE_PRIVATE_KEY`, `GOOGLE_SEARCH_CONSOLE_SITE_URL`). The property is
`sc-domain:alluringplasticsurgery.com`, but every page URL must be the **www**
host — `https://alluringplasticsurgery.com/...` returns no rows.

## The section-wide drop

Impression-weighted weekly average position. The week of 9 Feb 2026 is ten days
after the template change (`148f51cf`, `0c51e723`) shipped to all nine pages.

| Page                              | wk 2 Feb | wk 9 Feb | wk 7 Sep | 90d impressions | clicks | 90d position |
| --------------------------------- | -------: | -------: | -------: | --------------: | -----: | -----------: |
| **brazilian-butt-lift-bbl-miami** | **15.9** | **43.0** | **26.3** |           5,955 |     11 |     **27.0** |
| blepharoplasty-miami              |     46.6 |     67.9 |     51.4 |           4,334 |      0 |         57.3 |
| breast-augmentation-miami         |     56.4 |     56.9 |     54.9 |           2,383 |      5 |         55.2 |
| breast-lift-miami                 |     56.1 |     70.6 |     66.1 |           1,602 |      1 |         62.2 |
| breast-reduction-miami            |     27.1 |     57.2 |     59.5 |           1,459 |      2 |         58.5 |
| facelift-miami                    |     55.5 |     71.3 |     67.0 |           8,185 |      1 |         63.7 |
| liposuction-miami                 |     57.2 |     70.5 |     65.0 |           4,086 |      0 |         63.0 |
| mommy-makeover-miami              |     40.8 |     40.4 |     54.2 |           3,835 |      3 |         60.6 |
| tummy-tuck-miami                  |     34.8 |     58.4 |     67.2 |           3,900 |      2 |         57.5 |
| **Control** (the eight combined)  | **44.4** | **59.9** | **60.9** |          29,784 |     14 |     **60.4** |

`/procedures/rhinoplasty-miami` still collects impressions and returns 404
(#250 item 10). It is in the series and excluded from the control.

**The control is the test.** If the eight move after #250 deploys, the template
was the cause of the February drop. If they do not, the BBL module (#256) is the
next test and #259's indexing and link work moves earlier.

## BBL page clusters, 90 days to 2026-09-13

Clustered from the page's own query rows, first matching pattern wins. The
patterns live in `pull-bbl.mts` (`CLUSTERS`) so every later cut is the same cut.
These sum below the page totals above by whatever Search Console anonymized.

| Cluster  | Impressions | Clicks | Position | Largest query                                                    |
| -------- | ----------: | -----: | -------: | ---------------------------------------------------------------- |
| head     |       3,070 |      0 |     37.7 | brazilian butt lift miami — 1,104 impr @ 32.7                    |
| cost     |         909 |      4 |     15.1 | how much is a bbl in miami — 162 impr @ 9.2                      |
| surgeon  |         177 |      0 |     35.7 | top-rated brazilian butt lift surgeons in miami — 24 impr @ 44.0 |
| other    |         161 |      1 |     25.0 | brazilian but lift miami — 15 impr @ 29.9                        |
| safety   |          68 |      0 |     53.9 | safe brazilian butt lift miami — 24 impr @ 24.6                  |
| skinny   |          48 |      0 |     22.3 | skinny bbl miami — 29 impr @ 24.8                                |
| revision |           8 |      0 |     42.4 | brazilian butt lift revision miami — 8 impr @ 42.4               |

Page totals, 180 days: 26 clicks / 15,010 impressions @ 24.3.

`/bbl-miami` (redirected into the procedure page on 11 Sep) was still drawing
44 impressions at position 30.8 in its last full week — better placed than the
procedure page for "bbl miami" right up to the redirect.

## Still open on #249

- **AI citation panel**: 23 of 32 runs done (see
  `ai-citation-panel-2026-09-18.md`). Gemini prompts 5–7 and Claude prompts
  2, 4–8 still to run; their composers stopped accepting input mid-session.
- **Lighthouse** mobile and desktop on production. `live-pages-2026-09-18.md`
  carries the HTML weight and the DOM-level defects; the lab run is pending.
