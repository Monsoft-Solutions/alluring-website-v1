/**
 * Blog Sitemap
 *
 * Generates sitemap XML for blog content including:
 * - Blog posts with featured images (for image SEO)
 * - Category pages
 * - Tag pages
 *
 * Revalidates every 3 hours to balance freshness with performance
 */
import { NextResponse } from 'next/server'

// Revalidate every 3 hours (10800 seconds)
export const revalidate = 10800

import { pageLastModified } from '@/lib/data/page-metadata'
import { seoDefaults } from '@/lib/data/site-config'
import {
    getActiveCategorySlugs,
    getActiveTagSlugs,
    getMostRecentPostDate,
    getMostRecentPostDateForCategory,
    getMostRecentPostDateForTag,
    getPublishedPostSlugs,
} from '@/lib/queries/blog/sitemap.query'
import { isCrawlingAllowed } from '@/lib/utils/crawling'
import type { SitemapEntry } from '@workspace/seo/types/sitemap/sitemap-entry.type'
import { generateSitemapXml } from '@workspace/seo/utils'

/**
 * GET handler for blog sitemap
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
        // Get most recent post date for listing pages
        const mostRecentPostDate = await getMostRecentPostDate()
        const mostRecentPostDateStr = mostRecentPostDate
            ?.toISOString()
            .slice(0, 10)

        // Blog main listing page
        entries.push({
            url: `${baseUrl}/blog`,
            lastModified:
                mostRecentPostDateStr ?? pageLastModified['/blog'] ?? today,
            changeFrequency: 'daily',
            priority: 0.9,
        })

        // Blog posts (root-level URLs to match WordPress structure)
        const posts = await getPublishedPostSlugs()
        for (const post of posts) {
            const entry: SitemapEntry = {
                url: `${baseUrl}/${post.slug}`,
                lastModified: post.updatedAt.toISOString().slice(0, 10),
                changeFrequency: 'weekly',
                priority: 0.7,
            }

            // Add featured image if available (with caption for better image SEO)
            if (post.featuredImageUrl) {
                entry.images = [
                    {
                        url: post.featuredImageUrl,
                        title: post.featuredImageTitle ?? undefined,
                    },
                ]
            }

            entries.push(entry)
        }

        // Categories listing page
        entries.push({
            url: `${baseUrl}/blog/categories`,
            lastModified:
                mostRecentPostDateStr ??
                pageLastModified['/blog/categories'] ??
                today,
            changeFrequency: 'weekly',
            priority: 0.8,
        })

        // Category detail pages
        const categories = await getActiveCategorySlugs()
        for (const category of categories) {
            const categoryPostDate = await getMostRecentPostDateForCategory(
                category.slug
            )
            const lastModified =
                categoryPostDate?.toISOString().slice(0, 10) ??
                category.updatedAt?.toISOString().slice(0, 10) ??
                category.createdAt?.toISOString().slice(0, 10) ??
                today

            entries.push({
                url: `${baseUrl}/blog/categories/${category.slug}`,
                lastModified,
                changeFrequency: 'weekly',
                priority: 0.7,
            })
        }

        // Tags listing page
        entries.push({
            url: `${baseUrl}/blog/tags`,
            lastModified:
                mostRecentPostDateStr ??
                pageLastModified['/blog/tags'] ??
                today,
            changeFrequency: 'weekly',
            priority: 0.8,
        })

        // Tag detail pages
        const tags = await getActiveTagSlugs()
        for (const tag of tags) {
            const tagPostDate = await getMostRecentPostDateForTag(tag.slug)
            const lastModified =
                tagPostDate?.toISOString().slice(0, 10) ??
                tag.createdAt.toISOString().slice(0, 10)

            entries.push({
                url: `${baseUrl}/blog/tags/${tag.slug}`,
                lastModified,
                changeFrequency: 'weekly',
                priority: 0.6,
            })
        }
    } catch (error) {
        console.error('Error generating blog sitemap:', error)
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
