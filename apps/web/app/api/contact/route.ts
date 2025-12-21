/**
 * Contact Form API Handler
 *
 * Unified handler for all contact form submissions with server-side validation.
 * Supports multiple form types via 'source' field:
 * - contact-page: Full contact form (email required)
 * - contact-hero: Hero section form (email required)
 * - blog-lead: Minimal lead capture (phone required, no email)
 * - exit-intent: Exit intent popup (phone required)
 * - lead-form: Home page lead form (phone required)
 * - footer: Footer contact form (email or phone required)
 * - general: Default behavior (email or phone required)
 *
 * Also captures UTM parameters and ad platform click IDs for attribution tracking.
 *
 * @module app/api/contact/route
 */
import { type NextRequest, NextResponse, after } from 'next/server'
import { ZodError } from 'zod'

import { db } from '@workspace/db/client'
import {
    contactSubmission,
    type InsertContactSubmission,
} from '@workspace/db/schema/contact'

import {
    CONTACT_SOURCES,
    type ContactFormData,
    type ContactFormResponse,
    contactFormSchema,
} from '@/lib/types/forms/contact-form.type'
import {
    sendContactEmails,
    sendContactNotification,
} from '@/lib/services/email.service'
import { syncLeadToCRM } from '@/lib/services/crm.service'

/**
 * Extract client IP address from request headers
 * Handles various proxy configurations (Vercel, Cloudflare, nginx, etc.)
 */
function getClientIP(request: NextRequest): string | undefined {
    // Vercel / common proxy headers
    const xForwardedFor = request.headers.get('x-forwarded-for')
    if (xForwardedFor) {
        // x-forwarded-for may contain multiple IPs; first is the client
        const firstIP = xForwardedFor.split(',')[0]?.trim()
        if (firstIP) return firstIP
    }

    // Cloudflare
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    if (cfConnectingIP) return cfConnectingIP

    // Standard proxy header
    const xRealIP = request.headers.get('x-real-ip')
    if (xRealIP) return xRealIP

    return undefined
}

/**
 * Redacts sensitive fields from contact form data for safe logging
 */
function redactPII(data: ContactFormData): Record<string, unknown> {
    return {
        name: '[REDACTED]',
        firstName: data.firstName ? '[REDACTED]' : 'Not provided',
        lastName: data.lastName ? '[REDACTED]' : 'Not provided',
        email: data.email ? '[REDACTED]' : 'Not provided',
        phone: data.phone ? '[REDACTED]' : 'Not provided',
        subject: data.subject || 'Not provided',
        message: data.message ? '[REDACTED]' : 'Not provided',
        procedure: data.procedure || 'Not specified',
        preferredContactTime: data.preferredContactTime || 'Not specified',
        consentGiven: data.consentGiven ?? false,
        source: data.source || 'Not specified',
    }
}

/**
 * Formats contact form data for console logging
 */
function formatConsoleLog(
    data: ContactFormData | Record<string, unknown>,
    redact: boolean = false
): string {
    const displayData = redact ? redactPII(data as ContactFormData) : data

    // Helper to safely convert values to strings
    const toString = (value: unknown): string => {
        if (value === null || value === undefined) return 'Not provided'
        if (typeof value === 'string') return value
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        if (typeof value === 'number') return String(value)
        if (typeof value === 'object') return '[Object]'
        // Handle remaining primitive types (symbol, bigint, function)
        if (typeof value === 'symbol') return value.toString()
        if (typeof value === 'bigint') return String(value)
        if (typeof value === 'function') return '[Function]'
        // Fallback for any other types
        return '[Unknown]'
    }

    return `
=== New Contact Form Submission ===
Name: ${toString(displayData.name)}
First Name: ${toString(displayData.firstName) || 'Not provided'}
Last Name: ${toString(displayData.lastName) || 'Not provided'}
Email: ${toString(displayData.email) || 'Not provided'}
Phone: ${toString(displayData.phone) || 'Not provided'}
Subject: ${toString(displayData.subject) || 'Not provided'}
Message: ${toString(displayData.message) || 'Not provided'}
Procedure: ${toString(displayData.procedure) || 'Not specified'}
Preferred Contact Time: ${toString(displayData.preferredContactTime) || 'Not specified'}
Consent Given: ${toString(displayData.consentGiven) || 'Not specified'}
Source: ${toString(displayData.source) || 'Not specified'}
Submitted at: ${new Date().toISOString()}
===================================
    `.trim()
}

