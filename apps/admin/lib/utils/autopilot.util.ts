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
import type { GscTopicSeed } from '@workspace/ai/functions'
import type { RefreshCandidate } from '@workspace/db/types'
import type { TopicVerdict } from '@workspace/shared/seo'

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

// ============================================
// Demand-seed gating (issue #221)
// ============================================

/** A Search Console seed decorated with its ownership-gate verdict. */
export type GatedSeed = GscTopicSeed & { gate: TopicVerdict }

export type PartitionedSeeds = {
    /** Unclaimed demand the model may turn into new topics. */
    fresh: GscTopicSeed[]
    /** Demand a live blog post already owns — refresh work, not a new URL. */
    refreshCandidates: RefreshCandidate[]
    /** Seeds owned by a money page or a retired URL: dropped. */
    rejected: number
}

/**
 * Split gated seeds by verdict BEFORE topic generation. A query the site
 * already ranks for with a blog post can only ever come back from the
 * model as a `refresh` verdict; feeding it in as a "write something new"
 * seed is how ideation re-proposed the same six topics every day.
 */
export function partitionGatedSeeds(seeds: GatedSeed[]): PartitionedSeeds {
    const fresh: GscTopicSeed[] = []
    const refreshCandidates: RefreshCandidate[] = []
    let rejected = 0

    for (const seed of seeds) {
        switch (seed.gate.verdict) {
            case 'new':
                fresh.push({
                    query: seed.query,
                    impressions: seed.impressions,
                    clicks: seed.clicks,
                    ctr: seed.ctr,
                    position: seed.position,
                    source: seed.source,
                })
                break
            case 'refresh':
                refreshCandidates.push({
                    title: seed.query,
                    primaryKeyword: seed.query,
                    owningUrl: seed.gate.owningUrl,
                    reason: seed.gate.reason,
                })
                break
            case 'reject':
                rejected++
                break
        }
    }

    return { fresh, refreshCandidates, rejected }
}
