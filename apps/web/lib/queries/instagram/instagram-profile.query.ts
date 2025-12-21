/**
 * Instagram Profile Query
 *
 * Query for Instagram profile information from social media settings.
 *
 * @module lib/queries/instagram/instagram-profile
 */
import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { CACHE_TAGS } from '@workspace/shared/cache'
import { socialMediaSettings } from '@workspace/db/schema/social-media'
import { eq } from 'drizzle-orm'

import type { InstagramProfileInfo } from '@/lib/types/instagram.type'

/** Cache revalidation time in seconds (1 hour) */
const CACHE_TTL = 3600

/**
 * Internal function to fetch Instagram profile info
 */
async function fetchInstagramProfile(): Promise<InstagramProfileInfo | null> {
    const [settings] = await db
        .select({
            handle: socialMediaSettings.handle,
            fullName: socialMediaSettings.fullName,
            profilePictureUrl: socialMediaSettings.profilePictureUrl,
            biography: socialMediaSettings.biography,
            followersCount: socialMediaSettings.followersCount,
            postsCount: socialMediaSettings.postsCount,
        })
        .from(socialMediaSettings)
        .where(eq(socialMediaSettings.platform, 'instagram'))
        .limit(1)

    if (!settings) return null

    return {
        handle: settings.handle,
        fullName: settings.fullName,
        profilePictureUrl: settings.profilePictureUrl,
        biography: settings.biography,
        followersCount: settings.followersCount,
        postsCount: settings.postsCount,
    }
}

/**
 * Get Instagram profile info with caching
 *
 * @returns Profile info or null if not configured
 */
export function getInstagramProfile(): Promise<InstagramProfileInfo | null> {
    return unstable_cache(fetchInstagramProfile, ['instagram-profile'], {
        tags: [CACHE_TAGS.INSTAGRAM_POSTS],
        revalidate: CACHE_TTL,
    })()
}
