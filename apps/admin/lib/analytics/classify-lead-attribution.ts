import {
    AI_MEDIUM,
    knownReferrerSource,
    normalizeAiSource,
    referrerHost,
} from '@workspace/shared/attribution'

import type {
    LeadAttribution,
    LeadAttributionInput,
} from '@/lib/types/analytics/lead-trends.type'

/**
 * Classify a lead into a canonical { source, medium, classification } tuple.
 * Never throws; always returns a valid value.
 *
 * Referrer hosts and AI sources are read by the website's own classifier
 * (`@workspace/shared/attribution`), so a referrer — an AI assistant's
 * included (#350) — gets the same source and medium here as in the
 * first-touch record the website stores with each lead.
 */
export function classifyLeadAttribution(
    input: LeadAttributionInput
): LeadAttribution {
    const utmSource = input.utmSource?.trim().toLowerCase()
    const utmMedium = input.utmMedium?.trim().toLowerCase()
    // An AI assistant's link (`utm_source=chatgpt.com`) usually comes with
    // no medium: it is still a UTM, filed under the assistant's one name.
    const aiSource = normalizeAiSource(utmSource)
    if (aiSource) {
        return {
            source: aiSource,
            medium: utmMedium || AI_MEDIUM,
            classification: 'utm',
        }
    }
    if (utmSource && utmMedium) {
        return { source: utmSource, medium: utmMedium, classification: 'utm' }
    }

    if (input.gclid || input.gbraid || input.wbraid) {
        return { source: 'google', medium: 'cpc', classification: 'click-id' }
    }
    if (input.fbclid) {
        return {
            source: 'facebook',
            medium: 'paid',
            classification: 'click-id',
        }
    }
    if (input.ttclid) {
        return { source: 'tiktok', medium: 'paid', classification: 'click-id' }
    }

    const host = referrerHost(input.referrer)
    if (host) {
        const known = knownReferrerSource(host)
        if (known) {
            return { ...known, classification: 'referrer' }
        }
        return {
            source: `referral/${host}`,
            medium: 'referral',
            classification: 'referrer',
        }
    }

    const source = input.source?.trim().toLowerCase()
    if (source) {
        return { source, medium: '(none)', classification: 'source-field' }
    }

    return { source: 'direct', medium: 'direct', classification: 'direct' }
}
