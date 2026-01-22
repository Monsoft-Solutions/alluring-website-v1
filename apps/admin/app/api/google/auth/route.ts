/**
 * Google OAuth Authorization Route
 *
 * Initiates the OAuth flow by redirecting to Google's consent screen.
 *
 * GET /api/google/auth
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { isAuthenticated } from '@/lib/utils/auth.util'
import {
    getAuthorizationUrl,
    isGoogleOAuthConfigured,
} from '@/lib/services/google-reviews'
import {
    OAUTH_STATE_COOKIE,
    OAUTH_STATE_COOKIE_MAX_AGE,
} from '@/lib/constants/oauth.constant'

export async function GET() {
    // Verify admin is authenticated
    const authenticated = await isAuthenticated()
    if (!authenticated) {
        redirect('/login')
    }

    // Check if OAuth is configured
    if (!isGoogleOAuthConfigured()) {
        redirect('/reviews/settings?error=oauth_not_configured')
    }

    // Generate random state for CSRF protection
    const state = crypto.randomUUID()

    // Store state in a secure, HttpOnly cookie for verification on callback
    const cookieStore = await cookies()
    cookieStore.set(OAUTH_STATE_COOKIE, state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: OAUTH_STATE_COOKIE_MAX_AGE,
        path: '/',
    })

    const authUrl = getAuthorizationUrl(state)

    redirect(authUrl)
}
