/**
 * Tests for the GSC retry wrapper (epic #144, #145).
 */
import { describe, expect, it, vi } from 'vitest'

import {
    isTransientGscError,
    withGscRetry,
} from '@/lib/services/search-console/gsc-retry.util'

// Millisecond delays keep the retry path fast under test.
const FAST_DELAYS = [1, 1, 1]

describe('isTransientGscError', () => {
    it('marks 429 and 5xx as transient', () => {
        expect(isTransientGscError({ code: 429 })).toBe(true)
        expect(isTransientGscError({ code: 500 })).toBe(true)
        expect(isTransientGscError({ status: 503 })).toBe(true)
    })

    it('leaves everything else alone', () => {
        expect(isTransientGscError({ code: 400 })).toBe(false)
        expect(isTransientGscError({ code: 403 })).toBe(false)
        expect(isTransientGscError(new Error('boom'))).toBe(false)
        expect(isTransientGscError(null)).toBe(false)
    })
})

describe('withGscRetry', () => {
    it('returns the first success without retrying', async () => {
        const fn = vi.fn().mockResolvedValue('ok')
        await expect(withGscRetry(fn, FAST_DELAYS)).resolves.toBe('ok')
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it('retries transient errors until one succeeds', async () => {
        const fn = vi
            .fn()
            .mockRejectedValueOnce({ code: 429 })
            .mockRejectedValueOnce({ code: 503 })
            .mockResolvedValue('ok')
        await expect(withGscRetry(fn, FAST_DELAYS)).resolves.toBe('ok')
        expect(fn).toHaveBeenCalledTimes(3)
    })

    it('rethrows non-transient errors immediately', async () => {
        const fn = vi.fn().mockRejectedValue({ code: 403 })
        await expect(withGscRetry(fn, FAST_DELAYS)).rejects.toEqual({
            code: 403,
        })
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it('gives up after exhausting the delays', async () => {
        const fn = vi.fn().mockRejectedValue({ code: 500 })
        await expect(withGscRetry(fn, FAST_DELAYS)).rejects.toEqual({
            code: 500,
        })
        // Initial attempt + one per delay
        expect(fn).toHaveBeenCalledTimes(FAST_DELAYS.length + 1)
    })
})
