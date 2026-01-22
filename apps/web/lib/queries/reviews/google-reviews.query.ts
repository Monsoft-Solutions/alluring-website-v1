/**
 * Google Reviews Query
 *
 * Query for fetching published Google reviews on the public website.
 * Only returns reviews with rating >= 4 stars.
 *
 * @module lib/queries/reviews/google-reviews
 */
import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { googleReview, googleReviewsSettings } from '@workspace/db/schema'
import { CACHE_TAGS } from '@workspace/shared/cache'
import { and, desc, eq, gte, asc } from 'drizzle-orm'

/** Cache revalidation time in seconds (1 hour) */
const CACHE_TTL = 3600

/** Minimum rating to display on the website */
const MIN_RATING = 4

// ============================================================================
// Types
// ============================================================================

export type GoogleReviewPublic = {
    id: string
    reviewerName: string
    reviewerPhotoUrl: string | null
    rating: number
    comment: string | null
    reviewCreatedAt: Date
    replyText: string | null
}

export type GoogleReviewsResult = {
    reviews: GoogleReviewPublic[]
    averageRating: number | null
    totalCount: number
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Get published Google reviews for display on the website
 *
 * Only returns:
 * - Reviews with rating >= 4 stars
 * - Reviews that are marked as published
 *
 * @param limit - Maximum number of reviews to return
 * @param featuredOnly - If true, only return featured reviews
 * @returns Reviews array with metadata
 */
export function getPublishedGoogleReviews(
    limit = 6,
    featuredOnly = false
): Promise<GoogleReviewsResult> {
    const cacheKey = `google-reviews-${limit}-${featuredOnly ? 'featured' : 'all'}`

    return unstable_cache(
        async () => {
            // Build conditions
            const conditions = [
                eq(googleReview.isPublished, true),
                gte(googleReview.rating, MIN_RATING),
            ]

            if (featuredOnly) {
                conditions.push(eq(googleReview.isFeatured, true))
            }

            // Fetch reviews
            const reviews = await db
                .select({
                    id: googleReview.id,
                    reviewerName: googleReview.reviewerName,
                    reviewerPhotoUrl: googleReview.reviewerPhotoUrl,
                    rating: googleReview.rating,
                    comment: googleReview.comment,
                    reviewCreatedAt: googleReview.reviewCreatedAt,
                    replyText: googleReview.replyText,
                    displayOrder: googleReview.displayOrder,
                    isFeatured: googleReview.isFeatured,
                })
                .from(googleReview)
                .where(and(...conditions))
                .orderBy(
                    // Featured reviews first, then by display order, then by date
                    desc(googleReview.isFeatured),
                    asc(googleReview.displayOrder),
                    desc(googleReview.reviewCreatedAt)
                )
                .limit(limit)

            // Get average rating and total count from settings
            const [settings] = await db
                .select({
                    averageRating: googleReviewsSettings.averageRating,
                    totalCount: googleReviewsSettings.totalReviewsCount,
                })
                .from(googleReviewsSettings)
                .limit(1)

            return {
                reviews: reviews.map((r) => ({
                    id: r.id,
                    reviewerName: r.reviewerName,
                    reviewerPhotoUrl: r.reviewerPhotoUrl,
                    rating: r.rating,
                    comment: r.comment,
                    reviewCreatedAt: r.reviewCreatedAt,
                    replyText: r.replyText,
                })),
                averageRating: settings?.averageRating
                    ? parseFloat(settings.averageRating)
                    : null,
                totalCount: settings?.totalCount ?? 0,
            }
        },
        [cacheKey],
        {
            tags: [CACHE_TAGS.GOOGLE_REVIEWS],
            revalidate: CACHE_TTL,
        }
    )()
}

/**
 * Get featured Google reviews for homepage display
 *
 * @param limit - Maximum number of reviews to return (default: 3)
 * @returns Featured reviews with 4+ stars
 */
export function getFeaturedGoogleReviews(
    limit = 3
): Promise<GoogleReviewsResult> {
    return getPublishedGoogleReviews(limit, true)
}
