/**
 * Sitemap Route Handler
 *
 * Generates dynamic sitemap.xml for the website including static and dynamic routes.
 * This file exports a function that returns MetadataRoute.Sitemap for Next.js.
 */
import {
    type SitemapConfig,
    convertToNextjsSitemap,
    generateSitemapEntries,
} from '@workspace/seo/utils/sitemap-generator.util'
import type { SitemapRoute } from '@workspace/seo/types/sitemap/sitemap-route.type'
import type { MetadataRoute } from 'next'

import { seoDefaults } from '@/lib/data/site-config'
import {
    getActiveCategorySlugs,
    getActiveTagSlugs,
    getPublishedPostSlugs,
} from '@/lib/queries/blog/sitemap.query'
import { procedures } from '@/lib/data/procedures.data'

/**
 * Get the base URL for the site
 * Uses site config which automatically reads from NEXT_PUBLIC_SITE_URL env var
 */
function getBaseUrl(): string {
    return seoDefaults.siteUrl
}

/**
 * Create dynamic route configurations
 */
async function createDynamicRoutes(): Promise<SitemapRoute[]> {
    const dynamicRoutes: SitemapRoute[] = []

    // Blog main listing page
    dynamicRoutes.push({
        path: '/blog',
        getEntries: async () => {
            return [
                {
                    url: '/blog',
                    lastModified: new Date().toISOString(),
                    changeFrequency: 'daily',
                    priority: 0.9,
                },
            ]
        },
    })

    // Blog post detail pages
    dynamicRoutes.push({
        path: '/blog/posts',
        getEntries: async () => {
            const posts = await getPublishedPostSlugs()
            return posts.map((post) => ({
                url: `/blog/${post.slug}`,
                lastModified: post.updatedAt.toISOString(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }))
        },
    })

    // Blog categories listing and detail pages
    dynamicRoutes.push({
        path: '/blog/categories',
        getEntries: async () => {
            const categories = await getActiveCategorySlugs()
            const now = new Date().toISOString()

            return [
                {
                    url: '/blog/categories',
                    lastModified: now,
                    changeFrequency: 'weekly',
                    priority: 0.8,
                },
                ...categories.map((slug) => ({
                    url: `/blog/categories/${slug}`,
                    lastModified: now,
                    changeFrequency: 'weekly' as const,
                    priority: 0.7,
                })),
            ]
        },
    })

    // Blog tags listing and detail pages
    dynamicRoutes.push({
        path: '/blog/tags',
        getEntries: async () => {
            const tags = await getActiveTagSlugs()
            const now = new Date().toISOString()

            return [
                {
                    url: '/blog/tags',
                    lastModified: now,
                    changeFrequency: 'weekly',
                    priority: 0.8,
                },
                ...tags.map((slug) => ({
                    url: `/blog/tags/${slug}`,
                    lastModified: now,
                    changeFrequency: 'weekly' as const,
                    priority: 0.6,
                })),
            ]
        },
    })

    // Procedures main listing page
    dynamicRoutes.push({
        path: '/procedures',
        getEntries: async () => {
            return [
                {
                    url: '/procedures',
                    lastModified: new Date().toISOString(),
                    changeFrequency: 'monthly',
                    priority: 0.9,
                },
            ]
        },
    })

    // Procedure detail pages
    dynamicRoutes.push({
        path: '/procedures/detail',
        getEntries: async () => {
            const now = new Date().toISOString()
            return procedures.map((procedure) => ({
                url: `/procedures/${procedure.slug}`,
                lastModified: now,
                changeFrequency: 'monthly' as const,
                priority: 0.8,
            }))
        },
    })

    return dynamicRoutes
}

/**
 * Create static route configurations
 */
function createAppStaticRoutes(): SitemapRoute[] {
    return [
        {
            path: '/',
            getEntries: () => [
                {
                    url: '/',
                    changeFrequency: 'daily',
                    priority: 1.0,
                    lastModified: new Date().toISOString(),
                },
            ],
        },
        {
            path: '/about',
            getEntries: () => [
                {
                    url: '/about',
                    changeFrequency: 'monthly',
                    priority: 0.8,
                    lastModified: new Date().toISOString(),
                },
            ],
        },
        {
            path: '/contact-us',
            getEntries: () => [
                {
                    url: '/contact-us',
                    changeFrequency: 'monthly',
                    priority: 0.7,
                    lastModified: new Date().toISOString(),
                },
            ],
        },
        {
            path: '/privacy',
            getEntries: () => [
                {
                    url: '/privacy',
                    changeFrequency: 'yearly',
                    priority: 0.3,
                    lastModified: new Date().toISOString(),
                },
            ],
        },
        {
            path: '/terms',
            getEntries: () => [
                {
                    url: '/terms',
                    changeFrequency: 'yearly',
                    priority: 0.3,
                    lastModified: new Date().toISOString(),
                },
            ],
        },
        {
            path: '/cookies',
            getEntries: () => [
                {
                    url: '/cookies',
                    changeFrequency: 'yearly',
                    priority: 0.3,
                    lastModified: new Date().toISOString(),
                },
            ],
        },
    ]
}

/**
 * Main sitemap generation function
 * This is called by Next.js to generate the sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl()

    const config: SitemapConfig = {
        baseUrl,
        defaultChangeFrequency: 'weekly',
        defaultPriority: 0.5,
        maxUrlsPerSitemap: 50000,
    }

    try {
        // Combine static and dynamic routes
        const staticRoutes = createAppStaticRoutes()
        const dynamicRoutes = await createDynamicRoutes()
        const allRoutes = [...staticRoutes, ...dynamicRoutes]

        // Generate sitemap entries
        const entries = await generateSitemapEntries(allRoutes, config)

        // Convert to Next.js format and return
        return convertToNextjsSitemap(entries)
    } catch (error) {
        console.error('Error generating sitemap:', error)

        // Fallback to basic static routes only
        const fallbackRoutes = createAppStaticRoutes()
        const fallbackEntries = await generateSitemapEntries(
            fallbackRoutes,
            config
        )
        return convertToNextjsSitemap(fallbackEntries)
    }
}

// Export the sitemap function as the default export
// This is required by Next.js for sitemap.ts files
