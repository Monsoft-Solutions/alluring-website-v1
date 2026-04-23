import { db } from '@workspace/db/client'
import { contactSubmission } from '@workspace/db/schema/contact'
import { and, desc, eq, gte, lte } from 'drizzle-orm'

import type { ContactListItem } from '@/lib/types/contacts/contacts.type'

/**
 * Fetch every contact submission whose `createdAt` falls within the inclusive
 * [startDate, endDate] window. Returns the full set (no pagination) sorted
 * newest-first so callers can classify, filter, and paginate in memory.
 */
export async function getContactsInDateRange(
    startDate: Date,
    endDate: Date
): Promise<ContactListItem[]> {
    return db
        .select({
            id: contactSubmission.id,
            name: contactSubmission.name,
            firstName: contactSubmission.firstName,
            lastName: contactSubmission.lastName,
            email: contactSubmission.email,
            phone: contactSubmission.phone,
            subject: contactSubmission.subject,
            message: contactSubmission.message,
            procedure: contactSubmission.procedure,
            source: contactSubmission.source,
            preferredContactTime: contactSubmission.preferredContactTime,
            createdAt: contactSubmission.createdAt,
            utmSource: contactSubmission.utmSource,
            utmMedium: contactSubmission.utmMedium,
            utmCampaign: contactSubmission.utmCampaign,
            utmContent: contactSubmission.utmContent,
            utmTerm: contactSubmission.utmTerm,
            gclid: contactSubmission.gclid,
            fbclid: contactSubmission.fbclid,
            ttclid: contactSubmission.ttclid,
            referrer: contactSubmission.referrer,
            landingPage: contactSubmission.landingPage,
            ipAddress: contactSubmission.ipAddress,
        })
        .from(contactSubmission)
        .where(
            and(
                gte(contactSubmission.createdAt, startDate),
                lte(contactSubmission.createdAt, endDate)
            )
        )
        .orderBy(desc(contactSubmission.createdAt))
}

export async function getContactById(
    id: string
): Promise<ContactListItem | null> {
    const result = await db
        .select({
            id: contactSubmission.id,
            name: contactSubmission.name,
            firstName: contactSubmission.firstName,
            lastName: contactSubmission.lastName,
            email: contactSubmission.email,
            phone: contactSubmission.phone,
            subject: contactSubmission.subject,
            message: contactSubmission.message,
            procedure: contactSubmission.procedure,
            source: contactSubmission.source,
            preferredContactTime: contactSubmission.preferredContactTime,
            createdAt: contactSubmission.createdAt,
            utmSource: contactSubmission.utmSource,
            utmMedium: contactSubmission.utmMedium,
            utmCampaign: contactSubmission.utmCampaign,
            utmContent: contactSubmission.utmContent,
            utmTerm: contactSubmission.utmTerm,
            gclid: contactSubmission.gclid,
            fbclid: contactSubmission.fbclid,
            ttclid: contactSubmission.ttclid,
            referrer: contactSubmission.referrer,
            landingPage: contactSubmission.landingPage,
            ipAddress: contactSubmission.ipAddress,
        })
        .from(contactSubmission)
        .where(eq(contactSubmission.id, id))
        .limit(1)

    return result[0] ?? null
}
