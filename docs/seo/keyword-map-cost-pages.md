# Keyword Map — Cost Cluster (Anti-Cannibalization)

**Date:** 2026-08-03
**Scope:** the six cost-intent pages shipped as Wave 1 of `docs/seo/geo-strategy-us-audience.md` (Cluster B).
**Claims:** every price, financing line and credential on these pages follows the claims canon (`docs/claims/canon.md`, issue #354). No Alluring price is typed: pages read the pricing resolver, and text uses claim tokens (`packages/shared/src/claims/README.md`).
**Rule:** every query cluster has exactly one owning page. Before adding any new page or retargeting an existing one, check this map — two of our pages competing for the same query cluster is how CG Cosmetic wastes crawl equity (`/mommy-makeover/` vs `/mommy-makeover-miami/`), and we do not copy that mistake.

---

## Ownership Map

| Page                                    | Owns (query cluster)                                                                                                                                                                                                          | Must NOT target                                                                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `/plastic-surgery-cost-miami` **(hub)** | "plastic surgery cost miami", "how much is plastic surgery in miami", "plastic surgery prices", "affordable plastic surgery miami"                                                                                            | any single-procedure cost query — those belong to the sub-pages it links to                                                         |
| ~~`/bbl-cost-miami`~~ **dropped**       | Never built. Its cluster ("bbl cost miami", "how much does a bbl cost", "bbl price", "average cost of bbl in florida") belongs to `/procedures/brazilian-butt-lift-bbl-miami`, which Google already ranks for it (2026-09-15) | —                                                                                                                                   |
| `/tummy-tuck-cost-miami`                | "tummy tuck cost miami", "how much is a tummy tuck", "mini tummy tuck cost", "abdominoplasty cost"                                                                                                                            | "tummy tuck miami" (owned by `/procedures/tummy-tuck-miami`)                                                                        |
| `/breast-augmentation-cost-miami`       | "breast augmentation cost miami", "boob job cost", "breast implant prices", "silicone implants cost"                                                                                                                          | "breast augmentation miami" (owned by `/procedures/breast-augmentation-miami`)                                                      |
| `/mommy-makeover-cost-miami`            | "mommy makeover cost", "how much is a mommy makeover", "mini mommy makeover cost"                                                                                                                                             | "mommy makeover miami" (owned by `/procedures/mommy-makeover-miami`); consultation intent (owned by `/mommy-makeover-consultation`) |
| `/liposuction-cost-miami`               | "liposuction cost miami", "lipo cost", "lipo 360 cost", "liposuction price per area"                                                                                                                                          | "liposuction miami" (owned by `/procedures/liposuction-miami`)                                                                      |

"affordable plastic surgery miami" is a search phrase the hub answers; the copy itself never says "affordable" (canon §10).

### The intent split that makes this work

- **`/procedures/*` pages = procedure intent.** "What is it, am I a candidate, how does recovery work." Their cost sections stay (they earn the featured-snippet-style cost FAQ), but each now links out to its cost page as the canonical deep-dive.
- **`/X-cost-miami` pages = price intent.** "How much, what moves the price, how do I pay." What's included is listed for BBL only, until the practice confirms one inclusion list for every procedure (canon D4). They link back to the procedure page for everything non-price.
- **`/plastic-surgery-financing-miami` = payment-method intent.** "Financing, payment plans, bad credit, CareCredit." Cost pages reference it; they never try to own financing queries. The financing page answers those queries by naming the partners (Cherry, CareCredit, United Credit) and saying approval and terms are set by the lender: no payment figures, APR or approval claims (canon §6).

## Deliberate omission: `/plastic-surgery-payment-plans`

The GEO strategy doc lists this page in Cluster B. It was **intentionally not built.** "plastic surgery payment plans" and "plastic surgery financing miami" are the same intent with different words; Google and AI engines resolve them to the same answer. A second page would compete with `/plastic-surgery-financing-miami` — precisely the cannibalization this map exists to prevent. Instead, the financing page should absorb the "payment plans" and "bad credit" phrasings in its own copy (part of its pending Quick Answer + tables retrofit), within the canon's financing rules.

## Cross-Linking Rules (implemented)

1. Every procedure page's cost section links to its cost page ("see our dedicated cost guide").
2. Every cost page links back to its procedure page, the hub, 1–2 sibling cost pages, and the financing page.
3. The hub links to all five sub-pages and the financing page.
4. Footer ("Pricing" group), `/html-sitemap` ("Pricing" category), and `llms.txt` ("Pricing Guides" section) all list the six pages.

## Title Convention

Cost pages lead with the price, the year, and the modifier — never with the procedure head term. The price is a claim token, resolved when the title is rendered, and no title says "board-certified" or "all-inclusive":

```
BBL Cost Miami 2026: From [[price:bbl]] | Alluring                                       ← cost page
Breast Augmentation Miami 2026 | From [[price:breast-augmentation:saline]] | Alluring   ← procedure page
```

## Canonical Price Sources

Every dollar figure on a cost page traces to one of (claims canon §5 and its Decisions of 2026-10-25):

- **Alluring's prices:** the pricing resolver (`apps/web/lib/queries/pricing.query.ts`), which reads the admin Pricing page and falls back to the practice price sheet of 2026-09-15 (`docs/pricing/practice-price-list.md`, as `@workspace/shared/claims/prices`). Pages render `<PriceTag>` and one `<DiscountStatement>`; text uses claim tokens (`[[price:<procedure>]]`, `[[price:<procedure>:<line>]]`, `[[price-range:bbl]]`, `[[price-caveat]]`). Never a typed figure.
- **National averages:** only the three ASPS surgeon's-fee averages in the facts files (`apps/web/lib/data/procedures/facts/*.facts.ts`), typed, attributed, with what they exclude and no year.

No weekly or monthly payment figure is published anywhere; every weekly figure, including `weekly-payments.data.ts`, is retired (canon §6, D6). Only BBL has a "most patients pay" range, and the mommy makeover has no total (D3).

## When Adding Future Pages (Waves 2+)

- Destination pages (`/miami-vs-*`) own comparison intent — they may cite prices but always link the cost pages rather than restating full tables.
- Candidacy pages (`/am-i-a-candidate-*`) own qualification intent — no pricing sections beyond one linked mention.
- New procedure pages (rhinoplasty, gynecomastia, explant) get a cost page **only when** the procedure page exists first and has a starting line on the price sheet (the pricing resolver); until then no cost queries are targeted for them anywhere.
