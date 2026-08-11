# Blog Content Pipeline v2 — Implementation Plan

**Date:** 2026-08-11
**Status:** Approved direction; foundations in progress
**Owner docs this extends:** `docs/seo/geo-strategy-us-audience.md`, `docs/seo/keyword-map-cost-pages.md`, `docs/seo/competitive-gap-cgcosmetic-and-seo-geo-plan.md`

---

## 0. Decisions (locked 2026-08-11)

| Decision     | Choice                                                                                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture | **Admin pipeline stays the engine** (`apps/admin` + `packages/ai`); add a **Claude Code batch skill** for bulk operations (audits, consolidation, mass refresh) reusing the same services                                        |
| E-E-A-T      | **Entities now, physician later** — fix author/reviewer schema and build reviewer infrastructure; keep "Editorial Team" byline until a physician commits. No "medically reviewed by" claims without an actual reviewer.          |
| Image style  | Three people-free artistic presets: **abstract-material-macro**, **botanical-still-life**, **painterly-editorial** (architectural minimalism explicitly excluded). Stone+gold palette, tweakable config, automated no-people QA. |
| Sequencing   | **Foundations first** → pipeline v2 → cannibalization cleanup / refresh loop                                                                                                                                                     |

Derived defaults (recommendations adopted unless overridden):

- **Skip the GA4 Data API in v1.** No read integration exists; GSC + the first-party `page_view` table cover topic selection and engagement. Revisit only for a concrete need.
- **Skip further llms.txt investment.** Google explicitly doesn't consume it (May 2026 guidance); robots.txt already allows all major AI crawlers. A cheap enrichment (full post index) is optional, low priority.
- **Modest cadence, refresh-heavy.** Target ~2–4 new posts/month + scheduled refreshes. The March 2026 core update punishes scaled undifferentiated output; AI-engine citations rotate ~monthly and reward freshness.
- **3–5 inline images per ~1,500-word post**, adjacent to the section they illustrate.

---

## 1. What we found (summary)

Two parallel systems exist:

- **System A (dead):** `blog-post-creator-expert` agent + `packages/db/src/seed/posts/` seed files + root `scripts/*.mjs`. Dead model pins, wrong-brand content spec (`docs/blog-writing-guidelines.md` is for "Keel"), broken upload snippet, and a **destructive seeder** (`02-blog.seed.ts` dev mode deletes the shared `images` table → cascades to pipeline images + Instagram links). `CLAUDE.md`'s agent table still points here.
- **System B (real, undocumented):** admin Kanban pipeline — `ideation → generate → ai_review → generate_metadata → generate_image → draft → ready_to_publish → scheduled → published`. Engine: `packages/ai/src/pipelines/agentic-content.pipeline.ts` (agentic writer with Perplexity/Google research tools → **5 parallel review agents** → **orchestrator** merges reviews and revises → FAQ/metadata extraction → featured image). Inline-image generation exists (`auto-inline-image.pipeline.ts`).

Key defects in System B (full details in the session analysis):

| Area           | Defect                                                                                                                                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ideation       | No GSC input, no keyword ownership registry → generated 11 live near-duplicate clusters (`-quiz`/`-checklist`/`-miami-moms` persona-variants of identical queries)                                                                                                                                     |
| Models         | Content gen on `gpt-4.1`; review default `claude-sonnet-4-5` absent from `AVAILABLE_MODELS`; registry labels wrong (`gpt-4.1` labeled "GPT-4o")                                                                                                                                                        |
| Flow           | HTTP `extract` route doesn't chain to image phase (service path does); posts can reach `published` with NULL slug; no stuck-post reaping                                                                                                                                                               |
| Images         | Default subject `patient-model` in `luxury-clinic`; option vocabulary duplicated in 5 files; hardcoded `size:'1392x752'` for all images; opaque filenames `blog-images/{id}/{ts}-{rand}.jpg`; **live alt text = raw generation prompt**; no negative prompts; no people QA                             |
| Renderer       | Sanitizer strips all custom components in blog content (works on procedure pages); no `figure`/`figcaption`; body images hardcoded 800×400; TOC anchors desync on punctuated headings; ImageObject JSON-LD can assert images absent from the body (`flying-after-bbl-tips`: 11 schemas, 0 body images) |
| E-E-A-T        | Generic "Editorial Team" author; `reviewedBy` is a Person node whose `@id` is the Organization (malformed); no review dates; no visible "Last updated"                                                                                                                                                 |
| Content format | 0 of 152 posts contain a table; no Quick Answer anywhere (GEO doc §4.1 mandates it); no BreadcrumbList or MedicalWebPage on posts                                                                                                                                                                      |
| Data           | GSC service layer excellent but unused by pipeline; no snapshots; no cron anywhere; GA4 read integration nonexistent                                                                                                                                                                                   |

