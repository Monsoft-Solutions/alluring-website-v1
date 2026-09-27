/**
 * Resumable video upload
 *
 * YouTube's resumable protocol, fed straight from a URL (a Vercel Blob
 * file) so a large video is streamed through, never held in memory:
 *
 *   1. start:  POST the metadata, get back a session URI (valid ~1 week)
 *   2. send:   PUT the bytes to the session URI, from an offset
 *   3. query:  PUT an empty body with `Content-Range: bytes * /total` to
 *              learn how many bytes Google has, then send the rest
 *
 * The three steps are exported separately so a durable workflow can keep
 * the session URI and resume in a later function run.
 *
 * @module @workspace/youtube — upload
 */
import { YOUTUBE_UPLOAD_BASE } from './youtube-client.service.js'
import {
    isTransientYouTubeError,
    parseYouTubeError,
    YouTubeApiError,
} from './youtube-error.util.js'
import {
    validateVideoMetadata,
    YOUTUBE_DEFAULT_CATEGORY_ID,
} from './youtube-metadata.util.js'
import type {
    YouTubePrivacyStatus,
    YouTubeUploadedVideo,
    YouTubeVideoMetadata,
} from './youtube.type.js'

/** Where an upload stands after a send or a query. */
export type UploadProgress =
    | { state: 'complete'; video: YouTubeUploadedVideo }
    | { state: 'incomplete'; nextOffset: number }

/** Size and type of the file behind a URL. */
export type UploadSource = {
    url: string
    contentLength: number
    contentType: string
}

type VideoResource = {
    id: string
    snippet?: { title?: string }
    status?: { privacyStatus?: YouTubePrivacyStatus; uploadStatus?: string }
}

function toUploadedVideo(resource: VideoResource): YouTubeUploadedVideo {
    return {
        videoId: resource.id,
        title: resource.snippet?.title ?? '',
        privacyStatus: resource.status?.privacyStatus ?? null,
        uploadStatus: resource.status?.uploadStatus ?? null,
    }
}

/**
 * Next byte to send, from a 308's `Range: bytes=0-N` header. No header
 * means Google has nothing yet.
 */
export function nextOffsetFromRange(range: string | null): number {
    const match = range?.match(/bytes=\d+-(\d+)/)
    return match ? Number(match[1]) + 1 : 0
}

/** Read a response that ends a send or a query. */
async function readProgress(response: Response): Promise<UploadProgress> {
    if (response.status === 200 || response.status === 201) {
        return {
            state: 'complete',
            video: toUploadedVideo((await response.json()) as VideoResource),
        }
    }
    if (response.status === 308) {
        return {
            state: 'incomplete',
            nextOffset: nextOffsetFromRange(response.headers.get('range')),
        }
    }
    throw parseYouTubeError(response.status, await response.text())
}

/** Size and type of a remote file, from a HEAD request. */
export async function describeUploadSource(url: string): Promise<UploadSource> {
    const response = await fetch(url, { method: 'HEAD' })
    if (!response.ok) {
        throw new Error(`Video source answered ${response.status}: ${url}`)
    }
    const contentLength = Number(response.headers.get('content-length'))
    if (!Number.isFinite(contentLength) || contentLength <= 0) {
        throw new Error(`Video source has no Content-Length: ${url}`)
    }
    return {
        url,
        contentLength,
        contentType: response.headers.get('content-type') ?? 'video/mp4',
    }
}

