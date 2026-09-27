/**
 * YouTube Data API client
 *
 * Plain fetch against the v3 REST API; every call takes an access token, so
 * this module knows nothing about where tokens are stored. The admin gets a
 * token from its `youtube_connection` row and passes it in.
 *
 * @module @workspace/youtube — client
 */
import { parseYouTubeError } from './youtube-error.util.js'
import type {
    YouTubeChannel,
    YouTubeChannelVideo,
    YouTubePage,
    YouTubePlaylist,
    YouTubePrivacyStatus,
    YouTubeVideoStatus,
} from './youtube.type.js'

export const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'
export const YOUTUBE_UPLOAD_BASE =
    'https://www.googleapis.com/upload/youtube/v3'

type Thumbnails = Record<string, { url?: string } | undefined>

/** Largest thumbnail the API offered. */
function pickThumbnail(thumbnails: Thumbnails | undefined): string | null {
    for (const size of ['maxres', 'high', 'medium', 'default']) {
        const url = thumbnails?.[size]?.url
        if (url) return url
    }
    return null
}

function toNumber(value: string | undefined): number | null {
    if (value === undefined) return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
}

/** GET/POST/PUT a Data API path and return the parsed JSON body. */
export async function youtubeRequest<T>(
    accessToken: string,
    path: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
        query?: Record<string, string | number | boolean | undefined>
        body?: unknown
    } = {}
): Promise<T> {
    const url = new URL(`${YOUTUBE_API_BASE}/${path}`)
    for (const [key, value] of Object.entries(options.query ?? {})) {
        if (value !== undefined) url.searchParams.set(key, String(value))
    }
    const response = await fetch(url, {
        method: options.method ?? 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            ...(options.body !== undefined && {
                'Content-Type': 'application/json',
            }),
        },
        body:
            options.body !== undefined
                ? JSON.stringify(options.body)
                : undefined,
    })
    const text = await response.text()
    if (!response.ok) throw parseYouTubeError(response.status, text)
    return (text ? JSON.parse(text) : {}) as T
}

type ChannelResource = {
    id: string
    snippet?: { title?: string; customUrl?: string; thumbnails?: Thumbnails }
    contentDetails?: { relatedPlaylists?: { uploads?: string } }
    statistics?: {
        subscriberCount?: string
        videoCount?: string
        viewCount?: string
    }
}

/**
 * The channel this token acts as, or null when the Google account has no
 * channel (it signed in as itself instead of picking the brand channel).
 */
export async function getMyChannel(
    accessToken: string
): Promise<YouTubeChannel | null> {
    const data = await youtubeRequest<{ items?: ChannelResource[] }>(
        accessToken,
        'channels',
        {
            query: {
                part: 'snippet,contentDetails,statistics',
                mine: true,
            },
        }
    )
    const channel = data.items?.[0]
    if (!channel) return null
    return {
        id: channel.id,
        title: channel.snippet?.title ?? '',
        customUrl: channel.snippet?.customUrl ?? null,
        thumbnailUrl: pickThumbnail(channel.snippet?.thumbnails),
        uploadsPlaylistId:
            channel.contentDetails?.relatedPlaylists?.uploads ?? null,
        subscriberCount: toNumber(channel.statistics?.subscriberCount),
        videoCount: toNumber(channel.statistics?.videoCount),
        viewCount: toNumber(channel.statistics?.viewCount),
    }
}

type PlaylistItemResource = {
    snippet?: {
        title?: string
        publishedAt?: string
        thumbnails?: Thumbnails
        resourceId?: { videoId?: string }
    }
    contentDetails?: { videoId?: string; videoPublishedAt?: string }
    status?: { privacyStatus?: YouTubePrivacyStatus }
}

/** Newest-first page of the channel's uploads (private ones included). */
export async function listChannelVideos(
    accessToken: string,
    uploadsPlaylistId: string,
    options: { maxResults?: number; pageToken?: string } = {}
): Promise<YouTubePage<YouTubeChannelVideo>> {
    const data = await youtubeRequest<{
        items?: PlaylistItemResource[]
        nextPageToken?: string
    }>(accessToken, 'playlistItems', {
        query: {
            part: 'snippet,contentDetails,status',
            playlistId: uploadsPlaylistId,
            maxResults: Math.min(options.maxResults ?? 25, 50),
            pageToken: options.pageToken,
        },
    })
    return {
        items: (data.items ?? []).map((item) => ({
            videoId:
                item.contentDetails?.videoId ??
                item.snippet?.resourceId?.videoId ??
                '',
            title: item.snippet?.title ?? '',
            publishedAt:
                item.contentDetails?.videoPublishedAt ??
                item.snippet?.publishedAt ??
                null,
            thumbnailUrl: pickThumbnail(item.snippet?.thumbnails),
            privacyStatus: item.status?.privacyStatus ?? null,
        })),
        nextPageToken: data.nextPageToken ?? null,
    }
}

type PlaylistResource = {
    id: string
    snippet?: { title?: string }
    contentDetails?: { itemCount?: number }
    status?: { privacyStatus?: YouTubePrivacyStatus }
}

