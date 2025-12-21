/**
 * Instagram Types for Public Website
 *
 * Public-facing types for Instagram content display.
 * Simplified from admin types, excluding admin-specific fields.
 *
 * @module types/instagram
 */

/**
 * Media item within an Instagram post
 */
export type InstagramMediaItem = {
    id: string
    url: string
    thumbnailUrl: string | null
    type: 'image' | 'video'
}

/**
 * Carousel media item for posts with multiple images/videos
 */
export type InstagramCarouselItem = {
    id: string
    url: string
    type: 'image' | 'video'
    displayOrder: number
}

/**
 * Instagram post for public display
 */
export type InstagramPostPublic = {
    id: string
    /** Instagram shortcode used in URLs */
    code: string
    /** Type of media content */
    mediaType: 'image' | 'video' | 'carousel'
    /** Post caption text */
    caption: string | null
    /** Original Instagram permalink */
    permalink: string
    /** When the post was published on Instagram */
    takenAt: Date
    /** Number of likes */
    likeCount: number
    /** Number of comments */
    commentCount: number
    /** Number of plays (for videos/reels) */
    playCount: number | null
    /** Primary media for the post */
    media: InstagramMediaItem
    /** Number of items in carousel (for carousel posts) */
    carouselCount?: number
    /** Carousel media items (for carousel posts) */
    carouselMedia?: InstagramCarouselItem[]
}

/**
 * Profile information for Instagram display
 */
export type InstagramProfileInfo = {
    handle: string | null
    fullName: string | null
    profilePictureUrl: string | null
    biography: string | null
    followersCount: number | null
    postsCount: number | null
}

/**
 * Paginated Instagram posts result
 */
export type InstagramPostsResult = {
    posts: InstagramPostPublic[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}
