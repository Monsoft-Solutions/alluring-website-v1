/**
 * Beta Feedback API Handler
 *
 * Handles multi-step beta feedback form submissions.
 * Validates data, stores in database, and sends email notification.
 *
 * @module app/api/feedback/route
 */
import { type NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { db } from '@workspace/db/client'
import {
    betaFeedback,
    type InsertBetaFeedback,
} from '@workspace/db/schema/feedback'

import { sendFeedbackNotification } from '@/lib/services/email.service'
import {
    type BetaFeedbackFormData,
    betaFeedbackFormSchema,
    type BetaFeedbackResponse,
} from '@/lib/types/forms/beta-feedback.type'

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
 * Format feedback data for logging (redacted)
 */
function formatForLog(data: BetaFeedbackFormData): Record<string, unknown> {
    return {
        deviceType: data.deviceType,
        browserType: data.browserType,
        overallDesignRating: data.overallDesignRating,
        visualAestheticsRating: data.visualAestheticsRating,
        navigationEase: data.navigationEase,
        hasBrokenLinks: data.hasBrokenLinks,
        wordingClarityRating: data.wordingClarityRating,
        hasTypos: data.hasTypos,
        hasTechnicalIssues: data.hasTechnicalIssues,
        overallSatisfactionRating: data.overallSatisfactionRating,
        wantsUxTesting: data.wantsUxTesting,
        email: data.email ? '[PROVIDED]' : 'Not provided',
        // Environment metadata
        viewport: data.viewportWidth
            ? `${data.viewportWidth}x${data.viewportHeight}`
            : undefined,
        screen: data.screenWidth
            ? `${data.screenWidth}x${data.screenHeight}`
            : undefined,
        devicePixelRatio: data.devicePixelRatio,
        timezone: data.timezone,
        language: data.language,
        connectionType: data.connectionType,
    }
}

/**
 * POST handler for beta feedback submissions
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<BetaFeedbackResponse>> {
    try {
        // Validate Content-Type header
        const contentType = request.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
            return NextResponse.json<BetaFeedbackResponse>(
                {
                    success: false,
                    message: 'Invalid content type. Expected application/json.',
                    error: 'Content-Type must be application/json',
                },
                { status: 400 }
            )
        }

        // Parse request body
        const body = (await request.json()) as unknown

        // Validate against schema
        const validatedData = betaFeedbackFormSchema.parse(body)

        // Extract client IP
        const clientIP = getClientIP(request)

        // Prepare data for insertion
        const insertData: InsertBetaFeedback = {
            deviceType: validatedData.deviceType,
            deviceTypeOther: validatedData.deviceTypeOther,
            browserType: validatedData.browserType,
            browserTypeOther: validatedData.browserTypeOther,
            overallDesignRating: validatedData.overallDesignRating,
            visualAestheticsRating: validatedData.visualAestheticsRating,
            designLikes: validatedData.designLikes,
            designDislikes: validatedData.designDislikes,
            navigationEase: validatedData.navigationEase,
            hasBrokenLinks: validatedData.hasBrokenLinks,
            brokenLinksDescription: validatedData.brokenLinksDescription,
            wordingClarityRating: validatedData.wordingClarityRating,
            hasTypos: validatedData.hasTypos,
            typosDescription: validatedData.typosDescription,
            hasTechnicalIssues: validatedData.hasTechnicalIssues,
            technicalIssuesDescription:
                validatedData.technicalIssuesDescription,
            overallSatisfactionRating: validatedData.overallSatisfactionRating,
            recommendations: validatedData.recommendations,
            wantsUxTesting: validatedData.wantsUxTesting,
            email: validatedData.email,
            userAgent: validatedData.userAgent,
            pageUrl: validatedData.pageUrl,
            ipAddress: clientIP,
            // Screen & viewport dimensions
            screenWidth: validatedData.screenWidth,
            screenHeight: validatedData.screenHeight,
            viewportWidth: validatedData.viewportWidth,
            viewportHeight: validatedData.viewportHeight,
            devicePixelRatio: validatedData.devicePixelRatio,
            // Environment metadata
            timezone: validatedData.timezone,
            language: validatedData.language,
            referrer: validatedData.referrer,
            connectionType: validatedData.connectionType,
        }

        // Insert into database
        const [submission] = await db
            .insert(betaFeedback)
            .values(insertData)
            .returning()

        if (!submission) {
            throw new Error('Failed to create feedback submission')
        }

        console.log('Beta feedback received:', formatForLog(validatedData))

        // Send email notification
        try {
            await sendFeedbackNotification(validatedData, submission.id)
        } catch (emailError) {
            console.error('Failed to send feedback notification:', emailError)
            // Don't fail the request if email fails
        }

        return NextResponse.json<BetaFeedbackResponse>(
            {
                success: true,
                message:
                    'Thank you for your feedback! Your input helps us improve.',
            },
            { status: 200 }
        )
    } catch (error) {
        // Handle Zod validation errors
        if (error instanceof ZodError) {
            const firstError = error.issues[0]
            const errorMessage = firstError
                ? `${firstError.path.join('.')}: ${firstError.message}`
                : 'Validation failed'

            console.error('Feedback validation error:', {
                errors: error.issues,
                timestamp: new Date().toISOString(),
            })

            return NextResponse.json<BetaFeedbackResponse>(
                {
                    success: false,
                    message: 'Validation failed',
                    error: errorMessage,
                },
                { status: 400 }
            )
        }

        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
            console.error('JSON parsing error:', error.message)

            return NextResponse.json<BetaFeedbackResponse>(
                {
                    success: false,
                    message: 'Invalid JSON format',
                    error: 'Request body must be valid JSON',
                },
                { status: 400 }
            )
        }

        // Handle unexpected errors
        console.error('Feedback submission error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
        })

        return NextResponse.json<BetaFeedbackResponse>(
            {
                success: false,
                message: 'Something went wrong. Please try again later.',
                error:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error',
            },
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
