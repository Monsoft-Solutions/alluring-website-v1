import { db } from '@workspace/db/client'
import { betaFeedback, bugReport } from '@workspace/db/schema/feedback'
import { count, desc, eq } from 'drizzle-orm'

export type BugReportDetail = {
    id: string
    pageUrl: string
    description: string
    stepsToReproduce: string | null
    expectedBehavior: string | null
    actualBehavior: string | null
    screenshotUrl: string | null
    severity: string | null
    status: string | null
    reporterEmail: string | null
    reporterName: string | null
    deviceType: string | null
    browserType: string | null
    browserVersion: string | null
    screenSize: string | null
    userAgent: string | null
    ipAddress: string | null
    screenWidth: number | null
    screenHeight: number | null
    viewportWidth: number | null
    viewportHeight: number | null
    devicePixelRatio: number | null
    timezone: string | null
    language: string | null
    referrer: string | null
    connectionType: string | null
    createdAt: Date
    updatedAt: Date
}

export async function getBugReportById(
    id: string
): Promise<BugReportDetail | null> {
    const result = await db
        .select()
        .from(bugReport)
        .where(eq(bugReport.id, id))
        .limit(1)

    return result[0] ?? null
}

export type BetaFeedbackDetail = {
    id: string
    overallDesignRating: number
    overallSatisfactionRating: number
    visualAestheticsRating: number
    navigationEase: string
    wordingClarityRating: number
    designLikes: string | null
    designDislikes: string | null
    hasBrokenLinks: boolean | null
    brokenLinksDescription: string | null
    hasTypos: boolean | null
    typosDescription: string | null
    hasTechnicalIssues: boolean | null
    technicalIssuesDescription: string | null
    recommendations: string | null
    wantsUxTesting: boolean | null
    deviceType: string
    deviceTypeOther: string | null
    browserType: string
    browserTypeOther: string | null
    userAgent: string | null
    ipAddress: string | null
    email: string | null
    createdAt: Date
}

export async function getBetaFeedbackById(
    id: string
): Promise<BetaFeedbackDetail | null> {
    const result = await db
        .select({
            id: betaFeedback.id,
            overallDesignRating: betaFeedback.overallDesignRating,
            overallSatisfactionRating: betaFeedback.overallSatisfactionRating,
            visualAestheticsRating: betaFeedback.visualAestheticsRating,
            navigationEase: betaFeedback.navigationEase,
            wordingClarityRating: betaFeedback.wordingClarityRating,
            designLikes: betaFeedback.designLikes,
            designDislikes: betaFeedback.designDislikes,
            hasBrokenLinks: betaFeedback.hasBrokenLinks,
            brokenLinksDescription: betaFeedback.brokenLinksDescription,
            hasTypos: betaFeedback.hasTypos,
            typosDescription: betaFeedback.typosDescription,
            hasTechnicalIssues: betaFeedback.hasTechnicalIssues,
            technicalIssuesDescription: betaFeedback.technicalIssuesDescription,
            recommendations: betaFeedback.recommendations,
            wantsUxTesting: betaFeedback.wantsUxTesting,
            deviceType: betaFeedback.deviceType,
            deviceTypeOther: betaFeedback.deviceTypeOther,
            browserType: betaFeedback.browserType,
            browserTypeOther: betaFeedback.browserTypeOther,
            userAgent: betaFeedback.userAgent,
            ipAddress: betaFeedback.ipAddress,
            email: betaFeedback.email,
            createdAt: betaFeedback.createdAt,
        })
        .from(betaFeedback)
        .where(eq(betaFeedback.id, id))
        .limit(1)

    return result[0] ?? null
}

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
