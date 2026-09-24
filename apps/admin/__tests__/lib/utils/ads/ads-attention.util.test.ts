/**
 * Tests for the Ads console's attention rules (epic #288), using the
 * account's real 11–23 Sep 2026 numbers from the plan where they exist.
 */
import { describe, expect, it } from 'vitest'

import {
    consecutiveRuns,
    costPerLead,
    cplAlerts,
    noLeadStreakAlerts,
    overspendAlerts,
    silentActionAlerts,
    trackingGapAlert,
    type TrackingDay,
} from '@/lib/utils/ads/ads-attention.util'

describe('costPerLead', () => {
    it('divides, or is null with no leads', () => {
        expect(costPerLead(2064.81, 13)).toBe(158.83)
        expect(costPerLead(100, 0)).toBeNull()
    })
})

describe('consecutiveRuns', () => {
    it('groups adjacent days, across a month end', () => {
        expect(
            consecutiveRuns([
                '2026-09-16',
                '2026-09-14',
                '2026-09-15',
                '2026-09-30',
                '2026-10-01',
                '2026-10-05',
            ])
        ).toEqual([
            ['2026-09-14', '2026-09-15', '2026-09-16'],
            ['2026-09-30', '2026-10-01'],
            ['2026-10-05'],
        ])
    })
})

describe('cplAlerts', () => {
    const baseline = 51 // the older Search campaigns since 28 Jun

    it('flags a campaign over 2× the baseline once the sample is big enough', () => {
        const items = cplAlerts(
            [
                {
                    campaignId: '1',
                    campaignName: 'Search_Services_2026HD',
                    cost: 653.17,
                    leads: 1,
                },
                {
                    campaignId: '2',
                    campaignName: 'Search_Brand_2026HD',
                    cost: 635.09,
                    leads: 6,
                },
                { campaignId: '3', campaignName: 'Tiny', cost: 120, leads: 1 },
            ],
            baseline
        )
        expect(items.map((item) => item.id)).toEqual(['cpl-1', 'cpl-2'])
        expect(items[0]!.detail).toContain('small sample')
        expect(items[1]!.detail).not.toContain('small sample')
    })

    it('flags spend with no lead at all only past the spend floor', () => {
        const items = cplAlerts(
            [
                { campaignId: '1', campaignName: 'A', cost: 377.35, leads: 0 },
                { campaignId: '2', campaignName: 'B', cost: 90, leads: 0 },
            ],
            baseline
        )
        expect(items).toHaveLength(1)
        expect(items[0]!.title).toBe('A: $377.35 with no lead.')
    })

    it('stays quiet at or under 2× and without a baseline', () => {
        expect(
            cplAlerts(
                [{ campaignId: '1', campaignName: 'A', cost: 400, leads: 4 }],
                baseline
            )
        ).toEqual([])
        expect(
            cplAlerts(
                [{ campaignId: '1', campaignName: 'A', cost: 999, leads: 1 }],
                null
            )
        ).toEqual([])
    })
})

describe('overspendAlerts', () => {
    it('reproduces "2× the daily budget on 14–16 Sep"', () => {
        const items = overspendAlerts([
            { date: '2026-09-13', cost: 30.75, budget: 168 },
            { date: '2026-09-14', cost: 335.87, budget: 168 },
            { date: '2026-09-15', cost: 339.6, budget: 168 },
            { date: '2026-09-16', cost: 333.91, budget: 168 },
            { date: '2026-09-17', cost: 178.35, budget: 168 },
        ])
        expect(items).toHaveLength(1)
        expect(items[0]!.title).toBe(
            'Spent 2× the daily budget on 14 Sep–16 Sep'
        )
        expect(items[0]!.detail).toContain('$336, $340, $334 against $168')
    })

    it('ignores days without a budget', () => {
        expect(
            overspendAlerts([{ date: '2026-09-14', cost: 900, budget: null }])
        ).toEqual([])
    })
})

describe('noLeadStreakAlerts', () => {
    const day = (date: string, cost: number, leads: number) => ({
        date,
        campaignId: '1',
        campaignName: 'PMax_35-54_2026HD',
        cost,
        leads,
    })

    it('flags 5+ days of spend with no lead', () => {
        const items = noLeadStreakAlerts([
            day('2026-09-12', 20, 0),
            day('2026-09-13', 20, 0),
            day('2026-09-14', 20, 0),
            day('2026-09-15', 20, 0),
            day('2026-09-16', 20, 0),
        ])
        expect(items).toHaveLength(1)
        expect(items[0]!.title).toBe(
            'PMax_35-54_2026HD: 5 days of spend with no lead'
        )
        expect(items[0]!.detail).toBe('$100.00 on 12 Sep–16 Sep.')
    })

    it('a lead day breaks the streak', () => {
        expect(
            noLeadStreakAlerts([
                day('2026-09-12', 20, 0),
                day('2026-09-13', 20, 0),
                day('2026-09-14', 20, 1),
                day('2026-09-15', 20, 0),
                day('2026-09-16', 20, 0),
            ])
        ).toEqual([])
    })
})

describe('trackingGapAlert', () => {
    const days = (pairs: [number, number][]): TrackingDay[] =>
        pairs.map(([formConversions, paidLeads], i) => ({
            date: `2026-09-${String(17 + i).padStart(2, '0')}`,
            formConversions,
            paidLeads,
        }))

    it('raises "8 counted against 13 leads"', () => {
        const item = trackingGapAlert(
            days([
                [2, 3],
                [1, 2],
                [1, 2],
                [2, 3],
                [1, 2],
                [1, 1],
                [0, 0],
            ])
        )
        expect(item?.title).toBe(
            'Google counted 8 form conversions against 13 paid leads.'
        )
    })

    it('stays quiet within 30% or on a tiny sample', () => {
        expect(trackingGapAlert(days([[10, 12]]))).toBeNull()
        expect(trackingGapAlert(days([[0, 2]]))).toBeNull()
    })

    it('only reads the last 7 days', () => {
        const window = days([
            [0, 20], // old day, outside the last 7
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 1],
        ])
        expect(trackingGapAlert(window)).toBeNull()
    })
})

describe('silentActionAlerts', () => {
    const tracking: TrackingDay[] = ['20', '21', '22', '23'].map((d) => ({
        date: `2026-09-${d}`,
        formConversions: 0,
        paidLeads: 1,
    }))

    it('flags an action that counted before and then stopped', () => {
        const items = silentActionAlerts(
            [
                {
                    date: '2026-09-20',
                    actionId: 'a',
                    actionName: 'Submit Lead Form',
                    conversions: 2,
                },
            ],
            tracking
        )
        expect(items).toHaveLength(1)
        expect(items[0]!.title).toContain('Submit Lead Form')
    })

    it('ignores actions that never counted, or still count', () => {
        expect(
            silentActionAlerts(
                [
                    {
                        date: '2026-09-20',
                        actionId: 'a',
                        actionName: 'A',
                        conversions: 0,
                    },
                    {
                        date: '2026-09-20',
                        actionId: 'b',
                        actionName: 'B',
                        conversions: 1,
                    },
                    {
                        date: '2026-09-23',
                        actionId: 'b',
                        actionName: 'B',
                        conversions: 1,
                    },
                ],
                tracking
            )
        ).toEqual([])
    })
})
