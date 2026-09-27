import { describe, expect, it } from 'vitest'

import {
    isTransientYouTubeError,
    parseYouTubeError,
    YouTubeApiError,
} from '../src/youtube-error.util'
import {
    countTagChars,
    validateVideoMetadata,
} from '../src/youtube-metadata.util'

describe('validateVideoMetadata', () => {
    it('accepts ordinary metadata', () => {
        expect(
            validateVideoMetadata({
                title: 'Lipo 360 recovery: week one',
                description: 'Book a consultation.',
                tags: ['lipo 360', 'miami'],
            })
        ).toEqual([])
    })

    it('flags an empty or long title, angle brackets and long tags', () => {
        expect(validateVideoMetadata({ title: '  ' })).toContain(
            'Title is empty.'
        )
        expect(validateVideoMetadata({ title: 'x'.repeat(101) })[0]).toMatch(
            /101 characters/
        )
        expect(validateVideoMetadata({ title: 'a <b>' })[0]).toMatch(/< or >/)
        const tags = Array.from({ length: 60 }, (_, i) => `tag number ${i}`)
        expect(validateVideoMetadata({ title: 't', tags })[0]).toMatch(
            /Tags use/
        )
    })

    it('only allows a publish time on a private video', () => {
        expect(
            validateVideoMetadata({
                title: 't',
                privacyStatus: 'public',
                publishAt: '2026-10-01T15:00:00Z',
            })
        ).toEqual(['A scheduled publish time needs the video to be private.'])
    })

    it('counts commas and the quotes around tags with spaces', () => {
        // "a b" = 3 + 2 quotes, "cd" = 2, one comma
        expect(countTagChars(['a b', 'cd'])).toBe(8)
        expect(countTagChars([])).toBe(0)
    })
})

describe('parseYouTubeError', () => {
    it('keeps the Data API reason', () => {
        const error = parseYouTubeError(
            403,
            JSON.stringify({
                error: {
                    code: 403,
                    message:
                        'The request cannot be completed because you have exceeded your quota.',
                    errors: [{ reason: 'quotaExceeded' }],
                },
            })
        )
        expect(error).toBeInstanceOf(YouTubeApiError)
        expect(error.reason).toBe('quotaExceeded')
        expect(error.message).toMatch(/^quotaExceeded: /)
        expect(isTransientYouTubeError(error)).toBe(false)
    })

    it('treats 5xx, 429 and backendError as transient', () => {
        expect(isTransientYouTubeError(parseYouTubeError(503, ''))).toBe(true)
        expect(isTransientYouTubeError(parseYouTubeError(429, ''))).toBe(true)
        expect(
            isTransientYouTubeError(
                parseYouTubeError(
                    400,
                    JSON.stringify({
                        error: { errors: [{ reason: 'backendError' }] },
                    })
                )
            )
        ).toBe(true)
        expect(isTransientYouTubeError(new Error('x'))).toBe(false)
    })

    it('survives a non-JSON body', () => {
        expect(
            parseYouTubeError(502, '<html>Bad gateway</html>').message
        ).toMatch(/Bad gateway/)
    })
})
