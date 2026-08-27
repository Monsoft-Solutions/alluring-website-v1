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
import { and, asc, count, desc, eq, gte } from 'drizzle-orm'

/** Cache revalidation time in seconds (1 hour) */
const CACHE_TTL = 3600 * 24

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
    /**
     * Declared as `Date | string` because it is both, depending on the path.
     *
     * This query is wrapped in `unstable_cache`, which serialises its result
     * to JSON — so on a cache hit the Date has already become an ISO string,
     * while a cache miss returns the real Date from Drizzle. Typing it as
     * `Date` alone compiles fine and then throws
     * `reviewCreatedAt.getFullYear is not a function` at prerender time.
     *
     * Always wrap in `new Date(...)` before calling any Date method.
     */
    reviewCreatedAt: Date | string
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

// ============================================================================
// Pagination
// ============================================================================

/** Reviews per page on `/reviews` */
export const REVIEWS_PAGE_SIZE = 12

/**
 * How many reviews are actually renderable — published, and at or above
 * {@link MIN_RATING}.
 *
 * Deliberately not the same number as `GoogleReviewsResult.totalCount`, which
 * comes from `googleReviewsSettings` and reports what the *Google profile*
 * says (every review, including the ones below four stars that this site does
 * not display). Paginating on the profile figure would generate trailing pages
 * with nothing on them.
 */
function countDisplayableReviews(): Promise<number> {
    return unstable_cache(
        async () => {
            const [row] = await db
                .select({ value: count() })
                .from(googleReview)
                .where(
                    and(
                        eq(googleReview.isPublished, true),
                        gte(googleReview.rating, MIN_RATING)
                    )
                )

            return row?.value ?? 0
        },
        ['google-reviews-displayable-count'],
        {
            tags: [CACHE_TAGS.GOOGLE_REVIEWS],
            revalidate: CACHE_TTL,
        }
    )()
}

export type GoogleReviewsPageResult = GoogleReviewsResult & {
    /** 1-based page actually served (clamped into range). */
    page: number
    /** Reviews per page. */
    pageSize: number
    /** Pages needed to show every displayable review — at least 1. */
    totalPages: number
    /** Displayable review count. See {@link countDisplayableReviews}. */
    displayableCount: number
}

/**
 * Get one page of published Google reviews.
 *
 * Backs `/reviews` and `/reviews/page/[page]`. Ordering follows
 * {@link getPublishedGoogleReviews} — featured first, then display order, then
 * newest — plus an `id` tie-breaker that function does not need, because
 * paging is what makes a total order matter.
 *
 * @param page - 1-based page number. Out-of-range values clamp into range.
 * @param pageSize - Reviews per page. Defaults to {@link REVIEWS_PAGE_SIZE}.
 */
export async function getPublishedGoogleReviewsPage(
    page = 1,
    pageSize = REVIEWS_PAGE_SIZE
): Promise<GoogleReviewsPageResult> {
    const displayableCount = await countDisplayableReviews()
    const totalPages = Math.max(1, Math.ceil(displayableCount / pageSize))
    const safePage = Math.min(Math.max(1, Math.trunc(page)), totalPages)
    const offset = (safePage - 1) * pageSize

    const cacheKey = `google-reviews-page-${safePage}-${pageSize}`

    const result = await unstable_cache(
        async () => {
            const reviews = await db
                .select({
                    id: googleReview.id,
                    reviewerName: googleReview.reviewerName,
                    reviewerPhotoUrl: googleReview.reviewerPhotoUrl,
                    rating: googleReview.rating,
                    comment: googleReview.comment,
                    reviewCreatedAt: googleReview.reviewCreatedAt,
                    replyText: googleReview.replyText,
                })
                .from(googleReview)
                .where(
                    and(
                        eq(googleReview.isPublished, true),
                        gte(googleReview.rating, MIN_RATING)
                    )
                )
                .orderBy(
                    desc(googleReview.isFeatured),
                    asc(googleReview.displayOrder),
                    desc(googleReview.reviewCreatedAt),
                    // Tie-breaker. Without a fully deterministic sort, Postgres
                    // is free to order rows that match on all three keys
                    // differently per query, which lets the same review appear
                    // on two pages while another disappears entirely.
                    asc(googleReview.id)
                )
                .limit(pageSize)
                .offset(offset)

            const [settings] = await db
                .select({
                    averageRating: googleReviewsSettings.averageRating,
                    totalCount: googleReviewsSettings.totalReviewsCount,
                })
                .from(googleReviewsSettings)
                .limit(1)

            return {
                reviews,
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

    return {
        ...result,
        page: safePage,
        pageSize,
        totalPages,
        displayableCount,
    }
}

/**
 * Total number of `/reviews` pages, for `generateStaticParams`.
 *
 * @param pageSize - Reviews per page. Defaults to {@link REVIEWS_PAGE_SIZE}.
 */
export async function getReviewsPageCount(
    pageSize = REVIEWS_PAGE_SIZE
): Promise<number> {
    const displayableCount = await countDisplayableReviews()
    return Math.max(1, Math.ceil(displayableCount / pageSize))
}
