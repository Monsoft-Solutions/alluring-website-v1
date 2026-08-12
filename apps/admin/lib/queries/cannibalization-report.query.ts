/**
 * Cannibalization Report Queries
 *
 * Read side of the weekly cannibalization reports (issue #146).
 *
 * @module @/lib/queries/cannibalization-report.query
 */
import { desc } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { cannibalizationReport } from '@workspace/db/schema/gsc'
import type { CannibalizationFinding } from '@workspace/db/types'

/** Latest report, serialized for the API/UI boundary. */
export type LatestCannibalizationReport = {
    weekStart: string
    createdAt: string
    findings: CannibalizationFinding[]
    findingsCount: number
}

/** The most recent weekly report, or null before the first run. */
export async function getLatestCannibalizationReport(): Promise<LatestCannibalizationReport | null> {
    const [report] = await db
        .select()
        .from(cannibalizationReport)
        .orderBy(desc(cannibalizationReport.weekStart))
        .limit(1)

    if (!report) return null

    return {
        weekStart: report.weekStart,
        createdAt: report.createdAt.toISOString(),
        findings: report.findings,
        findingsCount: report.findingsCount,
    }
}
