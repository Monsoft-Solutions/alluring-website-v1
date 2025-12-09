import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { beforeAfterPair, galleryMedia } from '@workspace/db/schema/gallery'
import { and, asc, eq } from 'drizzle-orm'

import type { BeforeAfterPairCard } from '@/lib/types/gallery/before-after.type'

/**
 * Internal function to fetch featured before/after pairs
 */
async function fetchFeaturedBeforeAfterPairs(
    limit = 6
): Promise<BeforeAfterPairCard[]> {
    const beforeMedia = db
        .select({
            id: galleryMedia.id,
            url: galleryMedia.url,
            alt: galleryMedia.alt,
            title: galleryMedia.title,
            blurDataUrl: galleryMedia.blurDataUrl,
            width: galleryMedia.width,
            height: galleryMedia.height,
        })
        .from(galleryMedia)
        .as('before_media')

    const afterMedia = db
        .select({
            id: galleryMedia.id,
            url: galleryMedia.url,
            alt: galleryMedia.alt,
            title: galleryMedia.title,
            blurDataUrl: galleryMedia.blurDataUrl,
            width: galleryMedia.width,
            height: galleryMedia.height,
        })
        .from(galleryMedia)
        .as('after_media')

    const pairs = await db
        .select({
            id: beforeAfterPair.id,
            procedureType: beforeAfterPair.procedureType,
            timeframe: beforeAfterPair.timeframe,
            patientInfo: beforeAfterPair.patientInfo,
            displayOrder: beforeAfterPair.displayOrder,
            beforeId: beforeMedia.id,
            beforeUrl: beforeMedia.url,
            beforeAlt: beforeMedia.alt,
            beforeTitle: beforeMedia.title,
            beforeBlur: beforeMedia.blurDataUrl,
            beforeWidth: beforeMedia.width,
            beforeHeight: beforeMedia.height,
            afterId: afterMedia.id,
            afterUrl: afterMedia.url,
            afterAlt: afterMedia.alt,
            afterTitle: afterMedia.title,
            afterBlur: afterMedia.blurDataUrl,
            afterWidth: afterMedia.width,
            afterHeight: afterMedia.height,
        })
        .from(beforeAfterPair)
        .innerJoin(
            beforeMedia,
            eq(beforeAfterPair.beforeMediaId, beforeMedia.id)
        )
        .innerJoin(afterMedia, eq(beforeAfterPair.afterMediaId, afterMedia.id))
        .where(eq(beforeAfterPair.isFeatured, true))
        .orderBy(asc(beforeAfterPair.displayOrder))
        .limit(limit)

    return pairs.map((pair) => ({
        id: pair.id,
        procedureType: pair.procedureType,
        timeframe: pair.timeframe,
        patientInfo: pair.patientInfo,
        beforeImage: {
            id: pair.beforeId,
            url: pair.beforeUrl,
            alt: pair.beforeAlt ?? pair.beforeTitle ?? 'Before',
            blurDataUrl: pair.beforeBlur,
            width: pair.beforeWidth,
            height: pair.beforeHeight,
        },
        afterImage: {
            id: pair.afterId,
            url: pair.afterUrl,
            alt: pair.afterAlt ?? pair.afterTitle ?? 'After',
            blurDataUrl: pair.afterBlur,
            width: pair.afterWidth,
            height: pair.afterHeight,
        },
    }))
}

/**
 * Get featured before/after pairs with caching
 *
 * @param limit - Maximum number of pairs to return
 * @returns Array of before/after pairs
 */
export const getFeaturedBeforeAfterPairs = (
    limit = 6
): Promise<BeforeAfterPairCard[]> => {
    return unstable_cache(
        () => fetchFeaturedBeforeAfterPairs(limit),
        [`before-after-featured-${limit}`],
        {
            tags: ['before-after-pairs'],
            revalidate: 60,
        }
    )()
}

/**
 * Internal function to fetch all before/after pairs
 */
async function fetchAllBeforeAfterPairs(): Promise<BeforeAfterPairCard[]> {
    const beforeMedia = db
        .select({
            id: galleryMedia.id,
            url: galleryMedia.url,
            alt: galleryMedia.alt,
            title: galleryMedia.title,
            blurDataUrl: galleryMedia.blurDataUrl,
            width: galleryMedia.width,
            height: galleryMedia.height,
        })
        .from(galleryMedia)
        .as('before_media')

    const afterMedia = db
        .select({
            id: galleryMedia.id,
            url: galleryMedia.url,
            alt: galleryMedia.alt,
            title: galleryMedia.title,
            blurDataUrl: galleryMedia.blurDataUrl,
            width: galleryMedia.width,
            height: galleryMedia.height,
        })
        .from(galleryMedia)
        .as('after_media')

    const pairs = await db
        .select({
            id: beforeAfterPair.id,
            procedureType: beforeAfterPair.procedureType,
            timeframe: beforeAfterPair.timeframe,
            patientInfo: beforeAfterPair.patientInfo,
            displayOrder: beforeAfterPair.displayOrder,
            beforeId: beforeMedia.id,
            beforeUrl: beforeMedia.url,
            beforeAlt: beforeMedia.alt,
            beforeTitle: beforeMedia.title,
            beforeBlur: beforeMedia.blurDataUrl,
            beforeWidth: beforeMedia.width,
            beforeHeight: beforeMedia.height,
            afterId: afterMedia.id,
            afterUrl: afterMedia.url,
            afterAlt: afterMedia.alt,
            afterTitle: afterMedia.title,
            afterBlur: afterMedia.blurDataUrl,
            afterWidth: afterMedia.width,
            afterHeight: afterMedia.height,
        })
        .from(beforeAfterPair)
        .innerJoin(
            beforeMedia,
            eq(beforeAfterPair.beforeMediaId, beforeMedia.id)
        )
        .innerJoin(afterMedia, eq(beforeAfterPair.afterMediaId, afterMedia.id))
        .orderBy(asc(beforeAfterPair.displayOrder))

    return pairs.map((pair) => ({
        id: pair.id,
        procedureType: pair.procedureType,
        timeframe: pair.timeframe,
        patientInfo: pair.patientInfo,
        beforeImage: {
            id: pair.beforeId,
            url: pair.beforeUrl,
            alt: pair.beforeAlt ?? pair.beforeTitle ?? 'Before',
            blurDataUrl: pair.beforeBlur,
            width: pair.beforeWidth,
            height: pair.beforeHeight,
        },
        afterImage: {
            id: pair.afterId,
            url: pair.afterUrl,
            alt: pair.afterAlt ?? pair.afterTitle ?? 'After',
            blurDataUrl: pair.afterBlur,
            width: pair.afterWidth,
            height: pair.afterHeight,
        },
    }))
}

