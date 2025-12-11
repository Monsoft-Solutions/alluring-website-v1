/**
 * Instagram Profile Service
 *
 * Handles fetching Instagram profile metadata via ScrapeSocial API,
 * downloading profile pictures, and uploading to Vercel Blob.
 *
 * @module apps/admin/lib/services/instagram-profile.service
 */
import { put } from '@vercel/blob'

import { env } from '@/env'

// ============================================================================
// Constants
// ============================================================================

/**
 * Timeout for ScrapeSocial API calls (30 seconds)
 */
const API_TIMEOUT_MS = 30_000

/**
 * Timeout for media download requests (30 seconds)
 */
const MEDIA_TIMEOUT_MS = 30_000

/**
 * Maximum number of retry attempts for transient failures
 */
const MAX_RETRIES = 3

/**
 * Delay between retry attempts (2 seconds)
 */
const RETRY_DELAY_MS = 2000

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
    timeoutMs: number
): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
        return await fetch(url, { ...options, signal: controller.signal })
    } finally {
        clearTimeout(timeout)
    }
}

// ============================================================================
// Types
// ============================================================================

/**
 * ScrapeSocial Profile API Response Types
 */
type ProfileEdgeCount = {
    count: number
}

type ProfileBusinessAddress = {
    city_name?: string
    street_address?: string
    zip_code?: string
    latitude?: number
    longitude?: number
}

type ProfileTimelineMedia = {
    count: number
    page_info: {
        has_next_page: boolean
        end_cursor: string | null
    }
    edges: unknown[]
}

type InstagramProfileUser = {
    full_name: string
    biography: string
    external_url: string | null
    edge_followed_by: ProfileEdgeCount
    edge_follow: ProfileEdgeCount
    edge_owner_to_timeline_media: ProfileTimelineMedia
    is_business_account: boolean
    is_professional_account: boolean
    is_private: boolean
    is_verified: boolean
    category_name?: string
    business_address_json?: ProfileBusinessAddress
    profile_pic_url_hd: string
    username: string
}

type InstagramProfileApiResponse = {
    success: boolean
    credits_remaining?: number
    data: {
        user: InstagramProfileUser
    }
}

/**
 * Parsed business address data
 */
export type BusinessAddress = {
    cityName?: string
    streetAddress?: string
    zipCode?: string
    latitude?: number
    longitude?: number
}

/**
 * Parsed profile data ready for database insertion
 */
export type InstagramProfileData = {
    fullName: string
    biography: string
    profilePictureUrl: string // Vercel Blob URL
    externalUrl: string | null
    followersCount: number
    followingCount: number
    postsCount: number
    isBusinessAccount: boolean
    isProfessionalAccount: boolean
    isPrivate: boolean
    isVerified: boolean
    categoryName: string | null
    businessAddress: BusinessAddress | null
}

/**
 * Uploaded profile picture metadata
 */
type UploadedProfilePicture = {
    url: string
    mimeType: string
    fileSize: number
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch Instagram profile data via ScrapeSocial API
 *
 * @param handle - Instagram username (without @)
 * @param apiKey - ScrapeSocial API key
 * @returns Profile API response
 */
export async function fetchInstagramProfile(
    handle: string,
    apiKey: string
): Promise<InstagramProfileApiResponse> {
    const baseUrl = 'https://api.scrapecreators.com/v1/instagram/profile'
    const params = new URLSearchParams({
        handle,
        trim: 'true',
    })

    return withRetry(async () => {
        const response = await fetchWithTimeout(
            `${baseUrl}?${params.toString()}`,
            {
                headers: {
                    'x-api-key': apiKey,
                },
            },
            API_TIMEOUT_MS
        )

        if (!response.ok) {
            throw new Error(
                `ScrapeSocial Profile API error: ${response.status} ${response.statusText}`
            )
        }

        const data = (await response.json()) as InstagramProfileApiResponse

        if (!data.success) {
            throw new Error(
                'ScrapeSocial Profile API returned unsuccessful response'
            )
        }

        return data
    })
}

/**
 * Parse raw profile API response into structured data
 *
 * @param apiResponse - Raw API response
 * @param profilePictureUrl - Vercel Blob URL of uploaded profile picture
 * @returns Parsed profile data
 */
export function parseInstagramProfile(
    apiResponse: InstagramProfileApiResponse,
    profilePictureUrl: string
): InstagramProfileData {
    const user = apiResponse.data.user

    // Parse business address if available
    let businessAddress: BusinessAddress | null = null
    if (user.business_address_json) {
        const addr = user.business_address_json
        businessAddress = {
            cityName: addr.city_name,
            streetAddress: addr.street_address,
            zipCode: addr.zip_code,
            latitude: addr.latitude,
            longitude: addr.longitude,
        }
    }

    return {
        fullName: user.full_name,
        biography: user.biography,
        profilePictureUrl,
        externalUrl: user.external_url,
        followersCount: user.edge_followed_by.count,
        followingCount: user.edge_follow.count,
        postsCount: user.edge_owner_to_timeline_media.count,
        isBusinessAccount: user.is_business_account,
        isProfessionalAccount: user.is_professional_account,
        isPrivate: user.is_private,
        isVerified: user.is_verified,
        categoryName: user.category_name ?? null,
        businessAddress,
    }
}

/**
 * Get file extension from content-type header
 *
 * @param contentType - MIME type from response header
 * @returns File extension (e.g., 'jpg', 'png', 'webp')
 */
function getFileExtensionFromContentType(contentType: string): string {
    const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
    }

    return mimeToExt[contentType.toLowerCase()] ?? 'jpg'
}

/**
 * Download Instagram profile picture and upload to Vercel Blob
 *
 * @param profilePicUrl - Instagram profile picture URL (HD version)
 * @param handle - Instagram handle for filename
 * @returns Uploaded profile picture metadata
 */
export async function uploadProfilePicture(
    profilePicUrl: string,
    handle: string
): Promise<UploadedProfilePicture> {
    const blobToken = env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
        throw new Error('BLOB_READ_WRITE_TOKEN not configured')
    }

    // Download and upload with retry logic for transient failures
    return withRetry(async () => {
        // Download the profile picture with timeout protection
        const response = await fetchWithTimeout(
            profilePicUrl,
            {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (compatible; InstagramProfileUploader/1.0)',
                },
            },
            MEDIA_TIMEOUT_MS
        )

        if (!response.ok) {
            throw new Error(
                `Failed to download profile picture: ${response.status} ${response.statusText}`
            )
        }

        const contentType = response.headers.get('content-type') ?? 'image/jpeg'
        const blob = await response.blob()

        // Determine file extension from content-type
        const extension = getFileExtensionFromContentType(contentType)

        // Generate filename with timestamp to avoid conflicts
        const timestamp = Date.now()
        const filename = `instagram/profile-${handle}-${timestamp}.${extension}`

        // Upload to Vercel Blob
        const uploadedBlob = await put(filename, blob, {
            access: 'public',
            token: blobToken,
            contentType,
        })

        return {
            url: uploadedBlob.url,
            mimeType: contentType,
            fileSize: blob.size,
        }
    })
}
