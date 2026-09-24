/**
 * Lead → ad click matching: the pure half of the `resolve-lead-clicks` job.
 *
 * Decides whether a lead is a paid Google lead, which click id to look up,
 * and — given what the click report said — which rung of the match ladder
 * the lead lands on and whether the answer is final. Kept free of DB and API
 * access so the ladder is unit-testable.
 *
 * A **paid Google lead** carries a Google click id (gclid, gbraid, wbraid) or
 * a Google Ads campaign id (`gad_campaignid`) — in its columns or recovered
 * from the landing URL — or is tagged `utm_source=google` with a paid medium.
 * `classifyLeadAttribution` stays the single classifier for the UTM case, so
 * Google organic and Business Profile links (`utm_medium=organic`) are not
 * paid.
 *
 * @module @/lib/utils/ads/lead-ad-match.util
 */
import {
    parseLandingUrl,
    stripPlaceholders,
    type LandingParams,
} from '@workspace/shared/attribution'
import type {
    LeadAdMatch,
    LeadClickIdSource,
    LeadClickIdType,
} from '@workspace/db/schema/ads'

import { classifyLeadAttribution } from '@/lib/analytics/classify-lead-attribution'

// ============================================
// Constants
// ============================================

/** Mediums that mean a paid click. Mirrors the website's sanitizer. */
export const PAID_MEDIUMS = new Set([
    'cpc',
    'ppc',
    'paid',
    'paid-search',
    'paid_search',
    'paidsearch',
    'sem',
    'ads',
    'display',
    'pmax',
])

/** Sources that mean Google Ads. */
const GOOGLE_SOURCES = new Set(['google', 'google-ads', 'googleads', 'adwords'])

/** Google keeps click details (`click_view`) for this many days. */
export const CLICK_VIEW_RETENTION_DAYS = 90

/**
 * How long a not-yet-found gclid keeps being retried. The click report fills
 * in within hours; three days also covers a slow day and a failed run.
 */
export const RETRY_WINDOW_DAYS = 3

/** Days before the lead's day searched for its click (visitors come back). */
export const CLICK_LOOKBACK_DAYS = 6

// ============================================
// Types
// ============================================

/** The contact_submission fields the matcher reads. */
export type LeadForMatching = {
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
    source: string | null
    referrer: string | null
    gclid: string | null
    gbraid: string | null
    wbraid: string | null
    gadCampaignId: string | null
    fbclid: string | null
    ttclid: string | null
    landingPage: string | null
    landingParams: LandingParams | null
}

export type LeadClickId = {
    type: LeadClickIdType
    id: string
    source: LeadClickIdSource
}

/** What a paid Google lead carries, before any API lookup. */
export type LeadAssessment = {
    /** The best click id: a gclid first, then gbraid, then wbraid. */
    clickId: LeadClickId | null
    /** A campaign id from `gad_campaignid` or a numeric `utm_id`. */
    campaignIdHint: string | null
    /** utm_campaign with template debris stripped, e.g. a campaign name. */
    utmCampaign: string | null
    /** Landing page path, no query string. */
    landingPath: string | null
}

/** The fields a lookup fills when the click report knew the gclid. */
export type ClickDetails = {
    date: string
    campaignId: string
    campaignName: string
    adGroupId: string | null
    adGroupName: string | null
    keyword: string | null
    keywordMatchType: string | null
    device: string
    network: string
}

/** The ladder's answer for one lead. */
export type MatchDecision = {
    match: LeadAdMatch
    campaignId: string | null
    click: ClickDetails | null
    /** True once no further lookup will change the answer. */
    final: boolean
}

// ============================================
// Assessment
// ============================================

function clean(value: string | null | undefined): string | null {
    return stripPlaceholders(value) ?? null
}

/** Path of a landing URL, trailing slash stripped; null when unparseable. */
export function landingPathOf(landingPage: string | null): string | null {
    if (!landingPage) return null
    try {
        const path = new URL(landingPage, 'https://placeholder.invalid')
            .pathname
        return path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path
    } catch {
        return null
    }
}

/**
 * Read a lead's attribution and decide whether it is a paid Google lead.
 *
 * @returns The assessment, or null when the lead is not a paid Google lead
 */
