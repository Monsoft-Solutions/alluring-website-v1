/**
 * Sitemap Index
 *
 * Returns a sitemap index that references child sitemaps organized by content type.
 * This enables better organization and tracking in Google Search Console.
 *
 * Child sitemaps:
 * - /sitemap/pages.xml - Static pages and surgeon profiles
 * - /sitemap/blog.xml - Blog posts, categories, and tags
 * - /sitemap/procedures.xml - Procedure listings and details
 * - /sitemap/gallery.xml - Gallery groups and media
 * - /sitemap/promotions.xml - Special offers and promotions
 */
import type { MetadataRoute } from 'next'

import { seoDefaults } from '@/lib/data/site-config'
import { isCrawlingAllowed } from '@/lib/utils/crawling'

/**
 * Get the base URL for the site
 */
function getBaseUrl(): string {
    return seoDefaults.siteUrl
}

/**
 * Sitemap index entries for child sitemaps
 */
const SITEMAP_CHILDREN = [
    { name: 'pages', description: 'Static pages and surgeon profiles' },
    { name: 'blog', description: 'Blog posts, categories, and tags' },
    { name: 'procedures', description: 'Procedure listings and details' },
    { name: 'gallery', description: 'Gallery groups and media' },
    { name: 'promotions', description: 'Special offers and promotions' },
] as const

/**
 * Main sitemap index generation function
 * This is called by Next.js to generate the sitemap.xml as an index
 */
export default function sitemap(): MetadataRoute.Sitemap {
    // Return empty sitemap if crawling is not allowed
    if (!isCrawlingAllowed()) {
        return []
    }

    const baseUrl = getBaseUrl()

    // Generate sitemap index entries pointing to child sitemaps
    return SITEMAP_CHILDREN.map((child) => ({
        url: `${baseUrl}/sitemap/${child.name}.xml`,
        lastModified: new Date(),
    }))
}