function toPlaylist(resource: PlaylistResource): YouTubePlaylist {
    return {
        id: resource.id,
        title: resource.snippet?.title ?? '',
        itemCount: resource.contentDetails?.itemCount ?? 0,
        privacyStatus: resource.status?.privacyStatus ?? null,
    }
}

/** Every playlist on the channel (follows pages). */
export async function listPlaylists(
    accessToken: string
): Promise<YouTubePlaylist[]> {
    const playlists: YouTubePlaylist[] = []
    let pageToken: string | undefined
    do {
        const data = await youtubeRequest<{
            items?: PlaylistResource[]
            nextPageToken?: string
        }>(accessToken, 'playlists', {
            query: {
                part: 'snippet,contentDetails,status',
                mine: true,
                maxResults: 50,
                pageToken,
            },
        })
        playlists.push(...(data.items ?? []).map(toPlaylist))
        pageToken = data.nextPageToken
    } while (pageToken)
    return playlists
}

export async function createPlaylist(
    accessToken: string,
    options: {
        title: string
        description?: string
        privacyStatus?: YouTubePrivacyStatus
    }
): Promise<YouTubePlaylist> {
    const created = await youtubeRequest<PlaylistResource>(
        accessToken,
        'playlists',
        {
            method: 'POST',
            query: { part: 'snippet,status' },
            body: {
                snippet: {
                    title: options.title,
                    description: options.description ?? '',
                },
                status: { privacyStatus: options.privacyStatus ?? 'public' },
            },
        }
    )
    return toPlaylist(created)
}

export async function addVideoToPlaylist(
    accessToken: string,
    playlistId: string,
    videoId: string
): Promise<void> {
    await youtubeRequest(accessToken, 'playlistItems', {
        method: 'POST',
        query: { part: 'snippet' },
        body: {
            snippet: {
                playlistId,
                resourceId: { kind: 'youtube#video', videoId },
            },
        },
    })
}

type VideoResource = {
    id: string
    snippet?: { title?: string }
    status?: {
        uploadStatus?: string
        privacyStatus?: YouTubePrivacyStatus
        failureReason?: string
        rejectionReason?: string
    }
    processingDetails?: { processingStatus?: string }
}

/** Upload and processing state for up to 50 videos. Missing ids are left out. */
export async function getVideoStatuses(
    accessToken: string,
    videoIds: string[]
): Promise<YouTubeVideoStatus[]> {
    if (videoIds.length === 0) return []
    if (videoIds.length > 50) {
        throw new Error('getVideoStatuses takes at most 50 ids per call')
    }
    const data = await youtubeRequest<{ items?: VideoResource[] }>(
        accessToken,
        'videos',
        {
            query: {
                part: 'snippet,status,processingDetails',
                id: videoIds.join(','),
            },
        }
    )
    return (data.items ?? []).map((video) => ({
        videoId: video.id,
        title: video.snippet?.title ?? '',
        uploadStatus: video.status?.uploadStatus ?? null,
        privacyStatus: video.status?.privacyStatus ?? null,
        processingStatus: video.processingDetails?.processingStatus ?? null,
        failureReason: video.status?.failureReason ?? null,
        rejectionReason: video.status?.rejectionReason ?? null,
    }))
}

/**
 * Replace a video's title, description, tags and category. videos.update
 * overwrites the whole snippet, so every field is sent, not just changed
 * ones.
 */
export async function updateVideoSnippet(
    accessToken: string,
    videoId: string,
    snippet: {
        title: string
        description: string
        tags: string[]
        categoryId: string
    }
): Promise<void> {
    await youtubeRequest(accessToken, 'videos', {
        method: 'PUT',
        query: { part: 'snippet' },
        body: { id: videoId, snippet },
    })
}

/**
 * Change who can see a video. Unaudited API projects are forced to private
 * whatever is sent here.
 */
export async function setVideoPrivacy(
    accessToken: string,
    videoId: string,
    privacyStatus: YouTubePrivacyStatus
): Promise<void> {
    await youtubeRequest(accessToken, 'videos', {
        method: 'PUT',
        query: { part: 'status' },
        body: {
            id: videoId,
            status: { privacyStatus, selfDeclaredMadeForKids: false },
        },
    })
}

/**
 * Set a custom thumbnail from an image URL (JPEG or PNG, under 2 MB).
 * YouTube only allows this on channels with a verified phone number.
 */
export async function setThumbnailFromUrl(
    accessToken: string,
    videoId: string,
    imageUrl: string
): Promise<void> {
    const image = await fetch(imageUrl)
    if (!image.ok) {
        throw new Error(
            `Could not fetch thumbnail (${image.status}): ${imageUrl}`
        )
    }
    const bytes = new Uint8Array(await image.arrayBuffer())
    const url = new URL(`${YOUTUBE_UPLOAD_BASE}/thumbnails/set`)
    url.searchParams.set('videoId', videoId)
    url.searchParams.set('uploadType', 'media')
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': image.headers.get('content-type') ?? 'image/jpeg',
        },
        body: bytes,
    })
    if (!response.ok) {
        throw parseYouTubeError(response.status, await response.text())
    }
}
