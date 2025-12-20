import { cache } from 'react'
import { db } from '@workspace/db/client'
import { contactSubmission } from '@workspace/db/schema/contact'
import { count, desc, isNotNull, and, ne } from 'drizzle-orm'

export type ProcedureDemand = {
    procedure: string
    count: number
}

/**
 * Get procedure demand based on contact submissions
 */
export const getProcedureDemand = cache(
    async (limit = 10): Promise<ProcedureDemand[]> => {
        const results = await db
            .select({
                procedure: contactSubmission.procedure,
                count: count(),
            })
            .from(contactSubmission)
            .where(
                and(
                    isNotNull(contactSubmission.procedure),
                    ne(contactSubmission.procedure, '')
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
