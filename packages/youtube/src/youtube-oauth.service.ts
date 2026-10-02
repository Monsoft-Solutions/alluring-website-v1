/**
 * YouTube OAuth
 *
 * The YouTube Data API does not accept service accounts, so the channel is
 * reached through a person's consent: a Manager of the channel clicks
 * Connect, picks the Alluring channel in Google's chooser, and we keep the
 * refresh token that comes back.
 *
 * `prompt=consent select_account` makes Google show the account (and
 * channel) chooser every time and always return a refresh token, which a
 * Reconnect needs.
 *
 * @module @workspace/youtube — oauth
 */
import { readYouTubeEnv } from './env.js'
import {
    YouTubeAuthRevokedError,
    YouTubeNotConfiguredError,
    parseYouTubeError,
} from './youtube-error.util.js'

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke'

/**
 * `youtube` manages the channel (edit videos, playlists, thumbnails);
 * `youtube.upload` is named explicitly because videos.insert lists it.
 * `openid email` only tell us which Google account clicked Connect.
 */
export const YOUTUBE_OAUTH_SCOPES = [
    'openid',
    'email',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.upload',
] as const

/** What the code exchange returns, in our own words. */
export type YouTubeTokens = {
    accessToken: string
    /** Present on first consent and whenever `prompt=consent` was sent. */
    refreshToken: string | null
    expiresAt: Date
    scopes: string[]
    /** Email of the Google account that consented, read from the ID token. */
    email: string | null
}

/** A fresh access token from the stored refresh token. */
export type YouTubeAccessToken = {
    accessToken: string
    expiresAt: Date
}

type TokenResponse = {
    access_token: string
    refresh_token?: string
    expires_in: number
    scope?: string
    id_token?: string
}

/** True when the OAuth client and the encryption key are all set. */
export function isYouTubeConfigured(): boolean {
    const env = readYouTubeEnv()
    return !!(
        env.YOUTUBE_OAUTH_CLIENT_ID &&
        env.YOUTUBE_OAUTH_CLIENT_SECRET &&
        env.YOUTUBE_TOKEN_ENCRYPTION_KEY
    )
}

/** The OAuth client, or an error naming what is missing. */
function getClient(): { clientId: string; clientSecret: string } {
    const env = readYouTubeEnv()
    const missing = [
        !env.YOUTUBE_OAUTH_CLIENT_ID && 'YOUTUBE_OAUTH_CLIENT_ID',
        !env.YOUTUBE_OAUTH_CLIENT_SECRET && 'YOUTUBE_OAUTH_CLIENT_SECRET',
    ].filter((name): name is string => !!name)
    if (missing.length > 0) throw new YouTubeNotConfiguredError(missing)
    return {
        clientId: env.YOUTUBE_OAUTH_CLIENT_ID!,
        clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET!,
    }
}

/**
 * Google's consent URL. `redirectUri` must match one registered on the
 * OAuth client exactly, and the callback must send the same value back.
 */
export function buildAuthorizationUrl(options: {
    redirectUri: string
    state: string
}): string {
    const { clientId } = getClient()
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: options.redirectUri,
        response_type: 'code',
        scope: YOUTUBE_OAUTH_SCOPES.join(' '),
        access_type: 'offline',
        prompt: 'consent select_account',
        include_granted_scopes: 'true',
        state: options.state,
    })
    return `${AUTH_URL}?${params.toString()}`
}

/** POST a form to the token endpoint and return the parsed body. */
async function postTokenEndpoint(
    body: Record<string, string>
): Promise<TokenResponse> {
    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(body),
    })
    const text = await response.text()
    if (!response.ok) {
        const error = parseYouTubeError(response.status, text)
        if (error.reason === 'invalid_grant') {
            throw new YouTubeAuthRevokedError(error.message)
        }
        throw error
    }
    return JSON.parse(text) as TokenResponse
}

/**
 * The `email` claim of an ID token. The token came straight from Google's
 * token endpoint over TLS, so it is decoded, not verified.
 */
export function emailFromIdToken(idToken: string | undefined): string | null {
    const payload = idToken?.split('.')[1]
    if (!payload) return null
    try {
        const claims = JSON.parse(
            Buffer.from(payload, 'base64url').toString('utf8')
        ) as { email?: unknown }
        return typeof claims.email === 'string' ? claims.email : null
    } catch {
        return null
    }
}

/** Trade the callback's `code` for tokens. */
export async function exchangeAuthorizationCode(options: {
    code: string
    redirectUri: string
}): Promise<YouTubeTokens> {
    const { clientId, clientSecret } = getClient()
    const data = await postTokenEndpoint({
        client_id: clientId,
        client_secret: clientSecret,
        code: options.code,
        grant_type: 'authorization_code',
        redirect_uri: options.redirectUri,
    })
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? null,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        scopes: data.scope?.split(' ').filter(Boolean) ?? [],
        email: emailFromIdToken(data.id_token),
    }
}

/**
 * A new access token (valid about an hour). Throws YouTubeAuthRevokedError
 * when Google no longer honours the refresh token.
 */
export async function refreshAccessToken(
    refreshToken: string
): Promise<YouTubeAccessToken> {
    const { clientId, clientSecret } = getClient()
    const data = await postTokenEndpoint({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
    })
    return {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
    }
}

/**
 * Revoke a token at Google, so Disconnect really cuts access. A token that
 * is already invalid counts as revoked.
 */
export async function revokeToken(token: string): Promise<void> {
    const response = await fetch(REVOKE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token }),
    })
    if (response.ok || response.status === 400) return
    throw parseYouTubeError(response.status, await response.text())
}
