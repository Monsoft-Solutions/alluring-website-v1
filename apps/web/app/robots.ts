/**
 * Robots.txt Route Handler
 *
 * Generates dynamic robots.txt with environment-aware rules and sitemap references.
 * This file exports a function that returns MetadataRoute.Robots for Next.js.
 *
 * Sitemap Structure:
 * - /sitemap.xml (index pointing to child sitemaps)
 * - /sitemap/pages.xml
 * - /sitemap/blog.xml
 * - /sitemap/procedures.xml
 * - /sitemap/gallery.xml
 * - /sitemap/promotions.xml
 */
import {
    type RobotsGeneratorConfig,
    createCommonRobotsRules,
    detectEnvironment,
    generateRobots,
} from '@workspace/seo/utils/robots-generator.util'
import type { MetadataRoute } from 'next'

import { seoDefaults } from '@/lib/data/site-config'
import { isCrawlingAllowed } from '@/lib/utils/crawling'

/**
 * Get the base URL for the site
 * Uses site config which automatically reads from NEXT_PUBLIC_SITE_URL env var
 */
function getBaseUrl(): string {
    return seoDefaults.siteUrl
}

/**
 * All sitemap URLs for the site
 * Includes the main sitemap index and all child sitemaps
 */
const SITEMAP_URLS = [
    '/sitemap.xml', // Main sitemap index
    '/sitemap/pages.xml', // Static pages and surgeon profiles
    '/sitemap/blog.xml', // Blog posts, categories, and tags
    '/sitemap/procedures.xml', // Procedure listings and details
    '/sitemap/gallery.xml', // Gallery groups and media
    '/sitemap/promotions.xml', // Special offers and promotions
    '/sitemap/instagram.xml', // Instagram posts with video support
] as const

/**
 * Get additional disallowed paths specific to this application
 */
function getAppSpecificDisallows(): string[] {
    return [
        // Search with query parameters
        '/search',
        // Protected areas
        '/dashboard/',
        '/user/',
        // Temporary and download paths
        '/temp/',
        '/downloads/',
        // Prevent crawling of filtered/sorted pages (duplicate content)
        '/*?sort=*',
        '/*?filter=*',
        '/*?page=*',
    ]
}

/**
 * Main robots.txt generation function
 * This is called by Next.js to generate the robots.txt
 */
export default function robots(): MetadataRoute.Robots {
    // Block all crawling if not explicitly allowed
    if (!isCrawlingAllowed()) {
        return {
            rules: [
                {
                    userAgent: '*',
                    disallow: ['/'],
                },
            ],
        }
    }

    const environment = detectEnvironment()
    const baseUrl = getBaseUrl()

    const config: RobotsGeneratorConfig = {
        environment,
        baseUrl,
        sitemaps: [...SITEMAP_URLS],
        customRules: createCommonRobotsRules(),
        additionalDisallows: getAppSpecificDisallows(),
    }

    try {
        return generateRobots(config)
    } catch (error) {
        console.error('Error generating robots.txt:', error)

        // Fallback to basic robots.txt
        return {
            rules: [
                {
                    userAgent: '*',
                    disallow:
                        environment === 'production'
                            ? ['/api/', '/admin/']
                            : ['/'],
                },
            ],
            sitemap:
                environment === 'production'
                    ? `${baseUrl}/sitemap.xml`
                    : undefined,
        }
    }
}

// Export the robots function as the default export
// This is required by Next.js for robots.ts files
