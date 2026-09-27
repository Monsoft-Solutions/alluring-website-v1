/**
 * YouTube constants (epic #303)
 *
 * @module lib/constants/youtube
 */

/**
 * The only channel Connect accepts. Google's chooser lists every channel
 * the signing-in account can manage, and picking the wrong one would
 * publish clinic videos to a personal channel.
 */
export const YOUTUBE_CHANNEL_HANDLE = '@alluringplasticsurgery'

/** Admin page that hosts the connection. */
export const YOUTUBE_SETTINGS_PATH = '/social-media/youtube'

export const YOUTUBE_OAUTH_START_PATH = '/api/youtube/oauth/start'
export const YOUTUBE_OAUTH_CALLBACK_PATH = '/api/youtube/oauth/callback'

/** CSRF state for the Connect flow; separate from the Reviews flow's cookie. */
export const YOUTUBE_OAUTH_STATE_COOKIE = 'youtube_oauth_state'

/**
 * The callback URL for this deployment. It is derived from the request so
 * localhost, worktree ports and production all work, as long as each one
 * is registered on the OAuth client in Google Cloud.
 */
export function youtubeRedirectUri(origin: string): string {
    return `${origin}${YOUTUBE_OAUTH_CALLBACK_PATH}`
}

/** True when a channel handle is the Alluring channel (any letter case). */
export function isAlluringChannel(handle: string | null | undefined): boolean {
    return handle?.toLowerCase() === YOUTUBE_CHANNEL_HANDLE
}
