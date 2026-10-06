/**
 * Gallery Sitemap
 *
 * Generates sitemap XML for gallery content including:
 * - Main gallery listing page (carrying ungrouped images)
 * - Gallery group pages, each carrying ALL of its published images via
 *   the image sitemap extension
 * - One URL per video: its /gallery/media/[slug] watch page, carrying a
 *   single <video:video> entry (issue #321)
 *
 * Image detail pages (/gallery/media/[slug]) are intentionally excluded
 * as URLs: per issue #118 they are noindex,follow thin pages. Their images
 * remain fully visible to Google Images by being attached to the indexable
 * group page URLs instead — image sitemaps support up to 1,000 images per
 * URL, and the group pages render the same media with captions and
 * ImageObject schema.
 *
 * Videos are the exception: Google indexes a video only from the page
 * where it is the main content, so each video is listed once, under its
 * own watch page, and not repeated on group pages.
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
    getVideoWatchPagesForSitemap,
} from '@/lib/queries/gallery/sitemap.query'
import { isCrawlingAllowed } from '@/lib/utils/crawling'
import type {
    SitemapEntry,
    SitemapImage,
    SitemapVideo,
} from '@workspace/seo/types/sitemap/sitemap-entry.type'
import { generateSitemapXml } from '@workspace/seo/utils'

/**
 * Map a page's media onto <image:image> entries.
 *
 * Videos with a poster are skipped: they get their own watch page URL
 * (see the GET handler). Videos without one — which the video sitemap
 * spec cannot describe — fall back to an image entry so they are at
 * least discoverable.
 */
function toSitemapImages(items: GroupMediaSitemapItem[]): SitemapImage[] {
    return items
        .filter((item) => !(item.type === 'video' && item.thumbnailUrl))
        .map((item) => ({
            url: item.url,
            title: item.title,
            caption: item.description ?? undefined,
        }))
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
        const ungrouped = toSitemapImages(await getUngroupedMediaForSitemap())
        entries.push({
            url: `${baseUrl}/gallery`,
            lastModified:
                mostRecentMediaDateStr ?? pageLastModified['/gallery'] ?? today,
            changeFrequency: 'weekly',
            priority: 0.9,
            images: ungrouped.length > 0 ? ungrouped : undefined,
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

            const images = toSitemapImages(mediaByGroup.get(group.slug) ?? [])

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
            })
        }

        // Video watch pages — the only media detail pages listed as URLs
        // (image detail pages stay noindex,follow per issue #118)
        for (const video of await getVideoWatchPagesForSitemap()) {
            const watchVideo: SitemapVideo = {
                thumbnailUrl: video.thumbnailUrl,
                title: video.title,
                description: video.description ?? video.title,
                contentUrl: video.url,
                duration: video.duration ?? undefined,
                publicationDate: video.publishedAt?.toISOString(),
            }
            entries.push({
                url: `${baseUrl}/gallery/media/${video.slug}`,
                lastModified: video.updatedAt.toISOString().slice(0, 10),
                changeFrequency: 'monthly',
                priority: 0.6,
                videos: [watchVideo],
            })
        }
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
