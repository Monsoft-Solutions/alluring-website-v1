/**
 * Topic Sourcing Service
 *
 * Builds topic-generation seeds from live Google Search Console data:
 * content opportunities (high impressions, low CTR), content gaps (no
 * owning page) and decaying winners (recent position drops).
 *
 * Used by the generate-topics route ("From Search Console" mode) and by
 * the future autopilot service, which sources topics headlessly through
 * the same path.
 *
 * @module @/lib/services/topic-sourcing
 */
import type { GscTopicSeed } from '@workspace/ai/functions'
import type { RankingPage } from '@workspace/ai/agents'

import {
    getContentGaps,
    getContentOpportunities,
    getPagesForQuery,
    getPositionChanges,
    isSearchConsoleConfigured,
} from '@/lib/services/search-console'

/** Default analysis window in days */
const DEFAULT_DAYS = 28

/** Cap on seeds sent to the model — keeps the prompt focused */
const MAX_SEEDS = 24

/**
 * Fetch and label topic seeds from Search Console.
 *
 * Gap queries rank first (unclaimed demand — the strongest "write new
 * content" signal), then opportunities, then decaying queries. Duplicates
 * across sources keep their highest-priority label.
 *
 * Returns [] when Search Console is not configured.
 */
export async function getGscTopicSeeds(
    options: { days?: number; perSourceLimit?: number } = {}
): Promise<GscTopicSeed[]> {
    if (!isSearchConsoleConfigured()) return []

    const { days = DEFAULT_DAYS, perSourceLimit = 12 } = options

    const [gaps, opportunities, positionChanges] = await Promise.all([
        getContentGaps(days, perSourceLimit),
        getContentOpportunities(days, perSourceLimit),
        // Position changes cap at 90 days of comparison window
        getPositionChanges(Math.min(days, 28), perSourceLimit),
    ])

    const seeds = new Map<string, GscTopicSeed>()

    for (const gap of gaps) {
        seeds.set(gap.query, {
            query: gap.query,
            impressions: gap.impressions,
            clicks: gap.clicks,
            ctr: gap.ctr,
            position: gap.position,
            source: 'gap',
        })
    }

    for (const opp of opportunities) {
        if (seeds.has(opp.query)) continue
        seeds.set(opp.query, {
            query: opp.query,
            impressions: opp.impressions,
            clicks: opp.clicks,
            ctr: opp.ctr,
            position: opp.position,
            source: 'opportunity',
        })
    }

    for (const loser of positionChanges.losers) {
        if (seeds.has(loser.query)) continue
        seeds.set(loser.query, {
            query: loser.query,
            impressions: loser.impressions,
            clicks: loser.clicks,
            ctr: loser.impressions > 0 ? loser.clicks / loser.impressions : 0,
            position: loser.currentPosition,
            source: 'decay',
        })
    }

    return [...seeds.values()].slice(0, MAX_SEEDS)
}

/**
 * Live-ranking lookup for the cannibalization checker: which URLs
 * currently rank for a query. Returns undefined when Search Console is
 * not configured so the agent runs registry-only.
 */
export function createPagesForQueryAdapter():
    | ((query: string) => Promise<RankingPage[]>)
    | undefined {
    if (!isSearchConsoleConfigured()) return undefined

    return async (query: string) => {
        const pages = await getPagesForQuery(query, DEFAULT_DAYS, 5)
        return pages.map((p) => ({
            page: p.page,
            clicks: p.clicks,
            impressions: p.impressions,
            position: p.position,
        }))
    }
}
