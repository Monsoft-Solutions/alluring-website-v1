/**
 * Google Search Console Position Changes Service
 *
 * Tracks position changes (winners and losers) between periods.
 *
 * @module @workspace/seo/search-console — position-changes
 */
import type { PositionChange } from './search-console.type.js'

import { isSearchConsoleConfigured } from './search-console-client.service.js'
import { fetchSearchAnalytics } from './search-console-analytics.util.js'

/**
 * Get position changes between two periods
 * Compares current period vs previous period of same length
 */
export async function getPositionChanges(
    days: number = 7,
    limit: number = 20
): Promise<{ winners: PositionChange[]; losers: PositionChange[] }> {
    if (!isSearchConsoleConfigured()) {
        return { winners: [], losers: [] }
    }

    try {
        // Current period
        const currentEnd = new Date()
        currentEnd.setDate(currentEnd.getDate() - 3) // Account for data delay
        const currentStart = new Date(currentEnd)
        currentStart.setDate(currentStart.getDate() - days)

        // Previous period (same length, immediately before current)
        const previousEnd = new Date(currentStart)
        previousEnd.setDate(previousEnd.getDate() - 1)
        const previousStart = new Date(previousEnd)
        previousStart.setDate(previousStart.getDate() - days)

        // Fetch current period data
        const currentRows = await fetchSearchAnalytics({
            dimensions: ['query'],
            rowLimit: 500,
            startDate: currentStart.toISOString().split('T')[0]!,
            endDate: currentEnd.toISOString().split('T')[0]!,
        })

        // Fetch previous period data
        const previousRows = await fetchSearchAnalytics({
            dimensions: ['query'],
            rowLimit: 500,
            startDate: previousStart.toISOString().split('T')[0]!,
            endDate: previousEnd.toISOString().split('T')[0]!,
        })

        // Create a map of previous positions
        const previousPositions = new Map<string, number>()
        for (const row of previousRows) {
            const query = row.keys?.[0]
            if (query) {
                previousPositions.set(query, row.position ?? 0)
            }
        }

        // Calculate position changes
        const changes: PositionChange[] = []
        for (const row of currentRows) {
            const query = row.keys?.[0]
            if (!query) continue

            const currentPosition = row.position ?? 0
            const previousPosition = previousPositions.get(query)

            // Only include queries that existed in both periods
            if (previousPosition !== undefined) {
                const delta = currentPosition - previousPosition
                // Negative delta = improved (moved up in rankings)
                // Positive delta = dropped (moved down in rankings)
                changes.push({
                    query,
                    currentPosition,
                    previousPosition,
                    positionDelta: delta,
                    clicks: row.clicks ?? 0,
                    impressions: row.impressions ?? 0,
                })
            }
        }

        // Separate into winners (improved) and losers (dropped)
        // Filter for significant changes (at least 0.5 position)
        const winners = changes
            .filter((c) => c.positionDelta < -0.5) // Improved by at least 0.5 position
            .sort((a, b) => a.positionDelta - b.positionDelta) // Most improved first
            .slice(0, limit)

        const losers = changes
            .filter((c) => c.positionDelta > 0.5) // Dropped by at least 0.5 position
            .sort((a, b) => b.positionDelta - a.positionDelta) // Biggest drops first
            .slice(0, limit)

        return { winners, losers }
    } catch (error) {
        console.error('Error fetching position changes:', error)
        throw error
    }
}
