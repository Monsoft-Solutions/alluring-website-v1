/**
 * Admin Chat Respond API Route
 *
 * Allows admins to send messages to escalated chat sessions.
 *
 * @module app/api/chat/respond/route
 */
import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@workspace/db/client'
import { chatMessage, chatSession } from '@workspace/db/schema/chat'
import { eq, sql } from 'drizzle-orm'
import { isAuthenticated } from '@/lib/utils/auth.util'

/**
 * POST /api/chat/respond
 *
 * Sends an admin response to a chat session
 */
export async function POST(request: NextRequest) {
    try {
        const authenticated = await isAuthenticated()
        if (!authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body: unknown = await request.json()
        const { sessionId, message, adminName } = body as {
            sessionId: string
            message: string
            adminName?: string
        }

        if (!sessionId || !message) {
            return NextResponse.json(
                { error: 'Session ID and message are required' },
                { status: 400 }
            )
        }

        // Verify session exists
        const sessions = await db
            .select()
            .from(chatSession)
            .where(eq(chatSession.id, sessionId))
            .limit(1)

        if (!sessions[0]) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            )
        }

        // Format message with admin name if provided
        const formattedMessage = adminName
            ? `[${adminName}]: ${message}`
            : message

        // Save the admin message
        const [savedMessage] = await db
            .insert(chatMessage)
            .values({
                sessionId,
                role: 'assistant',
                content: formattedMessage,
            })
            .returning()

        // Update session
        await db
            .update(chatSession)
            .set({
                messageCount: sql`${chatSession.messageCount} + 1`,
                lastMessageAt: new Date(),
            })
            .where(eq(chatSession.id, sessionId))

        return NextResponse.json({
            success: true,
            message: savedMessage,
        })
    } catch (error) {
        console.error('Admin respond error:', error)
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        )
    }
}
