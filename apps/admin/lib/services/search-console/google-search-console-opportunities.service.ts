/**
 * Google Search Console Opportunities Service
 *
 * Identifies content opportunities and gaps for SEO improvement.
 *
 * @module @/lib/services/search-console/google-search-console-opportunities
 */
import type {
    ContentOpportunity,
    SearchQuery,
} from '@/lib/types/search-console/search-console.type'

import { isSearchConsoleConfigured } from './google-search-console-client.service'
import {
    fetchSearchAnalytics,
    DEFAULT_DAYS,
    DEFAULT_LIMIT,
    BENCHMARK_CTR,
    MIN_IMPRESSIONS_FOR_OPPORTUNITY,
} from './google-search-console-utils.service'

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
 * Identify content gaps - queries with high impressions but no dedicated page
 * These are opportunities to create new content
 *
 * A content gap is defined as a query where:
 * - The query has significant impressions (>= MIN_IMPRESSIONS_FOR_OPPORTUNITY)
 * - The top-ranking page doesn't contain the query terms in the URL
 *
 * @param days - Number of days to analyze (default: 28)
 * @param limit - Maximum number of results (default: 25)
 */
export async function getContentGaps(
    days: number = DEFAULT_DAYS,
    limit: number = DEFAULT_LIMIT
): Promise<SearchQuery[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        // Fetch queries with their associated pages
        const rows = await fetchSearchAnalytics({
            dimensions: ['query', 'page'],
            rowLimit: 1000, // Fetch more to analyze
            days,
        })

        // Group by query and find the best page for each
        const queryMap = new Map<
            string,
            {
                query: string
                clicks: number
                impressions: number
                ctr: number
                position: number
                topPage: string
            }
        >()

        for (const row of rows) {
            const query = row.keys?.[0] ?? ''
            const page = row.keys?.[1] ?? ''

            if (!query || !page) continue

            const existing = queryMap.get(query)

            // Keep track of the best performing page for each query
            if (!existing || (row.clicks ?? 0) > existing.clicks) {
                queryMap.set(query, {
                    query,
                    clicks: row.clicks ?? 0,
                    impressions: row.impressions ?? 0,
                    ctr: row.ctr ?? 0,
                    position: row.position ?? 0,
                    topPage: page,
                })
            }
        }

        // Filter for content gaps:
        // - Significant impressions
        // - Top page URL doesn't contain query terms (simplified check)
        const contentGaps: SearchQuery[] = []

        for (const data of queryMap.values()) {
            if (data.impressions < MIN_IMPRESSIONS_FOR_OPPORTUNITY) continue

            // Check if the top page URL contains any meaningful query terms
            const queryTerms = data.query
                .toLowerCase()
                .split(/\s+/)
                .filter((term) => term.length > 3) // Skip short words

            const pageUrlLower = data.topPage.toLowerCase()

            // Check if the page seems dedicated to this query
            const hasDedicatedPage = queryTerms.some(
                (term) =>
                    pageUrlLower.includes(term.replace(/[^a-z]/g, '')) ||
                    pageUrlLower.includes(term)
            )

            if (!hasDedicatedPage) {
                contentGaps.push({
                    query: data.query,
                    clicks: data.clicks,
                    impressions: data.impressions,
                    ctr: data.ctr,
                    position: data.position,
                })
            }
        }

        // Sort by impressions descending (biggest opportunity first)
        return contentGaps
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, limit)
    } catch (error) {
        console.error('Error fetching content gaps:', error)
        throw error
    }
}
