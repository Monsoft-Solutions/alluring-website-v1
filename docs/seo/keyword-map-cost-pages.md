# Keyword Map — Cost Cluster (Anti-Cannibalization)

**Date:** 2026-08-03
**Scope:** the six cost-intent pages shipped as Wave 1 of `docs/seo/geo-strategy-us-audience.md` (Cluster B).
**Rule:** every query cluster has exactly one owning page. Before adding any new page or retargeting an existing one, check this map — two of our pages competing for the same query cluster is how CG Cosmetic wastes crawl equity (`/mommy-makeover/` vs `/mommy-makeover-miami/`), and we do not copy that mistake.

---

## Ownership Map

| Page                                    | Owns (query cluster)                                                                                                               | Must NOT target                                                                                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/plastic-surgery-cost-miami` **(hub)** | "plastic surgery cost miami", "how much is plastic surgery in miami", "plastic surgery prices", "affordable plastic surgery miami" | any single-procedure cost query — those belong to the sub-pages it links to                                                                        |
| `/bbl-cost-miami`                       | "bbl cost miami", "how much does a bbl cost", "bbl price", "average cost of bbl in florida"                                        | "bbl miami", "brazilian butt lift miami" (owned by `/procedures/brazilian-butt-lift-bbl-miami`); conversion-landing intent (owned by `/bbl-miami`) |
| `/tummy-tuck-cost-miami`                | "tummy tuck cost miami", "how much is a tummy tuck", "mini tummy tuck cost", "abdominoplasty cost"                                 | "tummy tuck miami" (owned by `/procedures/tummy-tuck-miami`)                                                                                       |
| `/breast-augmentation-cost-miami`       | "breast augmentation cost miami", "boob job cost", "breast implant prices", "silicone implants cost"                               | "breast augmentation miami" (owned by `/procedures/breast-augmentation-miami`)                                                                     |
| `/mommy-makeover-cost-miami`            | "mommy makeover cost", "how much is a mommy makeover", "mini mommy makeover cost"                                                  | "mommy makeover miami" (owned by `/procedures/mommy-makeover-miami`); consultation intent (owned by `/mommy-makeover-consultation`)                |
| `/liposuction-cost-miami`               | "liposuction cost miami", "lipo cost", "lipo 360 cost", "liposuction price per area"                                               | "liposuction miami" (owned by `/procedures/liposuction-miami`)                                                                                     |

### The intent split that makes this work

- **`/procedures/*` pages = procedure intent.** "What is it, am I a candidate, how does recovery work." Their cost sections stay (they earn the featured-snippet-style cost FAQ), but each now links out to its cost page as the canonical deep-dive.
- **`/X-cost-miami` pages = price intent.** "How much, what's included, how do I pay." They link back to the procedure page for everything non-price.
- **`/plastic-surgery-financing-miami` = payment-method intent.** "Financing, payment plans, bad credit, CareCredit." Cost pages reference it; they never try to own financing queries.

## Deliberate omission: `/plastic-surgery-payment-plans`

The GEO strategy doc lists this page in Cluster B. It was **intentionally not built.** "plastic surgery payment plans" and "plastic surgery financing miami" are the same intent with different words; Google and AI engines resolve them to the same answer. A second page would compete with `/plastic-surgery-financing-miami` — precisely the cannibalization this map exists to prevent. Instead, the financing page should absorb the "payment plans" and "bad credit" phrasings in its own copy (part of its pending Quick Answer + tables retrofit).

## Cross-Linking Rules (implemented)

1. Every procedure page's cost section links to its cost page ("see our dedicated cost guide").
2. Every cost page links back to its procedure page, the hub, 1–2 sibling cost pages, and the financing page.
3. The hub links to all five sub-pages and the financing page.
4. Footer ("Pricing" group), `/html-sitemap` ("Pricing" category), and `llms.txt` ("Pricing Guides" section) all list the six pages.

## Title Convention

Cost pages lead with the price, the year, and the modifier — never with the procedure head term:

```
BBL Cost Miami 2026: From $5,500 All-Inclusive | Alluring   ← cost page
Breast Augmentation Miami 2026 | Board-Certified … | …      ← procedure page (unchanged)
```

## Canonical Price Sources

Every dollar figure on a cost page must trace to one of:

- `apps/web/lib/data/procedures/*.data.ts` (`priceFrom` + in-content market ranges)
- `apps/web/lib/data/weekly-payments.data.ts` (`WEEKLY_PAYMENT_OPTIONS` — the single source for weekly figures)
- `apps/web/lib/data/webpages/financing.ts` (lender caps)

**Known inconsistencies found during this build (pre-existing, in older content — not yet fixed):**

- `home-faq-data.ts` says BBL "starts at $6,500" and mommy makeover "$12,000–$18,000" — both contradict the procedure data files ($5,500 and $9,500 / $7,000–$20,000).
- `brazilian-butt-lift-bbl-miami.data.ts` meta description says "starting at $3,500 … from $67/week" while its `priceFrom` is $5,500 and `weekly-payments.data.ts` says $34/week. Breast aug content similarly says "$45/week" vs. the canonical $27/week.
- The cost pages use the procedure-data + weekly-payments figures everywhere. The older FAQ/description copy should be reconciled to the same numbers.

## When Adding Future Pages (Waves 2+)

- Destination pages (`/miami-vs-*`) own comparison intent — they may cite prices but always link the cost pages rather than restating full tables.
- Candidacy pages (`/am-i-a-candidate-*`) own qualification intent — no pricing sections beyond one linked mention.
- New procedure pages (rhinoplasty, gynecomastia, explant) get a cost page **only when** the procedure page exists first and has a `priceFrom`; until then no cost queries are targeted for them anywhere.
