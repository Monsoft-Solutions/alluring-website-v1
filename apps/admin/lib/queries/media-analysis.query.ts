/**
 * Media Analysis Queries
 *
 * Database queries for retrieving media analysis sessions.
 * Supports filtering by status, source, and pagination.
 *
 * @module lib/queries/media-analysis.query
 */
'use server'

import { db } from '@workspace/db/client'
import { mediaAnalysis, mediaAnalysisItem } from '@workspace/db/schema'
import { desc, eq, and, inArray, count, type SQL } from 'drizzle-orm'

import type {
    AnalysisListFilters,
    PaginationOptions,
    AnalysisListItem,
    AnalysisDetail,
    AnalysisListResult,
} from '@/lib/types/media-analysis.type'

// ============================================================================
// Queries
// ============================================================================

/**
 * List all analysis sessions with filtering and pagination
 */
export async function listAnalyses(
    filters: AnalysisListFilters = {},
    pagination: PaginationOptions = {}
): Promise<AnalysisListResult> {
    const { page = 1, pageSize = 20 } = pagination

    // Build where conditions
    const conditions: SQL[] = []
    if (filters.status) {
        conditions.push(eq(mediaAnalysis.status, filters.status))
    }
    if (filters.source) {
        conditions.push(eq(mediaAnalysis.source, filters.source))
    }
    if (filters.type) {
        conditions.push(eq(mediaAnalysis.type, filters.type))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Get total count
    const [countResult] = await db
        .select({ count: count() })
        .from(mediaAnalysis)
        .where(whereClause)

    const total = countResult?.count ?? 0
    const totalPages = Math.ceil(total / pageSize)

    // Get paginated results
    const analyses = await db
        .select({
            id: mediaAnalysis.id,
            name: mediaAnalysis.name,
            type: mediaAnalysis.type,
            source: mediaAnalysis.source,
            status: mediaAnalysis.status,
            totalMedia: mediaAnalysis.totalMedia,
            analyzedMedia: mediaAnalysis.analyzedMedia,
            detectedPairs: mediaAnalysis.detectedPairs,
            unpairedMedia: mediaAnalysis.unpairedMedia,
            nonBAMedia: mediaAnalysis.nonBAMedia,
            startedAt: mediaAnalysis.startedAt,
            completedAt: mediaAnalysis.completedAt,
            appliedAt: mediaAnalysis.appliedAt,
        })
        .from(mediaAnalysis)
        .where(whereClause)
        .orderBy(desc(mediaAnalysis.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize)

    return {
        analyses,
        total,
        page,
        pageSize,
        totalPages,
    }
}

/**
 * Get a single analysis by ID with full result data
 */
export async function getAnalysisById(
    id: string
): Promise<AnalysisDetail | null> {
    const [analysis] = await db
        .select()
        .from(mediaAnalysis)
        .where(eq(mediaAnalysis.id, id))
        .limit(1)

    if (!analysis) {
        return null
    }

    return {
        ...analysis,
        resultData: analysis.resultData,
        status: analysis.status,
    }
}

/**
 * Get analysis items for a specific analysis
 */
export async function getAnalysisItems(analysisId: string) {
    return await db
        .select()
        .from(mediaAnalysisItem)
        .where(eq(mediaAnalysisItem.analysisId, analysisId))
}

/**
 * Get status counts for all analyses
 */
export async function getAnalysisStatusCounts() {
    const results = await db
        .select({
            status: mediaAnalysis.status,
            count: count(),
        })
        .from(mediaAnalysis)
        .groupBy(mediaAnalysis.status)

    const counts = {
        pending: 0,
        analyzing: 0,
        completed: 0,
        applied: 0,
        failed: 0,
    }

    for (const result of results) {
        counts[result.status] = result.count
    }

    return counts
}

/**
 * Get source counts for all analyses
 */
export async function getAnalysisSourceCounts() {
    const results = await db
        .select({
            source: mediaAnalysis.source,
            count: count(),
        })
        .from(mediaAnalysis)
        .groupBy(mediaAnalysis.source)

    const counts = {
        instagram: 0,
        gallery: 0,
    }

    for (const result of results) {
        counts[result.source] = result.count
    }

    return counts
}

/**
 * Check if an analysis exists
 *
 * @param id - Analysis ID to check
 * @returns True if the analysis exists, false otherwise
 */
export async function analysisExists(id: string): Promise<boolean> {
    const [result] = await db
        .select({ id: mediaAnalysis.id })
        .from(mediaAnalysis)
        .where(eq(mediaAnalysis.id, id))
        .limit(1)

    return !!result
}

/**
 * Get recent analyses (last 10)
 *
 * Fetches the 10 most recently created analysis sessions,
 * ordered by creation date descending.
 *
 * @returns Array of recent analysis list items
 */
export async function getRecentAnalyses(): Promise<AnalysisListItem[]> {
    const analyses = await db
        .select({
            id: mediaAnalysis.id,
            name: mediaAnalysis.name,
            type: mediaAnalysis.type,
            source: mediaAnalysis.source,
            status: mediaAnalysis.status,
            totalMedia: mediaAnalysis.totalMedia,
            analyzedMedia: mediaAnalysis.analyzedMedia,
            detectedPairs: mediaAnalysis.detectedPairs,
            unpairedMedia: mediaAnalysis.unpairedMedia,
            nonBAMedia: mediaAnalysis.nonBAMedia,
            startedAt: mediaAnalysis.startedAt,
            completedAt: mediaAnalysis.completedAt,
            appliedAt: mediaAnalysis.appliedAt,
        })
        .from(mediaAnalysis)
        .orderBy(desc(mediaAnalysis.createdAt))
        .limit(10)

    return analyses
}

/**
 * Get analyses by IDs
 *
 * Fetches multiple analysis sessions by their IDs,
 * ordered by creation date descending.
 *
 * @param ids - Array of analysis IDs to fetch
 * @returns Array of matching analysis list items
 */
export async function getAnalysesByIds(
    ids: string[]
): Promise<AnalysisListItem[]> {
    if (ids.length === 0) return []

    const analyses = await db
        .select({
            id: mediaAnalysis.id,
            name: mediaAnalysis.name,
            type: mediaAnalysis.type,
            source: mediaAnalysis.source,
            status: mediaAnalysis.status,
            totalMedia: mediaAnalysis.totalMedia,
            analyzedMedia: mediaAnalysis.analyzedMedia,
            detectedPairs: mediaAnalysis.detectedPairs,
            unpairedMedia: mediaAnalysis.unpairedMedia,
            nonBAMedia: mediaAnalysis.nonBAMedia,
            startedAt: mediaAnalysis.startedAt,
            completedAt: mediaAnalysis.completedAt,
            appliedAt: mediaAnalysis.appliedAt,
        })
        .from(mediaAnalysis)
        .where(inArray(mediaAnalysis.id, ids))
        .orderBy(desc(mediaAnalysis.createdAt))

    return analyses
}
