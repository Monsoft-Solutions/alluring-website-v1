/**
 * Gallery Sitemap
 *
 * Generates sitemap XML for gallery content including:
 * - Main gallery listing page
 * - Gallery group pages with cover images
 * - Individual gallery media pages with images
 *
 * Revalidates every 3 hours to balance freshness with performance
 */
import { NextResponse } from 'next/server'

// Revalidate every 3 hours (10800 seconds)
export const revalidate = 10800

import { pageLastModified } from '@/lib/data/page-metadata'
import { seoDefaults } from '@/lib/data/site-config'
import {
    getGalleryGroupsForSitemap,
    getGalleryMediaForSitemap,
    getMostRecentMediaDate,
    getMostRecentMediaDateForGroup,
} from '@/lib/queries/gallery/sitemap.query'
import { isCrawlingAllowed } from '@/lib/utils/crawling'
import type { SitemapEntry } from '@workspace/seo/types/sitemap/sitemap-entry.type'
import { generateSitemapXml } from '@workspace/seo/utils'

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

        // Gallery main listing page
        entries.push({
            url: `${baseUrl}/gallery`,
            lastModified:
                mostRecentMediaDateStr ?? pageLastModified['/gallery'] ?? today,
            changeFrequency: 'weekly',
            priority: 0.9,
        })

        // Gallery groups
        const groups = await getGalleryGroupsForSitemap()
        for (const group of groups) {
            const groupMediaDate = await getMostRecentMediaDateForGroup(
                group.slug
            )
            const lastModified =
                groupMediaDate?.toISOString().slice(0, 10) ??
                group.updatedAt.toISOString().slice(0, 10)

            const entry: SitemapEntry = {
                url: `${baseUrl}/gallery/${group.slug}`,
                lastModified,
                changeFrequency: 'weekly',
                priority: 0.8,
            }

            // Add cover image if available
            if (group.coverImageUrl) {
                entry.images = [
                    {
                        url: group.coverImageUrl,
                        title: group.name,
                    },
                ]
            }

            entries.push(entry)
        }

        // Gallery media detail pages
        const media = await getGalleryMediaForSitemap()
        for (const item of media) {
            entries.push({
                url: `${baseUrl}/gallery/media/${item.slug}`,
                lastModified: item.updatedAt.toISOString().slice(0, 10),
                changeFrequency: 'monthly',
                priority: 0.6,
                images: [
                    {
                        url: item.url,
                        title: item.title,
                    },
                ],
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
