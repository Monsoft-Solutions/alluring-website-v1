/**
 * YouTube Connect: start
 *
 * Sends the admin to Google's consent screen, where they pick the Alluring
 * channel. The callback finishes the connection.
 *
 * GET /api/youtube/oauth/start
 */
import { buildAuthorizationUrl, isYouTubeConfigured } from '@workspace/youtube'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { env } from '@/env'
import { OAUTH_STATE_COOKIE_MAX_AGE } from '@/lib/constants/oauth.constant'
import {
    YOUTUBE_OAUTH_STATE_COOKIE,
    YOUTUBE_SETTINGS_PATH,
    youtubeRedirectUri,
} from '@/lib/constants/youtube.constant'
import { isAuthenticated } from '@/lib/utils/auth.util'

export async function GET(request: NextRequest) {
    if (!(await isAuthenticated())) redirect('/login')

    if (!isYouTubeConfigured()) {
        redirect(`${YOUTUBE_SETTINGS_PATH}?error=not_configured`)
    }

    const state = crypto.randomUUID()
    const cookieStore = await cookies()
    cookieStore.set(YOUTUBE_OAUTH_STATE_COOKIE, state, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: OAUTH_STATE_COOKIE_MAX_AGE,
        path: '/',
    })

    redirect(
        buildAuthorizationUrl({
            redirectUri: youtubeRedirectUri(request.nextUrl.origin),
            state,
        })
    )
}