Content inventory: **152 published posts** — 49 legacy at root `/{slug}` (pre-2026 publish dates), 103 pipeline-era at `/blog/{slug}` (`BLOG_PREFIX_CUTOFF = 2026-01-01` in `apps/web/lib/utils/blog-url.util.ts`).

Research anchors (2025–2026): passage-level answer-first structure wins AI citation (quotes +41%, stats +32%, sources +30%); YMYL requires named credentialed review to rank durably; refresh beats volume; tables are the highest-fidelity extraction format; artistic AI imagery carries no penalty; Recraft V4.1 `style_id` / Ideogram V4 negative prompts are the current best fit for a consistent people-free house style (~$0.04/image).

---

## 2. Target pipeline (v2)

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. IDEATION (data-driven)                                        │
│    GSC: opportunities + gaps + position losers                   │
│    + keyword ownership registry check (hard gate)                │
│    + existing-post similarity check                              │
│    → scored candidates: {new topic | refresh existing | reject}  │
├──────────────────────────────────────────────────────────────────┤
│ 2. BRIEF   intent, unique angle, information-gain requirements,  │
│            question-H2 outline, Quick Answer draft, planned      │
│            table, planned inline images, internal-link plan      │
├──────────────────────────────────────────────────────────────────┤
│ 3. DRAFT   agentic writer (research tools) — US-only ICP,        │
│            answer-first sections, ≥1 real table, ≥2 stats,       │
│            surgeon-attributable insight, inline image markers    │
├──────────────────────────────────────────────────────────────────┤
│ 4. REVIEW BOARD (parallel)                                       │
│    existing: internal-links, external-links, writing-quality,    │
│              ai-slop, fact-source-verifier                       │
│    new:      geo-retrievability, cannibalization-checker,        │
│              medical-accuracy                                    │
├──────────────────────────────────────────────────────────────────┤
│ 5. ORCHESTRATOR  merges reviews → revises → scores → changelog   │
├──────────────────────────────────────────────────────────────────┤
│ 6. ASSETS  featured + 3–5 inline images from artistic style      │
│            system; no-people QA; SEO filenames; real alt;        │
│            captions; dimensions + blur                           │
├──────────────────────────────────────────────────────────────────┤
│ 7. METADATA/SCHEMA  FAQs, Quick Answer, meta, MedicalWebPage +   │
│            BlogPosting, breadcrumbs, reviewer entity, image      │
│            sitemap entries                                       │
├──────────────────────────────────────────────────────────────────┤
│ 8. HUMAN GATE  draft review in admin → publish                   │
│            (physician sign-off step exists but optional until    │
│             a physician commits)                                 │
├──────────────────────────────────────────────────────────────────┤
│ 9. POST-PUBLISH LOOP  daily GSC snapshot (first cron), refresh   │
│            scheduler, cannibalization monitor                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Workstream F — Foundations (current)

Nothing new generates on the old standard until these land.

### F1. US-scope audit of AI prompts — _mostly already fixed_

