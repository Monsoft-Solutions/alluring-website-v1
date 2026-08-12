/**
 * Cannibalization Detection
 *
 * Pure detection over weekly (query, page) aggregates from the snapshot
 * table (issue #146). No DB or API access — the #146 acceptance criteria
 * ("seeded duplicate data produces a correct report; clean data produces
 * none") run as unit tests against this module.
 *
 * Two finding kinds:
 * - `shared-impressions`: ≥2 of our URLs each hold ≥30% of a query's
 *   impressions over the analyzed week — Google can't pick a winner.
 * - `flip-flop`: the query's top URL by impressions changed between the two
 *   most recent weekly windows — rankings are trading places.
 *
 * @module @/lib/utils/cannibalization-detection.util
 */
import {
    getOwnerForUrl,
    normalizeQuery,
    resolveQueryOwner,
} from '@workspace/shared/seo'

import type {
    CannibalizationFinding,
    CannibalizationFindingPage,
} from '@workspace/db/types'

import type { QueryPageAggregate } from '@/lib/queries/gsc-snapshot.query'

// ============================================
// Thresholds (issue #146 scope)
// ============================================

/** Queries below this many weekly impressions are noise, not findings. */
export const MIN_WEEKLY_IMPRESSIONS = 50

/** A URL "holds" a query at or above this share of its impressions. */
export const SHARE_THRESHOLD = 0.3

/** Flip-flop needs this many impressions across both weeks to matter. */
export const FLIP_FLOP_MIN_IMPRESSIONS = 100

// ============================================
// Helpers
// ============================================

type QueryGroup = {
    totalImpressions: number
    pages: CannibalizationFindingPage[]
}

/** Group aggregates by query, computing per-page impression shares. */
function groupByQuery(rows: QueryPageAggregate[]): Map<string, QueryGroup> {
    const totals = new Map<string, number>()
    for (const row of rows) {
        totals.set(row.query, (totals.get(row.query) ?? 0) + row.impressions)
    }

    const groups = new Map<string, QueryGroup>()
    for (const row of rows) {
        const totalImpressions = totals.get(row.query) ?? 0
        const group = groups.get(row.query) ?? { totalImpressions, pages: [] }
        group.pages.push({
            page: row.page,
            blogPostId: row.blogPostId ?? undefined,
            impressions: row.impressions,
            share:
                totalImpressions > 0 ? row.impressions / totalImpressions : 0,
            clicks: row.clicks,
            position: row.position,
        })
        groups.set(row.query, group)
    }

    for (const group of groups.values()) {
        group.pages.sort((a, b) => b.impressions - a.impressions)
    }

    return groups
}

/** Site path of a full URL (owner registry keys on paths). */
function pathOf(pageUrl: string): string {
    try {
        const path = new URL(pageUrl).pathname
        return path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path
    } catch {
        return pageUrl
    }
}

/**
 * Who should own the query: the keyword-ownership registry when it claims
 * it (or one of the competing URLs), otherwise the current top performer.
 */
function resolveFindingOwner(
    query: string,
    pages: CannibalizationFindingPage[]
): CannibalizationFinding['owner'] {
    const ownership = resolveQueryOwner(normalizeQuery(query))
    if (ownership) {
        return { url: ownership.canonicalOwner.url, source: 'registry' }
    }

    for (const page of pages) {
        const entry = getOwnerForUrl(pathOf(page.page))
        if (entry) return { url: entry.url, source: 'registry' }
    }

    const top = pages[0]
    return top ? { url: pathOf(top.page), source: 'top-performer' } : undefined
}

// ============================================
// Detection
// ============================================

/**
 * Detect cannibalization across the two most recent weekly windows.
 *
 * @param currentWeek - Per-(query, page) aggregates for the analyzed week
 * @param previousWeek - Same shape for the week before (flip-flop input)
 * @returns Findings sorted by total impressions, worst first
 */
export function detectCannibalization(
    currentWeek: QueryPageAggregate[],
    previousWeek: QueryPageAggregate[]
): CannibalizationFinding[] {
    const current = groupByQuery(currentWeek)
    const previous = groupByQuery(previousWeek)

    const findings: CannibalizationFinding[] = []

    for (const [query, group] of current) {
        if (group.totalImpressions < MIN_WEEKLY_IMPRESSIONS) continue

        const holders = group.pages.filter(
            (page) => page.share >= SHARE_THRESHOLD
        )
        if (holders.length >= 2) {
            findings.push({
                query,
                totalImpressions: group.totalImpressions,
                kind: 'shared-impressions',
                pages: group.pages,
                owner: resolveFindingOwner(query, group.pages),
            })
            continue
        }

        const previousGroup = previous.get(query)
        if (!previousGroup) continue
        if (
            group.totalImpressions + previousGroup.totalImpressions <
            FLIP_FLOP_MIN_IMPRESSIONS
        ) {
            continue
        }

        const topNow = group.pages[0]?.page
        const topBefore = previousGroup.pages[0]?.page
        if (topNow && topBefore && topNow !== topBefore) {
            findings.push({
                query,
                totalImpressions: group.totalImpressions,
                kind: 'flip-flop',
                pages: group.pages,
                owner: resolveFindingOwner(query, group.pages),
            })
        }
    }

    return findings.sort((a, b) => b.totalImpressions - a.totalImpressions)
}
