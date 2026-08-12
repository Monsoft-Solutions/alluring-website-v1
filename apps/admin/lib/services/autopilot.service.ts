/**
 * Autopilot Service
 *
 * The scheduled content loop (epic #122). Two independent jobs share this
 * service:
 *
 * - **Ideation job** (`runAutopilotIdeationJob`): tops the idea approval
 *   queue up to the configured size. Runs inline in the cron invocation —
 *   one model call, the ownership gate, and a few inserts.
 * - **Content job** (`startAutopilotContentJob`): pre-flights, acquires the
 *   run lock, and starts the durable content workflow that drives one post
 *   through generate → review → extract → images to Draft.
 *
 * Due-checks are interval-based and self-healing: the cron ticks daily and
 * each job decides whether its cadence is satisfied, so a failed or missed
 * tick is picked up by the next one instead of forfeiting the period.
 *
 * The run lock is the `autopilot_run` partial unique index (one `running`
 * row per kind) — acquiring the lock IS inserting the running row.
 *
 * @module @/lib/services/autopilot.service
 */
import { and, count, desc, eq, inArray, isNull, or } from 'drizzle-orm'
import { getRun, start } from 'workflow/api'

import { db } from '@workspace/db/client'
import { autopilotRun, blogPost } from '@workspace/db/schema/blog'
import type { AutopilotRun } from '@workspace/db/schema/blog'
import type { AutopilotSkipReason, RefreshCandidate } from '@workspace/db/types'
import { generateBlogTopics } from '@workspace/ai/functions'
import type { GscTopicSeed } from '@workspace/ai/functions'

import {
    getBlogAiConfig,
    type BlogAiConfig,
} from '@/lib/queries/blog-ai-config.query'
import { isCadenceDue, isNearDuplicateTopic } from '@/lib/utils/autopilot.util'
import {
    evaluateTopicCandidates,
    type GatedTopic,
} from '@/lib/services/ideation-gate.service'
import { getGscTopicSeeds } from '@/lib/services/topic-sourcing.service'
import { createPipelinePostInternal } from '@/lib/services/pipeline-post.service'
import { enqueueIdeationGateSignal } from '@/lib/services/content-refresh.service'
import {
    notifyAutopilotDraftCap,
    notifyAutopilotFailure,
} from '@/lib/services/autopilot-notification.service'

// ============================================
// Constants
// ============================================

/** A `running` run older than this is cross-checked against the workflow. */
const STALE_RUN_MINUTES = 30

// ============================================
// Shared job plumbing
// ============================================

export type AutopilotTriggerSource = 'cron' | 'manual'

export type AutopilotJobOutcome = {
    outcome: 'completed' | 'skipped' | 'failed' | 'started'
    detail: Record<string, unknown>
}

type RunKind = 'ideation' | 'content'

async function getLatestRun(kind: RunKind): Promise<AutopilotRun | null> {
    const [run] = await db
        .select()
        .from(autopilotRun)
        .where(eq(autopilotRun.kind, kind))
        .orderBy(desc(autopilotRun.startedAt))
        .limit(1)
    return run ?? null
}

async function getLastCompletedAt(kind: RunKind): Promise<Date | null> {
    const [run] = await db
        .select({ finishedAt: autopilotRun.finishedAt })
        .from(autopilotRun)
        .where(
            and(
                eq(autopilotRun.kind, kind),
                eq(autopilotRun.status, 'completed')
            )
        )
        .orderBy(desc(autopilotRun.startedAt))
        .limit(1)
    return run?.finishedAt ?? null
}

async function hasUnacknowledgedFailure(kind: RunKind): Promise<boolean> {
    const [run] = await db
        .select({ id: autopilotRun.id })
        .from(autopilotRun)
        .where(
            and(
                eq(autopilotRun.kind, kind),
                eq(autopilotRun.status, 'failed'),
                isNull(autopilotRun.acknowledgedAt)
            )
        )
        .limit(1)
    return Boolean(run)
}

/**
 * Cross-check a long-`running` run against its workflow. A run whose
 * workflow died (or that never recorded one) is marked failed so the lock
 * frees; a genuinely running workflow keeps the lock.
 *
 * @returns true when a live run still holds the lock
 */