/**
 * Validates data based on the form source
 * Different forms have different required fields
 */
function validateBySource(data: ContactFormData): {
    valid: boolean
    error?: string
} {
    const source = data.source || CONTACT_SOURCES.GENERAL

    switch (source) {
        case CONTACT_SOURCES.CONTACT_PAGE:
        case CONTACT_SOURCES.CONTACT_HERO:
            // Contact page and hero forms require email
            if (!data.email) {
                return { valid: false, error: 'Email is required' }
            }
            break

        case CONTACT_SOURCES.BLOG_LEAD:
        case CONTACT_SOURCES.EXIT_INTENT:
        case CONTACT_SOURCES.LEAD_FORM:
            // Lead capture forms require phone
            if (!data.phone) {
                return { valid: false, error: 'Phone number is required' }
            }
            break

        case CONTACT_SOURCES.FOOTER:
        case CONTACT_SOURCES.GENERAL:
        default:
            // General form: at least email or phone must be provided
            if (!data.email && !data.phone) {
                return {
                    valid: false,
                    error: 'Please provide either an email or phone number',
                }
            }
            break
    }

    return { valid: true }
}

/**
 * Get appropriate success message based on source
 */
function getSuccessMessage(
    source?: string,
    hasUserProvidedEmail?: boolean
): string {
    switch (source) {
        case CONTACT_SOURCES.BLOG_LEAD:
        case CONTACT_SOURCES.EXIT_INTENT:
        case CONTACT_SOURCES.LEAD_FORM:
            return "Thank you! We'll call you within 24 hours."

        case CONTACT_SOURCES.CONTACT_PAGE:
        case CONTACT_SOURCES.CONTACT_HERO:
            return hasUserProvidedEmail
                ? "Thank you for contacting us! We've sent you a confirmation email and will get back to you soon."
                : "Thank you for contacting us! We'll get back to you soon."

        default:
            return "Thank you for contacting us! We'll get back to you soon."
    }
}

/**
 * Process lead in background (post-response)
 *
 * Handles CRM sync and email sending after the HTTP response is sent.
 * Both operations run asynchronously without blocking the user's response.
 *
 * @param insertData - Contact submission data from database
 * @param validatedData - Validated form data
 * @param submissionId - Database ID of the contact submission
 * @param hasUserProvidedEmail - Whether user provided a real email address
 * @param source - Form source identifier
 * @param fullName - User's full name
 */
async function processLeadInBackground(
    insertData: InsertContactSubmission,
    validatedData: ContactFormData,
    submissionId: string,
    hasUserProvidedEmail: boolean,
    source: string,
    fullName: string
): Promise<void> {
    // Sync to CRM
    try {
        await syncLeadToCRM(insertData)
    } catch (crmError) {
        console.error('CRM sync failed:', crmError)
    }

    // Send emails based on whether user provided a real email
    if (hasUserProvidedEmail) {
        // User provided email - send both notification and confirmation
        try {
            const emailResult = await sendContactEmails(
                validatedData,
                submissionId
            )

            if (emailResult.errors.length > 0) {
                console.error('Email sending errors:', emailResult.errors)
            }
        } catch (emailError) {
            console.error('Failed to send contact emails:', emailError)
        }
    } else {
        // No email provided - send notification only (lead capture style)
        try {
            const sourceLabel =
                source === CONTACT_SOURCES.BLOG_LEAD
                    ? 'Blog'
                    : source === CONTACT_SOURCES.EXIT_INTENT
                      ? 'Exit Intent Popup'
                      : 'Lead Form'

            await sendContactNotification(
                {
                    name: fullName,
                    email: '',
                    phone: validatedData.phone,
                    subject: `${sourceLabel} Lead: ${fullName} - Callback Requested`,
                    message: `New lead from ${sourceLabel.toLowerCase()}:\n\nName: ${fullName}\nPhone: ${validatedData.phone}\nSource: ${source}\n\nThis lead requested a callback.`,
                },
                submissionId
            )
        } catch (emailError) {
            console.error('Failed to send lead notification email:', emailError)
        }
    }
}

