/**
 * Tests for the shared landing-URL parser (epic #288, phase 0): the website
 * stores what it returns at capture time and the Ads console's click
 * resolver reads stored URLs with it, so both must agree on what a URL holds.
 */
import { describe, expect, it } from 'vitest'

import {
    extractLandingParams,
    parseLandingUrl,
    readAttributionParam,
    stripPlaceholders,
} from '@workspace/shared/attribution'

// The tracking template's shape: a placeholder copy of each UTM first, then
// the clean copy; ValueTrack params expanded; gclid appended by auto-tagging.
const HEYDAY_URL =
    'https://www.alluringplasticsurgery.com/lp/request-consultation' +
    '?utm_source=google&utm_medium=cpc{ifvideo:video}{ifshopping:shopping}' +
    '&utm_campaign={campaignname}&utm_id=24211727880&utm_adgroup={adgroupname}' +
    '&keyword=breast%20augmentation%20miami&matchtype=b&network=g&device=m' +
    '&utm_medium=cpc&gad_source=1&gad_campaignid=24211727880' +
    '&gbraid=0AAAAA-braid&gclid=Cj0KCQjw-gclid'

describe('stripPlaceholders', () => {
    it('drops unexpanded template tokens', () => {
        expect(
            stripPlaceholders('cpc{ifvideo:video}{ifshopping:shopping}')
        ).toBe('cpc')
        expect(stripPlaceholders('{campaignname}')).toBeUndefined()
        expect(stripPlaceholders('{{adset.name}}')).toBeUndefined()
        expect(stripPlaceholders(null)).toBeUndefined()
    })
})

describe('readAttributionParam', () => {
    it('prefers a clean repeated copy over a placeholder one', () => {
        const params = new URLSearchParams(
            'utm_medium=cpc{ifvideo:video}&utm_medium=cpc'
        )
        expect(readAttributionParam(params, 'utm_medium')).toBe('cpc')
    })

    it('falls back to the stripped first copy', () => {
        const params = new URLSearchParams('utm_medium=paid{ifvideo:video}')
        expect(readAttributionParam(params, 'utm_medium')).toBe('paid')
    })
})

describe('parseLandingUrl', () => {
    it('reads click ids and ValueTrack params from a tagged ad URL', () => {
        const parsed = parseLandingUrl(HEYDAY_URL)
        expect(parsed.clickIds).toEqual({
            gclid: 'Cj0KCQjw-gclid',
            gbraid: '0AAAAA-braid',
            gadCampaignId: '24211727880',
        })
        expect(parsed.params).toEqual({
            keyword: 'breast augmentation miami',
            matchtype: 'b',
            network: 'g',
            device: 'm',
            gad_source: '1',
            utm_id: '24211727880',
        })
    })

    it('keeps an unexpanded {gclid} out of the click ids', () => {
        const parsed = parseLandingUrl(
            'https://x.com/?gclid={gclid}&keyword={keyword}'
        )
        expect(parsed.clickIds).toEqual({})
        expect(parsed.params).toEqual({})
    })

    it('ignores a non-numeric gad_campaignid', () => {
        expect(
            parseLandingUrl('https://x.com/?gad_campaignid={campaignid}')
                .clickIds
        ).toEqual({})
    })

    it('parses relative paths and never throws on junk', () => {
        expect(parseLandingUrl('/lp?gclid=abc').clickIds.gclid).toBe('abc')
        expect(parseLandingUrl('not a url at all').clickIds).toEqual({})
        expect(parseLandingUrl(null)).toEqual({ clickIds: {}, params: {} })
        expect(parseLandingUrl('')).toEqual({ clickIds: {}, params: {} })
    })
})

describe('extractLandingParams', () => {
    it('returns undefined (a NULL column) when the URL carries none', () => {
        expect(extractLandingParams('https://x.com/?gclid=abc')).toBeUndefined()
        expect(extractLandingParams(undefined)).toBeUndefined()
    })

    it('returns the params when present', () => {
        expect(
            extractLandingParams('https://x.com/?keyword=tummy+tuck')
        ).toEqual({
            keyword: 'tummy tuck',
        })
    })
})
