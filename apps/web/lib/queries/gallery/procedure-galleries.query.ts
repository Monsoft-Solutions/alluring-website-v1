import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { CACHE_TAGS } from '@workspace/shared/cache'
import {
    galleryGroup,
    galleryMedia,
    galleryMediaGroup,
} from '@workspace/db/schema/gallery'
import { and, asc, desc, eq, inArray } from 'drizzle-orm'

import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'
import { mergeGroupsMedia } from '@/lib/utils/gallery-groups-media.util'

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

/**
 * Every visible group of each procedure, the procedures in the order given
 * and each one's groups in their display order, then their published media.
 */
async function fetchGalleryMediaByProcedures(
    procedureSlugs: readonly string[],
    limit: number,
    mentioning: string | undefined
): Promise<ProcedureGalleryData> {
    if (procedureSlugs.length === 0) return { media: [], groupSlug: null }

    const groups = await db
        .select({
            id: galleryGroup.id,
            slug: galleryGroup.slug,
            procedureSlug: galleryGroup.procedureSlug,
        })
        .from(galleryGroup)
        .where(
            and(
                inArray(galleryGroup.procedureSlug, [...procedureSlugs]),
                eq(galleryGroup.isVisible, true)
            )
        )
        .orderBy(asc(galleryGroup.displayOrder))

    if (groups.length === 0) return { media: [], groupSlug: null }

    // Stable, so each procedure keeps its groups' display order.
    const ordered = [...groups].sort(
        (a, b) =>
            procedureSlugs.indexOf(a.procedureSlug ?? '') -
            procedureSlugs.indexOf(b.procedureSlug ?? '')
    )

    const rows = await db
        .select({
            groupId: galleryMediaGroup.groupId,
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
        .where(
            and(
                inArray(
                    galleryMediaGroup.groupId,
                    ordered.map((group) => group.id)
                ),
                eq(galleryMedia.status, 'published')
            )
        )
        .orderBy(asc(galleryMedia.displayOrder), desc(galleryMedia.publishedAt))

    return {
        media: mergeGroupsMedia(
            ordered.map((group) => group.id),
            rows.map((row) => ({ ...row, alt: row.alt ?? row.title })),
            { limit, mentioning }
        ),
        // The gallery link goes to the first procedure's own group, never
        // to another procedure's.
        groupSlug:
            ordered.find((group) => group.procedureSlug === procedureSlugs[0])
                ?.slug ?? null,
    }
}

/**
 * Gallery media from several procedures' groups, with caching: for a
 * combined procedure whose results are filed under its parts (a mommy
 * makeover's under tummy tuck, breast and liposuction groups).
 *
 * Unlike `getGalleryMediaByProcedure`, which reads the first visible group
 * of one procedure and caps it before any filtering, this reads every
 * visible group of each procedure, de-duplicates items filed in more than
 * one, and, with `mentioning`, keeps only the items whose title or alt text
 * names that procedure (`procedureMentions`) before applying `limit`.
 *
 * @param procedureSlugs - The procedures whose groups to read, first one first
 * @param options.limit - Maximum number of items to return (default: 24)
 * @param options.mentioning - Keep only items that name this procedure
 * @returns The media, and the first procedure's own group slug for the gallery link
 */
export const getGalleryMediaByProcedures = (
    procedureSlugs: readonly string[],
    { limit = 24, mentioning }: { limit?: number; mentioning?: string } = {}
): Promise<ProcedureGalleryData> => {
    return unstable_cache(
        () => fetchGalleryMediaByProcedures(procedureSlugs, limit, mentioning),
        [
            `gallery-media-procedures-${procedureSlugs.join('+')}-${mentioning ?? 'any'}-${limit}`,
        ],
        {
            tags: [CACHE_TAGS.GALLERY_MEDIA, CACHE_TAGS.GALLERY_GROUPS],
            revalidate: CACHE_TTL,
        }
    )()
}
