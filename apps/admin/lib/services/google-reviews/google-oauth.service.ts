/**
 * Google OAuth Service
 *
 * Handles OAuth 2.0 authentication flow for Google Business Profile API.
 * Used to authorize the admin to access their business reviews.
 *
 * @module lib/services/google-reviews/google-oauth
 */

import { env } from '@/env'

/** OAuth 2.0 authorization endpoint */
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

/** OAuth 2.0 token endpoint */
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

/** Required scopes for Google Business Profile API */
const SCOPES = ['https://www.googleapis.com/auth/business.manage'].join(' ')

/**
 * OAuth token response from Google
 */
export type GoogleTokenResponse = {
    access_token: string
    refresh_token?: string
    expires_in: number
    token_type: string
    scope: string
}

/**
 * OAuth error response
 */
export type GoogleOAuthError = {
    error: string
    error_description?: string
}

/**
 * Check if Google Business OAuth is configured
 */
export function isGoogleOAuthConfigured(): boolean {
    return !!(
        env.GOOGLE_BUSINESS_CLIENT_ID &&
        env.GOOGLE_BUSINESS_CLIENT_SECRET &&
        env.GOOGLE_BUSINESS_REDIRECT_URI
    )
}

/**
 * Get the OAuth configuration
 * Throws if not configured
 */
function getOAuthConfig() {
    if (!isGoogleOAuthConfigured()) {
        throw new Error(
            'Google Business OAuth not configured. Set GOOGLE_BUSINESS_CLIENT_ID, GOOGLE_BUSINESS_CLIENT_SECRET, and GOOGLE_BUSINESS_REDIRECT_URI environment variables.'
        )
    }

    return {
        clientId: env.GOOGLE_BUSINESS_CLIENT_ID!,
        clientSecret: env.GOOGLE_BUSINESS_CLIENT_SECRET!,
        redirectUri: env.GOOGLE_BUSINESS_REDIRECT_URI!,
    }
}

/**
 * Generate the OAuth authorization URL
 *
 * This URL redirects the user to Google's consent screen.
 * After authorization, Google redirects back to the callback URL
 * with an authorization code.
 *
 * @param state - Optional state parameter for CSRF protection
 * @returns Authorization URL to redirect the user to
 */
export function getAuthorizationUrl(state?: string): string {
    const { clientId, redirectUri } = getOAuthConfig()

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: SCOPES,
        access_type: 'offline',
        prompt: 'consent',
    })

    if (state) {
        params.set('state', state)
    }

    return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange authorization code for access and refresh tokens
 *
 * Called after the user authorizes on Google's consent screen.
 * The authorization code is exchanged for tokens that can be
 * used to make API requests.
 *
 * @param code - Authorization code from OAuth callback
 * @returns Token response with access_token and refresh_token
 */
export async function exchangeCodeForTokens(
    code: string
): Promise<GoogleTokenResponse> {
    const { clientId, clientSecret, redirectUri } = getOAuthConfig()

    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
        }),
    })

    const data = (await response.json()) as
        | GoogleTokenResponse
        | GoogleOAuthError

    if (!response.ok) {
        const error = data as GoogleOAuthError
        throw new Error(
            `OAuth token exchange failed: ${error.error} - ${error.error_description ?? 'No description'}`
        )
    }

    return data as GoogleTokenResponse
}

/**
 * Refresh an expired access token
 *
 * Access tokens expire after 1 hour. Use the refresh token
 * to get a new access token without requiring user interaction.
 *
 * @param refreshToken - The refresh token from initial authorization
 * @returns New token response (may not include a new refresh_token)
 */
export async function refreshAccessToken(
    refreshToken: string
): Promise<GoogleTokenResponse> {
    const { clientId, clientSecret } = getOAuthConfig()

    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    })

    const data = (await response.json()) as
        | GoogleTokenResponse
        | GoogleOAuthError

    if (!response.ok) {
        const error = data as GoogleOAuthError
        throw new Error(
            `OAuth token refresh failed: ${error.error} - ${error.error_description ?? 'No description'}`
        )
    }

    return data as GoogleTokenResponse
}

/**
 * Calculate token expiration timestamp
 *
 * @param expiresIn - Number of seconds until token expires
 * @returns Date object representing when the token expires
 */
export function calculateTokenExpiry(expiresIn: number): Date {
    return new Date(Date.now() + expiresIn * 1000)
}