async function isLockHeldAfterStaleCheck(kind: RunKind): Promise<boolean> {
    const [running] = await db
        .select()
        .from(autopilotRun)
        .where(
            and(eq(autopilotRun.kind, kind), eq(autopilotRun.status, 'running'))
        )
        .limit(1)

    if (!running) return false

    const ageMinutes = (Date.now() - running.startedAt.getTime()) / (1000 * 60)
    if (ageMinutes < STALE_RUN_MINUTES) return true

    if (running.workflowRunId) {
        try {
            const workflowRun = getRun(running.workflowRunId)
            const status = await workflowRun.status
            if (status === 'pending' || status === 'running') {
                return true
            }
        } catch (error) {
            console.warn(
                `[Autopilot] Could not read workflow ${running.workflowRunId} for stale check:`,
                error
            )
        }
    }

    console.warn(
        `[Autopilot] Reaping stale ${kind} run ${running.id} (${Math.round(ageMinutes)} min old)`
    )
    await db
        .update(autopilotRun)
        .set({
            status: 'failed',
            error: `Run went stale (no progress for ${Math.round(ageMinutes)} minutes) and was reaped`,
            finishedAt: new Date(),
        })
        .where(eq(autopilotRun.id, running.id))
    return false
}

/**
 * Acquire the run lock by inserting the `running` row.
 * Returns the run id, or null when another run of this kind holds the lock.
 */
async function acquireRunLock(
    kind: RunKind,
    trigger: AutopilotTriggerSource,
    mode: string
): Promise<string | null> {
    try {
        const [run] = await db
            .insert(autopilotRun)
            .values({ kind, trigger, mode, status: 'running' })
            .returning({ id: autopilotRun.id })
        return run?.id ?? null
    } catch (error) {
        // 23505 = unique violation on the partial running index
        if (
            error instanceof Error &&
            'code' in error &&
            (error as { code?: string }).code === '23505'
        ) {
            return null
        }
        throw error
    }
}

/**
 * Record an informative skipped run — but never two identical consecutive
 * skips, so a cap that holds for a week is one row, not seven.
 */
async function recordSkippedRun(
    kind: RunKind,
    trigger: AutopilotTriggerSource,
    mode: string,
    reason: AutopilotSkipReason,
    detail?: Partial<typeof autopilotRun.$inferInsert>
): Promise<void> {
    const latest = await getLatestRun(kind)
    if (latest?.status === 'skipped' && latest.skipReason === reason) return

    await db.insert(autopilotRun).values({
        kind,
        trigger,
        mode,
        status: 'skipped',
        skipReason: reason,
        finishedAt: new Date(),
        ...detail,
    })
}

/**
 * Posts currently sitting in Draft awaiting human review. Refresh working
 * copies are excluded — they have their own cap (`refresh_draft_cap`) and
 * must not starve new content (epic #144).
 */
export async function countDraftsAwaitingReview(): Promise<number> {
    const [row] = await db
        .select({ value: count() })
        .from(blogPost)
        .where(
            and(eq(blogPost.status, 'draft'), isNull(blogPost.refreshOfPostId))
        )
    return row?.value ?? 0
}

/** Pending (unapproved) autopilot ideas on the board. */
async function countPendingIdeas(): Promise<number> {
    const [row] = await db
        .select({ value: count() })
        .from(blogPost)
        .where(
            and(
                eq(blogPost.status, 'ideation'),
                eq(blogPost.ideaApproval, 'pending')
            )
        )
    return row?.value ?? 0
}

/**
 * The approved-ideas queue, best first: priority (urgent → low), then FIFO.
 * Legacy ideation posts with NULL approval predate the queue and were
 * created deliberately by an admin — they count as approved.
 */
export async function getApprovedIdeaQueue() {
    return db
        .select({
            id: blogPost.id,
            title: blogPost.title,
            primaryKeyword: blogPost.primaryKeyword,
            secondaryKeywords: blogPost.secondaryKeywords,
            priority: blogPost.priority,
            createdAt: blogPost.createdAt,
        })
        .from(blogPost)
        .where(
            and(
                eq(blogPost.status, 'ideation'),
                or(
                    eq(blogPost.ideaApproval, 'approved'),
                    isNull(blogPost.ideaApproval)
                )
            )
        )
        .orderBy(desc(blogPost.priority), blogPost.createdAt)
}

