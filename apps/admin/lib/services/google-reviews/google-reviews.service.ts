/**
 * Google Reviews Service
 *
 * Handles fetching and syncing reviews from Google Business Profile API.
 *
 * @module lib/services/google-reviews/google-reviews
 */

import { db } from '@workspace/db/client'
import { googleReview, googleReviewsSettings } from '@workspace/db/schema'
import { eq } from 'drizzle-orm'

import {
    refreshAccessToken,
    calculateTokenExpiry,
} from './google-oauth.service'

/** Google Business Profile API base URL */
const API_BASE_URL = 'https://mybusiness.googleapis.com/v4'

/** Google My Business Account Management API base URL */
const ACCOUNT_MANAGEMENT_URL =
    'https://mybusinessaccountmanagement.googleapis.com/v1'

/** Google My Business Business Information API base URL */
const BUSINESS_INFO_URL =
    'https://mybusinessbusinessinformation.googleapis.com/v1'

// ============================================================================
// Types
// ============================================================================

/**
 * Google Business Account from API
 */
export type GoogleBusinessAccount = {
    name: string
    accountName: string
    type: string
    verificationState?: string
    vettedState?: string
}

/**
 * Google Business Location from API
 */
export type GoogleBusinessLocation = {
    name: string
    title: string
    storefrontAddress?: {
        addressLines?: string[]
        locality?: string
        administrativeArea?: string
        postalCode?: string
    }
}

/**
 * Google Review from API
 */
export type GoogleReviewFromApi = {
    name: string
    reviewId: string
    reviewer: {
        displayName: string
        profilePhotoUrl?: string
    }
    starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE'
    comment?: string
    createTime: string
    updateTime?: string
    reviewReply?: {
        comment: string
        updateTime: string
    }
}

/**
 * Reviews response from API
 */
type ReviewsResponse = {
    reviews?: GoogleReviewFromApi[]
    averageRating?: number
    totalReviewCount?: number
    nextPageToken?: string
}

/**
 * Sync result
 */
