/**
 * Tests for the Ads console's display helpers (epic #288).
 */
import { describe, expect, it } from 'vitest'

import {
    costPerLeadTone,
    formatClock,
    formatDay,
    formatMoney,
    formatRange,
    formatWallTime,
    humanizeEnum,
    shiftIsoDate,
} from '@/lib/utils/ads/ads-format.util'

describe('costPerLeadTone', () => {
    it('is good at or under the baseline, bad at twice or more', () => {
        expect(costPerLeadTone(33, 51, 4, 131)).toBe('good')
        expect(costPerLeadTone(80, 51, 2, 160)).toBe('neutral')
        expect(costPerLeadTone(653, 51, 1, 653)).toBe('bad')
    })

    it('reads spend with no lead against the baseline', () => {
        expect(costPerLeadTone(null, 51, 0, 375.92)).toBe('bad')
        expect(costPerLeadTone(null, 51, 0, 40)).toBe('neutral')
    })

    it('has no colour without a baseline', () => {
        expect(costPerLeadTone(500, null, 1, 500)).toBe('neutral')
    })
})

describe('formatting', () => {
    it('formats money, days, ranges and wall times', () => {
        expect(formatMoney(2064.81)).toBe('$2,064.81')
        expect(formatMoney(null)).toBe('—')
        expect(formatDay('2026-09-14')).toBe('14 Sep')
        expect(formatRange('2026-09-11', '2026-09-23')).toBe(
            '11 Sep – 23 Sep 2026'
        )
        expect(formatWallTime('2026-09-21T10:42:10')).toBe('21 Sep · 10:42')
        expect(formatClock('2026-09-24T06:31:00')).toBe('06:31')
        expect(humanizeEnum('SEARCH_PARTNERS')).toBe('Search partners')
    })

    it('shifts ISO dates across month ends', () => {
        expect(shiftIsoDate('2026-10-01', -1)).toBe('2026-09-30')
        expect(shiftIsoDate('2026-09-24', -27)).toBe('2026-08-28')
    })
})
