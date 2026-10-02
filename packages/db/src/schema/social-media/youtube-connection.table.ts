/**
 * YouTube Connection Table
 *
 * The channel the admin publishes to, connected with the Connect YouTube
 * button (epic #303). One row per channel; in practice there is one.
 *
 * The refresh token is stored encrypted (AES-256-GCM, key in
 * YOUTUBE_TOKEN_ENCRYPTION_KEY), so a database dump alone cannot reach the
 * channel. Access tokens are never stored: they last an hour and are
 * refreshed on demand.
 *
 * @module @workspace/db/schema/social-media/youtube-connection
 */
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * connected: the stored token works.
 * needs_reconnect: Google refused it (password change, manager removed,
 * access revoked); publishing pauses until someone clicks Reconnect.
 */
export const youtubeConnectionStatus = pgEnum('youtube_connection_status', [
    'connected',
    'needs_reconnect',
])

export const youtubeConnection = pgTable('youtube_connection', {
    id: uuid('id').primaryKey().defaultRandom(),

    /** YouTube channel id (UC…), read from Google after sign-in. */
    channelId: text('channel_id').notNull().unique(),

    channelTitle: text('channel_title').notNull(),

    /** Handle, e.g. @alluringplasticsurgery. */
    channelHandle: text('channel_handle'),

    channelThumbnailUrl: text('channel_thumbnail_url'),

    /** The playlist every upload lands in. */
    uploadsPlaylistId: text('uploads_playlist_id'),

    /** Google account that clicked Connect. */
    connectedEmail: text('connected_email'),

    /** Scopes Google granted. */
    scopes: text('scopes').array().notNull().default([]),

    /** `v1.<iv>.<tag>.<ciphertext>` from @workspace/youtube encryptToken. */
    refreshTokenEncrypted: text('refresh_token_encrypted').notNull(),

    status: youtubeConnectionStatus('status').default('connected').notNull(),

    /** Google's last refusal, shown next to the Reconnect button. */
    lastError: text('last_error'),

    /** DB now() (Miami wall time); write updates with sql`now()`. */
    connectedAt: timestamp('connected_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type YouTubeConnection = typeof youtubeConnection.$inferSelect
export type InsertYouTubeConnection = typeof youtubeConnection.$inferInsert
