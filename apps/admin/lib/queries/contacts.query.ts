import { db } from '@workspace/db/client'
import { contactSubmission } from '@workspace/db/schema/contact'
import { count, desc, eq } from 'drizzle-orm'

import type { ContactListItem } from '@/lib/types/contacts.type'

export async function getContacts(
    page = 1,
    pageSize = 10
): Promise<{ contacts: ContactListItem[]; total: number }> {
    const offset = (page - 1) * pageSize

    const [contacts, totalResult] = await Promise.all([
        db
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
                // UTM fields
                utmSource: contactSubmission.utmSource,
                utmMedium: contactSubmission.utmMedium,
                utmCampaign: contactSubmission.utmCampaign,
                utmContent: contactSubmission.utmContent,
                utmTerm: contactSubmission.utmTerm,
                // Ad platform IDs
                gclid: contactSubmission.gclid,
                fbclid: contactSubmission.fbclid,
                ttclid: contactSubmission.ttclid,
                // Other analytics
                referrer: contactSubmission.referrer,
                landingPage: contactSubmission.landingPage,
                ipAddress: contactSubmission.ipAddress,
            })
            .from(contactSubmission)
            .orderBy(desc(contactSubmission.createdAt))
            .limit(pageSize)
            .offset(offset),
        db.select({ count: count() }).from(contactSubmission),
    ])

    return {
        contacts,
        total: totalResult[0]?.count ?? 0,
    }
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
