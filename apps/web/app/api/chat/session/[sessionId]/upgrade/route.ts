/**
 * Chat Session Upgrade API Route
 *
 * Upgrades an anonymous chat session with contact information.
 * Used when a user decides to provide their details after starting an anonymous chat.
 *
 * @module app/api/chat/session/[sessionId]/upgrade/route
 */
import { type NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

import {
    getChatSessionById,
    upgradeChatSession,
} from '@/lib/queries/chat.query'

/**
 * Validation schema for upgrade request
 */
const upgradeSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().min(10, 'Please enter a valid phone number').max(20),
    email: z.string().email().optional().or(z.literal('')),
})

type RouteParams = {
    params: Promise<{ sessionId: string }>
}

/**
 * PATCH /api/chat/session/[sessionId]/upgrade
 *
 * Upgrades an anonymous session with contact information.
 * Only works on sessions that are currently anonymous.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { sessionId } = await params

        // Validate session exists
        const existingSession = await getChatSessionById(sessionId)

        if (!existingSession) {
            return NextResponse.json(
                { success: false, error: 'Session not found' },
                { status: 404 }
            )
        }

        // Check if session is anonymous
        if (!existingSession.isAnonymous) {
            return NextResponse.json(
                { success: false, error: 'Session is already upgraded' },
                { status: 400 }
            )
        }

        // Parse and validate request body
        const body = await request.json()
        const validatedData = upgradeSchema.parse(body)

        // Upgrade the session
        const updatedSession = await upgradeChatSession(sessionId, {
            fullName: validatedData.fullName,
            phone: validatedData.phone,
            email: validatedData.email || null,
        })

        if (!updatedSession) {
            return NextResponse.json(
                { success: false, error: 'Failed to upgrade session' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            session: {
                id: updatedSession.id,
                fullName: updatedSession.fullName,
                isAnonymous: false,
            },
        })
    } catch (error) {
        // Handle Zod validation errors
        if (error instanceof ZodError) {
            const firstError = error.issues[0]
            return NextResponse.json(
                {
                    success: false,
                    error: firstError?.message ?? 'Validation failed',
                },
                { status: 400 }
            )
        }

        console.error('Session upgrade error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to upgrade session' },
            { status: 500 }
        )
    }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
