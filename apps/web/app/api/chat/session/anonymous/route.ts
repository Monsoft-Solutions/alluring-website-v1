/**
 * Anonymous Chat Session API Route
 *
 * Creates a chat session without requiring pre-chat form data.
 * Used for embedded chat sections where users can start chatting immediately.
 *
 * @module app/api/chat/session/anonymous/route
 */
import { type NextRequest, NextResponse } from 'next/server'

import {
    getChatConfig,
    createAnonymousChatSession,
} from '@/lib/queries/chat.query'

/**
 * Lead context from form submission (thank-you page)
 */
type LeadContextInput = {
    firstName?: string
    procedure?: string
}

/**
 * Request body for anonymous session creation
 */
type AnonymousSessionRequest = {
    pageUrl?: string
    referrer?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    /** Lead context for thank-you page sessions */
    leadContext?: LeadContextInput
}

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
 * POST /api/chat/session/anonymous
 *
 * Creates an anonymous chat session without lead information.
 * The session can be upgraded later when the user provides contact info.
 */
export async function POST(request: NextRequest) {
    try {
        // Get chat configuration to check if enabled
        const config = await getChatConfig()

        if (!config.isEnabled) {
            return NextResponse.json(
                { success: false, error: 'Chat is currently disabled' },
                { status: 503 }
            )
        }

        // Parse request body (all fields optional)
        const body = (await request.json()) as AnonymousSessionRequest

        // Extract metadata
        const clientIP = getClientIP(request)
        const userAgent = request.headers.get('user-agent') ?? undefined

        // Create anonymous session in database
        const session = await createAnonymousChatSession({
            pageUrl: body.pageUrl,
            referrer: body.referrer,
            ipAddress: clientIP,
            userAgent,
            utmSource: body.utmSource,
            utmMedium: body.utmMedium,
            utmCampaign: body.utmCampaign,
            // Store lead context for thank-you page sessions
            leadContext: body.leadContext,
        })

        // Return session info with config
        return NextResponse.json({
            success: true,
            session: {
                id: session.id,
                isAnonymous: true,
            },
            config: {
                agentName: config.agentName,
                welcomeMessage: config.welcomeMessage,
                primaryColor: config.primaryColor,
                agentImageUrl: config.agentImageUrl,
            },
        })
    } catch (error) {
        console.error('Anonymous session creation error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create session' },
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
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
