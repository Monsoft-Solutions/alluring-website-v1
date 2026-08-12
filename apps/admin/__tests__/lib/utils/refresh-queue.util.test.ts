/**
 * Tests for the refresh queue's merge and cooldown semantics (issue #147).
 */
import { describe, expect, it } from 'vitest'

import { isWithinCooldown, mergeSignal } from '@/lib/utils/refresh-queue.util'
import type { RefreshSignal } from '@workspace/db/types'

const NOW = new Date('2026-08-12T06:40:00Z')

function signal(
    source: RefreshSignal['source'],
    detectedAt: string
): RefreshSignal {
    return { source, detectedAt, metrics: {} }
}

describe('mergeSignal', () => {
    it('replaces the previous signal of the same source', () => {
        const merged = mergeSignal(
            [signal('position-drop', '2026-08-01T00:00:00Z')],
            signal('position-drop', '2026-08-12T00:00:00Z')
        )
        expect(merged).toHaveLength(1)
        expect(merged[0]!.detectedAt).toBe('2026-08-12T00:00:00Z')
    })

    it('accumulates signals from different sources', () => {
        const merged = mergeSignal(
            [signal('position-drop', '2026-08-01T00:00:00Z')],
            signal('stale-age', '2026-08-12T00:00:00Z')
        )
        expect(merged.map((entry) => entry.source)).toEqual([
            'position-drop',
            'stale-age',
        ])
    })
})

describe('isWithinCooldown', () => {
    it('is false for a post that never had a refresh', () => {
        expect(isWithinCooldown(null, 60, NOW)).toBe(false)
    })

    it('is true inside the window and false past it', () => {
        const thirtyDaysAgo = new Date('2026-07-13T06:40:00Z')
        const seventyDaysAgo = new Date('2026-06-03T06:40:00Z')
        expect(isWithinCooldown(thirtyDaysAgo, 60, NOW)).toBe(true)
        expect(isWithinCooldown(seventyDaysAgo, 60, NOW)).toBe(false)
    })
})
