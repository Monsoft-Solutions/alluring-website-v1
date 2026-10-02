/**
 * YouTube Connection Service
 *
 * Owns the `youtube_connection` row: saving it after Connect, handing out
 * access tokens, and marking it for reconnection when Google stops
 * honouring the refresh token.
 *
 * @module lib/services/youtube/youtube-connection
 */
import { db } from '@workspace/db/client'
import {
    youtubeConnection,
    type YouTubeConnection,
} from '@workspace/db/schema/social-media'
import {
    decryptToken,
    encryptToken,
    refreshAccessToken,
    revokeToken,
    YouTubeAuthRevokedError,
    type YouTubeChannel,
} from '@workspace/youtube'
import { desc, eq, sql } from 'drizzle-orm'

/** Access tokens last an hour; refresh when less than this is left. */
const REFRESH_MARGIN_MS = 5 * 60 * 1000

/** Per-process cache so a batch of calls doesn't refresh on every one. */
const accessTokenCache = new Map<
    string,
    { accessToken: string; expiresAt: Date }
>()

/** The connected channel, or null before the first Connect. */
export async function getYouTubeConnection(): Promise<YouTubeConnection | null> {
    const [row] = await db
        .select()
        .from(youtubeConnection)
        .orderBy(desc(youtubeConnection.connectedAt))
        .limit(1)
    return row ?? null
}

/**
 * Store (or replace) the connection after a successful Connect. A
 * Reconnect of the same channel overwrites its row and clears any error.
 */
export async function saveYouTubeConnection(input: {
    channel: YouTubeChannel
    connectedEmail: string | null
    scopes: string[]
    refreshToken: string
}): Promise<void> {
    const values = {
        channelTitle: input.channel.title,
        channelHandle: input.channel.customUrl,
        channelThumbnailUrl: input.channel.thumbnailUrl,
        uploadsPlaylistId: input.channel.uploadsPlaylistId,
        connectedEmail: input.connectedEmail,
        scopes: input.scopes,
        refreshTokenEncrypted: encryptToken(input.refreshToken),
        status: 'connected' as const,
        lastError: null,
        connectedAt: sql`now()`,
        updatedAt: sql`now()`,
    }
    await db
        .insert(youtubeConnection)
        .values({ channelId: input.channel.id, ...values })
        .onConflictDoUpdate({
            target: youtubeConnection.channelId,
            set: values,
        })
    accessTokenCache.delete(input.channel.id)
}

/** Flag the connection as broken, with Google's reason. */
export async function markYouTubeNeedsReconnect(
    connectionId: string,
    reason: string
): Promise<void> {
    await db
        .update(youtubeConnection)
        .set({
            status: 'needs_reconnect',
            lastError: reason,
            updatedAt: sql`now()`,
        })
        .where(eq(youtubeConnection.id, connectionId))
}

/**
 * A working access token for the connected channel.
 *
 * Throws when nothing is connected, and throws YouTubeAuthRevokedError
 * (after marking the row) when Google refuses the refresh token, so
 * callers can pause instead of retrying.
 */
export async function getYouTubeAccessToken(): Promise<{
    accessToken: string
    connection: YouTubeConnection
}> {
    const connection = await getYouTubeConnection()
    if (!connection) throw new Error('YouTube is not connected')
    if (connection.status === 'needs_reconnect') {
        throw new YouTubeAuthRevokedError(
            connection.lastError ?? 'The YouTube connection needs a Reconnect'
        )
    }

    const cached = accessTokenCache.get(connection.channelId)
    if (cached && cached.expiresAt.getTime() - Date.now() > REFRESH_MARGIN_MS) {
        return { accessToken: cached.accessToken, connection }
    }

    try {
        const fresh = await refreshAccessToken(
            decryptToken(connection.refreshTokenEncrypted)
        )
        accessTokenCache.set(connection.channelId, fresh)
        return { accessToken: fresh.accessToken, connection }
    } catch (error) {
        if (error instanceof YouTubeAuthRevokedError) {
            accessTokenCache.delete(connection.channelId)
            await markYouTubeNeedsReconnect(connection.id, error.message)
        }
        throw error
    }
}

/**
 * Disconnect: revoke the token at Google (best effort; a token that is
 * already dead is fine) and delete the row.
 */
export async function disconnectYouTube(): Promise<{ revoked: boolean }> {
    const connection = await getYouTubeConnection()
    if (!connection) return { revoked: false }

    let revoked = false
    try {
        await revokeToken(decryptToken(connection.refreshTokenEncrypted))
        revoked = true
    } catch (error) {
        console.warn(
            '[youtube] Revoking the token at Google failed; deleting the row anyway:',
            error instanceof Error ? error.message : error
        )
    }

    await db
        .delete(youtubeConnection)
        .where(eq(youtubeConnection.id, connection.id))
    accessTokenCache.delete(connection.channelId)
    return { revoked }
}