/** Step 1: send the metadata and open an upload session. */
export async function startResumableUpload(
    accessToken: string,
    options: {
        metadata: YouTubeVideoMetadata
        contentLength: number
        contentType: string
    }
): Promise<string> {
    const { metadata } = options
    const problems = validateVideoMetadata(metadata)
    if (problems.length > 0) {
        throw new Error(`Invalid YouTube metadata: ${problems.join(' ')}`)
    }

    const url = new URL(`${YOUTUBE_UPLOAD_BASE}/videos`)
    url.searchParams.set('uploadType', 'resumable')
    url.searchParams.set('part', 'snippet,status')

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Length': String(options.contentLength),
            'X-Upload-Content-Type': options.contentType,
        },
        body: JSON.stringify({
            snippet: {
                title: metadata.title.trim(),
                description: metadata.description ?? '',
                tags: metadata.tags ?? [],
                categoryId: metadata.categoryId ?? YOUTUBE_DEFAULT_CATEGORY_ID,
            },
            status: {
                privacyStatus: metadata.privacyStatus,
                selfDeclaredMadeForKids: false,
                ...(metadata.publishAt && { publishAt: metadata.publishAt }),
            },
        }),
    })
    if (!response.ok) {
        throw parseYouTubeError(response.status, await response.text())
    }
    const sessionUri = response.headers.get('location')
    if (!sessionUri) {
        throw new Error('YouTube did not return an upload session URI')
    }
    return sessionUri
}

/** Step 2: stream the source to the session, from `offset` to the end. */
export async function sendUploadBytes(
    accessToken: string,
    sessionUri: string,
    source: UploadSource,
    offset = 0
): Promise<UploadProgress> {
    const { contentLength: total } = source
    const download = await fetch(source.url, {
        headers: offset > 0 ? { Range: `bytes=${offset}-` } : {},
    })
    if (!download.ok || !download.body) {
        throw new Error(
            `Video source answered ${download.status}: ${source.url}`
        )
    }
    if (offset > 0 && download.status !== 206) {
        throw new Error('Video source ignored the Range header; cannot resume')
    }

    const init: RequestInit & { duplex: 'half' } = {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': source.contentType,
            'Content-Length': String(total - offset),
            ...(offset > 0 && {
                'Content-Range': `bytes ${offset}-${total - 1}/${total}`,
            }),
        },
        body: download.body,
        // Node's fetch needs this to send a streamed body.
        duplex: 'half',
    }
    return readProgress(await fetch(sessionUri, init))
}

/** Step 3: ask how far an interrupted session got. */
export async function queryUploadProgress(
    accessToken: string,
    sessionUri: string,
    contentLength: number
): Promise<UploadProgress> {
    const response = await fetch(sessionUri, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Length': '0',
            'Content-Range': `bytes */${contentLength}`,
        },
    })
    return readProgress(response)
}

/**
 * Upload a video from a URL in one call: start a session, stream the file,
 * and resume after network drops or 5xx answers, up to `maxAttempts` sends.
 */
export async function uploadVideoFromUrl(
    accessToken: string,
    options: {
        sourceUrl: string
        metadata: YouTubeVideoMetadata
        maxAttempts?: number
        onSession?: (sessionUri: string) => void | Promise<void>
    }
): Promise<YouTubeUploadedVideo> {
    const source = await describeUploadSource(options.sourceUrl)
    const sessionUri = await startResumableUpload(accessToken, {
        metadata: options.metadata,
        contentLength: source.contentLength,
        contentType: source.contentType,
    })
    await options.onSession?.(sessionUri)

    const maxAttempts = options.maxAttempts ?? 5
    let offset = 0
    let lastError: unknown
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const progress = await sendUploadBytes(
                accessToken,
                sessionUri,
                source,
                offset
            )
            if (progress.state === 'complete') return progress.video
            offset = progress.nextOffset
            continue
        } catch (error) {
            const retryable =
                !(error instanceof YouTubeApiError) ||
                isTransientYouTubeError(error)
            if (!retryable) throw error
            lastError = error
        }
        // The send broke off: ask Google where it stopped.
        const progress = await queryUploadProgress(
            accessToken,
            sessionUri,
            source.contentLength
        )
        if (progress.state === 'complete') return progress.video
        offset = progress.nextOffset
    }
    throw lastError instanceof Error
        ? lastError
        : new Error(`Upload did not finish after ${maxAttempts} attempts`)
}
