/**
 * N8N Webhook Service
 *
 * Handles lead synchronization to N8N webhook for CRM integration.
 * Sends lead data with UTM parameters and ad platform click IDs.
 *
 * @module lib/services/n8n-webhook.service
 */

import type { InsertContactSubmission } from '@workspace/db/schema/contact'

import { env } from '@/env'

/**
 * N8N lead payload structure (snake_case format)
 * Matches the expected payload format for N8N webhook
 */
export type N8NLeadPayload = {
    readonly name: string
    readonly phone: string
    readonly email: string
    readonly utm_source: string
    readonly utm_medium: string
    readonly utm_campaign: string
    readonly utm_content: string
    readonly utm_term: string
    readonly gclid: string
    readonly fbclid: string
    readonly ttclid: string
    readonly procedures: string[]
    readonly timeOfDayToBeContacted: string
    readonly whereDidYouHearFromUs: string
    readonly lang: string
    readonly needFinancing: string
    readonly referrer: string
    readonly landingPage: string
    readonly source: string
}

/**
 * N8N webhook result
 */
export type N8NWebhookResult = {
    readonly success: boolean
    readonly error?: string
}

/**
 * Map preferred contact time to display value
 */
function mapContactTime(
    preferredContactTime: string | null | undefined
): string {
    if (!preferredContactTime) return ''

    const timeMap: Record<string, string> = {
        morning: '9am - 12pm',
        afternoon: '12pm - 5pm',
        evening: '5pm - 7pm',
    }

    return timeMap[preferredContactTime] || preferredContactTime
}

/**
 * Send lead to N8N webhook
 *
 * Makes POST request to N8N webhook endpoint with lead data.
 * Non-blocking - failures are logged but don't throw errors.
 *
 * @param leadData - Contact submission data from database
 * @returns Promise resolving to webhook result
 */
export async function sendLeadToN8N(
    leadData: InsertContactSubmission
): Promise<N8NWebhookResult> {
    // Skip if N8N webhook URL not configured
    if (!env.N8N_WEBHOOK_URL) {
        console.log('N8N webhook skipped: N8N_WEBHOOK_URL not configured')
        return {
            success: false,
            error: 'N8N webhook URL not configured',
        }
    }

    try {
        // Build full name from available fields
        const fullName =
            leadData.firstName && leadData.lastName
                ? `${leadData.firstName} ${leadData.lastName}`.trim()
                : leadData.name || ''

        // Build payload in expected N8N format (snake_case)
        const payload: N8NLeadPayload = {
            name: fullName,
            phone: leadData.phone || '',
            email: leadData.email,
            utm_source: leadData.utmSource || '',
            utm_medium: leadData.utmMedium || '',
            utm_campaign: leadData.utmCampaign || '',
            utm_content: leadData.utmContent || '',
            utm_term: leadData.utmTerm || '',
            gclid: leadData.gclid || '',
            fbclid: leadData.fbclid || '',
            ttclid: leadData.ttclid || '',
            procedures: leadData.procedure ? [leadData.procedure] : [],
            timeOfDayToBeContacted: mapContactTime(
                leadData.preferredContactTime
            ),
            whereDidYouHearFromUs: '',
            lang: '',
            needFinancing: '',
            referrer: leadData.referrer || '',
            landingPage: leadData.landingPage || '',
            source: leadData.source || '',
        }

        console.log('N8N webhook payload:', payload)

        // Set up timeout guard with AbortController
        const TIMEOUT_MS = 5000
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

        try {
            // Make POST request to N8N webhook with timeout
            const response = await fetch(env.N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            })

            // Clear timeout on successful response
            clearTimeout(timeoutId)

            if (!response.ok) {
                const errorText = await response.text()
                console.error('N8N webhook failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText,
                })

                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                }
            }

            // Log success
            console.log('Lead sent to N8N successfully:')

            return {
                success: true,
            }
        } catch (fetchError) {
            // Clear timeout to prevent memory leak
            clearTimeout(timeoutId)

            // Handle abort/timeout error specifically
            if (
                fetchError instanceof Error &&
                fetchError.name === 'AbortError'
            ) {
                console.error('N8N webhook timeout:', {
                    timeoutMs: TIMEOUT_MS,
                    url: env.N8N_WEBHOOK_URL,
                })

                return {
                    success: false,
                    error: `Request timeout after ${TIMEOUT_MS}ms`,
                }
            }

            // Re-throw other errors to be caught by outer catch
            throw fetchError
        }
    } catch (error) {
        console.error('N8N webhook error:', error)

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}
