/**
 * Where each visit began, for every lead (#350).
 *
 * `UTMTrackingProvider` stores UTMs and click ids only when the URL carries
 * them, so a visitor from Google search, ChatGPT or an Instagram bio link
 * sent a lead with no source at all (11 of 54 unpaid leads, Sep–Oct 2026).
 * This module records, on the first page of every visit, the external page
 * that sent it and the URL it landed on — params or not — and keeps two
 * records in `localStorage`:
 *
 * - the **latest visit** (`alluring_last_visit`): referrer and landing page,
 *   replaced by each new visit. Every form sends these as `referrer` and
 *   `landingPage`.
 * - the **first touch** (`alluring_first_touch`): source, medium, campaign,
 *   referrer, landing page and date of the browser's first recorded visit.
 *   Written once and never overwritten.
 *
 * What counts as a new visit: any landing with campaign params (an ad
 * click); otherwise the first page of a tab whose referrer is not the site
 * itself — except a direct arrival (no referrer) within 30 minutes of the
 * last page seen, which is a tab reopened or a link the site opened with
 * `noreferrer`. A page whose referrer is the site (another tab, the ads
 * landing page's subdomain) continues the visit it came from; when nothing
 * is stored for that visit, its landing page is kept with no referrer.
 *
 * Pure functions over storage handed in, so the rules can be tested without
 * a browser. Storage that throws (private mode, blocked site data) leaves the
 * record in memory for this page view.
 */

import {
    classifyTouch,
    type FirstTouch,
    readAttributionParam,
    stripPlaceholders,
} from '@workspace/shared/attribution'

import {
    type UTMData,
    UTM_PARAM_NAMES,
} from '@/lib/types/analytics/utm-tracking.type'

export const FIRST_TOUCH_KEY = 'alluring_first_touch'
export const LAST_VISIT_KEY = 'alluring_last_visit'
/** Set in `sessionStorage` once the tab's first page has been looked at. */
export const VISIT_RECORDED_KEY = 'alluring_visit_recorded'

/** A direct arrival this soon after the last page seen continues the visit. */
export const VISIT_IDLE_MS = 30 * 60 * 1000

/** URLs are capped to what the API accepts. */
const MAX_URL_LENGTH = 2048

export interface LastVisit {
    /** The external page that sent the visit; absent for direct visits. */
    readonly referrer?: string
    readonly landingPage: string
    /** ISO time the visit began. */
    readonly at: string
    /** ISO time of the latest full page load in it. */
    readonly seenAt: string
}

/** The part of `Storage` this module uses. */
export interface StorageLike {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
    removeItem(key: string): void
}

export interface VisitInput {
    /** `location.href` of the page being loaded. */
    readonly href: string
    /** `document.referrer`. */
    readonly referrer: string
    /** The site's canonical host (`www.alluringplasticsurgery.com`). */
    readonly siteHost: string
    readonly now: Date
    readonly local: StorageLike | null
    readonly session: StorageLike | null
}

export interface VisitResult {
    readonly isNewVisit: boolean
    readonly lastVisit: LastVisit | null
    readonly firstTouch: FirstTouch | null
}

/** What every lead form adds to its submission. */
export interface VisitAttribution {
    readonly referrer?: string
    readonly landingPage?: string
    readonly firstTouch?: FirstTouch
}

/** Held for this page view when storage refuses the write. */
let memory: VisitResult | null = null

const baseHost = (host: string) => host.toLowerCase().replace(/^www\./, '')

function hostOf(url: string): string | null {
    try {
        return new URL(url).hostname.toLowerCase() || null
    } catch {
        return null
    }
}

/**
 * Whether a referrer is the site itself: this host, or the site's domain
 * and any subdomain of it (the ads landing page lives on `book.`).
 */
