/**
 * Chat Escalation API Route
 *
 * Handles escalating a chat session to human support.
 *
 * @module app/api/chat/escalate/route
 */
import { type NextRequest, NextResponse } from 'next/server'

import {
    getChatSessionById,
    escalateChatSession,
    saveChatMessage,
} from '@/lib/queries/chat.query'

/**
 * POST /api/chat/escalate
 *
 * Escalates a chat session to human support
 */
export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as {
            sessionId: string
            reason?: string
        }
        const { sessionId, reason } = body

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

        // Don't escalate if already escalated
        if (session.isEscalated) {
            return NextResponse.json({
                success: true,
                message: 'Session is already escalated',
                alreadyEscalated: true,
            })
        }

        // Escalate the session
        const escalationReason = reason ?? 'user_request'
        await escalateChatSession(sessionId, escalationReason)

        // Add a system message about the escalation
        await saveChatMessage({
            sessionId,
            role: 'assistant',
            content:
                "I'm connecting you with a team member who can better assist you. They typically respond within a few minutes during business hours. In the meantime, feel free to share any additional details about your question.",
        })

        return NextResponse.json({
            success: true,
            message: 'Session escalated successfully',
        })
    } catch (error) {
        console.error('Escalation error:', error)
        return NextResponse.json(
            { error: 'Failed to escalate session' },
            { status: 500 }
        )
    }
}