/**
 * Get all before/after pairs with caching
 *
 * @returns Array of all before/after pairs
 */
export const getAllBeforeAfterPairs = (): Promise<BeforeAfterPairCard[]> => {
    return unstable_cache(
        () => fetchAllBeforeAfterPairs(),
        ['before-after-all'],
        {
            tags: ['before-after-pairs'],
            revalidate: 60,
        }
    )()
}

/**
 * Internal function to fetch before/after pairs by procedure slug
 */
async function fetchBeforeAfterPairsByProcedure(
    procedureSlug: string,
    limit = 6
): Promise<BeforeAfterPairCard[]> {
    const beforeMedia = db
        .select({
            id: galleryMedia.id,
            url: galleryMedia.url,
            alt: galleryMedia.alt,
            title: galleryMedia.title,
            blurDataUrl: galleryMedia.blurDataUrl,
            width: galleryMedia.width,
            height: galleryMedia.height,
        })
        .from(galleryMedia)
        .as('before_media')

    const afterMedia = db
        .select({
            id: galleryMedia.id,
            url: galleryMedia.url,
            alt: galleryMedia.alt,
            title: galleryMedia.title,
            blurDataUrl: galleryMedia.blurDataUrl,
            width: galleryMedia.width,
            height: galleryMedia.height,
        })
        .from(galleryMedia)
        .as('after_media')

    const pairs = await db
        .select({
            id: beforeAfterPair.id,
            procedureType: beforeAfterPair.procedureType,
            timeframe: beforeAfterPair.timeframe,
            patientInfo: beforeAfterPair.patientInfo,
            displayOrder: beforeAfterPair.displayOrder,
            beforeId: beforeMedia.id,
            beforeUrl: beforeMedia.url,
            beforeAlt: beforeMedia.alt,
            beforeTitle: beforeMedia.title,
            beforeBlur: beforeMedia.blurDataUrl,
            beforeWidth: beforeMedia.width,
            beforeHeight: beforeMedia.height,
            afterId: afterMedia.id,
            afterUrl: afterMedia.url,
            afterAlt: afterMedia.alt,
            afterTitle: afterMedia.title,
            afterBlur: afterMedia.blurDataUrl,
            afterWidth: afterMedia.width,
            afterHeight: afterMedia.height,
        })
        .from(beforeAfterPair)
        .innerJoin(
            beforeMedia,
            eq(beforeAfterPair.beforeMediaId, beforeMedia.id)
        )
        .innerJoin(afterMedia, eq(beforeAfterPair.afterMediaId, afterMedia.id))
        .where(eq(beforeAfterPair.procedureSlug, procedureSlug))
        .orderBy(asc(beforeAfterPair.displayOrder))
        .limit(limit)

    return pairs.map((pair) => ({
        id: pair.id,
        procedureType: pair.procedureType,
        timeframe: pair.timeframe,
        patientInfo: pair.patientInfo,
        beforeImage: {
            id: pair.beforeId,
            url: pair.beforeUrl,
            alt: pair.beforeAlt ?? pair.beforeTitle ?? 'Before',
            blurDataUrl: pair.beforeBlur,
            width: pair.beforeWidth,
            height: pair.beforeHeight,
        },
        afterImage: {
            id: pair.afterId,
            url: pair.afterUrl,
            alt: pair.afterAlt ?? pair.afterTitle ?? 'After',
            blurDataUrl: pair.afterBlur,
            width: pair.afterWidth,
            height: pair.afterHeight,
        },
    }))
}

/**
 * Get before/after pairs for a specific procedure page with caching
 *
 * @param procedureSlug - The procedure page slug (e.g., 'brazilian-butt-lift-bbl-miami')
 * @param limit - Maximum number of pairs to return (default: 6)
 * @returns Array of before/after pairs for the procedure
 */
export const getBeforeAfterPairsByProcedure = (
    procedureSlug: string,
    limit = 6
): Promise<BeforeAfterPairCard[]> => {
    return unstable_cache(
        () => fetchBeforeAfterPairsByProcedure(procedureSlug, limit),
        [`before-after-procedure-${procedureSlug}-${limit}`],
        {
            tags: ['before-after-pairs', `procedure-${procedureSlug}`],
            revalidate: 60,
        }
    )()
}
