import { db } from '@workspace/db/client'
import { contactSubmission } from '@workspace/db/schema/contact'
import { count, desc } from 'drizzle-orm'

export type ContactListItem = {
    id: string
    name: string
    firstName: string | null
    lastName: string | null
    email: string
    phone: string | null
    subject: string | null
    message: string | null
    procedure: string | null
    source: string | null
    createdAt: Date
}

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
                createdAt: contactSubmission.createdAt,
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
