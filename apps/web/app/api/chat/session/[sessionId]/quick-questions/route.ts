/**
 * Session Quick Questions API Route
 *
 * Returns the latest AI-generated quick questions for a session.
 * Fetches questions from the most recent assistant message.
 *
 * @module app/api/chat/session/[sessionId]/quick-questions/route
 */
import { NextResponse } from 'next/server'
import { getLatestAssistantMessageQuestions } from '@/lib/queries/chat.query'

type RouteParams = {
    params: Promise<{ sessionId: string }>
}

/**
 * GET /api/chat/session/[sessionId]/quick-questions
 *
 * Returns the latest suggested questions for a session.
 * Returns null if questions haven't been generated yet.
 */
export async function GET(
    _request: Request,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        const { sessionId } = await params

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            )
        }

        const questions = await getLatestAssistantMessageQuestions(sessionId)

        return NextResponse.json({
            success: true,
            questions,
        })
    } catch (error) {
        console.error('Failed to fetch session quick questions:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch quick questions' },
            { status: 500 }
        )
    }
}
