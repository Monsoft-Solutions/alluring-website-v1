/**
 * Tests for the lead → ad click match ladder (epic #288).
 *
 * The ladder decides what every Ads console screen counts as a paid lead and
 * which campaign gets it, so each rung and each retry state is pinned here.
 */
import { describe, expect, it } from 'vitest'

import {
    assessLead,
    CLICK_VIEW_RETENTION_DAYS,
    daysSince,
    decideMatch,
    RETRY_WINDOW_DAYS,
    type ClickDetails,
    type LeadForMatching,
} from '@/lib/utils/ads/lead-ad-match.util'

const EMPTY: LeadForMatching = {
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    source: 'landing-page',
    referrer: null,
    gclid: null,
    gbraid: null,
    wbraid: null,
    gadCampaignId: null,
    fbclid: null,
    ttclid: null,
    landingPage: null,
    landingParams: null,
}

const lead = (overrides: Partial<LeadForMatching>): LeadForMatching => ({
    ...EMPTY,
    ...overrides,
})

const CLICK: ClickDetails = {
    date: '2026-09-21',
    campaignId: '24217440953',
    campaignName: 'Search_Brand_2026HD',
    adGroupId: '111',
    adGroupName: 'Ad group 1',
    keyword: 'cosmetic surgery financing options',
    keywordMatchType: 'BROAD',
    device: 'MOBILE',
    network: 'SEARCH',
}

describe('assessLead — who is a paid Google lead', () => {
    it('reads a gclid from its column first', () => {
        const result = assessLead(
            lead({ gclid: 'col-gclid', landingPage: '/lp?gclid=url-gclid' })
        )
        expect(result?.clickId).toEqual({
            type: 'gclid',
            id: 'col-gclid',
            source: 'column',
        })
    })

    it('recovers a gclid the column lost from the landing URL (#276)', () => {
        const result = assessLead(
            lead({
                landingPage:
                    'https://www.alluringplasticsurgery.com/lp/request-consultation?gclid=url-gclid&utm_medium=cpc{ifvideo:video}',
            })
        )
        expect(result?.clickId).toEqual({
            type: 'gclid',
            id: 'url-gclid',
            source: 'landing_url',
        })
        expect(result?.landingPath).toBe('/lp/request-consultation')
    })

    it('prefers a gclid over a gbraid when both came', () => {
        const result = assessLead(lead({ gclid: 'g', gbraid: 'b' }))
        expect(result?.clickId?.type).toBe('gclid')
    })

    it('takes gbraid, then wbraid, when there is no gclid', () => {
        expect(assessLead(lead({ gbraid: 'b' }))?.clickId?.type).toBe('gbraid')
        expect(assessLead(lead({ wbraid: 'w' }))?.clickId?.type).toBe('wbraid')
    })

    it('ignores a placeholder click id', () => {
        expect(assessLead(lead({ gclid: '{gclid}' }))).toBeNull()
    })

    it('counts a gad_campaignid or numeric utm_id alone as paid', () => {
        expect(
            assessLead(lead({ gadCampaignId: '24211727880' }))?.campaignIdHint
        ).toBe('24211727880')
        expect(
            assessLead(lead({ landingPage: '/?utm_id=23781718244' }))
                ?.campaignIdHint
        ).toBe('23781718244')
        expect(
            assessLead(lead({ landingParams: { utm_id: '123' } }))
                ?.campaignIdHint
        ).toBe('123')
    })

    it('counts google/cpc tags without a click id, even with template debris', () => {
        const result = assessLead(
            lead({
                utmSource: 'google',
                utmMedium: 'cpc{ifvideo:video}{ifshopping:shopping}',
                utmCampaign: '{campaignname}',
            })
        )
        expect(result).not.toBeNull()
        expect(result?.clickId).toBeNull()
        expect(result?.utmCampaign).toBeNull()
    })

    it('excludes Google organic and Business Profile links', () => {
        expect(
            assessLead(lead({ utmSource: 'google', utmMedium: 'organic' }))
        ).toBeNull()
        expect(
            assessLead(
                lead({ referrer: 'https://www.google.com/', utmSource: null })
            )
        ).toBeNull()
    })

    it('excludes Meta and untagged leads', () => {
        expect(
            assessLead(
                lead({ utmSource: 'facebook', utmMedium: 'paid', fbclid: 'x' })
            )
        ).toBeNull()
        expect(assessLead(EMPTY)).toBeNull()
    })
})

