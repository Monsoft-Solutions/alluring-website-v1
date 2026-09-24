import { describe, expect, it } from 'vitest'

import {
    addDays,
    daysBetween,
    resolveDateRange,
    todayIn,
} from '../src/google-ads-dates.util'
import {
    assertNumericId,
    assertSelectQuery,
    gaqlLikeContains,
    gaqlString,
} from '../src/google-ads-gaql.util'

const TZ = 'America/New_York'

describe('todayIn', () => {
    it('uses the account zone, not UTC', () => {
        // 01:30 UTC on the 25th is still the evening of the 24th in Miami.
        expect(todayIn(TZ, new Date('2026-09-25T01:30:00Z'))).toBe('2026-09-24')
    })
})

describe('resolveDateRange', () => {
    const now = new Date('2026-09-24T16:00:00Z')

    it('defaults to 30 complete days ending yesterday', () => {
        expect(resolveDateRange({ timeZone: TZ, now })).toEqual({
            startDate: '2026-08-25',
            endDate: '2026-09-23',
            days: 30,
        })
    })

    it('honours explicit dates', () => {
        expect(
            resolveDateRange({
                startDate: '2026-09-11',
                endDate: '2026-09-15',
                timeZone: TZ,
                now,
            })
        ).toEqual({ startDate: '2026-09-11', endDate: '2026-09-15', days: 5 })
    })

    it('rejects malformed and inverted windows', () => {
        expect(() =>
            resolveDateRange({ startDate: '2026/09/11', timeZone: TZ, now })
        ).toThrow(/YYYY-MM-DD/)
        expect(() =>
            resolveDateRange({
                startDate: '2026-09-20',
                endDate: '2026-09-10',
                timeZone: TZ,
                now,
            })
        ).toThrow(/after endDate/)
    })
})

describe('date arithmetic', () => {
    it('crosses month boundaries', () => {
        expect(addDays('2026-10-01', -1)).toBe('2026-09-30')
        expect(daysBetween('2026-09-01', '2026-09-30')).toBe(30)
    })
})

describe('GAQL quoting', () => {
    it('escapes quotes and backslashes in string literals', () => {
        expect(gaqlString("women's lipo")).toBe("'women\\'s lipo'")
        expect(gaqlString('a\\b')).toBe("'a\\\\b'")
    })

    it('escapes LIKE wildcards in a contains filter', () => {
        expect(gaqlLikeContains('50%_off')).toBe("'%50[%][_]off%'")
    })

    it('accepts numeric ids only', () => {
        expect(assertNumericId(' 24211727880 ', 'campaignId')).toBe(
            '24211727880'
        )
        expect(() => assertNumericId('1 OR 1=1', 'campaignId')).toThrow()
    })

    it('requires a SELECT and trims a trailing semicolon', () => {
        expect(assertSelectQuery('  select campaign.id from campaign; ')).toBe(
            'select campaign.id from campaign'
        )
        expect(() => assertSelectQuery('DELETE campaign')).toThrow(/SELECT/)
    })
})
