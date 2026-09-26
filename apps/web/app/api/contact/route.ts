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
 * - home-page: Home page consultation thread (phone required)
 * - footer: Footer contact form (email or phone required)
 * - general: Default behavior (email or phone required)
 *
 * Also captures UTM parameters and ad platform click IDs for attribution tracking.
 *
 * PATCH adds the thank-you page's optional answers to a lead it just created
 * (#274), authorised by the token the POST returned.
 *
 * @module app/api/contact/route
 */
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse, after } from 'next/server'
import { ZodError } from 'zod'

import { db } from '@workspace/db/client'
import { parseLandingUrl } from '@workspace/shared/attribution'
import {
    type ContactSubmission,
    contactSubmission,
    type InsertContactSubmission,
} from '@workspace/db/schema/contact'

import { placeholderEmail } from '@/lib/constants/lead-fields'
import {
    CONTACT_SOURCES,
    type ContactFormData,
    type ContactFormResponse,
    contactFormSchema,
    leadUpdateSchema,
} from '@/lib/types/forms/contact-form.type'
import {
    sendContactEmails,
    sendContactNotification,
} from '@/lib/services/email.service'
import {
    createLeadUpdateToken,
    verifyLeadUpdateToken,
} from '@/lib/services/lead-update-token.service'
import {
    sendLeadToN8N,
    sendLeadUpdateToN8N,
} from '@/lib/services/n8n-webhook.service'
import { stripPlaceholders } from '@/lib/analytics/attribution-params.util'
import { sanitizeAdClickIds } from '@/lib/analytics/sanitize-attribution.util'
import { siteConfig } from '@/lib/data/site-config'
import { env } from '@/env'

/** Minimum time (ms) a real user would take to fill out a form */
const MIN_FORM_FILL_TIME_MS = 3000

/**
 * Validates that the request Origin or Referer header matches the site URL.
 * Allows localhost in development.
 */
function isValidOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const siteUrl = siteConfig.seo.siteUrl

    // Allow localhost in development
    const isDev = env.NODE_ENV === 'development'
    if (isDev) {
        const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/
        if (
            (origin && localhostPattern.test(origin)) ||
            (referer && localhostPattern.test(referer))
        ) {
            return true
        }
    }

    // Check Origin header
    if (origin) {
        try {
            const originHost = new URL(origin).host
            const siteHost = new URL(siteUrl).host
            if (originHost === siteHost) return true
        } catch {
            // Invalid URL, fall through
        }
    }

    // Check Referer header
    if (referer) {
        try {
            const refererHost = new URL(referer).host
            const siteHost = new URL(siteUrl).host
            if (refererHost === siteHost) return true
        } catch {
            // Invalid URL, fall through
        }
    }

    return false
}

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
        case CONTACT_SOURCES.CONTACT_HERO:
            // The home and Atelier hero forms still ask for email
            if (!data.email) {
                return { valid: false, error: 'Email is required' }
            }
            break

        // The contact, specials and home pages use the chat thread (#274),
        // which asks for a mobile number only; email is optional afterwards.
        case CONTACT_SOURCES.CONTACT_PAGE:
        case CONTACT_SOURCES.SPECIALS_PAGE:
        case CONTACT_SOURCES.HOME_PAGE:
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
 * Lines staff need that the form's own note cannot know: the sanitized
 * campaign and the lead id the CRM carries.
 */
function staffContextLines(lead: ContactSubmission): string[] {
    const campaign = [lead.utmSource, lead.utmMedium, lead.utmCampaign]
        .filter(Boolean)
        .join(' / ')
    const lines: string[] = []
    if (campaign) lines.push(`Campaign: ${campaign}`)
    else if (lead.referrer) lines.push(`Referrer: ${lead.referrer}`)
    if (lead.formVariant) {
        lines.push(
            `Form: ${lead.formVariant}${lead.pageVariant ? ` (${lead.pageVariant})` : ''}`
        )
    }
    if (lead.consentMethod === 'tap') {
        lines.push(
            `Consent: tapped the send button${lead.consentVersion ? ` (wording ${lead.consentVersion})` : ''}`
        )
    }
    lines.push(`Lead ID: ${lead.id}`)
    return lines
}

/**
 * Process lead in background (post-response)
 *
 * Handles CRM sync and email sending after the HTTP response is sent.
 * Both operations run asynchronously without blocking the user's response.
 *
 * @param lead - The saved contact submission
 * @param validatedData - Validated form data
 * @param hasUserProvidedEmail - Whether user provided a real email address
 * @param source - Form source identifier
 * @param fullName - User's full name
 */
