import { db } from '@workspace/db/client'
import { betaFeedback, bugReport } from '@workspace/db/schema/feedback'
import { count, desc, eq } from 'drizzle-orm'

export type BugReportListItem = {
    id: string
    pageUrl: string
    description: string
    severity: string | null
    status: string | null
    reporterEmail: string | null
    deviceType: string | null
    browserType: string | null
    createdAt: Date
}

export async function getBugReports(
    page = 1,
    pageSize = 10
): Promise<{ reports: BugReportListItem[]; total: number }> {
    const offset = (page - 1) * pageSize

    const [reports, totalResult] = await Promise.all([
        db
            .select({
                id: bugReport.id,
                pageUrl: bugReport.pageUrl,
                description: bugReport.description,
                severity: bugReport.severity,
                status: bugReport.status,
                reporterEmail: bugReport.reporterEmail,
                deviceType: bugReport.deviceType,
                browserType: bugReport.browserType,
                createdAt: bugReport.createdAt,
            })
            .from(bugReport)
            .orderBy(desc(bugReport.createdAt))
            .limit(pageSize)
            .offset(offset),
        db.select({ count: count() }).from(bugReport),
    ])

    return {
        reports,
        total: totalResult[0]?.count ?? 0,
    }
}

export async function updateBugReportStatus(
    reportId: string,
    status: string
): Promise<void> {
    await db.update(bugReport).set({ status }).where(eq(bugReport.id, reportId))
}

export type BetaFeedbackListItem = {
    id: string
    overallDesignRating: number
    overallSatisfactionRating: number
    deviceType: string
    browserType: string
    email: string | null
    createdAt: Date
}

export async function getBetaFeedback(
    page = 1,
    pageSize = 10
): Promise<{ feedback: BetaFeedbackListItem[]; total: number }> {
    const offset = (page - 1) * pageSize

    const [feedback, totalResult] = await Promise.all([
        db
            .select({
                id: betaFeedback.id,
                overallDesignRating: betaFeedback.overallDesignRating,
                overallSatisfactionRating:
                    betaFeedback.overallSatisfactionRating,
                deviceType: betaFeedback.deviceType,
                browserType: betaFeedback.browserType,
                email: betaFeedback.email,
                createdAt: betaFeedback.createdAt,
            })
            .from(betaFeedback)
            .orderBy(desc(betaFeedback.createdAt))
            .limit(pageSize)
            .offset(offset),
        db.select({ count: count() }).from(betaFeedback),
    ])

    return {
        feedback,
        total: totalResult[0]?.count ?? 0,
    }
}
