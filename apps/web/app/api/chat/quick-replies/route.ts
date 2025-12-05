/**
 * Quick Replies API Route
 *
 * Returns active quick reply options based on category/context.
 *
 * @module app/api/chat/quick-replies/route
 */
import { NextResponse } from 'next/server'
import { db } from '@workspace/db/client'
import { chatQuickReply } from '@workspace/db/schema/chat'
import { eq, and, asc } from 'drizzle-orm'

/**
 * GET /api/chat/quick-replies
 *
 * Fetches active quick replies, optionally filtered by category.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')

        let quickReplies

        if (category) {
            quickReplies = await db
                .select({
                    id: chatQuickReply.id,
                    label: chatQuickReply.label,
                    message: chatQuickReply.message,
                    category: chatQuickReply.category,
                })
                .from(chatQuickReply)
                .where(
                    and(
                        eq(chatQuickReply.isActive, true),
                        eq(chatQuickReply.category, category)
                    )
                )
                .orderBy(asc(chatQuickReply.sortOrder))
        } else {
            quickReplies = await db
                .select({
                    id: chatQuickReply.id,
                    label: chatQuickReply.label,
                    message: chatQuickReply.message,
                    category: chatQuickReply.category,
                })
                .from(chatQuickReply)
                .where(eq(chatQuickReply.isActive, true))
                .orderBy(asc(chatQuickReply.sortOrder))
        }

        return NextResponse.json({
            success: true,
            quickReplies,
        })
    } catch (error) {
        console.error('Failed to fetch quick replies:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch quick replies' },
            { status: 500 }
        )
    }
}
