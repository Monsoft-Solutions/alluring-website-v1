/**
 * GSC Snapshot Types
 *
 * JSONB payload types for the gsc_* tables (epic #144). Snapshots persist
 * Search Console `['query','page']` rows per day so analysis escapes the
 * API's 16-month retention wall and runs as indexed SQL.
 *
 * @module packages/db/src/types/gsc.type
 */

/**
 * One competing URL inside a cannibalization finding.
 */
export type CannibalizationFindingPage = {
    /** Full page URL exactly as GSC reports it. */
    page: string
    /** Resolved blog post id, when the page is a blog post. */
    blogPostId?: string
    impressions: number
    /** This page's share of the query's total impressions (0–1). */
    share: number
    clicks: number
    /** Impression-weighted average position for the window. */
    position: number
}

/**
 * A query where our own pages compete against each other.
 *
 * - `shared-impressions`: ≥2 URLs each hold ≥30% of the query's impressions
 *   over the analyzed week.
 * - `flip-flop`: the top URL by impressions changed between the last two
 *   weekly windows.
 */
export type CannibalizationFinding = {
    query: string
    totalImpressions: number
    kind: 'shared-impressions' | 'flip-flop'
    pages: CannibalizationFindingPage[]
    /**
     * Who should own the query: the keyword-ownership registry entry when one
     * matches, otherwise the current top performer.
     */
    owner?: {
        url: string
        source: 'registry' | 'top-performer'
    }
}
