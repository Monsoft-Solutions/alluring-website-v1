/**
 * Quick Reply Click Tracking API Route
 *
 * Tracks when a quick reply is clicked for analytics.
 *
 * @module app/api/chat/quick-replies/track/route
 */
import { NextResponse } from 'next/server'
import { db } from '@workspace/db/client'
import { chatQuickReply } from '@workspace/db/schema/chat'
import { eq, sql } from 'drizzle-orm'

/**
 * POST /api/chat/quick-replies/track
 *
 * Increments the click count for a quick reply.
 */
export async function POST(request: Request) {
    try {
        const body = (await request.json()) as { quickReplyId: string }
        const { quickReplyId } = body

        if (!quickReplyId) {
            return NextResponse.json(
                { success: false, error: 'Quick reply ID is required' },
                { status: 400 }
            )
        }

        await db
            .update(chatQuickReply)
            .set({
                clickCount: sql`${chatQuickReply.clickCount} + 1`,
            })
            .where(eq(chatQuickReply.id, quickReplyId))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to track quick reply click:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to track click' },
            { status: 500 }
        )
    }
}
