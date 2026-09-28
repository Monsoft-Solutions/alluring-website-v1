# Tummy tuck page rebuild (#313)

The tummy tuck page moves off the shared template onto its own module
(`apps/web/components/procedures/pages/tummy-tuck/`), built on the procedure
kit the way the BBL and liposuction pages were. The Gate 1 brief, "Tummy
tuck" tab: https://claude.ai/artifact/6SsAr3a8Zp7mzWUK4G8x2q. The build
review with the hero picks: https://claude.ai/artifact/NHV5UEgSoY18P6Nzq5xC1f.

Stacked on #311 (the prices and claims) and #312 (the kit additions). Merge
those first.

## Baseline: what day 28 and day 56 are measured against

Search Console, www property, 90 days to 2026-09-27:

| Measure                              | Value                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| Page impressions · clicks · position | 3,239 · 2 · 62.3                                                                           |
| "tummy tuck miami" on the page       | 972 impressions at 78.9                                                                    |
| "abdominoplasty miami" on the page   | 479 impressions at 67.8                                                                    |
| Cost cluster on the page             | 95 impressions at 68.0                                                                     |
| Cost cluster's holder                | `/blog/tummy-tuck-mommy-makeover-miami`, 90% of the impressions at 8.4 (re-scoped in #311) |
| Tummy tuck impressions on blog posts | 88% of the topic (36,155 across 85 URLs)                                                   |
| Best period                          | December 2025, positions 19–26                                                             |

GA4 and the leads database, same window: 147 landing sessions, 19 s on the
page per session, 3 leads that started on the page.

At 390 px on the live page: first real result at 6,040 px, first form field
at 12,722 px, first price at 22,339 px, page height 43,829 px. HTML 315 KB,
9 JSON-LD tags.

AI panel (the engines' APIs with web search on): Alluring cited 6 times as a
generic price source for a tummy tuck, never named. Every price attributed
to Alluring was wrong before #311.

## After the rebuild (production build, served locally)

At 390 px: first real result at 1,843 px, first form field at 2,782 px,
first price at 3,709 px, page height 32,617 px. HTML 415 KB (71 KB
gzipped; BBL is 65 KB). One JSON-LD graph, 3 script tags, five named
`Offer`s.

## Control group

This page was one of the template pages in the #260 control for the BBL
rebuild. From this deploy, the BBL day-28 read (about 17–20 October) uses
facelift, blepharoplasty, breast lift and breast reduction.

## After merge

1. Request indexing for `/procedures/tummy-tuck-miami` in Search Console.
2. Day-28 read (about 26 October) and day-56 read (about 23 November):
   position by cluster (head, cost, variants, recovery), clicks, leads that
   started on the page (production DB), `section_view` depth, and the AI
   panel.
3. Blog links the brief lists, as production SQL the user runs after it is
   proven on a `--db clone` worktree:
    - `/blog/affordable-plastic-surgery-miami` → the page's `#pricing`;
    - the liposuction aftercare posts that rank for "tummy tuck and lipo"
      queries (foam, itching, massages, fibrosis, sleep) → the page.
4. `/how-long-to-recover-tummy-tuck` (position 65 for 3,500 impressions) is
   the largest informational gap: queue it for a refresh in the admin
   pipeline once #297 (the writer prompt's prices) is fixed.

## Waiting on the practice

Each answer lets a section say more. None is a gap on the page today.

- What a price includes, and whether the list prices are before or after the
  sheet's handwritten "20% off".
- Confirm the full and extended tummy tucks include muscle repair (the page
  says "usually", from ASPS).
- Drains or a drainless technique; surgery length by type; where surgery is
  done and who gives the anesthesia; the blood-clot plan; nights to stay in
  Miami before flying home.
- Whether the page may say that most tummy tucks here include liposuction
  (55 of 74 contracts in 2026).
- Gallery: publish before/after pairs (0 today, so no slider), and vet the
  13 results-like unpublished Instagram images for consent. Reviews last
  synced 2026-08-04.
