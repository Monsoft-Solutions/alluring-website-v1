import { describe, expect, it } from 'vitest'

import {
    FIRST_TOUCH_KEY,
    LAST_VISIT_KEY,
    leadAttributionFields,
    readVisitAttribution,
    recordVisit,
    type StorageLike,
    VISIT_RECORDED_KEY,
} from '@/lib/analytics/visit-attribution'

/** An in-memory `Storage`. */
function memoryStorage(): StorageLike & { data: Map<string, string> } {
    const data = new Map<string, string>()
    return {
        data,
        getItem: (key) => data.get(key) ?? null,
        setItem: (key, value) => void data.set(key, value),
        removeItem: (key) => void data.delete(key),
    }
}

const SITE = 'www.alluringplasticsurgery.com'
const HOME = `https://${SITE}/`
const at = (iso: string) => new Date(iso)

/** One browser: localStorage shared by its tabs, one sessionStorage per tab. */
function browser() {
    const local = memoryStorage()
    const tab = () => {
        const session = memoryStorage()
        return (href: string, referrer: string, now: Date) =>
            recordVisit({ href, referrer, siteHost: SITE, now, local, session })
    }
    return { local, tab }
}

describe('recordVisit: the first page of a visit (#350)', () => {
    it('stores the external referrer and landing page even without params', () => {
        const { local, tab } = browser()
        const result = tab()(
            `${HOME}procedures/bbl`,
            'https://www.google.com/',
            at('2026-10-20T14:00:00Z')
        )
        expect(result.isNewVisit).toBe(true)
        expect(readVisitAttribution(local)).toEqual({
            referrer: 'https://www.google.com/',
            landingPage: `${HOME}procedures/bbl`,
            firstTouch: {
                source: 'google',
                medium: 'organic',
                referrer: 'https://www.google.com/',
                landingPage: `${HOME}procedures/bbl`,
                at: '2026-10-20T14:00:00.000Z',
            },
        })
    })

    it('records once per session: later pages leave the visit as it began', () => {
        const { local, tab } = browser()
        const page = tab()
        page(HOME, 'https://www.instagram.com/', at('2026-10-20T14:00:00Z'))
        const later = page(
            `${HOME}gallery`,
            'https://www.instagram.com/',
            at('2026-10-20T14:05:00Z')
        )
        expect(later.isNewVisit).toBe(false)
        expect(readVisitAttribution(local).landingPage).toBe(HOME)
        expect(local.data.has(LAST_VISIT_KEY)).toBe(true)
    })

    it('ignores internal referrers, the ads subdomain included', () => {
        const { local, tab } = browser()
        tab()(HOME, 'https://chatgpt.com/', at('2026-10-20T14:00:00Z'))
        for (const referrer of [
            `${HOME}procedures/bbl`,
            'https://alluringplasticsurgery.com/specials',
            'https://book.alluringplasticsurgery.com/lp/request-consultation',
        ]) {
            const result = tab()(
                `${HOME}contact-us`,
                referrer,
                at('2026-10-21T09:00:00Z')
            )
            expect(result.isNewVisit).toBe(false)
        }
        expect(readVisitAttribution(local)).toMatchObject({
            referrer: 'https://chatgpt.com/',
            landingPage: HOME,
        })
    })

    it('never overwrites the first touch', () => {
        const { local, tab } = browser()
        tab()(HOME, 'https://www.perplexity.ai/', at('2026-10-01T12:00:00Z'))
        const before = local.data.get(FIRST_TOUCH_KEY)
        tab()(
            `${HOME}lp/request-consultation?utm_source=google&utm_medium=cpc&utm_campaign=bbl&gclid=abc`,
            'https://www.google.com/',
            at('2026-10-20T12:00:00Z')
        )
        expect(local.data.get(FIRST_TOUCH_KEY)).toBe(before)
        const visit = readVisitAttribution(local)
        expect(visit.firstTouch).toMatchObject({
            source: 'perplexity',
            medium: 'ai',
            at: '2026-10-01T12:00:00.000Z',
        })
        // The latest visit moved on to the ad click.
        expect(visit.landingPage).toContain('gclid=abc')
    })

    it('files the first touch by its campaign when the URL has one', () => {
        const { local, tab } = browser()
        tab()(`${HOME}?utm_source=chatgpt.com`, '', at('2026-10-20T12:00:00Z'))
        expect(readVisitAttribution(local).firstTouch).toMatchObject({
            source: 'chatgpt',
            medium: 'ai',
        })
        const ads = browser()
        ads.tab()(
            `${HOME}?gclid=xyz&utm_campaign=%7Bcampaignname%7D`,
            '',
            at('2026-10-20T12:00:00Z')
        )
        const first = readVisitAttribution(ads.local).firstTouch
        expect(first).toMatchObject({ source: 'google', medium: 'cpc' })
        expect(first).not.toHaveProperty('campaign')
    })

    it('treats a direct arrival within 30 minutes as the same visit', () => {
        const { local, tab } = browser()
        tab()(HOME, 'https://www.google.com/', at('2026-10-20T14:00:00Z'))
        // A legal link opened in a new tab arrives with no referrer.
        expect(
            tab()(`${HOME}privacy`, '', at('2026-10-20T14:10:00Z')).isNewVisit
        ).toBe(false)
        expect(readVisitAttribution(local).referrer).toBe(
            'https://www.google.com/'
        )
        // Hours later, the same direct arrival is a new, direct visit.
        expect(tab()(HOME, '', at('2026-10-20T18:00:00Z')).isNewVisit).toBe(
            true
        )
        const visit = readVisitAttribution(local)
        expect(visit.referrer).toBeUndefined()
        expect(visit.landingPage).toBe(HOME)
        expect(visit.firstTouch?.source).toBe('google')
    })

    it('marks the tab, so a reload is not a new visit', () => {
        const { tab } = browser()
        const page = tab()
        page(HOME, 'https://www.bing.com/', at('2026-10-20T14:00:00Z'))
        expect(
            page(HOME, 'https://www.bing.com/', at('2026-10-20T14:01:00Z'))
                .isNewVisit
        ).toBe(false)
    })

    it('keeps the landing page of a continuation it has no visit for, but no first touch', () => {
        // A click over from the ads page on `book.`: its own origin and
        // storage, so www has nothing stored for the visit.
        const { local, tab } = browser()
        const result = tab()(
            `${HOME}privacy`,
            'https://book.alluringplasticsurgery.com/lp/request-consultation',
            at('2026-10-20T14:00:00Z')
        )
        expect(result.isNewVisit).toBe(false)
        expect(readVisitAttribution(local)).toEqual({
            landingPage: `${HOME}privacy`,
        })
    })

    it('caps a long UTM source and medium to what the API accepts', () => {
        const { local, tab } = browser()
        const long = 'x'.repeat(300)
        tab()(
            `${HOME}?utm_source=${long}&utm_medium=${long}`,
            '',
            at('2026-10-20T14:00:00Z')
        )
        const first = readVisitAttribution(local).firstTouch
        expect(first?.source).toHaveLength(100)
        expect(first?.medium).toHaveLength(100)
    })

    it('survives storage that throws', () => {
        const broken: StorageLike = {
            getItem: () => {
                throw new Error('blocked')
            },
            setItem: () => {
                throw new Error('blocked')
            },
            removeItem: () => {},
        }
        const result = recordVisit({
            href: HOME,
            referrer: 'https://www.google.com/',
            siteHost: SITE,
            now: at('2026-10-20T14:00:00Z'),
            local: broken,
            session: broken,
        })
        expect(result.isNewVisit).toBe(true)
        // Kept in memory for this page view.
        expect(readVisitAttribution(null)).toMatchObject({
            referrer: 'https://www.google.com/',
            landingPage: HOME,
        })
    })

    it('sets the session marker', () => {
        const local = memoryStorage()
        const session = memoryStorage()
        recordVisit({
            href: HOME,
            referrer: '',
            siteHost: SITE,
            now: at('2026-10-20T14:00:00Z'),
            local,
            session,
        })
        expect(session.data.has(VISIT_RECORDED_KEY)).toBe(true)
    })
})

