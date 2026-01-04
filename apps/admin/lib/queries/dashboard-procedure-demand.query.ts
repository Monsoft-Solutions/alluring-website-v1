import { cache } from 'react'
import { db } from '@workspace/db/client'
import { contactSubmission } from '@workspace/db/schema/contact'
import { count, desc, isNotNull, and, ne, gte, lte } from 'drizzle-orm'

import { getQueryDateRange } from '@/lib/utils/query-date-range.util'
import type { ProcedureDemand } from '@/lib/types/analytics/procedure-demand.type'

/**
 * Get procedure demand based on contact submissions filtered by date range.
 *
 * @param days - Number of days to filter by (default 7)
 * @param limit - Maximum number of procedures to return (default 10)
 */
export const getProcedureDemand = cache(
    async (days = 7, limit = 10): Promise<ProcedureDemand[]> => {
        const { startDate, endDate } = getQueryDateRange(days)

        const results = await db
            .select({
                procedure: contactSubmission.procedure,
                count: count(),
            })
            .from(contactSubmission)
            .where(
                and(
                    isNotNull(contactSubmission.procedure),
                    ne(contactSubmission.procedure, ''),
                    gte(contactSubmission.createdAt, startDate),
                    lte(contactSubmission.createdAt, endDate)
                )
            )
            .groupBy(contactSubmission.procedure)
            .orderBy(desc(count()))
            .limit(limit)
        return results.map((r) => ({
            procedure: r.procedure ?? 'Unknown',
            count: r.count,
        }))
    }
)
