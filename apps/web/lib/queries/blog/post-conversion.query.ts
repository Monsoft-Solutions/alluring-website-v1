/**
 * What the v2 blog post template needs beyond the post itself (epic #293,
 * #295 · S3): the procedure its title names, the reader's stage, the live
 * promotion for the thread's offer bubble, gallery photos for the results
 * rail and the Google rating for the strip.
 *
 * Both post routes (`/blog/[slug]` and the pre-2026 `/[slug]`) call it, and
 * only for posts `isBlogV2` lets through, so the old template fetches nothing
 * new. Every query here is cached (`unstable_cache`) and tagged for on-demand
 * revalidation.
 *
 * @module lib/queries/blog/post-conversion
 */
import 'server-only'

import { getPostProcedure } from '@/lib/blog/post-procedure.util'
import { getReaderStage } from '@/lib/blog/reader-stage.util'
import { getGalleryMediaByProcedure } from '@/lib/queries/gallery/procedure-galleries.query'
import { getActivePromotions } from '@/lib/queries/promotion.query'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'

/**
 * Gallery items fetched for the results rail. The rail keeps only photos that
 * name the procedure (videos, other procedures' photos and Instagram's
 * duplicate covers drop out), so it draws from a pool, as the BBL and lipo
 * pages do, and shows the first few (`PostResults`).
 */
const GALLERY_POOL = 24

/**
 * @param title - The post's title, which the procedure and stage are read from
 */
export async function getPostConversionData(title: string) {
    const procedure = getPostProcedure(title)
    const stage = getReaderStage(title)

    const [promotions, gallery, reviews] = await Promise.all([
        getActivePromotions(),
        procedure
            ? getGalleryMediaByProcedure(procedure.slug, GALLERY_POOL)
            : null,
        getPublishedGoogleReviews(1),
    ])

    // The highest-priority live promotion that covers this post: one for its
    // procedure, or one for every procedure. The admin saves "every
    // procedure" as '' rather than NULL, which `getActivePromotionByProcedure`
    // misses (#299), so the list is filtered here instead. General posts get
    // a promotion for every procedure.
    const promotion =
        promotions.find(
            (candidate) =>
                !candidate.procedureSlug ||
                candidate.procedureSlug === procedure?.slug
        ) ?? null

    return {
        procedure,
        stage,
        promotion: promotion
            ? { title: promotion.title, endsAt: promotion.endsAt }
            : null,
        gallery,
        rating:
            reviews.averageRating !== null
                ? { value: reviews.averageRating, count: reviews.totalCount }
                : null,
    }
}
