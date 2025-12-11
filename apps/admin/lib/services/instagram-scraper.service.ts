/**
 * Instagram Scraper Service
 *
 * Handles fetching posts from Instagram via ScrapeSocial API,
 * downloading media, and uploading to Vercel Blob.
 *
 * @module apps/admin/lib/services/instagram-scraper.service
 */
import { head, put } from '@vercel/blob'

import { env } from '@/env'

// ============================================================================
// Constants
// ============================================================================

/**
 * Timeout for media download requests (30 seconds)
 */
const FETCH_TIMEOUT_MS = 30_000

/**
 * Maximum number of retry attempts for transient failures
 */
const MAX_RETRIES = 3

/**
 * Delay between retry attempts (2 seconds)
 */
const RETRY_DELAY_MS = 2000

/**
 * Timeout for URL validation HEAD requests (5 seconds)
 */
const VALIDATION_TIMEOUT_MS = 5000

// ============================================================================
// Retry & Timeout Utilities
// ============================================================================

/**
 * Execute an async function with retry logic for transient failures
 *
 * @param fn - Async function to execute
 * @param retries - Maximum number of retry attempts
 * @returns Result of the function
 */
async function withRetry<T>(
    fn: () => Promise<T>,
    retries = MAX_RETRIES
): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            if (attempt === retries) throw error
            console.warn(
                `Attempt ${attempt + 1}/${retries + 1} failed, retrying in ${RETRY_DELAY_MS}ms...`,
                error instanceof Error ? error.message : error
            )
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
        }
    }
    throw new Error('Unreachable')
}

/**
 * Fetch with timeout using AbortController
 *
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds
 * @returns Fetch response
 */
async function fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs = FETCH_TIMEOUT_MS
): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
        return await fetch(url, { ...options, signal: controller.signal })
    } finally {
        clearTimeout(timeout)
    }
}

/**
 * Validate that a media URL is accessible (not expired)
 *
 * @param url - Media URL to validate
 * @returns True if URL is valid and accessible
 */
async function validateMediaUrl(url: string): Promise<boolean> {
    try {
        const response = await fetchWithTimeout(
            url,
            { method: 'HEAD' },
            VALIDATION_TIMEOUT_MS
        )
        return response.ok
    } catch {
        return false
    }
}

// ============================================================================
// Types
// ============================================================================

/**
 * ScrapeSocial API response types
 */
type ImageCandidate = {
    url: string
    width: number
    height: number
}

type VideoVersion = {
    url: string
    width: number
    height: number
    type: number
}

type Caption = {
    text: string
}

type CarouselItem = {
    id: string
    media_type: number
    image_versions2?: {
        candidates: ImageCandidate[]
    }
    video_versions?: VideoVersion[]
}

type InstagramApiPost = {
    id: string
    code: string
    media_type: number // 1=image, 2=video, 8=carousel
    taken_at: number // Unix timestamp
    caption?: Caption
    like_count?: number
    comment_count?: number
    play_count?: number
    ig_play_count?: number
    video_duration?: number
    image_versions2?: {
        candidates: ImageCandidate[]
    }
    video_versions?: VideoVersion[]
    carousel_media?: CarouselItem[]
    url: string
}

type InstagramApiResponse = {
    success: boolean
    credits_remaining?: number
    items: InstagramApiPost[]
    more_available: boolean
    next_max_id?: string
}

/**
 * Parsed post data ready for database insertion
 */
export type ParsedInstagramPost = {
    instagramId: string
    code: string
    mediaType: 'image' | 'video' | 'carousel'
    caption: string | null
    permalink: string
    takenAt: Date
    likeCount: number
    commentCount: number
    playCount: number | null
    videoDuration: number | null
    primaryMediaUrl: string
    thumbnailUrl: string | null
    carouselItems: Array<{
        mediaUrl: string
        mediaType: 'image' | 'video'
        order: number
    }>
}

export type UploadedMedia = {
    url: string
    mimeType: string
    width?: number
    height?: number
    fileSize?: number
}

