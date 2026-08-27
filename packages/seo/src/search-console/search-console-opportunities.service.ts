/**
 * Google Search Console Opportunities Service
 *
 * Identifies content opportunities and gaps for SEO improvement.
 *
 * @module @workspace/seo/search-console — opportunities
 */
import type { ContentGap, ContentOpportunity } from './search-console.type.js'
import type { SearchAnalyticsRow } from './search-console-analytics.util.js'

import { classifyQueryCoverage } from './query-coverage.util.js'
import { isSearchConsoleConfigured } from './search-console-client.service.js'
import {
    fetchSearchAnalytics,
    fetchAllSearchAnalytics,
    DEFAULT_DAYS,
    DEFAULT_LIMIT,
    BENCHMARK_CTR,
    MIN_IMPRESSIONS_FOR_OPPORTUNITY,
} from './search-console-analytics.util.js'

/**
 * Get content opportunities - queries with high impressions but low CTR
 * These represent potential content gaps or optimization opportunities
 */
export async function getContentOpportunities(
    days: number = DEFAULT_DAYS,
    limit: number = DEFAULT_LIMIT
): Promise<ContentOpportunity[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        const rows = await fetchSearchAnalytics({
            dimensions: ['query'],
            rowLimit: 500, // Fetch more to find opportunities
            days,
        })

        // Filter for opportunities: high impressions, low CTR
        const opportunities = rows
            .filter((row) => {
                const impressions = row.impressions ?? 0
                const ctr = row.ctr ?? 0
                return (
                    impressions >= MIN_IMPRESSIONS_FOR_OPPORTUNITY &&
                    ctr < BENCHMARK_CTR
                )
            })
            .map((row) => {
                const impressions = row.impressions ?? 0
                const clicks = row.clicks ?? 0
                const ctr = row.ctr ?? 0

                // Calculate potential additional clicks if CTR improved to benchmark
                const potentialClicks =
                    Math.round(impressions * BENCHMARK_CTR) - clicks

                // Generate suggestion based on position and CTR
                const position = row.position ?? 0
                let suggestion: string
                if (position > 10) {
                    suggestion = 'Create dedicated content to improve ranking'
                } else if (position > 5) {
                    suggestion =
                        'Optimize existing content and meta descriptions'
                } else {
                    suggestion =
                        'Improve title and meta description for better CTR'
                }

                return {
                    query: row.keys?.[0] ?? '',
                    clicks,
                    impressions,
                    ctr,
                    position,
                    potentialClicks: Math.max(0, potentialClicks),
                    suggestion,
                }
            })
            // Sort by potential clicks descending (highest opportunity first)
            .sort((a, b) => b.potentialClicks - a.potentialClicks)
            .slice(0, limit)

        return opportunities
    } catch (error) {
        console.error('Error fetching content opportunities:', error)
        throw error
    }
}

/**
 * Identify queries the site may not adequately cover.
 *
 * A query is reported when it draws real impressions
 * (>= MIN_IMPRESSIONS_FOR_OPPORTUNITY) and no page's URL carries its
 * vocabulary. Each result says which of the two situations it is:
 *
 * - `coverage: 'none'` — nothing ranks for it either. Write a new page.
 * - `coverage: 'weak'` — a page ranks within COVERAGE_POSITION_THRESHOLD but
 *   under different wording. Retitle that page; writing a new one would put it
 *   in competition with a page you already rank with.
 *
 * The distinction matters because this function feeds blog topic generation.
 * Before it existed, a synonym mismatch (`bbl smell` against
 * `/why-do-bbl-stink`) came back indistinguishable from unclaimed demand.
 *
 * @param days - Number of days to analyze (default: 28)
 * @param limit - Maximum number of results (default: 25)
 */
export async function getContentGaps(
    days: number = DEFAULT_DAYS,
    limit: number = DEFAULT_LIMIT
): Promise<ContentGap[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        // Site-wide query×page pull — paginated so large sites aren't truncated
        const rows = await fetchAllSearchAnalytics({
            dimensions: ['query', 'page'],
            days,
        })

        return buildContentGaps(rows).slice(0, limit)
    } catch (error) {
        console.error('Error fetching content gaps:', error)
        throw error
    }
}

