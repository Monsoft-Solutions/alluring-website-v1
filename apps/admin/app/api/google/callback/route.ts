/**
 * Google OAuth Callback Route
 *
 * Handles the OAuth callback from Google after user authorization.
 * Exchanges the authorization code for tokens and stores them.
 *
 * GET /api/google/callback?code=xxx&state=xxx
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

import { isAuthenticated } from '@/lib/utils/auth.util'
import { handleOAuthCallback } from '@/lib/actions/google-reviews.action'
import { OAUTH_STATE_COOKIE } from '@/lib/constants/oauth.constant'

/**
 * Zod schema for validating OAuth callback query parameters
 */
const oauthCallbackSchema = z.object({
    code: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    error: z.string().optional().nullable(),
    error_description: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()

    try {
        // Verify admin is authenticated
        const authenticated = await isAuthenticated()
        if (!authenticated) {
            redirect('/login')
        }

        // Parse and validate query parameters using Zod
        const searchParams = request.nextUrl.searchParams
        const rawParams = {
            code: searchParams.get('code'),
            state: searchParams.get('state'),
            error: searchParams.get('error'),
            error_description: searchParams.get('error_description'),
        }

        const parseResult = oauthCallbackSchema.safeParse(rawParams)

        if (!parseResult.success) {
            console.error(
                'Invalid OAuth callback parameters:',
                parseResult.error
            )
            redirect('/reviews/settings?error=invalid_callback_params')
        }

        const { code, state, error, error_description } = parseResult.data

        // Handle error from Google
        if (error) {
            console.error('OAuth error from Google:', error, error_description)
            redirect(
                `/reviews/settings?error=oauth_failed&message=${encodeURIComponent(error_description ?? error)}`
            )
        }

        // Verify state was provided
        if (!state) {
            redirect('/reviews/settings?error=missing_state')
        }

        // Retrieve and validate state cookie (CSRF protection)
        const storedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value

        if (!storedState) {
            console.error('OAuth state cookie not found')
            redirect('/reviews/settings?error=state_cookie_missing')
        }

        if (storedState !== state) {
            console.error('OAuth state mismatch - possible CSRF attack')
            redirect('/reviews/settings?error=state_mismatch')
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
    } finally {
        // Always clear the state cookie on success or failure
        cookieStore.delete(OAUTH_STATE_COOKIE)
    }
}
