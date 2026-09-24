/**
 * Tests for change-event summaries and timestamps (epic #288).
 */
import { describe, expect, it } from 'vitest'

import {
    isStatusOrBudgetChange,
    shortUser,
    summarizeChanges,
    wallTimeToDate,
    type ChangeLike,
} from '@/lib/utils/ads/ads-changes.util'

const change = (overrides: Partial<ChangeLike>): ChangeLike => ({
    userEmail: 'someone@agency.example',
    resourceType: 'CAMPAIGN',
    operation: 'UPDATE',
    changedFields: [],
    values: null,
    ...overrides,
})

const pause = change({
    changedFields: ['status'],
    values: { status: { old: 'ENABLED', new: 'PAUSED' } },
})

describe('summarizeChanges', () => {
    it('reads a pause as a status transition', () => {
        expect(summarizeChanges([pause, pause, pause, pause])).toBe(
            '4 campaigns ENABLED → PAUSED'
        )
    })

    it('counts creations by resource, biggest first', () => {
        const events = [
            ...Array.from({ length: 4 }, () =>
                change({ operation: 'CREATE', resourceType: 'CAMPAIGN' })
            ),
            ...Array.from({ length: 15 }, () =>
                change({ operation: 'CREATE', resourceType: 'AD_GROUP' })
            ),
            change({ operation: 'UPDATE', resourceType: 'CAMPAIGN' }),
        ]
        expect(summarizeChanges(events)).toBe(
            'Created 15 ad groups, 4 campaigns; edited 1 campaign'
        )
    })

    it('puts transitions before other edits', () => {
        expect(
            summarizeChanges([
                pause,
                change({ resourceType: 'AD', operation: 'UPDATE' }),
            ])
        ).toBe('1 campaign ENABLED → PAUSED; edited 1 ad')
    })
})

describe('isStatusOrBudgetChange', () => {
    it('matches campaign status and budget amounts only', () => {
        expect(isStatusOrBudgetChange(pause)).toBe(true)
        expect(
            isStatusOrBudgetChange(
                change({
                    resourceType: 'CAMPAIGN_BUDGET',
                    changedFields: ['amount_micros'],
                })
            )
        ).toBe(true)
        expect(
            isStatusOrBudgetChange(change({ changedFields: ['name'] }))
        ).toBe(false)
        expect(
            isStatusOrBudgetChange(
                change({
                    resourceType: 'CAMPAIGN_BUDGET',
                    operation: 'CREATE',
                    changedFields: ['amount_micros', 'name'],
                })
            )
        ).toBe(false)
    })
})

describe('shortUser', () => {
    it('keeps the part before the domain', () => {
        expect(shortUser('angela@agency.example')).toBe('angela@')
        expect(shortUser('')).toBe('Google')
    })
})

describe('wallTimeToDate', () => {
    it('keeps the account-zone wall time in the UTC fields', () => {
        expect(wallTimeToDate('2026-09-24 12:58:07.904879').toISOString()).toBe(
            '2026-09-24T12:58:07.904Z'
        )
        expect(wallTimeToDate('2026-09-22 09:00:00').toISOString()).toBe(
            '2026-09-22T09:00:00.000Z'
        )
    })

    it('throws on junk instead of storing Invalid Date', () => {
        expect(() => wallTimeToDate('yesterday')).toThrow()
    })
})
