import { cache } from 'react'
import { db } from '@workspace/db/client'
import { patientTestimonial } from '@workspace/db/schema/testimonials'
import { galleryMedia } from '@workspace/db/schema/gallery'
import { instagramPost } from '@workspace/db/schema/social-media'
import { and, asc, count, desc, eq, ilike, sql } from 'drizzle-orm'

import type {
    TestimonialListItem,
    TestimonialDetail,
    GetTestimonialsOptions,
    TestimonialStats,
    InstagramPostSelectItem,
} from '@/lib/types/testimonials/testimonial.type'

// ============================================================================
// Testimonial Queries
// ============================================================================

/**
 * Get paginated list of testimonials with filtering
 */
export async function getTestimonials(
    options: GetTestimonialsOptions = {}
): Promise<{ testimonials: TestimonialListItem[]; total: number }> {
    const {
        page = 1,
        pageSize = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status = 'all',
        sourceType = 'all',
        isFeatured = null,
        procedureSlug = null,
        search,
    } = options

    const offset = (page - 1) * pageSize

    // Build conditions
    const conditions = []

    if (status !== 'all') {
        conditions.push(eq(patientTestimonial.status, status))
    }

    if (sourceType !== 'all') {
        conditions.push(eq(patientTestimonial.sourceType, sourceType))
    }

    if (isFeatured !== null) {
        conditions.push(eq(patientTestimonial.isFeatured, isFeatured))
    }

    if (procedureSlug) {
        conditions.push(eq(patientTestimonial.procedureSlug, procedureSlug))
    }

    if (search) {
        conditions.push(
            sql`(${patientTestimonial.patientName} ILIKE ${`%${search}%`} OR ${patientTestimonial.procedure} ILIKE ${`%${search}%`} OR ${patientTestimonial.quote} ILIKE ${`%${search}%`})`
        )
    }

    // Determine sort column and direction
    const sortColumn =
        sortBy === 'patientName'
            ? patientTestimonial.patientName
            : sortBy === 'displayOrder'
              ? patientTestimonial.displayOrder
              : sortBy === 'rating'
                ? patientTestimonial.rating
                : patientTestimonial.createdAt

    const orderDirection = sortOrder === 'asc' ? asc : desc
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Create subqueries for media
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
                sourceType: patientTestimonial.sourceType,
                patientName: patientTestimonial.patientName,
                procedure: patientTestimonial.procedure,
                procedureSlug: patientTestimonial.procedureSlug,
                quote: patientTestimonial.quote,
                rating: patientTestimonial.rating,
                isFeatured: patientTestimonial.isFeatured,
                displayOrder: patientTestimonial.displayOrder,
                status: patientTestimonial.status,
                slug: patientTestimonial.slug,
                createdAt: patientTestimonial.createdAt,
                publishedAt: patientTestimonial.publishedAt,
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
            .orderBy(orderDirection(sortColumn))
            .limit(pageSize)
            .offset(offset),
        db
            .select({ count: count() })
            .from(patientTestimonial)
            .where(whereClause),
    ])

    // Transform to list items
    const transformedTestimonials: TestimonialListItem[] = testimonials.map(
        (t) => ({
            id: t.id,
            sourceType: t.sourceType,
            patientName: t.patientName,
            procedure: t.procedure,
            procedureSlug: t.procedureSlug,
            quote: t.quote,
            rating: t.rating,
            isFeatured: t.isFeatured,
            displayOrder: t.displayOrder,
            status: t.status,
            slug: t.slug,
            createdAt: t.createdAt,
            publishedAt: t.publishedAt,
            // Prefer direct media, fall back to Instagram media
            mediaUrl: t.directMediaUrl ?? t.igMediaUrl ?? null,
            mediaThumbnailUrl:
                t.directMediaThumbnailUrl ?? t.igMediaThumbnailUrl ?? null,
            mediaType: t.directMediaType ?? t.igMediaType ?? null,
            instagramPermalink: t.instagramPermalink ?? null,
        })
    )

    return {
        testimonials: transformedTestimonials,
        total: totalResult[0]?.count ?? 0,
    }
}

