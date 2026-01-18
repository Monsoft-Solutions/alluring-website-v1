import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { CACHE_TAGS } from '@workspace/shared/cache'
import { patientTestimonial } from '@workspace/db/schema/testimonials'
import { galleryMedia } from '@workspace/db/schema/gallery'
import { instagramPost } from '@workspace/db/schema/social-media'
import { and, asc, count, desc, eq } from 'drizzle-orm'

import type {
    TestimonialCard,
    FeaturedTestimonial,
} from '@/lib/types/testimonials/testimonial.type'

/** Cache revalidation time in seconds (1 hour fallback) */
const CACHE_TTL = 3600

/**
 * Internal function to fetch published testimonials with pagination
 */
async function fetchPublishedTestimonials(options: {
    page?: number
    pageSize?: number
    procedureSlug?: string
}): Promise<{ testimonials: TestimonialCard[]; total: number }> {
    const { page = 1, pageSize = 12, procedureSlug } = options
    const offset = (page - 1) * pageSize

    const conditions = [eq(patientTestimonial.status, 'published')]

    if (procedureSlug) {
        conditions.push(eq(patientTestimonial.procedureSlug, procedureSlug))
    }

    const whereClause = and(...conditions)

    // Subqueries for media
    const directMedia = db
        .select({
            id: galleryMedia.id,
            url: galleryMedia.url,
            thumbnailUrl: galleryMedia.thumbnailUrl,
            type: galleryMedia.type,
        })
        .from(galleryMedia)
        .as('direct_media')

    const igMedia = db
        .select({
            id: galleryMedia.id,
            url: galleryMedia.url,
            thumbnailUrl: galleryMedia.thumbnailUrl,
            type: galleryMedia.type,
        })
        .from(galleryMedia)
        .as('ig_media')

    const [testimonials, totalResult] = await Promise.all([
        db
            .select({
                id: patientTestimonial.id,
                patientName: patientTestimonial.patientName,
                procedure: patientTestimonial.procedure,
                procedureSlug: patientTestimonial.procedureSlug,
                timeframe: patientTestimonial.timeframe,
                quote: patientTestimonial.quote,
                rating: patientTestimonial.rating,
                slug: patientTestimonial.slug,
                // Direct media
                directMediaUrl: directMedia.url,
                directMediaThumbnailUrl: directMedia.thumbnailUrl,
                directMediaType: directMedia.type,
                // Instagram media
                igMediaUrl: igMedia.url,
                igMediaThumbnailUrl: igMedia.thumbnailUrl,
                igMediaType: igMedia.type,
                // Instagram permalink
                instagramPermalink: instagramPost.permalink,
            })
            .from(patientTestimonial)
            .leftJoin(
                directMedia,
                eq(patientTestimonial.mediaId, directMedia.id)
            )
            .leftJoin(
                instagramPost,
                eq(patientTestimonial.instagramPostId, instagramPost.id)
            )
            .leftJoin(igMedia, eq(instagramPost.mediaId, igMedia.id))
            .where(whereClause)
            .orderBy(desc(patientTestimonial.publishedAt))
            .limit(pageSize)
            .offset(offset),
        db
            .select({ count: count() })
            .from(patientTestimonial)
            .where(whereClause),
    ])

    return {
        testimonials: testimonials.map((t) => ({
            id: t.id,
            patientName: t.patientName,
            procedure: t.procedure,
            procedureSlug: t.procedureSlug,
            timeframe: t.timeframe,
            quote: t.quote,
            rating: t.rating,
            slug: t.slug,
            // Prefer direct media, fall back to Instagram media
            mediaUrl: t.directMediaUrl ?? t.igMediaUrl ?? null,
            thumbnailUrl:
                t.directMediaThumbnailUrl ?? t.igMediaThumbnailUrl ?? null,
            mediaType: t.directMediaType ?? t.igMediaType ?? null,
            instagramPermalink: t.instagramPermalink ?? null,
        })),
        total: totalResult[0]?.count ?? 0,
    }
}

/**
 * Get published testimonials with caching
 */
export const getPublishedTestimonials = (options: {
    page?: number
    pageSize?: number
    procedureSlug?: string
}): Promise<{ testimonials: TestimonialCard[]; total: number }> => {
    const cacheKey = `testimonials-${options.page ?? 1}-${options.pageSize ?? 12}-${options.procedureSlug ?? 'all'}`

    return unstable_cache(
        () => fetchPublishedTestimonials(options),
        [cacheKey],
        {
            tags: [CACHE_TAGS.TESTIMONIALS],
            revalidate: CACHE_TTL,
        }
    )()
}

