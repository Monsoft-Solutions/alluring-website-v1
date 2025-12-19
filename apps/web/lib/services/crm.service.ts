/**
 * CRM Service
 *
 * Handles lead synchronization to Nexuite CRM via API.
 * Provides non-blocking lead sync with error handling.
 *
 * @module lib/services/crm.service
 */

import type { InsertContactSubmission } from '@workspace/db/schema/contact'

import { env } from '@/env'

/**
 * CRM lead payload structure
 * Maps contact form fields to Nexuite CRM field names
 */
export type CRMLeadPayload = {
    name: string
    last?: string
    email: string
    phone?: string
    gender?: string
    dob?: string
    message?: string
    comment?: string
}

/**
 * CRM sync result
 */
export type CRMSyncResult = {
    success: boolean
    error?: string
}

/**
 * Build enriched message with additional lead context
 *
 * Combines the original message with procedure, contact preferences,
 * source, and UTM tracking data for comprehensive lead information.
 *
 * @param leadData - Contact submission data
 * @returns Enriched message string
 */
function buildEnrichedMessage(leadData: InsertContactSubmission): string {
    const parts: string[] = []

    // Original message
    if (leadData.message) {
        parts.push(leadData.message)
        parts.push('') // Empty line for separation
    }

    // Procedure of interest
    if (leadData.procedure) {
        parts.push(`Procedure of Interest: ${leadData.procedure}`)
    }

    // Preferred contact time
    if (leadData.preferredContactTime) {
        const timeLabel =
            leadData.preferredContactTime === 'morning'
                ? '9am - 12pm'
                : leadData.preferredContactTime === 'afternoon'
                  ? '12pm - 5pm'
                  : leadData.preferredContactTime === 'evening'
                    ? '5pm - 7pm'
                    : leadData.preferredContactTime
        parts.push(`Preferred Contact Time: ${timeLabel}`)
    }

    // Lead source
    if (leadData.source) {
        parts.push(`Lead Source: ${leadData.source}`)
    }

    // UTM tracking (marketing attribution)
    const utmParts: string[] = []
    if (leadData.utmSource) utmParts.push(`Source: ${leadData.utmSource}`)
    if (leadData.utmMedium) utmParts.push(`Medium: ${leadData.utmMedium}`)
    if (leadData.utmCampaign) utmParts.push(`Campaign: ${leadData.utmCampaign}`)
    if (leadData.utmContent) utmParts.push(`Content: ${leadData.utmContent}`)
    if (leadData.utmTerm) utmParts.push(`Term: ${leadData.utmTerm}`)

    if (utmParts.length > 0) {
        parts.push('') // Empty line
        parts.push('Marketing Attribution:')
        parts.push(utmParts.join(' | '))
    }

    // Ad platform click IDs
    const clickIds: string[] = []
    if (leadData.gclid) clickIds.push(`Google Click ID: ${leadData.gclid}`)
    if (leadData.fbclid) clickIds.push(`Facebook Click ID: ${leadData.fbclid}`)
    if (leadData.ttclid) clickIds.push(`TikTok Click ID: ${leadData.ttclid}`)

    if (clickIds.length > 0) {
        parts.push('') // Empty line
        parts.push(clickIds.join(' | '))
    }

    return parts.filter(Boolean).join('\n')
}

/**
 * Sync lead to Nexuite CRM
 *
 * Makes POST request to CRM API endpoint with lead data.
 * Non-blocking - failures are logged but don't throw errors.
 *
 * @param leadData - Contact submission data from database
 * @returns Promise resolving to sync result
 */
export async function syncLeadToCRM(
    leadData: InsertContactSubmission
): Promise<CRMSyncResult> {
    // Skip if CRM URL not configured
    if (!env.NEXUITE_CRM_API_URL) {
        return {
            success: false,
            error: 'CRM URL not configured',
        }
    }

    try {
        // Build enriched message with all captured data
        const enrichedMessage = buildEnrichedMessage(leadData)

        // Map contact form fields to CRM payload
        const payload: CRMLeadPayload = {
            name:
                leadData.firstName ||
                leadData.name ||
                `Anonymous - ${leadData.phone ?? leadData.email}`,
            last: leadData.lastName ?? undefined,
            email: leadData.email,
            phone: leadData.phone ?? undefined,
            message: enrichedMessage,
        }

        console.log('CRM payload:', payload)

        // Make POST request to CRM API
        const response = await fetch(env.NEXUITE_CRM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            return {
                success: false,
                error: `HTTP ${response.status}: ${response.statusText}`,
            }
        }

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}