/**
 * Get testimonial by ID with all related data
 */
export async function getTestimonialById(
    id: string
): Promise<TestimonialDetail | null> {
    const result = await db
        .select()
        .from(patientTestimonial)
        .where(eq(patientTestimonial.id, id))
        .limit(1)

    if (!result[0]) {
        return null
    }

    const testimonial = result[0]

    // Fetch related data
    const [instagramPostData, mediaData, thumbnailData] = await Promise.all([
        testimonial.instagramPostId
            ? db
                  .select({
                      id: instagramPost.id,
                      permalink: instagramPost.permalink,
                      mediaType: instagramPost.mediaType,
                      caption: instagramPost.caption,
                      likeCount: instagramPost.likeCount,
                      commentCount: instagramPost.commentCount,
                  })
                  .from(instagramPost)
                  .where(eq(instagramPost.id, testimonial.instagramPostId))
                  .limit(1)
            : Promise.resolve([]),
        testimonial.mediaId
            ? db
                  .select({
                      id: galleryMedia.id,
                      url: galleryMedia.url,
                      thumbnailUrl: galleryMedia.thumbnailUrl,
                      type: galleryMedia.type,
                  })
                  .from(galleryMedia)
                  .where(eq(galleryMedia.id, testimonial.mediaId))
                  .limit(1)
            : Promise.resolve([]),
        testimonial.thumbnailMediaId
            ? db
                  .select({
                      id: galleryMedia.id,
                      url: galleryMedia.url,
                  })
                  .from(galleryMedia)
                  .where(eq(galleryMedia.id, testimonial.thumbnailMediaId))
                  .limit(1)
            : Promise.resolve([]),
    ])

    return {
        ...testimonial,
        instagramPost: instagramPostData[0] ?? null,
        media: mediaData[0] ?? null,
        thumbnail: thumbnailData[0] ?? null,
    }
}

/**
 * Get featured testimonials ordered by displayOrder
 */
export async function getFeaturedTestimonials(): Promise<
    TestimonialListItem[]
> {
    const { testimonials } = await getTestimonials({
        isFeatured: true,
        status: 'published',
        sortBy: 'displayOrder',
        sortOrder: 'asc',
        pageSize: 100,
    })

    return testimonials
}

/**
 * Get testimonial statistics
 */
export const getTestimonialStats = cache(
    async (): Promise<TestimonialStats> => {
        const result = await db.execute<{
            total_testimonials: number
            published_testimonials: number
            draft_testimonials: number
            featured_testimonials: number
            instagram_sourced: number
            direct_upload: number
            manual_entries: number
            average_rating: number
        }>(sql`
        SELECT
            COUNT(*)::int AS total_testimonials,
            COUNT(*) FILTER (WHERE status = 'published')::int AS published_testimonials,
            COUNT(*) FILTER (WHERE status = 'draft')::int AS draft_testimonials,
            COUNT(*) FILTER (WHERE is_featured = true)::int AS featured_testimonials,
            COUNT(*) FILTER (WHERE source_type = 'instagram')::int AS instagram_sourced,
            COUNT(*) FILTER (WHERE source_type = 'direct')::int AS direct_upload,
            COUNT(*) FILTER (WHERE source_type = 'manual')::int AS manual_entries,
            COALESCE(AVG(rating)::numeric(3,2), 0) AS average_rating
        FROM patient_testimonial
    `)

        const stats = result[0]

        return {
            totalTestimonials: stats?.total_testimonials ?? 0,
            publishedTestimonials: stats?.published_testimonials ?? 0,
            draftTestimonials: stats?.draft_testimonials ?? 0,
            featuredTestimonials: stats?.featured_testimonials ?? 0,
            instagramSourced: stats?.instagram_sourced ?? 0,
            directUpload: stats?.direct_upload ?? 0,
            manualEntries: stats?.manual_entries ?? 0,
            averageRating: Number(stats?.average_rating ?? 0),
        }
    }
)

/**
 * Get Instagram posts for testimonial selection
 * Returns posts that can be linked to testimonials
 */
