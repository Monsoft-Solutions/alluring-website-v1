---
name: procedure-page
description: Rebuild one procedure page (/procedures/<slug>) as its own page module, the way the BBL page was rebuilt in #256/#265/#266 — audience psychology, an immersive layout, SEO/AEO/GEO, conversion, regenerated images, the procedure's own gallery photos and reviews, a sourced facts file, a copy sweep and a verified PR. Also reviews an already-rebuilt page. Use when the user says "do the tummy tuck page", "rebuild the facelift page like the BBL one", "review the breast augmentation page", or "/procedure-page <slug>".
argument-hint: <procedure-slug> [review]
---

# Procedure page rebuild

One procedure page, end to end: evidence → strategy → facts and copy →
design → images, gallery and reviews → build → verify → PR. The BBL page is the
worked example for every step; read its code before designing anything.

`$0` is the procedure slug (`tummy-tuck-miami`, `mommy-makeover-miami`, …).
With `review` as `$1`, skip to [Review mode](#review-mode).

**The page has one job:** turn a woman researching this procedure — a South
Florida local or a patient flying in from another US state — into a
consultation request, and be the source Google and AI assistants quote for
Alluring's price, safety standard, surgeon and recovery for this procedure.

## Read first

| What                                                                  | Where                                                                |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Who she is, what she fears, what moves her                            | [reference/audience-psychology.md](reference/audience-psychology.md) |
| Section order, first screen, calls to action, forms                   | [reference/page-blueprint.md](reference/page-blueprint.md)           |
| Immersive design system, motion, performance                          | [reference/immersive-design.md](reference/immersive-design.md)       |
| Search Console, titles, answers, FAQ, JSON-LD, llms.txt, AI citations | [reference/search-and-answers.md](reference/search-and-answers.md)   |
| Florida advertising rules, credentials, prices, photos, reviews       | [reference/compliance.md](reference/compliance.md)                   |
| Builds, sweeps, browser pass, measurements                            | [reference/verification.md](reference/verification.md)               |
| Review artifact structure                                             | [reference/review-mode.md](reference/review-mode.md)                 |
| Per-procedure inventory and research questions (dated)                | [reference/starting-points.md](reference/starting-points.md)         |

The worked examples, `apps/web/`: the BBL and liposuction pages, built on
the shared module kit.

| File                                                                         | What it shows                                                                                                |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `components/procedures/pages/bbl/bbl-page.component.tsx`, `…/lipo/…`         | Section order, data fetching, jump links, sticky bar; each page's copy passed to the kit                     |
| `components/procedures/module-kit/module-hero.component.tsx`                 | First screen: H1, surgeon-naming lede, trust row, chips, CTA pair (the page passes lede, chips, image, card) |
| `…/module-results.component.tsx`                                             | Real results right after the hero; `selectResultPhotos`, the page's own caption function                     |
| `…/module-quick-quote.component.tsx`, `…/module-book.component.tsx`          | Two-field form at peak intent; full form, location and hours from `siteConfig`                               |
| `…/module-scene.component.tsx`                                               | The one dark band (`ModuleScene`) and the ask-any-surgeon bridge; the diagram is the page's own              |
| `…/module-surgeon.component.tsx`                                             | Credentials exactly as held, each linked to the board's record                                               |
| `…/module-price.component.tsx`                                               | Inclusions, what moves the price, financing and offers links, "Get your exact price"                         |
| `…/module-reviews.component.tsx`, `…/module-faq.component.tsx`               | Procedure reviews first (heading claims only what they back); the FAQ from `procedure.faqs`                  |
| `…/module-steps.component.tsx`, `…/module-sources.component.tsx`             | Numbered steps, the recovery timeline and guide links; the sources list                                      |
| `…/module-layout.component.tsx`, `module-ui.constant.ts`                     | Jump nav, bands with the fact rail, type and button tokens, `AI_MODEL_LABEL`                                 |
| `…/module-kit.css`                                                           | All shared motion and page-level rules, classes `pm-*`                                                       |
| `pages/bbl/bbl-safety.component.tsx`, `pages/lipo/lipo-safety.component.tsx` | Two signature scenes: the buttock layers; Florida's liposuction limits as a to-scale measure                 |
| `components/procedures/sections/*`                                           | Shared primitives: `AnswerBlock`, `FactTable`, `SourcesList`, `StickyCtaBar`, `PriceRange`, `ReviewedBy`     |
| `lib/data/procedures/facts/bbl.facts.ts`                                     | Every publishable figure, its source and attribution                                                         |
| `lib/procedures/procedure-page-registry.ts`                                  | Module and surgeon-node registration                                                                         |
| `lib/seo/procedure-graph.util.ts`, `lib/seo/surgeon-graph.util.ts`           | The page's one JSON-LD `@graph`                                                                              |
| `scripts/check-procedure-copy.ts` + `procedure-copy.config.ts`               | The copy sweep and each page's config                                                                        |
| `scripts/audit-procedure-assets.ts`                                          | Gallery and review inventory for any procedure                                                               |

The review that shaped the current BBL page is
https://claude.ai/artifact/Q5UBQFeDqj7KTL65TRTvhp. Read it with the Artifact
tool (`action: "read"`), never WebFetch.

## Phase 0 — Preflight

1. `pwd && git branch --show-current`. Work in a worktree on its own branch
   (`pnpm worktree feat/<short>-page-module <issue>`), never on `master` and never
   in the main checkout. Check the branch again right before every commit:
   other sessions switch branches.
2. Read `MEMORY.md` and the memories it links for this area:
   `bbl-page-redesign-plan`, `surgeon-board-certification-conflict`,
   `page-copy-lives-in-section-components`, `content-sweep-residual-checks`,
   `landing-page-drops-faqs-with-pricing-terms`, `procedure-quickstats-propagate`,
   `ai-engines-quote-leaked-card-prices`, `playwright-mcp-shared-with-subagents`.
3. **Control group.** The pages still on the shared template are the control
   for the #260 measurement of the BBL rebuild. Rebuilding one ends its time
   as a control. Say so to the user before the PR merges, not as a blocker.
4. List what only the owner can answer for this procedure (see
   [compliance](reference/compliance.md#owner-claims)). Ask all of it in one
   message, early. Build around what's missing; never invent the answer.

## Phase 1 — Evidence

Gather before deciding anything. Delegate the independent reads in parallel
(an `Explore` agent for code, a general agent for the competitor sweep with
WebSearch/WebFetch only, **no browser**), and keep the browser for yourself.

- **Search Console** (`search-console` skill; the property is the **www**
  host). The page's 90- and 180-day queries, clustered by intent (head term,
  cost, surgeon, safety, recovery, variants, Spanish); weekly position trend;
  the blog posts that own the procedure's informational clusters, and the
  keyword registry (`packages/shared/src/seo/keyword-ownership-blog.constant.ts`).
- **The live page**: fetch the HTML with curl (including the RSC payload),
  render it at 390 and 1440 (chrome-devtools with an `isolatedContext`), and
  measure section offsets. Grep the served HTML for prices, figures and
  credential wording, not only the visible text.
- **Assets**: `pnpm --filter web audit:procedure-assets --slug $0 --prod`
  (read-only). The gallery group the page reads, misfiled photos, duplicates,
  unpublished Instagram candidates, before/after pairs, and every review that
  names the procedure.
- **Data file consumers**: `lib/data/procedures/$0.data.ts` feeds `llms.txt`,
  `llms-full.txt`, the paid landing page, procedure cards, the home page,
  the sitemap and the quiz. Grep each field you plan to change.
- **Market**: 6–8 Miami competitor pages for this procedure plus the
  authorities AI answers cite (ASPS, The Aesthetic Society, Cleveland Clinic,
  RealSelf). What they claim, what price they anchor, what none of them has.
- **Sources**: find the authoritative page for every figure you expect to
  publish (recovery, results, risks, price benchmarks, law) and read it.

## Phase 2 — Strategy brief · Gate 1

Write a one-page brief and get it approved before any copy or code:

- Her top questions for this procedure, in her words (from queries and
  reviews), and the fears and desires under them
  ([audience psychology](reference/audience-psychology.md)).
- The page's promise and proof inventory: what Alluring can show that the
  competitors can't (real results, the named surgeon, sourced numbers, the
  law, inclusions), and what's missing.
- Section order with each section's job and its call to action
  ([blueprint](reference/page-blueprint.md)), and the **signature scene**: the
  one content-shaped visual idea only this procedure has
  ([design](reference/immersive-design.md#signature-scene)).
- Query → H2 map, the meta description, FAQ list (10–14), what is summarized
  here and linked to the post that owns it.
- Image shot list (reuse what's good, regenerate the rest).
- Gallery and review plan from the asset audit.
- Owner questions still open.

Present it as an artifact when it has diagrams or a section-order sketch
(load `artifact-design` first); otherwise in chat. Use AskUserQuestion for
genuine forks only.

## Phase 3 — Facts and copy · Gate 2

1. **Facts file** `lib/data/procedures/facts/<short>.facts.ts`, shaped by
   `procedure-facts.ts`: every figure with its unit, the concept words that
   license it, the verbatim-safe statement, source ids and the attribution
   the copy must use. Read each source yourself; record what it does _not_
   say in `caveat`. The practice's own figures (price, surgery length) get the
   `alluring-practice` source.
2. **Copy lives in the section components** that lay it out, not in a content
   object. Data files keep only what other surfaces read.
3. Every question-phrased H2 opens with a 40–60-word direct answer
   (`AnswerBlock`). Short sentences, her words, no keyword bolding, no
   superlatives, figures only from the facts file.
4. Update the data file fields other surfaces read: `metaDescription`,
   `shortDescription`, `benefits`, `quickStats`, `quickAnswer`, `faqs`,
   `process`, `bodyLocation`, `dateModified`. New fields go into
   `procedureSchema` too, or zod drops them silently.

Show the user the copy (the rendered page is best) before moving on.

## Phase 4 — Design · Gate 3

Mock the first screen (390 × 844), the signature scene, results, cost and
booking at 390 and 1440 before building. Use the Design canvas type via
`Artifact` `quickstart` (intent `design`). The BBL canvas is
https://claude.ai/artifact/EairTjDsV2qHDfbMGoEYay. Follow
[immersive-design](reference/immersive-design.md). Get approval.

## Phase 5 — Images, gallery, reviews · Gate 4

- **Images**: run the `procedure-images` skill. It sets the shot list,
  generates candidates with GPT Image 2.5 on Higgsfield, asks the user to
  pick, then exports and uploads the finals to Blob. The
  `procedure-image-creator` agent can generate candidate batches, but the
  picks happen here, with the user.
- **Gallery**: from the audit, list for the owner what to publish, move or
  remove in the admin (Gallery): misfiled photos, duplicates, missing
  dimensions, Instagram imports of real results. Nothing that quotes a price;
  real patients with consent only. Gallery changes are production data: the
  admin is the path, or SQL proven on a `--db clone` worktree that the user
  runs. Never write production yourself.
- **Reviews**: the module reads **every** published review (not a pool of 40) and puts the ones that name the procedure first
  (`mentionsProcedure`). The heading claims procedure reviews only when every
  review shown names it. Translated reviews show Google's translation, marked
  as one (`readGoogleReviewText`).

## Phase 6 — Build

1. **Module** `apps/web/components/procedures/pages/<short>/`: server
   components, one file per section the page owns, and
   `<short>-page.constant.ts` for image records (`src`, `width`, `height`,
   `alt`). The page component imports `module-kit.css`; its root element
   carries `<short>-page pm-page` (the sweep reads inside `<short>-page`, the
   kit's timelines hang off `pm-page`), and it passes
   `className='pm-sticky-bar pr-[4.75rem]'` to `StickyCtaBar`. Add a
   `<short>-page.css` only for motion no kit class covers (`pm-draw-x`,
   `pm-draw-y`, `pm-unveil` usually do).
2. **Shared pieces** live in `components/procedures/module-kit/`: use them
   and pass the page's copy as props. Never import from another page's
   folder. When a kit piece needs to change, change it in its own commit and
   prove every existing module's prerendered HTML is unchanged (same build
   inputs; `diff` the `.html`, and compare the RSC payload's strings, which
   move when component boundaries change).
3. **Register** the module and its surgeon node in
   `lib/procedures/procedure-page-registry.ts` when the copy names the
   surgeon (`karlinskyPersonNode`).
4. **Sweep config**: add the page to `apps/web/scripts/procedure-copy.config.ts`
   (slug, name, `rootClass`, facts, sources, its own rules and identifiers).
5. **Motion** is CSS only, with text never animated from hidden. The client
   code stays at the forms and at most one small island.

## Phase 7 — Verify

Everything in [verification](reference/verification.md), and all of it must
pass: build, typecheck, lint, format, `check:procedure-copy --slug $0` in both
normal and `--launch` modes, `size:check`, the landing page FAQ count,
`/llms-full.txt`, the JSON-LD graph, a template page untouched, and the browser
pass at 390 and 1440 with measured offsets (first real result, first form
field, page height).

Then run [Review mode](#review-mode) on your own build, and fix everything
tagged before-merge.

## Phase 8 — Ship

Ask before committing. One PR per page, based on `master`, with: what changed
and why (psychology, SEO, conversion), the before/after measurements, every
check with its result, deviations from the brief and why, what's still waiting
on the owner (gallery moves, reviews to request, claims to confirm, prod DB
link edits), and the control-group note. End the body with the attribution
lines the session gives you.

After merge: request indexing in Search Console, and schedule the day-28/56
read (position by cluster, clicks, leads from this page in the prod DB, the
AI citation panel).

## Review mode

`/procedure-page <slug> review`: audit a rebuilt (or template) page and publish
a review artifact with findings and sketches, the way
https://claude.ai/artifact/Q5UBQFeDqj7KTL65TRTvhp reviewed PR #265. Structure,
tags and evidence rules: [reference/review-mode.md](reference/review-mode.md).
When the user says to go ahead, apply the before-merge items and every
fast-follow that doesn't need the owner, in a PR on the branch they name.

## Delegation

- **`procedure-page-builder`** agent: the non-interactive build of an
  approved brief, the verification pass, or a review. It cannot ask the user
  questions, so keep every gate in the main session.
- **`procedure-image-creator`** agent: batches of image candidates and the
  export/upload of picked finals.
- Project agents with a stale `model:` pin (`seo-content-expert`,
  `ui-ux-designer`…) need `model: 'sonnet'` or better passed explicitly.
- A subagent that browses takes over the shared Playwright page. Render your
  own pages in chrome-devtools with an `isolatedContext`, and tell research
  agents to use WebSearch/WebFetch only.

## Never

- Invent a credential, a practice claim, a figure, a review, a patient photo
  or a quote from the surgeon.
- Publish an AI image of a person without "Model shown. Not a patient.", or
  any AI image as a result, as the surgeon, or as staff.
- Say "board-certified plastic surgeon", ABPS, "best", "safest", guarantee,
  travel coordination, or any market outside the US.
- Change the URL, and don't change the title or H1 in the same deploy as the
  redesign unless the evidence says to (then say why in the PR).
- Write to the production database, run `db:seed`, or push to `master`.