export type ReviewsSyncResult = {
    success: boolean
    newCount: number
    updatedCount: number
    totalCount: number
    averageRating: number | null
    error?: string
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert Google star rating enum to numeric value
 */
function starRatingToNumber(
    starRating: GoogleReviewFromApi['starRating']
): number {
    const mapping: Record<GoogleReviewFromApi['starRating'], number> = {
        ONE: 1,
        TWO: 2,
        THREE: 3,
        FOUR: 4,
        FIVE: 5,
    }
    return mapping[starRating]
}

/**
 * Get a valid access token, refreshing if necessary
 */
async function getValidAccessToken(): Promise<string> {
    const [settings] = await db.select().from(googleReviewsSettings).limit(1)

    if (!settings) {
        throw new Error('Google Reviews not configured')
    }

    if (!settings.accessToken || !settings.refreshToken) {
        throw new Error('Google Reviews OAuth not completed')
    }

    // Check if token is expired or will expire in the next 5 minutes
    const now = new Date()
    const expiryBuffer = 5 * 60 * 1000 // 5 minutes
    const isExpired =
        !settings.tokenExpiresAt ||
        settings.tokenExpiresAt.getTime() < now.getTime() + expiryBuffer

    if (isExpired) {
        // Refresh the token
        const tokenResponse = await refreshAccessToken(settings.refreshToken)

        // Update the database with new tokens
        await db
            .update(googleReviewsSettings)
            .set({
                accessToken: tokenResponse.access_token,
                tokenExpiresAt: calculateTokenExpiry(tokenResponse.expires_in),
                // Only update refresh token if a new one was provided
                ...(tokenResponse.refresh_token && {
                    refreshToken: tokenResponse.refresh_token,
                }),
            })
            .where(eq(googleReviewsSettings.id, settings.id))

        return tokenResponse.access_token
    }

    return settings.accessToken
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all Google Business accounts for the authenticated user
 */
export async function fetchBusinessAccounts(): Promise<
    GoogleBusinessAccount[]
> {
    const accessToken = await getValidAccessToken()

    const response = await fetch(`${ACCOUNT_MANAGEMENT_URL}/accounts`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to fetch business accounts: ${error}`)
    }

    const data = (await response.json()) as {
        accounts?: GoogleBusinessAccount[]
    }
    return data.accounts ?? []
}

/**
 * Fetch all locations for a Google Business account
 */
export async function fetchBusinessLocations(
    accountId: string
): Promise<GoogleBusinessLocation[]> {
    const accessToken = await getValidAccessToken()

    // The account ID format is "accounts/123456789"
    // The API expects the full resource name
    const accountName = accountId.startsWith('accounts/')
        ? accountId
        : `accounts/${accountId}`

    const response = await fetch(
        `${BUSINESS_INFO_URL}/${accountName}/locations?readMask=name,title,storefrontAddress`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    )

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to fetch business locations: ${error}`)
    }

    const data = (await response.json()) as {
        locations?: GoogleBusinessLocation[]
    }
    return data.locations ?? []
}

/**
 * Fetch reviews for a specific location
 */
export async function fetchReviews(
    accountId: string,
    locationId: string,
    pageToken?: string
): Promise<ReviewsResponse> {
    const accessToken = await getValidAccessToken()

    // Build the URL with the full resource path
    const accountName = accountId.startsWith('accounts/')
        ? accountId
        : `accounts/${accountId}`
    const locationName = locationId.startsWith('locations/')
        ? locationId
        : `locations/${locationId}`

    let url = `${API_BASE_URL}/${accountName}/${locationName}/reviews`
    if (pageToken) {
        url += `?pageToken=${pageToken}`
    }

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to fetch reviews: ${error}`)
    }

    return (await response.json()) as ReviewsResponse
}

/**
 * Sync all reviews from Google Business Profile
 *
 * Fetches all reviews from Google and upserts them into the database.
 * Updates total count and average rating in settings.
 */
export async function syncReviews(): Promise<ReviewsSyncResult> {
    try {
        // Get settings
        const [settings] = await db
            .select()
            .from(googleReviewsSettings)
            .limit(1)

        if (!settings) {
            return {
                success: false,
                newCount: 0,
                updatedCount: 0,
                totalCount: 0,
                averageRating: null,
                error: 'Google Reviews not configured',
            }
        }

        if (!settings.accountId || !settings.locationId) {
            return {
                success: false,
                newCount: 0,
                updatedCount: 0,
                totalCount: 0,
                averageRating: null,
                error: 'Business location not selected',
            }
        }

        // Fetch all reviews (paginated)
        const allReviews: GoogleReviewFromApi[] = []
        let pageToken: string | undefined
        let totalCount = 0
        let averageRating: number | null = null

        do {
            const response = await fetchReviews(
                settings.accountId,
                settings.locationId,
                pageToken
            )

            if (response.reviews) {
                allReviews.push(...response.reviews)
            }

            if (response.totalReviewCount !== undefined) {
                totalCount = response.totalReviewCount
            }

            if (response.averageRating !== undefined) {
                averageRating = response.averageRating
            }

            pageToken = response.nextPageToken
        } while (pageToken)

        // Upsert reviews into database
        let newCount = 0
        let updatedCount = 0

        for (const review of allReviews) {
            const existingReview = await db
                .select()
                .from(googleReview)
                .where(eq(googleReview.googleReviewId, review.reviewId))
                .limit(1)

            const reviewData = {
                googleReviewId: review.reviewId,
                reviewerName: review.reviewer.displayName,
                reviewerPhotoUrl: review.reviewer.profilePhotoUrl ?? null,
                rating: starRatingToNumber(review.starRating),
                comment: review.comment ?? null,
                reviewCreatedAt: new Date(review.createTime),
                reviewUpdatedAt: review.updateTime
                    ? new Date(review.updateTime)
                    : null,
                replyText: review.reviewReply?.comment ?? null,
                replyCreatedAt: review.reviewReply?.updateTime
                    ? new Date(review.reviewReply.updateTime)
                    : null,
            }

            if (existingReview.length === 0) {
                // Insert new review
                await db.insert(googleReview).values(reviewData)
                newCount++
            } else {
                // Update existing review
                await db
                    .update(googleReview)
                    .set(reviewData)
                    .where(eq(googleReview.googleReviewId, review.reviewId))
                updatedCount++
            }
        }

        // Update settings with sync info
        await db
            .update(googleReviewsSettings)
            .set({
                lastSyncAt: new Date(),
                totalReviewsCount: totalCount,
                averageRating: averageRating?.toString() ?? null,
            })
            .where(eq(googleReviewsSettings.id, settings.id))

        return {
            success: true,
            newCount,
            updatedCount,
            totalCount,
            averageRating,
        }
    } catch (error) {
        console.error('Error syncing reviews:', error)
        return {
            success: false,
            newCount: 0,
            updatedCount: 0,
            totalCount: 0,
            averageRating: null,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}
