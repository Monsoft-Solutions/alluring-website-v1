/**
 * Contact Form API Handler
 *
 * Handles POST requests for contact form submissions with server-side validation.
 * Currently logs submissions to console; email integration to be added.
 *
 * @module app/api/contact/route
 */
import { type NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { db } from '@workspace/db/client'
import {
    contactSubmission,
    type InsertContactSubmission,
} from '@workspace/db/schema/contact'

import {
    type ContactFormData,
    type ContactFormResponse,
    contactFormSchema,
} from '@/lib/types/forms/contact-form.type'
import { sendContactEmails } from '@/lib/services/email.service'

/**
 * Redacts sensitive fields from contact form data for safe logging
 *
 * @param data - Contact form data to redact
 * @returns Redacted data with sensitive fields masked
 */
function redactPII(data: ContactFormData): Record<string, unknown> {
    return {
        name: '[REDACTED]',
        email: '[REDACTED]',
        phone: data.phone ? '[REDACTED]' : 'Not provided',
        subject: data.subject,
        message: '[REDACTED]',
    }
}

/**
 * Formats contact form data for console logging
 *
 * @param data - Validated contact form data
 * @param redact - Whether to redact sensitive fields
 * @returns Formatted string for console output
 */
function formatConsoleLog(
    data: ContactFormData | Record<string, unknown>,
    redact: boolean = false
): string {
    const displayData = redact ? redactPII(data as ContactFormData) : data

    return `
=== New Contact Form Submission ===
Name: ${displayData.name}
Email: ${displayData.email}
Phone: ${displayData.phone || 'Not provided'}
Subject: ${displayData.subject}
Message: ${displayData.message}
Submitted at: ${new Date().toISOString()}
===================================
    `.trim()
}

/**
 * POST handler for contact form submissions
 *
 * Validates incoming form data, logs submission details, and prepares for email integration.
 * Implements comprehensive error handling for validation and server errors.
 *
 * Security considerations:
 * - Zod schema validation sanitizes and validates all inputs
 * - Content-Type validation ensures JSON payloads only
 * - TODO: Add rate limiting to prevent spam (consider upstash/ratelimit or similar)
 * - TODO: Add CSRF protection for production
 * - TODO: Consider adding honeypot field for bot detection
 *
 * @param request - Next.js request object
 * @returns JSON response with success status and message
 *
 * @example
 * ```ts
 * // Success response
 * { success: true, message: "Thank you for contacting us! We'll get back to you soon." }
 *
 * // Validation error response
 * { success: false, message: "Validation failed", error: "Email is invalid" }
 *
 * // Server error response
 * { success: false, message: "Something went wrong. Please try again later.", error: "Error details" }
 * ```
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<ContactFormResponse>> {
    try {
        // Validate Content-Type header
        const contentType = request.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
            return NextResponse.json<ContactFormResponse>(
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

        // Validate request body against schema
        // Zod automatically sanitizes and validates the data
        const validatedData = contactFormSchema.parse(body)

        const insertData: InsertContactSubmission = {
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            subject: validatedData.subject,
            message: validatedData.message,
        }

        // Persist submission
        const [submission] = await db
            .insert(contactSubmission)
            .values(insertData)
            .returning()

        if (!submission) {
            throw new Error('Failed to create contact submission')
        }

        console.log(formatConsoleLog(validatedData, true))

        // Send emails (notification to owner and confirmation to submitter)
        const emailResult = await sendContactEmails(
            validatedData,
            submission.id
        )

        // Log email results (don't fail the request if emails fail)
        if (emailResult.errors.length > 0) {
            console.error('Email sending errors:', emailResult.errors)
        }

        // Determine success message based on email results
        let message = "Thank you for contacting us! We'll get back to you soon."
        if (emailResult.confirmationSent) {
            message =
                "Thank you for contacting us! We've sent you a confirmation email and will get back to you soon."
        }

        // Return success response (even if emails failed)
        return NextResponse.json<ContactFormResponse>(
            {
                success: true,
                message,
            },
            { status: 200 }
        )
    } catch (error) {
        // Handle Zod validation errors
        if (error instanceof ZodError) {
            // Extract first error message for user-friendly response
            const firstError = error.issues[0]
            const errorMessage = firstError
                ? `${firstError.path.join('.')}: ${firstError.message}`
                : 'Validation failed'

            console.error('Validation error:', {
                errors: error.issues,
                timestamp: new Date().toISOString(),
            })

            return NextResponse.json<ContactFormResponse>(
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

            return NextResponse.json<ContactFormResponse>(
                {
                    success: false,
                    message: 'Invalid JSON format',
                    error: 'Request body must be valid JSON',
                },
                { status: 400 }
            )
        }

        // Handle unexpected server errors
        console.error('Server error in contact form handler:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
        })

        return NextResponse.json<ContactFormResponse>(
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
 *
 * @returns Response with CORS headers
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
