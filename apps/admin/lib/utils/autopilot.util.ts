/**
 * Autopilot Pure Helpers
 *
 * Side-effect-free logic for the autopilot loop: cadence due-checks and
 * topic near-duplicate detection. Kept import-clean (no DB, no workflow
 * runtime) so unit tests can exercise it directly.
 *
 * @module @/lib/utils/autopilot.util
 */
import type { AutopilotCadence } from '@/lib/queries/blog-ai-config.query'

/** Interval thresholds per cadence (hours). Slightly under the nominal
 * period so daily ticks with minor timing jitter still qualify. */
export const CADENCE_HOURS: Record<AutopilotCadence, number> = {
    daily: 20,
    weekdays: 20,
    weekly: 144, // 6 days
}

/** Token-overlap ratio at or above which two topics count as duplicates. */
export const DUPLICATE_SIMILARITY = 0.6

/** Weekday in America/New_York ('Mon'..'Sun') — cadence is admin-local. */
export function easternWeekday(now: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'short',
    }).format(now)
}

/**
 * Interval-based cadence check.
 *
 * `daily`: due when the last completed run is 20h+ old (or none exists).
 * `weekdays`: as daily, but only Mon–Fri Eastern.
 * `weekly`: due when the last completed run is 6+ days old.
 *
 * Self-healing by construction: a missed or failed tick leaves the last
 * completed run old, so the next daily tick is due.
 */
export function isCadenceDue(
    cadence: AutopilotCadence,
    lastCompletedAt: Date | null,
    now: Date = new Date()
): boolean {
    if (cadence === 'weekdays') {
        const day = easternWeekday(now)
        if (day === 'Sat' || day === 'Sun') return false
    }

    if (!lastCompletedAt) return true

    const hoursSince =
        (now.getTime() - lastCompletedAt.getTime()) / (1000 * 60 * 60)
    return hoursSince >= CADENCE_HOURS[cadence]
}

/** Normalize a title/keyword for similarity comparison. */
function normalizeTopicText(text: string): string[] {
    const stopwords = new Set([
        'a',
        'an',
        'the',
        'and',
        'or',
        'of',
        'for',
        'to',
        'in',
        'on',
        'with',
        'your',
        'you',
        'is',
        'are',
        'what',
        'how',
        'why',
        'when',
        'miami',
        'guide',
    ])
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 1 && !stopwords.has(word))
}

/**
 * Token-overlap similarity (intersection over smaller set), 0..1.
 * Deliberately simple: it only needs to stop near-identical re-proposals
 * ("BBL Recovery Tips" vs "Tips for BBL Recovery"), not semantic matching.
 */
export function topicSimilarity(a: string, b: string): number {
    const tokensA = new Set(normalizeTopicText(a))
    const tokensB = new Set(normalizeTopicText(b))
    if (tokensA.size === 0 || tokensB.size === 0) return 0

    let intersection = 0
    for (const token of tokensA) {
        if (tokensB.has(token)) intersection++
    }
    return intersection / Math.min(tokensA.size, tokensB.size)
}

/** True when `candidate` near-duplicates any existing title/keyword. */
export function isNearDuplicateTopic(
    candidate: { title: string; primaryKeyword?: string | null },
    existing: Array<{ title: string; primaryKeyword?: string | null }>
): boolean {
    const candidateTexts = [candidate.title, candidate.primaryKeyword].filter(
        (t): t is string => Boolean(t)
    )
    for (const entry of existing) {
        const entryTexts = [entry.title, entry.primaryKeyword].filter(
            (t): t is string => Boolean(t)
        )
        for (const a of candidateTexts) {
            for (const b of entryTexts) {
                if (topicSimilarity(a, b) >= DUPLICATE_SIMILARITY) return true
            }
        }
    }
    return false
}
