import { describe, it, expect } from 'vitest'
import { classifyLeadAttribution } from '@/lib/analytics/classify-lead-attribution'
import type { LeadAttributionInput } from '@/lib/types/analytics/lead-trends.type'

const emptyInput: LeadAttributionInput = {
    utmSource: null,
    utmMedium: null,
    source: null,
    referrer: null,
    gclid: null,
    fbclid: null,
    ttclid: null,
}

describe('classifyLeadAttribution', () => {
    describe('UTM priority', () => {
        it('uses utm_source + utm_medium when both present', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                utmSource: 'google',
                utmMedium: 'cpc',
            })
            expect(result).toEqual({
                source: 'google',
                medium: 'cpc',
                classification: 'utm',
            })
        })

        it('lowercases and trims UTM values', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                utmSource: '  GOOGLE  ',
                utmMedium: '  CPC  ',
            })
            expect(result.source).toBe('google')
            expect(result.medium).toBe('cpc')
        })

        it('does not use UTM when utm_medium is missing', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                utmSource: 'google',
                utmMedium: null,
                gclid: 'abc',
            })
            expect(result.classification).toBe('click-id')
        })

        it('does not use UTM when either value is empty string', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                utmSource: '',
                utmMedium: 'cpc',
            })
            expect(result.classification).toBe('direct')
        })
    })

    describe('Click ID priority', () => {
        it('classifies gclid as google/cpc', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                gclid: 'abc',
            })
            expect(result).toEqual({
                source: 'google',
                medium: 'cpc',
                classification: 'click-id',
            })
        })

        it('classifies fbclid as facebook/paid', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                fbclid: 'x',
            })
            expect(result).toEqual({
                source: 'facebook',
                medium: 'paid',
                classification: 'click-id',
            })
        })

        it('classifies ttclid as tiktok/paid', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                ttclid: 'x',
            })
            expect(result).toEqual({
                source: 'tiktok',
                medium: 'paid',
                classification: 'click-id',
            })
        })

        it('prefers gclid over referrer', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                gclid: 'x',
                referrer: 'https://www.facebook.com/',
            })
            expect(result.source).toBe('google')
        })
    })

    describe('Referrer priority', () => {
        it('classifies google.com as google/organic', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://www.google.com/search?q=foo',
            })
            expect(result).toEqual({
                source: 'google',
                medium: 'organic',
                classification: 'referrer',
            })
        })

        it('classifies google.co.uk as google/organic', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://www.google.co.uk/',
            })
            expect(result.source).toBe('google')
            expect(result.medium).toBe('organic')
        })

        it('classifies facebook.com as facebook/social', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://www.facebook.com/',
            })
            expect(result).toEqual({
                source: 'facebook',
                medium: 'social',
                classification: 'referrer',
            })
        })

        it('classifies x.com as twitter/social', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://x.com/home',
            })
            expect(result.source).toBe('twitter')
            expect(result.medium).toBe('social')
        })

        it('classifies youtu.be as youtube/social', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://youtu.be/abc',
            })
            expect(result.source).toBe('youtube')
        })

        it('maps unknown hosts to referral/<host>', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://nytimes.com/article/123',
            })
            expect(result).toEqual({
                source: 'referral/nytimes.com',
                medium: 'referral',
                classification: 'referrer',
            })
        })

        it('strips www. from unknown hosts', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://www.somepressblog.com/',
            })
            expect(result.source).toBe('referral/somepressblog.com')
        })

        it('falls through on malformed referrer URL', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'not a url',
            })
            expect(result.classification).toBe('direct')
        })

        it('falls through on javascript: URL', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'javascript:void(0)',
            })
            expect(result.classification).toBe('direct')
        })
    })

    describe('Source-field fallback', () => {
        it('uses legacy source field when nothing else matches', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                source: 'Newsletter',
            })
            expect(result).toEqual({
                source: 'newsletter',
                medium: '(none)',
                classification: 'source-field',
            })
        })

        it('trims whitespace from source field', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                source: '  partner  ',
            })
            expect(result.source).toBe('partner')
        })

        it('treats empty source field as direct', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                source: '',
            })
            expect(result.classification).toBe('direct')
        })
    })

    describe('Default direct', () => {
        it('classifies empty input as direct', () => {
            expect(classifyLeadAttribution(emptyInput)).toEqual({
                source: 'direct',
                medium: 'direct',
                classification: 'direct',
            })
        })
    })
})