describe('decideMatch — the ladder', () => {
    const gclidLead = assessLead(lead({ gclid: 'abc' }))!
    const gclidWithCampaign = assessLead(
        lead({ gclid: 'abc', gadCampaignId: '999' })
    )!

    it('click: the report found the gclid', () => {
        expect(
            decideMatch(gclidLead, {
                leadAgeDays: 0,
                click: CLICK,
                lookedUp: true,
            })
        ).toEqual({
            match: 'click',
            campaignId: CLICK.campaignId,
            click: CLICK,
            final: true,
        })
    })

    it('not_found while fresh keeps retrying', () => {
        const decision = decideMatch(gclidLead, {
            leadAgeDays: 1,
            click: null,
            lookedUp: true,
        })
        expect(decision.match).toBe('not_found')
        expect(decision.final).toBe(false)
    })

    it('holds the campaign fallback while retrying, then settles on it', () => {
        const fresh = decideMatch(gclidWithCampaign, {
            leadAgeDays: 0,
            click: null,
            lookedUp: true,
        })
        expect(fresh).toMatchObject({
            match: 'campaign',
            campaignId: '999',
            final: false,
        })
        const settled = decideMatch(gclidWithCampaign, {
            leadAgeDays: RETRY_WINDOW_DAYS,
            click: null,
            lookedUp: true,
        })
        expect(settled).toMatchObject({ match: 'campaign', final: true })
    })

    it('not_found becomes final after the retry window', () => {
        expect(
            decideMatch(gclidLead, {
                leadAgeDays: RETRY_WINDOW_DAYS,
                click: null,
                lookedUp: true,
            })
        ).toMatchObject({ match: 'not_found', final: true })
    })

    it('expired: a gclid lead older than the click report', () => {
        expect(
            decideMatch(gclidLead, {
                leadAgeDays: CLICK_VIEW_RETENTION_DAYS,
                click: null,
                lookedUp: false,
            })
        ).toMatchObject({ match: 'expired', final: true })
        expect(
            decideMatch(gclidWithCampaign, {
                leadAgeDays: CLICK_VIEW_RETENTION_DAYS + 30,
                click: null,
                lookedUp: false,
            })
        ).toMatchObject({ match: 'campaign', campaignId: '999', final: true })
    })

    it('ios_click: gbraid / wbraid only, campaign kept when known', () => {
        const ios = assessLead(lead({ gbraid: 'b', gadCampaignId: '777' }))!
        expect(
            decideMatch(ios, { leadAgeDays: 0, click: null, lookedUp: false })
        ).toEqual({
            match: 'ios_click',
            campaignId: '777',
            click: null,
            final: true,
        })
    })

    it('campaign: no click id, a campaign id on the URL', () => {
        const campaignOnly = assessLead(lead({ gadCampaignId: '555' }))!
        expect(
            decideMatch(campaignOnly, {
                leadAgeDays: 0,
                click: null,
                lookedUp: false,
            })
        ).toMatchObject({ match: 'campaign', campaignId: '555', final: true })
    })

    it('tagged_only, unless utm_campaign names a known campaign', () => {
        const tagged = assessLead(
            lead({
                utmSource: 'google',
                utmMedium: 'cpc',
                utmCampaign: 'Search_Brand_2026HD',
            })
        )!
        expect(
            decideMatch(tagged, {
                leadAgeDays: 0,
                click: null,
                lookedUp: false,
            })
        ).toMatchObject({ match: 'tagged_only', campaignId: null })
        expect(
            decideMatch(tagged, {
                leadAgeDays: 0,
                click: null,
                lookedUp: false,
                campaignIdByName: new Map([
                    ['Search_Brand_2026HD', '24217440953'],
                ]),
            })
        ).toMatchObject({ match: 'campaign', campaignId: '24217440953' })
    })
})

describe('daysSince', () => {
    it('counts whole calendar days', () => {
        expect(daysSince('2026-09-24', '2026-09-24')).toBe(0)
        expect(daysSince('2026-09-21', '2026-09-24')).toBe(3)
        expect(daysSince('2026-06-26', '2026-09-24')).toBe(90)
    })
})
