/**
 * Tests for the daily-report rollup and resource-name parsing (epic #288).
 */
import { describe, expect, it } from 'vitest'

import { rollUpDaily } from '../src/google-ads-daily.service.js'
import { idFromResourceName } from '../src/google-ads-reports.service.js'

describe('rollUpDaily', () => {
    it('sums metrics of rows sharing a key and keeps money at cents', () => {
        const rows = [
            {
                date: '2026-09-14',
                key: 'a',
                name: 'first',
                impressions: 10,
                clicks: 2,
                cost: 0.1,
                conversions: 0.5,
                allConversions: 1,
            },
            {
                date: '2026-09-14',
                key: 'a',
                name: 'second',
                impressions: 5,
                clicks: 1,
                cost: 0.2,
                conversions: 0.25,
                allConversions: 0,
            },
            {
                date: '2026-09-15',
                key: 'a',
                name: 'other day',
                impressions: 1,
                clicks: 0,
                cost: 3,
                conversions: 0,
                allConversions: 0,
            },
        ]
        const rolled = rollUpDaily(rows, (row) => `${row.date}|${row.key}`)
        expect(rolled).toHaveLength(2)
        expect(rolled[0]).toMatchObject({
            name: 'first',
            impressions: 15,
            clicks: 3,
            cost: 0.3,
            conversions: 0.75,
            allConversions: 1,
        })
        // The input rows are not mutated.
        expect(rows[0]!.impressions).toBe(10)
    })
})

describe('idFromResourceName', () => {
    it('reads the trailing id', () => {
        expect(
            idFromResourceName('customers/4472547809/campaigns/24217440953')
        ).toBe('24217440953')
        expect(idFromResourceName(undefined)).toBeNull()
        expect(idFromResourceName('customers/1/adGroups/')).toBeNull()
    })
})
