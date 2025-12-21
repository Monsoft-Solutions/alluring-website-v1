/**
 * Chat Session API Route
 *
 * Handles session creation for new chat conversations.
 * Collects lead information and creates a session in the database.
 *
 * @module app/api/chat/session/route
 */
import { type NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { getChatConfig, createChatSession } from '@/lib/queries/chat.query'
import {
    preChatFormSchema,
    type CreateSessionRequest,
} from '@workspace/chat/types'

/**
 * Extract client IP address from request headers
 */
function getClientIP(request: NextRequest): string | undefined {
    const xForwardedFor = request.headers.get('x-forwarded-for')
    if (xForwardedFor) {
        const firstIP = xForwardedFor.split(',')[0]?.trim()
        if (firstIP) return firstIP
    }

    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    if (cfConnectingIP) return cfConnectingIP

    const xRealIP = request.headers.get('x-real-ip')
    if (xRealIP) return xRealIP

    return undefined
}

/**
 * POST /api/chat/session
 *
 * Creates a new chat session with lead information
 */
export async function POST(request: NextRequest) {
    try {
        // Get chat configuration to check if enabled
        const config = await getChatConfig()

        if (!config.isEnabled) {
            return NextResponse.json(
                { error: 'Chat is currently disabled' },
                { status: 503 }
            )
        }

        // Parse request body
        const body = (await request.json()) as CreateSessionRequest

        // Validate pre-chat form data
        const validatedData = preChatFormSchema.parse({
            fullName: body.fullName,
            phone: body.phone,
            email: body.email,
        })

        // Extract metadata
        const clientIP = getClientIP(request)
        const userAgent = request.headers.get('user-agent') ?? undefined

        // Create session in database
        const session = await createChatSession({
            fullName: validatedData.fullName,
            phone: validatedData.phone,
            email: validatedData.email || null,
            ipAddress: clientIP,
            userAgent,
            pageUrl: body.pageUrl,
            referrer: body.referrer,
            utmSource: body.utmSource,
            utmMedium: body.utmMedium,
            utmCampaign: body.utmCampaign,
            isTestSession: body.isTestSession ?? false,
        })

        // Return session info with welcome message
        return NextResponse.json({
            success: true,
            session: {
                id: session.id,
                fullName: session.fullName,
            },
            config: {
                agentName: config.agentName,
                welcomeMessage: config.welcomeMessage,
                primaryColor: config.primaryColor,
                agentImageUrl: config.agentImageUrl,
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

        console.error('Session creation error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create session' },
            { status: 500 }
        )
    }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export function OPTIONS(): NextResponse {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
