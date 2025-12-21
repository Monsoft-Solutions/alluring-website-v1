import { db } from '@workspace/db/client'
import { contactSubmission } from '@workspace/db/schema/contact'
import { emailLog } from '@workspace/db/schema/emails'
import { count, desc, eq, and, gte, lte, sql } from 'drizzle-orm'

import type {
    EmailLogListItem,
    EmailFilters,
    EmailStats,
    EmailLogById,
} from '@/lib/types/emails/emails.type'

export async function getEmailLogs(
    page = 1,
    pageSize = 10,
    filters?: EmailFilters
): Promise<{ emails: EmailLogListItem[]; total: number }> {
    const offset = (page - 1) * pageSize

    // Build where conditions
    const conditions = []

    if (filters?.status && filters.status !== 'all') {
        conditions.push(eq(emailLog.status, filters.status))
    }

    if (filters?.startDate) {
        conditions.push(gte(emailLog.sentAt, filters.startDate))
    }

    if (filters?.endDate) {
        conditions.push(lte(emailLog.sentAt, filters.endDate))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [emails, totalResult] = await Promise.all([
        db
            .select({
                id: emailLog.id,
                to: emailLog.to,
                from: emailLog.from,
                subject: emailLog.subject,
                status: emailLog.status,
                resendEmailId: emailLog.resendEmailId,
                error: emailLog.error,
                sentAt: emailLog.sentAt,
                contactSubmissionId: emailLog.contactSubmissionId,
                contactName: contactSubmission.name,
                contactEmail: contactSubmission.email,
            })
            .from(emailLog)
            .leftJoin(
                contactSubmission,
                eq(emailLog.contactSubmissionId, contactSubmission.id)
            )
            .where(whereClause)
            .orderBy(desc(emailLog.sentAt))
            .limit(pageSize)
            .offset(offset),
        db.select({ count: count() }).from(emailLog).where(whereClause),
    ])

    return {
        emails,
        total: totalResult[0]?.count ?? 0,
    }
}

export async function getEmailStats(): Promise<EmailStats> {
    const result = await db.execute<{
        total: number
        sent: number
        failed: number
        pending: number
    }>(sql`
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'sent')::int AS sent,
            COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
            COUNT(*) FILTER (WHERE status = 'pending')::int AS pending
        FROM email_log
    `)

    const stats = result[0]
    const total = stats?.total ?? 0
    const sent = stats?.sent ?? 0
    const failed = stats?.failed ?? 0
    const pending = stats?.pending ?? 0

    return {
        total,
        sent,
        failed,
        pending,
        successRate: total > 0 ? Math.round((sent / total) * 100) : 0,
    }
}

export async function getEmailLogById(
    id: string
): Promise<EmailLogById | null> {
    const result = await db
        .select({
            id: emailLog.id,
            to: emailLog.to,
            from: emailLog.from,
            subject: emailLog.subject,
            status: emailLog.status,
            resendEmailId: emailLog.resendEmailId,
            error: emailLog.error,
            sentAt: emailLog.sentAt,
            contactSubmissionId: emailLog.contactSubmissionId,
            contactName: contactSubmission.name,
            contactEmail: contactSubmission.email,
            contactPhone: contactSubmission.phone,
            contactMessage: contactSubmission.message,
        })
        .from(emailLog)
        .leftJoin(
            contactSubmission,
            eq(emailLog.contactSubmissionId, contactSubmission.id)
        )
        .where(eq(emailLog.id, id))
        .limit(1)

    return result[0] ?? null
}