The Aug-2026 US-scope sweep corrected `agentic-writer.prompt.ts` ("fly-in patients from across the United States"). Remaining `latina-hispanic`/`caribbean` hits are **ethnicity options for depicting US patients** (legitimate; handled by F3's de-defaulting of people imagery, not a market-scope issue). Action: grep-audit all `packages/ai/src/prompts/**` for residual market-scope language; fix any stragglers.

### F2. Model registry (`packages/ai/src/models/available-models.constant.ts`)

- Fix mislabels (`gpt-4.1` shown as "GPT-4o", `gpt-4.1-mini` as "GPT-4o Mini").
- Add current Anthropic models (Claude 5 family) with correct IDs; remove/mark legacy.
- Ensure every **default** used by runners (`generation-phase.runner.ts`, `review-phase.runner.ts`, `agentic-content.pipeline.ts`, `extraction-phase.runner.ts`, `generate-image-alt.function.ts`) exists in `AVAILABLE_MODELS` (today `claude-sonnet-4-5` fails `isValidModelId`).
- Defaults: generation + review → current Sonnet; orchestrator → current Sonnet (Opus optional via picker); cheap utility calls (alt text, extraction) → current Haiku/mini tier.

### F3. Artistic image style system

Single source of truth, mirroring the good pattern in `packages/ai/src/constants/photo-style.constant.ts`:

- New `packages/ai/src/constants/image-style.constant.ts` — the **only** definition of style presets; consumed by zod schemas, LLM selection prompts, and the runner (kills the 5-way duplication across `featured-image-options.constant.ts`, `image-generation-phase.runner.ts`, `selected-image-options.schema.ts`, `generate-featured-image-prompt/route.ts`, `select-image-options.prompt.ts`).
- **Three presets** (each: id, name, base style block, subject vocabulary, palette block, composition guidance, negative prompt, model routing, per-type aspect ratios):
    - `abstract-material-macro` — marble veining, silk drape, gold leaf, water/light refraction; pure materiality. Default for most topics.
    - `botanical-still-life` — orchids, palm shadows, stone vessels, organic forms; recovery/wellness topics.
    - `painterly-editorial` — watercolor washes, contour line studies, gradient fields; timelines, comparisons, anatomy-adjacent topics where abstraction beats photography. Infographic-adjacent.
- **People become opt-in**: `patient-model` and the human-description machinery (`MODEL_*` options, `buildModelDescription`, `PHOTO_DIVERSITY_REQUIREMENTS`) are preserved but only activate when a human explicitly selects a people subject in the admin UI. Pipeline default = artistic preset chosen by topic.
- **Config over hardcode**: model, size/aspect per image type, and negative prompt come from the preset + `inline-image-type.constant.ts` aspect ratios (currently silently ignored by the hardcoded `size: '1392x752'` in `apps/admin/lib/services/fal-image-generation.service.ts`).
- **No-people QA gate**: after generation, a cheap vision check ("does this image contain a person, face, or body part?"); on detection → regenerate once with strengthened negative/positive constraints, else fail the phase visibly.
- **SEO filenames**: `blog/{post-slug}/{descriptor}-alluring-plastic-surgery-miami.webp` (matches the procedure-image convention; kills `blog-images/{id}/{ts}-{rand}.jpg`).
- **Alt text fix**: `images.alt` gets a real ≤125-char descriptive alt (generated from the image concept + post keyword); the raw prompt stays in `images.generation_prompt`. Caption generated alongside (consumed by F4 `<figure>` + ImageObject + image sitemap).
- **Reproducibility**: persist the chosen preset + options JSON on the generation record.
- Model routing per research: keep `fal-ai/gpt-image-1.5` / `fal-ai/nano-banana-pro` working; add Recraft V4.1 (`style_id` support) and Ideogram V4 (negative prompts) as preset-selectable engines. Style references/`style_id` for series consistency once presets stabilize.

### F4. Renderer + E-E-A-T entities (`apps/web`)

- **Component support in blog MDX** (`post-markdown.component.tsx`): extend the sanitize schema to allow `figure`/`figcaption` and registered components (`QuickAnswer`, `Figure`, `CalloutBox`); or align with the procedure renderer's trusted-content approach. Content is first-party.
- **`Figure` component**: renders `next/image` with real width/height (from the `images` table via props), `sizes`, optional `blurDataURL`, and `<figcaption>`.
- **TOC fix**: `extract-toc.util.ts` must use github-slugger so anchors match `rehypeSlug` output for punctuated/formatted headings.
- **BreadcrumbList** on post pages (exists on listing/tag/author pages only today).
- **`MedicalWebPage`** wrapper schema on posts alongside `BlogPosting`.
- **Fix `reviewedBy`**: today a `Person` whose `@id` is `#organization`. Replace with honest entities: publisher = MedicalOrganization; author = Editorial Team Person entity with its own `@id`; `reviewedBy` **omitted until a real reviewer exists** (schema must not assert review that didn't happen). Reviewer infrastructure (author model slot, `reviewedAt` display component, Physician schema path in `authors.data.ts`) built and dormant.
- Real `wordCount` (computed) instead of `readingTime × 200`; visible "Last updated" on posts (component exists, unused).

### F5. Hazard cleanup

- `packages/db/src/seed/02-blog.seed.ts`: destructive dev-mode clear now requires an explicit `SEED_CLEAR_BLOG=true` env flag; never touches the shared `images` table wholesale.
- Delete the six dead `scripts/*.mjs` WordPress-migration scripts.
- Delete `docs/blog-writing-guidelines.md` (wrong brand — "Keel"); the pipeline prompts + this plan are the spec. Mark `docs/BLOG-POST-SEEDING-SYSTEM.md` as legacy/deprecated at the top.
- Collapse the three divergent `blog-post-creator-expert` copies: `.claude/agents/` copy becomes a thin pointer at the admin pipeline + batch skill; delete `agents/blog-post-creator-expert.md` and `.cursor/rules/blog-post-{creator,migration}-expert.mdc`.
- Update `CLAUDE.md` agent table (Blog Posts row) to point at the admin pipeline + batch skill.

### F6. Pipeline flow fixes

- `extract/route.ts`: add `after(() => runImageGenerationPhaseForPost(id))` to match `pipeline-phase.service.ts` behavior (today HTTP-driven posts silently stall before image generation).
- Slug guard: `updatePipelineStatus` refuses `published`/`scheduled` when `slug` is NULL/empty (posts can currently publish invisibly).

---

## 4. Workstream P — Pipeline v2 (after foundations)

- **P1. Keyword ownership registry** — blog-wide extension of `docs/seo/keyword-map-cost-pages.md`: every published post maps to exactly one query cluster; stored as a checked-in data file (seedable to DB later). Hard rule: blog owns informational long-tail only; procedure/cost/financing pages own commercial intent; the registry lists "must NOT target" per cluster.
- **P2. GSC-driven ideation** — wire `getContentOpportunities`, `getContentGaps`, `getPositionChanges` into `generate-topics`; add `startRow` pagination to `fetchSearchAnalytics`; add a blog-URL resolver honoring `BLOG_PREFIX_CUTOFF` (and fix `url-registry.service.ts:80`, which classifies post-2026 posts as `blog-listing`, silently emptying the admin blog filter). Ideation output is labeled `{new | refresh | reject}` — refresh candidates route to the refresh flow, not new posts.
- **P3. New reviewers** — `geo-retrievability` (Quick Answer present/standalone, question H2s, table present, stats/quotes/citations counts, chunk self-containment), `cannibalization-checker` (registry + live `getPagesForQuery`), `medical-accuracy` (claims vs cited clinical sources; flags anything a physician must verify — output stored for the future physician gate).
- **P4. Content template** — `quickAnswer` column on `blog_post` (40–70 words, number-first); generation emits question H2s, ≥1 real markdown table, `<!-- CTA:type -->` explicit markers (never the 40% auto-split for structured content), inline image markers with descriptor + caption.
- **P5. Inline images default-on** — 3–5 per post; junction table and markdown body kept in sync atomically (fix the `flying-after-bbl-tips` class of desync: ImageObject schema must derive from the rendered body, or body injection must be transactional with junction writes).
- **P6. Refresh flow** — an existing post re-enters the pipeline at review with a "refresh brief" (GSC deltas, new FAQs, freshness pass); updates in place, bumps `updatedAt`, visible "Last updated", never a new URL.
- **P7. Snapshots + first cron** — `vercel.json` cron → authed route: daily GSC `['query','page']` pull into a `gsc_query_page_daily` table (beats the 16-month retention wall); weekly cannibalization report (queries with ≥2 URLs above impression floor); refresh scheduler surfacing stale winners.

## 5. Workstream B — Claude Code batch skill (with P, or after)

`.claude/skills/blog-batch/` operating on the same DB/services (via admin API with service auth, or direct via `packages/db`):

- `audit` — full cannibalization + performance report (GSC evidence per cluster) → markdown report.
- `consolidate` — execute a cluster decision: merge content, set 301 in `next.config.mjs`, update registry. **Dry-run by default; destructive steps require explicit confirmation.**
- `refresh <slug>|--batch` — run refresh flow across N posts.
- `backfill` — alt text, captions, inline images, Quick Answers for the 152 existing posts (batched, review-gated).

## 6. Cannibalization cleanup candidates (pending GSC evidence)

Decisions below are **candidates** — the batch skill's `audit` produces per-cluster GSC evidence before any merge/301 executes. Legacy root URLs may hold rankings; never 301 without checking.

| Cluster                            | Proposed owner                                                                                                               | Merge/301 into owner                                                                                                 | Notes                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| BBL recovery (6)                   | `bbl-recovery-time-miami`                                                                                                    | `miami-bbl-recovery-guide`, `bbl-miami-recovery-faq`, `bbl-recovery-mistakes-miami`, `bbl-recovery-miami-moms-guide` | Legacy `how-long-to-recover-from-bbl`: check GSC first               |
| Surgeon selection (4)              | Split: `how-to-choose-…-10-things-to-look-for` (how-to intent) + `board-certified-plastic-surgeon-miami` (credential intent) | `choose-plastic-surgeons-miami` → how-to; `best-board-certified-plastic-surgeons-miami` → credential                 | Two distinct intents, two owners                                     |
| Safety (3)                         | `safe-plastic-surgery-miami` (general)                                                                                       | —                                                                                                                    | Procedure-specific safety posts stay; re-differentiate titles/links  |
| BBL post-pregnancy (3)             | `bbl-miami-post-pregnancy-guide`                                                                                             | `bbl-miami-post-pregnancy-quiz`, `bbl-before-after-miami-mom`                                                        |                                                                      |
| Tummy tuck × Ozempic (2)           | `tummy-tuck-recovery-ozempic-miami`                                                                                          | `ozempic-tummy-tuck-myths-miami`                                                                                     |                                                                      |
| Tummy tuck myths (2)               | `tummy-tuck-myths-miami-moms`                                                                                                | `tummy-tuck-recovery-myths-miami-moms`                                                                               |                                                                      |
| Mommy makeover recovery (5)        | `mommy-makeover-recovery-timeline-miami`                                                                                     | `mommy-makeover-recovery-miami`, `mommy-makeover-recovery-signs`                                                     | `-exercises` stays (distinct intent); legacy `how-long-…`: check GSC |
| Breast reduction × weight loss (2) | `breast-reduction-weight-loss-miami`                                                                                         | `breast-reduction-weight-loss-quiz`                                                                                  |                                                                      |
| Facelift results (2)               | `facelift-results-longevity-miami`                                                                                           | `facelift-results-miami-tips`                                                                                        |                                                                      |
| TT vs lipo (2)                     | `/blog/tummy-tuck-vs-liposuction`                                                                                            | legacy `what-is-the-difference-between-tummy-tuck-and-liposuction`                                                   | Legacy likely ranks — GSC first                                      |
| Legacy sleep-position (4)          | keep all                                                                                                                     | —                                                                                                                    | Distinct per-procedure intents; thin → refresh candidates            |

## 7. Verification & guardrails

- Foundations: `pnpm typecheck` / `pnpm build` green across `packages/ai`, `packages/db`, `apps/admin`, `apps/web`; existing posts render unchanged (spot-check legacy root post + 2026 post with inline images).
- Schema honesty: never emit `reviewedBy`/review claims without a real reviewer; never assert ImageObjects absent from the body.
- YMYL: medical-accuracy reviewer output is stored per post from day one, so when a physician joins, the backlog of "claims to verify" already exists.
- Cost: image generation ~$0.25/post; content generation the dominant cost — modest cadence keeps this trivial. The scarce resource is human review time; the pipeline's scores/changelogs exist to spend it efficiently.
