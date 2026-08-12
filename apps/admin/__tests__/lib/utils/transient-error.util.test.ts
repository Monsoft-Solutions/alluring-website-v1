import { describe, expect, it } from 'vitest'

import { isTransientProviderError } from '@/lib/utils/transient-error.util'

describe('isTransientProviderError', () => {
    it.each([
        'Rate limit exceeded, retry after 30s',
        'rate-limited by upstream provider',
        'Too Many Requests',
        'Request failed with status code 429',
        'Request failed with status 503',
        'status: 502',
        '429 Too Many Requests',
        '502 Bad Gateway',
        'Bad gateway from upstream',
        'Service Unavailable',
        'Gateway timeout while waiting for model',
        'The request timed out',
        'Connect timeout',
        'connect ETIMEDOUT 1.2.3.4:443',
        'read ECONNRESET',
        'connect ECONNREFUSED 127.0.0.1:443',
        'getaddrinfo EAI_AGAIN api.fal.ai',
        'socket hang up',
        'fetch failed',
        'Network error while contacting provider',
        'The model is currently overloaded',
        'Internal Server Error',
        'quota exceeded for this billing period',
    ])('classifies "%s" as transient', (message) => {
        expect(isTransientProviderError(message)).toBe(true)
        expect(isTransientProviderError(new Error(message))).toBe(true)
    })

    it.each([
        'Planning data with outline is required for generation',
        'Post not in generate status (draft)',
        'Content is required for review phase',
        'Failed to create image record',
        'Invalid API key',
        'Unauthorized',
        'Content policy violation',
        'Unknown error',
    ])('classifies "%s" as not transient', (message) => {
        expect(isTransientProviderError(message)).toBe(false)
        expect(isTransientProviderError(new Error(message))).toBe(false)
    })

    it('does not match bare numbers that only look like status codes', () => {
        expect(
            isTransientProviderError('Generated 502 words but expected 1500')
        ).toBe(false)
        expect(
            isTransientProviderError('Estimated word count 429 is too low')
        ).toBe(false)
    })

    it('walks the error cause chain', () => {
        const inner = new Error('connect ETIMEDOUT 1.2.3.4:443')
        const outer = new Error('Generation phase failed', { cause: inner })
        expect(isTransientProviderError(outer)).toBe(true)
    })

    it('handles non-error values without throwing', () => {
        expect(isTransientProviderError(undefined)).toBe(false)
        expect(isTransientProviderError(null)).toBe(false)
        expect(isTransientProviderError(42)).toBe(false)
        expect(isTransientProviderError({ message: 'timeout' })).toBe(false)
    })
})
