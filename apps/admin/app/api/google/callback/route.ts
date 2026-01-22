/**
 * Google OAuth Callback Route
 *
 * Handles the OAuth callback from Google after user authorization.
 * Exchanges the authorization code for tokens and stores them.
 *
 * GET /api/google/callback?code=xxx&state=xxx
 */
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { isAuthenticated } from '@/lib/utils/auth.util'
import { handleOAuthCallback } from '@/lib/actions/google-reviews.action'

export async function GET(request: NextRequest) {
    // Verify admin is authenticated
    const authenticated = await isAuthenticated()
    if (!authenticated) {
        redirect('/login')
    }

    // Get code and state from query params
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Handle error from Google
    if (error) {
        const errorDescription = searchParams.get('error_description')
        console.error('OAuth error from Google:', error, errorDescription)
        redirect(
            `/reviews/settings?error=oauth_failed&message=${encodeURIComponent(errorDescription ?? error)}`
        )
    }

    // Verify code was provided
    if (!code) {
        redirect('/reviews/settings?error=no_code')
    }

    // Exchange code for tokens
    const result = await handleOAuthCallback(code)

    if (!result.success) {
        redirect(
            `/reviews/settings?error=token_exchange_failed&message=${encodeURIComponent(result.error ?? 'Unknown error')}`
        )
    }

    // Success - redirect to settings to complete setup
    redirect('/reviews/settings?success=connected')
}
