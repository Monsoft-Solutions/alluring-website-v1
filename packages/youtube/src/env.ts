/**
 * Environment access for the YouTube layer
 *
 * Parsed on every call instead of snapshotted at import (as createEnv would),
 * so a standalone consumer (a script, a future MCP server) can load its .env
 * files at any point before the first request, and tests can stub variables
 * per case.
 *
 * Only the app's own identity lives here. Which channel is connected, and
 * the refresh token for it, live in the `youtube_connection` table.
 *
 * @module @workspace/youtube — env
 */
import { z } from 'zod'

const envSchema = z.object({
    /** OAuth client (Web application) in Google Cloud project vernisai-1739236652392. */
    YOUTUBE_OAUTH_CLIENT_ID: z.string().optional(),
    YOUTUBE_OAUTH_CLIENT_SECRET: z.string().optional(),
    /** 32 random bytes, base64. Encrypts the stored refresh token. */
    YOUTUBE_TOKEN_ENCRYPTION_KEY: z.string().optional(),
})

export type YouTubeEnv = z.infer<typeof envSchema>

/** Read the YouTube variables from process.env, as they are right now. */
export function readYouTubeEnv(): YouTubeEnv {
    return envSchema.parse({
        YOUTUBE_OAUTH_CLIENT_ID:
            process.env.YOUTUBE_OAUTH_CLIENT_ID || undefined,
        YOUTUBE_OAUTH_CLIENT_SECRET:
            process.env.YOUTUBE_OAUTH_CLIENT_SECRET || undefined,
        YOUTUBE_TOKEN_ENCRYPTION_KEY:
            process.env.YOUTUBE_TOKEN_ENCRYPTION_KEY || undefined,
    })
}
