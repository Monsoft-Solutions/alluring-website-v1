import { cache } from 'react'
import { db } from '@workspace/db/client'
import { chatSession } from '@workspace/db/schema/chat'
import { count, sql, isNotNull, gte, and } from 'drizzle-orm'

import type { ChatSummary } from '@/lib/types/chat/chat-summary.type'
import type { LeadGradeDistribution } from '@/lib/types/analytics/lead-grade-distribution.type'

type ChatSummaryRow = {
    total_sessions: number
    total_messages: number
    avg_messages: number
    active_sessions: number
    avg_score: number
}

/**
 * Get summary stats for chat sessions filtered by date range.
 *
 * @param days - Number of days to filter by (default 7)
 */
export const getChatSummary = cache(async (days = 7): Promise<ChatSummary> => {
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    if (days > 0) {
        startDate.setDate(startDate.getDate() - (days - 1))
    }
    const startDateStr = startDate.toISOString()

    const result = await db.execute<ChatSummaryRow>(sql`
        SELECT
            COUNT(*)::int AS total_sessions,
            SUM(message_count)::int AS total_messages,
            AVG(message_count)::float AS avg_messages,
            COUNT(*) FILTER (WHERE status = 'active')::int AS active_sessions,
            AVG(lead_score)::float AS avg_score
        FROM chat_session
        WHERE created_at >= ${startDateStr}
    `)

    const stats = result[0]

    return {
        totalSessions: stats?.total_sessions ?? 0,
        totalMessages: stats?.total_messages ?? 0,
        avgMessagesPerSession: Math.round((stats?.avg_messages ?? 0) * 10) / 10,
        activeSessions: stats?.active_sessions ?? 0,
        avgLeadScore: Math.round(stats?.avg_score ?? 0),
    }
})

/**
 * Get lead grade distribution for donut chart filtered by date range.
 *
 * @param days - Number of days to filter by (default 7)
 */
export const getLeadGradeDistribution = cache(
    async (days = 7): Promise<LeadGradeDistribution[]> => {
        const startDate = new Date()
        startDate.setHours(0, 0, 0, 0)
        if (days > 0) {
            startDate.setDate(startDate.getDate() - (days - 1))
        }

        const results = await db
            .select({
                grade: chatSession.leadGrade,
                count: count(),
            })
            .from(chatSession)
            .where(
                and(
                    isNotNull(chatSession.leadGrade),
                    gte(chatSession.createdAt, startDate)
                )
            )
            .groupBy(chatSession.leadGrade)

        const colors: Record<string, string> = {
            A: '#22c55e', // green-500
            B: '#3b82f6', // blue-500
            C: '#eab308', // yellow-500
            D: '#ef4444', // red-500
        }

        return results.map((r) => ({
            grade: r.grade ?? 'Unknown',
            count: r.count,
            color: colors[r.grade ?? ''] ?? '#94a3b8', // slate-400
        }))
    }
)