/**
 * Titles/keywords the ideation prompt must not re-propose: every idea on
 * the board (pending, approved, legacy, rejected) AND every post still in
 * flight through the pipeline. Published/scheduled posts are covered by the
 * ownership gate's live overlay instead — but a post sitting in generate or
 * draft claims nothing there yet, so it must be excluded here.
 */
async function getIdeaTitlesForDedupe(): Promise<
    Array<{ title: string; primaryKeyword: string | null; rejected: boolean }>
> {
    const rows = await db
        .select({
            title: blogPost.title,
            primaryKeyword: blogPost.primaryKeyword,
            ideaApproval: blogPost.ideaApproval,
        })
        .from(blogPost)
        .where(
            and(
                inArray(blogPost.status, [
                    'ideation',
                    'generate',
                    'ai_review',
                    'generate_metadata',
                    'generate_image',
                    'draft',
                    'ready_to_publish',
                ]),
                // A refresh working copy shares its original's title — it
                // must not make ideation think the topic is already taken
                // twice (epic #144).
                isNull(blogPost.refreshOfPostId)
            )
        )
    return rows.map((row) => ({
        title: row.title,
        primaryKeyword: row.primaryKeyword,
        rejected: row.ideaApproval === 'rejected',
    }))
}

// ============================================
// Topic sourcing (shared by ideation job and full-mode content run)
// ============================================

/** A topic as generateBlogTopics returns it (single source of truth). */
type SourcedTopic = Awaited<
    ReturnType<typeof generateBlogTopics>
>['topics'][number]

type TopicCandidateResult = {
    /** Gate-passing, dedupe-passing candidates, best first */
    fresh: Array<GatedTopic<SourcedTopic>>
    refreshCandidates: RefreshCandidate[]
    /** True when the model proposed topics but none survived the gate */
    allRejected: boolean
}

/**
 * Generate topic candidates the autopilot way: seeded from live GSC demand
 * when available, gated against the keyword ownership registry, and deduped
 * against every idea already on (or rejected from) the board.
 */
export async function sourceGatedTopicCandidates(
    config: BlogAiConfig
): Promise<TopicCandidateResult> {
    const existingIdeas = await getIdeaTitlesForDedupe()

    let gscSeeds: GscTopicSeed[] | undefined
    try {
        const seeds = await getGscTopicSeeds()
        gscSeeds = seeds.length > 0 ? seeds : undefined
    } catch (error) {
        console.warn(
            '[Autopilot] GSC seeds unavailable, falling back to model ideation:',
            error
        )
    }

    const result = await generateBlogTopics({
        gscSeeds,
        existingTopics: existingIdeas.map((idea) => idea.title),
        modelId: config.ideationModelId,
    })

    const gated = await evaluateTopicCandidates(result.topics)

    const refreshCandidates: RefreshCandidate[] = gated
        .filter((topic) => topic.gate.verdict === 'refresh')
        .map((topic) => ({
            title: topic.title,
            primaryKeyword: topic.primaryKeyword ?? undefined,
            owningUrl: topic.gate.owningUrl,
            reason: topic.gate.reason,
        }))

    const fresh = gated
        .filter((topic) => topic.gate.verdict === 'new')
        .filter((topic) => !isNearDuplicateTopic(topic, existingIdeas))
        // Demand-evidenced topics first (GSC-seeded carry a sourceQuery)
        .sort(
            (a, b) =>
                Number(Boolean(b.sourceQuery)) - Number(Boolean(a.sourceQuery))
        )

    return {
        fresh,
        refreshCandidates,
        allRejected: gated.length > 0 && fresh.length === 0,
    }
}

/** Map a sourced topic into pipeline planning data (same shape the manual
 * "Add to pipeline" flow writes). */
export function topicToPlanningData(topic: SourcedTopic) {
    return {
        topic: topic.description,
        uniqueAngle: topic.uniqueAngle || undefined,
        contentType: topic.suggestedContentType || undefined,
        targetAudience: topic.targetAudience || undefined,
        painPoints: topic.painPoints || undefined,
        estimatedWordCount: topic.estimatedWordCount ?? undefined,
    }
}

// ============================================
// Ideation job (runs inline in the cron invocation)
// ============================================

