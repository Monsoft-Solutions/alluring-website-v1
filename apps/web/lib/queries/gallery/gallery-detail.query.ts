import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import {
    galleryGroup,
    galleryMedia,
    galleryMediaGroup,
} from '@workspace/db/schema/gallery'
import { and, asc, desc, eq, ne, sql } from 'drizzle-orm'

import type {
    GalleryGroupDetail,
    GalleryMediaCard,
} from '@/lib/types/gallery/gallery-group.type'
import type { GalleryMediaDetail } from '@/lib/types/gallery/gallery-media.type'

/**
 * Internal function to fetch gallery group by slug with its media
 */
async function fetchGalleryGroupBySlug(
    slug: string
): Promise<GalleryGroupDetail | null> {
    // Fetch the group
    const groupResult = await db
        .select({
            id: galleryGroup.id,
            name: galleryGroup.name,
            slug: galleryGroup.slug,
            description: galleryGroup.description,
            coverImageUrl: galleryMedia.url,
            coverImageAlt: galleryMedia.alt,
            coverImageBlur: galleryMedia.blurDataUrl,
        })
        .from(galleryGroup)
        .leftJoin(galleryMedia, eq(galleryGroup.coverImageId, galleryMedia.id))
        .where(
            and(eq(galleryGroup.slug, slug), eq(galleryGroup.isVisible, true))
        )
        .limit(1)

    const group = groupResult[0]
    if (!group) return null

    // Fetch all published media in this group
    const mediaResult = await db
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
        .where(
            and(
                eq(galleryMediaGroup.groupId, group.id),
                eq(galleryMedia.status, 'published')
            )
        )
        .orderBy(asc(galleryMedia.displayOrder), desc(galleryMedia.publishedAt))

    return {
        id: group.id,
        name: group.name,
        slug: group.slug,
        description: group.description,
        coverImage: group.coverImageUrl
            ? {
                  url: group.coverImageUrl,
                  alt: group.coverImageAlt ?? group.name,
                  blurDataUrl: group.coverImageBlur,
              }
            : null,
        media: mediaResult.map((m) => ({
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
    }
}

/**
 * Get gallery group by slug with caching
 *
 * @param slug - The group slug
 * @returns The group detail or null if not found
 */
export const getGalleryGroupBySlug = (
    slug: string
): Promise<GalleryGroupDetail | null> => {
    return unstable_cache(
        () => fetchGalleryGroupBySlug(slug),
        [`gallery-group-${slug}`],
        {
            tags: ['gallery-groups', `gallery-group-${slug}`],
            revalidate: 60,
        }
    )()
}

/**
 * Internal function to fetch gallery media by slug with related media
 */
async function fetchGalleryMediaBySlug(
    slug: string
): Promise<GalleryMediaDetail | null> {
    // Fetch the media item
    const mediaResult = await db
        .select({
            id: galleryMedia.id,
            type: galleryMedia.type,
            url: galleryMedia.url,
            thumbnailUrl: galleryMedia.thumbnailUrl,
            title: galleryMedia.title,
            description: galleryMedia.description,
            slug: galleryMedia.slug,
            alt: galleryMedia.alt,
            seoTitle: galleryMedia.seoTitle,
            seoDescription: galleryMedia.seoDescription,
            blurDataUrl: galleryMedia.blurDataUrl,
            width: galleryMedia.width,
            height: galleryMedia.height,
            duration: galleryMedia.duration,
            isFeatured: galleryMedia.isFeatured,
            publishedAt: galleryMedia.publishedAt,
        })
        .from(galleryMedia)
        .where(
            and(
                eq(galleryMedia.slug, slug),
                eq(galleryMedia.status, 'published')
            )
        )
        .limit(1)

    const media = mediaResult[0]
    if (!media) return null

    // Fetch groups this media belongs to
    const groupsResult = await db
        .select({
            id: galleryGroup.id,
            name: galleryGroup.name,
            slug: galleryGroup.slug,
        })
        .from(galleryMediaGroup)
        .innerJoin(galleryGroup, eq(galleryMediaGroup.groupId, galleryGroup.id))
        .where(
            and(
                eq(galleryMediaGroup.mediaId, media.id),
                eq(galleryGroup.isVisible, true)
            )
        )

    // Fetch related media from the same groups
    let relatedMedia: GalleryMediaCard[] = []
    if (groupsResult.length > 0) {
        const groupIds = groupsResult.map((g) => g.id)

        const relatedResult = await db
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
            .where(
                and(
                    sql`${galleryMediaGroup.groupId} IN ${groupIds}`,
                    eq(galleryMedia.status, 'published'),
                    ne(galleryMedia.id, media.id)
                )
            )
            .orderBy(sql`RANDOM()`)
            .limit(6)

        relatedMedia = relatedResult.map((m) => ({
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
        }))
    }

    return {
        id: media.id,
        type: media.type,
        url: media.url,
        thumbnailUrl: media.thumbnailUrl,
        title: media.title,
        description: media.description,
        slug: media.slug,
        alt: media.alt ?? media.title,
        seoTitle: media.seoTitle,
        seoDescription: media.seoDescription,
        blurDataUrl: media.blurDataUrl,
        width: media.width,
        height: media.height,
        duration: media.duration,
        isFeatured: media.isFeatured,
        publishedAt: media.publishedAt?.toISOString() ?? null,
        groups: groupsResult,
        relatedMedia,
    }
}

/**
 * Get gallery media by slug with caching
 *
 * @param slug - The media slug
 * @returns The media detail or null if not found
 */
export const getGalleryMediaBySlug = (
    slug: string
): Promise<GalleryMediaDetail | null> => {
    return unstable_cache(
        () => fetchGalleryMediaBySlug(slug),
        [`gallery-media-${slug}`],
        {
            tags: ['gallery-media', `gallery-media-${slug}`],
            revalidate: 60,
        }
    )()
}

/**
 * Get all gallery group slugs for static generation
 */
export async function getAllGalleryGroupSlugs(): Promise<string[]> {
    const groups = await db
        .select({ slug: galleryGroup.slug })
        .from(galleryGroup)
        .where(eq(galleryGroup.isVisible, true))

    return groups.map((g) => g.slug)
}

/**
 * Get all gallery media slugs for static generation
 */
export async function getAllGalleryMediaSlugs(): Promise<string[]> {
    const media = await db
        .select({ slug: galleryMedia.slug })
        .from(galleryMedia)
        .where(eq(galleryMedia.status, 'published'))

    return media.map((m) => m.slug)
}
