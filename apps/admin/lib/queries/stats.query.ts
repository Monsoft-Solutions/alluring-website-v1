import { cache } from 'react'
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { contactSubmission } from '@workspace/db/schema/contact'
import { bugReport } from '@workspace/db/schema/feedback'
import { emailLog } from '@workspace/db/schema/emails'
import { count, eq, desc, sql, gte, lte, and } from 'drizzle-orm'

import { fillMissingDatesSimple } from '@/lib/utils/date.util'
import { getQueryDateRange } from '@/lib/utils/query-date-range.util'
import type { DailyCount, HourlyCount } from '@/lib/types/common/common.type'
import type { DashboardStats } from '@/lib/types/analytics/dashboard-stats.type'
import type { RecentContact } from '@/lib/types/contacts/recent-contact.type'
import type { RecentBugReport } from '@/lib/types/feedback/recent-bug-report.type'
import type { SeverityCount } from '@/lib/types/feedback/severity-count.type'
import type { PostStatusCount } from '@/lib/types/blog/post-status-count.type'
import type { TopPost } from '@/lib/types/blog/top-post.type'
import type { EmailStatusCount } from '@/lib/types/emails/email-status-count.type'

type DashboardStatsRow = {
    period_visitors: number
    all_time_sessions: number
    total_contacts: number
    period_contacts: number
    total_chat_sessions: number
    total_chat_messages: number
    active_chat_sessions: number
    high_quality_leads: number
}

/**
 * Get dashboard summary stats filtered by date range.
 *
 * @param days - Number of days to filter by (0 = today only, 1 = yesterday, 7 = last 7 days, etc.)
 */
export const getDashboardStats = cache(
    async (days = 7): Promise<DashboardStats> => {
        // Use string versions for raw SQL queries
        const { startDateStr, endDateStr } = getQueryDateRange(days)

        // Optimized: Single query instead of multiple concurrent queries
        // Uses both startDate and endDate bounds for correct "yesterday" filtering
        // Excludes test sessions from chat counts
        const result = await db.execute<DashboardStatsRow>(sql`
        SELECT
            (SELECT COUNT(DISTINCT session_id)::int FROM page_view WHERE created_at >= ${startDateStr} AND created_at <= ${endDateStr}) AS period_visitors,
            (SELECT COUNT(DISTINCT session_id)::int FROM page_view) AS all_time_sessions,
            (SELECT COUNT(*)::int FROM contact_submission) AS total_contacts,
            (SELECT COUNT(*)::int FROM contact_submission WHERE created_at >= ${startDateStr} AND created_at <= ${endDateStr}) AS period_contacts,
            (SELECT COUNT(*)::int FROM chat_session WHERE created_at >= ${startDateStr} AND created_at <= ${endDateStr} AND is_test_session = false) AS total_chat_sessions,
            (SELECT COALESCE(SUM(message_count), 0)::int FROM chat_session WHERE created_at >= ${startDateStr} AND created_at <= ${endDateStr} AND is_test_session = false) AS total_chat_messages,
            (SELECT COUNT(*)::int FROM chat_session WHERE status = 'active' AND created_at >= ${startDateStr} AND created_at <= ${endDateStr} AND is_test_session = false) AS active_chat_sessions,
            (SELECT COUNT(*)::int FROM chat_session WHERE lead_grade IN ('A', 'B') AND created_at >= ${startDateStr} AND created_at <= ${endDateStr} AND is_test_session = false) AS high_quality_leads
    `)

        const stats = result[0]

        const totalChatSessions = stats?.total_chat_sessions ?? 0
        const highQualityLeads = stats?.high_quality_leads ?? 0

        return {
            visitors: {
                today: stats?.period_visitors ?? 0,
                allTime: stats?.all_time_sessions ?? 0,
            },
            contacts: {
                total: stats?.total_contacts ?? 0,
                recent: stats?.period_contacts ?? 0,
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
                        ? Math.round(
                              (highQualityLeads / totalChatSessions) * 100
                          )
                        : 0,
            },
        }
    }
)

/**
 * Get recent contact submissions filtered by date range.
 *
 * @param days - Number of days to filter by (default 7)
 * @param limit - Maximum number of contacts to return (default 5)
 */
export const getRecentContacts = cache(
    async (days = 7, limit = 5): Promise<RecentContact[]> => {
        const { startDate, endDate } = getQueryDateRange(days)

        const contacts = await db
            .select({
                id: contactSubmission.id,
                name: contactSubmission.name,
                email: contactSubmission.email,
                subject: contactSubmission.subject,
                createdAt: contactSubmission.createdAt,
            })
            .from(contactSubmission)
            .where(
                and(
                    gte(contactSubmission.createdAt, startDate),
                    lte(contactSubmission.createdAt, endDate)
                )
            )
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
 * Get contacts over time for chart visualization.
 *
 * Note: For charts, we go back exactly N days from today to get N+1 data points.
 * This is different from the date picker logic which uses "last N days including today".
 *
 * @param days - Number of days to go back (default 30)
 */
export const getContactsOverTime = cache(
    async (days = 30): Promise<DailyCount[]> => {
        const endDate = new Date()
        endDate.setHours(23, 59, 59, 999)

        const startDate = new Date()
        startDate.setHours(0, 0, 0, 0)
        startDate.setDate(startDate.getDate() - days)

        const results = await db
            .select({
                date: sql<string>`DATE(${contactSubmission.createdAt})`.as(
                    'date'
                ),
                count: count(),
            })
            .from(contactSubmission)
            .where(
                and(
                    gte(contactSubmission.createdAt, startDate),
                    lte(contactSubmission.createdAt, endDate)
                )
            )
            .groupBy(sql`DATE(${contactSubmission.createdAt})`)
            .orderBy(sql`DATE(${contactSubmission.createdAt})`)

        // Fill in missing dates with 0 using shared utility
        return fillMissingDatesSimple(results, days)
    }
)

/**
 * Get contacts grouped by hour for a specific date.
 * Used for Today/Yesterday hourly breakdown.
 *
 * @param targetDate - The date to get hourly data for
 */
export const getContactsHourly = cache(
    async (targetDate: Date): Promise<HourlyCount[]> => {
        const startOfDay = new Date(targetDate)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        const results = await db
            .select({
                hour: sql<number>`EXTRACT(HOUR FROM ${contactSubmission.createdAt})::int`.as(
                    'hour'
                ),
                count: count(),
            })
            .from(contactSubmission)
            .where(
                and(
                    gte(contactSubmission.createdAt, startOfDay),
                    lte(contactSubmission.createdAt, endOfDay)
                )
            )
            .groupBy(sql`EXTRACT(HOUR FROM ${contactSubmission.createdAt})`)
            .orderBy(sql`EXTRACT(HOUR FROM ${contactSubmission.createdAt})`)

        // Fill in missing hours with zeros (0-23)
        const hourlyData: HourlyCount[] = []
        const resultMap = new Map(results.map((r) => [r.hour, r]))

        for (let hour = 0; hour < 24; hour++) {
            const existing = resultMap.get(hour)
            hourlyData.push({
                hour,
                count: existing?.count ?? 0,
            })
        }

        return hourlyData
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
