/**
 * Quick Questions API Route
 *
 * Returns AI-generated quick questions for a specific message.
 * Used by the frontend to fetch contextual follow-up suggestions.
 *
 * @module app/api/chat/message/[id]/quick-questions/route
 */
import { NextResponse } from 'next/server'
import { getMessageSuggestedQuestions } from '@/lib/queries/chat.query'

type RouteParams = {
    params: Promise<{ id: string }>
}

/**
 * GET /api/chat/message/[id]/quick-questions
 *
 * Returns suggested questions for a specific message.
 * Returns null if questions haven't been generated yet.
 */
export async function GET(
    _request: Request,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        const { id: messageId } = await params

        if (!messageId) {
            return NextResponse.json(
                { error: 'Message ID is required' },
                { status: 400 }
            )
        }

        const questions = await getMessageSuggestedQuestions(messageId)

        return NextResponse.json({
            success: true,
            questions,
        })
    } catch (error) {
        console.error('Failed to fetch quick questions:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch quick questions' },
            { status: 500 }
        )
    }
}
