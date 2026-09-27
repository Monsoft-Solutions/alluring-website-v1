/**
 * YouTube page data
 *
 * The stored connection plus a live read of the channel and its latest
 * uploads, which doubles as a check that the token still works.
 *
 * @module lib/queries/youtube
 */
import type { YouTubeConnection } from '@workspace/db/schema/social-media'
import {
    getMyChannel,
    isYouTubeConfigured,
    listChannelVideos,
    YouTubeAuthRevokedError,
    type YouTubeChannel,
    type YouTubeChannelVideo,
} from '@workspace/youtube'

import {
    getYouTubeAccessToken,
    getYouTubeConnection,
} from '@/lib/services/youtube/youtube-connection.service'

const LATEST_VIDEOS = 12

export type YouTubeOverview = {
    /** OAuth client + encryption key present in env. */
    configured: boolean
    connection: Omit<YouTubeConnection, 'refreshTokenEncrypted'> | null
    channel: YouTubeChannel | null
    videos: YouTubeChannelVideo[]
    /** Why the live read failed, when it did. */
    liveError: string | null
}

export async function getYouTubeOverview(): Promise<YouTubeOverview> {
    const configured = isYouTubeConfigured()
    const stored = await getYouTubeConnection()
    const overview: YouTubeOverview = {
        configured,
        connection: stored ? withoutToken(stored) : null,
        channel: null,
        videos: [],
        liveError: null,
    }
    if (!stored || !configured || stored.status === 'needs_reconnect') {
        return overview
    }

    try {
        const { accessToken } = await getYouTubeAccessToken()
        const channel = await getMyChannel(accessToken)
        overview.channel = channel
        const uploads = channel?.uploadsPlaylistId ?? stored.uploadsPlaylistId
        if (uploads) {
            const page = await listChannelVideos(accessToken, uploads, {
                maxResults: LATEST_VIDEOS,
            })
            overview.videos = page.items
        }
    } catch (error) {
        overview.liveError =
            error instanceof Error ? error.message : String(error)
        if (error instanceof YouTubeAuthRevokedError) {
            // The service just flagged the row; show the fresh status.
            const refreshed = await getYouTubeConnection()
            overview.connection = refreshed ? withoutToken(refreshed) : null
        }
    }
    return overview
}

function withoutToken(
    row: YouTubeConnection
): Omit<YouTubeConnection, 'refreshTokenEncrypted'> {
    const copy: Partial<YouTubeConnection> = { ...row }
    delete copy.refreshTokenEncrypted
    return copy as Omit<YouTubeConnection, 'refreshTokenEncrypted'>
}
