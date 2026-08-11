# Autopilot — Epic #122 Implementation Plan

**Date:** 2026-08-11
**Status:** Ready to implement
**Epic:** [#122 Autopilot — scheduled content loop where the admin only reviews](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/122) (sub-issues #123–#127)
**Builds on:** PR #121 (Blog AI Settings, phase chaining), PR #170 (ideation gate, GSC topic sourcing, keyword ownership registry)
**Extends:** `implementation-plans/2026-08-11-blog-content-pipeline-v2.md`

---

## 0. Decisions (locked this session)

| Decision             | Choice                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope                | **Epic #122 only.** GEO content template (epic #134) is the immediately following implementation.                                                                                                                                                                                                                                                                                  |
| Cadence config       | **Presets only** (`daily` / `weekdays` / `weekly`), no raw cron expressions in v1. Vercel cron ticks daily; the service decides whether a run is due.                                                                                                                                                                                                                              |
| Execution model      | **Vercel Workflow** (already installed and in production use in `apps/admin`) drives the multi-minute pipeline run; the cron route is a thin authed trigger. Not `after()` chaining — see §2.1.                                                                                                                                                                                    |
| Scheduler            | **Vercel cron daily tick** — chosen over Upstash QStash and Inngest after review (2026-08-11). No new vendor; Workflow already carries step retries. Vercel cron's lack of trigger retries is closed by the interval-based due-check (§4 Phase 3), and the schedule the admin actually cares about (cadence, volume, pause) is edited in our own settings UI, never `vercel.json`. |
| Run lock             | **DB-backed** via a partial unique index on `autopilot_run` (`WHERE status = 'running'`). No advisory locks (Supabase transaction pooler makes them unreliable), no in-memory state (serverless).                                                                                                                                                                                  |
| Two schedules        | **Ideation and content run on independent cadences** (user requirement, 2026-08-11): an _ideation job_ tops up the pending-idea queue on its own schedule; a _content job_ selects from the queue and writes on its own schedule. Two cron entries, two cadence configs, `kind` column + per-kind lock on `autopilot_run`.                                                         |
| Defaults             | mode `off`, ideation cadence `weekly`, content cadence `weekly`, 1 post/run, draft cap 3. Matches the locked "modest cadence, refresh-heavy" decision (~2–4 new posts/month).                                                                                                                                                                                                      |
| Operational guidance | Recommend running in `ideas` mode until epic #134 lands, then enabling `full`. The plumbing supports both from day one.                                                                                                                                                                                                                                                            |

---

## 1. Corrections to the epic as written (what the research changed)

1. **#123 assumes `vercel.json` exists — it doesn't, anywhere.** The apps deploy to Vercel via dashboard-configured Git integration (README, `.gitignore`, `VERCEL_URL` usage, `@vercel/blob`, Vercel Workflow all confirm the platform). The cron config is a **new file at `apps/admin/vercel.json`** (admin is its own Vercel project with a Root Directory; paths are relative to it).
2. **The admin middleware will silently break naive cron.** `apps/admin/middleware.ts` guards _every_ route including `/api/**` (`PUBLIC_PATHS = ['/login', '/api/auth']`) and fails with a **307 redirect to `/login`**, not a 401. A Vercel cron request carries a bearer header but no `admin-auth` cookie → the job "succeeds" with a 200 HTML login page and the handler never runs. `/api/cron` must be added to `PUBLIC_PATHS`, with the `CRON_SECRET` bearer check inside the handler (timing-safe compare, ported from `apps/web/lib/api/withApiAuth.middleware.ts`).
3. **#124's "reuse `pipeline-phase.service.ts` chaining" doesn't survive serverless budgets.** `after()` work runs inside the same invocation and counts against `maxDuration`; the full pipeline (generate → 6 reviewers → orchestrator → extraction → images) needs well past any single route's budget. The repo already has the right primitive: **Vercel Workflow** (`workflow@4.0.1-beta.48`, `withWorkflow()` in `next.config`, two production workflows, a status-polling route, and the `.well-known/workflow` middleware carve-out). The autopilot run becomes a workflow with one step per phase, each step under its own budget.
4. **There is no headless entry into generation.** All four pipeline HTTP routes and every server action call `requireAuth()` (cookie HMAC). The three `run*PhaseForPost` service functions are auth-free, but **generation is inlined in `generate/route.ts:96-161`** and `createPipelinePost` (the gate enforcement point) is auth-coupled. Phase 0 extracts both into service-layer functions.
5. **The service functions self-chain.** `runReviewPhaseForPost` awaits `runExtractPhaseForPost`, which chains images. A workflow step calling one of them would run the rest of the pipeline inside that step. They gain a `{ chain?: boolean }` option (default `true`, preserving today's HTTP-driven behavior).
6. **Ideas are ephemeral.** Generated topics live only in React state; only clicked ones become `ideation` posts, and gate verdicts from the generate-topics route are never persisted. The approval queue (#126) requires persisting autopilot-generated ideas as `ideation` posts with a first-class approval column — following the repo's own direction (the former `blog_idea` table was deliberately folded into `blog_post`).
7. **`refresh` verdicts are currently dead ends.** `createPipelinePost` refuses both `reject` _and_ `refresh`. Autopilot must not silently drop refresh candidates — they're recorded on the run (`refreshCandidates` jsonb) as the seam for epic #144's refresh flow.
8. **The email stack lives entirely in `apps/web`.** `apps/admin` has no `resend` dependency and no `RESEND_*`/`OWNER_EMAIL` in its env schema. #127 needs a minimal admin-local Resend service (plain HTML, no react-email dep), logging into the existing `email_log` table.
9. **Stuck posts would deadlock autopilot.** `processingStartedAt` is written but never evaluated, and there is no reaper (#156 is open). The "skip when previous run errored" rail would wedge forever on a post stuck in `processing`. The run pre-flight includes minimal staleness handling (§4.3).
10. **Two-database gotcha is still live (#168).** `pnpm db:migrate` targets DigitalOcean while the admin runs on Supabase. Migration 0047 must be **generated normally but applied to the admin Supabase DB manually** (like 0044/0046). Additive-only.
11. **Quality visibility.** Since the admin stops watching every run, the orchestrator's quality score is persisted per run and surfaced in run history and the draft-ready email — the score is how review time gets spent efficiently.

---

## 2. Architecture

```
vercel.json cron (daily tick, e.g. 0 11 * * * UTC ≈ 6am ET)
        │  GET /api/cron/autopilot   Authorization: Bearer CRON_SECRET
        ▼
/api/cron/[job]/route.ts        ← public in middleware, bearer-checked in handler
        │  pre-flight: mode ≠ off? cadence due (interval-based)? draft cap?
        │  unacknowledged failure? stale-run check?
        │  acquire lock: INSERT autopilot_run (status='running')
        │        └─ unique-violation → record 'skipped', return
        ▼
Vercel Workflow: autopilot-run.workflow.ts        (durable, step-budgeted)
   step 1  select-topic     approved-ideas queue → else (full mode) GSC-seeded
                            ideation + ownership gate; refresh verdicts recorded
   step 2  create-post      createPipelinePostInternal → status 'generate'
   step 3  generate         runGenerationPhaseForPost(id, {chain:false})
   step 4  review           runReviewPhaseForPost(id, {chain:false})
   step 5  extract          runExtractPhaseForPost(id, {chain:false})
   step 6  images           runImageGenerationPhaseForPost(id, {chain:false}) → draft
   step 7  finalize         run → 'completed' (+score), notification email
   (loop steps 1–6 for postsPerRun; concurrency 1; failure → run 'failed' + email)
```

**Two jobs, two schedules** (`/api/cron/autopilot-ideation`, `/api/cron/autopilot-content` — both daily ticks; each job's interval-based due-check applies its own configured cadence):

- **Ideation job** (runs in `ideas` and `full` modes): GSC-seeded topic generation → ownership gate → similarity dedupe vs pending/rejected ideas → tops the pending queue up to `ideasPerRun`. Never writes content.
- **Content job**: picks the next topic and drives generate → review → extract → images to **Draft** via the workflow. In `ideas` mode it writes **approved ideas only** (empty queue → skip). In `full` mode it writes approved first, then the best-ranked gate-passing _pending_ idea, then falls back to inline ideation if the queue is empty.
- Each job records its own `autopilot_run` row (`kind: 'ideation' | 'content'`) and holds its own lock; the jobs never block each other.
- Manual "Run now" button in settings starts the same workflow (`trigger: 'manual'`, bypasses the cadence check, still respects lock/cap/mode).

### 2.1 Why a workflow and not `after()` chaining

Each phase route budgets 30–300s of `maxDuration`, and `after()` callbacks share that budget — the existing admin-triggered flow already sails close to the wind (generate's 180s window also hosts the entire review phase). A cron-triggered _full_ run compounds every phase into one invocation. Workflow steps each get a fresh budget, survive restarts, retry idempotently (each phase service already validates the expected post status before running, so a re-run of a completed step no-ops), and the `/api/workflow/[runId]` polling route exists for UI status.

---

## 3. Schema (migration `0047_*`, additive only)

### 3.1 `blog_ai_config` — new columns

File: `packages/db/src/schema/blog/blog-ai-config.table.ts`

| Column                       | Type                                                           | Default  |
| ---------------------------- | -------------------------------------------------------------- | -------- |
| `autopilot_mode`             | pgEnum `autopilot_mode` (`off` \| `ideas` \| `full`)           | `off`    |
| `autopilot_ideation_cadence` | pgEnum `autopilot_cadence` (`daily` \| `weekdays` \| `weekly`) | `weekly` |
| `autopilot_content_cadence`  | pgEnum `autopilot_cadence` (same enum)                         | `weekly` |
| `autopilot_posts_per_run`    | integer (1–3, zod-enforced)                                    | `1`      |
| `autopilot_draft_cap`        | integer (pause when ≥ N posts sit in `draft`)                  | `3`      |
| `autopilot_ideas_per_run`    | integer (ideas-mode queue top-up size, 3–10)                   | `5`      |

Ripple updates (established pattern from `ideationModelId` in PR #170): `apps/admin/lib/queries/blog-ai-config.query.ts` (hand-written `BlogAiConfig` type + `DEFAULT_BLOG_AI_CONFIG` + mapping block), `apps/admin/lib/actions/blog-ai-config.action.ts` (zod schema).

### 3.2 `autopilot_run` — new table

File: `packages/db/src/schema/blog/autopilot-run.table.ts` (blog subpath is a declared package export; re-export via `blog/index.ts` + `schema/index.ts`). Modeled on `media_analysis` (the repo's existing run-table precedent).

```ts
autopilotRunStatus = pgEnum('autopilot_run_status', ['running','completed','skipped','failed'])
autopilotTrigger   = pgEnum('autopilot_trigger', ['cron','manual'])

autopilotRunKind   = pgEnum('autopilot_run_kind', ['ideation','content'])

autopilot_run:
  id uuid pk defaultRandom
  kind           autopilotRunKind notNull
  trigger        autopilotTrigger notNull default 'cron'
  mode           varchar(10) notNull            -- config snapshot at run time
  status         autopilotRunStatus notNull default 'running'
  skip_reason    text                           -- cadence-not-due | draft-cap | mode-off | locked | gate-rejected-all | unacknowledged-failure
  topic_title    text
  post_id        uuid FK → blog_post.id, on delete set null
  workflow_run_id varchar(120)                  -- Vercel Workflow runId, for status cross-check
  phase_outcomes jsonb $type<AutopilotPhaseOutcome[]>   -- [{phase, status, durationMs, error?}]
  refresh_candidates jsonb $type<RefreshCandidate[]>    -- gate 'refresh' verdicts (seam for #144)
  quality_score  integer                        -- orchestrator score, when available
  error          text
  acknowledged_at timestamp                     -- failure-acknowledgment rail
  started_at     timestamp notNull defaultNow
  finished_at    timestamp
  created_at / updated_at
indexes: (status), (started_at desc), partial UNIQUE on kind WHERE status = 'running'   ← one lock per job kind
```

Types (`AutopilotPhaseOutcome`, `RefreshCandidate`) live in `packages/db/src/types/` beside `blog-pipeline.type.ts`.

### 3.3 `blog_post` — idea approval

| Column          | Type                                                                                | Notes                                                                                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `idea_approval` | pgEnum `idea_approval_status` (`pending` \| `approved` \| `rejected`), **nullable** | Only meaningful while `status = 'ideation'`. Manual creates → `approved` (admin intent is explicit). Autopilot-generated ideas → `pending`. Legacy rows → null (treated as approved for backward compat). |

Rejection reason + timestamp go in `planningData.ideaRejection = { reason?, rejectedAt }` (same jsonb pattern as `ideationGate`). Index: `(status, idea_approval)`.

### 3.4 Applying the migration

`pnpm db:generate` → review SQL → **apply to the admin Supabase DB manually** (the `db:migrate` script targets the DigitalOcean DB — #168 unresolved). Record it in the migration journal note the way 0044/0046 were handled.

---

## 4. Phased implementation

### Phase 0 — Service-layer prerequisites (unblocks everything headless)

1. **Extract `runGenerationPhaseForPost(postId, opts?)`** from `apps/admin/app/api/blog/posts/[id]/pipeline/generate/route.ts:96-161` into `pipeline-phase.service.ts`. The route becomes: auth → validation → call service → `after(() => runReviewPhaseForPost(id))`. Behavior-identical for the UI path.
2. **`{ chain?: boolean }` option (default `true`)** on all four `run*PhaseForPost` functions; `chain: false` skips the tail call so the workflow owns sequencing.
3. **Extract `createPipelinePostInternal(data)`** from `apps/admin/lib/actions/blog.action.ts:409-480`: gate evaluation + insert, no `requireAuth()`, no `revalidatePath`. The server action wraps it (auth + revalidate). An `allowPending?: boolean` flag lets autopilot insert `idea_approval: 'pending'` ideas; the internal function also accepts an `ideaApproval` value so manual creates set `approved`.

**Verify:** existing UI pipeline flow unchanged (drag a card through generate → draft); `pnpm typecheck && pnpm build`.

### Phase 1 — Cron infrastructure (#123)

1. **`apps/admin/vercel.json`** (new file):
    ```json
    {
        "crons": [
            { "path": "/api/cron/heartbeat", "schedule": "0 8 * * *" },
            { "path": "/api/cron/autopilot-ideation", "schedule": "0 9 * * *" },
            { "path": "/api/cron/autopilot-content", "schedule": "0 11 * * *" }
        ]
    }
    ```
    Ideation ticks two hours before content so a full-mode run can write same-day ideas; 11:00 UTC ≈ 6am EST / 7am EDT — drafts are waiting when the admin starts the day. DST wobble accepted.
2. **`apps/admin/app/api/cron/[job]/route.ts`** — GET (Vercel cron issues GETs), `runtime = 'nodejs'`, small `maxDuration` (the route only pre-flights and starts a workflow):
    - Bearer check: timing-safe compare against `env.CRON_SECRET` (port the `timingSafeEqual` + length-padding pattern from `apps/web/lib/api/withApiAuth.middleware.ts`). 503 if `CRON_SECRET` unset; 401 on mismatch.
    - Job registry: `heartbeat` (logs + returns ok — proves schedule, auth, and middleware carve-out in production) and `autopilot` (Phase 3).
    - Structured log line per invocation: `[cron:{job}] outcome=… durationMs=…`.
3. **Middleware carve-out:** add `'/api/cron'` to `PUBLIC_PATHS` in `apps/admin/middleware.ts:7`. (Auth moves into the handler — same trust model as `apps/web`'s bearer routes.)
4. **`CRON_SECRET` registration (all three convention sites):** `apps/admin/env.ts` (`z.string().min(32).optional()` — optional so builds don't fail before the Vercel env var exists; route 503s when unset), `apps/admin/env.example` (with `openssl rand -base64 32` hint), `turbo.json` **both** `tasks.build.env` and `tasks.dev.env` arrays. Vercel automatically sends `Authorization: Bearer $CRON_SECRET` on cron requests when the project env var is set.
5. **Local trigger script:** `apps/admin/scripts/trigger-cron.sh <job>` — curl with `$CRON_SECRET` against `localhost:3105`.

**Verify (issue acceptance):** heartbeat runs on schedule in production (Vercel cron logs + our log line) and via the local script; a request without/with-wrong bearer gets 401, not a login redirect. Concurrent-trigger rejection is exercised in Phase 3 (the lock lives on `autopilot_run`).

### Phase 2 — Schema + settings (#125, plus #127's table)

1. Migration 0047 per §3 (config columns + `autopilot_run` + `idea_approval`). Apply to Supabase manually.
2. **"Autopilot" card** in `apps/admin/components/blog/blog-ai-settings-form.component.tsx` (same single-form/`useState`/sonner pattern as the existing Text Models and Imagery cards):
    - Mode select (`off`/`ideas`/`full`) with one-line explanations; ideas-mode is described as the recommended starting point.
    - Cadence select, posts-per-run (1–3), draft cap, ideas-per-run.
    - Status strip (server-rendered on the settings page): last run outcome + time, drafts awaiting review count, "Run now" button (server action → same pre-flight + workflow start, `trigger: 'manual'`).
3. Zod bounds in `blog-ai-config.action.ts` (`postsPerRun` 1–3, caps ≥ 1 etc.).

**Verify (issue acceptance):** settings round-trip (save → reload); Phase 3 proves the service honors them.

### Phase 3 — Autopilot service + workflow (#124)

1. **`apps/admin/lib/services/autopilot.service.ts`** — pre-flight + topic selection, all pure/testable:
    - `isRunDue(config, now)`: **interval-based and self-healing**, not strict day-of-week — `daily` → no `completed` run in the last ~20h; `weekdays` → Mon–Fri in **America/New_York** and no `completed` run in ~20h; `weekly` → no `completed` run in the last 6 days. A failed or missed tick is picked up by the next daily tick instead of forfeiting the whole period (this is what makes Vercel cron's no-retry acceptable). Plus: mode ≠ `off`; drafts-in-`draft` count < cap; most recent `failed` run is acknowledged (`acknowledged_at` set).
    - **Stale-run handling:** a `running` run older than 30 min → cross-check `getRun(workflowRunId)`; genuinely still running → skip (respect lock); dead/failed → mark that run `failed`, proceed. (Minimal slice of #156; the full stuck-_post_ reaper stays in that issue.)
    - `selectNextTopic(config)`: approved-ideas queue first — `blog_post` where `status='ideation' AND idea_approval='approved'`, ordered `priority desc, created_at asc`. Empty queue + `full` mode → headless ideation: `getGscTopicSeeds()` → `generateBlogTopics({ modelId: config.ideationModelId, mode: 'search-console' })` → `evaluateTopicCandidates()` → keep `verdict === 'new'`, rank GSC-sourced candidates by impressions first; record all `refresh` verdicts on the run. All candidates rejected → run ends `skipped` / `gate-rejected-all` (issue's abort-cleanly acceptance).
    - Every topic — including previously-approved ideas — passes `evaluateSingleTopic` again at write time (the registry may have gained an owner since approval).
2. **`apps/admin/app/workflows/autopilot/autopilot-run.workflow.ts`** (+ step files, mirroring `bulk-inline-images.workflow.ts` structure) — steps per §2, sequential, concurrency 1, loops `postsPerRun` times but re-checks the draft cap between posts. Failure in any step → run `failed` with `phase_outcomes` + `error`; the post keeps its normal `processing_status='error'` state so the existing Kanban retry UI works on it.
3. **Cron job wiring:** the `autopilot` job in `/api/cron/[job]` runs pre-flight, inserts the `running` row (unique-violation → `skipped`/`locked`), starts the workflow, stores `workflow_run_id`, returns.
4. Quality score: captured from the review/orchestrator output (as stored in `pipelineState`) into `autopilot_run.quality_score`.

**Verify (issue acceptance):** with an approved idea queued, one local trigger produces a complete Draft (content + metadata + FAQs + featured image) with zero human action; a run where the gate rejects every candidate ends `skipped` with `gate-rejected-all`; two concurrent triggers → one `running`, one `skipped/locked`. Unit tests: `isRunDue` (all cadences, cap, unacknowledged failure), topic ranking, stale-run logic, lock violation path.

### Phase 4 — Idea approval queue (#126)

1. **Persist autopilot ideas:** ideas-mode runs top up the queue to `ideasPerRun` pending ideas via `createPipelinePostInternal(…, { ideaApproval: 'pending' })`, each carrying `planningData.ideationGate` (verdict, claimed queries) and `planningData.topic` — verdicts finally persist for board rendering.
2. **Kanban idea cards** (`pipeline-card.component.tsx`, `status === 'ideation'`): show primary keyword, intent, angle, gate badge (new/refresh + owned queries — data already in `planningData.ideationGate`); `pending` cards get **Approve** / **Reject** actions (reject opens an optional-reason dialog). New server actions `approveIdea(id)` / `rejectIdea(id, reason?)` in `blog.action.ts`.
3. **Rejected ideas are remembered:** rejected rows stay in the DB (`idea_approval='rejected'`), are excluded from the board query (`apps/admin/lib/queries/pipeline.query.ts`), and feed forward two ways: their titles/keywords are passed into the generate-topics prompt as a do-not-propose list, and new candidates are similarity-checked (normalized-token overlap, same approach as `topic-gate.util.ts`) against pending + rejected ideas before insertion.
4. Queue ordering = existing `priority` enum + FIFO; the admin reprioritizes with the existing priority control.

**Verify (issue acceptance):** approve exactly one idea → next scheduled run writes exactly that post; reject an idea → subsequent ideation runs never re-propose it (test the similarity check with a paraphrase).

### Phase 5 — Run history + notifications (#127)

1. **Run history UI:** "Recent runs" section under the Autopilot settings card — last 10 runs (started, trigger, mode, topic → post link, status, quality score, skip reason/error) + **Acknowledge** button on failed runs (sets `acknowledged_at`, releasing the failure rail). Query in `apps/admin/lib/queries/autopilot-run.query.ts`. Pipeline board banner when drafts ≥ cap ("Autopilot paused: N drafts awaiting review").
2. **Email service (admin-local):** add `resend` to `apps/admin`; `apps/admin/lib/services/autopilot-notification.service.ts` with brand-minimal inline-HTML templates (no react-email dependency); every send logged to the existing `email_log` table (`to/from/subject/status/resendEmailId/error`). Env: add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `OWNER_EMAIL` to `apps/admin/env.ts` (optional → service no-ops with a log line when unset), `env.example`, and `apps/admin/.env` + Vercel (`OWNER_EMAIL` is currently missing there entirely). `turbo.json` already allowlists all three.
3. **Notification matrix:** run **failed** → immediate email (error + run link). Run **completed** → "Draft ready" email (title, quality score, admin link). Skipped for **draft-cap** → at most one reminder email per 24h ("N drafts awaiting review"). Other skip reasons: history only, no email.

**Verify (issue acceptance):** every run outcome (success/skip/failure) queryable in the UI; a forced failure produces the email (and an `email_log` row); cap-skip email throttles.

---

## 5. Content-quality measures inside this scope

Epic #134 carries the content _format_ work, but autopilot itself ships with quality levers:

- **Demand-evidenced topics by default:** headless ideation always uses the GSC-seeded mode (gaps → opportunities → decay) rather than model brainstorming, and ranks candidates by real impressions.
- **Cannibalization-safe by construction:** the ownership gate runs at ideation _and again at write time_; refresh verdicts are preserved for the refresh loop instead of being dropped.
- **Quality score as the review currency:** every run records the orchestrator score; the draft-ready email leads with it so the admin triages review time toward weak drafts.
- **Volume discipline:** defaults (weekly, 1 post/run, cap 3) encode the "modest cadence" decision; the March 2026 core update punishes scaled undifferentiated output, and the cap makes unreviewed pile-ups impossible.
- **Recommended rollout:** `ideas` mode until #134's GEO template + geo-retrievability reviewer land, then `full`.

---

## 6. Deployment checklist (manual, Vercel dashboard)

1. Generate and set `CRON_SECRET` (≥32 chars) on the **admin** Vercel project — Vercel then signs cron requests with it automatically.
2. Set `OWNER_EMAIL` (and confirm `RESEND_API_KEY`/`RESEND_FROM_EMAIL`) on the admin project.
3. Apply migration 0047 to the admin Supabase DB (two-database gotcha, #168 still open).
4. Confirm the deploy picked up `apps/admin/vercel.json` (crons visible in the project's Cron Jobs tab; requires a Pro-plan project — already implied by the existing `maxDuration: 300` routes).
5. After first production heartbeat: check the log line, then flip mode to `ideas`.

## 7. Risks & mitigations

| Risk                                                                               | Mitigation                                                                                                                                                                          |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Middleware 307 masks cron failures (silent 200 on the login page)                  | Carve-out + handler-level bearer check land in the same PR as `vercel.json`; heartbeat acceptance test proves the path end-to-end in production before autopilot ships.             |
| `workflow` package is beta (`4.0.1-beta.48`)                                       | It already runs two production workflows in this app; autopilot reuses the exact established patterns (`'use workflow'`, step files, `getRun` polling). No new workflow primitives. |
| Migration applied to the wrong DB                                                  | Explicit checklist step; additive-only SQL is safe to re-run; #168 remains the structural fix.                                                                                      |
| Duplicate posts if lock fails                                                      | Lock is a DB unique index (not check-then-write); write-time gate re-check also rejects a topic the previous run just claimed.                                                      |
| Long-term wedge from a crashed workflow                                            | 30-min stale-run cross-check against `getRun` status; failed runs need explicit acknowledgment before autopilot resumes, so failures are always seen.                               |
| Email env unset in some environment                                                | Notification service no-ops with a structured log instead of throwing; runs never fail because of email.                                                                            |
| Vercel cron tick fails or is missed (the platform does not retry cron invocations) | The interval-based due-check self-heals on the next daily tick (≤24h); anything beyond that is visible in run history, and workflow-level failures email immediately.               |

## 8. Suggested PR slicing

1. **PR 1 — Phases 0+1:** service extractions + cron infra + heartbeat (safe, no behavior change for the UI path).
2. **PR 2 — Phase 2:** migration + settings card (dormant until mode ≠ off).
3. **PR 3 — Phase 3:** autopilot service + workflow (closes #124, and #123's lock acceptance).
4. **PR 4 — Phase 4:** idea approval queue (closes #126).
5. **PR 5 — Phase 5:** run history + notifications (closes #127, #125 acceptance fully provable).

Each PR: `pnpm lint`, `pnpm typecheck`, `pnpm build`, unit tests for the pure logic it adds (cadence, ranking, lock, similarity de-dup), plus the per-phase acceptance checks above.