export function assessLead(lead: LeadForMatching): LeadAssessment | null {
    const landing = parseLandingUrl(lead.landingPage)

    const pick = (
        type: LeadClickIdType,
        column: string | null
    ): LeadClickId | null => {
        const fromColumn = clean(column)
        if (fromColumn) return { type, id: fromColumn, source: 'column' }
        const fromUrl = landing.clickIds[type]
        return fromUrl ? { type, id: fromUrl, source: 'landing_url' } : null
    }

    const clickId =
        pick('gclid', lead.gclid) ??
        pick('gbraid', lead.gbraid) ??
        pick('wbraid', lead.wbraid)

    const columnCampaign = clean(lead.gadCampaignId)
    const utmId = lead.landingParams?.utm_id ?? landing.params.utm_id ?? null
    const campaignIdHint =
        (columnCampaign && /^\d+$/.test(columnCampaign)
            ? columnCampaign
            : null) ??
        landing.clickIds.gadCampaignId ??
        (utmId && /^\d+$/.test(utmId) ? utmId : null)

    const isPaid =
        clickId !== null || campaignIdHint !== null || isPaidGoogleTag(lead)

    if (!isPaid) return null

    return {
        clickId,
        campaignIdHint,
        utmCampaign: clean(lead.utmCampaign),
        landingPath: landingPathOf(lead.landingPage),
    }
}

/** UTM tags (via the shared classifier) say Google with a paid medium. */
function isPaidGoogleTag(lead: LeadForMatching): boolean {
    const attribution = classifyLeadAttribution({
        utmSource: clean(lead.utmSource),
        utmMedium: clean(lead.utmMedium),
        source: lead.source,
        referrer: lead.referrer,
        gclid: null,
        gbraid: null,
        wbraid: null,
        fbclid: lead.fbclid,
        ttclid: lead.ttclid,
    })
    return (
        attribution.classification === 'utm' &&
        GOOGLE_SOURCES.has(attribution.source) &&
        PAID_MEDIUMS.has(attribution.medium)
    )
}

// ============================================
// The ladder
// ============================================

/**
 * Place a lead on the match ladder.
 *
 * @param assessment - From `assessLead`
 * @param input.leadAgeDays - Days from the lead's day to today (account zone)
 * @param input.click - The click report's row for the lead's gclid, when found
 * @param input.lookedUp - Whether a click lookup ran for this lead this time
 * @param input.campaignIdByName - Known campaign ids by name, for leads whose
 *   only campaign trace is an expanded `utm_campaign`
 */
export function decideMatch(
    assessment: LeadAssessment,
    input: {
        leadAgeDays: number
        click: ClickDetails | null
        lookedUp: boolean
        campaignIdByName?: ReadonlyMap<string, string>
    }
): MatchDecision {
    const campaignFromName = assessment.utmCampaign
        ? (input.campaignIdByName?.get(assessment.utmCampaign) ?? null)
        : null
    const campaignId = assessment.campaignIdHint ?? campaignFromName

    const { clickId } = assessment

    if (clickId?.type === 'gclid') {
        if (input.click) {
            return {
                match: 'click',
                campaignId: input.click.campaignId,
                click: input.click,
                final: true,
            }
        }

        // The click is older than the lead, so a lead this old has a click
        // the report can no longer answer for.
        if (!input.lookedUp && input.leadAgeDays >= CLICK_VIEW_RETENTION_DAYS) {
            return {
                match: campaignId ? 'campaign' : 'expired',
                campaignId,
                click: null,
                final: true,
            }
        }

        // Not found (yet): hold the best fallback, retry while it's fresh.
        return {
            match: campaignId ? 'campaign' : 'not_found',
            campaignId,
            click: null,
            final: input.leadAgeDays >= RETRY_WINDOW_DAYS,
        }
    }

    if (clickId) {
        // gbraid / wbraid: iPhone traffic, not in the click report.
        return { match: 'ios_click', campaignId, click: null, final: true }
    }

    return {
        match: campaignId ? 'campaign' : 'tagged_only',
        campaignId,
        click: null,
        final: true,
    }
}

/** Whole days from `leadDate` to `today` (both YYYY-MM-DD). */
export function daysSince(leadDate: string, today: string): number {
    const from = Date.parse(`${leadDate}T12:00:00Z`)
    const to = Date.parse(`${today}T12:00:00Z`)
    return Math.round((to - from) / 86_400_000)
}
