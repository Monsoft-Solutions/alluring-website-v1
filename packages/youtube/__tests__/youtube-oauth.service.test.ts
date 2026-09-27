import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    buildAuthorizationUrl,
    emailFromIdToken,
    exchangeAuthorizationCode,
    isYouTubeConfigured,
    refreshAccessToken,
} from '../src/youtube-oauth.service'
import {
    YouTubeApiError,
    YouTubeAuthRevokedError,
    YouTubeNotConfiguredError,
} from '../src/youtube-error.util'

const fetchMock =
    vi.fn<(url: string | URL, init?: RequestInit) => Promise<Response>>()

function idToken(claims: Record<string, unknown>): string {
    const part = (value: unknown) =>
        Buffer.from(JSON.stringify(value)).toString('base64url')
    return `${part({ alg: 'RS256' })}.${part(claims)}.sig`
}

describe('YouTube OAuth', () => {
    beforeEach(() => {
        vi.stubEnv('YOUTUBE_OAUTH_CLIENT_ID', 'client-id')
        vi.stubEnv('YOUTUBE_OAUTH_CLIENT_SECRET', 'client-secret')
        vi.stubEnv('YOUTUBE_TOKEN_ENCRYPTION_KEY', 'a2V5')
        vi.stubGlobal('fetch', fetchMock)
        fetchMock.mockReset()
    })

    afterEach(() => {
        vi.unstubAllEnvs()
        vi.unstubAllGlobals()
    })

    it('builds a consent URL that asks for offline access and the channel chooser', () => {
        const url = new URL(
            buildAuthorizationUrl({
                redirectUri: 'http://localhost:3155/api/youtube/oauth/callback',
                state: 'state-123',
            })
        )
        expect(url.origin + url.pathname).toBe(
            'https://accounts.google.com/o/oauth2/v2/auth'
        )
        expect(url.searchParams.get('client_id')).toBe('client-id')
        expect(url.searchParams.get('access_type')).toBe('offline')
        expect(url.searchParams.get('prompt')).toBe('consent select_account')
        expect(url.searchParams.get('state')).toBe('state-123')
        expect(url.searchParams.get('scope')?.split(' ')).toEqual([
            'openid',
            'email',
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.upload',
        ])
    })

    it('reports what is missing when the client is not configured', () => {
        vi.stubEnv('YOUTUBE_OAUTH_CLIENT_SECRET', '')
        expect(isYouTubeConfigured()).toBe(false)
        expect(() =>
            buildAuthorizationUrl({ redirectUri: 'http://x', state: 's' })
        ).toThrow(YouTubeNotConfiguredError)
    })

    it('exchanges the code and reads the consenting email', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    access_token: 'at',
                    refresh_token: 'rt',
                    expires_in: 3600,
                    scope: 'openid https://www.googleapis.com/auth/youtube',
                    id_token: idToken({
                        email: 'adriano@monsoftsolutions.com',
                    }),
                })
            )
        )
        const tokens = await exchangeAuthorizationCode({
            code: 'code-1',
            redirectUri: 'http://localhost/cb',
        })
        expect(tokens.refreshToken).toBe('rt')
        expect(tokens.email).toBe('adriano@monsoftsolutions.com')
        expect(tokens.scopes).toContain(
            'https://www.googleapis.com/auth/youtube'
        )

        const body = fetchMock.mock.calls[0]![1]!.body as URLSearchParams
        expect(body.get('grant_type')).toBe('authorization_code')
        expect(body.get('redirect_uri')).toBe('http://localhost/cb')
    })

    it('turns invalid_grant into a revoked-connection error', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    error: 'invalid_grant',
                    error_description: 'Token has been expired or revoked.',
                }),
                { status: 400 }
            )
        )
        await expect(refreshAccessToken('rt')).rejects.toBeInstanceOf(
            YouTubeAuthRevokedError
        )
    })

    it('keeps other token errors as API errors', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ error: 'invalid_client' }), {
                status: 401,
            })
        )
        await expect(refreshAccessToken('rt')).rejects.toBeInstanceOf(
            YouTubeApiError
        )
    })

    it('reads no email from a missing or malformed ID token', () => {
        expect(emailFromIdToken(undefined)).toBeNull()
        expect(emailFromIdToken('not-a-jwt')).toBeNull()
        expect(emailFromIdToken(idToken({ sub: '1' }))).toBeNull()
    })
})