/**
 * Internal function to fetch featured testimonials
 */
async function fetchFeaturedTestimonials(
    limit: number
): Promise<FeaturedTestimonial[]> {
    // Subqueries for media
    const directMedia = db
        .select({
            id: galleryMedia.id,
            url: galleryMedia.url,
            thumbnailUrl: galleryMedia.thumbnailUrl,
            type: galleryMedia.type,
        })
        .from(galleryMedia)
        .as('direct_media')

    const igMedia = db
        .select({
            id: galleryMedia.id,
            url: galleryMedia.url,
            thumbnailUrl: galleryMedia.thumbnailUrl,
            type: galleryMedia.type,
        })
        .from(galleryMedia)
        .as('ig_media')

    const testimonials = await db
        .select({
            id: patientTestimonial.id,
            patientName: patientTestimonial.patientName,
            procedure: patientTestimonial.procedure,
            procedureSlug: patientTestimonial.procedureSlug,
            timeframe: patientTestimonial.timeframe,
            quote: patientTestimonial.quote,
            rating: patientTestimonial.rating,
            slug: patientTestimonial.slug,
            displayOrder: patientTestimonial.displayOrder,
            // Direct media
            directMediaUrl: directMedia.url,
            directMediaThumbnailUrl: directMedia.thumbnailUrl,
            directMediaType: directMedia.type,
            // Instagram media
            igMediaUrl: igMedia.url,
            igMediaThumbnailUrl: igMedia.thumbnailUrl,
            igMediaType: igMedia.type,
            // Instagram permalink
            instagramPermalink: instagramPost.permalink,
        })
        .from(patientTestimonial)
        .leftJoin(directMedia, eq(patientTestimonial.mediaId, directMedia.id))
        .leftJoin(
            instagramPost,
            eq(patientTestimonial.instagramPostId, instagramPost.id)
        )
        .leftJoin(igMedia, eq(instagramPost.mediaId, igMedia.id))
        .where(
            and(
                eq(patientTestimonial.status, 'published'),
                eq(patientTestimonial.isFeatured, true)
            )
        )
        .orderBy(asc(patientTestimonial.displayOrder))
        .limit(limit)

    return testimonials.map((t) => ({
        id: t.id,
        patientName: t.patientName,
        procedure: t.procedure,
        procedureSlug: t.procedureSlug,
        timeframe: t.timeframe,
        quote: t.quote,
        rating: t.rating,
        slug: t.slug,
        displayOrder: t.displayOrder,
        // Prefer direct media, fall back to Instagram media
        mediaUrl: t.directMediaUrl ?? t.igMediaUrl ?? null,
        thumbnailUrl:
            t.directMediaThumbnailUrl ?? t.igMediaThumbnailUrl ?? null,
        mediaType: t.directMediaType ?? t.igMediaType ?? null,
        instagramPermalink: t.instagramPermalink ?? null,
    }))
}

/**
 * Get featured testimonials with caching
 */
export const getFeaturedTestimonials = (
    limit = 6
): Promise<FeaturedTestimonial[]> => {
    return unstable_cache(
        () => fetchFeaturedTestimonials(limit),
        [`testimonials-featured-${limit}`],
        {
            tags: [CACHE_TAGS.TESTIMONIALS_FEATURED],
            revalidate: CACHE_TTL,
        }
    )()
}

/**
 * Get unique procedures from published testimonials for filtering
 */
async function fetchTestimonialProcedures(): Promise<
    { procedure: string; procedureSlug: string | null; count: number }[]
> {
    const result = await db
        .select({
            procedure: patientTestimonial.procedure,
            procedureSlug: patientTestimonial.procedureSlug,
            count: count(),
        })
        .from(patientTestimonial)
        .where(eq(patientTestimonial.status, 'published'))
        .groupBy(patientTestimonial.procedure, patientTestimonial.procedureSlug)
        .orderBy(desc(count()))

    return result.map((r) => ({
        procedure: r.procedure,
        procedureSlug: r.procedureSlug,
        count: Number(r.count),
    }))
}

/**
 * Get procedures with testimonial counts
 */
export const getTestimonialProcedures = (): Promise<
    { procedure: string; procedureSlug: string | null; count: number }[]
> => {
    return unstable_cache(
        () => fetchTestimonialProcedures(),
        ['testimonial-procedures'],
        {
            tags: [CACHE_TAGS.TESTIMONIALS],
            revalidate: CACHE_TTL,
        }
    )()
}
