/**
 * Chat Session Resume API Route
 *
 * Validates and returns an existing chat session for resumption.
 * Used to restore chat sessions from cookies.
 *
 * @module app/api/chat/session/[sessionId]/route
 */
import { type NextRequest, NextResponse } from 'next/server'

import {
    getChatSessionById,
    getChatConfig,
    getSessionMessages,
} from '@/lib/queries/chat.query'

type RouteParams = {
    params: Promise<{ sessionId: string }>
}

/**
 * Session expiry in days (matches Crisp's 6-month policy)
 */
const SESSION_EXPIRY_DAYS = 180

/**
 * Check if a session is expired based on last activity
 */
function isSessionExpired(lastActivityDate: Date): boolean {
    const expiryMs = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    const now = new Date()
    return now.getTime() - lastActivityDate.getTime() > expiryMs
}

/**
 * GET /api/chat/session/[sessionId]
 *
 * Validates and returns session data for resumption
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

        // Get session from database
        const session = await getChatSessionById(sessionId)

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found', code: 'SESSION_NOT_FOUND' },
                { status: 404 }
            )
        }

        // Check if session is closed or archived
        if (session.status === 'closed' || session.status === 'archived') {
            return NextResponse.json(
                { error: 'Session is closed', code: 'SESSION_CLOSED' },
                { status: 410 }
            )
        }

        // Check if session is expired based on last activity
        const lastActivity = session.lastMessageAt ?? session.createdAt
        if (isSessionExpired(lastActivity)) {
            return NextResponse.json(
                { error: 'Session has expired', code: 'SESSION_EXPIRED' },
                { status: 410 }
            )
        }

        // Get chat configuration
        const config = await getChatConfig()

        // Check if chat is enabled
        if (!config.isEnabled) {
            return NextResponse.json(
                { error: 'Chat is currently disabled', code: 'CHAT_DISABLED' },
                { status: 503 }
            )
        }

        // Get existing messages for the session
        const messages = await getSessionMessages(sessionId)

        // Return session data for resumption
        return NextResponse.json({
            success: true,
            session: {
                id: session.id,
                fullName: session.fullName,
                status: session.status,
                messageCount: session.messageCount,
                createdAt: session.createdAt,
                lastMessageAt: session.lastMessageAt,
            },
            config: {
                agentName: config.agentName,
                welcomeMessage: config.welcomeMessage,
                primaryColor: config.primaryColor,
            },
            messages: messages.map((msg) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                createdAt: msg.createdAt,
            })),
        })
    } catch (error) {
        console.error('Session resume error:', error)
        return NextResponse.json(
            { error: 'Failed to resume session', code: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }
}
