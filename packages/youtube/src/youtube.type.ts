/**
 * YouTube types
 *
 * Our own shapes for what the Data API returns. Only the fields the admin
 * reads are kept, so callers never walk `snippet.thumbnails.high.url`.
 *
 * @module @workspace/youtube — types
 */

export type YouTubePrivacyStatus = 'private' | 'unlisted' | 'public'

/** The channel an access token acts as. */
export type YouTubeChannel = {
    id: string
    title: string
    /** Handle, e.g. `@alluringplasticsurgery`. */
    customUrl: string | null
    thumbnailUrl: string | null
    /** The playlist every upload lands in. */
    uploadsPlaylistId: string | null
    subscriberCount: number | null
    videoCount: number | null
    viewCount: number | null
}

/** One video as listed in the channel's uploads. */
export type YouTubeChannelVideo = {
    videoId: string
    title: string
    publishedAt: string | null
    thumbnailUrl: string | null
    privacyStatus: YouTubePrivacyStatus | null
}

export type YouTubePlaylist = {
    id: string
    title: string
    itemCount: number
    privacyStatus: YouTubePrivacyStatus | null
}

/** Where a video is after upload, per videos.list. */
export type YouTubeVideoStatus = {
    videoId: string
    title: string
    /** uploaded | processed | failed | rejected | deleted */
    uploadStatus: string | null
    privacyStatus: YouTubePrivacyStatus | null
    /** processing | succeeded | failed | terminated (owner only) */
    processingStatus: string | null
    failureReason: string | null
    rejectionReason: string | null
}

/** The metadata sent with an upload or an edit. */
export type YouTubeVideoMetadata = {
    title: string
    description?: string
    tags?: string[]
    /** Defaults to YOUTUBE_DEFAULT_CATEGORY_ID. */
    categoryId?: string
    privacyStatus: YouTubePrivacyStatus
    /** ISO time to go public; only valid with privacyStatus 'private'. */
    publishAt?: string
}

/** A finished upload. */
export type YouTubeUploadedVideo = {
    videoId: string
    title: string
    privacyStatus: YouTubePrivacyStatus | null
    uploadStatus: string | null
}

/** One page of a list call. */
export type YouTubePage<T> = {
    items: T[]
    nextPageToken: string | null
}