export function isInternalReferrer(
    referrer: string,
    currentHost: string,
    siteHost: string
): boolean {
    const host = hostOf(referrer)
    if (!host) return false
    if (host === currentHost.toLowerCase()) return true
    const site = baseHost(siteHost)
    const current = baseHost(currentHost)
    return [site, current].some(
        (domain) =>
            Boolean(domain) &&
            (baseHost(host) === domain || host.endsWith(`.${domain}`))
    )
}

const cap = (value: string) => value.slice(0, MAX_URL_LENGTH)

function readJson(storage: StorageLike | null, key: string): unknown {
    if (!storage) return null
    try {
        const raw = storage.getItem(key)
        return raw ? (JSON.parse(raw) as unknown) : null
    } catch {
        return null
    }
}

/** Writes and reports whether it stuck. */
function writeJson(
    storage: StorageLike | null,
    key: string,
    value: unknown
): boolean {
    if (!storage) return false
    try {
        storage.setItem(key, JSON.stringify(value))
        return true
    } catch {
        return false
    }
}

const isString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0
const optionalString = (value: unknown) =>
    value === undefined || typeof value === 'string'

function asLastVisit(value: unknown): LastVisit | null {
    if (!value || typeof value !== 'object') return null
    const record = value as Record<string, unknown>
    if (!isString(record.landingPage) || !isString(record.at)) return null
    if (!optionalString(record.referrer)) return null
    return {
        ...(isString(record.referrer) && { referrer: record.referrer }),
        landingPage: record.landingPage,
        at: record.at,
        seenAt: isString(record.seenAt) ? record.seenAt : record.at,
    }
}

function asFirstTouch(value: unknown): FirstTouch | null {
    if (!value || typeof value !== 'object') return null
    const record = value as Record<string, unknown>
    if (
        !isString(record.source) ||
        !isString(record.medium) ||
        !isString(record.landingPage) ||
        !isString(record.at) ||
        !optionalString(record.referrer) ||
        !optionalString(record.campaign)
    ) {
        return null
    }
    return {
        source: record.source,
        medium: record.medium,
        ...(isString(record.campaign) && { campaign: record.campaign }),
        ...(isString(record.referrer) && { referrer: record.referrer }),
        landingPage: record.landingPage,
        at: record.at,
    }
}

/** The tracked params on a landing URL, placeholders removed. */
function campaignParams(href: string) {
    let params: URLSearchParams
    try {
        params = new URL(href).searchParams
    } catch {
        params = new URLSearchParams()
    }
    const read = (name: (typeof UTM_PARAM_NAMES)[number]) =>
        stripPlaceholders(readAttributionParam(params, name))
    return {
        utmSource: read('utm_source'),
        utmMedium: read('utm_medium'),
        utmCampaign: read('utm_campaign'),
        any: UTM_PARAM_NAMES.some((name) => Boolean(read(name))),
        gclid: read('gclid'),
        gbraid: read('gbraid'),
        wbraid: read('wbraid'),
        fbclid: read('fbclid'),
        ttclid: read('ttclid'),
    }
}

/**
 * Looks at one full page load and updates the latest-visit and first-touch
 * records. Call it once per page load, after hydration.
 */
