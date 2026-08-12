import { describe, expect, it } from 'vitest'

import { calculateDuration, formatDurationMs } from '@/lib/utils/time.util'

describe('calculateDuration', () => {
    it('returns the elapsed milliseconds between two ISO timestamps', () => {
        expect(
            calculateDuration(
                '2026-08-12T12:00:00.000Z',
                '2026-08-12T12:01:30.000Z'
            )
        ).toBe(90_000)
    })

    it('returns 0 for missing or invalid inputs', () => {
        expect(calculateDuration(null, '2026-08-12T12:00:00.000Z')).toBe(0)
        expect(calculateDuration('2026-08-12T12:00:00.000Z', undefined)).toBe(0)
        expect(
            calculateDuration('not-a-date', '2026-08-12T12:00:00.000Z')
        ).toBe(0)
    })

    it('clamps negative ranges to 0', () => {
        expect(
            calculateDuration(
                '2026-08-12T12:01:00.000Z',
                '2026-08-12T12:00:00.000Z'
            )
        ).toBe(0)
    })
})

describe('formatDurationMs', () => {
    it.each([
        [0, '—'],
        [-5, '—'],
        [200, '<1s'],
        [999, '1s'],
        [45_000, '45s'],
        [60_000, '1m'],
        [90_000, '1m 30s'],
        [125_000, '2m 5s'],
    ])('formats %ims as "%s"', (ms, expected) => {
        expect(formatDurationMs(ms)).toBe(expected)
    })
})
