# Search, answers and AI citations (SEO · AEO · GEO)

The same page has to rank in Google, answer in featured snippets and voice,
and be the passage AI assistants quote. The three pull in one direction:
answer the real question first, with sourced specifics, in clean structure,
and say the same thing everywhere the site says it.

## 1. Evidence from Search Console

Use the `search-console` skill (MCP server `search-console`). The property is
the **www** host: `https://www.alluringplasticsurgery.com/procedures/<slug>`.

- `queries_for_page` for 90 and 180 days; `page_trend` weekly; `pages_for_query`
  on the head term and the cost term to spot cannibalization with blog posts.
- Cluster the queries: local head ("<procedure> miami"), cost/price, surgeon
  ("best … surgeon miami"), safety, recovery, variants (mini, lipo 360,
  skinny…), "near me", Spanish. For each: impressions, clicks, position,
  what the page should do.
- Read the keyword registry (`packages/shared/src/seo/keyword-ownership-blog.constant.ts`):
  which clusters this page owns, and which belong to a post. Summarize and
  link to the owner; don't compete with it.
- Note AI-assistant-style long queries ("best board-certified … with high
  safety standards and natural outcomes"). They show what the answer has to
  contain.

Keep the numbers in the brief and the PR, so day 28/56 can be compared.

## 2. On the page

- **URL and canonical never change.** The `#pricing` anchor stays.
- **H1** is `procedure.title`. **Title** (`seoTitle`) and H1 don't change in the
  same deploy as the redesign unless the data says they're wrong; if they
  must, say why in the PR, so the effects can be told apart.
- **Meta description** (`metaDescription`, ≤ 160 characters, clamped by
  `clampMetaDescription`): written for the click on the cluster the page is
  closest to page one for (for BBL, cost). Price, the named surgeon with MD,
  the one safety fact competitors can't claim, "Free consultation". No
  "board-certified". It also feeds `og:description` and `twitter:description`.
- **H2s are the questions people search**, word for word where the query is
  natural ("How much does a tummy tuck cost in Miami?").
- **Answer first**: a 40–60-word direct answer under every question H2
  (`AnswerBlock`); the sweep checks the count. This is the featured-snippet,
  voice and AI-passage format.
- **Tables for facts** (`FactTable`: a real `<table>` with row headers, one
  fact per row, units stated). Numbered lists for steps.
- **No keyword bolding.** Descriptive link text ("BBL recovery week by week",
  never "click here").
- **Alt text** describes the picture, never a keyword list. AI renders get
  the label in the caption, not in the alt.
- **Images**: `procedure.image` is the 16:9 wide render (og:image, home card,
  landing hero, sitemap). Every image has real width and height.

## 3. FAQ

- 10–14 distinct questions, from the queries and from what the body doesn't
  answer. Merge duplicates; one definition site-wide (point `quickAnswer` at
  the same wording as the "What is …?" answer).
- Include the price question even though the paid landing page drops it
  (`PRICING_TERMS` matches question _and_ answer). Keep pricing terms out of
  every other answer ("what volume", not "how much").
- Answer first; link to the post that owns the details.
- The FAQPage node must equal the visible FAQ, which it does when both read
  `procedure.faqs`.

Google limits FAQ rich results to authoritative government and health sites
(2023) and retired HowTo rich results. The markup stays because machines read
it, not for stars in the SERP.

## 4. Structured data: one graph

`buildProcedureGraph` (`lib/seo/procedure-graph.util.ts`) emits one `@graph`
with stable `@id`s:

| Node                             | What feeds it                                                                                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MedicalWebPage` `#webpage`      | title, description, `dateModified` (real, never "now"), `speakable` (`h1`, `.procedure-intro`, `.quick-answer`)                                                       |
| `BreadcrumbList`                 | the route                                                                                                                                                             |
| `FAQPage`                        | `procedure.faqs`                                                                                                                                                      |
| `SurgicalProcedure` `#procedure` | `bodyLocation` (set it per procedure), `howPerformed` from `process`, `followup` from `quickStats.recovery`                                                           |
| `Service` `#service`             | `provider` = the clinic and, when the page names her, the surgeon; `Offer` with `minPrice`/`maxPrice` from `pricing`                                                  |
| `MedicalClinic` `#organization`  | `siteConfig`; `employee` = the surgeon                                                                                                                                |
| `Person` `/dr-karlinsky#person`  | `karlinskyPersonNode`: MD, FACS, `hasCredential` for ABS, FACS and the Florida license; no ABCS node (its Florida statement has nowhere to go), no `medicalSpecialty` |

Register the surgeon for the page in `procedure-page-registry.ts`
(`procedureSurgeons`) only when the copy names her. Add `reviewedBy` and
`lastReviewed` only after a real medical review has happened and been
recorded (`ReviewedBy` component, same date). No `Review` or
`AggregateRating` markup: a business's own reviews aren't eligible, and it's
dead weight.

Count JSON-LD `<script type="application/ld+json">` tags, not string matches:
the RSC payload repeats them.

## 5. Everywhere the site says it

AI engines read the whole site and pick one version when two pages disagree.
In the same PR, make these agree with the page:

- The data file fields other surfaces read: `shortDescription`, `benefits`,
  `quickStats`, `quickAnswer`, `description`, `faqs`, `pricing`.
- `/llms.txt` and `/llms-full.txt` (they read the data file; check the output).
- The paid landing page `/landing/procedure/<slug>` (hero image, stats, FAQs).
- Credentials anywhere they appear (#248 tracks the site-wide wording).

Grep the served HTML, including the RSC payload, for prices and figures that
don't belong to this procedure: client components handed whole `Procedure`
objects once leaked another page's prices into the BBL page, and three AI
engines quoted them.

## 6. Links

- **In from the blog.** The procedure's informational posts often outrank
  the page by far. Add one contextual link per ranking post, with varied
  anchors ("tummy tuck in Miami", "what a tummy tuck costs in Miami"). These
  are production content edits: prove the SQL on a `--db clone` worktree,
  restore `content_updated_at` in a second UPDATE, and hand the user the
  `! psql` line. The long-term fix is the pipeline's internal-pages list
  (`packages/ai/src/data/internal-pages.data.ts`).
- **Out to the owners.** Recovery details, comparisons and variants link to
  the posts that own them; money questions link to
  `/plastic-surgery-financing-miami` and `/miami-plastic-surgery-specials`;
  out-of-state readers to `/fly-in-consultation`; results to the gallery
  group, which should link back.

## 7. What gets a page cited by AI

From the GEO study (Aggarwal et al., KDD 2024) and what the BBL competitor
sweep saw in AI answers:

- **Sources, statistics and quotations** raised generative-engine visibility
  most. Keyword stuffing didn't help.
- Engines repeat whichever page states **one crisp number** (a price, a
  recovery time). State yours, sourced, in a sentence that stands alone.
- The pages AI answers cite have a **dated, named medical reviewer** and a
  real update date. Add the reviewer only when the review is real.
- **Entities**: the named surgeon as a `Person` with credentials, linked to
  the clinic.
- **Consistency** across the page, `llms*.txt`, FAQs, the landing page and the
  Google Business Profile.
- Crawlers: `robots` already allows GPTBot, OAI-SearchBot, ClaudeBot,
  PerplexityBot and Google-Extended.

**Measure it.** Before launch and monthly after, run a fixed prompt panel
(3 runs each, in ChatGPT, Perplexity, Google AI Mode and Gemini): the cost,
safety, recovery, surgeon and "<procedure> Miami" questions, plus the brand
query. Record whether Alluring is cited and which URL. The BBL baseline is in
`implementation-plans/2026-09-16-bbl-page-rebuild/baseline/`.

## 8. Leave alone

- Title and H1, until the post-launch read says otherwise.
- FAQ rich-result chasing, review stars, HowTo markup.
- Separate thin pages for small variants (≈35 impressions a month each):
  an H3 on this page covers them.
- Discount-style pricing ("this week only", "$X off"). Explaining why some
  offers cost less converts this audience better.
