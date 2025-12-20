import { cache } from 'react'
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { contactSubmission } from '@workspace/db/schema/contact'
import { emailLog } from '@workspace/db/schema/emails'
import { bugReport } from '@workspace/db/schema/feedback'
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

type DashboardStatsRow = {
    total_posts: number
    published_posts: number
    draft_posts: number
    total_contacts: number
    recent_contacts: number
    total_bug_reports: number
    total_beta_feedback: number
    total_emails: number
    sent_emails: number
    failed_emails: number
}

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
    // Calculate date for "recent" contacts (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Optimized: Single query instead of 10 concurrent queries
    const result = await db.execute<DashboardStatsRow>(sql`
        SELECT
            (SELECT COUNT(*)::int FROM blog_post) AS total_posts,
            (SELECT COUNT(*)::int FROM blog_post WHERE status = 'published') AS published_posts,
            (SELECT COUNT(*)::int FROM blog_post WHERE status = 'draft') AS draft_posts,
            (SELECT COUNT(*)::int FROM contact_submission) AS total_contacts,
            (SELECT COUNT(*)::int FROM contact_submission WHERE created_at >= ${sevenDaysAgo}) AS recent_contacts,
            (SELECT COUNT(*)::int FROM bug_report) AS total_bug_reports,
            (SELECT COUNT(*)::int FROM beta_feedback) AS total_beta_feedback,
            (SELECT COUNT(*)::int FROM email_log) AS total_emails,
            (SELECT COUNT(*)::int FROM email_log WHERE status = 'sent') AS sent_emails,
            (SELECT COUNT(*)::int FROM email_log WHERE status = 'failed') AS failed_emails
    `)

    const stats = result[0]

    const totalEmails = stats?.total_emails ?? 0
    const sentEmails = stats?.sent_emails ?? 0
    const failedEmails = stats?.failed_emails ?? 0

    return {
        blogPosts: {
            total: stats?.total_posts ?? 0,
            published: stats?.published_posts ?? 0,
            draft: stats?.draft_posts ?? 0,
        },
        contacts: {
            total: stats?.total_contacts ?? 0,
            recent: stats?.recent_contacts ?? 0,
        },
        feedback: {
            bugReports: stats?.total_bug_reports ?? 0,
            betaFeedback: stats?.total_beta_feedback ?? 0,
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
})

export type RecentContact = {
    id: string
    name: string
    email: string
    subject: string | null
    createdAt: Date | null
}

export const getRecentContacts = cache(
    async (limit = 5): Promise<RecentContact[]> => {
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
)

export type RecentBugReport = {
    id: string
    description: string
    pageUrl: string
    severity: string | null
    status: string | null
    createdAt: Date
}

export const getRecentBugReports = cache(
    async (limit = 5): Promise<RecentBugReport[]> => {
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
)

// Time-series data for charts
// Re-export DailyCount from shared utility for backwards compatibility
export type { DailyCount }

export const getContactsOverTime = cache(
    async (days = 30): Promise<DailyCount[]> => {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const results = await db
            .select({
                date: sql<string>`DATE(${contactSubmission.createdAt})`.as(
                    'date'
                ),
                count: count(),
            })
            .from(contactSubmission)
            .where(gte(contactSubmission.createdAt, startDate))
            .groupBy(sql`DATE(${contactSubmission.createdAt})`)
            .orderBy(sql`DATE(${contactSubmission.createdAt})`)

        // Fill in missing dates with 0 using shared utility
        return fillMissingDatesSimple(results, days)
    }
)

export type SeverityCount = {
    severity: string
    count: number
}

export const getBugsBySeverity = cache(async (): Promise<SeverityCount[]> => {
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
})

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

export const getTopPostsByViews = cache(
    async (limit = 5): Promise<TopPost[]> => {
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
)

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

export const getEmailsByStatus = cache(
    async (): Promise<EmailStatusCount[]> => {
        const results = await db
            .select({
                status: emailLog.status,
                count: count(),
            })
            .from(emailLog)
            .groupBy(emailLog.status)

        return results
    }
)
