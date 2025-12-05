/**
 * Chat Messages API Route
 *
 * Retrieves message history for a chat session.
 *
 * @module app/api/chat/messages/[sessionId]/route
 */
import { type NextRequest, NextResponse } from 'next/server'

import {
    getChatSessionById,
    getSessionMessages,
} from '@/lib/queries/chat.query'

type RouteParams = {
    params: Promise<{ sessionId: string }>
}

/**
 * GET /api/chat/messages/[sessionId]
 *
 * Returns all messages for a chat session
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { sessionId } = await params

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            )
        }

        // Verify session exists
        const session = await getChatSessionById(sessionId)
        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            )
        }

        // Get all messages for the session
        const messages = await getSessionMessages(sessionId)

        return NextResponse.json({
            success: true,
            messages: messages.map((msg) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                createdAt: msg.createdAt,
            })),
        })
    } catch (error) {
        console.error('Failed to get messages:', error)
        return NextResponse.json(
            { error: 'Failed to load messages' },
            { status: 500 }
        )
    }
}
