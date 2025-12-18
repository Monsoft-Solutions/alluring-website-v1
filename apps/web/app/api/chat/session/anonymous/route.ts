/**
 * Anonymous Chat Session API Route
 *
 * Creates a chat session without requiring pre-chat form data.
 * Used for embedded chat sections where users can start chatting immediately.
 *
 * When a contactSubmissionId is provided (thank-you page flow), the session
 * is linked to the contact submission via foreign key, enabling full contact
 * data access for AI personalization.
 *
 * @module app/api/chat/session/anonymous/route
 */
import { type NextRequest, NextResponse } from 'next/server'

import {
    getChatConfig,
    createAnonymousChatSession,
} from '@/lib/queries/chat.query'
import { getContactSubmissionById } from '@/lib/queries/contact.query'

/**
 * Request body for anonymous session creation
 */
type AnonymousSessionRequest = {
    pageUrl?: string
    referrer?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    /** Contact submission ID from form submission (thank-you page) */
    contactSubmissionId?: string
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
 *
 * If contactSubmissionId is provided, the session is linked to the
 * contact submission and scoring signals are populated from contact data.
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

        // If contactSubmissionId provided, fetch contact data for context
        let scoringSignals:
            | {
                  leadFirstName?: string
                  fromFormSubmission?: boolean
                  leadProcedure?: string
              }
            | undefined
        let detectedProcedures: string[] | undefined

        if (body.contactSubmissionId) {
            try {
                const contactData = await getContactSubmissionById(
                    body.contactSubmissionId
                )

                if (contactData) {
                    // Build scoring signals from contact data
                    scoringSignals = {
                        leadFirstName:
                            contactData.firstName ||
                            contactData.name.split(' ')[0],
                        fromFormSubmission: true,
                        leadProcedure: contactData.procedure ?? undefined,
                    }

                    // Store procedure as detected procedure for AI context
                    if (contactData.procedure) {
                        detectedProcedures = [contactData.procedure]
                    }

                    console.log(
                        `[AnonymousSession] Linked to contact submission ${body.contactSubmissionId}`,
                        {
                            firstName: scoringSignals.leadFirstName,
                            procedure: contactData.procedure,
                        }
                    )
                } else {
                    console.warn(
                        `[AnonymousSession] Contact submission ${body.contactSubmissionId} not found`
                    )
                }
            } catch (error) {
                console.error(
                    '[AnonymousSession] Failed to fetch contact submission:',
                    error
                )
            }
        }

        // Create anonymous session in database
        const session = await createAnonymousChatSession({
            pageUrl: body.pageUrl,
            referrer: body.referrer,
            ipAddress: clientIP,
            userAgent,
            utmSource: body.utmSource,
            utmMedium: body.utmMedium,
            utmCampaign: body.utmCampaign,
            // Store scoring signals and detected procedures from contact data
            scoringSignals,
            detectedProcedures,
            // Store foreign key reference to contact submission
            contactSubmissionId: body.contactSubmissionId,
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
