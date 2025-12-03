import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { contactSubmission } from '@workspace/db/schema/contact'
import { betaFeedback, bugReport } from '@workspace/db/schema/feedback'
import { count, eq, desc } from 'drizzle-orm'

export type DashboardStats = {
    blogPosts: {
        total: number
        published: number
        draft: number
    }
    contacts: {
        total: number
        recent: number
    }
    feedback: {
        bugReports: number
        betaFeedback: number
    }
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const [
        totalPostsResult,
        publishedPostsResult,
        draftPostsResult,
        totalContactsResult,
        totalBugReportsResult,
        totalBetaFeedbackResult,
    ] = await Promise.all([
        db.select({ count: count() }).from(blogPost),
        db
            .select({ count: count() })
            .from(blogPost)
            .where(eq(blogPost.status, 'published')),
        db
            .select({ count: count() })
            .from(blogPost)
            .where(eq(blogPost.status, 'draft')),
        db.select({ count: count() }).from(contactSubmission),
        db.select({ count: count() }).from(bugReport),
        db.select({ count: count() }).from(betaFeedback),
    ])

    return {
        blogPosts: {
            total: totalPostsResult[0]?.count ?? 0,
            published: publishedPostsResult[0]?.count ?? 0,
            draft: draftPostsResult[0]?.count ?? 0,
        },
        contacts: {
            total: totalContactsResult[0]?.count ?? 0,
            recent: totalContactsResult[0]?.count ?? 0, // Could filter by date
        },
        feedback: {
            bugReports: totalBugReportsResult[0]?.count ?? 0,
            betaFeedback: totalBetaFeedbackResult[0]?.count ?? 0,
        },
    }
}

export type RecentContact = {
    id: string
    name: string
    email: string
    subject: string | null
    createdAt: Date | null
}

export async function getRecentContacts(limit = 5): Promise<RecentContact[]> {
    const contacts = await db
        .select({
            id: contactSubmission.id,
            name: contactSubmission.name,
            email: contactSubmission.email,
            subject: contactSubmission.subject,
            createdAt: contactSubmission.createdAt,
        })
        .from(contactSubmission)
        .orderBy(desc(contactSubmission.createdAt))
        .limit(limit)

    return contacts
}

export type RecentBugReport = {
    id: string
    description: string
    pageUrl: string
    severity: string | null
    status: string | null
    createdAt: Date
}

export async function getRecentBugReports(
    limit = 5
): Promise<RecentBugReport[]> {
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
