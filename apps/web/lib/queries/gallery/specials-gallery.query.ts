import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { CACHE_TAGS } from '@workspace/shared/cache'
import {
    galleryGroup,
    galleryMedia,
    galleryMediaGroup,
} from '@workspace/db/schema/gallery'
import { and, asc, desc, eq, inArray } from 'drizzle-orm'

import type { GalleryImage } from '@/lib/types/gallery/gallery.type'

/** Cache revalidation time in seconds (1 hour fallback) */
const CACHE_TTL = 3600

/**
 * Main procedures to feature on the specials page
 */
const SPECIALS_PROCEDURES = [
    { slug: 'brazilian-butt-lift-bbl-miami', name: 'Brazilian Butt Lift' },
    { slug: 'breast-augmentation-miami', name: 'Breast Augmentation' },
    { slug: 'mommy-makeover-miami', name: 'Mommy Makeover' },
    { slug: 'liposuction-miami', name: 'Liposuction' },
    { slug: 'tummy-tuck-miami', name: 'Tummy Tuck' },
] as const

/** Maximum images per procedure group */
const IMAGES_PER_PROCEDURE = 3

/**
 * Internal function to fetch featured gallery images for specials page
 *
 * For each main procedure, fetches up to 3 images from its gallery group.
 * Featured images are prioritized, then ordered by displayOrder.
 */
async function fetchSpecialsFeaturedGalleryImages(): Promise<GalleryImage[]> {
    const procedureSlugs = SPECIALS_PROCEDURES.map((p) => p.slug)

    // Get all visible gallery groups for main procedures
    const groups = await db
        .select({
            id: galleryGroup.id,
            procedureSlug: galleryGroup.procedureSlug,
        })
        .from(galleryGroup)
        .where(
            and(
                inArray(galleryGroup.procedureSlug, procedureSlugs),
                eq(galleryGroup.isVisible, true)
            )
        )
        .orderBy(asc(galleryGroup.displayOrder))

    if (groups.length === 0) {
        return []
    }

    // Create a map for quick procedure name lookup
    const procedureNameMap = new Map(
        SPECIALS_PROCEDURES.map((p) => [p.slug, p.name])
    )

    // Fetch images from all groups at once
    const groupIds = groups.map((g) => g.id)

    const allMedia = await db
        .select({
            id: galleryMedia.id,
            url: galleryMedia.url,
            alt: galleryMedia.alt,
            title: galleryMedia.title,
            blurDataUrl: galleryMedia.blurDataUrl,
            width: galleryMedia.width,
            height: galleryMedia.height,
            isFeatured: galleryMedia.isFeatured,
            displayOrder: galleryMedia.displayOrder,
            groupId: galleryMediaGroup.groupId,
        })
        .from(galleryMedia)
        .innerJoin(
            galleryMediaGroup,
            eq(galleryMedia.id, galleryMediaGroup.mediaId)
        )
        .where(
            and(
                inArray(galleryMediaGroup.groupId, groupIds),
                eq(galleryMedia.status, 'published')
            )
        )
        .orderBy(
            desc(galleryMedia.isFeatured), // Featured first
            asc(galleryMedia.displayOrder),
            desc(galleryMedia.publishedAt)
        )

    // Create a map of groupId to procedureSlug
    const groupToProcedure = new Map(groups.map((g) => [g.id, g.procedureSlug]))

    // Group media by procedure and limit to IMAGES_PER_PROCEDURE each
    const mediaByProcedure = new Map<string, typeof allMedia>()

    for (const media of allMedia) {
        const procedureSlug = groupToProcedure.get(media.groupId)
        if (!procedureSlug) continue

        const existing = mediaByProcedure.get(procedureSlug) ?? []
        if (existing.length < IMAGES_PER_PROCEDURE) {
            existing.push(media)
            mediaByProcedure.set(procedureSlug, existing)
        }
    }

    // Flatten and transform to GalleryImage
    const result: GalleryImage[] = []

    for (const procedure of SPECIALS_PROCEDURES) {
        const media = mediaByProcedure.get(procedure.slug) ?? []
        for (const m of media) {
            result.push({
                id: m.id,
                url: m.url,
                alt: m.alt ?? m.title ?? procedure.name,
                blurDataUrl: m.blurDataUrl,
                width: m.width,
                height: m.height,
                procedureName: procedureNameMap.get(procedure.slug) ?? '',
                procedureSlug: procedure.slug,
            })
        }
    }

    return result
}

/**
 * Get featured gallery images for the specials page carousel
 *
 * Fetches up to 3 images per main procedure (BBL, Breast Augmentation,
 * Mommy Makeover, Liposuction, Tummy Tuck). Featured images are prioritized.
 *
 * @returns Array of gallery images with procedure context
 */
export const getSpecialsFeaturedGalleryImages = (): Promise<GalleryImage[]> => {
    return unstable_cache(
        () => fetchSpecialsFeaturedGalleryImages(),
        ['specials-featured-gallery-images'],
        {
            tags: [CACHE_TAGS.GALLERY_MEDIA, CACHE_TAGS.GALLERY_GROUPS],
            revalidate: CACHE_TTL,
        }
    )()
}
