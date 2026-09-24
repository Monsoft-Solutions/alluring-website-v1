/**
 * N8N Webhook Service
 *
 * Handles lead synchronization to N8N webhook for CRM integration.
 * Sends lead data with UTM parameters and ad platform click IDs.
 *
 * Every lead is sent as `lead.created` when it is saved. When the thank-you
 * page adds answers to it (#274), the whole record is sent again as
 * `lead.updated` with the same `submission_id`, so the CRM side can upsert.
 *
 * @module lib/services/n8n-webhook.service
 */

import type { ContactSubmission } from '@workspace/db/schema/contact'

import { isPlaceholderEmail } from '@/lib/constants/lead-fields'
import { env } from '@/env'

export type N8NLeadEvent = 'lead.created' | 'lead.updated'

/**
 * N8N lead payload structure.
 *
 * The camelCase keys predate #274 and keep their human-readable values
 * (`timeOfDayToBeContacted: '9am - 12pm'`, `needFinancing: 'Yes'`). The
 * snake_case keys added with it carry the stored option values.
 */
export type N8NLeadPayload = {
    readonly event: N8NLeadEvent
    readonly submission_id: string
    readonly name: string
    readonly first_name: string
    readonly last_name: string
    readonly phone: string
    /** Empty when the visitor gave none — never the placeholder address. */
    readonly email: string
    readonly utm_source: string
    readonly utm_medium: string
    readonly utm_campaign: string
    readonly utm_content: string
    readonly utm_term: string
    readonly gclid: string
    readonly gbraid: string
    readonly wbraid: string
    readonly gad_campaign_id: string
    readonly fbclid: string
    readonly ttclid: string
    /** Meta pixel cookies (`_fbp`, `_fbc`): Conversions API match keys. */
    readonly fbp: string
    readonly fbc: string
    readonly procedures: string[]
    readonly timeline: string
    readonly timeOfDayToBeContacted: string
    readonly whereDidYouHearFromUs: string
    readonly lang: string
    readonly needFinancing: string
    readonly consult_type: string
    readonly offer: string
    readonly time_zone: string
    readonly sms_consent: boolean
    readonly referrer: string
    readonly landingPage: string
    /** The page the form was sent from; `landingPage` is where the visit began. */
    readonly page: string
    readonly source: string
    readonly ga_client_id: string
    /** When this payload was sent — the later of two events for a lead wins. */
    readonly sent_at: string
}

/** The stored lead, as the payload builder reads it. */
export type N8NLeadRecord = Pick<ContactSubmission, 'id'> &
    Partial<Omit<ContactSubmission, 'id'>>

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

const FINANCING_LABELS: Record<string, string> = {
    yes: 'Yes',
    no: 'No',
    'not-sure': 'Not sure',
}

const HEARD_FROM_LABELS: Record<string, string> = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    google: 'Google',
    friend: 'Friend or family',
    other: 'Other',
}

const labelFrom = (
    labels: Record<string, string>,
    value: string | null | undefined
): string => (value ? (labels[value] ?? value) : '')

export function buildN8NLeadPayload(
    lead: N8NLeadRecord,
    event: N8NLeadEvent
): N8NLeadPayload {
    const fullName =
        lead.firstName && lead.lastName
            ? `${lead.firstName} ${lead.lastName}`.trim()
            : lead.name || ''

    return {
        event,
        submission_id: lead.id,
        name: fullName,
        first_name: lead.firstName || '',
        last_name: lead.lastName || '',
        phone: lead.phone || '',
        email: isPlaceholderEmail(lead.email) ? '' : (lead.email ?? ''),
        utm_source: lead.utmSource || '',
        utm_medium: lead.utmMedium || '',
        utm_campaign: lead.utmCampaign || '',
        utm_content: lead.utmContent || '',
        utm_term: lead.utmTerm || '',
        gclid: lead.gclid || '',
        gbraid: lead.gbraid || '',
        wbraid: lead.wbraid || '',
        gad_campaign_id: lead.gadCampaignId || '',
        fbclid: lead.fbclid || '',
        ttclid: lead.ttclid || '',
        fbp: lead.fbp || '',
        fbc: lead.fbc || '',
        procedures: lead.procedure ? [lead.procedure] : [],
        timeline: lead.timeline || '',
        timeOfDayToBeContacted: mapContactTime(lead.preferredContactTime),
        whereDidYouHearFromUs: labelFrom(HEARD_FROM_LABELS, lead.heardFrom),
        lang: lead.language || '',
        needFinancing: labelFrom(FINANCING_LABELS, lead.financingInterest),
        consult_type: lead.consultType || '',
        offer: lead.offer || '',
        time_zone: lead.timeZone || '',
        sms_consent: lead.consentGiven ?? false,
        referrer: lead.referrer || '',
        landingPage: lead.landingPage || '',
        page: lead.submittedFromPath || '',
        source: lead.source || '',
        ga_client_id: lead.gaClientId || '',
        sent_at: new Date().toISOString(),
    }
}

/**
 * Send a new lead to the N8N webhook as `lead.created`.
 *
 * Non-blocking - failures are logged but don't throw errors.
 *
 * @param lead - The saved contact submission
 * @returns Promise resolving to webhook result
 */
export async function sendLeadToN8N(
    lead: N8NLeadRecord
): Promise<N8NWebhookResult> {
    return postToN8N(
        env.N8N_WEBHOOK_URL,
        'N8N_WEBHOOK_URL',
        buildN8NLeadPayload(lead, 'lead.created')
    )
}

/**
 * Send a lead again, whole, as `lead.updated` after the thank-you page added
 * answers to it. Goes to its own webhook so an N8N workflow that only knows
 * `lead.created` never turns an update into a second lead.
 */
export async function sendLeadUpdateToN8N(
    lead: N8NLeadRecord
): Promise<N8NWebhookResult> {
    return postToN8N(
        env.N8N_LEAD_UPDATE_WEBHOOK_URL,
        'N8N_LEAD_UPDATE_WEBHOOK_URL',
        buildN8NLeadPayload(lead, 'lead.updated')
    )
}

async function postToN8N(
    url: string | undefined,
    envName: string,
    payload: N8NLeadPayload
): Promise<N8NWebhookResult> {
    // Skip if the webhook URL is not configured
    if (!url) {
        console.log(`N8N webhook skipped: ${envName} not configured`)
        return {
            success: false,
            error: 'N8N webhook URL not configured',
        }
    }

    try {
        console.log('N8N webhook payload:', {
            event: payload.event,
            submission_id: payload.submission_id,
            source: payload.source,
        })

        // Set up timeout guard with AbortController
        const TIMEOUT_MS = 5000
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

        try {
            // Make POST request to N8N webhook with timeout
            const response = await fetch(url, {
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
                    event: payload.event,
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
            console.log(`Lead sent to N8N successfully (${payload.event})`)

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
                    event: payload.event,
                    timeoutMs: TIMEOUT_MS,
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
