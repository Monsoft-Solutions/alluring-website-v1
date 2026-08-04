/**
 * Gallery Sitemap
 *
 * Generates sitemap XML for gallery content including:
 * - Main gallery listing page (carrying ungrouped media)
 * - Gallery group pages, each carrying ALL of its published media via the
 *   image and video sitemap extensions
 *
 * Individual gallery media detail pages (/gallery/media/[slug]) are
 * intentionally excluded as URLs: per issue #118 they are noindex,follow
 * thin pages. Their images and videos remain fully visible to Google
 * Images/Video by being attached to the indexable group page URLs
 * instead — image sitemaps support up to 1,000 images per URL, and the
 * group pages render the same media with captions and ImageObject schema.
 *
 * Revalidates every 3 hours to balance freshness with performance
 */
import { NextResponse } from 'next/server'

// Revalidate every 3 hours (10800 seconds)
export const revalidate = 10800

import { pageLastModified } from '@/lib/data/page-metadata'
import { seoDefaults } from '@/lib/data/site-config'
import {
    type GroupMediaSitemapItem,
    getAllGroupsRecentMediaDates,
    getGalleryGroupsForSitemap,
    getMediaByGroupForSitemap,
    getMostRecentMediaDate,
    getUngroupedMediaForSitemap,
} from '@/lib/queries/gallery/sitemap.query'
import { isCrawlingAllowed } from '@/lib/utils/crawling'
import type {
    SitemapEntry,
    SitemapImage,
    SitemapVideo,
} from '@workspace/seo/types/sitemap/sitemap-entry.type'
import { generateSitemapXml } from '@workspace/seo/utils'

/**
 * Map media items onto sitemap image/video extension entries.
 *
 * Images become <image:image> entries. Videos become <video:video>
 * entries when they have the thumbnail required by the video sitemap
 * spec; videos without a thumbnail fall back to an image entry so they
 * are at least discoverable.
 */
function toSitemapMedia(items: GroupMediaSitemapItem[]): {
    images: SitemapImage[]
    videos: SitemapVideo[]
} {
    const images: SitemapImage[] = []
    const videos: SitemapVideo[] = []

    for (const item of items) {
        if (item.type === 'video' && item.thumbnailUrl) {
            videos.push({
                thumbnailUrl: item.thumbnailUrl,
                title: item.title,
                description: item.description ?? item.title,
                contentUrl: item.url,
                duration: item.duration ?? undefined,
            })
        } else {
            images.push({
                url: item.url,
                title: item.title,
                caption: item.description ?? undefined,
            })
        }
    }

    return { images, videos }
}

/**
 * GET handler for gallery sitemap
 */
export async function GET(): Promise<NextResponse> {
    // Return empty sitemap if crawling is not allowed
    if (!isCrawlingAllowed()) {
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`,
            {
                headers: {
                    'Content-Type': 'application/xml',
                    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
                },
            }
        )
    }

    const baseUrl = seoDefaults.siteUrl
    const entries: SitemapEntry[] = []
    const today = new Date().toISOString().slice(0, 10)

    try {
        // Get most recent media date for listing page
        const mostRecentMediaDate = await getMostRecentMediaDate()
        const mostRecentMediaDateStr = mostRecentMediaDate
            ?.toISOString()
            .slice(0, 10)

        // Gallery main listing page — carries media that belong to no group
        const ungroupedMedia = await getUngroupedMediaForSitemap()
        const ungrouped = toSitemapMedia(ungroupedMedia)
        entries.push({
            url: `${baseUrl}/gallery`,
            lastModified:
                mostRecentMediaDateStr ?? pageLastModified['/gallery'] ?? today,
            changeFrequency: 'weekly',
            priority: 0.9,
            images: ungrouped.images.length > 0 ? ungrouped.images : undefined,
            videos: ungrouped.videos.length > 0 ? ungrouped.videos : undefined,
        })

        // Gallery groups — each carries ALL of its published media
        const groups = await getGalleryGroupsForSitemap()
        const groupMediaDates = await getAllGroupsRecentMediaDates()
        const mediaByGroup = await getMediaByGroupForSitemap()

        for (const group of groups) {
            const groupMediaDate = groupMediaDates.get(group.slug)
            const lastModified =
                groupMediaDate?.toISOString().slice(0, 10) ??
                group.updatedAt?.toISOString().slice(0, 10) ??
                today

            const { images, videos } = toSitemapMedia(
                mediaByGroup.get(group.slug) ?? []
            )

            // Include the cover image if it isn't already among the media
            if (
                group.coverImageUrl &&
                !images.some((img) => img.url === group.coverImageUrl)
            ) {
                images.unshift({
                    url: group.coverImageUrl,
                    title: group.name,
                })
            }

            entries.push({
                url: `${baseUrl}/gallery/${group.slug}`,
                lastModified,
                changeFrequency: 'weekly',
                priority: 0.8,
                images: images.length > 0 ? images : undefined,
                videos: videos.length > 0 ? videos : undefined,
            })
        }

        // Note: gallery media detail pages (/gallery/media/[slug]) are
        // intentionally NOT added as URLs here — they are noindex,follow
        // per issue #118. Their media is attached to the group entries
        // above instead.
    } catch (error) {
        console.error('Error generating gallery sitemap:', error)
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`,
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/xml',
                },
            }
        )
    }

    const xml = generateSitemapXml(entries)

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    })
}
