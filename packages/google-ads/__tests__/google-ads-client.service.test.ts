import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('google-auth-library', () => ({
    JWT: vi.fn().mockImplementation(function () {
        return {
            getAccessToken: () => Promise.resolve({ token: 'test-token' }),
        }
    }),
}))

const { searchGaql } = await import('../src/google-ads-client.service')

/** The `fetch` arguments of the nth call. */
function call(n: number) {
    const [url, init] = fetchMock.mock.calls[n] as [string, RequestInit]
    return {
        url,
        headers: init.headers as Record<string, string>,
        body: JSON.parse(init.body as string) as Record<string, unknown>,
    }
}

const fetchMock = vi.fn()

function page(body: unknown) {
    return new Response(JSON.stringify(body), { status: 200 })
}

describe('searchGaql', () => {
    beforeEach(() => {
        vi.stubEnv('GOOGLE_CLIENT_EMAIL', 'sa@example.iam.gserviceaccount.com')
        vi.stubEnv('GOOGLE_PRIVATE_KEY', 'key')
        vi.stubEnv('GOOGLE_ADS_CUSTOMER_ID', '447-254-7809')
        vi.stubGlobal('fetch', fetchMock)
        fetchMock.mockReset()
    })

    afterEach(() => {
        vi.unstubAllEnvs()
        vi.unstubAllGlobals()
    })

    it('follows nextPageToken and flattens every page', async () => {
        const mask = 'campaign.name,metrics.clicks'
        fetchMock
            .mockResolvedValueOnce(
                page({
                    results: [
                        { campaign: { name: 'A' }, metrics: { clicks: '3' } },
                    ],
                    nextPageToken: 'p2',
                    fieldMask: mask,
                })
            )
            .mockResolvedValueOnce(
                page({
                    results: [{ campaign: { name: 'B' } }],
                    fieldMask: mask,
                })
            )

        const result = await searchGaql('SELECT campaign.name FROM campaign')

        expect(result).toEqual({
            rows: [
                { 'campaign.name': 'A', 'metrics.clicks': 3 },
                { 'campaign.name': 'B', 'metrics.clicks': 0 },
            ],
            truncated: false,
        })

        expect(call(0).url).toBe(
            'https://googleads.googleapis.com/v25/customers/4472547809/googleAds:search'
        )
        expect(call(0).headers).toMatchObject({
            Authorization: 'Bearer test-token',
        })
        // Developer tokens were sunset on 2026-09-09; none is sent.
        expect(call(0).headers).not.toHaveProperty('developer-token')
        expect(call(1).body).toMatchObject({ pageToken: 'p2' })
    })

    it('stops at maxRows and reports truncation', async () => {
        fetchMock.mockResolvedValueOnce(
            page({
                results: [
                    { campaign: { name: 'A' } },
                    { campaign: { name: 'B' } },
                ],
                nextPageToken: 'p2',
                fieldMask: 'campaign.name',
            })
        )

        const result = await searchGaql('SELECT campaign.name FROM campaign', {
            maxRows: 1,
        })

        expect(result.rows).toHaveLength(1)
        expect(result.truncated).toBe(true)
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('sends login-customer-id only when configured', async () => {
        vi.stubEnv('GOOGLE_ADS_LOGIN_CUSTOMER_ID', '123-456-7890')
        fetchMock.mockResolvedValueOnce(page({ results: [] }))

        await searchGaql('SELECT customer.id FROM customer')

        expect(call(0).headers).toMatchObject({
            'login-customer-id': '1234567890',
        })
    })

    it('throws the API explanation on failure', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    error: {
                        code: 400,
                        status: 'INVALID_ARGUMENT',
                        details: [
                            {
                                '@type':
                                    'type.googleapis.com/google.ads.googleads.v25.errors.GoogleAdsFailure',
                                errors: [
                                    {
                                        errorCode: {
                                            queryError: 'UNRECOGNIZED_FIELD',
                                        },
                                        message: 'Unrecognized field.',
                                    },
                                ],
                            },
                        ],
                    },
                }),
                { status: 400 }
            )
        )

        await expect(
            searchGaql('SELECT campaign.nme FROM campaign')
        ).rejects.toThrow(
            /Unrecognized field\. \[queryError:UNRECOGNIZED_FIELD\]/
        )
    })
})
