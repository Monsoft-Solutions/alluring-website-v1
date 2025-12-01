/**
 * Bug Report API Handler
 *
 * Handles quick bug report form submissions.
 * Validates data, stores in database, and sends email notification.
 *
 * @module app/api/bug-report/route
 */
import { type NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { db } from '@workspace/db/client'
import { bugReport, type InsertBugReport } from '@workspace/db/schema/feedback'

import { siteConfig } from '@/lib/data/site-config'
import { sendBugReportNotification } from '@/lib/services/email.service'
import {
    type BugReportFormData,
    bugReportFormSchema,
    type BugReportResponse,
} from '@/lib/types/forms/bug-report.type'

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
 * Format bug report data for logging (redacted)
 */
function formatForLog(data: BugReportFormData): Record<string, unknown> {
    return {
        pageUrl: data.pageUrl,
        severity: data.severity,
        deviceType: data.deviceType,
        browserType: data.browserType,
        hasDescription: Boolean(data.description),
        hasSteps: Boolean(data.stepsToReproduce),
        reporterProvided: Boolean(data.reporterEmail || data.reporterName),
    }
}

/**
 * POST handler for bug report submissions
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<BugReportResponse>> {
    try {
        // Validate Content-Type header
        const contentType = request.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
            return NextResponse.json<BugReportResponse>(
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
        const validatedData = bugReportFormSchema.parse(body)

        // Extract client IP
        const clientIP = getClientIP(request)

        // Prepare data for insertion
        const insertData: InsertBugReport = {
            pageUrl: validatedData.pageUrl,
            description: validatedData.description,
            stepsToReproduce: validatedData.stepsToReproduce,
            expectedBehavior: validatedData.expectedBehavior,
            actualBehavior: validatedData.actualBehavior,
            severity: validatedData.severity,
            deviceType: validatedData.deviceType,
            browserType: validatedData.browserType,
            browserVersion: validatedData.browserVersion,
            screenSize: validatedData.screenSize,
            reporterEmail: validatedData.reporterEmail,
            reporterName: validatedData.reporterName,
            userAgent: validatedData.userAgent,
            ipAddress: clientIP,
            status: 'new',
        }

        // Insert into database
        const [submission] = await db
            .insert(bugReport)
            .values(insertData)
            .returning()

        if (!submission) {
            throw new Error('Failed to create bug report')
        }

        console.log('Bug report received:', formatForLog(validatedData))

        // Send email notification
        try {
            await sendBugReportNotification(validatedData, submission.id)
        } catch (emailError) {
            console.error('Failed to send bug report notification:', emailError)
            // Don't fail the request if email fails
        }

        return NextResponse.json<BugReportResponse>(
            {
                success: true,
                message:
                    'Bug report submitted! Thank you for helping us improve.',
                bugId: submission.id,
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

            console.error('Bug report validation error:', {
                errors: error.issues,
                timestamp: new Date().toISOString(),
            })

            return NextResponse.json<BugReportResponse>(
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

            return NextResponse.json<BugReportResponse>(
                {
                    success: false,
                    message: 'Invalid JSON format',
                    error: 'Request body must be valid JSON',
                },
                { status: 400 }
            )
        }

        // Handle unexpected errors
        console.error('Bug report submission error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
        })

        return NextResponse.json<BugReportResponse>(
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
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
    // Get the origin from the request header
    const requestOrigin = request.headers.get('origin')

    // Use site URL from config as the allowed origin
    const allowedOrigin = siteConfig.seo.siteUrl

    // Echo the request origin if it matches the site URL, otherwise use the configured site URL
    // This allows cross-origin requests from the same site and provides a safe fallback
    const origin =
        requestOrigin && requestOrigin === allowedOrigin
            ? requestOrigin
            : allowedOrigin

    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