export function recordVisit(input: VisitInput): VisitResult {
    const { href, referrer, siteHost, now, local, session } = input
    const currentHost = hostOf(href) ?? ''
    const internal =
        Boolean(referrer) && isInternalReferrer(referrer, currentHost, siteHost)
    const externalReferrer = referrer && !internal ? cap(referrer) : undefined
    const campaign = campaignParams(href)

    const previous = asLastVisit(readJson(local, LAST_VISIT_KEY))
    let recordedInTab = false
    try {
        recordedInTab = Boolean(session?.getItem(VISIT_RECORDED_KEY))
    } catch {
        recordedInTab = false
    }

    const idle =
        !previous ||
        now.getTime() - Date.parse(previous.seenAt) >= VISIT_IDLE_MS ||
        Number.isNaN(Date.parse(previous.seenAt))

    const isNewVisit = campaign.any
        ? true
        : recordedInTab || internal
          ? false
          : externalReferrer
            ? true
            : idle

    const at = now.toISOString()
    const lastVisit: LastVisit | null = isNewVisit
        ? {
              ...(externalReferrer && { referrer: externalReferrer }),
              landingPage: cap(href),
              at,
              seenAt: at,
          }
        : previous
          ? { ...previous, seenAt: at }
          : // A continuation with nothing stored: storage cleared mid-visit,
            // or a click over from the ads page on `book.` (its own
            // origin, its own storage). Keep where it landed, with no
            // referrer; the first touch waits for a real entry.
            { landingPage: cap(href), at, seenAt: at }

    let firstTouch = asFirstTouch(readJson(local, FIRST_TOUCH_KEY))
    let stored = true
    if (lastVisit) stored = writeJson(local, LAST_VISIT_KEY, lastVisit)
    if (!firstTouch && isNewVisit && lastVisit) {
        const { source, medium } = classifyTouch({
            ...campaign,
            referrer: externalReferrer,
        })
        firstTouch = {
            // UTMs are whatever the link said; the API takes 100 characters.
            source: source.slice(0, 100),
            medium: medium.slice(0, 100),
            ...(campaign.utmCampaign && {
                campaign: campaign.utmCampaign.slice(0, 200),
            }),
            ...(externalReferrer && { referrer: externalReferrer }),
            landingPage: lastVisit.landingPage,
            at,
        }
        stored = writeJson(local, FIRST_TOUCH_KEY, firstTouch) && stored
    }
    try {
        session?.setItem(VISIT_RECORDED_KEY, at)
    } catch {
        // Without session storage every page looks like a tab's first one;
        // the internal-referrer and 30-minute rules still hold the visit.
    }

    const result: VisitResult = { isNewVisit, lastVisit, firstTouch }
    memory = stored ? null : result
    return result
}

/**
 * The latest visit's referrer and landing page and the first touch, for a
 * lead about to be sent. Empty when nothing was recorded.
 */
export function readVisitAttribution(
    local: StorageLike | null
): VisitAttribution {
    const lastVisit =
        asLastVisit(readJson(local, LAST_VISIT_KEY)) ?? memory?.lastVisit
    const firstTouch =
        asFirstTouch(readJson(local, FIRST_TOUCH_KEY)) ?? memory?.firstTouch
    return {
        ...(lastVisit?.referrer && { referrer: lastVisit.referrer }),
        ...(lastVisit && { landingPage: lastVisit.landingPage }),
        ...(firstTouch && { firstTouch }),
    }
}

/**
 * The attribution a lead is sent with: the stored campaign (UTMs and click
 * ids, kept until the next campaign landing), the latest visit's referrer and
 * landing page, and the first touch.
 *
 * The latest visit owns `referrer` and `landingPage` together, so a direct
 * visit today never pairs with last week's ad referrer. Only when no visit
 * was recorded do the campaign record's own two stand in. Empty values are
 * left out rather than sent as `undefined`, so they never blank out what a
 * form set itself.
 */
export function leadAttributionFields(
    utm: UTMData | null,
    visit: VisitAttribution
): Record<string, unknown> {
    const { referrer, landingPage, ...campaign } = utm ?? {}
    const latest = visit.landingPage
        ? { referrer: visit.referrer, landingPage: visit.landingPage }
        : { referrer, landingPage }
    const fields: Record<string, unknown> = {}
    for (const [key, value] of Object.entries({ ...campaign, ...latest })) {
        if (typeof value === 'string' && value) fields[key] = value
    }
    if (visit.firstTouch) fields.firstTouch = visit.firstTouch
    return fields
}

/** `localStorage` or `sessionStorage`, or null where reading it throws. */
export function browserStorage(kind: 'local' | 'session'): StorageLike | null {
    if (typeof window === 'undefined') return null
    try {
        return kind === 'local' ? window.localStorage : window.sessionStorage
    } catch {
        return null
    }
}