export type SyncResult = {
    success: boolean
    newPostsCount: number
    skippedCount: number
    errorCount: number
    errors: string[]
    nextCursor: string | null
    hasMore: boolean
    totalPostsCount?: number // Total posts on profile from API
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the best quality image URL from candidates
 */
function getBestQualityImage(
    candidates: ImageCandidate[]
): ImageCandidate | null {
    if (!candidates || candidates.length === 0) return null
    return candidates.reduce((best, current) =>
        current.width * current.height > best.width * best.height
            ? current
            : best
    )
}

/**
 * Get the best quality video URL from versions
 */
function getBestQualityVideo(versions: VideoVersion[]): VideoVersion | null {
    if (!versions || versions.length === 0) return null
    return versions.reduce((best, current) =>
        current.width * current.height > best.width * best.height
            ? current
            : best
    )
}

/**
 * Convert Instagram media_type number to our enum
 */
function parseMediaType(mediaType: number): 'image' | 'video' | 'carousel' {
    switch (mediaType) {
        case 1:
            return 'image'
        case 2:
            return 'video'
        case 8:
            return 'carousel'
        default:
            return 'image'
    }
}

/**
 * Get file extension from URL or mime type
 */
function getExtension(url: string, mimeType?: string): string {
    if (mimeType) {
        if (mimeType.includes('video/mp4')) return 'mp4'
        if (mimeType.includes('video/webm')) return 'webm'
        if (mimeType.includes('image/jpeg')) return 'jpg'
        if (mimeType.includes('image/png')) return 'png'
        if (mimeType.includes('image/webp')) return 'webp'
    }

    // Try to get from URL
    const urlPath = url.split('?')[0] ?? ''
    const ext = urlPath.split('.').pop()?.toLowerCase()
    if (ext && ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm'].includes(ext)) {
        return ext === 'jpeg' ? 'jpg' : ext
    }

    return 'jpg' // Default to jpg for images
}

/**
 * Get mime type from file extension
 */
function getMimeType(ext: string): string {
    switch (ext) {
        case 'mp4':
            return 'video/mp4'
        case 'webm':
            return 'video/webm'
        case 'png':
            return 'image/png'
        case 'webp':
            return 'image/webp'
        case 'jpg':
        case 'jpeg':
        default:
            return 'image/jpeg'
    }
}

/**
 * Check if media already exists in Vercel Blob
 *
 * @param pathname - The blob pathname to check
 * @returns The existing URL if found, null otherwise
 */
export async function checkMediaExists(
    pathname: string
): Promise<string | null> {
    const blobToken = env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
        return null
    }

    try {
        const metadata = await head(pathname, { token: blobToken })
        return metadata.url
    } catch (error) {
        // BlobNotFoundError means file doesn't exist - this is expected
        if (
            error instanceof Error &&
            error.message.includes('blob_not_found')
        ) {
            return null
        }
        // For other errors, log and return null to continue with upload
        console.warn(`Error checking blob existence for ${pathname}:`, error)
        return null
    }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch posts from Instagram via ScrapeSocial API
 */
export async function fetchInstagramPosts(
    handle: string,
    apiKey: string,
    cursor?: string
): Promise<InstagramApiResponse> {
    const baseUrl = 'https://api.scrapecreators.com/v2/instagram/user/posts'
    const params = new URLSearchParams({
        handle,
        trim: 'true',
    })

    if (cursor) {
        params.set('next_max_id', cursor)
    }

    const response = await fetch(`${baseUrl}?${params.toString()}`, {
        headers: {
            'x-api-key': apiKey,
        },
    })

    if (!response.ok) {
        throw new Error(
            `ScrapeSocial API error: ${response.status} ${response.statusText}`
        )
    }

    const data = (await response.json()) as InstagramApiResponse

    if (!data.success) {
        throw new Error('ScrapeSocial API returned unsuccessful response')
    }

    return data
}

/**
 * Parse raw API response into structured data
 */
export function parseInstagramPosts(
    apiResponse: InstagramApiResponse
): ParsedInstagramPost[] {
    return apiResponse.items.map((post) => {
        const mediaType = parseMediaType(post.media_type)

        // Get primary media URL
        let primaryMediaUrl = ''
        let thumbnailUrl: string | null = null

        if (mediaType === 'video') {
            const bestVideo = getBestQualityVideo(post.video_versions ?? [])
            primaryMediaUrl = bestVideo?.url ?? ''
            // Get thumbnail from image_versions2
            const bestImage = getBestQualityImage(
                post.image_versions2?.candidates ?? []
            )
            thumbnailUrl = bestImage?.url ?? null
        } else if (mediaType === 'carousel') {
            // Use first carousel item as primary
            const firstItem = post.carousel_media?.[0]
            if (firstItem) {
                if (firstItem.media_type === 2) {
                    const bestVideo = getBestQualityVideo(
                        firstItem.video_versions ?? []
                    )
                    primaryMediaUrl = bestVideo?.url ?? ''
                } else {
                    const bestImage = getBestQualityImage(
                        firstItem.image_versions2?.candidates ?? []
                    )
                    primaryMediaUrl = bestImage?.url ?? ''
                }
            }
            // Use main post image as thumbnail
            const mainImage = getBestQualityImage(
                post.image_versions2?.candidates ?? []
            )
            thumbnailUrl = mainImage?.url ?? null
        } else {
            const bestImage = getBestQualityImage(
                post.image_versions2?.candidates ?? []
            )
            primaryMediaUrl = bestImage?.url ?? ''
        }

        // Parse carousel items
        const carouselItems: ParsedInstagramPost['carouselItems'] = []
        if (mediaType === 'carousel' && post.carousel_media) {
            post.carousel_media.forEach((item, index) => {
                const itemType = item.media_type === 2 ? 'video' : 'image'
                let itemUrl = ''

                if (itemType === 'video') {
                    const bestVideo = getBestQualityVideo(
                        item.video_versions ?? []
                    )
                    itemUrl = bestVideo?.url ?? ''
                } else {
                    const bestImage = getBestQualityImage(
                        item.image_versions2?.candidates ?? []
                    )
                    itemUrl = bestImage?.url ?? ''
                }

                if (itemUrl) {
                    carouselItems.push({
                        mediaUrl: itemUrl,
                        mediaType: itemType,
                        order: index,
                    })
                }
            })
        }

        return {
            instagramId: post.id,
            code: post.code,
            mediaType,
            caption: post.caption?.text ?? null,
            permalink: post.url,
            takenAt: new Date(post.taken_at * 1000),
            likeCount: post.like_count ?? 0,
            commentCount: post.comment_count ?? 0,
            playCount: post.play_count ?? post.ig_play_count ?? null,
            videoDuration: post.video_duration
                ? Math.round(post.video_duration)
                : null,
            primaryMediaUrl,
            thumbnailUrl,
            carouselItems,
        }
    })
}

/**
 * Download media from URL and upload to Vercel Blob
 *
 * Checks if media already exists in Vercel Blob before downloading/uploading.
 * Uses consistent pathnames (no random suffix) to enable existence checks.
 * Includes retry logic for transient failures and timeout protection.
 */
export async function downloadAndUploadMedia(
    sourceUrl: string,
    filename: string
): Promise<UploadedMedia> {
    const blobToken = env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
        throw new Error('BLOB_READ_WRITE_TOKEN not configured')
    }

    // Determine extension from source URL first (before downloading)
    const ext = getExtension(sourceUrl)
    const fullFilename = `instagram/${filename}.${ext}`

    // Check if media already exists in Vercel Blob
    const existingUrl = await checkMediaExists(fullFilename)
    if (existingUrl) {
        return {
            url: existingUrl,
            mimeType: getMimeType(ext),
        }
    }

    // Validate URL is accessible before attempting full download
    const isValid = await validateMediaUrl(sourceUrl)
    if (!isValid) {
        throw new Error(
            `Media URL expired or invalid: ${sourceUrl.substring(0, 80)}...`
        )
    }

    // Download and upload with retry logic for transient failures
    return withRetry(async () => {
        // Download the media with timeout protection
        const response = await fetchWithTimeout(sourceUrl, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (compatible; InstagramMediaUploader/1.0)',
            },
        })

        if (!response.ok) {
            throw new Error(
                `Failed to download media: ${response.status} ${response.statusText}`
            )
        }

        const contentType =
            response.headers.get('content-type') ?? getMimeType(ext)
        const blob = await response.blob()

        // Upload to Vercel Blob with addRandomSuffix: false for consistent paths
        const uploadedBlob = await put(fullFilename, blob, {
            access: 'public',
            token: blobToken,
            contentType,
            addRandomSuffix: false,
        })

        return {
            url: uploadedBlob.url,
            mimeType: contentType,
            fileSize: blob.size,
        }
    })
}

/**
 * Get API key - prefers database setting over environment variable
 */
export function getApiKey(dbApiKey: string | null | undefined): string | null {
    if (dbApiKey) return dbApiKey
    return env.SCRAPE_SOCIAL_API_KEY ?? null
}
