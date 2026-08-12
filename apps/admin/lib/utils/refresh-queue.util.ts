/**
 * Refresh Queue Utilities
 *
 * Pure signal-merge and cooldown semantics for the content_refresh queue
 * (epic #144, #147), kept DB-free so they are unit-testable. The
 * content-refresh service wires them to the table.
 *
 * @module @/lib/utils/refresh-queue.util
 */
import type { RefreshSignal } from '@workspace/db/types'

/**
 * Merge an incoming signal into a candidate's accumulated sources.
 *
 * One signal per source: re-detection REPLACES the previous signal of the
 * same source (fresher metrics, fresher detectedAt) instead of appending —
 * a daily detection job must not grow the row by one duplicate per day.
 * Different sources accumulate, since a post can decay in several ways.
 */
export function mergeSignal(
    existing: RefreshSignal[],
    incoming: RefreshSignal
): RefreshSignal[] {
    const withoutSameSource = existing.filter(
        (signal) => signal.source !== incoming.source
    )
    return [...withoutSameSource, incoming]
}

/**
 * Whether a post is still inside the post-refresh cooldown window.
 *
 * @param lastClosedAt - When the post's most recent candidate was applied or
 *   dismissed, or null if it never had one
 * @param cooldownDays - `blog_ai_config.refresh_cooldown_days`
 */
export function isWithinCooldown(
    lastClosedAt: Date | null,
    cooldownDays: number,
    now: Date
): boolean {
    if (!lastClosedAt) return false
    const elapsed = now.getTime() - lastClosedAt.getTime()
    return elapsed < cooldownDays * 24 * 60 * 60 * 1000
}
