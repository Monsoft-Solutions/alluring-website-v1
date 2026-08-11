/**
 * Autopilot Types
 *
 * JSONB payload types for the autopilot_run table.
 *
 * @module packages/db/src/types/autopilot.type
 */

/**
 * Outcome of a single pipeline phase inside a content run.
 */
export type AutopilotPhaseOutcome = {
    phase:
        | 'select-topic'
        | 'create-post'
        | 'generate'
        | 'review'
        | 'extract'
        | 'images'
    status: 'completed' | 'failed' | 'skipped'
    durationMs?: number
    error?: string
}

/**
 * A topic the ideation gate judged as a refresh of an existing post.
 * Autopilot never writes these; they are recorded on the run as input for
 * the future refresh flow (epic #144).
 */
export type RefreshCandidate = {
    title: string
    primaryKeyword?: string
    owningUrl?: string
    reason?: string
}

/**
 * Reasons a run can be recorded as skipped.
 */
export type AutopilotSkipReason =
    | 'mode-off'
    | 'cadence-not-due'
    | 'draft-cap'
    | 'locked'
    | 'queue-empty'
    | 'gate-rejected-all'
    | 'unacknowledged-failure'