export async function runAutopilotIdeationJob(
    trigger: AutopilotTriggerSource
): Promise<AutopilotJobOutcome> {
    const config = await getBlogAiConfig()
    const mode = config.autopilotMode

    if (mode === 'off') {
        return { outcome: 'skipped', detail: { reason: 'mode-off' } }
    }

    if (
        trigger === 'cron' &&
        !isCadenceDue(
            config.autopilotIdeationCadence,
            await getLastCompletedAt('ideation')
        )
    ) {
        // Manual runs reset the cadence clock, so an invisible cron skip
        // here reads as "the schedule never fired" — record it.
        await recordSkippedRun('ideation', trigger, mode, 'cadence-not-due')
        return { outcome: 'skipped', detail: { reason: 'cadence-not-due' } }
    }

    if (await hasUnacknowledgedFailure('ideation')) {
        if (trigger === 'cron') {
            await recordSkippedRun(
                'ideation',
                trigger,
                mode,
                'unacknowledged-failure'
            )
        }
        return {
            outcome: 'skipped',
            detail: { reason: 'unacknowledged-failure' },
        }
    }

    if (await isLockHeldAfterStaleCheck('ideation')) {
        return { outcome: 'skipped', detail: { reason: 'locked' } }
    }

    const pendingCount = await countPendingIdeas()
    const target = config.autopilotIdeasPerRun
    if (pendingCount >= target) {
        await recordSkippedRun('ideation', trigger, mode, 'queue-full')
        return {
            outcome: 'skipped',
            detail: { reason: 'queue-full', pendingCount },
        }
    }

    const runId = await acquireRunLock('ideation', trigger, mode)
    if (!runId) {
        return { outcome: 'skipped', detail: { reason: 'locked' } }
    }

    try {
        const candidates = await sourceGatedTopicCandidates(config)

        // Refresh-verdict topics feed the refresh queue (#147); the run
        // keeps its refreshCandidates record either way, and the queue's
        // merge semantics absorb re-detections.
        for (const candidate of candidates.refreshCandidates) {
            try {
                await enqueueIdeationGateSignal({
                    owningUrl: candidate.owningUrl,
                    topicTitle: candidate.title,
                    primaryKeyword: candidate.primaryKeyword,
                    reason: candidate.reason,
                })
            } catch (error) {
                console.warn(
                    `[Autopilot] Failed to queue refresh for "${candidate.title}":`,
                    error
                )
            }
        }

        if (candidates.fresh.length === 0) {
            await db
                .update(autopilotRun)
                .set({
                    status: 'skipped',
                    skipReason: candidates.allRejected
                        ? 'gate-rejected-all'
                        : 'queue-empty',
                    refreshCandidates: candidates.refreshCandidates,
                    ideasCreated: 0,
                    finishedAt: new Date(),
                })
                .where(eq(autopilotRun.id, runId))
            return {
                outcome: 'skipped',
                detail: {
                    reason: candidates.allRejected
                        ? 'gate-rejected-all'
                        : 'no-candidates',
                    refreshCandidates: candidates.refreshCandidates.length,
                },
            }
        }

        const slots = Math.max(0, target - pendingCount)
        const created: string[] = []
        // Intra-batch dedupe: candidates were checked against the board, but
        // not against each other (two GSC queries can yield sibling topics).
        const createdThisRun: Array<{
            title: string
            primaryKeyword?: string | null
        }> = []
        for (const topic of candidates.fresh) {
            if (created.length >= slots) break
            if (isNearDuplicateTopic(topic, createdThisRun)) {
                console.log(
                    `[Autopilot] Skipping intra-batch near-duplicate "${topic.title}"`
                )
                continue
            }
            const result = await createPipelinePostInternal({
                title: topic.title,
                primaryKeyword: topic.primaryKeyword ?? null,
                priority: 'medium',
                planningData: topicToPlanningData(topic),
                ideaApproval: 'pending',
            })
            if (result.success) {
                created.push(topic.title)
                createdThisRun.push({
                    title: topic.title,
                    primaryKeyword: topic.primaryKeyword,
                })
            } else {
                // Gate re-check can refuse a topic the panel proposed; log
                // and move on — never fail the run for one bad candidate.
                console.warn(
                    `[Autopilot] Idea "${topic.title}" refused at insert: ${result.error}`
                )
            }
        }

        await db
            .update(autopilotRun)
            .set({
                status: 'completed',
                ideasCreated: created.length,
                topicTitle:
                    created.length > 0
                        ? `${created.length} idea${created.length === 1 ? '' : 's'}: ${created.join(' · ')}`
                        : 'No ideas created',
                refreshCandidates: candidates.refreshCandidates,
                finishedAt: new Date(),
            })
            .where(eq(autopilotRun.id, runId))

        return {
            outcome: 'completed',
            detail: {
                ideasCreated: created.length,
                refreshCandidates: candidates.refreshCandidates.length,
            },
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        await db
            .update(autopilotRun)
            .set({
                status: 'failed',
                error: message,
                finishedAt: new Date(),
            })
            .where(eq(autopilotRun.id, runId))
        await notifyAutopilotFailure({
            runId,
            kind: 'ideation',
            error: message,
        })
        return { outcome: 'failed', detail: { error: message } }
    }
}

// ============================================
// Content job (pre-flight + durable workflow start)
// ============================================

export async function startAutopilotContentJob(
    trigger: AutopilotTriggerSource
): Promise<AutopilotJobOutcome> {
    const config = await getBlogAiConfig()
    const mode = config.autopilotMode

    if (mode === 'off') {
        return { outcome: 'skipped', detail: { reason: 'mode-off' } }
    }

    if (
        trigger === 'cron' &&
        !isCadenceDue(
            config.autopilotContentCadence,
            await getLastCompletedAt('content')
        )
    ) {
        // Consecutive identical skips collapse into one row, so a weekly
        // cadence checked by a daily cron stays one row, not six.
        await recordSkippedRun('content', trigger, mode, 'cadence-not-due')
        return { outcome: 'skipped', detail: { reason: 'cadence-not-due' } }
    }

    if (await hasUnacknowledgedFailure('content')) {
        if (trigger === 'cron') {
            await recordSkippedRun(
                'content',
                trigger,
                mode,
                'unacknowledged-failure'
            )
        }
        return {
            outcome: 'skipped',
            detail: { reason: 'unacknowledged-failure' },
        }
    }

    if (await isLockHeldAfterStaleCheck('content')) {
        return { outcome: 'skipped', detail: { reason: 'locked' } }
    }

    const draftCount = await countDraftsAwaitingReview()
    if (draftCount >= config.autopilotDraftCap) {
        await recordSkippedRun('content', trigger, mode, 'draft-cap')
        await notifyAutopilotDraftCap({
            draftCount,
            cap: config.autopilotDraftCap,
        })
        return {
            outcome: 'skipped',
            detail: {
                reason: 'draft-cap',
                draftCount,
                cap: config.autopilotDraftCap,
            },
        }
    }

    // In ideas mode only approved topics may be written — skip early when
    // the queue is empty rather than burning a workflow run.
    if (mode === 'ideas') {
        const queue = await getApprovedIdeaQueue()
        if (queue.length === 0) {
            await recordSkippedRun('content', trigger, mode, 'queue-empty')
            return { outcome: 'skipped', detail: { reason: 'queue-empty' } }
        }
    }

    const runId = await acquireRunLock('content', trigger, mode)
    if (!runId) {
        return { outcome: 'skipped', detail: { reason: 'locked' } }
    }

    try {
        // Deferred import: the workflow module is compiled by the workflow
        // bundler; importing it lazily keeps this service testable.
        const { autopilotContentWorkflow } = await import(
            '@/app/workflows/autopilot/autopilot-content.workflow'
        )
        const run = await start(autopilotContentWorkflow, [
            { runId, postsPerRun: config.autopilotPostsPerRun },
        ])

        await db
            .update(autopilotRun)
            .set({ workflowRunId: run.runId })
            .where(eq(autopilotRun.id, runId))

        console.log(
            `[Autopilot] Content workflow started (run ${runId}, workflow ${run.runId})`
        )
        return {
            outcome: 'started',
            detail: { runId, workflowRunId: run.runId },
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        await db
            .update(autopilotRun)
            .set({
                status: 'failed',
                error: `Failed to start content workflow: ${message}`,
                finishedAt: new Date(),
            })
            .where(eq(autopilotRun.id, runId))
        await notifyAutopilotFailure({
            runId,
            kind: 'content',
            error: `Failed to start content workflow: ${message}`,
        })
        return { outcome: 'failed', detail: { error: message } }
    }
}
