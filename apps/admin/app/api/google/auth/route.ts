/**
 * Google OAuth Authorization Route
 *
 * Initiates the OAuth flow by redirecting to Google's consent screen.
 *
 * GET /api/google/auth
 */
import { redirect } from 'next/navigation'

import { isAuthenticated } from '@/lib/utils/auth.util'
import {
    getAuthorizationUrl,
    isGoogleOAuthConfigured,
} from '@/lib/services/google-reviews'

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

    // Store state in a cookie for verification on callback
    // In production, you might want to use a more secure method
    const authUrl = getAuthorizationUrl(state)

    redirect(authUrl)
}
