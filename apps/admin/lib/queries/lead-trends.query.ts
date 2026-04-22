import { and, asc, gte, lte } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { contactSubmission } from '@workspace/db/schema/contact'

import { classifyLeadAttribution } from '@/lib/analytics/classify-lead-attribution'
import type { ClassifiedLead } from '@/lib/types/analytics/lead-trends.type'

/**
 * Fetch all contact submissions in a date range, classified for the
 * lead-trends chart. Sorted ascending by createdAt.
 */
export async function getClassifiedLeadsInRange(
    startDate: Date,
    endDate: Date
): Promise<ClassifiedLead[]> {
    const rows = await db
        .select({
            utmSource: contactSubmission.utmSource,
            utmMedium: contactSubmission.utmMedium,
            source: contactSubmission.source,
            referrer: contactSubmission.referrer,
            gclid: contactSubmission.gclid,
            fbclid: contactSubmission.fbclid,
            ttclid: contactSubmission.ttclid,
            createdAt: contactSubmission.createdAt,
        })
        .from(contactSubmission)
        .where(
            and(
                gte(contactSubmission.createdAt, startDate),
                lte(contactSubmission.createdAt, endDate)
            )
        )
        .orderBy(asc(contactSubmission.createdAt))

    return rows.map((row) => {
        const attribution = classifyLeadAttribution({
            utmSource: row.utmSource,
            utmMedium: row.utmMedium,
            source: row.source,
            referrer: row.referrer,
            gclid: row.gclid,
            fbclid: row.fbclid,
            ttclid: row.ttclid,
        })
        return {
            ts: row.createdAt.toISOString(),
            source: attribution.source,
            medium: attribution.medium,
            classification: attribution.classification,
        }
    })
}
