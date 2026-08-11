/**
 * Tests for startRow pagination in the Search Console fetch layer.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const querySpy = vi.fn()

vi.mock(
    '@/lib/services/search-console/google-search-console-client.service',
    () => ({
        getSearchConsoleClient: () => ({
            searchanalytics: { query: querySpy },
        }),
        getSiteUrl: () => 'https://example.com',
        isSearchConsoleConfigured: () => true,
    })
)

import {
    fetchAllSearchAnalytics,
    fetchSearchAnalytics,
} from '@/lib/services/search-console/google-search-console-utils.service'

/** Build a page of n dummy rows */
function rows(n: number, offset = 0) {
    return Array.from({ length: n }, (_, i) => ({
        keys: [`query-${offset + i}`],
        clicks: 1,
        impressions: 10,
        ctr: 0.1,
        position: 5,
    }))
}

beforeEach(() => {
    querySpy.mockReset()
})

describe('fetchSearchAnalytics', () => {
    it('passes startRow to the API when set', async () => {
        querySpy.mockResolvedValueOnce({ data: { rows: rows(2) } })

        await fetchSearchAnalytics({
            dimensions: ['query'],
            rowLimit: 100,
            startRow: 200,
        })

        expect(querySpy).toHaveBeenCalledWith(
            expect.objectContaining({
                requestBody: expect.objectContaining({
                    rowLimit: 100,
                    startRow: 200,
                }),
            })
        )
    })

    it('omits startRow when not set', async () => {
        querySpy.mockResolvedValueOnce({ data: { rows: [] } })

        await fetchSearchAnalytics({ dimensions: ['query'] })

        const body = querySpy.mock.calls[0]![0].requestBody
        expect('startRow' in body).toBe(false)
    })
})

describe('fetchAllSearchAnalytics', () => {
    it('pages through full pages until a short page ends the result set', async () => {
        querySpy
            .mockResolvedValueOnce({ data: { rows: rows(3, 0) } })
            .mockResolvedValueOnce({ data: { rows: rows(3, 3) } })
            .mockResolvedValueOnce({ data: { rows: rows(1, 6) } })

        const result = await fetchAllSearchAnalytics({
            dimensions: ['query', 'page'],
            rowLimit: 3,
        })

        expect(result).toHaveLength(7)
        expect(result[0]!.keys).toEqual(['query-0'])
        expect(result[6]!.keys).toEqual(['query-6'])

        const startRows = querySpy.mock.calls.map(
            (call) => call[0].requestBody.startRow ?? 0
        )
        expect(startRows).toEqual([0, 3, 6])
    })

    it('stops at one request when the first page is short', async () => {
        querySpy.mockResolvedValueOnce({ data: { rows: rows(2) } })

        const result = await fetchAllSearchAnalytics({
            dimensions: ['query'],
            rowLimit: 3,
        })

        expect(result).toHaveLength(2)
        expect(querySpy).toHaveBeenCalledTimes(1)
    })

    it('respects the maxRows cap', async () => {
        querySpy
            .mockResolvedValueOnce({ data: { rows: rows(3, 0) } })
            .mockResolvedValueOnce({ data: { rows: rows(2, 3) } })

        const result = await fetchAllSearchAnalytics(
            { dimensions: ['query'], rowLimit: 3 },
            5
        )

        expect(result).toHaveLength(5)
        expect(querySpy).toHaveBeenCalledTimes(2)
        // Second request only asks for the 2 rows remaining under the cap
        expect(querySpy.mock.calls[1]![0].requestBody.rowLimit).toBe(2)
    })

    it('handles an empty result set', async () => {
        querySpy.mockResolvedValueOnce({ data: { rows: [] } })

        const result = await fetchAllSearchAnalytics({ dimensions: ['query'] })

        expect(result).toEqual([])
        expect(querySpy).toHaveBeenCalledTimes(1)
    })
})
