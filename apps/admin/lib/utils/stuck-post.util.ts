/**
 * Stuck-Post Detection
 *
 * A post is "stuck" when the serverless invocation running its phase died
 * without a catch block ever executing (deploy, crash, maxDuration kill):
 * the row keeps `processing_status='processing'` forever and the phase
 * validators then refuse every future run.
 *
 * Pure predicates only — the reaper service owns the DB write.
 *
 * @module @admin/lib/utils/stuck-post
 */

/**
 * Minutes a post may stay in 'processing' before it counts as stuck.
 * Every phase route caps at maxDuration <= 180s, so 10 minutes is safely
 * past any invocation that is still legitimately running.
 */
export const STUCK_THRESHOLD_MINUTES = 10

export const STUCK_POST_ERROR_MESSAGE = `Processing timed out: the phase was still marked as running after ${STUCK_THRESHOLD_MINUTES} minutes, so the server most likely died mid-phase. Use Retry to re-run this phase.`

/**
 * The instant before which a processing start counts as stuck
 */
export function stuckCutoff(
    now: Date,
    thresholdMinutes: number = STUCK_THRESHOLD_MINUTES
): Date {
    return new Date(now.getTime() - thresholdMinutes * 60_000)
}

/**
 * Whether a post's processing marker belongs to a dead invocation
 */
export function isStuckProcessing(
    post: {
        pipelineProcessingStatus: string | null
        processingStartedAt: Date | null
    },
    now: Date,
    thresholdMinutes: number = STUCK_THRESHOLD_MINUTES
): boolean {
    if (post.pipelineProcessingStatus !== 'processing') return false

    // Every writer sets processing + processing_started_at together, so a
    // processing row with no start timestamp is already an anomaly — treat
    // it as stuck rather than unreapable.
    if (!post.processingStartedAt) return true

    return post.processingStartedAt < stuckCutoff(now, thresholdMinutes)
}
