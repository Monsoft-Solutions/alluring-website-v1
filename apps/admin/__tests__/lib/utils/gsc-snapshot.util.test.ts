/**
 * Tests for the GSC snapshot pure helpers (epic #144, #145).
 *
 * The catch-up model is self-healing by construction: a failed date stays
 * absent from the table, so computeMissingDates selects it again next run.
 */
import { describe, expect, it } from 'vitest'

import {
    addDays,
    computeMissingDates,
    extractPathFromPageUrl,
    gscFinalDate,
    MAX_DATES_PER_RUN,
    resolvePageUrlToSlugCandidate,
    SNAPSHOT_BACKSTOP_DAYS,
    toDateString,
} from '@/lib/utils/gsc-snapshot.util'

// Fixed reference: 2026-08-12 10:00 UTC → newest final GSC date is 2026-08-09.
const NOW = new Date('2026-08-12T10:00:00Z')

describe('date helpers', () => {
    it('formats and shifts UTC dates', () => {
        expect(toDateString(NOW)).toBe('2026-08-12')
        expect(addDays('2026-08-12', -3)).toBe('2026-08-09')
        expect(addDays('2026-08-31', 1)).toBe('2026-09-01')
        expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    })

    it('applies the 3-day GSC delay', () => {
        expect(gscFinalDate(NOW)).toBe('2026-08-09')
    })
})

describe('computeMissingDates', () => {
    it('starts at the backstop when the table is empty', () => {
        const dates = computeMissingDates(null, NOW)
        expect(dates).toHaveLength(SNAPSHOT_BACKSTOP_DAYS)
        expect(dates[0]).toBe('2026-07-27')
        expect(dates[dates.length - 1]).toBe('2026-08-09')
    })

    it('continues from the day after the latest stored date', () => {
        expect(computeMissingDates('2026-08-06', NOW)).toEqual([
            '2026-08-07',
            '2026-08-08',
            '2026-08-09',
        ])
    })

    it('returns nothing when already caught up', () => {
        expect(computeMissingDates('2026-08-09', NOW)).toEqual([])
        // A stored date beyond the final window must not go negative
        expect(computeMissingDates('2026-08-10', NOW)).toEqual([])
    })

    it('caps a long outage at MAX_DATES_PER_RUN, oldest first', () => {
        const dates = computeMissingDates('2026-01-01', NOW)
        expect(dates).toHaveLength(MAX_DATES_PER_RUN)
        expect(dates[0]).toBe('2026-01-02')
        expect(dates[dates.length - 1]).toBe(
            addDays('2026-01-01', MAX_DATES_PER_RUN)
        )
    })
})

describe('extractPathFromPageUrl', () => {
    it('extracts and normalizes paths', () => {
        expect(
            extractPathFromPageUrl('https://example.com/blog/bbl-recovery')
        ).toBe('/blog/bbl-recovery')
        expect(
            extractPathFromPageUrl('https://example.com/bbl-recovery/')
        ).toBe('/bbl-recovery')
        expect(extractPathFromPageUrl('https://example.com/')).toBe('/')
    })

    it('returns null for non-URLs', () => {
        expect(extractPathFromPageUrl('not a url')).toBeNull()
    })
})

describe('resolvePageUrlToSlugCandidate', () => {
    it('resolves both URL shapes', () => {
        expect(
            resolvePageUrlToSlugCandidate(
                'https://example.com/blog/tummy-tuck-cost-miami'
            )
        ).toBe('tummy-tuck-cost-miami')
        expect(
            resolvePageUrlToSlugCandidate(
                'https://example.com/bbl-recovery-week-1/'
            )
        ).toBe('bbl-recovery-week-1')
    })

    it('rejects listings, nested paths and the root', () => {
        expect(resolvePageUrlToSlugCandidate('https://example.com/')).toBeNull()
        expect(
            resolvePageUrlToSlugCandidate('https://example.com/blog')
        ).toBeNull()
        expect(
            resolvePageUrlToSlugCandidate(
                'https://example.com/blog/categories/recovery'
            )
        ).toBeNull()
        expect(
            resolvePageUrlToSlugCandidate(
                'https://example.com/procedures/liposuction'
            )
        ).toBeNull()
    })
})
