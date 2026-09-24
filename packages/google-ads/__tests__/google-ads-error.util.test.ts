import { describe, expect, it, vi } from 'vitest'

import {
    GoogleAdsApiError,
    isTransientGoogleAdsError,
    parseGoogleAdsError,
    withGoogleAdsRetry,
} from '../src/google-ads-error.util'

function failureBody(errorCode: Record<string, string>, message: string) {
    return JSON.stringify({
        error: {
            code: 400,
            message: 'Request contains an invalid argument.',
            status: 'INVALID_ARGUMENT',
            details: [
                {
                    '@type':
                        'type.googleapis.com/google.ads.googleads.v25.errors.GoogleAdsFailure',
                    errors: [{ errorCode, message }],
                    requestId: 'req-123',
                },
            ],
        },
    })
}

describe('parseGoogleAdsError', () => {
    it('surfaces the GoogleAdsFailure message and codes', () => {
        const error = parseGoogleAdsError(
            400,
            failureBody(
                { queryError: 'UNRECOGNIZED_FIELD' },
                "Unrecognized field in the query: 'campaign.nme'."
            )
        )
        expect(error).toBeInstanceOf(GoogleAdsApiError)
        expect(error.message).toContain('Unrecognized field in the query')
        expect(error.message).toContain('queryError:UNRECOGNIZED_FIELD')
        expect(error.codes).toEqual(['queryError:UNRECOGNIZED_FIELD'])
        expect(error.requestId).toBe('req-123')
        expect(error.status).toBe('INVALID_ARGUMENT')
    })

    it('falls back to the raw body when it is not JSON', () => {
        const error = parseGoogleAdsError(502, '<html>Bad Gateway</html>')
        expect(error.message).toBe(
            'Google Ads API 502: <html>Bad Gateway</html>'
        )
    })
})

describe('isTransientGoogleAdsError', () => {
    it('retries 5xx and temporary quota pressure only', () => {
        expect(isTransientGoogleAdsError(parseGoogleAdsError(503, ''))).toBe(
            true
        )
        expect(
            isTransientGoogleAdsError(
                parseGoogleAdsError(
                    429,
                    failureBody(
                        { quotaError: 'RESOURCE_TEMPORARILY_EXHAUSTED' },
                        'Too many requests.'
                    )
                )
            )
        ).toBe(true)
    })

    it('does not retry the daily quota or a bad query', () => {
        expect(
            isTransientGoogleAdsError(
                parseGoogleAdsError(
                    429,
                    failureBody(
                        { quotaError: 'RESOURCE_EXHAUSTED' },
                        'Daily quota exhausted.'
                    )
                )
            )
        ).toBe(false)
        expect(
            isTransientGoogleAdsError(
                parseGoogleAdsError(
                    400,
                    failureBody({ queryError: 'BAD_FIELD_NAME' }, 'Bad field.')
                )
            )
        ).toBe(false)
        expect(isTransientGoogleAdsError(new Error('boom'))).toBe(false)
    })
})

describe('withGoogleAdsRetry', () => {
    it('retries transient failures, then succeeds', async () => {
        const fn = vi
            .fn()
            .mockRejectedValueOnce(parseGoogleAdsError(503, ''))
            .mockResolvedValueOnce('ok')
        await expect(withGoogleAdsRetry(fn, [0, 0])).resolves.toBe('ok')
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it('gives up after the last delay', async () => {
        const fn = vi.fn().mockRejectedValue(parseGoogleAdsError(500, ''))
        await expect(withGoogleAdsRetry(fn, [0, 0])).rejects.toBeInstanceOf(
            GoogleAdsApiError
        )
        expect(fn).toHaveBeenCalledTimes(3)
    })

    it('rethrows non-transient failures immediately', async () => {
        const fn = vi.fn().mockRejectedValue(parseGoogleAdsError(400, ''))
        await expect(withGoogleAdsRetry(fn, [0, 0])).rejects.toBeInstanceOf(
            GoogleAdsApiError
        )
        expect(fn).toHaveBeenCalledTimes(1)
    })
})
