# CG Cosmetic Competitive Gap Analysis + SEO/GEO Implementation Plan

**Date:** 2026-08-03
**Competitor analyzed:** `cgcosmetic.com` (CG Cosmetic Surgery, 2601 SW 37th Ave #100, Miami FL 33133)
**Our site:** `alluringplasticsurgery.com` (8435 SW 24th St, Miami FL 33155)

Everything below was measured directly (live HTML fetches, sitemap parsing, WHOIS, review-aggregator data), not estimated.

---

## Part 1 — Why CG Cosmetic Ranks

### The short answer

**CG does not out-rank us on page quality. They out-rank us on three things we can't fake and two things we can copy this week.**

Our `/procedures/breast-augmentation-miami` page is measurably _better_ than theirs: 3,772 words vs 3,192, cleaner heading hierarchy, canonical tag present (they have none), meta description present (they have none), full alt-text coverage on 35 images, 0.23s TTFB vs their 0.34s.

They still beat us because of authority, reviews, and intent-matched SERP copy.

### 1.1 Domain age and link equity — the structural moat

|                          | CG Cosmetic            | Alluring       |
| ------------------------ | ---------------------- | -------------- |
| Domain created (WHOIS)   | **2011-03-09**         | **2024-05-15** |
| Business operating since | 1999 (claimed on site) | —              |
| Age advantage            | **13 years**           | —              |

Thirteen years of accumulated links, brand mentions, and entity confirmation in Google's Knowledge Graph. This is the single largest factor and the only one with no shortcut. It is also _decaying_ — see §1.6.

### 1.2 Review volume — the local pack moat

| Source                         | CG Cosmetic | Alluring | Gap  |
| ------------------------------ | ----------- | -------- | ---- |
| Birdeye                        | **11,748**  | 79       | 149× |
| Yelp                           | **574**     | ~0       | —    |
| Google (per our own site copy) | —           | **49**   | —    |
| Video testimonials             | **500+**    | —        | —    |

Review count and review velocity are the dominant ranking factors for the Google local pack on `plastic surgery miami`, `bbl miami`, `breast augmentation miami`. The local pack sits above organic results for every one of those queries. **We are not competing in the same tier here.** 49 Google reviews is below the threshold where the local pack ranks you for head terms in a market as competitive as Miami.

### 1.3 Price-in-the-SERP — the copyable win

CG's actual title and H1:

```
<title>Breast Augmentation Miami | From $2,500 at CG Cosmetic</title>
<h1>Breast Augmentation in Miami Starting at $2,500</h1>
```

```
<title>Brazilian Butt Lift Miami, BBL From $3,500</title>
```

Ours:

```
<title>Breast Augmentation Miami 2026 | Board-Certified Surgeons | Alluring Plastic Surgery</title>
<h1>Breast Augmentation Miami</h1>
```

In this vertical the highest-volume modifiers are `cost`, `price`, `cheap`, `affordable`, `financing`, `payment plan`. CG's title answers the query in the SERP; ours does not. Two of the six results Google returned for "best plastic surgery Miami breast augmentation cheap financing" had a price in the title — CG at $2,500 and Elite at $2,499. We appeared only via a _blog post_, not a procedure page.

Their homepage carries the same pattern: "Breast Augmentation — Starts at $2,500 / BBL — Starts at $3,500 / Tummy Tuck — Starts at $3,500 / Breast Lift — Starts at $4,500", plus "100% financing available".

Our tagline is _literally_ "Luxury Surgeries Made Affordable" and we do not put a single number in a title tag.

### 1.4 URL structure

CG puts money pages at the root with exact-match city slugs:

```
/breast-augmentation-miami/   /liposuction-miami/   /rhinoplasty-miami/
/tummy-tuck-surgery/          /mommy-makeover-miami/ /mini-facelift-miami/
```

We bury ours a level deeper: `/procedures/breast-augmentation-miami`.

Minor factor on its own, but it compounds with §1.5.

### 1.5 Procedure coverage — they have ~25 service pages, we have 9

Our entire procedure sitemap:

```
breast-augmentation-miami, breast-lift-miami, breast-reduction-miami,
liposuction-miami, brazilian-butt-lift-bbl-miami, tummy-tuck-miami,
mommy-makeover-miami, facelift-miami, blepharoplasty-miami
```

CG additionally ranks for pages we have **no page at all** for:

`rhinoplasty-miami`, `mini-facelift-miami`, `breast-revision-surgery`, `breast-implants-removal`, `j-plasma-renuvion`, `lip-fillers-botox-miami`, `body-sculpting-miami`, `vampire-facelift`, `supervised-weight-loss-program`, `eyelid-surgery-miami-blepharoplasty`, `anesthesia-and-nursing-team`, `out-town-patients`, `cg-cosmetic-center-facility`, `plastic-surgery-faq`.

Rhinoplasty Miami alone is a top-5 volume term in this market and we are entirely absent.

### 1.6 Where CG is actually weak — this is our opening

| Weakness                        | Evidence                                                                                                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dead blog**                   | 152 posts, last real publish **2023-02-02**. Most posts dated 2017–2019. Their `lastmod` dates are bulk-rewritten (many say 2025-02-12) but content is stale.                                                             |
| **Slow**                        | Homepage TTFB **1.25s** vs our 0.25s; 1.42s total.                                                                                                                                                                        |
| **No canonicals**               | Zero `rel=canonical` on `/breast-augmentation-miami/`.                                                                                                                                                                    |
| **No meta descriptions**        | Zero `<meta name="description">` on procedure pages.                                                                                                                                                                      |
| **Keyword cannibalization**     | `/brazilian-butt-lift-miami-bbl/` **and** `/brazilian-butt-lift-miami-fat-transfer/`; `/mommy-makeover/` **and** `/mommy-makeover-miami/`; `/cosmetic-surgery-center/` and `/coral-gables-cosmetic-center-in-florida/`.   |
| **Schema spam risk**            | Their `HealthAndBeautyBusiness` block contains one hardcoded `Review` — `ratingValue: "4"`, author `"Kathy Martinez"` — with **no `aggregateRating`**. Self-serving single-review markup is exactly what Google devalues. |
| **Trust/E-E-A-T vulnerability** | ComplaintsBoard rating **1.3/5** with 12 complaints; **not BBB accredited**; a widely-indexed patient-death news story attached to the brand.                                                                             |
| **Junk in sitemap**             | `/thank-you-hd-ba/`, `/thank-you-hd-bbl/`, `/consent-signature/`, `/pet-credit-card-authorization-form/`, `/receptionist-job-application/`, `/miss-cg-cosmetic-2021/` all submitted for indexing.                         |
| **Typo'd URL**                  | `/cg-cosmeitc-center-facility/` — misspelled, live, in sitemap.                                                                                                                                                           |

**Strategic read:** CG's moat is authority + reviews, not craft. Their content is aging and their trust signals are deteriorating. We win by (a) fixing our own critical technical bugs, (b) taking the intent clusters they neglect, and (c) attacking on trust and freshness where they are exposed — while grinding review volume in parallel because nothing else moves the local pack.

---

## Part 2 — Our Site: Audit Findings

### 🔴 CRITICAL — P0

#### C1. All structured data is client-side injected. AI crawlers see zero schema.

**This is the most damaging finding in the audit.**

`packages/seo/src/react/json-ld.component.tsx:13-17` renders JSON-LD through `next/script`:

```tsx
<Script
    type='application/ld+json'
    strategy='beforeInteractive'
    dangerouslySetInnerHTML={{ __html: json }}
/>
```

In the App Router, `next/script` with `beforeInteractive` does **not** emit a `<script type="application/ld+json">` tag. It serializes into a bootstrap array:

```html
<script>
    ;(self.__next_s = self.__next_s || []).push([
        0,
        {
            type: 'application/ld+json',
            children: '{"@context":"https://schema.org","@type":"FAQPage",...}',
        },
    ])
</script>
```

Verified counts in the raw server HTML:

| Page                                    | Literal `<script type="application/ld+json">` tags |
| --------------------------------------- | -------------------------------------------------- |
| `/`                                     | **0**                                              |
| `/procedures/breast-augmentation-miami` | **0**                                              |

Compare CG's `/breast-augmentation-miami/`, which serves inline in raw HTML: `FAQPage` (12 Q&A), 2× `VideoObject`, `WebPage`, `Organization`, `Person`, `ImageObject`.

**Impact:**

- **GEO: total loss.** GPTBot, ClaudeBot, OAI-SearchBot, PerplexityBot, CCBot do not execute JavaScript. Every schema entity we built — `MedicalClinicSchema`, `PhysicianSchema`, `FAQSchema`, `HowToSchema`, `SurgicalProcedure`, `BreadcrumbList`, `Offer` — is invisible to them. Our `robots.txt` correctly welcomes all of them and then serves them nothing.
- **SEO: delayed and unreliable.** Googlebot's WRS does render JS, so schema is picked up second-wave, but rich-result eligibility (FAQ accordions, breadcrumbs, review stars) is materially less reliable than server-rendered JSON-LD.
- Bing's renderer is far weaker than Google's — likely losing it there entirely.

**Fix:** Replace `next/script` with a plain `<script>` element in the server component. One file, ~5 lines, fixes every page site-wide.

```tsx
export function JsonLd<T extends Thing>({ data }: JsonLdProps<T>) {
    return (
        <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: sanitizeForJsonLd(data) }}
        />
    )
}
```

Verify after deploy with:

```bash
curl -s https://www.alluringplasticsurgery.com/procedures/breast-augmentation-miami \
  | grep -c '<script type="application/ld+json">'
```

Expect ≥ 8, currently 0.

#### C2. 82% of our indexable URLs are thin, templated pages.

Sitemap composition:

| Sitemap          | URLs       | Assessment                                                |
| ---------------- | ---------- | --------------------------------------------------------- |
| `instagram.xml`  | **806**    | ~307 words each, **no `<h1>`**, duplicate templated title |
| `gallery.xml`    | **103**    | ~233 words each                                           |
| `blog.xml`       | 152        | Substantive                                               |
| `pages.xml`      | 26         | Substantive                                               |
| `procedures.xml` | 10         | Substantive                                               |
| `promotions.xml` | 1          | —                                                         |
| **Total**        | **~1,098** | **909 thin (82.8%)**                                      |

Sample Instagram page (`/instagram/DUjTxkZDu_b`):

```
TITLE: Gallery Feb 2026 | Alluring Plastic Surgery | Alluring Plastic Surgery
H1:    (none)
WORDS: 307
```

Note the **duplicated brand suffix** — a title-template bug — plus a title shared across hundreds of URLs.

Google's helpful-content assessment is **site-wide**. On a domain that is only 2 years old with no authority buffer, 909 near-duplicate pages actively suppress the 188 pages that deserve to rank. CG has 229 total URLs and ~152 of them are real posts.

**Fix:** `noindex, follow` the Instagram detail pages, remove `instagram.xml` from the sitemap index and `robots.txt`, and keep `/instagram` as a single indexable hub. Do the same for gallery _media_ detail pages, keeping the gallery _group_ pages indexable. Target: drop indexable URLs from ~1,098 to ~200 of substance.

#### C3. The site targets the wrong geography in code and content.

> **Audience correction (2026-08-03, from the client):** the target market is the **United States — Miami and Florida first, then nationwide.** Latin America and the Caribbean are **not** target markets. The codebase and docs currently assume the opposite.

Wrong-market declarations currently shipping:

| Location                                                  | Current value                                                                                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/web/app/page.tsx:203-204`                           | `areaServed: [... 'Latin America', 'Caribbean']`                                                                                                             |
| `apps/web/app/free-consultation/page.tsx:123`             | `areaServed: ['Miami', 'Florida', 'Latin America', 'Caribbean']`                                                                                             |
| `apps/web/app/landing/dr-victoria-karlinsky/page.tsx:129` | same                                                                                                                                                         |
| `apps/web/app/landing/procedure/[slug]/page.tsx:254`      | same                                                                                                                                                         |
| `apps/web/app/llms.txt/route.ts:187`                      | "international patients from Latin America, Caribbean, and beyond"                                                                                           |
| `apps/web/app/llms-full.txt/route.ts:230-231`             | "Latin America (Brazil, Colombia, Venezuela, Mexico)", "Caribbean Islands"                                                                                   |
| `apps/web/lib/data/faq/home-faq-data.ts:48`               | "patients from across South Florida, Latin America, the Caribbean"                                                                                           |
| `CLAUDE.md:11`                                            | "serves locals + medical tourists from Latin America/Caribbean"                                                                                              |
| `packages/ai/src/prompts/**` (4 files)                    | "Serves: Local Miami residents + medical tourists from Latin America/Caribbean" — this poisons every AI-generated blog post, gallery caption and image brief |
| `docs/seo/content-strategy-lead-generation.md`            | Persona built on a Latin America / Caribbean ICP                                                                                                             |

**Why this costs rankings:** `areaServed` is a direct geo-relevance signal to Google and a primary entity attribute for LLMs. Declaring Latin America and the Caribbean dilutes our US relevance and tells AI engines we're a foreign-inbound clinic — the opposite of what we want returned for `plastic surgeon miami` or `best plastic surgery for americans`. The `packages/ai` prompt contamination is worse than the schema, because it silently biases every future piece of generated content.

**Fix:** `areaServed: ['Miami', 'Miami-Dade County', 'South Florida', 'Florida', 'United States']` everywhere; rewrite `llms.txt` / `llms-full.txt` geography sections around US states; correct `CLAUDE.md` and all four `packages/ai` prompt files; reframe every "medical tourism" surface as **domestic US travel to Miami**.

**On Spanish:** deprioritized. It is _not_ a Latin America play, but Miami-Dade is ~70% Hispanic and a meaningful share of that is US-resident and Spanish-dominant, so `/es/` retains some local value. Treat it as an optional Phase 5 item, not a P1. `/consulta-gratis` and the Spanish hero component can stay as-is. Note that the homepage's **Google Translate JS widget** (`<div id="google_translate_element">`, which also triggers a `BAILOUT_TO_CLIENT_SIDE_RENDERING`) contributes nothing to indexing — client-side translation is never crawled. Keep it for UX only, or drop it.

---

### 🟠 HIGH — P1

#### H1. No price in any title tag or H1.

Direct CTR and intent-match loss against CG on the highest-volume modifier cluster in the vertical. See §1.3. Our pricing data already lives in `apps/web/lib/data/weekly-payments.data.ts`.

#### H2. Homepage `<h1>` has a missing space.

Rendered: `Miami's Premier Plastic Surgery.Luxury Results, Designed for You.`

Two-line JSX concatenated without whitespace. Visible in SERPs and to AI crawlers as a quality signal.

#### H3. Nine procedure pages vs CG's ~25.

Missing entirely: rhinoplasty, mini facelift / neck lift, breast revision, breast implant removal (explant), gynecomastia (we have `/mens-plastic-surgery-miami` but no dedicated procedure page), arm lift, thigh lift, BBL revision, skin tightening (Renuvion/J-Plasma), lip filler / Botox.

#### H4. `robots.txt` blocks our own SEO tooling.

```
User-Agent: AhrefsBot / MJ12bot / SemrushBot / DotBot
Disallow: /
```

This does not stop competitors from analyzing us (those tools index from their own crawl of _other_ sites' outbound links). It only removes us from our own dashboards and from third-party "best of Miami" data sets that use those indexes. Net negative.

#### H5. `Disallow: /*?page=*` may orphan deep blog posts.

`apps/web/app/robots.ts` — if blog pagination uses `?page=`, posts beyond page 1 are reachable only through internal links. With 152 posts this matters. Verify pagination scheme; if query-param based, switch to path segments (`/blog/page/2`) and drop the disallow.

#### H6. Money pages sit one level deep at `/procedures/*`.

Lower click-depth and exact-match root URLs are what CG uses. Migration is only worth it with correct 301s — see Phase 3.

---

### 🟡 MEDIUM — P2

| ID  | Finding                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | HTML payload **380–414 KB** per page (CG: 154–168 KB). TTFB is excellent (0.23–0.25s) so this is survivable, but it's LCP/INP risk on the 60%+ mobile audience. Audit for oversized RSC flight payloads.                  |
| M2  | `aggregateRating` is conditionally rendered from live review data (`apps/web/app/page.tsx:218`) — correct and honest. Keep it that way; never hardcode. This is a genuine advantage over CG's fake-looking single review. |
| M3  | No `Speakable` / short answer blocks called out for voice + AI Overviews on most pages (the breast-aug page has `cssSelector: ["h1", ".procedure-intro", ".quick-answer"]` — good pattern, not yet universal).            |
| M4  | No comparison content targeting competitor-brand queries (`cg cosmetic vs`, `best plastic surgeon miami reviews`, `is cg cosmetic safe`).                                                                                 |
| M5  | No dedicated video testimonial page with `VideoObject` schema. CG's `/reviews-testimonials/` carries **82 `VideoObject` + 89 `MedicalProcedure`** entities.                                                               |

---

### ✅ What We Already Do Better

Do not regress these:

- **Content depth:** 3,772 words on breast aug vs CG's 3,192, with better structure (cost section, candidacy section, implant-type comparison, week-by-week recovery, breast-lift-vs-augmentation decision block). This is exactly the format LLMs extract and cite.
- **Speed:** TTFB 0.23–0.25s vs CG's 0.34–1.25s.
- **`llms.txt` + `llms-full.txt`** already served, well structured.
- **`robots.txt` explicitly allows** GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot.
- **Canonicals + meta descriptions on every page** (CG has neither).
- **35/35 images with alt text**, 33 lazy-loaded.
- **Sitemap index** with 6 typed child sitemaps.
- **Honest, data-driven `aggregateRating`.**

---

## Part 3 — Implementation Plan

### Phase 0 — Emergency Technical Fixes (Week 1)

Highest impact per hour of work in this entire document.

| #   | Task                                                                                                                                                                                | File(s)                                        | Effort |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------ |
| 0.1 | **Server-render all JSON-LD.** Swap `next/script` → plain `<script>`.                                                                                                               | `packages/seo/src/react/json-ld.component.tsx` | 15 min |
| 0.2 | Verify with `curl \| grep -c '<script type="application/ld+json">'` on `/`, `/procedures/*`, `/blog/*`, `/reviews`, `/about`. Validate every page type in Google Rich Results Test. | —                                              | 1 h    |
| 0.3 | Fix homepage `<h1>` missing space.                                                                                                                                                  | `apps/web/app/page.tsx`                        | 5 min  |
| 0.4 | Fix duplicated brand suffix in Instagram/gallery title template.                                                                                                                    | Instagram + gallery metadata generators        | 30 min |
| 0.5 | Unblock AhrefsBot / SemrushBot / MJ12bot / DotBot.                                                                                                                                  | `apps/web/app/robots.ts`                       | 5 min  |
| 0.6 | Audit blog pagination scheme; if `?page=`, move to `/blog/page/N` and remove `Disallow: /*?page=*`.                                                                                 | `apps/web/app/robots.ts`, blog listing         | 2 h    |

**Exit criteria:** ≥ 8 raw JSON-LD blocks in the HTML of every procedure page; Rich Results Test shows FAQ + Breadcrumb + LocalBusiness eligible on all page types.

---

### Phase 1 — Index Hygiene (Week 1–2)

Cutting 909 thin URLs is a _ranking_ action, not a cleanup chore.

| #   | Task                                                     | Detail                                                                                                                                      |
| --- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | `noindex, follow` all `/instagram/[code]` pages          | 806 URLs. Keep `/instagram` hub indexable.                                                                                                  |
| 1.2 | Remove `instagram.xml` from sitemap index + `robots.txt` | `apps/web/app/sitemap.ts`, `apps/web/app/robots.ts`                                                                                         |
| 1.3 | `noindex, follow` `/gallery/media/[slug]`                | 103 URLs. Keep `/gallery` and `/gallery/[slug]` group pages indexable — those have real procedure context.                                  |
| 1.4 | Enrich the ~20 gallery _group_ pages                     | 600+ words of procedure-specific commentary each, `ImageObject` schema with before/after captions. Turn 103 thin pages into 20 strong ones. |
| 1.5 | Submit updated sitemaps in GSC; monitor Coverage weekly  | Target: indexable URLs 1,098 → ~200.                                                                                                        |

**Expected effect:** site-wide quality signal improvement within 4–8 weeks; crawl budget redirected to money pages.

---

### Phase 2 — Attack the Price/Cost Intent Cluster (Week 2–3)

This is where CG is beatable _immediately_ — it's a copy change, not an authority problem.

| #   | Task                                                                                                                                                                                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Rewrite all 9 procedure title tags to lead with price. Pull from `apps/web/lib/data/weekly-payments.data.ts` so it stays single-sourced.                                                                                                                                         |
| 2.2 | Add price to each procedure `<h1>` where the number is defensible.                                                                                                                                                                                                               |
| 2.3 | Add a `Quick Answer` block in the first 100 words of each procedure page: _"Breast augmentation in Miami at Alluring starts at $X, or $Y/week with financing. Includes surgeon fee, facility, anesthesia, and post-op garments."_ — this is the exact format LLMs lift verbatim. |
| 2.4 | Add `Offer` schema with `price`, `priceCurrency`, `priceValidUntil` to every procedure page (server-rendered, post-Phase-0).                                                                                                                                                     |
| 2.5 | Build `/plastic-surgery-cost-miami` — a comparison hub table of every procedure, our price, Miami average, weekly financing. Highly linkable and highly citable.                                                                                                                 |

**Proposed titles (55–60 chars):**

```
Breast Augmentation Miami from $4,500 | Alluring
BBL Miami from $X | All-Inclusive Pricing | Alluring
Tummy Tuck Miami from $X | Financing from $Y/wk
Mommy Makeover Miami from $X | Payment Plans
Liposuction Miami from $X | Board-Certified Surgeons
```

Keep `Board-Certified` in the description rather than the title — CG cannot credibly claim what we can on trust, but price is what wins the click.

---

### Phase 3 — Close the Coverage Gap (Week 3–8)

**3a. New procedure pages** — build at the same 3,000+ word depth as the existing breast-aug page, which is already best-in-class:

| Priority | Page                                      | Why                                                                      |
| -------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| 1        | `rhinoplasty-miami`                       | Top-5 volume in market; we have nothing                                  |
| 2        | `gynecomastia-miami`                      | Male segment; `/mens-plastic-surgery-miami` exists but no procedure page |
| 3        | `breast-implant-removal-miami` (explant)  | Fast-growing intent; CG ranks, we're absent                              |
| 4        | `breast-revision-miami`                   | High-value, high-intent                                                  |
| 5        | `arm-lift-miami` / `thigh-lift-miami`     | Post-weight-loss cluster; ties to `/after-weight-loss-consultation`      |
| 6        | `neck-lift-miami` / `mini-facelift-miami` | Facial cluster completion                                                |
| 7        | `skin-tightening-renuvion-miami`          | Directly matches CG's `/j-plasma-renuvion/`                              |

**3b. Trust-gap content** — CG is exposed here (1.3/5 ComplaintsBoard, no BBB accreditation, an indexed patient-death story). Attack on safety and transparency, factually and without naming them:

- `/patient-safety-miami-plastic-surgery` — accreditation, anesthesia team credentials, board certification explained, what to ask any surgeon
- `/how-to-choose-a-plastic-surgeon-miami` — this is CG's own H2 topic; own it as a standalone page
- `/board-certification-explained` — genuine E-E-A-T; ABCS vs ABPS, why it matters
- Surgeon bios expanded with credentials, training, memberships, publications, and `Physician` + `EducationalOccupationalCredential` schema

**3c. US geographic footprint** _(replaces the former Spanish/LatAm phase — see the audience correction in C3)_:

Two tiers, both US. Full page list and content requirements in `docs/seo/geo-strategy-us-audience.md`.

- **Florida drive-market pages** — Fort Lauderdale, West Palm Beach, Boca Raton, Naples, Tampa, Orlando, Jacksonville
- **US fly-in feeder-market pages** — New York, New Jersey, Atlanta, Chicago, Dallas, Houston, Boston, Charlotte
- Each needs genuinely unique content (flight routes, nights-in-Miami, clearance-to-fly timing, market-specific testimonials). **Do 12 well rather than 50 thin** — we are already fixing a thin-content problem in Phase 1; do not recreate it.
- Update `areaServed` on every schema block to the US set before building these.

---

### Phase 4 — GEO / AI Search (Week 4–10)

Phase 0.1 is the prerequisite for everything here. Right now AI crawlers get our prose and nothing else.

| #   | Task                                                                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | **Verify AI-crawler-visible schema** after Phase 0 — refetch with a plain non-JS client and confirm entity extraction.                                                                                                |
| 4.2 | Extend `llms.txt` / `llms-full.txt` with an explicit pricing table, surgeon credentials, financing terms, and a Spanish section. Add `<link rel="llms" href="/llms.txt">` in `<head>`.                                |
| 4.3 | Add a **Quick Answer / TL;DR** block to every procedure and every blog post — 40–60 words, directly answering the primary query, in the first screen. This is what gets lifted into AI Overviews and ChatGPT answers. |
| 4.4 | Add `Speakable` schema pointing at those blocks site-wide (the pattern already exists on breast-aug: `cssSelector: ["h1", ".procedure-intro", ".quick-answer"]`).                                                     |
| 4.5 | Convert prose comparisons into **real HTML tables** (implant types, BBL vs fat transfer, our price vs Miami average, recovery timelines). LLMs extract tables far more reliably than paragraphs.                      |
| 4.6 | Add `dateModified` to every page's schema and surface "Last updated" visibly. Freshness is a major AI-citation signal — and it's precisely where CG is dead (last blog post Feb 2023).                                |
| 4.7 | Add `Author` + `reviewedBy` (physician) schema to every blog post. Medical YMYL content without a named, credentialed reviewer is heavily discounted by both Google and LLMs.                                         |
| 4.8 | Build a video testimonial page with `VideoObject` schema per video (CG has 82 — this is a real moat we can start building).                                                                                           |
| 4.9 | Publish original data: "Miami Plastic Surgery Cost Report 2026" from our own procedure data. Original statistics are the single most-cited content type in LLM answers.                                               |

---

### Phase 5 — Authority & Reviews (Ongoing, start Week 1)

**Nothing in Phases 0–4 closes the 149× review gap or the 13-year domain gap. These run in parallel from day one and matter more than any code change.**

| #   | Task                                                                                                                                                                 | Target                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 5.1 | **Systematic Google review capture.** Post-op SMS/email at day 7 and day 30, QR codes in recovery packets, front-desk ask at final follow-up.                        | 49 → **300+ Google reviews in 12 months** |
| 5.2 | Google Business Profile: all procedures as services, weekly Posts, Q&A seeded, all photos geotagged, booking link.                                                   | Weekly cadence                            |
| 5.3 | **Video testimonials** — even 20 changes the page. Ask every satisfied patient; 60-second phone video is fine.                                                       | 20 in 6 months                            |
| 5.4 | Claim and fill: RealSelf, Yelp, Healthgrades, Vitals, Zocdoc, BBB (**get accredited — CG is not**), local directories. NAP identical to `site-config.ts` everywhere. | 20+ citations                             |
| 5.5 | Digital PR — surgeon commentary for local Miami media, procedure-trend data pitches, podcast appearances.                                                            | 2–3 placements/quarter                    |
| 5.6 | Publish the cost report (4.9) and pitch it as a citable source.                                                                                                      | 1 major asset                             |

---

## Part 4 — Priority Order

Ranked by (impact ÷ effort):

| Rank | Action                                           | Phase   | Effort      | Impact                                                                  |
| ---- | ------------------------------------------------ | ------- | ----------- | ----------------------------------------------------------------------- |
| 1    | **Server-render JSON-LD**                        | 0.1     | 15 min      | 🔴 Critical — restores all schema for Google _and_ unlocks GEO entirely |
| 2    | **`noindex` 909 thin pages**                     | 1.1–1.3 | 2 h         | 🔴 Critical — site-wide quality signal                                  |
| 3    | **Price in titles + Quick Answer blocks**        | 2.1–2.3 | 1 day       | 🟠 High — direct CTR and intent match vs CG                             |
| 4    | Fix H1 space + title template bug                | 0.3–0.4 | 30 min      | 🟠 High — trivial, visible                                              |
| 5    | **Start review capture system**                  | 5.1     | 1 day setup | 🔴 Critical long-term — nothing else moves the local pack               |
| 6    | Unblock SEO crawlers, fix pagination             | 0.5–0.6 | 2 h         | 🟡 Medium                                                               |
| 7    | Rhinoplasty + gynecomastia + explant pages       | 3a      | 1 wk        | 🟠 High — uncontested volume                                            |
| 8    | Fix `areaServed` + US geo pages                  | 3c      | 1–2 wk      | 🟠 High — wrong market declared in schema today                         |
| 9    | Quick Answers + tables + `dateModified` sitewide | 4.3–4.6 | 1 wk        | 🟠 High — GEO                                                           |
| 10   | Enrich gallery group pages                       | 1.4     | 1 wk        | 🟡 Medium                                                               |
| 11   | Trust-gap content cluster                        | 3b      | 2 wk        | 🟠 High — attacks CG's real weakness                                    |
| 12   | Video testimonials + `VideoObject`               | 4.8     | ongoing     | 🟠 High                                                                 |
| 13   | Cost report / original data                      | 4.9     | 2 wk        | 🟠 High — links + citations                                             |

---

## Part 5 — Measurement

| Metric                                      | Baseline (2026-08-03) | 3 mo     | 12 mo    |
| ------------------------------------------- | --------------------- | -------- | -------- |
| Raw JSON-LD blocks per procedure page       | **0**                 | ≥ 8      | ≥ 8      |
| Indexable URLs                              | ~1,098 (82% thin)     | ~200     | ~280     |
| Google reviews                              | 49                    | 120      | 300+     |
| Procedure pages                             | 9                     | 14       | 20       |
| US geo pages (FL + feeder markets)          | 0                     | 6        | 12       |
| Schema blocks declaring non-US `areaServed` | 6 files               | 0        | 0        |
| Video testimonials                          | 0                     | 8        | 20       |
| Homepage TTFB                               | 0.25s                 | ≤ 0.25s  | ≤ 0.25s  |
| HTML payload                                | 380–414 KB            | < 250 KB | < 200 KB |

**Weekly in GSC:** Coverage (indexed vs excluded), Core Web Vitals, position for `breast augmentation miami`, `bbl miami`, `mommy makeover miami`, `plastic surgery miami cost`, `rhinoplasty miami`.

**Monthly:** manually query ChatGPT / Claude / Perplexity / Google AI Overviews with `best plastic surgeon miami`, `breast augmentation miami cost`, `affordable bbl miami` and record whether we're cited. That is the only reliable GEO measurement available today.

---

## Appendix — Reproducing the Measurements

```bash
# JSON-LD server-render check (the P0 test)
curl -s https://www.alluringplasticsurgery.com/procedures/breast-augmentation-miami \
  | grep -c '<script type="application/ld+json">'
# 0 = broken, >=8 = fixed

# Competitor schema for comparison
curl -sL https://www.cgcosmetic.com/breast-augmentation-miami/ \
  | grep -o '"@type": "[^"]*"' | sort | uniq -c

# Sitemap composition
for s in pages blog procedures gallery promotions instagram; do
  echo -n "$s: "
  curl -sL "https://www.alluringplasticsurgery.com/sitemap/$s.xml" | grep -c '<loc>'
done

# TTFB comparison
curl -sL -o /dev/null -w "ttfb=%{time_starttransfer}s size=%{size_download}\n" \
  https://www.alluringplasticsurgery.com/

# Domain age
whois cgcosmetic.com | grep -i "creation date"
whois alluringplasticsurgery.com | grep -i "creation date"
```
