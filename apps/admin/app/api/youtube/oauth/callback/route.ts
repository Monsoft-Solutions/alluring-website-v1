/**
 * YouTube Connect: callback
 *
 * Google sends the admin back here with a code. We check the CSRF state,
 * trade the code for tokens, confirm the chosen channel is the Alluring
 * one, and store the encrypted refresh token.
 *
 * Every outcome ends in a redirect to the YouTube page with `success` or
 * `error` (+ `message`), which the page turns into a banner.
 *
 * GET /api/youtube/oauth/callback?code=…&state=…
 */
import {
    exchangeAuthorizationCode,
    getMyChannel,
    revokeToken,
} from '@workspace/youtube'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import {
    isAlluringChannel,
    YOUTUBE_OAUTH_STATE_COOKIE,
    YOUTUBE_SETTINGS_PATH,
    youtubeRedirectUri,
} from '@/lib/constants/youtube.constant'
import { saveYouTubeConnection } from '@/lib/services/youtube/youtube-connection.service'
import { isAuthenticated } from '@/lib/utils/auth.util'

/** Where to send the admin, with a result code for the page's banner. */
function resultUrl(
    kind: 'success' | 'error',
    code: string,
    message?: string
): string {
    const params = new URLSearchParams({ [kind]: code })
    if (message) params.set('message', message)
    return `${YOUTUBE_SETTINGS_PATH}?${params.toString()}`
}

/**
 * Run the exchange and return the redirect target. Kept apart from GET so
 * `redirect()` (which throws) is never called inside a try block.
 */
async function completeConnection(
    request: NextRequest,
    storedState: string | undefined
): Promise<string> {
    const params = request.nextUrl.searchParams
    const googleError = params.get('error')
    if (googleError) {
        // access_denied = the admin pressed Cancel on Google's screen.
        return resultUrl(
            'error',
            googleError === 'access_denied' ? 'cancelled' : 'oauth_failed',
            params.get('error_description') ?? googleError
        )
    }

    const state = params.get('state')
    if (!state || !storedState || state !== storedState) {
        return resultUrl('error', 'state_mismatch')
    }

    const code = params.get('code')
    if (!code) return resultUrl('error', 'no_code')

    try {
        const tokens = await exchangeAuthorizationCode({
            code,
            redirectUri: youtubeRedirectUri(request.nextUrl.origin),
        })
        if (!tokens.refreshToken) return resultUrl('error', 'no_refresh_token')

        const channel = await getMyChannel(tokens.accessToken)
        if (!channel) {
            await revokeToken(tokens.refreshToken).catch(() => undefined)
            return resultUrl('error', 'no_channel')
        }
        if (!isAlluringChannel(channel.customUrl)) {
            await revokeToken(tokens.refreshToken).catch(() => undefined)
            return resultUrl(
                'error',
                'wrong_channel',
                `${channel.title} (${channel.customUrl ?? channel.id})`
            )
        }

        await saveYouTubeConnection({
            channel,
            connectedEmail: tokens.email,
            scopes: tokens.scopes,
            refreshToken: tokens.refreshToken,
        })
        return resultUrl('success', 'connected')
    } catch (error) {
        console.error('[youtube] Connect failed:', error)
        return resultUrl(
            'error',
            'connect_failed',
            error instanceof Error ? error.message : String(error)
        )
    }
}

export async function GET(request: NextRequest) {
    if (!(await isAuthenticated())) redirect('/login')

    const cookieStore = await cookies()
    const storedState = cookieStore.get(YOUTUBE_OAUTH_STATE_COOKIE)?.value
    cookieStore.delete(YOUTUBE_OAUTH_STATE_COOKIE)

    redirect(await completeConnection(request, storedState))
}