export async function getInstagramPostsForSelection(options: {
    mediaTypes?: ('image' | 'video' | 'carousel')[]
    search?: string
    page?: number
    pageSize?: number
    /** If true, only return published posts. Default false (return all synced posts) */
    publishedOnly?: boolean
}): Promise<{ posts: InstagramPostSelectItem[]; total: number }> {
    const {
        mediaTypes,
        search,
        page = 1,
        pageSize = 20,
        publishedOnly = false,
    } = options

    const offset = (page - 1) * pageSize

    // Build conditions
    const conditions = []

    // Only filter by published status if explicitly requested
    if (publishedOnly) {
        conditions.push(eq(instagramPost.isPublished, true))
    }

    if (mediaTypes && mediaTypes.length > 0) {
        conditions.push(
            sql`${instagramPost.mediaType} IN (${sql.join(
                mediaTypes.map((t) => sql`${t}`),
                sql`, `
            )})`
        )
    }

    if (search) {
        conditions.push(ilike(instagramPost.caption, `%${search}%`))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Subquery to check if post has a testimonial
    const hasTestimonialSql = sql<boolean>`EXISTS (
        SELECT 1 FROM patient_testimonial
        WHERE patient_testimonial.instagram_post_id = ${instagramPost.id}
    )`

    const [posts, totalResult] = await Promise.all([
        db
            .select({
                id: instagramPost.id,
                instagramId: instagramPost.instagramId,
                code: instagramPost.code,
                mediaType: instagramPost.mediaType,
                caption: instagramPost.caption,
                permalink: instagramPost.permalink,
                likeCount: instagramPost.likeCount,
                commentCount: instagramPost.commentCount,
                thumbnailUrl: galleryMedia.thumbnailUrl,
                hasTestimonial: hasTestimonialSql,
            })
            .from(instagramPost)
            .leftJoin(galleryMedia, eq(instagramPost.mediaId, galleryMedia.id))
            .where(whereClause)
            .orderBy(desc(instagramPost.takenAt))
            .limit(pageSize)
            .offset(offset),
        db.select({ count: count() }).from(instagramPost).where(whereClause),
    ])

    return {
        posts: posts.map((p) => ({
            id: p.id,
            instagramId: p.instagramId,
            code: p.code,
            mediaType: p.mediaType,
            caption: p.caption,
            permalink: p.permalink,
            likeCount: p.likeCount,
            commentCount: p.commentCount,
            thumbnailUrl: p.thumbnailUrl,
            hasTestimonial: p.hasTestimonial,
        })),
        total: totalResult[0]?.count ?? 0,
    }
}

/**
 * Get unique procedures from testimonials for filtering
 */
export async function getTestimonialProcedures(): Promise<
    { procedure: string; procedureSlug: string | null; count: number }[]
> {
    const result = await db
        .select({
            procedure: patientTestimonial.procedure,
            procedureSlug: patientTestimonial.procedureSlug,
            count: count(),
        })
        .from(patientTestimonial)
        .groupBy(patientTestimonial.procedure, patientTestimonial.procedureSlug)
        .orderBy(desc(count()))

    return result.map((r) => ({
        procedure: r.procedure,
        procedureSlug: r.procedureSlug,
        count: Number(r.count),
    }))
}

/**
 * Check if a slug is already in use
 */
export async function isTestimonialSlugTaken(
    slug: string,
    excludeId?: string
): Promise<boolean> {
    const conditions = [eq(patientTestimonial.slug, slug)]

    if (excludeId) {
        conditions.push(sql`${patientTestimonial.id} != ${excludeId}`)
    }

    const result = await db
        .select({ id: patientTestimonial.id })
        .from(patientTestimonial)
        .where(and(...conditions))
        .limit(1)

    return result.length > 0
}

/**
 * Get the next display order for featured testimonials
 */
export async function getNextFeaturedDisplayOrder(): Promise<number> {
    const result = await db
        .select({
            maxOrder: sql<number>`COALESCE(MAX(display_order), -1)`,
        })
        .from(patientTestimonial)
        .where(eq(patientTestimonial.isFeatured, true))

    return (result[0]?.maxOrder ?? -1) + 1
}
