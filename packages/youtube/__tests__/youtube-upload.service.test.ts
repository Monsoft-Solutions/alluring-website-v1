import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    nextOffsetFromRange,
    uploadVideoFromUrl,
} from '../src/youtube-upload.service'
import { YouTubeApiError } from '../src/youtube-error.util'

const fetchMock =
    vi.fn<(url: string | URL, init?: RequestInit) => Promise<Response>>()
const SOURCE = 'https://blob.example.com/reel.mp4'
const SESSION =
    'https://www.googleapis.com/upload/youtube/v3/videos?upload_id=abc'
const TOTAL = 1000

const metadata = {
    title: 'Lipo 360 recovery: week one',
    description: 'Book a consultation.',
    tags: ['lipo 360'],
    privacyStatus: 'private' as const,
}

function headResponse() {
    return new Response(null, {
        status: 200,
        headers: {
            'content-length': String(TOTAL),
            'content-type': 'video/mp4',
        },
    })
}
function sessionResponse() {
    return new Response(null, { status: 200, headers: { location: SESSION } })
}
function download(status = 200) {
    return new Response('video-bytes', { status })
}
function done() {
    return new Response(
        JSON.stringify({
            id: 'vid123',
            snippet: { title: metadata.title },
            status: { privacyStatus: 'private', uploadStatus: 'uploaded' },
        }),
        { status: 200 }
    )
}
function incomplete(range?: string) {
    return new Response(null, {
        status: 308,
        headers: range ? { range } : {},
    })
}

/** Headers of the nth fetch call. */
function headersOf(n: number): Record<string, string> {
    return (fetchMock.mock.calls[n]![1]?.headers ?? {}) as Record<
        string,
        string
    >
}

describe('uploadVideoFromUrl', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock)
        fetchMock.mockReset()
    })
    afterEach(() => vi.unstubAllGlobals())

    it('opens a session with the metadata and streams the whole file', async () => {
        fetchMock
            .mockResolvedValueOnce(headResponse())
            .mockResolvedValueOnce(sessionResponse())
            .mockResolvedValueOnce(download())
            .mockResolvedValueOnce(done())

        const onSession = vi.fn()
        const video = await uploadVideoFromUrl('token', {
            sourceUrl: SOURCE,
            metadata,
            onSession,
        })

        expect(video).toEqual({
            videoId: 'vid123',
            title: metadata.title,
            privacyStatus: 'private',
            uploadStatus: 'uploaded',
        })
        expect(onSession).toHaveBeenCalledWith(SESSION)

        const [startUrl, startInit] = fetchMock.mock.calls[1]!
        expect(String(startUrl)).toContain('uploadType=resumable')
        expect(headersOf(1)['X-Upload-Content-Length']).toBe(String(TOTAL))
        const body = JSON.parse(startInit!.body as string) as {
            snippet: { categoryId: string }
            status: unknown
        }
        expect(body.status).toEqual({
            privacyStatus: 'private',
            selfDeclaredMadeForKids: false,
        })
        expect(body.snippet.categoryId).toBe('26')

        expect(fetchMock.mock.calls[3]![0]).toBe(SESSION)
        expect(headersOf(3)['Content-Length']).toBe(String(TOTAL))
        expect(headersOf(3)['Content-Range']).toBeUndefined()
    })

    it('asks where it stopped after a dropped send, then sends only the rest', async () => {
        fetchMock
            .mockResolvedValueOnce(headResponse())
            .mockResolvedValueOnce(sessionResponse())
            .mockResolvedValueOnce(download())
            .mockRejectedValueOnce(new TypeError('socket hang up'))
            .mockResolvedValueOnce(incomplete('bytes=0-399'))
            .mockResolvedValueOnce(download(206))
            .mockResolvedValueOnce(done())

        const video = await uploadVideoFromUrl('token', {
            sourceUrl: SOURCE,
            metadata,
        })
        expect(video.videoId).toBe('vid123')

        expect(headersOf(4)['Content-Range']).toBe(`bytes */${TOTAL}`)
        expect(headersOf(5)).toEqual({ Range: 'bytes=400-' })
        expect(headersOf(6)['Content-Range']).toBe(`bytes 400-999/${TOTAL}`)
        expect(headersOf(6)['Content-Length']).toBe('600')
    })

    it('does not retry a request YouTube rejected', async () => {
        fetchMock
            .mockResolvedValueOnce(headResponse())
            .mockResolvedValueOnce(sessionResponse())
            .mockResolvedValueOnce(download())
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        error: { errors: [{ reason: 'uploadLimitExceeded' }] },
                    }),
                    { status: 400 }
                )
            )
        await expect(
            uploadVideoFromUrl('token', { sourceUrl: SOURCE, metadata })
        ).rejects.toBeInstanceOf(YouTubeApiError)
        expect(fetchMock).toHaveBeenCalledTimes(4)
    })

    it('refuses invalid metadata before opening a session', async () => {
        fetchMock.mockResolvedValueOnce(headResponse())
        await expect(
            uploadVideoFromUrl('token', {
                sourceUrl: SOURCE,
                metadata: { ...metadata, title: '' },
            })
        ).rejects.toThrow(/Title is empty/)
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })
})

describe('nextOffsetFromRange', () => {
    it('reads the last received byte', () => {
        expect(nextOffsetFromRange('bytes=0-524287')).toBe(524288)
        expect(nextOffsetFromRange(null)).toBe(0)
    })
})
