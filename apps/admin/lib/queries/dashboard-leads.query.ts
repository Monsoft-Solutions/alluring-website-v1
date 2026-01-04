import { cache } from 'react'
import { db } from '@workspace/db/client'
import { chatSession } from '@workspace/db/schema/chat'
import { desc, inArray, gte, lte, and, eq } from 'drizzle-orm'

import { getQueryDateRange } from '@/lib/utils/query-date-range.util'
import type { HighValueLead } from '@/lib/types/analytics/high-value-lead.type'

/**
 * Get recent high-value leads (Grade A or B) filtered by date range.
 *
 * @param days - Number of days to filter by (default 7)
 * @param limit - Maximum number of leads to return (default 5)
 */
export const getHighValueLeads = cache(
    async (days = 7, limit = 5): Promise<HighValueLead[]> => {
        const { startDate, endDate } = getQueryDateRange(days)

        const leads = await db
            .select({
                id: chatSession.id,
                fullName: chatSession.fullName,
                email: chatSession.email,
                phone: chatSession.phone,
                leadGrade: chatSession.leadGrade,
                leadScore: chatSession.leadScore,
                createdAt: chatSession.createdAt,
            })
            .from(chatSession)
            .where(
                and(
                    inArray(chatSession.leadGrade, ['A', 'B']),
                    gte(chatSession.createdAt, startDate),
                    lte(chatSession.createdAt, endDate),
                    eq(chatSession.isTestSession, false)
                )
            )
            .orderBy(desc(chatSession.createdAt))
            .limit(limit)
        return leads
    }
)