/**
 * POST handler for contact form submissions
 *
 * Unified handler that supports multiple form types:
 * - contact-page: Full contact form with email required
 * - contact-hero: Hero section form with email required
 * - blog-lead: Minimal lead capture with phone required
 * - exit-intent: Exit intent popup with phone required
 * - lead-form: Home page lead form with phone required
 * - footer/general: Flexible - email or phone required
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
        const validatedData = contactFormSchema.parse(body)

        // Apply source-specific validation
        const sourceValidation = validateBySource(validatedData)
        if (!sourceValidation.valid) {
            return NextResponse.json<ContactFormResponse>(
                {
                    success: false,
                    message: 'Validation failed',
                    error: sourceValidation.error,
                },
                { status: 400 }
            )
        }

        // Prepare data for insertion
        const source = validatedData.source || CONTACT_SOURCES.GENERAL

        // Check if user provided a real email (source of truth for email sending)
        const hasUserProvidedEmail = Boolean(validatedData.email)

        // Sources that typically don't collect email (used for placeholder generation)
        const SOURCES_WITHOUT_EMAIL_FIELD = [
            CONTACT_SOURCES.BLOG_LEAD,
            CONTACT_SOURCES.EXIT_INTENT,
            CONTACT_SOURCES.LEAD_FORM,
        ] as const
        const isLeadCaptureSource = SOURCES_WITHOUT_EMAIL_FIELD.includes(
            source as (typeof SOURCES_WITHOUT_EMAIL_FIELD)[number]
        )

        // Email is required in DB - use placeholder for forms without email
        const email =
            validatedData.email ||
            (isLeadCaptureSource
                ? `lead-${Date.now()}@${source}.capture`
                : `contact-${Date.now()}@form.capture`)

        // Generate default subject based on source
        const getDefaultSubject = (): string => {
            switch (source) {
                case CONTACT_SOURCES.BLOG_LEAD:
                    return 'Blog Lead Capture'
                case CONTACT_SOURCES.EXIT_INTENT:
                    return 'Exit Intent Lead'
                case CONTACT_SOURCES.LEAD_FORM:
                    return 'Lead Form Request'
                case CONTACT_SOURCES.CONTACT_HERO:
                    return 'Consultation Request'
                default:
                    return 'Contact Form'
            }
        }

        // Compute full name from firstName + lastName if available
        const fullName =
            validatedData.firstName && validatedData.lastName
                ? `${validatedData.firstName} ${validatedData.lastName}`.trim()
                : validatedData.name

        // Extract client IP for analytics
        const clientIP = getClientIP(request)

        const insertData: InsertContactSubmission = {
            name: fullName,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email,
            phone: validatedData.phone,
            subject: validatedData.subject || getDefaultSubject(),
            message:
                validatedData.message ||
                (isLeadCaptureSource
                    ? `Lead capture from: ${source}. Callback requested.`
                    : 'Contact form submission'),
            procedure: validatedData.procedure,
            preferredContactTime: validatedData.preferredContactTime,
            consentGiven: validatedData.consentGiven,
            source,
            // Analytics tracking fields
            ipAddress: clientIP,
            utmSource: validatedData.utmSource,
            utmMedium: validatedData.utmMedium,
            utmCampaign: validatedData.utmCampaign,
            utmContent: validatedData.utmContent,
            utmTerm: validatedData.utmTerm,
            gclid: validatedData.gclid,
            fbclid: validatedData.fbclid,
            ttclid: validatedData.ttclid,
            referrer: validatedData.referrer,
            landingPage: validatedData.landingPage,
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

        // Process lead in background: CRM sync + email sending (post-response)
        after(async () => {
            await processLeadInBackground(
                insertData,
                validatedData,
                submission.id,
                hasUserProvidedEmail,
                source,
                fullName
            )
        })

        // Return success response with source-appropriate message
        const message = getSuccessMessage(source, hasUserProvidedEmail)

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
export function OPTIONS(): NextResponse {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
