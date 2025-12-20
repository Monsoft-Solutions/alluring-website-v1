import { cache } from 'react'
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { contactSubmission } from '@workspace/db/schema/contact'
import { bugReport } from '@workspace/db/schema/feedback'
import { emailLog } from '@workspace/db/schema/emails'
import { count, eq, desc, sql, gte } from 'drizzle-orm'

import { fillMissingDatesSimple } from '@/lib/utils/date.util'
import type { DailyCount } from '@/lib/types/common.type'
import type { DashboardStats } from '@/lib/types/dashboard-stats.type'
import type { RecentContact } from '@/lib/types/recent-contact.type'
import type { RecentBugReport } from '@/lib/types/recent-bug-report.type'
import type { SeverityCount } from '@/lib/types/severity-count.type'
import type { PostStatusCount } from '@/lib/types/post-status-count.type'
import type { TopPost } from '@/lib/types/top-post.type'
import type { EmailStatusCount } from '@/lib/types/email-status-count.type'

type DashboardStatsRow = {
    today_visitors: number
    all_time_sessions: number
    total_contacts: number
    recent_contacts: number
    total_chat_sessions: number
    total_chat_messages: number
    active_chat_sessions: number
    high_quality_leads: number
}

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
    // Calculate date for "recent" contacts (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString()

    // Calculate date for "today" visitors
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    // Optimized: Single query instead of multiple concurrent queries
    const result = await db.execute<DashboardStatsRow>(sql`
        SELECT
            (SELECT COUNT(DISTINCT session_id)::int FROM page_view WHERE created_at >= ${todayStr}) AS today_visitors,
            (SELECT COUNT(DISTINCT session_id)::int FROM page_view) AS all_time_sessions,
            (SELECT COUNT(*)::int FROM contact_submission) AS total_contacts,
            (SELECT COUNT(*)::int FROM contact_submission WHERE created_at >= ${sevenDaysAgoStr}) AS recent_contacts,
            (SELECT COUNT(*)::int FROM chat_session) AS total_chat_sessions,
            (SELECT SUM(message_count)::int FROM chat_session) AS total_chat_messages,
            (SELECT COUNT(*)::int FROM chat_session WHERE status = 'active') AS active_chat_sessions,
            (SELECT COUNT(*)::int FROM chat_session WHERE lead_grade IN ('A', 'B')) AS high_quality_leads
    `)

    const stats = result[0]

    const totalChatSessions = stats?.total_chat_sessions ?? 0
    const highQualityLeads = stats?.high_quality_leads ?? 0

    return {
        visitors: {
            today: stats?.today_visitors ?? 0,
            allTime: stats?.all_time_sessions ?? 0,
        },
        contacts: {
            total: stats?.total_contacts ?? 0,
            recent: stats?.recent_contacts ?? 0,
        },
        chat: {
            totalSessions: totalChatSessions,
            totalMessages: stats?.total_chat_messages ?? 0,
            activeSessions: stats?.active_chat_sessions ?? 0,
        },
        leads: {
            highQualityCount: highQualityLeads,
            highQualityPercentage:
                totalChatSessions > 0
                    ? Math.round((highQualityLeads / totalChatSessions) * 100)
                    : 0,
        },
    }
})

/**
 * Get recent contact submissions
 */
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

/**
 * Get recent bug reports
 */
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

/**
 * Get contacts over time for chart visualization
 */
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

/**
 * Get bug distribution by severity
 */
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

/**
 * Get blog post distribution by status
 */
export const getPostsByStatus = cache(async (): Promise<PostStatusCount[]> => {
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
})

/**
 * Get top performing blog posts
 */
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

/**
 * Get email distribution over time
 */
export const getEmailsOverTime = cache(
    async (days = 30): Promise<DailyCount[]> => {
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
)

/**
 * Get email distribution by status
 */
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
