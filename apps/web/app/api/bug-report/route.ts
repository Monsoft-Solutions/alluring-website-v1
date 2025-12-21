/**
 * Bug Report API Handler
 *
 * Handles quick bug report form submissions.
 * Validates data, stores in database, and sends email notification.
 * Supports optional screenshot upload via multipart/form-data.
 *
 * @module app/api/bug-report/route
 */
import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { db } from '@workspace/db/client'
import { bugReport, type InsertBugReport } from '@workspace/db/schema/feedback'

import { env } from '@/env'
import { siteConfig } from '@/lib/data/site-config'
import { sendBugReportNotification } from '@/lib/services/email.service'
import {
    type BugReportFormData,
    bugReportFormSchema,
    type BugReportResponse,
} from '@/lib/types/forms/bug-report.type'

/**
 * Allowed image types for bug report screenshots
 */
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
]
const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

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
function formatForLog(
    data: BugReportFormData,
    hasScreenshot: boolean
): Record<string, unknown> {
    return {
        pageUrl: data.pageUrl,
        severity: data.severity,
        deviceType: data.deviceType,
        browserType: data.browserType,
        hasDescription: Boolean(data.description),
        hasSteps: Boolean(data.stepsToReproduce),
        hasScreenshot,
        reporterProvided: Boolean(data.reporterEmail || data.reporterName),
        // Environment metadata
        viewport: data.viewportWidth
            ? `${data.viewportWidth}x${data.viewportHeight}`
            : data.screenSize,
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
 * Upload screenshot to Vercel Blob storage
 * @param file - The file to upload
 * @param bugId - The bug report ID (used for filename)
 * @returns The URL of the uploaded image, or null if upload is skipped
 */
async function uploadScreenshotToBlob(
    file: File,
    bugId: string
): Promise<string | null> {
    // Check if Blob token is configured
    const blobToken = env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
        console.warn(
            'BLOB_READ_WRITE_TOKEN not configured, skipping screenshot upload'
        )
        return null
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error(
            `Invalid file type: ${file.type}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`
        )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(
            `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: ${MAX_FILE_SIZE_MB}MB`
        )
    }

    // Get file extension from mime type
    const extension = file.type.split('/')[1] || 'png'
    const filename = `bug-screenshots/${bugId}.${extension}`

    // Upload to Vercel Blob
    const uploadedBlob = await put(filename, file, {
        access: 'public',
        contentType: file.type,
        token: blobToken,
    })

    return uploadedBlob.url
}

/**
 * POST handler for bug report submissions
 * Supports both JSON and multipart/form-data (for screenshot upload)
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<BugReportResponse>> {
    try {
        const contentType = request.headers.get('content-type') || ''

        let body: unknown
        let screenshotFile: File | null = null

        // Handle multipart/form-data (with optional screenshot)
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData()
            const dataField = formData.get('data')
            const screenshotField = formData.get('screenshot')

            if (!dataField || typeof dataField !== 'string') {
                return NextResponse.json<BugReportResponse>(
                    {
                        success: false,
                        message: 'Missing form data',
                        error: 'The "data" field is required',
                    },
                    { status: 400 }
                )
            }

            try {
                body = JSON.parse(dataField)
            } catch {
                return NextResponse.json<BugReportResponse>(
                    {
                        success: false,
                        message: 'Invalid JSON in data field',
                        error: 'The "data" field must contain valid JSON',
                    },
                    { status: 400 }
                )
            }

            // Extract screenshot file if present
            if (screenshotField && screenshotField instanceof File) {
                screenshotFile = screenshotField
            }
        }
        // Handle JSON (backwards compatibility)
        else if (contentType.includes('application/json')) {
            body = (await request.json()) as unknown
        }
        // Invalid content type
        else {
            return NextResponse.json<BugReportResponse>(
                {
                    success: false,
                    message: 'Invalid content type',
                    error: 'Content-Type must be application/json or multipart/form-data',
                },
                { status: 400 }
            )
        }

        // Validate against schema
        const validatedData = bugReportFormSchema.parse(body)

        // Extract client IP
        const clientIP = getClientIP(request)

        // Generate a temporary ID for the screenshot filename
        const tempId = crypto.randomUUID()

        // Upload screenshot if present
        let screenshotUrl: string | null = null
        if (screenshotFile) {
            try {
                screenshotUrl = await uploadScreenshotToBlob(
                    screenshotFile,
                    tempId
                )
            } catch (uploadError) {
                console.error('Screenshot upload failed:', uploadError)
                // Continue without screenshot rather than failing the entire report
            }
        }

        // Prepare data for insertion
        const insertData: InsertBugReport = {
            pageUrl: validatedData.pageUrl,
            description: validatedData.description,
            stepsToReproduce: validatedData.stepsToReproduce,
            expectedBehavior: validatedData.expectedBehavior,
            actualBehavior: validatedData.actualBehavior,
            screenshotUrl,
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
            .insert(bugReport)
            .values(insertData)
            .returning()

        if (!submission) {
            throw new Error('Failed to create bug report')
        }

        console.log(
            'Bug report received:',
            formatForLog(validatedData, Boolean(screenshotUrl))
        )

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
export function OPTIONS(request: NextRequest): NextResponse {
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
