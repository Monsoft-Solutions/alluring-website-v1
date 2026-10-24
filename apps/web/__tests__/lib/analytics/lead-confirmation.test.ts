import { describe, expect, it } from 'vitest'

import {
    confirmLead,
    LEAD_MARKER_KEY,
    LEAD_MARKER_MAX_AGE_MS,
    type MarkerStorage,
    setLeadMarker,
} from '@/lib/analytics/lead-confirmation'

function memoryStorage(): MarkerStorage & { data: Map<string, string> } {
    const data = new Map<string, string>()
    return {
        data,
        getItem: (key) => data.get(key) ?? null,
        setItem: (key, value) => void data.set(key, value),
        removeItem: (key) => void data.delete(key),
    }
}

const T0 = Date.parse('2026-10-24T15:00:00Z')
const marker = { at: T0, source: 'home-page', formName: 'home_consult' }

describe('lead_confirmed, the one-time conversion (#350)', () => {
    it('pushes once for a fresh marker, then clears it', () => {
        const storage = memoryStorage()
        const pushed: Record<string, unknown>[] = []
        setLeadMarker(storage, marker)
        expect(confirmLead(storage, T0 + 5_000, (e) => pushed.push(e))).toBe(
            true
        )
        expect(pushed).toEqual([
            {
                event: 'lead_confirmed',
                lead_source: 'home-page',
                form_name: 'home_consult',
            },
        ])
        expect(storage.data.has(LEAD_MARKER_KEY)).toBe(false)
        // A reload of the thank-you page pushes nothing.
        expect(confirmLead(storage, T0 + 6_000, (e) => pushed.push(e))).toBe(
            false
        )
        expect(pushed).toHaveLength(1)
    })

    it('pushes nothing without a marker: a reopened tab or a bookmark', () => {
        const pushed: unknown[] = []
        expect(confirmLead(memoryStorage(), T0, (e) => pushed.push(e))).toBe(
            false
        )
        expect(pushed).toEqual([])
    })

    it('pushes nothing for a stale marker, and still clears it', () => {
        const storage = memoryStorage()
        setLeadMarker(storage, marker)
        const pushed: unknown[] = []
        expect(
            confirmLead(storage, T0 + LEAD_MARKER_MAX_AGE_MS + 1, (e) =>
                pushed.push(e)
            )
        ).toBe(false)
        expect(pushed).toEqual([])
        expect(storage.data.has(LEAD_MARKER_KEY)).toBe(false)
    })

    it('accepts a marker right up to ten minutes old', () => {
        const storage = memoryStorage()
        setLeadMarker(storage, marker)
        expect(
            confirmLead(storage, T0 + LEAD_MARKER_MAX_AGE_MS, () => {})
        ).toBe(true)
    })

    it('ignores a marker from the future or with garbage in it', () => {
        const storage = memoryStorage()
        setLeadMarker(storage, { ...marker, at: T0 + 60_000 })
        expect(confirmLead(storage, T0, () => {})).toBe(false)
        storage.setItem(LEAD_MARKER_KEY, '{not json')
        expect(confirmLead(storage, T0, () => {})).toBe(false)
        storage.setItem(LEAD_MARKER_KEY, JSON.stringify({ at: 'soon' }))
        expect(confirmLead(storage, T0, () => {})).toBe(false)
    })

    it('does nothing without storage', () => {
        expect(confirmLead(null, T0, () => {})).toBe(false)
        expect(() => setLeadMarker(null, marker)).not.toThrow()
    })
})
