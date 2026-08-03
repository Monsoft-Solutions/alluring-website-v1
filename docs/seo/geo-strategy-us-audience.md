# GEO Strategy — Generative Engine Optimization for a US Audience

**Date:** 2026-08-03
**Audience:** United States. Miami and Florida first, then nationwide. **Not** Latin America or the Caribbean.
**Companion doc:** `docs/seo/competitive-gap-cgcosmetic-and-seo-geo-plan.md`
**Blocking issue:** [#118](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/118) — nothing in this document works until server-rendered JSON-LD ships.

---

## 1. How GEO Actually Works

"GEO" is not a separate discipline bolted onto SEO. When someone asks ChatGPT, Perplexity, Claude, Copilot, or Google AI Overviews _"what's the best plastic surgeon in Miami for a mommy makeover?"_, four things happen. Each is a lever.

| Stage                | What happens                                                                                                                                                            | Our lever                                                                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Retrieval**     | The query is rewritten into 3–8 search queries and run against an index — Bing for ChatGPT/Copilot, Google for Gemini/AI Overviews, a hybrid for Perplexity and Claude. | Classic ranking still decides whether we're in the candidate set. **Bing is the neglected half** — most clinics ignore it and ChatGPT runs on it. |
| **2. Fetch**         | The engine fetches the top ~5–15 URLs. **None of these crawlers execute JavaScript.**                                                                                   | Everything that matters must be in the server HTML. This is why #118 is blocking.                                                                 |
| **3. Extraction**    | The model pulls facts it can state confidently: numbers, definitions, comparisons, structured data. Prose paragraphs are lossy; tables and direct answers are not.      | Answer format. §4.                                                                                                                                |
| **4. Corroboration** | Claims confirmed across multiple independent sources get stated; single-source claims get hedged or dropped.                                                            | Third-party presence. §6. This is the one most people skip and it may matter most.                                                                |

### The three failure modes, and where we sit

| Failure                                                                                                  | Status                                                                              |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Not retrieved** — we don't rank for the conversational query                                           | ⚠️ Partial. We rank for some blog terms, weakly for money terms.                    |
| **Retrieved but not extractable** — page fetched, nothing usable pulled out                              | 🔴 **Severe.** Zero server-rendered schema. AI crawlers get prose and nothing else. |
| **Extracted but not trusted** — facts pulled, but no corroboration, so the model recommends someone else | 🔴 **Severe.** 49 Google reviews, thin third-party footprint.                       |

We are failing at stages 2, 3 and 4 simultaneously. The good news is that stage 2 is a 15-minute fix and stage 3 is a content-format discipline we can apply immediately.

---

## 2. What We Already Have

Genuinely ahead of the field here — do not regress any of it:

- **`/llms.txt` and `/llms-full.txt`** live and well-structured
- **`robots.txt` explicitly allows** GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Google-Extended, Bingbot
- **Deep, well-structured procedure content** — the breast-aug page at 3,772 words with cost, candidacy, comparison and week-by-week recovery blocks is _exactly_ the shape LLMs cite
- **`Speakable` schema pattern** already exists (`cssSelector: ["h1", ".procedure-intro", ".quick-answer"]`) — just not applied everywhere
- **Honest `aggregateRating`** computed from live review data, not hardcoded
- **Fast TTFB** (0.23–0.25s) — matters for crawler budget
- **Homepage fly-in section already corrected to US-domestic** (`medical-tourism.component.tsx:77-84`)

## 3. What's Broken

| #   | Problem                                                                                                                                                                                                                                              | Fix                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| G1  | **Zero server-rendered JSON-LD.** AI crawlers see no entities at all.                                                                                                                                                                                | [#118](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/118) |
| G2  | **Wrong geography declared.** `areaServed` still says Latin America + Caribbean in 6 files; `llms-full.txt` lists "Brazil, Colombia, Venezuela, Mexico" as served markets. This tells every LLM we're a foreign-inbound clinic.                      | [#118](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/118) |
| G3  | **`packages/ai` prompts are contaminated** — 4 prompt files instruct every generated blog post, gallery caption and image brief that we serve "medical tourists from Latin America/Caribbean". Every future piece of content inherits the wrong ICP. | Rewrite prompts to the US ICP                                               |
| G4  | **No `dateModified`, no visible "Last updated"** on most pages. Freshness is a top-3 citation signal.                                                                                                                                                | §5                                                                          |
| G5  | **No named medical reviewer** on blog posts. This is YMYL content; unattributed medical claims are heavily discounted.                                                                                                                               | §5                                                                          |
| G6  | **Comparisons written as prose, not tables.** Models extract tables reliably and paragraphs unreliably.                                                                                                                                              | §4                                                                          |
| G7  | **Thin third-party footprint.** 49 Google reviews, no RealSelf/Healthgrades presence, no press. Nothing to corroborate against.                                                                                                                      | §6                                                                          |
| G8  | **Bing ignored.** ChatGPT's retrieval runs on Bing. No Bing Webmaster Tools baseline.                                                                                                                                                                | §5                                                                          |

---

## 4. The Answer-Format Standard

Apply to every new page and retrofit to existing money pages. This is the single highest-leverage content change available.

### 4.1 Quick Answer block — mandatory, first screen

40–70 words, above the fold, directly answering the page's primary query in complete sentences that stand alone when lifted out of context.

```
A Brazilian Butt Lift in Miami costs $4,500–$8,500 depending on the
volume of fat transferred and whether liposuction of multiple areas is
included. At Alluring Plastic Surgery, BBL starts at $X all-inclusive —
surgeon fee, accredited facility, board-certified anesthesiologist,
garments and all follow-up visits. Financing runs from $Y per week.
```

Rules: lead with the number. Never open with "At Alluring, we believe…". Never require the previous sentence for context. Wrap it in `.quick-answer` and point `Speakable` schema at it.

### 4.2 Real HTML tables for every comparison

Not `<div>` grids, not prose. Tables are the highest-fidelity extraction format there is.

Every one of these becomes a table: procedure vs procedure, our price vs Miami average, implant types, recovery timelines, candidacy criteria, what's included vs what's extra.

### 4.3 Question-shaped H2s

Match the phrasing people actually type. `How much does a BBL cost in Miami?` beats `BBL Pricing`. Every question H2 gets a direct answer in the first sentence beneath it, then elaboration. Mirror them into `FAQPage` schema.

### 4.4 Numbers over adjectives

"Board-certified surgeons with 15+ years and 5,000+ procedures" is citable. "World-class expertise" is not. Every claim on the site should either carry a number or be deleted.

### 4.5 State the negative case

Pages that say who is _not_ a good candidate, what the risks are, and when a cheaper option is better get cited disproportionately — models treat balanced sources as more reliable. It also happens to be true and ethical, and it directly attacks CG's uniformly promotional tone.

---

## 5. Technical GEO Checklist

| #   | Task                                                                  | Notes                                                                                                                                                                                         |
| --- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | **Server-render all JSON-LD**                                         | [#118](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/118). Blocking.                                                                                                        |
| T2  | **Fix `areaServed` to the US set**                                    | `['Miami', 'Miami-Dade County', 'South Florida', 'Florida', 'United States']`                                                                                                                 |
| T3  | **Rewrite `packages/ai` prompts** to the US ICP                       | 4 files. Prevents ongoing contamination.                                                                                                                                                      |
| T4  | **`dateModified` in schema + visible "Last updated"** on every page   | Freshness signal. Also where CG is dead — their last blog post is 2023-02-02.                                                                                                                 |
| T5  | **`author` + `reviewedBy` on all medical content**                    | `Physician` entity, board certification via `EducationalOccupationalCredential`. Non-negotiable for YMYL.                                                                                     |
| T6  | **`Speakable` on all `.quick-answer` blocks**                         | Pattern already exists on the breast-aug page — generalize it.                                                                                                                                |
| T7  | **`Offer` schema with real prices** on every procedure page           | `price`, `priceCurrency`, `priceValidUntil`                                                                                                                                                   |
| T8  | **Expand `llms.txt` / `llms-full.txt`**                               | Full pricing table, surgeon credentials with board names, financing terms, US service geography. Remove all LatAm/Caribbean references. Add `<link rel="llms" href="/llms.txt">` to `<head>`. |
| T9  | **Register Bing Webmaster Tools; submit sitemaps; use IndexNow**      | ChatGPT retrieval runs on Bing. Currently unmeasured.                                                                                                                                         |
| T10 | **`VideoObject` schema per testimonial video**                        | CG has 82 of these. Video is heavily weighted in AI answers about providers.                                                                                                                  |
| T11 | **`ImageObject` with descriptive captions on before/after galleries** | Turns 103 thin media pages into extractable evidence                                                                                                                                          |

---

## 6. Corroboration — The Lever Nobody Pulls

Stage 4 of §1. **An LLM will not name us as "the best" on the strength of our own website, no matter how good it is.** It names whoever is consistently described that way across independent sources.

| Action                                                       | Why it moves AI answers specifically                                                                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Google reviews 49 → 300+**                                 | Review count is quoted directly in AI provider recommendations and it gates the local pack that feeds Google AI Overviews                         |
| **Claim RealSelf, Healthgrades, Vitals, Zocdoc, Yelp**       | These are the exact domains retrieved for "best plastic surgeon in [city]" — a clinic absent from them is invisible at stage 1                    |
| **Get BBB accredited**                                       | Cheap trust signal. **CG is not accredited** and carries a 1.3/5 ComplaintsBoard rating — a direct, factual differentiator                        |
| **20+ video testimonials**                                   | Corroborated patient experience; also the format CG uses to dominate                                                                              |
| **Original data — "Miami Plastic Surgery Cost Report 2026"** | Original statistics are the most-cited content type in LLM answers. Nobody can corroborate a number they can only get from you — so they cite you |
| **Local press / podcast placements**                         | Independent-source mentions are what turn a clinic from "a clinic" into a named entity                                                            |
| **Consistent NAP everywhere**                                | Entity resolution. Any mismatch splits us into two weaker entities. Single-source from `site-config.ts`.                                          |

**Realistic expectation:** Sections 4 and 5 make us _extractable_. Section 6 makes us _recommended_. Only §6 closes the gap with a 15-year-old competitor holding 11,748 reviews, and it's the slowest of the three. Start it in week 1 and run it continuously.

---

## 7. Pages to Add

> **Hard rule.** We are `noindex`-ing 909 thin pages in [#118](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/118). Do not recreate the problem. **Every page below must clear 1,500+ words of genuinely unique content, one Quick Answer block, at least one table, and question-shaped H2s — or it doesn't ship.** Twelve excellent pages beat sixty templated ones, and the sixty would actively hurt.

### Cluster A — Destination Comparison 🥇 **Highest-value untapped opportunity**

**The strategic insight:** a US patient's real alternative to us is not another Miami clinic — it's flying to the Dominican Republic, Colombia, Mexico or Turkey for half the price. Those queries carry enormous volume, are asked of LLMs constantly, and are currently answered by content farms, Reddit threads and horror stories. No Miami clinic is competing for them credibly. CG doesn't touch this.

Winning here captures the patient at the _consideration_ stage, before they've shortlisted any clinic, and positions Miami as the safe domestic choice. It is also the cluster where honest, balanced writing wins outright — and it converts our US-domestic focus from a constraint into the actual pitch.

| URL                                            | Primary query                                         |
| ---------------------------------------------- | ----------------------------------------------------- |
| `/miami-vs-dominican-republic-plastic-surgery` | "is it safe to get surgery in the dominican republic" |
| `/miami-vs-turkey-plastic-surgery`             | "plastic surgery turkey vs usa"                       |
| `/miami-vs-colombia-plastic-surgery`           | "medical tourism colombia bbl safe"                   |
| `/miami-vs-mexico-plastic-surgery`             | "tijuana plastic surgery vs usa"                      |
| `/medical-tourism-risks-what-to-know`          | "medical tourism plastic surgery risks"               |

**Required content:** a real cost table (theirs vs ours, all-in including flights, lodging, revision risk and complication cost); malpractice recourse and licensing differences; what happens if there's a complication after you fly home; **honest acknowledgment of where abroad genuinely is cheaper**. The balanced version is the one that gets cited — and it's the true one.

### Cluster B — Cost & Financing 🥇 **Where CG beats us today**

CG's title tag is literally `Breast Augmentation Miami | From $2,500 at CG Cosmetic`. `cost` / `price` / `cheap` / `affordable` / `financing` are the highest-volume modifiers in this vertical and the most common AI query shape. We currently rank here only via a blog post.

| URL                                | Primary query                                   |
| ---------------------------------- | ----------------------------------------------- |
| `/plastic-surgery-cost-miami`      | **Hub.** "how much is plastic surgery in miami" |
| `/bbl-cost-miami`                  | "how much does a bbl cost"                      |
| `/tummy-tuck-cost-miami`           | "tummy tuck cost miami"                         |
| `/breast-augmentation-cost-miami`  | "boob job cost miami"                           |
| `/mommy-makeover-cost-miami`       | "mommy makeover cost"                           |
| `/liposuction-cost-miami`          | "lipo cost miami"                               |
| `/plastic-surgery-payment-plans`   | "plastic surgery payment plans bad credit"      |
| `/plastic-surgery-financing-miami` | _exists_ — add tables + Quick Answer            |

**Required content:** exact all-inclusive price; explicit what's-included / what's-extra table; our price vs Miami average vs US average; weekly financing figure (single-source from `weekly-payments.data.ts`); honest note on when insurance does cover (breast reduction, post-mastectomy reconstruction, some panniculectomy).

### Cluster C — Safety & Trust 🥇 **Attacks CG's exposed flank**

CG carries a 1.3/5 ComplaintsBoard rating, no BBB accreditation, and an indexed patient-death story. Safety is where they cannot compete and where AI engines apply the heaviest E-E-A-T weighting.

| URL                                   | Primary query                                                              |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `/bbl-safety-what-you-need-to-know`   | "is a bbl safe" / "bbl death rate" — very high volume, genuinely important |
| `/how-to-choose-a-plastic-surgeon`    | "how to find a good plastic surgeon"                                       |
| `/board-certification-explained`      | "abps vs abcs" / "what does board certified mean"                          |
| `/accredited-surgical-facility-miami` | "aaaasf accredited surgery center"                                         |
| `/plastic-surgery-red-flags`          | "plastic surgery warning signs"                                            |
| `/plastic-surgery-safety-standards`   | "is plastic surgery safe"                                                  |

**Required content:** real statistics with sources; what accreditation actually means (AAAASF/AAAHC/Joint Commission); anesthesia provider credentials; complication rates stated honestly; the specific questions to ask _any_ surgeon. Write it so it's useful even to someone who chooses a different clinic — that's what makes it citable.

### Cluster D — Procedure Comparison

Pure LLM fuel. "X vs Y" is one of the most common AI query shapes and these are decision-stage, high-intent.

| URL                                        | Primary query                          |
| ------------------------------------------ | -------------------------------------- |
| `/bbl-vs-fat-transfer`                     | "bbl vs fat transfer difference"       |
| `/tummy-tuck-vs-liposuction`               | "tummy tuck or lipo which is better"   |
| `/breast-augmentation-vs-breast-lift`      | "do i need implants or a lift"         |
| `/mini-tummy-tuck-vs-full-tummy-tuck`      | "mini vs full tummy tuck"              |
| `/mommy-makeover-vs-separate-procedures`   | "mommy makeover or separate surgeries" |
| `/silicone-vs-saline-implants`             | "silicone or saline which is better"   |
| `/bbl-vs-butt-implants`                    | "bbl vs implants"                      |
| `/surgical-vs-nonsurgical-body-contouring` | "coolsculpting vs liposuction"         |

**Required content:** one decision table (cost, recovery, longevity, ideal candidate, risks), an explicit "choose A if… / choose B if…" block, and a straight answer to which is more popular and why.

### Cluster E — US Geography _(replaces the deleted Spanish/LatAm phase)_

Two tiers. **Build 12 real pages, not 50 templated ones.**

**E1 — Florida drive market** (patients who can drive in, day-of consultation):

`/plastic-surgery-fort-lauderdale` · `/plastic-surgery-west-palm-beach` · `/plastic-surgery-boca-raton` · `/plastic-surgery-naples-fl` · `/plastic-surgery-tampa` · `/plastic-surgery-orlando`

Unique content required: drive time and route, parking and facility access, same-day consultation availability, follow-up schedule for a drive-in patient, patient stories from that market.

**E2 — US fly-in feeder markets** (grounded in the markets already listed in `medical-tourism.component.tsx`):

`/plastic-surgery-miami-from-new-york` · `/from-atlanta` · `/from-chicago` · `/from-dallas` · `/from-houston` · `/from-boston` · `/from-los-angeles` · `/from-nashville`

> ⚠️ **Scope boundary — see `CLAUDE.md`.** The practice does **not** coordinate travel: no flights, lodging, transport, airport pickup, and no affiliation with any recovery house or recovery suite. These pages are **informational only**. They may describe flight duration and how many nights a patient needs to stay; they may **not** recommend hotels, imply booking assistance, or reintroduce "concierge" language. What we actually provide is clinical and should be stated plainly: confirmed surgery date, pre-op and follow-up appointments in writing, and how many nights in Miami before clearance to fly home.

Unique content required per city: nonstop route availability and flight duration, how many nights in Miami by procedure, when clearance to fly home typically comes, how follow-up works once the patient is home, and patient stories from that market. **This must be real, city-specific information, not a name swapped into a template** — a templated version is a Phase 1 violation and would undo [#118](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/118).

**E3 — Fly-in logistics hub** (supports all of E2):

| URL                                        | Primary query                                                    |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `/can-i-fly-after-plastic-surgery`         | "how long before I can fly after surgery" — high AI query volume |
| `/how-long-to-stay-in-miami-after-surgery` | "how many days do I need to stay"                                |
| `/traveling-for-plastic-surgery-guide`     | "what to pack for plastic surgery trip"                          |
| `/fly-in-consultation`                     | _exists_ — add Quick Answer + tables                             |

Same boundary applies: these answer clinical and timing questions (clearance to fly, nights required, DVT precautions, what to bring to a post-op visit). They do not offer or imply travel arrangement.

### Cluster F — Missing Procedure Pages

We have 9 procedure pages; CG has ~25. Uncontested volume, ordered by opportunity:

`/procedures/rhinoplasty-miami` (top-5 volume in this market, we have **nothing**) · `/procedures/gynecomastia-miami` · `/procedures/breast-implant-removal-miami` (explant — fast-growing intent) · `/procedures/breast-revision-miami` · `/procedures/arm-lift-miami` · `/procedures/thigh-lift-miami` · `/procedures/neck-lift-miami` · `/procedures/skin-tightening-renuvion-miami`

Match the existing breast-aug page depth — it's already best-in-class and better than CG's.

### Cluster G — Candidacy & Recovery

Blog-tier for most, but these five earn dedicated pages:

`/am-i-a-candidate-for-a-bbl` (BMI requirements — asked constantly) · `/am-i-a-candidate-for-a-mommy-makeover` · `/bbl-recovery-timeline` · `/tummy-tuck-recovery-timeline` · `/plastic-surgery-after-weight-loss` (supports the existing `/after-weight-loss-consultation`; GLP-1 weight loss has made this a surging query cluster)

### Cluster H — Entity Strengthening

Not new pages — upgrades to existing ones. These make us a resolvable _entity_ rather than a website.

- **Surgeon pages** (`/dr-karlinsky`, `/dr-rita-shats`) — full `Physician` schema, board name and certification number, training history, memberships, publications, procedure specialties, `sameAs` to every profile
- **`/reviews`** — add `VideoObject` per testimonial, keep `aggregateRating` honest and live
- **`/about`** — facility accreditation, anesthesia team credentials, technology, founding story with dates
- **New: `/our-results-data`** — anonymized outcome statistics, revision rate, complication rate, average patient satisfaction. Original data, nobody else in the Miami market publishes it, and it is the single most citable asset we could own.

---

## 8. Sequencing

| Wave           | Weeks     | Contents                                                                                                                                                                  | Rationale                                                     |
| -------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **0**          | 1         | [#118](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/118): server-render JSON-LD, `noindex` thin pages, fix `areaServed`, rewrite `packages/ai` prompts | Nothing below is visible to AI crawlers until this ships      |
| **1**          | 2–4       | Cluster B (cost) + Quick Answer / table retrofit on the 9 existing procedure pages + Bing Webmaster Tools                                                                 | Highest commercial intent, and it's where CG beats us today   |
| **2**          | 4–8       | Cluster A (destination) + Cluster C (safety)                                                                                                                              | Biggest untapped opportunity + attacks CG's weakest flank     |
| **3**          | 8–12      | Cluster D (comparison) + Cluster F (rhinoplasty, gynecomastia, explant first)                                                                                             | Pure LLM fuel + uncontested search volume                     |
| **4**          | 12–20     | Cluster E (geography) + Cluster G (candidacy/recovery)                                                                                                                    | Slower payoff; depends on E2 pages being genuinely researched |
| **5**          | 16–24     | Cluster H + `/our-results-data` + cost report                                                                                                                             | Entity strength and original data compound over time          |
| **Continuous** | from wk 1 | §6 corroboration — reviews, directories, BBB, video, press                                                                                                                | Slowest lever, largest ceiling. Start immediately.            |

---

## 9. Measurement

There is no Search Console for AI engines. Measure manually and consistently.

**Monthly citation audit.** Run this fixed query set against ChatGPT, Claude, Perplexity, Gemini and Google AI Overviews. Record: are we mentioned, are we linked, what facts about us are stated, and are they correct.

```
best plastic surgeon in miami
how much does a bbl cost in miami
affordable plastic surgery miami financing
is it safe to get plastic surgery in the dominican republic
plastic surgery miami vs turkey
best mommy makeover surgeon miami
how long do I need to stay in miami after a tummy tuck
is a bbl safe
plastic surgeon miami payment plans
board certified plastic surgeon miami
```

| Metric                                              | Baseline (2026-08-03) | 3 mo    | 12 mo   |
| --------------------------------------------------- | --------------------- | ------- | ------- |
| Server-rendered JSON-LD blocks / procedure page     | **0**                 | ≥ 8     | ≥ 8     |
| Files declaring non-US `areaServed`                 | **6**                 | 0       | 0       |
| AI citations across the 10-query set                | unmeasured            | ≥ 3     | ≥ 7     |
| Pages with a Quick Answer block                     | ~1                    | 25      | 60      |
| Pages with `dateModified` + visible last-updated    | 0                     | all     | all     |
| Google reviews                                      | 49                    | 120     | 300+    |
| Third-party profiles claimed                        | ~2                    | 10      | 20+     |
| Bing indexed pages                                  | unmeasured            | tracked | tracked |
| New pages shipped (all clearing the §7 quality bar) | 0                     | 14      | 40      |

**Watch for wrong facts.** If an AI states something incorrect about us — wrong price, wrong location, wrong credentials, or that we serve Latin America — that traces back to a specific source we control. Fix the source, then re-test in 4–6 weeks.
