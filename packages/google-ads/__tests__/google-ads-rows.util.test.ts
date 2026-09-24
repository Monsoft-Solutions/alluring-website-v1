import { describe, expect, it } from 'vitest'

import {
    flattenRow,
    normalizeField,
    toGaqlFieldName,
} from '../src/google-ads-rows.util'

describe('toGaqlFieldName', () => {
    it('snake-cases every segment of a REST path', () => {
        expect(toGaqlFieldName('clickView.keywordInfo.matchType')).toBe(
            'click_view.keyword_info.match_type'
        )
        expect(toGaqlFieldName('metrics.costMicros')).toBe(
            'metrics.cost_micros'
        )
    })
})

describe('normalizeField', () => {
    it('converts *_micros to currency and drops the suffix', () => {
        expect(normalizeField('metrics.cost_micros', '635094000')).toEqual([
            'metrics.cost',
            635.09,
        ])
        expect(
            normalizeField('campaign_budget.amount_micros', '26000000')
        ).toEqual(['campaign_budget.amount', 26])
    })

    it('converts micros metrics that carry no suffix', () => {
        // Values captured from the live API on 2026-09-24.
        expect(
            normalizeField('metrics.average_cpc', 6048514.2857142854)
        ).toEqual(['metrics.average_cpc', 6.05])
        expect(
            normalizeField('metrics.cost_per_conversion', 127018800)
        ).toEqual(['metrics.cost_per_conversion', 127.02])
    })

    it('fills omitted metrics with 0 and omitted attributes with null', () => {
        expect(normalizeField('metrics.impressions', undefined)).toEqual([
            'metrics.impressions',
            0,
        ])
        expect(normalizeField('metrics.cost_micros', undefined)).toEqual([
            'metrics.cost',
            0,
        ])
        expect(normalizeField('campaign.name', undefined)).toEqual([
            'campaign.name',
            null,
        ])
        expect(
            normalizeField('campaign_budget.amount_micros', undefined)
        ).toEqual(['campaign_budget.amount', null])
    })

    it('turns int64 metric strings into numbers but leaves ids as strings', () => {
        expect(normalizeField('metrics.clicks', '105')).toEqual([
            'metrics.clicks',
            105,
        ])
        expect(normalizeField('campaign.id', '24217440953')).toEqual([
            'campaign.id',
            '24217440953',
        ])
    })

    it('rounds float metrics to four decimals', () => {
        expect(normalizeField('metrics.ctr', 0.0234567891)).toEqual([
            'metrics.ctr',
            0.0235,
        ])
    })
})

describe('flattenRow', () => {
    it('emits exactly the fields in the mask, including omitted zeros', () => {
        const row = {
            campaign: {
                resourceName: 'customers/1/campaigns/2',
                name: 'Search_Brand_2026HD',
            },
            metrics: { clicks: '46', costMicros: '322530000' },
        }
        expect(
            flattenRow(
                row,
                'campaign.name,metrics.clicks,metrics.costMicros,metrics.conversions'
            )
        ).toEqual({
            'campaign.name': 'Search_Brand_2026HD',
            'metrics.clicks': 46,
            'metrics.cost': 322.53,
            'metrics.conversions': 0,
        })
    })

    it('joins repeated scalars and falls back to every leaf without a mask', () => {
        const row = {
            adGroupAd: { resourceName: 'x', ad: { finalUrls: ['a', 'b'] } },
        }
        expect(flattenRow(row)).toEqual({
            'ad_group_ad.ad.final_urls': 'a, b',
        })
    })
})
