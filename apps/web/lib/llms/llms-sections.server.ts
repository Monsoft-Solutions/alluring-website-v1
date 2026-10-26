/**
 * The sections `llms.txt` and `llms-full.txt` share (issue #354), built from
 * the claims canon (`@workspace/shared/claims`) and the pricing resolver, so
 * what AI engines read is what the canon verifies:
 *
 * - the practice, in the approved descriptions; United States only;
 * - the surgeon, in the approved credential sentences, linked to the public
 *   records (never the cosmetic boards: `llms*.txt` has no place for the
 *   Florida statement they require);
 * - starting prices in plain text ("$4,400 (20% off $5,500)" while a
 *   discount is on), with the long caveat and the 456.062 statement;
 * - financing named, no figure.
 *
 * No volume, tenure, accreditation, "double board" or "luxury" line: none of
 * those is verified. Every link is absolute.
 *
 * @module lib/llms/llms-sections
 */
import 'server-only'

import {
    AREA_SERVED,
    BUSINESS_NAME,
    DESCRIPTION_LONG,
    DESCRIPTION_SHORT,
    MARKET_SENTENCE,
    TAGLINE,
} from '@workspace/shared/claims/identity'
import { FINANCING_SENTENCE_LONG } from '@workspace/shared/claims/financing'
import {
    CLAIM_PROCEDURES,
    PRICE_CAVEAT_LONG,
} from '@workspace/shared/claims/prices'
import {
    formatComboDiscountSentence,
    formatPriceText,
    formatTypicalRangeText,
    getDiscountStatement,
    getPriceDisplay,
    getTypicalRange,
    type PricingSnapshot,
} from '@workspace/shared/claims/pricing'
import {
    KARLINSKY_CREDENTIALS_LONG,
    KARLINSKY_NAME,
    karlinskyRecords,
} from '@workspace/shared/claims/surgeon'
import { TRUST_FACTS } from '@workspace/shared/claims/trust'

import { env } from '@/env'
import { getFullAddress, siteConfig } from '@/lib/data/site-config'

/** The site origin, with no trailing slash. */
export function getLlmsSiteUrl(): string {
    return (env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl).replace(
        /\/+$/,
        ''
    )
}

/** An absolute URL for a site path. */
export function absoluteUrl(path: string): string {
    if (/^https?:\/\//.test(path)) return path
    return `${getLlmsSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`
}

/** The one-line summary under the H1, and the paragraph after it. */
export const LLMS_SUMMARY = DESCRIPTION_SHORT
export const LLMS_INTRO = DESCRIPTION_LONG

/** Name, tagline, location and contact, as `**Label**: value` lines. */
export function practiceLines(): string {
    const lines = [
        `**Business Name**: ${BUSINESS_NAME}`,
        siteConfig.business.legalName &&
            `**Legal Name**: ${siteConfig.business.legalName}`,
        `**Tagline**: ${TAGLINE}`,
        `**Type**: Cosmetic surgery practice`,
        `**Location**: ${getFullAddress()}`,
        `**Phone**: ${siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone}`,
        `**Email**: ${siteConfig.contact.email}`,
        `**Serving**: ${AREA_SERVED.join(', ')}. ${MARKET_SENTENCE}`,
    ]
    return lines.filter(Boolean).join('\n')
}

/** The surgeon, in the canon's long credential sentence, with her records. */
export function surgeonSection(): string {
    return `## Surgeon

One surgeon performs every procedure at ${BUSINESS_NAME}: ${KARLINSKY_NAME}.

${KARLINSKY_CREDENTIALS_LONG}

- [Profile](${absoluteUrl('/dr-karlinsky')})
- [American Board of Surgery certificate](${karlinskyRecords.americanBoardOfSurgery})
- [American College of Surgeons profile](${karlinskyRecords.americanCollegeOfSurgeons})
- [Florida license verification](${karlinskyRecords.floridaLicense})`
}

/** The verified trust facts, as a list. */
export function trustLines(): string {
    return TRUST_FACTS.map((fact) => `- ${fact}`).join('\n')
}

/**
 * One line per procedure page: its starting price in plain text, with the
 * variant named, BBL's "most patients pay" range, and no total for a mommy
 * makeover (D3) or a facelift-alone price (D2).
 */
function priceLine(
    pricing: PricingSnapshot,
    procedure: (typeof CLAIM_PROCEDURES)[number]
): string | null {
    if (!procedure.path) return null
    const link = `[${procedure.name}](${absoluteUrl(procedure.path)})`
    if (procedure.key === 'mommy-makeover') {
        return `- ${link}: priced from the procedures in your plan, with the combination discount below.`
    }
    const display = getPriceDisplay(pricing, procedure.key)
    if (!display) return null
    if (procedure.key === 'facelift') {
        return `- ${link}: a ${display.label} is ${formatPriceText(display)}; other facial procedures are priced at consultation.`
    }
    const range = getTypicalRange(pricing, procedure.key)
    return `- ${link}: from ${formatPriceText(display)} for ${display.label}${range ? `; ${formatTypicalRangeText(range)}` : ''}.`
}

/** The starting prices, the combination discount and the caveat. */
export function pricesSection(pricing: PricingSnapshot): string {
    const lines = CLAIM_PROCEDURES.map((procedure) =>
        priceLine(pricing, procedure)
    ).filter((line): line is string => line !== null)
    const statement = getDiscountStatement(pricing)

    return `## Starting Prices

${lines.join('\n')}

${formatComboDiscountSentence(pricing)}

${PRICE_CAVEAT_LONG}${statement ? `\n\n${statement}` : ''}`
}

/** Financing: the lenders, no figure. */
export function financingSection(): string {
    return `## Financing

${FINANCING_SENTENCE_LONG} Details: ${absoluteUrl('/plastic-surgery-financing-miami')}`
}

/** The business hours as a list. */
export function hoursLines(): string {
    const hours = siteConfig.contact.businessHours
    if (!hours || hours.length === 0) return '- Contact us for hours'
    return hours
        .map(
            (h) =>
                `- ${h.days}: ${h.open === 'Closed' ? 'Closed' : `${h.open} - ${h.close}`}${h.note ? ` (${h.note})` : ''}`
        )
        .join('\n')
}

/**
 * The newest real date among the given ISO dates and the pricing edit, as
 * YYYY-MM-DD, or `null` when there is none. Never the request date (#250).
 */
export function newestDate(
    dates: readonly (string | null | undefined)[],
    pricing: PricingSnapshot
): string | null {
    return (
        [...dates, pricing.updatedAt]
            .filter((date): date is string => Boolean(date))
            .map((date) => date.slice(0, 10))
            .sort()
            .at(-1) ?? null
    )
}
