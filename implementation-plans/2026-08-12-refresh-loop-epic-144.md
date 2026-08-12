# Refresh Loop + GSC Snapshots — Epic #144 Implementation Plan

**Date:** 2026-08-12
**Status:** Proposed (research complete, all file/line claims verified against `master` @ `1ca94ae`)
**Epic:** [#144 Refresh loop + GSC snapshots (freshness beats volume)](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/144) (sub-issues #145–#148)
**Builds on:** epic #122 (Autopilot cron foundation, `autopilot_run` lock pattern), epic #155 (reaper + telemetry), epic #134 (GEO template), PR #177 (internal linking)
**Extends:** `implementation-plans/2026-08-11-blog-content-pipeline-v2.md` (§4 P6 refresh flow, P7 snapshots), `implementation-plans/2026-08-11-autopilot-epic-122.md`

**North star:** a closed loop that runs without a human in the detection path — _snapshot → detect → brief → execute → review → apply → measure_ — where the only mandatory human touchpoint is approving a diff, and every stage leaves machine-readable state that other processes (Autopilot, Claude Code sessions, future tuning jobs) can act on.

---

## 0. Decisions (locked 2026-08-12)

| Decision                     | Choice                                                                                                                                                                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Refresh execution model      | **Shadow working copy**: clone the published post into a hidden `draft` row (`refresh_of_post_id` set), run the existing pipeline phases on the clone, merge back in one transaction. The original never leaves `published` (see §2.1). |
| Queue shape                  | **One lifecycle table `content_refresh`** carrying a candidate from detection signal through outcome measurement — not separate candidate/run tables. One active entry per post (partial unique index).                                 |
| Snapshot granularity         | `['query','page']` per day, **final data only** (pull up to `today − 3`, GSC's delay window), self-healing catch-up: each run fills every missing date since the last stored one.                                                       |
| Backfill                     | Dedicated resumable script pulls up to **16 months** day-by-day (newest first) so YoY baselines exist from day one. Cron handles steady state only.                                                                                     |
| Weekly jobs cadence          | Daily cron tick + `isCadenceDue`-style due-check (144 h), exactly like Autopilot — Vercel does not retry crons, so weekly-scheduled entries would silently skip a failed week.                                                          |
| Cannibalization report email | Folded into **one weekly `[SEO]` digest** (findings + new refresh queue entries + measured outcomes + snapshot sync health) instead of three separate mails. Throttled via `email_log` like `notifyAutopilotDraftCap`.                  |
| Apply gate                   | **Human approves the diff before merge, always, in v1.** `refresh_mode = auto` automates detection→execution, never the apply. A future `refreshAutoApply` flag is named but not built.                                                 |
| Image phase on refresh       | **Skipped.** The featured image is kept; refresh touches content/metadata only.                                                                                                                                                         |
| Rollback                     | Every apply snapshots the pre-merge post into `blog_post_revision`; a restore action reverses an apply (snapshotting again first).                                                                                                      |
| CTR benchmark                | **Self-calibrated from our own snapshots** (impression-weighted CTR by rounded position, trailing 90 d), with a static fallback curve until enough data accumulates. The global `BENCHMARK_CTR = 0.05` constant is not used for decay.  |
| Algo-update guard            | Position-drop rule is **drift-adjusted**: subtract the site-median position delta over the same window, so a core update that moves everything doesn't flood the queue.                                                                 |
| Config                       | New knobs live on the existing `blog_ai_config` singleton (`refresh_mode`, thresholds, cooldown, cap) — same three-file ripple as Autopilot columns.                                                                                    |
| Run history / locks          | Per-feature run tables + partial-unique-index locks, per house convention. `gsc_sync_run` for snapshots; refresh executions reuse `autopilot_run` with a new `kind = 'refresh'` enum value. No advisory locks (Supabase pooler).        |

Derived defaults (adopted unless overridden): position-drop threshold **3.0** over 28 d vs prior 28 d; min data **200 impressions/28 d** for drop rule, **500** for CTR rule; stale age **6 months**; cooldown **60 days** after an applied refresh; refresh working-draft cap **2**; queue score `log10(impressions₂₈d + 10) × max(driftAdjustedDrop, 0) + ctrGapBonus + staleBonus`.

---

## 1. What the research changed (corrections & constraints)

1. **There is no GSC persistence anywhere.** All 15 admin search-console endpoints fetch live (`apps/admin/lib/services/search-console/`); the only caches are React Query `staleTime` and the 1 h sitemap-registry `unstable_cache`. #145 is greenfield persistence — nothing to migrate.
2. **The URL→post resolver half-exists.** `resolveBlogPathToSlug` (`packages/shared/src/utils/blog-url.util.ts`) ships with tests but has **zero production call sites**, and no slug→`blog_post.id` lookup exists anywhere. The snapshot job must add the id-resolution layer, normalizing trailing slashes the way `url-registry.service.ts:154` does (the `extractPath` copy in `google-search-console-pages.service.ts:36` keeps trailing slashes — don't reuse that one).
3. **A published post cannot re-enter the pipeline as itself.** The pipeline is a state machine on `blog_post.status`; every phase driver hard-gates via `fetchAndValidatePostForPhase(postId, expectedStatus, …)` (`apps/admin/lib/services/pipeline-phase.service.ts`), and the public site queries `status = 'published'`. Setting a live post to `generate` would unpublish it. This forces the shadow-copy architecture (§2.1).
4. **The seam for this epic was pre-built and is currently dropped on the floor.** `autopilot_run.refresh_candidates` (`RefreshCandidate[]`, `packages/db/src/types/autopilot.type.ts:30`) is populated by ideation today and never consumed; `createPipelinePostInternal` (`apps/admin/lib/services/pipeline-post.service.ts:55`) hard-refuses ideation-gate `refresh` verdicts. Both route into the new queue.
5. **The review board is already refresh-aware in one spot.** `runCannibalizationChecker` accepts `currentPostSlug` "to skip self-matches on refresh" — wire it up, don't rebuild it.
6. **The public "Last updated" surface already exists.** `getMeaningfulUpdateDate` (24 h threshold), `<LastUpdated>`, `dateModified` in Article/MedicalWebPage schema, `og:modified_time`, sitemap `lastModified` — all live on `apps/web`. `blog_post.updatedAt` has `$onUpdate`, so the merge bumps it for free. **Nothing to build on the web app.**
7. **`publishedAt` is radioactive.** Both publish paths set it only on the first publish, and the pre/post-2026 URL split (`BLOG_PREFIX_CUTOFF`) keys off it — writing it during a refresh would silently move a legacy post from `/{slug}` to `/blog/{slug}`. The merge step must never touch `publishedAt`, `slug`, or `status`.
8. **No retry/backoff exists in the GSC layer** (confirmed by grep). The snapshot job adds a `withGscRetry` wrapper (exponential backoff on 429/5xx, 3 attempts) rather than trusting a bare `fetchAllSearchAnalytics` loop.
9. **Draft-cap interaction:** Autopilot's content job counts `status='draft'` rows against `autopilotDraftCap` (default 3). Refresh working copies land in `draft` — they must be excluded from that count (`refresh_of_post_id IS NULL` filter) and capped separately, or refreshes will starve new content.
10. **Two-database caveat (#168, open):** `pnpm db:migrate` targets DigitalOcean; the apps read Supabase. Migration 0049 must be applied to Supabase manually (psql or Supabase MCP `apply_migration`), like 0044/0046/0047/0048. Note `ALTER TYPE … ADD VALUE` cannot run inside a transaction block — apply that statement separately when using psql.

---

## 2. Architecture

```
                        ┌─────────────────────────────────────────────────────────┐
                        │                    DAILY CRON LADDER (UTC)              │
                        └─────────────────────────────────────────────────────────┘
 GSC API ──▶ 06:00 gsc-snapshot ──▶ gsc_query_page_daily  (catch-up: all missing days ≤ today−3)
                                          │
             06:20 refresh-outcomes ◀─────┤   (applied refreshes ≥28d old → before/after verdict)
                                          │
             06:40 detect-decay ──────────┤   (weekly due-check; drift-adjusted rules R1–R4)
                    │                     │
                    ▼                     │
             content_refresh  ◀── ideation-gate 'refresh' verdicts (autopilot ideation, today dropped)
             (queue + lifecycle) ◀── manual "Queue refresh" from admin UI
                    │
             07:00 cannibalization-report ─▶ cannibalization_report ─▶ weekly [SEO] digest email
                    │                                                   (findings + queue + outcomes)
                    ▼
      refresh_mode = 'auto' ──▶ autopilot-refresh workflow        refresh_mode = 'suggest'
      (pick top pending, no human)                                (admin clicks Run on a queue card)
                    └────────────────┬────────────────────────────────────┘
                                     ▼
                  clone post (draft, refresh_of_post_id set, slug NULL)
                  → generate (refresh writer: existing content + brief, research tools ON)
                  → ai_review (7 agents, currentPostSlug wired) → generate_metadata (refresh-aware)
                  → status stays 'draft', content_refresh → ready_for_review + email
                                     ▼
                  admin reviews DIFF (original vs working copy) + change summary
                     ├── Apply: snapshot blog_post_revision → merge onto original (1 txn)
                     │          → updatedAt auto-bumps → revalidate tags → delete working copy
                     └── Dismiss: candidate closed, cooldown starts
                                     ▼
                  +28d: refresh-outcomes measures before/after from snapshots → digest
```

### 2.1 Why a shadow working copy (and not an in-row refresh state)

- The original row keeps serving the live page the whole time — `status` never leaves `published`, so no public-site query, sitemap entry, or cache tag is disturbed.
- **Everything downstream is reused unmodified**: phase drivers, status guards, the stuck-post reaper, retry claiming, Langfuse spans, the Kanban card, and the 6-tab edit dialog all operate on the working copy as a perfectly ordinary pipeline post.
- The merge becomes one small, testable transaction instead of refresh-mode branches threaded through every phase driver.
- Costs are bookkeeping guards, all enumerated in §4 Phase 4: publish-refusal for working copies, draft-cap exclusion, Kanban badge, ideation-dedupe exclusion, cascade delete with the original.
- `duplicateBlogPost` (`apps/admin/lib/actions/blog.action.ts:738`) already proves the clone primitive; the refresh clone differs by setting `refresh_of_post_id`, nulling `slug`, and copying `planningData` with a `refresh` brief attached.

### 2.2 Why detection reads snapshots, not the live API

The 16-month retention wall is the headline reason, but the operational ones matter as much: stable 28 d/28 d windows need two fetches per post live (quota + latency), drift adjustment needs a site-wide median (a full extra pull), flip-flop detection needs last week's state (gone from the API once the window slides), and YoY seasonality checks are impossible without our own history. Snapshots turn all of these into indexed SQL.

---

## 3. Schema (migration `0049_*`, additive only)

New domain folder `packages/db/src/schema/gsc/` (+ barrel, + root-barrel entries, + `packages/db/package.json` export subpath `./schema/gsc`). Blog-domain additions stay in `schema/blog/`. All tables: `uuid('id').primaryKey().defaultRandom()`, snake_case DB names, `createdAt`/`updatedAt` per convention, `Type`/`InsertType` exports.

### 3.1 `gsc_query_page_daily` — new table (`gsc/gsc-query-page-daily.table.ts`)

```
date          date          notNull        -- GSC's own date key (PT); pulled only when ≤ today−3
query         text          notNull
page          text          notNull        -- full URL exactly as GSC returns it
blog_post_id  uuid          null → blog_post.id  onDelete 'set null'   -- resolved at insert time
clicks        integer       notNull
impressions   integer       notNull
ctr           doublePrecision notNull
position      doublePrecision notNull
created_at    timestamp     defaultNow

indexes:
  uniqueIndex gsc_qpd_date_query_page_idx (date, query, page)      -- upsert target
  index gsc_qpd_page_date_idx (page, date)
  index gsc_qpd_query_date_idx (query, date)
  index gsc_qpd_post_date_idx (blog_post_id, date) WHERE blog_post_id IS NOT NULL
```

Volume: a site this size produces low thousands of rows/day → single-digit millions over years; fine with these indexes. A monthly-rollup follow-up is named in §9 but out of scope.

### 3.2 `gsc_sync_run` — new table (`gsc/gsc-sync-run.table.ts`)

```
enum gsc_sync_trigger: cron | manual | backfill
enum gsc_sync_status:  running | completed | failed

trigger, status, dates_pulled jsonb<string[]>, rows_upserted integer,
error text, started_at, finished_at, created_at

indexes:
  uniqueIndex gsc_sync_run_single_running_idx (status) WHERE status = 'running'   -- the lock
  index gsc_sync_run_started_idx (started_at)
```

### 3.3 `cannibalization_report` — new table (`gsc/cannibalization-report.table.ts`)

```
week_start     date     notNull, uniqueIndex          -- Monday of the analyzed ISO week
findings       jsonb<CannibalizationFinding[]> notNull
findings_count integer  notNull
created_at

CannibalizationFinding (packages/db/src/types/gsc.type.ts):
  { query, totalImpressions, kind: 'shared-impressions' | 'flip-flop',
    pages: [{ page, blogPostId?, impressions, share, clicks, position }],
    owner?: { url, source: 'registry' | 'top-performer' } }   -- via resolveQueryOwner/getOwnerForUrl
```

### 3.4 `content_refresh` — new table (`blog/content-refresh.table.ts`)

The queue **and** the lifecycle record — one row follows a post from signal to measured outcome.

```
enum content_refresh_status: pending | in_progress | ready_for_review | applied | dismissed | failed

blog_post_id     uuid notNull → blog_post.id onDelete 'cascade'
status           content_refresh_status default 'pending'
sources          jsonb<RefreshSignal[]> notNull     -- accumulating; new signals merge into the active row
score            doublePrecision notNull default 0  -- queue priority (formula in §0)
brief            jsonb<RefreshBrief> null           -- built at execution start (§4 Phase 4)
working_post_id  uuid null → blog_post.id onDelete 'set null'
revision_id      uuid null → blog_post_revision.id onDelete 'set null'
change_summary   text
workflow_run_id  varchar(191)
error            text
applied_at, measured_at timestamps
outcome          jsonb<RefreshOutcome> null         -- { before, after, verdict: improved|flat|declined }
created_at, updated_at

indexes:
  uniqueIndex content_refresh_active_idx (blog_post_id)
    WHERE status IN ('pending','in_progress','ready_for_review')   -- one active entry per post
  index content_refresh_status_score_idx (status, score)

RefreshSignal: { source: 'position-drop'|'ctr-gap'|'stale-age'|'cannibalization'|'ideation-gate'|'manual',
                 detectedAt, metrics: Record<string, number|string> }   -- the "triggering metric" of #147
```

### 3.5 `blog_post_revision` — new table (`blog/blog-post-revision.table.ts`)

```
blog_post_id  uuid notNull → blog_post.id onDelete 'cascade'
reason        varchar(40)      -- 'refresh-apply' | 'rollback'
title, content text notNull, meta_title, meta_description, meta_keywords,
excerpt, faqs jsonb, quick_answer, ai_summary, reading_time integer
content_refresh_id uuid null onDelete 'set null'
created_at

index blog_post_revision_post_created_idx (blog_post_id, created_at)
```

### 3.6 `blog_post` — new column

```
refresh_of_post_id uuid null → blog_post.id onDelete 'cascade'   -- set ⇒ this row is a hidden working copy
index blog_post_refresh_of_idx (refresh_of_post_id) WHERE refresh_of_post_id IS NOT NULL
```

### 3.7 `blog_ai_config` — new columns

| Column                            | Type                                           | Default |
| --------------------------------- | ---------------------------------------------- | ------- |
| `refresh_mode`                    | enum `refresh_mode` (`off`\|`suggest`\|`auto`) | `off`   |
| `refresh_stale_months`            | integer                                        | 6       |
| `refresh_position_drop_threshold` | doublePrecision                                | 3       |
| `refresh_cooldown_days`           | integer                                        | 60      |
| `refresh_draft_cap`               | integer                                        | 2       |

Ripple updates (same three files as every config column): `blog-ai-config.table.ts`, `blog-ai-config.query.ts` (type + `DEFAULT_BLOG_AI_CONFIG` + mapping), `blog-ai-config.action.ts` (zod) — plus the settings form.

### 3.8 `autopilot_run` — enum extension

`ALTER TYPE autopilot_run_kind ADD VALUE 'refresh'` — refresh executions get the same run history, single-running lock per kind, stale-run recovery, and unacknowledged-failure rail as ideation/content runs.

### 3.9 Applying the migration

`pnpm db:generate` writes `packages/db/migrations/0049_*.sql`, but `db:migrate` targets DigitalOcean (#168). Apply to the admin Supabase DB manually — `psql "<apps/admin/.env POSTGRES_URL>" -f packages/db/migrations/0049_*.sql` (run the `ALTER TYPE … ADD VALUE` statement separately, outside a transaction) or via the Supabase MCP `apply_migration`. Everything is additive and re-run-safe.

---

## 4. Phased implementation

### Phase 0 — Schema + types (all sub-issues)

1. All §3 schema files, both barrels, `packages/db/package.json` export, `packages/db/src/types/gsc.type.ts` + `content-refresh.type.ts` (+ re-exports).
2. `pnpm db:generate` → migration 0049; apply per §3.9.
3. Config ripple (§3.7) + settings-form fields (render-only until Phase 3 uses them).

### Phase 1 — GSC snapshots + daily pull (#145)

1. **URL resolver** — `apps/admin/lib/services/blog-post-resolver.service.ts`: loads `{slug, id}` for all posts once per run, resolves a GSC page URL via `new URL(page).pathname` → strip trailing slash → `resolveBlogPathToSlug` → map lookup. First production call site for the shared resolver.
2. **Retry wrapper** — `apps/admin/lib/services/search-console/gsc-retry.util.ts`: `withGscRetry(fn)`, exponential backoff (1 s/4 s/15 s) on 429/5xx, rethrow otherwise.
3. **Sync service** — `apps/admin/lib/services/gsc-snapshot.service.ts`:
    - `getMissingDates(now)`: from `max(date)+1` in the table (fallback: `today − 14` backstop) through `today − 3`; capped at 30 dates/run.
    - Per date: `fetchAllSearchAnalytics({ dimensions: ['query','page'], startDate: d, endDate: d, rowLimit: 25000 })` under `withGscRetry`, resolve `blog_post_id`, chunked `onConflictDoUpdate` upserts on `(date, query, page)`.
    - Lock + history via `gsc_sync_run` (insert-running is the lock acquisition, `23505` ⇒ skip; stale `running` > 30 min ⇒ mark failed, per Autopilot).
4. **Cron** — `gsc-snapshot` in the `JOBS` map + `vercel.json` `0 6 * * *`. Partial-day retry is inherent: a failed date stays missing and is re-pulled next run.
5. **Backfill script** — `apps/admin/scripts/backfill-gsc-snapshots.ts` (`--months 16`), newest-first, skips dates already present (resumable), 200 ms between days, `trigger='backfill'`. Run locally with admin env.
6. **Read queries** — `apps/admin/lib/queries/gsc-snapshot.query.ts`: `getPostTrendFromSnapshots(postId, days)`, `getPostQueryWindows(postId)` (28 d vs prior 28 d per query), `getSiteMedianPositionDelta()`, `getCtrBenchmark()` (impression-weighted CTR by rounded position, trailing 90 d, static fallback curve below minimum sample).
7. Unit tests: resolver (both URL shapes, trailing slash, unknown page), `getMissingDates` (empty table, gaps, backstop, cap), upsert-shape mapping.

**Verify (issue acceptance):** after two scheduled runs, `getPostTrendFromSnapshots` answers a per-post trend from the DB with GSC unreachable (unset the env vars locally and query).

### Phase 2 — Weekly cannibalization report (#146)

1. **Pure detection** — `apps/admin/lib/utils/cannibalization-detection.util.ts`, operating on plain rows (fully unit-testable):
    - _Shared impressions_: per query over the last 7 complete days, total impressions ≥ 50 and ≥ 2 URLs each holding ≥ 30 % share.
    - _Flip-flop_: top URL by impressions differs between the last two 7-day windows, query total ≥ 100 impressions across both.
    - Enrich with `resolveQueryOwner(normalizeQuery(query))` / `getOwnerForUrl` from `@workspace/shared/seo` → the finding's `owner`.
2. **Job service** — `apps/admin/lib/services/cannibalization-report.service.ts`: weekly due-check (last `cannibalization_report.created_at` + 144 h), reads snapshot rows, writes the `cannibalization_report` row (upsert on `week_start`).
3. **Digest email** — `apps/admin/lib/services/seo-digest-notification.service.ts`, cloned from the autopilot notification patterns (`emailShell`, `sendAndLog`, `getResendConfig`, `adminLink`, 6-day `email_log` throttle on subject prefix `[SEO] Weekly`): findings with competing URLs + owner, new queue entries (Phase 3), measured outcomes (Phase 5), last sync status.
4. **Dashboard card** — `apps/admin/components/seo/cannibalization-report-card.component.tsx` on the SEO dashboard Overview tab; GET `/api/admin/seo/cannibalization` returns the latest report; each finding links both admin post pages and the owner registry entry.
5. **Cron** — `cannibalization-report` in `JOBS` + `vercel.json` `0 7 * * *` (daily tick, weekly due-check).
6. Unit tests: seeded duplicate rows → exact expected findings; clean rows → empty; flip-flop window logic; owner enrichment fallback to top-performer.

**Verify (issue acceptance):** seeded duplicate data produces a correct report; clean data produces none — both as unit tests over the pure detector, plus one manual `trigger-cron.sh cannibalization-report` against dev DB.

### Phase 3 — Decay detection + refresh queue (#147)

1. **Pure rules** — `apps/admin/lib/utils/decay-rules.util.ts`, each returning `RefreshSignal | null` per post:
    - **R1 position drop:** impression-weighted position, 28 d vs prior 28 d, drop ≥ threshold _after subtracting the site-median delta_ (drift guard), impressions₂₈d ≥ 200.
    - **R2 CTR gap:** |position delta| < 1.0 and CTR₂₈d < 0.5 × `getCtrBenchmark()(position)` and impressions₂₈d ≥ 500.
    - **R3 stale age:** `max(publishedAt, updatedAt)` older than `refresh_stale_months` (published posts only; needs no snapshots).
    - **R4 cannibalization:** latest report finding involving ≥ 2 blog posts → signal on each non-owner post.
2. **Queue service** — `apps/admin/lib/services/content-refresh.service.ts`: `enqueueSignal(postId, signal)` merges into the active row or creates one (respecting the partial unique index and the 60-day cooldown after `applied_at`/`dismissed`), recomputes `score`; `dismiss(id)`; `queueManualRefresh(postId)`.
3. **Detection job** — `detect-decay` in `JOBS` + `vercel.json` `40 6 * * *` (weekly due-check keyed on the newest `content_refresh.sources[].detectedAt` from source ≠ manual, or a lightweight last-run marker on `gsc_sync_run`-style history — implementer's choice, documented in code).
4. **Route the two dropped seams into the queue:** ideation-gate `refresh` verdicts (`createPipelinePostInternal` branch instead of refusal → `enqueueSignal(source: 'ideation-gate')`, resolving `owningUrl` → post id) and `autopilot_run.refresh_candidates` (same call inside the ideation job, so runs keep their record AND the queue gets fed).
5. **Admin queue UI** — `apps/admin/app/(dashboard)/blog/refresh/page.tsx`: table of active candidates (post, signals with their triggering metrics, score, age), actions **Run refresh** (Phase 4), **Dismiss**; nav entry beside Pipeline; a "Refresh queue" stat card on the SEO dashboard. Server actions in `apps/admin/lib/actions/content-refresh.action.ts`.
6. Unit tests: each rule's boundaries (threshold, min-impressions, drift adjustment sign), score formula, cooldown/merge behavior of `enqueueSignal`.

**Verify (issue acceptance):** a post with a simulated position drop (seeded snapshot rows) appears in the queue with the triggering metric visible in the UI payload (`sources[0].metrics.positionDrop`, window dates, impressions).

### Phase 4 — Refresh flow: in-place update through the pipeline (#148)

1. **Brief builder** — `apps/admin/lib/services/refresh-brief.service.ts`: from snapshots + the candidate's signals → `RefreshBrief` `{ reasons, topQueries (Δposition/Δctr/Δimpressions 28v28), risingQueriesNotCovered (impressions but absent from headings/FAQs — the "new FAQs to add"), decayedQueries, cannibalizationContext?, staleness: { publishedAt, lastUpdatedAt, ageMonths }, instructions }`. Stored on `content_refresh.brief` and injected into the working copy's `planningData.refresh`.
2. **Clone** — extract `duplicateForRefresh(postId)` alongside `duplicateBlogPost`: copies content + metadata + `featuredImageId`, sets `status='generate'`, `slug=NULL`, `refresh_of_post_id=postId`, `planningData.refresh` with brief + `originalPostId`.
3. **Refresh writer mode** — `packages/ai/src/prompts/blog/refresh-writer.prompt.ts` + a `refresh?: RefreshBriefInput` option on `buildAgenticSystemPrompt`/`buildAgenticUserPrompt` and `runGenerationPhase` input. Rules: existing content is the base, preserve heading structure that earns rankings (brief lists query→heading mappings), keep the MDX contract and CTA markers, update dated facts/stats with the research tools (the writer has research; the orchestrator's "no inventing" rule stays untouched because new facts enter at generation), add sections/FAQs for `risingQueriesNotCovered`, remove obsolete claims, never change intent/topic. `runGenerationPhaseForPost` passes it through when `planningData.refresh` is present; `runReviewPhaseForPost` passes `currentPostSlug` = the **original's** slug (§1.5).
4. **Refresh-aware extraction:** extraction currently sets `slug` only when null — the clone's null slug would get a fresh generated slug; harmless (merge ignores it), but suffix it `-refresh` for admin clarity and skip regenerating `metaTitle` casing churn where unchanged.
5. **Guards** (the §2.1 bookkeeping, each with a test):
    - `updatePipelineStatus` + `updateBlogPostStatus` refuse `published`/`scheduled`/`ready_to_publish` when `refresh_of_post_id` is set ("Apply the refresh from the review screen instead").
    - Autopilot draft-cap count and `getPipelineStats` exclude `refresh_of_post_id IS NOT NULL`.
    - `isNearDuplicateTopic` ideation dedupe excludes working copies.
    - Kanban card shows a gold "Refresh" badge (`pipeline-card.component.tsx`, data already in `PipelinePostItem` once selected).
    - Working copies deleted on original's deletion (FK cascade, §3.6).
6. **Execution driver** — `runRefreshForCandidate(candidateId)` in `content-refresh.service.ts`: candidate → `in_progress`, build brief, clone, then phases `generate → review → extract` via the existing drivers (`chain:false` semantics), then `content_refresh → ready_for_review` + notification email ("Refresh ready for review", `adminLink('/blog/refresh/{id}')`). Wrapped in a durable workflow in Phase 5; callable inline from the queue UI's **Run refresh** in `suggest` mode (route handler with `maxDuration=300`, mirroring the pipeline routes).
7. **Change summary** — `packages/ai/src/functions/summarize-refresh-changes.function.ts`: small model call (extraction model), old + new content → 5–10 bullet summary → `content_refresh.change_summary`.
8. **Diff review screen** — `apps/admin/app/(dashboard)/blog/refresh/[id]/page.tsx`: change summary, per-field unified diff (title, meta, excerpt, quickAnswer, FAQs, content — `diff` npm package, server-rendered), review-board scores of the working copy, actions **Apply** / **Dismiss** / **Open in editor** (the working copy stays editable in the normal edit dialog before applying).
9. **Apply (one transaction)** — `applyRefresh(candidateId)`: snapshot original → `blog_post_revision` (reason `refresh-apply`); copy from working copy onto original: `content, title, metaTitle, metaDescription, metaKeywords, excerpt, faqs, quickAnswer, aiSummary, readingTime, secondaryKeywords` — **never `slug`/`publishedAt`/`status`/`featuredImageId`**; `updatedAt` bumps via `$onUpdate`; move inline-image junction rows to the original; delete the working copy; candidate → `applied`. Then `revalidateWebAppCache([BLOG_POSTS, blogPostBySlug(slug)])` + `revalidateTag(SITEMAP_URLS)` (lastmod changed).
10. **Rollback** — `rollbackRevision(revisionId)`: snapshot current state (reason `rollback`), restore the revision's fields, same revalidation; button on a small revision list in the post edit page.
11. Tests: apply-merge field allowlist (property: forbidden fields never change), guard refusals, brief builder's `risingQueriesNotCovered` heading matching, rollback round-trip.

**Verify (issue acceptance):** refreshing a live post produces an updated draft preserving slug/URL with a change summary for review; applying it updates the post in place — same URL, bumped `updatedAt`, "Last updated" visible on web (§1.6), `publishedAt` untouched; the Draft gate (Kanban + edit dialog) shows the working copy throughout.

### Phase 5 — Autopilot integration + outcome measurement (closes the loop, epic #144)

1. **Durable workflow** — `apps/admin/app/workflows/refresh/refresh-content.workflow.ts` (+ steps mirroring autopilot's): wraps `runRefreshForCandidate` phases in workflow steps with the same idempotent status-check pattern as `run-phase.step.ts`.
2. **Auto mode** — cron `autopilot-refresh` in `JOBS` + `vercel.json` `0 10 * * *`: when `refresh_mode='auto'` — due-check (daily), unacknowledged-failure rail, active-refresh count < `refresh_draft_cap`, lock via `autopilot_run` `kind='refresh'` — pick top `pending` by score, start the workflow. In `suggest` mode the job no-ops (`skip_reason='mode-off'` reused semantics).
3. **Outcome measurement** — cron `refresh-outcomes` (`20 6 * * *`) + `apps/admin/lib/services/refresh-outcome.service.ts`: for `applied` candidates ≥ 28 d old with `measured_at IS NULL`, compare post clicks/impressions/weighted position 28 d-after vs 28 d-before from snapshots → `outcome` + verdict (`improved` ≥ +10 % clicks or −1.0 position; `declined` the inverse; else `flat`), drift-adjusted like R1. Declined outcomes get a one-line callout in the digest with the rollback link.
4. **Digest completion** — wire queue entries (Phase 3) and outcomes (this phase) into the `[SEO]` digest; add `refresh` runs to the autopilot settings run-history card (kind badge).
5. **Heartbeat** — extend the heartbeat job's log line with snapshot lag (days behind `today−3`) and active-queue depth, so ops sees loop health in one place.

**Verify:** with `refresh_mode='auto'` on a dev DB, a seeded decayed post flows detection → queue → workflow → `ready_for_review` with no human action; after a simulated 28 d, `refresh-outcomes` writes a verdict.

---

## 5. Autonomy contract (what other processes can act on)

The epic's stated purpose is that content improves autonomously. These are the machine-readable surfaces this plan deliberately exposes:

- **Tables as API:** `content_refresh` (queue in/out, scores, briefs, outcomes), `gsc_query_page_daily` (any future analysis), `cannibalization_report`, `blog_post_revision` (undo log). All typed via `@workspace/db`.
- **Cron routes as commands:** every stage is externally triggerable with `CRON_SECRET` (`scripts/trigger-cron.sh gsc-snapshot | detect-decay | cannibalization-report | autopilot-refresh | refresh-outcomes`) — a Claude Code session or CI job can drive the whole loop on demand without UI.
- **Enqueue as an entry point:** `queueManualRefresh(postId)` (server action) + `enqueueSignal()` (service) let any future process — a content audit script, a GEO re-score, a human note — inject candidates with their own `source`, and they flow through the same brief/execute/review/measure machinery.
- **Outcome data enables tuning:** every applied refresh records its triggering metrics, brief, diff summary, and 28 d result. A future quarterly job (file as a follow-up issue) can read `outcome` distributions per source/threshold and propose config changes — the data model already supports it; nothing extra to log.
- **Read-side reuse:** `getGscTopicSeeds` (ideation) can later read snapshots instead of the live API — longer windows, zero quota; named follow-up, not in scope.

---

## 6. Deployment checklist (manual, Vercel dashboard)

1. Apply migration 0049 to the admin Supabase DB (§3.9) **before** deploying.
2. No new env vars — GSC (`GOOGLE_CLIENT_EMAIL`/`GOOGLE_PRIVATE_KEY`/`GOOGLE_SEARCH_CONSOLE_SITE_URL`), Resend, `CRON_SECRET`, `ADMIN_BASE_URL` are already required by Autopilot. Close the known `env.example` gap (Resend/owner/admin-URL vars) while touching it.
3. Deploy admin; confirm the four new crons appear in the Vercel Cron Jobs tab (now 8 total).
4. Run the backfill script locally against Supabase (`--months 16`); watch `gsc_sync_run` rows.
5. Next morning: check `[cron:gsc-snapshot] outcome=…`, then the digest after the first Monday-equivalent due date.
6. After ~1 week of snapshots, flip `refresh_mode` to `suggest`; consider `auto` once a few manual refreshes look good.

---

## 7. Risks & mitigations

| Risk                                                                                  | Mitigation                                                                                                                                     |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| GSC data delay/revision makes recent days lie                                         | Pull only ≤ `today − 3` (final data); catch-up re-pulls nothing newer.                                                                         |
| Migration applied to the wrong DB (#168)                                              | §3.9 manual-apply instructions; additive + re-run-safe SQL; `ALTER TYPE` outside transaction.                                                  |
| Vercel doesn't retry a failed cron                                                    | Daily ticks + due-checks self-heal ≤ 24 h (Autopilot precedent); snapshot catch-up re-pulls missed days automatically.                         |
| A refresh makes a ranking post worse                                                  | Human diff gate before every apply; 60 d cooldown; 28 d outcome measurement with digest callout; one-click rollback from `blog_post_revision`. |
| Core update floods the queue                                                          | Drift-adjusted R1 (site-median subtraction); min-impression floors; `refresh_draft_cap`.                                                       |
| Working copy leaks (public site, sitemap, linkable pages, draft cap, dedupe, publish) | `refresh_of_post_id` guards enumerated in Phase 4.5, each with a test; public surfaces already filter `status='published'`.                    |
| Refresh drafts starve Autopilot new content                                           | Draft-cap query excludes working copies; separate `refresh_draft_cap`.                                                                         |
| Concurrent runs double-pull or double-refresh                                         | Partial-unique-index locks (`gsc_sync_run`, `content_refresh` active-row, `autopilot_run` kind='refresh'); no advisory locks (pooler).         |
| Snapshot table growth                                                                 | Low-thousands rows/day; revisit with a monthly rollup after 12 months (follow-up issue).                                                       |
| Writer drifts off-topic on refresh                                                    | Brief pins intent + heading map; orchestrator's no-inventing rule unchanged; cannibalization checker runs with `currentPostSlug`.              |

---

## 8. Suggested PR slicing

1. **PR 1 — Phases 0+1:** schema + migration 0049, snapshot service/cron/backfill, resolver, read queries (closes #145).
2. **PR 2 — Phase 2:** cannibalization detection + report + dashboard card + digest email (closes #146).
3. **PR 3 — Phase 3:** decay rules, queue + UI, config knobs, seam routing (closes #147).
4. **PR 4 — Phase 4:** refresh writer mode, clone/guards, diff review, apply/rollback (closes #148).
5. **PR 5 — Phase 5:** durable workflow, auto mode, outcomes, digest completion (closes epic #144).

Per-PR gate: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `vitest` green across `apps/admin`, `packages/ai`, `packages/db`, `packages/shared`.

---

## 9. Cost & quota notes

- **GSC quota:** steady state ≈ 1–2 searchanalytics requests/day (one date, usually one page of ≤ 25 k rows) — noise against the ~30 k/day per-site limit. Backfill ≈ 480 requests once, throttled.
- **Model cost per refresh:** ≈ one Autopilot content run minus the image phase (agentic generation + 7 reviewers + orchestrator + extraction + one cheap summary call). At `refresh_draft_cap = 2` and weekly detection, auto mode stays low-single-digit runs/week.
- **DB:** snapshots are the only growing table; see §7. Rollup follow-up: aggregate to `(month, query, page)` after 12 months, keep daily for the trailing year.
