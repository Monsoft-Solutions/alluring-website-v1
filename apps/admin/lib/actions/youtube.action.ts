/**
 * YouTube Server Actions
 *
 * @module lib/actions/youtube
 */
'use server'

import { revalidatePath } from 'next/cache'

import { YOUTUBE_SETTINGS_PATH } from '@/lib/constants/youtube.constant'
import { disconnectYouTube } from '@/lib/services/youtube/youtube-connection.service'
import type { ActionResult } from '@/lib/types/blog/blog-action.type'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

/** Revoke the channel's token at Google and forget the connection. */
export async function disconnectYouTubeAction(): Promise<ActionResult> {
    try {
        await requireAuth()
        await disconnectYouTube()
        revalidatePath(YOUTUBE_SETTINGS_PATH)
        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }
        console.error('[youtube] Disconnect failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Disconnect failed',
        }
    }
}
