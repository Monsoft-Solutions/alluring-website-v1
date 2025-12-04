import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { contactSubmission } from '@workspace/db/schema/contact'
import { emailLog } from '@workspace/db/schema/emails'
import { betaFeedback, bugReport } from '@workspace/db/schema/feedback'
import { count, eq, desc, sql, gte } from 'drizzle-orm'

import { fillMissingDatesSimple, type DailyCount } from '@/lib/utils/date.util'

export type DashboardStats = {
    blogPosts: {
        total: number
        published: number
        draft: number
    }
    contacts: {
        total: number
        recent: number
    }
    feedback: {
        bugReports: number
        betaFeedback: number
    }
    emails: {
        total: number
        sent: number
        failed: number
        successRate: number
    }
}

export async function getDashboardStats(): Promise<DashboardStats> {
    // Calculate date for "recent" contacts (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [
        totalPostsResult,
        publishedPostsResult,
        draftPostsResult,
        totalContactsResult,
        recentContactsResult,
        totalBugReportsResult,
        totalBetaFeedbackResult,
        totalEmailsResult,
        sentEmailsResult,
        failedEmailsResult,
    ] = await Promise.all([
        db.select({ count: count() }).from(blogPost),
        db
            .select({ count: count() })
            .from(blogPost)
            .where(eq(blogPost.status, 'published')),
        db
            .select({ count: count() })
            .from(blogPost)
            .where(eq(blogPost.status, 'draft')),
        db.select({ count: count() }).from(contactSubmission),
        db
            .select({ count: count() })
            .from(contactSubmission)
            .where(gte(contactSubmission.createdAt, sevenDaysAgo)),
        db.select({ count: count() }).from(bugReport),
        db.select({ count: count() }).from(betaFeedback),
        db.select({ count: count() }).from(emailLog),
        db
            .select({ count: count() })
            .from(emailLog)
            .where(eq(emailLog.status, 'sent')),
        db
            .select({ count: count() })
            .from(emailLog)
            .where(eq(emailLog.status, 'failed')),
    ])

    const totalEmails = totalEmailsResult[0]?.count ?? 0
    const sentEmails = sentEmailsResult[0]?.count ?? 0
    const failedEmails = failedEmailsResult[0]?.count ?? 0

    return {
        blogPosts: {
            total: totalPostsResult[0]?.count ?? 0,
            published: publishedPostsResult[0]?.count ?? 0,
            draft: draftPostsResult[0]?.count ?? 0,
        },
        contacts: {
            total: totalContactsResult[0]?.count ?? 0,
            recent: recentContactsResult[0]?.count ?? 0,
        },
        feedback: {
            bugReports: totalBugReportsResult[0]?.count ?? 0,
            betaFeedback: totalBetaFeedbackResult[0]?.count ?? 0,
        },
        emails: {
            total: totalEmails,
            sent: sentEmails,
            failed: failedEmails,
            successRate:
                totalEmails > 0
                    ? Math.round((sentEmails / totalEmails) * 100)
                    : 0,
        },
    }
}

export type RecentContact = {
    id: string
    name: string
    email: string
    subject: string | null
    createdAt: Date | null
}

export async function getRecentContacts(limit = 5): Promise<RecentContact[]> {
    const contacts = await db
        .select({
            id: contactSubmission.id,
            name: contactSubmission.name,
            email: contactSubmission.email,
            subject: contactSubmission.subject,
            createdAt: contactSubmission.createdAt,
        })
        .from(contactSubmission)
        .orderBy(desc(contactSubmission.createdAt))
        .limit(limit)

    return contacts
}

export type RecentBugReport = {
    id: string
    description: string
    pageUrl: string
    severity: string | null
    status: string | null
    createdAt: Date
}

export async function getRecentBugReports(
    limit = 5
): Promise<RecentBugReport[]> {
    const reports = await db
        .select({
            id: bugReport.id,
            description: bugReport.description,
            pageUrl: bugReport.pageUrl,
            severity: bugReport.severity,
            status: bugReport.status,
            createdAt: bugReport.createdAt,
        })
        .from(bugReport)
        .orderBy(desc(bugReport.createdAt))
        .limit(limit)

    return reports
}

// Time-series data for charts
// Re-export DailyCount from shared utility for backwards compatibility
export type { DailyCount }

export async function getContactsOverTime(days = 30): Promise<DailyCount[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const results = await db
        .select({
            date: sql<string>`DATE(${contactSubmission.createdAt})`.as('date'),
            count: count(),
        })
        .from(contactSubmission)
        .where(gte(contactSubmission.createdAt, startDate))
        .groupBy(sql`DATE(${contactSubmission.createdAt})`)
        .orderBy(sql`DATE(${contactSubmission.createdAt})`)

    // Fill in missing dates with 0 using shared utility
    return fillMissingDatesSimple(results, days)
}

export type SeverityCount = {
    severity: string
    count: number
}

export async function getBugsBySeverity(): Promise<SeverityCount[]> {
    const results = await db
        .select({
            severity: sql<string>`COALESCE(${bugReport.severity}, 'medium')`.as(
                'severity'
            ),
            count: count(),
        })
        .from(bugReport)
        .groupBy(bugReport.severity)

    return results
}

export type PostStatusCount = {
    status: string
    count: number
}

export async function getPostsByStatus(): Promise<PostStatusCount[]> {
    const results = await db
        .select({
            status: sql<string>`COALESCE(${blogPost.status}, 'draft')`.as(
                'status'
            ),
            count: count(),
        })
        .from(blogPost)
        .groupBy(blogPost.status)

    return results
}

export type TopPost = {
    title: string
    views: number
    slug: string
}

export async function getTopPostsByViews(limit = 5): Promise<TopPost[]> {
    const results = await db
        .select({
            title: blogPost.title,
            views: blogPost.views,
            slug: blogPost.slug,
        })
        .from(blogPost)
        .where(eq(blogPost.status, 'published'))
        .orderBy(desc(blogPost.views))
        .limit(limit)

    return results
}

export async function getEmailsOverTime(days = 30): Promise<DailyCount[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const results = await db
        .select({
            date: sql<string>`DATE(${emailLog.sentAt})`.as('date'),
            count: count(),
        })
        .from(emailLog)
        .where(gte(emailLog.sentAt, startDate))
        .groupBy(sql`DATE(${emailLog.sentAt})`)
        .orderBy(sql`DATE(${emailLog.sentAt})`)

    return fillMissingDatesSimple(results, days)
}

export type EmailStatusCount = {
    status: string
    count: number
}

export async function getEmailsByStatus(): Promise<EmailStatusCount[]> {
    const results = await db
        .select({
            status: emailLog.status,
            count: count(),
        })
        .from(emailLog)
        .groupBy(emailLog.status)

    return results
}
