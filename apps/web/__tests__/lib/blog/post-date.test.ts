import { describe, expect, it } from 'vitest'

import { formatPostCardDate } from '@/lib/blog/post-date.util'

describe('formatPostCardDate', () => {
    it('keeps the UTC date for times near midnight, in any local time zone', () => {
        expect(formatPostCardDate('2026-01-31T00:13:19.576Z')).toBe(
            'Jan 31, 2026'
        )
        expect(formatPostCardDate('2026-01-31T23:59:00.000Z')).toBe(
            'Jan 31, 2026'
        )
    })

    it('returns null without a date', () => {
        expect(formatPostCardDate(null)).toBeNull()
    })
})