describe('leadAttributionFields', () => {
    const firstTouch = {
        source: 'google',
        medium: 'organic',
        landingPage: HOME,
        at: '2026-10-01T12:00:00.000Z',
    }

    it('pairs the latest visit’s referrer and landing page, never last week’s ad referrer', () => {
        const fields = leadAttributionFields(
            {
                utmSource: 'google',
                utmMedium: 'cpc',
                gclid: 'abc',
                referrer: 'https://www.google.com/',
                landingPage: `${HOME}?gclid=abc`,
            },
            { landingPage: `${HOME}gallery`, firstTouch }
        )
        expect(fields).toEqual({
            utmSource: 'google',
            utmMedium: 'cpc',
            gclid: 'abc',
            landingPage: `${HOME}gallery`,
            firstTouch,
        })
    })

    it('falls back to the campaign record’s pair when no visit was recorded', () => {
        expect(
            leadAttributionFields(
                { referrer: 'https://x.com/', landingPage: HOME },
                {}
            )
        ).toEqual({ referrer: 'https://x.com/', landingPage: HOME })
    })

    it('leaves empty values out, so they never blank a form’s own', () => {
        expect(
            leadAttributionFields(
                { utmSource: undefined, gclid: '' } as never,
                {}
            )
        ).toEqual({})
    })
})