async function processLeadInBackground(
    lead: ContactSubmission,
    validatedData: ContactFormData,
    hasUserProvidedEmail: boolean,
    source: string,
    fullName: string
): Promise<void> {
    const submissionId = lead.id

    // 1. Send to N8N FIRST (before email)
    let sentToCrm = false
    try {
        const n8nResult = await sendLeadToN8N(lead)
        sentToCrm = n8nResult.success
    } catch (n8nError) {
        console.error('N8N webhook failed:', n8nError)
    }

    // 2. Send emails with CRM status
    if (hasUserProvidedEmail) {
        // User provided email - send both notification and confirmation
        try {
            const emailResult = await sendContactEmails(
                validatedData,
                submissionId,
                sentToCrm
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

            // Forms that write their own subject and note (the consultation
            // thread, #274) keep them: that note is the procedure, timeline,
            // language and offer staff need. The generic text is only for
            // lead-capture forms that send a name and a phone number.
            const subject =
                validatedData.subject ??
                `${sourceLabel} Lead: ${fullName} - Callback Requested`
            const message = validatedData.message
                ? [validatedData.message, '', ...staffContextLines(lead)].join(
                      '\n'
                  )
                : `New lead from ${sourceLabel.toLowerCase()}:\n\nName: ${fullName}\nPhone: ${validatedData.phone}\nSource: ${source}\n\nThis lead requested a callback.`

            await sendContactNotification(
                {
                    name: fullName,
                    email: '',
                    phone: validatedData.phone,
                    subject,
                    message,
                },
                submissionId,
                sentToCrm
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
 * - Origin/Referer validation blocks requests from external sources
 * - Honeypot field detection catches form-filling bots
 * - Time-based detection blocks instant submissions (< 3s)
 * - TODO: Add rate limiting (consider upstash/ratelimit) if spam persists
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

        // Layer 3: Origin/Referer validation
        if (!isValidOrigin(request)) {
            console.warn(
                '[spam:origin] Blocked request with invalid origin/referer'
            )
            return NextResponse.json<ContactFormResponse>(
                {
                    success: false,
                    message: 'Forbidden',
                    error: 'Request origin not allowed',
                },
                { status: 403 }
            )
        }

        // Parse request body
        const body = (await request.json()) as Record<string, unknown>

        // Layer 1: Honeypot field check
        if (
            body._website &&
            typeof body._website === 'string' &&
            body._website.length > 0
        ) {
            console.warn('[spam:honeypot] Bot detected via honeypot field')
            // Return fake success to avoid tipping off bots
            return NextResponse.json<ContactFormResponse>(
                {
                    success: true,
                    message:
                        "Thank you for contacting us! We'll get back to you soon.",
                },
                { status: 200 }
            )
        }

        // Layer 2: Time-based detection
        if (body._formLoadedAt && typeof body._formLoadedAt === 'number') {
            const elapsed = Date.now() - body._formLoadedAt
            if (elapsed < MIN_FORM_FILL_TIME_MS) {
                console.warn(
                    `[spam:timing] Form submitted too fast (${elapsed}ms)`
                )
                // Return fake success to avoid tipping off bots
                return NextResponse.json<ContactFormResponse>(
                    {
                        success: true,
                        message:
                            "Thank you for contacting us! We'll get back to you soon.",
                    },
                    { status: 200 }
                )
            }
        }

        // Strip anti-spam fields before validation
        delete body._website
        delete body._formLoadedAt

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

        // Sources that typically don't collect email (used for default message)
        const SOURCES_WITHOUT_EMAIL_FIELD = [
            CONTACT_SOURCES.BLOG_LEAD,
            CONTACT_SOURCES.EXIT_INTENT,
            CONTACT_SOURCES.LEAD_FORM,
        ] as const
        const isLeadCaptureSource = SOURCES_WITHOUT_EMAIL_FIELD.includes(
            source as (typeof SOURCES_WITHOUT_EMAIL_FIELD)[number]
        )

        // Email is required in DB - use placeholder for forms without email field
        const email =
            validatedData.email || placeholderEmail(validatedData.firstName)

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

        // Drop click IDs that don't match the explicit utm_source. Instagram
        // appends fbclid to every outbound bio-link click, so without this
        // doctor/influencer/organic-social leads get falsely attributed to Meta.
        // Unexpanded tracking-template tokens (`cpc{ifvideo:video}`) are
        // stripped first: the paid check reads utm_medium, and a UTM captured
        // before the client-side fix can still sit in a visitor's storage.
        const attribution = sanitizeAdClickIds({
            ...validatedData,
            utmSource: stripPlaceholders(validatedData.utmSource),
            utmMedium: stripPlaceholders(validatedData.utmMedium),
            utmCampaign: stripPlaceholders(validatedData.utmCampaign),
            utmContent: stripPlaceholders(validatedData.utmContent),
            utmTerm: stripPlaceholders(validatedData.utmTerm),
        })

        // The landing URL is the one record every Google click leaves, even
        // when the client lost the ids on the way (the LP read the first,
        // placeholder copy of each param before #288). Recover what's missing
        // from it and keep the ValueTrack params (keyword, matchtype, device…)
        // that have no column of their own.
        const landing = parseLandingUrl(validatedData.landingPage)
        const landingParams = Object.keys(landing.params).length
            ? landing.params
            : undefined

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
            utmSource: attribution.utmSource,
            utmMedium: attribution.utmMedium,
            utmCampaign: attribution.utmCampaign,
            utmContent: attribution.utmContent,
            utmTerm: attribution.utmTerm,
            gclid: attribution.gclid || landing.clickIds.gclid,
            gbraid: attribution.gbraid || landing.clickIds.gbraid,
            wbraid: attribution.wbraid || landing.clickIds.wbraid,
            gadCampaignId:
                attribution.gadCampaignId || landing.clickIds.gadCampaignId,
            fbclid: attribution.fbclid,
            ttclid: attribution.ttclid,
            fbp: validatedData.fbp,
            fbc: validatedData.fbc,
            referrer: validatedData.referrer,
            landingPage: validatedData.landingPage,
            landingParams,
            submittedFromPath: validatedData.submittedFromPath,
            gaClientId: validatedData.gaClientId,
            timeline: validatedData.timeline,
            financingInterest: validatedData.financingInterest,
            language: validatedData.language,
            offer: validatedData.offer,
            timeZone: validatedData.timeZone,
            pageVariant: validatedData.pageVariant,
            formVariant: validatedData.formVariant,
            consentMethod: validatedData.consentMethod,
            consentVersion: validatedData.consentVersion,
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
                submission,
                validatedData,
                hasUserProvidedEmail,
                source,
                fullName
            )
        })

        // Return success response with source-appropriate message
        const message = getSuccessMessage(source, hasUserProvidedEmail)
        const token = createLeadUpdateToken(submission.id)

        return NextResponse.json<ContactFormResponse>(
            {
                success: true,
                message,
                ...(token && { lead: { id: submission.id, token } }),
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
 * PATCH handler: the thank-you page's optional answers (#274).
 *
 * Adds an email, video-or-in-person, financing interest, best time to text
 * or how they heard about us to the lead the visitor just sent, then sends
 * the whole lead to N8N as `lead.updated`. The token from the POST response
 * is the only authorisation: it names one lead and expires.
 *
 * Staff are not emailed again; the CRM receives the answers through N8N.
 */
export async function PATCH(
    request: NextRequest
): Promise<NextResponse<ContactFormResponse>> {
    try {
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

        if (!isValidOrigin(request)) {
            console.warn(
                '[spam:origin] Blocked lead update with invalid origin/referer'
            )
            return NextResponse.json<ContactFormResponse>(
                {
                    success: false,
                    message: 'Forbidden',
                    error: 'Request origin not allowed',
                },
                { status: 403 }
            )
        }

        const update = leadUpdateSchema.parse(await request.json())

        if (!verifyLeadUpdateToken(update.id, update.token)) {
            return NextResponse.json<ContactFormResponse>(
                {
                    success: false,
                    message: 'Forbidden',
                    error: 'Invalid or expired token',
                },
                { status: 403 }
            )
        }

        const changes: Partial<InsertContactSubmission> = {
            ...(update.email && { email: update.email }),
            ...(update.consultType && { consultType: update.consultType }),
            ...(update.financingInterest && {
                financingInterest: update.financingInterest,
            }),
            ...(update.preferredContactTime && {
                preferredContactTime: update.preferredContactTime,
            }),
            ...(update.heardFrom && { heardFrom: update.heardFrom }),
        }

        const [lead] = await db
            .update(contactSubmission)
            .set(changes)
            .where(eq(contactSubmission.id, update.id))
            .returning()

        if (!lead) {
            return NextResponse.json<ContactFormResponse>(
                {
                    success: false,
                    message: 'Not found',
                    error: 'Lead not found',
                },
                { status: 404 }
            )
        }

        console.log(
            `Lead ${lead.id} updated from the thank-you page: ${Object.keys(changes).join(', ')}`
        )

        after(async () => {
            try {
                await sendLeadUpdateToN8N(lead)
            } catch (n8nError) {
                console.error('N8N lead update failed:', n8nError)
            }
        })

        return NextResponse.json<ContactFormResponse>(
            { success: true, message: 'Saved' },
            { status: 200 }
        )
    } catch (error) {
        if (error instanceof ZodError) {
            const firstError = error.issues[0]
            return NextResponse.json<ContactFormResponse>(
                {
                    success: false,
                    message: 'Validation failed',
                    error: firstError
                        ? `${firstError.path.join('.')}: ${firstError.message}`
                        : 'Validation failed',
                },
                { status: 400 }
            )
        }

        if (error instanceof SyntaxError) {
            return NextResponse.json<ContactFormResponse>(
                {
                    success: false,
                    message: 'Invalid JSON format',
                    error: 'Request body must be valid JSON',
                },
                { status: 400 }
            )
        }

        console.error('Server error in lead update handler:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        })

        return NextResponse.json<ContactFormResponse>(
            {
                success: false,
                message: 'Something went wrong. Please try again later.',
                error: 'Internal server error',
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
            'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
