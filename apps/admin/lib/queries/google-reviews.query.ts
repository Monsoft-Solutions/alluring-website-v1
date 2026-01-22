/**
 * Google Reviews Queries
 *
 * Database queries for Google Reviews management in admin panel.
 *
 * @module lib/queries/google-reviews
 */
import { db } from '@workspace/db/client'
import { googleReview, googleReviewsSettings } from '@workspace/db/schema'
import { and, asc, count, desc, eq, gte } from 'drizzle-orm'

// ============================================================================
// Types
// ============================================================================

export type GoogleReviewListItem = {
    id: string
    googleReviewId: string
    reviewerName: string
    reviewerPhotoUrl: string | null
    rating: number
    comment: string | null
    reviewCreatedAt: Date
    reviewUpdatedAt: Date | null
    replyText: string | null
    replyCreatedAt: Date | null
    isPublished: boolean
    isFeatured: boolean
    displayOrder: number
    createdAt: Date
}

export type GoogleReviewsStats = {
    totalReviews: number
    publishedReviews: number
    featuredReviews: number
    highRatingReviews: number // >= 4 stars
    averageRating: number | null
    lastSyncAt: Date | null
}

// ============================================================================
// Settings Queries
// ============================================================================

/**
 * Get Google Reviews settings
 */
export async function getGoogleReviewsSettings() {
    const settings = await db.select().from(googleReviewsSettings).limit(1)

    return settings[0] ?? null
}

// ============================================================================
// Review Queries
// ============================================================================

/**
 * Get all Google Reviews with pagination
 */
export async function getGoogleReviews(options: {
    page?: number
    pageSize?: number
    publishedOnly?: boolean
    featuredOnly?: boolean
    minRating?: number
    sortBy?: 'date' | 'rating' | 'displayOrder'
    sortDirection?: 'asc' | 'desc'
}): Promise<{ reviews: GoogleReviewListItem[]; total: number }> {
    const {
        page = 1,
        pageSize = 20,
        publishedOnly = false,
        featuredOnly = false,
        minRating,
        sortBy = 'date',
        sortDirection = 'desc',
    } = options
    const offset = (page - 1) * pageSize

    // Build conditions
    const conditions = []
    if (publishedOnly) {
        conditions.push(eq(googleReview.isPublished, true))
    }
    if (featuredOnly) {
        conditions.push(eq(googleReview.isFeatured, true))
    }
    if (minRating !== undefined) {
        conditions.push(gte(googleReview.rating, minRating))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Build order by
    const orderByClause =
        sortBy === 'rating'
            ? sortDirection === 'asc'
                ? [asc(googleReview.rating), desc(googleReview.reviewCreatedAt)]
                : [
                      desc(googleReview.rating),
                      desc(googleReview.reviewCreatedAt),
                  ]
            : sortBy === 'displayOrder'
              ? sortDirection === 'asc'
                  ? [
                        asc(googleReview.displayOrder),
                        desc(googleReview.reviewCreatedAt),
                    ]
                  : [
                        desc(googleReview.displayOrder),
                        desc(googleReview.reviewCreatedAt),
                    ]
              : sortDirection === 'asc'
                ? [asc(googleReview.reviewCreatedAt)]
                : [desc(googleReview.reviewCreatedAt)]

    // Get reviews
    const reviews = await db
        .select()
        .from(googleReview)
        .where(whereClause)
        .orderBy(...orderByClause)
        .limit(pageSize)
        .offset(offset)

    // Get total count
    const [countResult] = await db
        .select({ count: count() })
        .from(googleReview)
        .where(whereClause)

    return {
        reviews,
        total: countResult?.count ?? 0,
    }
}

/**
 * Get a single review by ID
 */
export async function getGoogleReviewById(
    id: string
): Promise<GoogleReviewListItem | null> {
    const reviews = await db
        .select()
        .from(googleReview)
        .where(eq(googleReview.id, id))
        .limit(1)

    return reviews[0] ?? null
}

/**
 * Get Google Reviews statistics
 */
export async function getGoogleReviewsStats(): Promise<GoogleReviewsStats> {
    // Get counts in parallel
    const [totalResult, publishedResult, featuredResult, highRatingResult] =
        await Promise.all([
            db.select({ count: count() }).from(googleReview),
            db
                .select({ count: count() })
                .from(googleReview)
                .where(eq(googleReview.isPublished, true)),
            db
                .select({ count: count() })
                .from(googleReview)
                .where(eq(googleReview.isFeatured, true)),
            db
                .select({ count: count() })
                .from(googleReview)
                .where(gte(googleReview.rating, 4)),
        ])

    // Get settings for average rating and last sync
    const settings = await getGoogleReviewsSettings()

    return {
        totalReviews: totalResult[0]?.count ?? 0,
        publishedReviews: publishedResult[0]?.count ?? 0,
        featuredReviews: featuredResult[0]?.count ?? 0,
        highRatingReviews: highRatingResult[0]?.count ?? 0,
        averageRating: settings?.averageRating
            ? parseFloat(settings.averageRating)
            : null,
        lastSyncAt: settings?.lastSyncAt ?? null,
    }
}
