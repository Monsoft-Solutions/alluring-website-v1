# Refresh Loop Phase 5 — Autopilot Integration + Outcome Measurement (closes epic #144)

**Date:** 2026-08-19
**Status:** Proposed (all file/line claims verified against `master` @ `cee3c30`)
**Epic:** [#144 Refresh loop + GSC snapshots](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/144) — sub-issues #145–#148 all merged; this phase closes the epic itself
**Canonical plan:** `implementation-plans/2026-08-12-refresh-loop-epic-144.md` (§4 Phase 5, §5 autonomy contract) — this document expands that section into implementable detail against the post-PR-#189 codebase
**Builds on:** PR #187 (snapshots + cannibalization), PR #188 (decay queue), PR #189 (in-place refresh flow), epic #122 (autopilot workflow + run-lock pattern)

**Goal:** close the loop. Today every stage exists but a human presses **Run refresh** and nobody measures whether an applied refresh worked. After this phase: `auto` mode executes the top candidate on a daily cron through a durable workflow, a measurement job scores every applied refresh 28 days later, and the weekly `[SEO]` digest reports queue movement and outcomes. The only mandatory human touchpoint remains approving the diff.

---

## 0. Current state (verified)

What already exists and is load-bearing for this phase:

| Piece                      | Where                                                                                                                                                            | State                                                                                                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Execution driver           | `runRefreshForCandidate` in `apps/admin/lib/services/refresh-execution.service.ts:131`                                                                           | Monolithic single-request run (claim → brief → clone → generate/review/extract → summary → notify). Phase 5 decomposes it into workflow steps.                                      |
| Manual run route           | `apps/admin/app/api/admin/refresh/[id]/run/route.ts`                                                                                                             | Inline execution, `maxDuration = 800`; its own comment says Phase 5's workflow "replaces this single-request execution entirely".                                                   |
| Durable workflow precedent | `apps/admin/app/workflows/autopilot/` (`'use workflow'`/`'use step'`, `workflow` pkg `4.0.1-beta.48`)                                                            | `autopilotContentWorkflow` + idempotent `runPhaseStep` (status-check + processing-reset on retry) + `finalizeRunStep`.                                                              |
| Cron pre-flight pattern    | `startAutopilotContentJob` in `apps/admin/lib/services/autopilot.service.ts:584`                                                                                 | mode → cadence → failure rail → stale-checked lock → draft cap → queue check → `acquireRunLock` → deferred workflow import → `start()` from `workflow/api` → store `workflowRunId`. |
| Run table                  | `autopilot_run` — `kind` enum already contains `'refresh'`; lock = partial unique index on `(kind) WHERE status='running'`                                       | In prod (migration 0049).                                                                                                                                                           |
| Lifecycle columns          | `content_refresh.workflowRunId`, `.appliedAt`, `.measuredAt`, `.outcome` (`RefreshOutcome` jsonb)                                                                | In prod (0049/0050). **No new migration needed.**                                                                                                                                   |
| Outcome type               | `RefreshOutcome` in `packages/db/src/types/content-refresh.type.ts:68` — before/after `{clicks, impressions, avgPosition}`, `siteMedianPositionDelta`, `verdict` | Defined, never written.                                                                                                                                                             |
| Snapshot window reads      | `getPostWindowAggregates(startDate, endDate)`, `getPageWindowAggregates(...)`, `getSnapshotStatus()` in `apps/admin/lib/queries/gsc-snapshot.query.ts`           | Impression-weighted position, exactly what measurement needs.                                                                                                                       |
| Drift guard                | `computeSiteMedianPositionDelta` in `apps/admin/lib/utils/decay-rules.util.ts`                                                                                   | Reused as-is for outcome drift adjustment.                                                                                                                                          |
| Stale-run recovery         | `reapStaleRefreshRuns` (2 h cutoff) in `refresh-execution.service.ts:296`, called from the detect-decay tick                                                     | Ignores `workflowRunId` today; needs the cross-check once runs are durable.                                                                                                         |
| Digest                     | `notifySeoWeeklyDigest` in `apps/admin/lib/services/seo-digest-notification.service.ts:132`                                                                      | Sends findings + snapshot health only; queue entries and outcomes are the promised-but-missing sections.                                                                            |
| Run history UI             | `getRecentAutopilotRuns` (kind-agnostic) + `autopilot-status-card.component.tsx` (renders `run.kind`) + `autopilot-run-actions.component.tsx` (acknowledge)      | Refresh rows will appear automatically; needs summary line + badge/acknowledge verification.                                                                                        |
| Heartbeat                  | `JOBS.heartbeat` in `apps/admin/app/api/cron/[job]/route.ts:42`                                                                                                  | No-op `{outcome:'ok'}`.                                                                                                                                                             |
| Queue depth                | `getRefreshQueueDepth()` (counts pending + in_progress + ready_for_review) in `apps/admin/lib/queries/content-refresh.query.ts:73`                               | Reused by heartbeat; **not** the draft-cap counter (see §1).                                                                                                                        |

Config knobs (all shipped, `blog_ai_config`): `refreshMode` (`off`/`suggest`/`auto`, prod currently `off`), `refreshStaleMonths`, `refreshPositionDropThreshold`, `refreshCooldownDays`, `refreshDraftCap` (default 2).

---

## 1. Decisions for this phase

Locked decisions from the canonical plan §0 stand (human diff-gate always; images skipped; one lifecycle table). New decisions this phase forces:

1. **One execution path, durable everywhere.** Both the manual **Run refresh** button and the auto cron start the same `refreshContentWorkflow`. `runRefreshForCandidate` is deleted; its body becomes the workflow steps (building blocks stay exported for tests). The 800 s route budget and the "hope the request survives" model go away — the route only pre-flights and starts the workflow, exactly like `startAutopilotContentJob`.
2. **Pre-flight lives in `autopilot.service.ts`.** `startRefreshRunJob(trigger, candidateId?)` sits next to `startAutopilotContentJob` so it can reuse the module-private rails (`getLastCompletedAt`, `hasUnacknowledgedFailure`, `isLockHeldAfterStaleCheck`, `acquireRunLock`, `recordSkippedRun`) instead of exporting them. Refresh executions record `autopilot_run` rows with `kind='refresh'` for both triggers — that is what feeds the run-history card.
3. **Draft-cap semantics:** the cap counts `in_progress` + `ready_for_review` rows (work in flight or awaiting the human) — **not** `pending` (the queue is supposed to hold pending rows). A new `countActiveRefreshRuns()` in `content-refresh.query.ts` implements this; `getRefreshQueueDepth` keeps its current meaning for the dashboard card.
4. **Candidate claim happens in the pre-flight, not in a step** — mirroring how the autopilot run row is created before the workflow starts. Order: acquire run lock (`kind='refresh'`) → claim candidate `pending → in_progress` (the update-where-pending from today's driver) → `start()` → store the workflow run id on **both** `autopilot_run.workflowRunId` and `content_refresh.workflowRunId`. If claim or start fails, the run row is finalized (`skipped`/`failed`) so the lock frees immediately.
5. **Phase steps are reused, not rewritten.** The refresh workflow imports `runPhaseStep` from `../autopilot/run-phase.step` for `generate → review → extract` — it is already idempotent on post status and refresh working copies ride the same status machine. (Verify at implementation that the workflow bundler accepts a step imported across workflow modules; fallback is a one-line local re-export.)
6. **Outcome eligibility requires a full final-data window:** measure when `appliedAt + 28d ≤ latest snapshot date` (from `getSnapshotStatus()`), not merely "applied ≥ 28 d ago" — snapshots stop at `today − 3`, so the naive rule would measure with a hole in the after-window.
7. **Verdict rule (deterministic, conflict-safe):** compute `improvedSignal` = clicks_after ≥ 1.10 × clicks_before OR drift-adjusted position delta ≤ −1.0; `declinedSignal` = clicks_after ≤ 0.90 × clicks_before OR drift-adjusted delta ≥ +1.0. Exactly one signal → that verdict; both or neither → `flat`. Min-data floor: if `before.impressions + after.impressions < 100`, verdict is `flat` (percentage noise on tiny posts must not trigger digest alarms).
8. **New skip reason:** extend the `AutopilotSkipReason` union (`packages/db/src/types/autopilot.type.ts:40`) with `'candidate-not-pending'` for a manual start that loses the claim race. Type-only change — the column is `varchar(40)`.
9. **Cadence:** the refresh content job is due-checked with a fixed `'daily'` cadence via `isCadenceDue` + `getLastCompletedAt('refresh')` — no new config knob. The daily 10:00 cron tick is the cadence; the rails decide whether it acts.

---

## 2. Work breakdown

### 2.1 Durable refresh workflow

New: `apps/admin/app/workflows/refresh/refresh-content.workflow.ts`

```ts
export type RefreshContentWorkflowInput = {
    runId: string // autopilot_run row (kind='refresh'), created + locked by pre-flight
    candidateId: string // content_refresh row, already claimed in_progress
}
```

Flow (`'use workflow'`): `prepareRefreshStep` → `runPhaseStep({postId: workingPostId, phase})` for `generate`, `review`, `extract` → `finalizeRefreshStep`. Any failed phase short-circuits to `finalizeRefreshStep` with the error.

New steps (each `'use step'`, each idempotent because steps re-run after crashes):

- **`prepare-refresh.step.ts`** — re-validate the original is still `published` with content; build the brief via `buildRefreshBrief` and store it on the candidate; create the working copy via `duplicateForRefresh` and store `workingPostId`. Idempotency: if `candidate.brief` exists, reuse it; if `candidate.workingPostId` exists, return it instead of cloning again (this is the guard against a crash between insert and update producing an orphan clone).
- **`finalize-refresh.step.ts`** — on success: working copy → `status='draft'`; best-effort change summary via `summarizeRefreshChanges` (same try/catch as today, `refresh-execution.service.ts:219-241`); candidate → `ready_for_review` + `notifyRefreshReadyForReview`; run row → `completed` (reuse `finalizeRunStep` semantics: `postId` = **original** post id — stable after the working copy is deleted on apply — `topicTitle` = post title). On failure: candidate → `failed` with the error (working copy kept for inspection, as today), run row → `failed`, and `notifyAutopilotFailure({kind:'refresh', …})` so the failure rail + acknowledge flow engage. Idempotency: skip whatever is already done by checking `content_refresh.status` first (`ready_for_review`/`failed` → return recorded result).

`refresh-execution.service.ts` refactor: export `claimRefreshCandidate(candidateId)` (today's lines 136-156) for the pre-flight; keep `duplicateForRefresh`, `applyRefresh`, `rollbackRevision`, `reapStaleRefreshRuns`; delete `runRefreshForCandidate` (its callers move to the workflow).

### 2.2 Pre-flight + auto-mode cron (`autopilot-refresh`)

New in `autopilot.service.ts`: `startRefreshRunJob(trigger: AutopilotTriggerSource, candidateId?: string)` mirroring `startAutopilotContentJob:584-697` line for line, with these rails in order:

1. `refreshMode === 'off'` → skip `mode-off` (no run row, matching the content job).
2. Cron only: `refreshMode === 'suggest'` → skip `mode-off` semantics (the canonical plan's "auto-mode no-op") — manual trigger proceeds in `suggest`, that's the button's whole point.
3. Cron only: `isCadenceDue('daily', await getLastCompletedAt('refresh'))` → else skip `cadence-not-due` (collapsed-row recording via `recordSkippedRun`).
4. `hasUnacknowledgedFailure('refresh')` → skip `unacknowledged-failure` (blocks manual too, exactly like content — the acknowledge button on the run card is the release valve).
5. `isLockHeldAfterStaleCheck('refresh')` → skip `locked` (gets the `getRun` workflow-liveness cross-check for free).
6. `countActiveRefreshRuns() >= config.refreshDraftCap` → skip `draft-cap` (both triggers, like content's cap).
7. Candidate selection: manual → the given `candidateId`; cron → top `pending` by `score DESC, created_at ASC`. None → skip `queue-empty`.
8. `acquireRunLock('refresh', trigger, mode)` → null → skip `locked`.
9. `claimRefreshCandidate(id)` — claim lost → finalize run `skipped` with `candidate-not-pending` (manual gets a 409 back).
10. Deferred-import `refreshContentWorkflow`, `start(workflow, [{runId, candidateId}])`, write `workflowRunId` to both rows; catch → run row + candidate → `failed` + `notifyAutopilotFailure`.

Cron wiring: `JOBS['autopilot-refresh']` in `apps/admin/app/api/cron/[job]/route.ts` calling `startRefreshRunJob('cron')`; `vercel.json` gets `{ "path": "/api/cron/autopilot-refresh", "schedule": "0 10 * * *" }`.

### 2.3 Manual run route becomes a starter

`apps/admin/app/api/admin/refresh/[id]/run/route.ts`: `requireAuth` → `startRefreshRunJob('manual', id)` → 200 `{started: true, runId}` / 409 (`candidate-not-pending`) / 409-with-reason for skips (`draft-cap`, `unacknowledged-failure`, `locked`) so the UI can toast the actual blocker. Drop `maxDuration = 800` (starting a workflow is instant). Update the queue-page client action's toast copy from "running…" to "Refresh started — you'll get an email when the draft is ready" (the queue row's status chip already tracks `in_progress → ready_for_review` on reload).

### 2.4 Outcome measurement (`refresh-outcomes` cron)

New service `apps/admin/lib/services/refresh-outcome.service.ts` with `runRefreshOutcomesJob(trigger)`:

1. Eligibility query: `content_refresh` where `status='applied'`, `measured_at IS NULL`, `applied_at + 28d ≤ getSnapshotStatus().latestDate` (decision §1.6).
2. Per candidate: windows `before = [appliedAt−28d, appliedAt−1d]`, `after = [appliedAt+1d, appliedAt+28d]` (apply-day excluded — it's split-state). Post metrics from `getPostWindowAggregates(start, end)` filtered to the candidate's `blogPostId`; drift from `computeSiteMedianPositionDelta` over `getPageWindowAggregates` for the same two windows (identical to the detect-decay usage).
3. Verdict per decision §1.7 → write `outcome` (full `RefreshOutcome` shape) + `measuredAt`.
4. Returns `{outcome: 'measured'|'nothing-due', measured, verdicts: {improved, flat, declined}}` for the cron log line.

No run-lock table needed: the job is a pure idempotent upsert (`measured_at IS NULL` makes re-runs no-ops), matching how `detect-decay` runs bare.

Cron wiring: `JOBS['refresh-outcomes']`; `vercel.json` `{ "path": "/api/cron/refresh-outcomes", "schedule": "20 6 * * *" }` — after gsc-snapshot (06:00) so it sees the freshest final data, before detect-decay (06:40) and the digest (07:00).

### 2.5 Digest completion

`notifySeoWeeklyDigest` gains two optional sections (inputs assembled in `runCannibalizationReportJob` alongside the existing ones):

- **Refresh queue this week:** active candidates created in the digest window — post title, signal sources, score, status — from a new `getQueueEntriesSince(date)` in `content-refresh.query.ts`. Empty → one "queue is quiet" line.
- **Measured outcomes this week:** candidates with `measured_at` in the window — verdict, clicks before→after, weighted position before→after. Every `declined` row gets a one-line callout linking to the post's editor (same link target the diff screen's **Open in editor** action uses), where the revision list + rollback button live (PR #189).

Subject line stays cannibalization-led; the digest remains one weekly email throttled by `email_log`.

### 2.6 Run-history card + failure acknowledgment

`getRecentAutopilotRuns` already interleaves kinds, and the status card already prints `run.kind` — refresh rows appear with zero query changes. Small finishing work in `autopilot-status-card.component.tsx` / `autopilot-run.query.ts`:

- Add a refresh line to `AutopilotStatusSummary` (last refresh run + `refreshMode`), next to the existing ideation/content lines.
- Verify the kind badge styling covers `'refresh'` and the acknowledge action (`autopilot-run-actions.component.tsx`) works on a failed refresh run — it operates on run ids, so this should be verification, not code.

### 2.7 Heartbeat upgrade

`JOBS.heartbeat` becomes async and returns `{outcome: 'ok', snapshotLagDays, refreshQueueDepth, activeRefreshRuns}` — lag = days between `getSnapshotStatus().latestDate` and `today − 3` (0 = healthy), depth from `getRefreshQueueDepth()`, active from `countActiveRefreshRuns()`. The dispatch route already JSON-logs the result object's `outcome`; have the handler `console.log` one `[cron:heartbeat] snapshotLagDays=… queueDepth=…` line so ops reads loop health in a single log entry.

### 2.8 Stale-run reaper cross-check

`reapStaleRefreshRuns` (`refresh-execution.service.ts:296`): before failing a stale `in_progress` candidate whose `workflowRunId` is set, check `getRun(workflowRunId).status` — `pending`/`running` → leave it alone (durable runs may legitimately exceed 2 h; that was the whole point). Mirrors `isLockHeldAfterStaleCheck:131-144`. Candidates without a `workflowRunId` (legacy inline runs, failed starts) keep the current 2 h rule.

---

## 3. Cron schedule after this phase (9 total)

| UTC       | Job                                    | New?           |
| --------- | -------------------------------------- | -------------- |
| 06:00     | gsc-snapshot                           |                |
| **06:20** | **refresh-outcomes**                   | **new**        |
| 06:40     | detect-decay (+ stale-refresh reap)    |                |
| 07:00     | cannibalization-report → weekly digest | sections added |
| 08:00     | heartbeat                              | upgraded       |
| 09:00     | autopilot-ideation                     |                |
| **10:00** | **autopilot-refresh**                  | **new**        |
| 11:00     | autopilot-content                      |                |
| \*/10     | reap-stuck-posts                       |                |

Ordering rationale: outcomes read the morning's fresh snapshots; the digest (weekly due-check) reports outcomes measured the same morning; refresh runs before content so the day's token budget favors freshness over volume — the epic's thesis.

---

## 4. Tests (vitest, `apps/admin`)

1. **Verdict math** (`refresh-outcome`): improved/declined/flat on each boundary (±10 % clicks, ±1.0 drift-adjusted position), conflict → flat, min-data floor → flat, drift subtraction actually applied.
2. **Eligibility window:** candidate applied 28 d ago with snapshots lagging → not eligible; eligible once `latestDate` catches up; `measured_at` set → never re-measured.
3. **Pre-flight rails** (`startRefreshRunJob`): each skip reason fires in order (mode-off, suggest-cron no-op, cadence, unacknowledged-failure, locked, draft-cap, queue-empty, candidate-not-pending), manual-in-suggest proceeds, lock freed on failed start.
4. **`countActiveRefreshRuns`** counts `in_progress` + `ready_for_review` only.
5. **Step idempotency:** `prepareRefreshStep` re-entry with existing brief/workingPostId creates nothing new; `finalizeRefreshStep` re-entry after `ready_for_review` is a no-op.
6. **Reaper cross-check:** live workflow → candidate untouched; dead/absent workflow → failed (existing behavior).
7. **Digest sections** render populated and empty states without breaking the existing findings/snapshot blocks.

Gate: `pnpm lint`, `pnpm typecheck`, `pnpm build`, vitest green across `apps/admin`, `packages/ai`, `packages/db`, `packages/shared`.

---

## 5. Verification (local clone, then prod)

**No migration.** Sanity-check before starting: `\d content_refresh` shows `workflow_run_id`, `measured_at`, `outcome`; `autopilot_run_kind` enum contains `refresh` (all shipped in 0049/0050 — see [[drizzle-journal-drift-supabase]] for why we check the DB, not the journal).

Local E2E against the dev clone (`alluring-autopilot-dev`, which still holds ~19 queue entries and `refresh_mode='suggest'`):

1. `pnpm dev`, confirm the workflow dev runtime picks up the new workflow module (autopilot's already runs under `next dev`).
2. Manual path: **Run refresh** on a pending candidate → route returns instantly → candidate `in_progress` with `workflowRunId` → draft lands `ready_for_review` → email → diff screen unchanged.
3. Auto path: set `refresh_mode='auto'`, `apps/admin/scripts/trigger-cron.sh autopilot-refresh` → top-score candidate runs with no human action; second trigger same day skips `cadence-not-due`; with cap-many drafts staged it skips `draft-cap`.
4. Outcomes: hand-set one applied candidate's `applied_at` to ~35 d ago (snapshot backfill covers it), `trigger-cron.sh refresh-outcomes` → `outcome` jsonb + `measured_at` written, verdict sane; `trigger-cron.sh cannibalization-report` (after clearing the 6-day email throttle) → digest shows queue + outcome sections.
5. Failure rail: kill a run mid-phase (stop dev server), restart → workflow resumes; force a phase error → candidate `failed`, run row `failed`, refresh run visible on the status card, acknowledge unblocks the next start.

**Prod activation (after deploy):** confirm 9 crons in the Vercel dashboard → flip `refresh_mode` **off → suggest** in Blog → Settings (the long-pending activation step) → after a few approved suggest-mode refreshes, flip to **auto**. Auto still never applies — the diff gate stays human.

---

## 6. Risks

| Risk                                                                                        | Mitigation                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workflow bundler rejects the cross-module `runPhaseStep` import                             | Fallback: local re-export step file in `workflows/refresh/` (one line, same body).                                                                                                                 |
| Refresh + content workflows overlap (10:00 run still going at 11:00)                        | Fine by design — different posts, per-post `pipelineProcessingStatus`, separate run locks; token spend is the only shared resource and both are single-post runs.                                  |
| Outcome measured against a window contaminated by a second change (manual edit after apply) | Accepted for v1 — `updatedAt` bumps are visible in the admin; the digest callout links the editor where the revision list tells the story. Noted in the canonical plan §5 as tuning-job territory. |
| `declined` verdict panics the user into rollback for seasonal dips                          | Drift adjustment subtracts site-wide movement; min-data floor kills noise verdicts; digest wording says "consider rollback", never auto-acts.                                                      |
| Claim/lock deadlock between manual and cron starts                                          | Single lock order (run lock → candidate claim) on both paths; claim failure finalizes the run row immediately so the lock never dangles.                                                           |

---

## 7. Delivery

One PR — branch `feat/refresh-phase5-144`, title `feat(refresh): auto mode, durable workflow, outcome measurement (closes #144)`. Touches: `apps/admin` (workflows/refresh/\*, autopilot.service, refresh-execution.service, refresh-outcome.service, cron route, run route, digest service, queries, status card, vercel.json), `packages/db` (skip-reason type only). No migration, no new env vars, no `packages/ai` changes.