/** Per-query totals accumulated across every page that ranked for it. */
type QueryAggregate = {
    query: string
    clicks: number
    impressions: number
    /** Impressions × position, divided out at the end */
    weightedPosition: number
    topPage: string | null
    topPageClicks: number
    topPageImpressions: number
    topPagePosition: number | null
}

/**
 * Fold query×page rows into per-query totals.
 *
 * The previous implementation reported the *top page's* impressions as the
 * query's, understating any query split across several pages. Totals are summed
 * here, and the page metrics are tracked separately for the coverage call.
 *
 * The best page is the one with the most clicks; ties — common, since most
 * pages have zero clicks — break on the better average position.
 */
function aggregateByQuery(rows: SearchAnalyticsRow[]): QueryAggregate[] {
    const byQuery = new Map<string, QueryAggregate>()

    for (const row of rows) {
        const query = row.keys?.[0] ?? ''
        const page = row.keys?.[1] ?? ''
        if (!query || !page) continue

        const clicks = row.clicks ?? 0
        const impressions = row.impressions ?? 0
        const position = row.position ?? 0

        let aggregate = byQuery.get(query)
        if (!aggregate) {
            aggregate = {
                query,
                clicks: 0,
                impressions: 0,
                weightedPosition: 0,
                topPage: null,
                topPageClicks: -1,
                topPageImpressions: -1,
                topPagePosition: null,
            }
            byQuery.set(query, aggregate)
        }

        aggregate.clicks += clicks
        aggregate.impressions += impressions
        aggregate.weightedPosition += position * impressions

        const beatsOnClicks = clicks > aggregate.topPageClicks
        const tiesOnClicks = clicks === aggregate.topPageClicks
        const beatsOnPosition =
            aggregate.topPagePosition === null ||
            (position > 0 && position < aggregate.topPagePosition)

        if (beatsOnClicks || (tiesOnClicks && beatsOnPosition)) {
            aggregate.topPage = page
            aggregate.topPageClicks = clicks
            aggregate.topPageImpressions = impressions
            aggregate.topPagePosition = position
        }
    }

    return [...byQuery.values()]
}

/** Phrase the action a given coverage verdict calls for. */
function recommendationFor(
    coverage: ContentGap['coverage'],
    topPage: string | null,
    topPagePosition: number | null
): string {
    if (coverage === 'none') {
        return 'No page covers this. Create dedicated content targeting the query.'
    }

    const position =
        topPagePosition === null
            ? 'on page one'
            : `at position ${topPagePosition.toFixed(1)}`

    return `${topPage} already ranks ${position} using different wording. Align its title, meta description and headings with this phrasing instead of creating a competing page.`
}

/**
 * Turn query×page rows into ranked content gaps.
 *
 * Exported for testing — {@link getContentGaps} is the public entry point.
 */
export function buildContentGaps(rows: SearchAnalyticsRow[]): ContentGap[] {
    const gaps: ContentGap[] = []

    for (const aggregate of aggregateByQuery(rows)) {
        if (aggregate.impressions < MIN_IMPRESSIONS_FOR_OPPORTUNITY) continue

        const coverage = classifyQueryCoverage(
            aggregate.query,
            aggregate.topPage,
            aggregate.topPagePosition
        )
        if (coverage === 'covered') continue

        gaps.push({
            query: aggregate.query,
            clicks: aggregate.clicks,
            impressions: aggregate.impressions,
            ctr:
                aggregate.impressions > 0
                    ? aggregate.clicks / aggregate.impressions
                    : 0,
            position:
                aggregate.impressions > 0
                    ? aggregate.weightedPosition / aggregate.impressions
                    : 0,
            coverage,
            topPage: aggregate.topPage,
            topPagePosition: aggregate.topPagePosition,
            recommendation: recommendationFor(
                coverage,
                aggregate.topPage,
                aggregate.topPagePosition
            ),
        })
    }

    // Biggest opportunity first, regardless of coverage — callers filter on the
    // coverage field rather than relying on ordering.
    return gaps.sort((a, b) => b.impressions - a.impressions)
}
