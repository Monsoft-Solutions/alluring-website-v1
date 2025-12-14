import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { CACHE_TAGS } from '@workspace/shared/cache'
import {
    galleryGroup,
    galleryMedia,
    galleryMediaGroup,
} from '@workspace/db/schema/gallery'
import { and, asc, desc, eq } from 'drizzle-orm'

import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'

/** Cache revalidation time in seconds (1 hour fallback) */
const CACHE_TTL = 3600

export type ProcedureGalleryData = {
    media: GalleryMediaCard[]
    groupSlug: string | null
}

/**
 * Internal function to fetch gallery media for a specific procedure
 */
async function fetchGalleryMediaByProcedure(
    procedureSlug: string,
    limit = 6
): Promise<ProcedureGalleryData> {
    // First, get the first visible gallery group for this procedure
    const [firstGroup] = await db
        .select({ id: galleryGroup.id, slug: galleryGroup.slug })
        .from(galleryGroup)
        .where(
            and(
                eq(galleryGroup.procedureSlug, procedureSlug),
                eq(galleryGroup.isVisible, true)
            )
        )
        .orderBy(asc(galleryGroup.displayOrder))
        .limit(1)

    // If no group exists, return empty result
    if (!firstGroup) {
        return { media: [], groupSlug: null }
    }

    // Fetch media from the first visible group
    const media = await db
        .select({
            id: galleryMedia.id,
            type: galleryMedia.type,
            url: galleryMedia.url,
            thumbnailUrl: galleryMedia.thumbnailUrl,
            title: galleryMedia.title,
            slug: galleryMedia.slug,
            alt: galleryMedia.alt,
            blurDataUrl: galleryMedia.blurDataUrl,
            width: galleryMedia.width,
            height: galleryMedia.height,
            isFeatured: galleryMedia.isFeatured,
        })
        .from(galleryMedia)
        .innerJoin(
            galleryMediaGroup,
            eq(galleryMedia.id, galleryMediaGroup.mediaId)
        )
        .innerJoin(galleryGroup, eq(galleryMediaGroup.groupId, galleryGroup.id))
        .where(
            and(
                eq(galleryGroup.id, firstGroup.id),
                eq(galleryMedia.status, 'published')
            )
        )
        .orderBy(asc(galleryMedia.displayOrder), desc(galleryMedia.publishedAt))
        .limit(limit)

    return {
        media: media.map((m) => ({
            id: m.id,
            type: m.type,
            url: m.url,
            thumbnailUrl: m.thumbnailUrl,
            title: m.title,
            slug: m.slug,
            alt: m.alt ?? m.title,
            blurDataUrl: m.blurDataUrl,
            width: m.width,
            height: m.height,
            isFeatured: m.isFeatured,
        })),
        groupSlug: firstGroup.slug,
    }
}

/**
 * Get gallery media for a specific procedure with caching
 *
 * Fetches published media from the first visible gallery group linked to a procedure.
 * Returns a flat list of images along with the group's slug for linking purposes.
 *
 * @param procedureSlug - The procedure slug to filter by
 * @param limit - Maximum number of images to return (default: 6)
 * @returns Object containing media array and group slug for linking
 */
export const getGalleryMediaByProcedure = (
    procedureSlug: string,
    limit = 6
): Promise<ProcedureGalleryData> => {
    return unstable_cache(
        () => fetchGalleryMediaByProcedure(procedureSlug, limit),
        [`gallery-media-procedure-${procedureSlug}-${limit}`],
        {
            tags: [CACHE_TAGS.GALLERY_MEDIA, CACHE_TAGS.GALLERY_GROUPS],
            revalidate: CACHE_TTL,
        }
    )()
}
